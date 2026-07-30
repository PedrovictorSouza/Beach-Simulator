import { createBatherToleranceModel } from "./batherToleranceModel.js";
import {
  BATHER_REACTION_TYPES,
  createBatherMoodSnapshot,
  createBatherProfileModel
} from "./batherProfileModel.js";
import {
  BEVERAGE_PURCHASE_PRICE_IN_CENTS,
  BEVERAGE_PURCHASE_DURATION_SECONDS,
  BEACH_AMENITY_TYPES,
  BUILDING_SERVICE_MOTIVES,
  BUILDING_TYPES
} from "../buildings/buildingServicesModel.js";

export const NPC_TYPES = Object.freeze({
  BATHER: "bather"
});

export const NPC_STATES = Object.freeze({
  IDLE: "idle",
  WALKING_TO_ACTIVITY: "walking-to-activity",
  SERVICE_USE: "service-use",
  RELAXING: "relaxing",
  BEVERAGE_PURCHASE: "beverage-purchase",
  RETURNING_HOME: "returning-home"
});

const WALKING_SPEED = 7;
const WALKING_ACCELERATION = 9;
const ARRIVAL_DISTANCE = 0.35;
const RESTLESSNESS_LIMIT = 100;
const RESTLESSNESS_RATE = 14;
const RELAXING_DURATION_SECONDS = 3.5;
const AUTONOMY_RESELECTION_RESTLESSNESS = 80;
const SERVICE_ACTIVITY_DURATIONS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: 3,
  [BUILDING_TYPES.WIFI_SPOT]: 7,
  [BUILDING_TYPES.TOILET_BUILDING]: 4,
  [BUILDING_TYPES.VOLLEYBALL_COURT]: 8
});
const SUN_SHADE_ACTIVITY_DURATIONS_SECONDS = Object.freeze({
  SHORT: 5,
  MEDIUM: 10,
  LONG: 15
});
const SERVICE_OUTCOME_MOTIVES = Object.freeze({
  [BUILDING_TYPES.WIFI_SPOT]: BUILDING_SERVICE_MOTIVES.CONNECTIVITY,
  [BUILDING_TYPES.TOILET_BUILDING]: BUILDING_SERVICE_MOTIVES.RELIEF,
  [BUILDING_TYPES.VOLLEYBALL_COURT]: BUILDING_SERVICE_MOTIVES.ENTERTAINMENT
});
const MOTIVE_NEED_RATES = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.CONNECTIVITY]: 5,
  [BUILDING_SERVICE_MOTIVES.RELIEF]: 4,
  [BUILDING_SERVICE_MOTIVES.ENTERTAINMENT]: 7
});
const MOTIVE_COMPLAINT_THRESHOLDS = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.CONNECTIVITY]: 80,
  [BUILDING_SERVICE_MOTIVES.RELIEF]: 80,
  [BUILDING_SERVICE_MOTIVES.ENTERTAINMENT]: 70
});
const MOTIVE_LEAVE_THRESHOLDS = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.RELIEF]: 96
});
const HEAT_COMPLAINT_SECONDS = 30;
const ENTERTAINMENT_COMPLAINT_SECONDS = 10;
const WIFI_COMPLAINT_SECONDS = 16;
const TOILET_COMPLAINT_SECONDS = 24;
const TOILET_LEAVE_SECONDS = 34;
const ACTIVITY_NOVELTY_UTILITY = 18;
const ACTIVITY_REPEAT_UTILITY = -24;
const ACTIVITY_VARIATION_UTILITY = 12;
const ACTIVITY_PROXIMITY_RANGE = 70;
const NAVIGATION_RING_POINTS = 12;
const NAVIGATION_CLEARANCE = 1.5;
const HIGH_HEAT_BEVERAGE_PURCHASE_CHANCE = 0.75;
const SUN_SHADE_MIN_PURCHASE_CHANCE = 0.12;
const SUN_SHADE_HEAT_PURCHASE_CHANCE = 0.68;
const SUN_SHADE_HEAT_UTILITY = 52;
const SERVICE_NEED_THRESHOLD = 26;
const SERVICE_DISTANCE_ATTENUATION = 0.018;
const SERVICE_REPEAT_UTILITY = -18;
const SERVICE_VARIATION_UTILITY = 6;
const SERVICE_USE_LIMITS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: 1,
  [BUILDING_TYPES.WIFI_SPOT]: 2,
  [BUILDING_TYPES.TOILET_BUILDING]: 1,
  [BUILDING_TYPES.VOLLEYBALL_COURT]: 4
});
const BATHER_COMPLAINTS = Object.freeze({
  HEAT: "complaints.heat",
  ENTERTAINMENT: "complaints.entertainment",
  WIFI: "complaints.wifi",
  TOILET: "complaints.toilet",
  TOILET_LEAVING: "complaints.toiletLeaving",
  TOLERANCE_EXHAUSTED: "complaints.toleranceExhausted"
});
export const BATHER_PROBLEM_SOURCES = Object.freeze({
  HEAT: "heat-without-beverage",
  ENTERTAINMENT: "missing-entertainment",
  WIFI: "missing-wifi",
  TOILET: "missing-toilet"
});
const ACTIVITY_WAYPOINT_OFFSETS = Object.freeze([
  Object.freeze([-36, 12]),
  Object.freeze([-18, 48]),
  Object.freeze([8, 28]),
  Object.freeze([34, 54]),
  Object.freeze([42, 4]),
  Object.freeze([16, -28]),
  Object.freeze([-24, -18])
]);

function isBuildingEntryMovement(movementPurpose) {
  return movementPurpose === "building-service" ||
    movementPurpose === "beverage-store";
}

