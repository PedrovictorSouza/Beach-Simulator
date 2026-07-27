import { createBatherToleranceModel } from "./batherToleranceModel.js";
import {
  BATHER_REACTION_TYPES,
  createBatherProfileModel
} from "./batherProfileModel.js";
import { BUILDING_SERVICE_MOTIVES } from "../buildings/buildingServicesModel.js";

export const NPC_TYPES = Object.freeze({
  BATHER: "bather"
});

export const NPC_STATES = Object.freeze({
  IDLE: "idle",
  WALKING_TO_ACTIVITY: "walking-to-activity",
  RELAXING: "relaxing",
  RETURNING_HOME: "returning-home"
});

const WALKING_SPEED = 7;
const WALKING_ACCELERATION = 9;
const ARRIVAL_DISTANCE = 0.35;
const RESTLESSNESS_LIMIT = 100;
const RESTLESSNESS_RATE = 14;
const RELAXING_DURATION_SECONDS = 3.5;
const HEAT_COMPLAINT_SECONDS = 30;
const ENTERTAINMENT_COMPLAINT_SECONDS = 10;
const WIFI_COMPLAINT_SECONDS = 16;
const TOILET_COMPLAINT_SECONDS = 24;
const TOILET_LEAVE_SECONDS = 34;
const ACTIVITY_NOVELTY_UTILITY = 18;
const ACTIVITY_REPEAT_UTILITY = -24;
const ACTIVITY_VARIATION_UTILITY = 12;
const ACTIVITY_PROXIMITY_RANGE = 70;
const BATHER_COMPLAINTS = Object.freeze({
  HEAT: "It's too hot! I need a beverage!",
  ENTERTAINMENT: "There is nothing to do!",
  WIFI: "I need internet!",
  TOILET: "I need a toilet!",
  TOILET_LEAVING: "No toilet. I'm leaving!",
  TOLERANCE_EXHAUSTED: "Too many problems. I'm leaving!"
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

function beginMovement(entity, state, destination) {
  entity.state = state;
  entity.destination = [...destination];
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

function selectNextActivity(entity, random) {
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
  const selected = candidates[0].utility >= candidates[1].utility
    ? candidates[0]
    : candidates[1];

  entity.lastActivityIndex = selected.waypointIndex;
  entity.activityChoice = Object.freeze({
    candidateIndices: Object.freeze(candidates.map(({ waypointIndex }) => waypointIndex)),
    selectedIndex: selected.waypointIndex,
    selectedUtility: selected.utility
  });
  beginMovement(entity, NPC_STATES.WALKING_TO_ACTIVITY, selected.waypoint);
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
    entity.destination = null;
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
      label: entity.profile.label,
      reactionMultipliers: { ...entity.profile.reactionMultipliers }
    } : null,
    toleranceLimit: entity.tolerance?.toleranceLimit ?? 0,
    toleranceUsed: entity.tolerance?.toleranceUsed ?? 0,
    toleranceIssues: entity.tolerance ? [...entity.tolerance.issues] : [],
    heatExposureSeconds: entity.heatExposureSeconds ?? 0,
    availableServiceMotives: [...(entity.availableServiceMotives || [])],
    activityChoice: entity.activityChoice ? {
      candidateIndices: [...entity.activityChoice.candidateIndices],
      selectedIndex: entity.activityChoice.selectedIndex,
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

function beginToleranceDeparture(entity) {
  entity.departing = true;
  entity.complaint = BATHER_COMPLAINTS.TOLERANCE_EXHAUSTED;
  beginMovement(entity, NPC_STATES.RETURNING_HOME, entity.home);
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

function updateBatherNeeds(
  entity,
  stepSeconds,
  buildingServices,
  heat,
  toleranceModel,
  notifyToleranceOccupied
) {
  entity.beachElapsedSeconds += stepSeconds;
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

  if (entity.departing) {
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
      beginToleranceDeparture(entity);
    }
    return;
  }

  if (!toiletOperational && needsElapsed >= getReactionThreshold(
    entity,
    BATHER_REACTION_TYPES.TOILET,
    TOILET_COMPLAINT_SECONDS
  )) {
    entity.complaint = BATHER_COMPLAINTS.TOILET;

    const toleranceExhausted = occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.TOILET,
      notifyToleranceOccupied
    );

    if (!entity.departing && (
      toleranceExhausted ||
      needsElapsed >= getReactionThreshold(
        entity,
        BATHER_REACTION_TYPES.TOILET,
        TOILET_LEAVE_SECONDS
      )
    )) {
      if (toleranceExhausted) {
        beginToleranceDeparture(entity);
      } else {
        entity.departing = true;
        entity.complaint = BATHER_COMPLAINTS.TOILET_LEAVING;
        beginMovement(entity, NPC_STATES.RETURNING_HOME, entity.home);
      }
    }
    return;
  }

  if (!wifiAvailable && needsElapsed >= getReactionThreshold(
    entity,
    BATHER_REACTION_TYPES.WIFI,
    WIFI_COMPLAINT_SECONDS
  )) {
    entity.complaint = BATHER_COMPLAINTS.WIFI;

    if (occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.WIFI,
      notifyToleranceOccupied
    )) {
      beginToleranceDeparture(entity);
    }
    return;
  }

  if (!entertainmentAvailable && needsElapsed >= getReactionThreshold(
    entity,
    BATHER_REACTION_TYPES.ENTERTAINMENT,
    ENTERTAINMENT_COMPLAINT_SECONDS
  )) {
    entity.complaint = BATHER_COMPLAINTS.ENTERTAINMENT;

    if (occupyTolerance(
      entity,
      toleranceModel,
      BATHER_PROBLEM_SOURCES.ENTERTAINMENT,
      notifyToleranceOccupied
    )) {
      beginToleranceDeparture(entity);
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
  let nextBatherId = 1;
  const notifyToleranceOccupied = (event) => {
    for (const observer of toleranceObservers) {
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
        lastActivityIndex: null,
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
        departing: false
      };

      nextBatherId += 1;
      selectNextActivity(entity, random);
      entities.push(entity);

      return createEntitySnapshot(entity);
    },
    update(deltaSeconds, { buildingServices = {}, heat = {} } = {}) {
      const stepSeconds = Math.min(Math.max(Number(deltaSeconds) || 0, 0), 0.05);
      const departedIds = new Set();

      for (const entity of entities) {
        updateBatherNeeds(
          entity,
          stepSeconds,
          buildingServices,
          heat,
          batherToleranceModel,
          notifyToleranceOccupied
        );

        if (entity.departing) {
          if (moveEntity(entity, stepSeconds)) {
            departedIds.add(entity.id);
          }
          continue;
        }

        if (entity.state !== NPC_STATES.RELAXING) {
          entity.restlessness = Math.min(
            RESTLESSNESS_LIMIT,
            entity.restlessness + RESTLESSNESS_RATE * stepSeconds
          );
        }

        if (entity.state === NPC_STATES.IDLE) {
          if (entity.restlessness >= RESTLESSNESS_LIMIT) {
            selectNextActivity(entity, random);
          }
          continue;
        }

        if (entity.state === NPC_STATES.WALKING_TO_ACTIVITY) {
          if (moveEntity(entity, stepSeconds)) {
            entity.state = NPC_STATES.RELAXING;
            entity.restlessness = 0;
            entity.stateElapsedSeconds = 0;
          }
          continue;
        }

        if (entity.state === NPC_STATES.RELAXING) {
          entity.stateElapsedSeconds += stepSeconds;
          if (entity.stateElapsedSeconds >= RELAXING_DURATION_SECONDS) {
            beginMovement(entity, NPC_STATES.RETURNING_HOME, entity.home);
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
    }
  };
}
