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
const ENTERTAINMENT_COMPLAINT_SECONDS = 10;
const WIFI_COMPLAINT_SECONDS = 16;
const TOILET_COMPLAINT_SECONDS = 24;
const TOILET_LEAVE_SECONDS = 34;
const BATHER_COMPLAINTS = Object.freeze({
  ENTERTAINMENT: "There is nothing to do!",
  WIFI: "I need internet!",
  TOILET: "I need a toilet!",
  TOILET_LEAVING: "No toilet. I'm leaving!"
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

function selectNextActivity(entity) {
  const waypointIndex = (
    entity.activityCursor + entity.activityOffset
  ) % ACTIVITY_WAYPOINT_OFFSETS.length;
  const waypointOffset = ACTIVITY_WAYPOINT_OFFSETS[waypointIndex];
  const waypoint = [
    entity.home[0] + waypointOffset[0],
    waypointOffset[1]
  ];

  entity.activityCursor += 1;
  beginMovement(entity, NPC_STATES.WALKING_TO_ACTIVITY, waypoint);
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
    departing: entity.departing
  };
}

function updateBatherNeeds(entity, stepSeconds, buildingServices) {
  entity.beachElapsedSeconds += stepSeconds;
  const needsElapsed = entity.beachElapsedSeconds - entity.needsDelaySeconds;
  const toiletOperational = buildingServices.toiletOperational ??
    buildingServices.hasToiletBuilding;

  if (entity.departing) {
    entity.complaint = BATHER_COMPLAINTS.TOILET_LEAVING;
    return;
  }

  if (!toiletOperational && needsElapsed >= TOILET_COMPLAINT_SECONDS) {
    entity.complaint = BATHER_COMPLAINTS.TOILET;

    if (!entity.departing && needsElapsed >= TOILET_LEAVE_SECONDS) {
      entity.departing = true;
      entity.complaint = BATHER_COMPLAINTS.TOILET_LEAVING;
      beginMovement(entity, NPC_STATES.RETURNING_HOME, entity.home);
    }
    return;
  }

  if (!buildingServices.hasWifiSpot && needsElapsed >= WIFI_COMPLAINT_SECONDS) {
    entity.complaint = BATHER_COMPLAINTS.WIFI;
    return;
  }

  if (!buildingServices.hasBeverageStore && needsElapsed >= ENTERTAINMENT_COMPLAINT_SECONDS) {
    entity.complaint = BATHER_COMPLAINTS.ENTERTAINMENT;
    return;
  }

  entity.complaint = null;
}

export function createNpcSystem() {
  const entities = [];
  let nextBatherId = 1;

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
        activityOffset: (nextBatherId - 1) % ACTIVITY_WAYPOINT_OFFSETS.length,
        activityCursor: 0,
        restlessness: 0,
        stateElapsedSeconds: 0,
        currentSpeed: 0,
        walkDistance: 0,
        yaw: 0,
        scale: 1,
        beachElapsedSeconds: 0,
        needsDelaySeconds: ((nextBatherId - 1) % 3) * 2,
        complaint: null,
        departing: false
      };

      nextBatherId += 1;
      selectNextActivity(entity);
      entities.push(entity);

      return createEntitySnapshot(entity);
    },
    update(deltaSeconds, { buildingServices = {} } = {}) {
      const stepSeconds = Math.min(Math.max(Number(deltaSeconds) || 0, 0), 0.05);
      const departedIds = new Set();

      for (const entity of entities) {
        updateBatherNeeds(entity, stepSeconds, buildingServices);

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
            selectNextActivity(entity);
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
        for (let index = entities.length - 1; index >= 0; index -= 1) {
          if (departedIds.has(entities[index].id)) {
            entities.splice(index, 1);
          }
        }
      }
    },
    getSnapshot() {
      return entities.map(createEntitySnapshot);
    }
  };
}