function normalizeNavigationObstacles(obstacles) {
  return (Array.isArray(obstacles) ? obstacles : []).filter((obstacle) => (
    Array.isArray(obstacle?.position) &&
    obstacle.position.length === 2 &&
    obstacle.position.every(Number.isFinite) &&
    Number.isFinite(obstacle.radius) &&
    obstacle.radius > 0
  )).map((obstacle) => ({
    position: [...obstacle.position],
    radius: obstacle.radius
  }));
}

function distanceToSegment(point, start, end) {
  const deltaX = end[0] - start[0];
  const deltaZ = end[1] - start[1];
  const lengthSquared = deltaX ** 2 + deltaZ ** 2;

  if (lengthSquared <= 0) {
    return Math.hypot(point[0] - start[0], point[1] - start[1]);
  }

  const projection = Math.max(0, Math.min(1, (
    (point[0] - start[0]) * deltaX +
    (point[1] - start[1]) * deltaZ
  ) / lengthSquared));
  const closestX = start[0] + projection * deltaX;
  const closestZ = start[1] + projection * deltaZ;

  return Math.hypot(point[0] - closestX, point[1] - closestZ);
}

function isNavigationSegmentClear(start, end, obstacles) {
  return obstacles.every((obstacle) => (
    distanceToSegment(obstacle.position, start, end) >= obstacle.radius
  ));
}

function createSafeDestination(destination, obstacles) {
  const safeDestination = [...destination];

  for (const obstacle of obstacles) {
    const deltaX = safeDestination[0] - obstacle.position[0];
    const deltaZ = safeDestination[1] - obstacle.position[1];
    const distance = Math.hypot(deltaX, deltaZ);
    const minimumDistance = obstacle.radius + NAVIGATION_CLEARANCE;

    if (distance >= minimumDistance) {
      continue;
    }

    const directionX = distance > 0 ? deltaX / distance : 1;
    const directionZ = distance > 0 ? deltaZ / distance : 0;
    safeDestination[0] = obstacle.position[0] + directionX * minimumDistance;
    safeDestination[1] = obstacle.position[1] + directionZ * minimumDistance;
  }

  return safeDestination;
}

function createSafeNavigationPath(start, destination, rawObstacles) {
  const obstacles = normalizeNavigationObstacles(rawObstacles);
  const safeDestination = createSafeDestination(destination, obstacles);

  if (
    obstacles.length === 0 ||
    isNavigationSegmentClear(start, safeDestination, obstacles)
  ) {
    return [safeDestination];
  }

  const nodes = [
    { position: [...start] },
    { position: safeDestination }
  ];

  obstacles.forEach((obstacle) => {
    const ringRadius = obstacle.radius + NAVIGATION_CLEARANCE;

    for (let index = 0; index < NAVIGATION_RING_POINTS; index += 1) {
      const angle = (index / NAVIGATION_RING_POINTS) * Math.PI * 2;
      nodes.push({
        position: [
          obstacle.position[0] + Math.cos(angle) * ringRadius,
          obstacle.position[1] + Math.sin(angle) * ringRadius
        ]
      });
    }
  });

  const distances = nodes.map(() => Infinity);
  const previous = nodes.map(() => -1);
  const visited = nodes.map(() => false);
  distances[0] = 0;

  for (let step = 0; step < nodes.length; step += 1) {
    let currentIndex = -1;

    for (let index = 0; index < nodes.length; index += 1) {
      if (!visited[index] && (
        currentIndex < 0 || distances[index] < distances[currentIndex]
      )) {
        currentIndex = index;
      }
    }

    if (currentIndex < 0 || !Number.isFinite(distances[currentIndex])) {
      break;
    }

    visited[currentIndex] = true;

    for (let nextIndex = 0; nextIndex < nodes.length; nextIndex += 1) {
      if (
        visited[nextIndex] ||
        !isNavigationSegmentClear(
          nodes[currentIndex].position,
          nodes[nextIndex].position,
          obstacles
        )
      ) {
        continue;
      }

      const distance = Math.hypot(
        nodes[currentIndex].position[0] - nodes[nextIndex].position[0],
        nodes[currentIndex].position[1] - nodes[nextIndex].position[1]
      );
      const nextDistance = distances[currentIndex] + distance;

      if (nextDistance < distances[nextIndex]) {
        distances[nextIndex] = nextDistance;
        previous[nextIndex] = currentIndex;
      }
    }
  }

  if (previous[1] < 0) {
    return [safeDestination];
  }

  const path = [];
  let currentIndex = 1;

  while (currentIndex >= 0) {
    path.unshift(nodes[currentIndex].position);
    currentIndex = previous[currentIndex];
  }

  return path.slice(1);
}

function createNavigationObstacleSignature(obstacles) {
  return obstacles.map((obstacle) => (
    `${obstacle.position[0].toFixed(3)},${obstacle.position[1].toFixed(3)},${obstacle.radius.toFixed(3)}`
  )).join("|");
}

function refreshEntityNavigation(entity, rawObstacles, signature) {
  if (
    isBuildingEntryMovement(entity.movementPurpose) ||
    !Array.isArray(entity.navigationTarget) ||
    entity.navigationObstacleSignature === signature
  ) {
    return;
  }

  const path = createSafeNavigationPath(
    entity.position,
    entity.navigationTarget,
    rawObstacles
  );
  entity.navigationPath = path.slice(1);
  entity.destination = [...path[0]];
  entity.navigationObstacleSignature = signature;
}

function beginMovement(
  entity,
  state,
  destination,
  movementPurpose = null,
  navigationObstacles = []
) {
  entity.state = state;
  const path = isBuildingEntryMovement(movementPurpose) ?
    [[...destination]] :
    createSafeNavigationPath(entity.position, destination, navigationObstacles);
  entity.navigationPath = path.slice(1);
  entity.navigationTarget = [...destination];
  entity.navigationObstacleSignature = null;
  entity.destination = [...path[0]];
  entity.movementPurpose = movementPurpose;
  entity.activityBuildingType = null;
  entity.interaction = null;
  entity.activityDurationSeconds = 0;
  entity.stateElapsedSeconds = 0;
  entity.currentSpeed = 0;
  entity.walkDistance = 0;
}

