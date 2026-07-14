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
const ACTIVITY_WAYPOINTS = Object.freeze([
  Object.freeze([-38, 12]),
  Object.freeze([-18, 48]),
  Object.freeze([8, 28]),
  Object.freeze([34, 54]),
  Object.freeze([42, 4]),
  Object.freeze([16, -28]),
  Object.freeze([-20, -18])
]);
const INITIAL_BATHERS = Object.freeze([
  Object.freeze({
    id: "bather-1",
    position: Object.freeze([-30, 22]),
    activityOffset: 0,
    restlessness: 15
  }),
  Object.freeze({
    id: "bather-2",
    position: Object.freeze([-12, 8]),
    activityOffset: 2,
    restlessness: 72
  }),
  Object.freeze({
    id: "bather-3",
    position: Object.freeze([8, 44]),
    activityOffset: 4,
    restlessness: 38
  }),
  Object.freeze({
    id: "bather-4",
    position: Object.freeze([28, 18]),
    activityOffset: 6,
    restlessness: 88
  }),
  Object.freeze({
    id: "bather-5",
    position: Object.freeze([40, -16]),
    activityOffset: 1,
    restlessness: 54
  })
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
  ) % ACTIVITY_WAYPOINTS.length;
  const waypoint = ACTIVITY_WAYPOINTS[waypointIndex];

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

export function createNpcSystem() {
  const entities = INITIAL_BATHERS.map((definition) => ({
    id: definition.id,
    type: NPC_TYPES.BATHER,
    state: NPC_STATES.IDLE,
    position: [...definition.position],
    home: [...definition.position],
    destination: null,
    activityOffset: definition.activityOffset,
    activityCursor: 0,
    restlessness: definition.restlessness,
    stateElapsedSeconds: 0,
    currentSpeed: 0,
    walkDistance: 0,
    yaw: 0,
    scale: 1
  }));

  return {
    update(deltaSeconds) {
      const stepSeconds = Math.min(Math.max(Number(deltaSeconds) || 0, 0), 0.05);

      for (const entity of entities) {
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
    },
    getSnapshot() {
      return entities.map((entity) => ({
        id: entity.id,
        type: entity.type,
        state: entity.state,
        position: [...entity.position],
        destination: entity.destination ? [...entity.destination] : null,
        restlessness: entity.restlessness,
        currentSpeed: entity.currentSpeed,
        walkDistance: entity.walkDistance,
        yaw: entity.yaw,
        scale: entity.scale
      }));
    }
  };
}