function sampleUnit(random) {
  return Math.max(0, Math.min(0.999999, Number(random()) || 0));
}

function createActivityCandidate(entity, waypointIndex, random) {
  const waypointOffset = ACTIVITY_WAYPOINT_OFFSETS[waypointIndex];
  const waypoint = [
    entity.home[0] + waypointOffset[0],
    waypointOffset[1]
  ];
  const distance = Math.hypot(
    waypoint[0] - entity.position[0],
    waypoint[1] - entity.position[1]
  );
  const proximityUtility = Math.max(0, ACTIVITY_PROXIMITY_RANGE - distance);
  const noveltyUtility = waypointIndex === entity.lastActivityIndex
    ? ACTIVITY_REPEAT_UTILITY
    : ACTIVITY_NOVELTY_UTILITY;
  const variationUtility = sampleUnit(random) * ACTIVITY_VARIATION_UTILITY;

  return Object.freeze({
    waypointIndex,
    waypoint: Object.freeze(waypoint),
    utility: proximityUtility + noveltyUtility + variationUtility
  });
}

function getMotiveNeed(entity, motive) {
  const storedNeed = Number(entity.motiveNeeds?.[motive]);
  const wifiMultiplier = Number(
    entity.profile?.reactionMultipliers?.wifi
  );
  const connectedPreference = motive === BUILDING_SERVICE_MOTIVES.CONNECTIVITY
    ? wifiMultiplier > 0 && wifiMultiplier < 1 ? 42 : 22
    : 0;

  if (Number.isFinite(storedNeed)) {
    const preferredNeed = Math.max(storedNeed, connectedPreference);
    const preferenceMultiplier = motive === BUILDING_SERVICE_MOTIVES.CONNECTIVITY &&
      Number.isFinite(wifiMultiplier) && wifiMultiplier > 0 ?
      wifiMultiplier : 1;

    return Math.min(100, preferredNeed / preferenceMultiplier);
  }

  const needsElapsed = Math.max(
    0,
    entity.beachElapsedSeconds - entity.needsDelaySeconds
  );

  if (motive === BUILDING_SERVICE_MOTIVES.RELIEF) {
    return Math.min(100, Math.max(0, (needsElapsed - 8) * 4));
  }

  if (motive === BUILDING_SERVICE_MOTIVES.ENTERTAINMENT) {
    return Math.min(100, Math.max(0, entity.restlessness - 30));
  }

  if (motive === BUILDING_SERVICE_MOTIVES.CONNECTIVITY) {
    return Math.min(100, connectedPreference + entity.restlessness * 0.25);
  }

  return 0;
}

function updateMotiveNeeds(entity, stepSeconds) {
  if (!entity.motiveNeeds) {
    entity.motiveNeeds = {};
  }

  for (const [motive, rate] of Object.entries(MOTIVE_NEED_RATES)) {
    const currentNeed = Math.max(0, Number(entity.motiveNeeds[motive]) || 0);
    entity.motiveNeeds[motive] = Math.min(
      100,
      currentNeed + rate * stepSeconds
    );
  }
}

function applyServiceOutcome(entity, buildingType) {
  if (buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
    entity.heatExposureSeconds = 0;
    entity.complaint = null;
    return;
  }

  const motive = SERVICE_OUTCOME_MOTIVES[buildingType];

  if (!motive || !entity.motiveNeeds) {
    return;
  }

  entity.motiveNeeds[motive] = 0;
  entity.complaint = null;
}

function completeBeachActivity(entity) {
  entity.state = NPC_STATES.IDLE;
  entity.destination = null;
  entity.navigationPath = [];
  entity.navigationTarget = null;
  entity.navigationObstacleSignature = null;
  entity.movementPurpose = null;
  entity.activityBuildingType = null;
  entity.interaction = null;
  entity.activityDurationSeconds = 0;
  entity.stateElapsedSeconds = 0;
  entity.currentSpeed = 0;
  entity.restlessness = 0;
}

function chooseSunShadeActivityDuration(heat, random) {
  const heatValue = Math.max(0, Math.min(100, Number(heat?.heat) || 0));
  const longStayChance = 0.15 + 0.45 * heatValue / 100;
  const mediumStayChance = 0.35;
  const roll = sampleUnit(random);

  if (roll < longStayChance) {
    return SUN_SHADE_ACTIVITY_DURATIONS_SECONDS.LONG;
  }

  if (roll < longStayChance + mediumStayChance) {
    return SUN_SHADE_ACTIVITY_DURATIONS_SECONDS.MEDIUM;
  }

  return SUN_SHADE_ACTIVITY_DURATIONS_SECONDS.SHORT;
}

function createServiceActivityCandidate(
  entity,
  advertisement,
  servicePosition,
  random,
  serviceUseCounts
) {
  const motiveNeed = getMotiveNeed(entity, advertisement.motive);

  if (motiveNeed < SERVICE_NEED_THRESHOLD) {
    return null;
  }

  const serviceUseCount = Math.max(
    0,
    Math.floor(Number(serviceUseCounts[advertisement.buildingType]) || 0)
  );
  const serviceUseLimit = SERVICE_USE_LIMITS[advertisement.buildingType] || 2;

  if (serviceUseCount >= serviceUseLimit) {
    return null;
  }

  const distance = Math.hypot(
    servicePosition[0] - entity.position[0],
    servicePosition[1] - entity.position[1]
  );
  const needUtility = advertisement.utility * (0.35 + motiveNeed / 100);
  const crowdingUtility = serviceUseCount * -20;
  const noveltyUtility = advertisement.buildingType === entity.lastServiceBuildingType
    ? SERVICE_REPEAT_UTILITY
    : 0;
  const variationUtility = sampleUnit(random) * SERVICE_VARIATION_UTILITY;
  const rawUtility = needUtility + crowdingUtility + noveltyUtility + variationUtility;
  const utility = rawUtility / (
    1 + SERVICE_DISTANCE_ATTENUATION * distance
  );

  return Object.freeze({
    buildingType: advertisement.buildingType,
    motive: advertisement.motive,
    waypoint: Object.freeze([...servicePosition]),
    utility
  });
}

function createSunShadeActivityCandidates(
  entity,
  sunShadePositions,
  heat,
  random,
  serviceUseCounts
) {
  if (!Array.isArray(sunShadePositions) || sunShadePositions.length === 0) {
    return [];
  }

  const heatValue = Math.max(0, Math.min(100, Number(heat?.heat) || 0));
  const purchaseChance = SUN_SHADE_MIN_PURCHASE_CHANCE +
    SUN_SHADE_HEAT_PURCHASE_CHANCE * heatValue / 100;

  if (sampleUnit(random) >= purchaseChance) {
    return [];
  }

  const serviceUseCount = Math.max(
    0,
    Math.floor(Number(serviceUseCounts[BEACH_AMENITY_TYPES.SUN_SHADE]) || 0)
  );

  if (serviceUseCount >= sunShadePositions.length) {
    return [];
  }

  return sunShadePositions
    .filter((position) => (
      Array.isArray(position) &&
      position.length === 2 &&
      position.every(Number.isFinite)
    ))
    .map((position) => {
      const distance = Math.hypot(
        position[0] - entity.position[0],
        position[1] - entity.position[1]
      );
      const proximityUtility = Math.max(0, ACTIVITY_PROXIMITY_RANGE - distance);
      const noveltyUtility = entity.lastServiceBuildingType === BEACH_AMENITY_TYPES.SUN_SHADE
        ? SERVICE_REPEAT_UTILITY
        : 0;
      const variationUtility = sampleUnit(random) * SERVICE_VARIATION_UTILITY;
      const rawUtility = (
        SUN_SHADE_HEAT_UTILITY * heatValue / 100 +
        proximityUtility * 0.4 +
        noveltyUtility +
        variationUtility -
        serviceUseCount * 20
      );

      return Object.freeze({
        buildingType: BEACH_AMENITY_TYPES.SUN_SHADE,
        motive: null,
        waypoint: Object.freeze([...position]),
        utility: rawUtility / (1 + SERVICE_DISTANCE_ATTENUATION * distance)
      });
    });
}

function selectNextActivity(
  entity,
  random,
  {
    buildingServices = {},
    servicePositions = {},
    serviceUseCounts = {},
    sunShadePositions = [],
    heat = {},
    notifyServiceDecision = null,
    buildingObstacles = []
  } = {}
) {
  const firstIndex = Math.floor(sampleUnit(random) * ACTIVITY_WAYPOINT_OFFSETS.length);
  const compressedSecondIndex = Math.floor(
    sampleUnit(random) * (ACTIVITY_WAYPOINT_OFFSETS.length - 1)
  );
  const secondIndex = compressedSecondIndex >= firstIndex
    ? compressedSecondIndex + 1
    : compressedSecondIndex;
  const candidates = [
    createActivityCandidate(entity, firstIndex, random),
    createActivityCandidate(entity, secondIndex, random)
  ];
  const serviceCandidates = Array.isArray(buildingServices.advertisements)
    ? buildingServices.advertisements
      .filter((advertisement) => advertisement?.available)
      .map((advertisement) => {
        const position = servicePositions[advertisement.buildingType];

        if (
          !Array.isArray(position) ||
          position.length !== 2 ||
          !position.every(Number.isFinite)
        ) {
          return null;
        }

        return createServiceActivityCandidate(
          entity,
          advertisement,
          position,
          random,
          serviceUseCounts
        );
      })
      .filter(Boolean)
    : [];
  const sunShadeCandidates = createSunShadeActivityCandidates(
    entity,
    sunShadePositions,
    heat,
    random,
    serviceUseCounts
  );
  const allCandidates = [
    ...candidates,
    ...serviceCandidates,
    ...sunShadeCandidates
  ];
  const selected = allCandidates.reduce((best, candidate) => (
    candidate.utility > best.utility ? candidate : best
  ));

  entity.lastActivityIndex = selected.waypointIndex ?? null;
  entity.lastServiceBuildingType = selected.buildingType ?? null;
  entity.activityChoice = Object.freeze({
    candidateIndices: Object.freeze(candidates.map(({ waypointIndex }) => waypointIndex)),
    candidateServiceTypes: Object.freeze(
      [...serviceCandidates, ...sunShadeCandidates]
        .map(({ buildingType }) => buildingType)
    ),
    selectedIndex: selected.waypointIndex ?? null,
    selectedServiceType: selected.buildingType ?? null,
    selectedUtility: selected.utility
  });
  beginMovement(
    entity,
    NPC_STATES.WALKING_TO_ACTIVITY,
    selected.waypoint,
    selected.buildingType ? "building-service" : "beach-waypoint",
    buildingObstacles
  );
  entity.activityBuildingType = selected.buildingType ?? null;
  entity.interaction = selected.buildingType ? {
    buildingType: selected.buildingType,
    phase: "approaching",
    motive: selected.motive,
    reason: "need"
  } : null;

  if (
    entity.activityBuildingType &&
    typeof notifyServiceDecision === "function"
  ) {
    notifyServiceDecision({
      entity,
      buildingType: selected.buildingType,
      motive: selected.motive,
      utility: selected.utility
    });
  }
}

function beginBeverageStoreVisit(entity, position) {
  beginMovement(
    entity,
    NPC_STATES.WALKING_TO_ACTIVITY,
    position,
    "beverage-store"
  );
  entity.activityBuildingType = BUILDING_TYPES.BEVERAGE_STORE;
  entity.interaction = {
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    phase: "approaching",
    motive: BUILDING_SERVICE_MOTIVES.REFRESHMENT,
    reason: "purchase"
  };
}

function moveEntity(entity, deltaSeconds) {
  if (!entity.destination) {
    entity.state = NPC_STATES.IDLE;
    entity.currentSpeed = 0;
    return false;
  }

  const deltaX = entity.destination[0] - entity.position[0];
  const deltaZ = entity.destination[1] - entity.position[1];
  const distance = Math.hypot(deltaX, deltaZ);

  if (distance <= ARRIVAL_DISTANCE) {
    entity.position = [...entity.destination];

    if (entity.navigationPath.length > 0) {
      entity.destination = entity.navigationPath.shift();
      entity.currentSpeed = 0;
      return false;
    }

    entity.destination = null;
    entity.navigationTarget = null;
    entity.navigationObstacleSignature = null;
    entity.currentSpeed = 0;
    return true;
  }

  const directionX = deltaX / distance;
  const directionZ = deltaZ / distance;
  entity.currentSpeed = Math.min(
    WALKING_SPEED,
    entity.currentSpeed + WALKING_ACCELERATION * deltaSeconds
  );
  const movement = Math.min(entity.currentSpeed * deltaSeconds, distance);

  entity.position[0] += directionX * movement;
  entity.position[1] += directionZ * movement;
  entity.yaw = Math.atan2(-directionX, directionZ);
  entity.walkDistance += movement;
  return false;
}

function createEntitySnapshot(entity) {
  return {
    id: entity.id,
    type: entity.type,
    state: entity.state,
    position: [...entity.position],
    destination: entity.destination ? [...entity.destination] : null,
    restlessness: entity.restlessness,
    currentSpeed: entity.currentSpeed,
    walkDistance: entity.walkDistance,
    yaw: entity.yaw,
    scale: entity.scale,
    complaint: entity.complaint,
    departing: entity.departing,
    profile: entity.profile ? {
      id: entity.profile.id,
      reactionMultipliers: { ...entity.profile.reactionMultipliers },
      messinessMultiplier: entity.profile.messinessMultiplier ?? 1,
      beveragePurchaseChance: entity.profile.beveragePurchaseChance ??
        HIGH_HEAT_BEVERAGE_PURCHASE_CHANCE,
      boredomRateMultiplier: entity.profile.boredomRateMultiplier ?? 1
    } : null,
    toleranceLimit: entity.tolerance?.toleranceLimit ?? 0,
    toleranceUsed: entity.tolerance?.toleranceUsed ?? 0,
    toleranceIssues: entity.tolerance ? [...entity.tolerance.issues] : [],
    heatExposureSeconds: entity.heatExposureSeconds ?? 0,
    boredomRateMultiplier: entity.profile?.boredomRateMultiplier ?? 1,
    mood: createBatherMoodSnapshot(entity),
    beverageDecisionMade: Boolean(entity.beverageDecisionMade),
    beveragePurchased: Boolean(entity.beveragePurchased),
    movementPurpose: entity.movementPurpose,
    activityBuildingType: entity.activityBuildingType,
    interaction: entity.interaction ? { ...entity.interaction } : null,
    activityDurationSeconds: entity.activityDurationSeconds,
    motiveNeeds: { ...(entity.motiveNeeds || {}) },
    availableServiceMotives: [...(entity.availableServiceMotives || [])],
    activityChoice: entity.activityChoice ? {
      candidateIndices: [...entity.activityChoice.candidateIndices],
      candidateServiceTypes: [...entity.activityChoice.candidateServiceTypes],
      selectedIndex: entity.activityChoice.selectedIndex,
      selectedServiceType: entity.activityChoice.selectedServiceType,
      selectedUtility: entity.activityChoice.selectedUtility
    } : null
  };
}

function occupyTolerance(entity, toleranceModel, source, notifyToleranceOccupied) {
  if (toleranceModel.hasIssue(entity.tolerance, source)) {
    return toleranceModel.isExhausted(entity.tolerance);
  }

  entity.tolerance = toleranceModel.occupy(entity.tolerance, { source });
  notifyToleranceOccupied({
    bather: createEntitySnapshot(entity),
    source
  });
  return toleranceModel.isExhausted(entity.tolerance);
}

function beginToleranceDeparture(entity, navigationObstacles = []) {
  entity.departing = true;
  entity.complaint = BATHER_COMPLAINTS.TOLERANCE_EXHAUSTED;
  beginMovement(
    entity,
    NPC_STATES.RETURNING_HOME,
    entity.home,
    "home",
    navigationObstacles
  );
}

function hasAdvertisedMotive(buildingServices, motive, legacyAvailability) {
  if (!Array.isArray(buildingServices.advertisements)) {
    return Boolean(legacyAvailability);
  }

  return buildingServices.advertisements.some((advertisement) => (
    advertisement.motive === motive && advertisement.available
  ));
}

function getReactionThreshold(entity, reactionType, baseSeconds) {
  const multiplier = Number(
    entity.profile?.reactionMultipliers?.[reactionType]
  );
  return baseSeconds * (
    Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1
  );
}

function maybeStartBeverageStoreVisit(
  entity,
  buildingServices,
  heat,
  beverageStorePosition,
  random,
  notifyBeverageDecision
) {
  if (
    entity.departing ||
    entity.beverageDecisionMade ||
    entity.beveragePurchased ||
    heat.level !== "HIGH" ||
    !hasAdvertisedMotive(
      buildingServices,
      BUILDING_SERVICE_MOTIVES.REFRESHMENT,
      buildingServices.hasBeverageStore
    ) ||
    !Array.isArray(beverageStorePosition) ||
    beverageStorePosition.length !== 2 ||
    !beverageStorePosition.every(Number.isFinite)
  ) {
    return;
  }

  entity.beverageDecisionMade = true;
  const profileChance = Number(entity.profile?.beveragePurchaseChance);
  const purchaseChance = Number.isFinite(profileChance) ?
    Math.max(0, Math.min(1, profileChance)) :
    HIGH_HEAT_BEVERAGE_PURCHASE_CHANCE;

  if (sampleUnit(random) >= purchaseChance) {
    return;
  }

  beginBeverageStoreVisit(entity, beverageStorePosition);
  notifyBeverageDecision(entity);
}

function updateBatherNeeds(
  entity,
  stepSeconds,
  buildingServices,
  heat,
  toleranceModel,
  notifyToleranceOccupied,
  buildingObstacles = []
) {
  entity.beachElapsedSeconds += stepSeconds;
  updateMotiveNeeds(entity, stepSeconds);
  const needsElapsed = entity.beachElapsedSeconds - entity.needsDelaySeconds;
  const toiletOperational = hasAdvertisedMotive(
    buildingServices,
    BUILDING_SERVICE_MOTIVES.RELIEF,
    buildingServices.toiletOperational ?? buildingServices.hasToiletBuilding
  );
  const beverageAvailable = hasAdvertisedMotive(
    buildingServices,
    BUILDING_SERVICE_MOTIVES.REFRESHMENT,
    buildingServices.hasBeverageStore
  );
  const wifiAvailable = hasAdvertisedMotive(
    buildingServices,
    BUILDING_SERVICE_MOTIVES.CONNECTIVITY,
    buildingServices.hasWifiSpot
  );
  const entertainmentAvailable = hasAdvertisedMotive(
    buildingServices,
    BUILDING_SERVICE_MOTIVES.ENTERTAINMENT,
    false
  );
  entity.availableServiceMotives = Array.isArray(buildingServices.advertisements)
    ? buildingServices.advertisements
      .filter(({ available }) => available)
      .map(({ motive }) => motive)
    : [];
  const reliefNeed = getMotiveNeed(entity, BUILDING_SERVICE_MOTIVES.RELIEF);
  const connectivityNeed = getMotiveNeed(
    entity,
    BUILDING_SERVICE_MOTIVES.CONNECTIVITY
  );
  const entertainmentNeed = getMotiveNeed(
    entity,
    BUILDING_SERVICE_MOTIVES.ENTERTAINMENT
  );

  if (entity.departing) {
    return;
  }

  if (entity.state !== NPC_STATES.IDLE) {
    return;
  }

  const hotWithoutBeverage = heat.level === "HIGH" && !beverageAvailable;
  entity.heatExposureSeconds = hotWithoutBeverage
    ? entity.heatExposureSeconds + stepSeconds
    : 0;

  if (entity.heatExposureSeconds >= getReactionThreshold(
    entity,
    BATHER_REACTION_TYPES.HEAT,
    HEAT_COMPLAINT_SECONDS
  )) {
    entity.complaint = BATHER_COMPLAINTS.HEAT;
    if (occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.HEAT,
      notifyToleranceOccupied
    )) {
      beginToleranceDeparture(entity, buildingObstacles);
    }
    return;
  }

  if (!toiletOperational && reliefNeed >= MOTIVE_COMPLAINT_THRESHOLDS[
    BUILDING_SERVICE_MOTIVES.RELIEF
  ]) {
    entity.complaint = BATHER_COMPLAINTS.TOILET;

    const toleranceExhausted = occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.TOILET,
      notifyToleranceOccupied
    );

    if (!entity.departing && (
      toleranceExhausted ||
      reliefNeed >= MOTIVE_LEAVE_THRESHOLDS[BUILDING_SERVICE_MOTIVES.RELIEF]
    )) {
      if (toleranceExhausted) {
        beginToleranceDeparture(entity, buildingObstacles);
      } else {
        entity.departing = true;
        entity.complaint = BATHER_COMPLAINTS.TOILET_LEAVING;
        beginMovement(
          entity,
          NPC_STATES.RETURNING_HOME,
          entity.home,
          "home",
          buildingObstacles
        );
      }
    }
    return;
  }

  if (!wifiAvailable && connectivityNeed >= MOTIVE_COMPLAINT_THRESHOLDS[
    BUILDING_SERVICE_MOTIVES.CONNECTIVITY
  ]) {
    entity.complaint = BATHER_COMPLAINTS.WIFI;

    if (occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.WIFI,
      notifyToleranceOccupied
    )) {
      beginToleranceDeparture(entity, buildingObstacles);
    }
    return;
  }

  if (!entertainmentAvailable && entertainmentNeed >= MOTIVE_COMPLAINT_THRESHOLDS[
    BUILDING_SERVICE_MOTIVES.ENTERTAINMENT
  ]) {
    entity.complaint = BATHER_COMPLAINTS.ENTERTAINMENT;

    if (occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.ENTERTAINMENT,
      notifyToleranceOccupied
    )) {
      beginToleranceDeparture(entity, buildingObstacles);
    }
    return;
  }

  entity.complaint = null;
}

export function createNpcSystem({ random = Math.random } = {}) {
  const entities = [];
  const batherToleranceModel = createBatherToleranceModel({ random });
  const batherProfileModel = createBatherProfileModel({ random });
  const departureObservers = new Set();
  const toleranceObservers = new Set();
  const serviceDecisionObservers = new Set();
  const serviceCompletionObservers = new Set();
  const beverageDecisionObservers = new Set();
  const beveragePurchaseObservers = new Set();
  let nextBatherId = 1;
  let serviceDecisionSequence = 0;
  let serviceCompletionSequence = 0;
  let beverageDecisionSequence = 0;
  let beveragePurchaseSequence = 0;
  const notifyToleranceOccupied = (event) => {
    for (const observer of toleranceObservers) {
      observer(event);
    }
  };
  const notifyBeverageDecision = (bather) => {
    beverageDecisionSequence += 1;
    const event = Object.freeze({
      sequence: beverageDecisionSequence,
      batherId: bather.id,
      bather: createEntitySnapshot(bather)
    });

    for (const observer of beverageDecisionObservers) {
      observer(event);
    }
  };
  const notifyServiceDecision = ({
    entity,
    buildingType,
    motive,
    utility
  }) => {
    serviceDecisionSequence += 1;
    const event = Object.freeze({
      sequence: serviceDecisionSequence,
      batherId: entity.id,
      buildingType,
      motive,
      utility,
      bather: createEntitySnapshot(entity)
    });

    for (const observer of serviceDecisionObservers) {
      observer(event);
    }
  };
  const notifyServiceCompletion = ({ entity, buildingType, motive }) => {
    serviceCompletionSequence += 1;
    const event = Object.freeze({
      sequence: serviceCompletionSequence,
      batherId: entity.id,
      buildingType,
      motive,
      durationSeconds: entity.activityDurationSeconds,
      bather: createEntitySnapshot(entity)
    });

    for (const observer of serviceCompletionObservers) {
      observer(event);
    }
  };

  return {
    addBather({ position }) {
      if (
        !Array.isArray(position) ||
        position.length !== 2 ||
        !position.every(Number.isFinite)
      ) {
        throw new Error("Banhista precisa de uma posicao [x, z] valida.");
      }

      const entity = {
        id: `bather-${nextBatherId}`,
        type: NPC_TYPES.BATHER,
        state: NPC_STATES.IDLE,
        position: [...position],
        home: [...position],
        destination: null,
        navigationPath: [],
        navigationTarget: null,
        navigationObstacleSignature: null,
        interaction: null,
        lastActivityIndex: null,
        lastServiceBuildingType: null,
        activityChoice: null,
        restlessness: 0,
        stateElapsedSeconds: 0,
        currentSpeed: 0,
        walkDistance: 0,
        yaw: 0,
        scale: 1,
        beachElapsedSeconds: 0,
        needsDelaySeconds: ((nextBatherId - 1) % 3) * 2,
        profile: batherProfileModel.createProfile(),
        tolerance: batherToleranceModel.createState(),
        heatExposureSeconds: 0,
        availableServiceMotives: [],
        complaint: null,
        departing: false,
        beverageDecisionMade: false,
        beveragePurchased: false,
        movementPurpose: null,
        activityBuildingType: null,
        activityDurationSeconds: 0,
        motiveNeeds: {
          [BUILDING_SERVICE_MOTIVES.CONNECTIVITY]: 0,
          [BUILDING_SERVICE_MOTIVES.RELIEF]: 0,
          [BUILDING_SERVICE_MOTIVES.ENTERTAINMENT]: 0
        }
      };

      nextBatherId += 1;
      selectNextActivity(entity, random);
      entities.push(entity);

      return createEntitySnapshot(entity);
    },
    update(
      deltaSeconds,
      {
        buildingServices = {},
        heat = {},
        beverageStorePosition = null,
        servicePositions = {},
        sunShadePositions = [],
        buildingObstacles = []
      } = {}
    ) {
      const stepSeconds = Math.min(Math.max(Number(deltaSeconds) || 0, 0), 0.05);
      const departedIds = new Set();
      const serviceUseCounts = {};
      const normalizedBuildingObstacles = normalizeNavigationObstacles(
        buildingObstacles
      );
      const buildingObstacleSignature = createNavigationObstacleSignature(
        normalizedBuildingObstacles
      );

      for (const entity of entities) {
        const buildingType = entity.activityBuildingType;

        if (buildingType) {
          serviceUseCounts[buildingType] = (
            serviceUseCounts[buildingType] || 0
          ) + 1;
        }
      }

      for (const entity of entities) {
        if (
          !entity.departing &&
          entity.state === NPC_STATES.IDLE &&
          entity.restlessness >= AUTONOMY_RESELECTION_RESTLESSNESS
        ) {
          selectNextActivity(entity, random, {
            buildingServices,
            servicePositions,
            serviceUseCounts,
            sunShadePositions,
            heat,
            notifyServiceDecision,
            buildingObstacles
          });

          const selectedServiceType = entity.activityBuildingType;

          if (selectedServiceType) {
            serviceUseCounts[selectedServiceType] = (
              serviceUseCounts[selectedServiceType] || 0
            ) + 1;
          }
        }

        maybeStartBeverageStoreVisit(
          entity,
          buildingServices,
          heat,
          beverageStorePosition,
          random,
          notifyBeverageDecision
        );
        updateBatherNeeds(
          entity,
          stepSeconds,
          buildingServices,
          heat,
          batherToleranceModel,
          notifyToleranceOccupied,
          buildingObstacles
        );

        if (
          entity.state === NPC_STATES.WALKING_TO_ACTIVITY ||
          entity.state === NPC_STATES.RETURNING_HOME
        ) {
          refreshEntityNavigation(
            entity,
            normalizedBuildingObstacles,
            buildingObstacleSignature
          );
        }

        if (entity.departing) {
          if (moveEntity(entity, stepSeconds)) {
            departedIds.add(entity.id);
          }
          continue;
        }

        if (
          entity.state !== NPC_STATES.RELAXING &&
          entity.state !== NPC_STATES.SERVICE_USE
        ) {
          const boredomRateMultiplier = Math.max(
            0.5,
            Number(entity.profile?.boredomRateMultiplier) || 1
          );
          entity.restlessness = Math.min(
            RESTLESSNESS_LIMIT,
            entity.restlessness + RESTLESSNESS_RATE * boredomRateMultiplier * stepSeconds
          );
        }

        if (entity.state === NPC_STATES.IDLE) {
          if (entity.restlessness >= RESTLESSNESS_LIMIT) {
            selectNextActivity(entity, random, {
              buildingServices,
              servicePositions,
              serviceUseCounts,
              sunShadePositions,
              heat,
              notifyServiceDecision,
              buildingObstacles
            });
          }
          continue;
        }

        if (entity.state === NPC_STATES.WALKING_TO_ACTIVITY) {
          if (moveEntity(entity, stepSeconds)) {
            const isBeveragePurchase = entity.movementPurpose === "beverage-store";
            const isBuildingService = Boolean(entity.activityBuildingType);
            entity.state = isBeveragePurchase ?
              NPC_STATES.BEVERAGE_PURCHASE :
              isBuildingService ? NPC_STATES.SERVICE_USE : NPC_STATES.RELAXING;
            entity.restlessness = 0;
            entity.stateElapsedSeconds = 0;
            entity.activityDurationSeconds = entity.activityBuildingType ===
              BEACH_AMENITY_TYPES.SUN_SHADE ?
              chooseSunShadeActivityDuration(heat, random) :
              entity.activityBuildingType ?
                SERVICE_ACTIVITY_DURATIONS[entity.activityBuildingType] ||
                  RELAXING_DURATION_SECONDS :
                  RELAXING_DURATION_SECONDS;
            if (entity.interaction) {
              entity.interaction = {
                ...entity.interaction,
                phase: "active"
              };
            }
            entity.movementPurpose = null;
          }
          continue;
        }

        if (entity.state === NPC_STATES.BEVERAGE_PURCHASE) {
          entity.stateElapsedSeconds += stepSeconds;
          if (entity.stateElapsedSeconds >= BEVERAGE_PURCHASE_DURATION_SECONDS) {
            entity.beveragePurchased = true;
            entity.heatExposureSeconds = 0;
            entity.complaint = null;
            beveragePurchaseSequence += 1;
            const beveragePurchaseEvent = Object.freeze({
              sequence: beveragePurchaseSequence,
              batherId: entity.id,
              amountInCents: BEVERAGE_PURCHASE_PRICE_IN_CENTS,
              bather: createEntitySnapshot(entity)
            });
            for (const observer of beveragePurchaseObservers) {
              observer(beveragePurchaseEvent);
            }
            beginMovement(
              entity,
              NPC_STATES.RETURNING_HOME,
              entity.home,
              "home",
              buildingObstacles
            );
          }
          continue;
        }

        if (
          entity.state === NPC_STATES.SERVICE_USE ||
          entity.state === NPC_STATES.RELAXING
        ) {
          entity.stateElapsedSeconds += stepSeconds;
          if (entity.stateElapsedSeconds >= entity.activityDurationSeconds) {
            const completedBuildingType = entity.activityBuildingType;
            const completedMotive = SERVICE_OUTCOME_MOTIVES[completedBuildingType] || null;
            applyServiceOutcome(entity, completedBuildingType);
            if (completedBuildingType) {
              notifyServiceCompletion({
                entity,
                buildingType: completedBuildingType,
                motive: completedMotive
              });
            }
            completeBeachActivity(entity);
          }
          continue;
        }

        if (entity.state === NPC_STATES.RETURNING_HOME && moveEntity(entity, stepSeconds)) {
          entity.state = NPC_STATES.IDLE;
          entity.stateElapsedSeconds = 0;
        }
      }

      if (departedIds.size > 0) {
        for (const entity of entities) {
          if (!departedIds.has(entity.id)) {
            continue;
          }

          const snapshot = createEntitySnapshot(entity);
          for (const observer of departureObservers) {
            observer(snapshot);
          }
        }

        for (let index = entities.length - 1; index >= 0; index -= 1) {
          if (departedIds.has(entities[index].id)) {
            entities.splice(index, 1);
          }
        }
      }
    },
    getSnapshot() {
      return entities.map(createEntitySnapshot);
    },
    closeDay() {
      const departingSnapshots = entities.map(createEntitySnapshot);

      for (const snapshot of departingSnapshots) {
        for (const observer of departureObservers) {
          observer(snapshot);
        }
      }
      entities.length = 0;
      return departingSnapshots;
    },
    subscribeToDepartures(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de saida de bather precisa ser uma funcao.");
      }

      departureObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        departureObservers.delete(observer);
      };
    },
    subscribeToToleranceChanges(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de tolerancia precisa ser uma funcao.");
      }

      toleranceObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        toleranceObservers.delete(observer);
      };
    },
    subscribeToBeverageDecisions(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de decisao de bebida precisa ser uma funcao.");
      }

      beverageDecisionObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        beverageDecisionObservers.delete(observer);
      };
    },
    subscribeToServiceDecisions(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de decisao de servico precisa ser uma funcao.");
      }

      serviceDecisionObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        serviceDecisionObservers.delete(observer);
      };
    },
    subscribeToServiceCompletions(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de conclusao de servico precisa ser uma funcao.");
      }

      serviceCompletionObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        serviceCompletionObservers.delete(observer);
      };
    },
    subscribeToBeveragePurchases(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observador de compras de bebida precisa ser uma funcao.");
      }

      beveragePurchaseObservers.add(observer);
      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        beveragePurchaseObservers.delete(observer);
      };
    }
  };
}
