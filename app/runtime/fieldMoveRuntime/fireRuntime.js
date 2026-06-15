import {
  CHARMANDER_FIRE_ARRIVE_DISTANCE,
  CHARMANDER_FIRE_IMPACT_TIME,
  CHARMANDER_FIRE_SPEED,
  CHARMANDER_FIRE_SPRAY_DURATION
} from "./fieldMoveTuning.js";

const NOOP = () => {};

const DEFAULT_CONFIG = Object.freeze({
  arriveDistance: CHARMANDER_FIRE_ARRIVE_DISTANCE,
  impactTime: CHARMANDER_FIRE_IMPACT_TIME,
  speed: CHARMANDER_FIRE_SPEED,
  sprayDuration: CHARMANDER_FIRE_SPRAY_DURATION
});

function defaultMoveCompanionToPosition(companion, nextPosition) {
  if (!companion) {
    return false;
  }

  companion.position = nextPosition;
  return true;
}

function defaultGroundCellCenterPosition(groundCell) {
  const offset = groundCell?.offset || [0, 0, 0];
  return [
    offset[0] || 0,
    (offset[1] || 0) + 0.04,
    offset[2] || 0
  ];
}

export function createFireRuntime({
  session = {},
  getCharmander = () => session.charmanderEncounter,
  isBusy = () => false,
  onBusy = NOOP,
  hasFireCarbon = () => false,
  getGroundCellCenterPosition = defaultGroundCellCenterPosition,
  getApproachPosition = ({ targetPosition }) => targetPosition,
  getModelYawToward = () => 0,
  tryMoveCompanionToPosition = defaultMoveCompanionToPosition,
  isPositionBlocked = () => false,
  syncCharmander = NOOP,
  applyImpact = () => false,
  onBlocked = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function startAction({ groundCell, playerPosition } = {}) {
    const charmander = getCharmander();
    if (!groundCell) {
      return "unavailable";
    }

    if (isBusy()) {
      onBusy();
      return "busy";
    }

    if (session.charmanderFireAction) {
      return "busy";
    }

    if (
      !charmander?.modelInstance ||
      !charmander.visible ||
      !Array.isArray(charmander.position)
    ) {
      return "unavailable";
    }

    if (!hasFireCarbon()) {
      return "no-carbon";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getApproachPosition({
      targetPosition,
      playerPosition,
      charmander
    });

    session.charmanderFireAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      sprayElapsed: 0,
      impactApplied: false
    };
    charmander.modelInstance.active = true;
    charmander.modelInstance.yaw = getModelYawToward(
      charmander.position,
      targetPosition
    );
    syncCharmander();

    return "started";
  }

  function clearAction() {
    session.charmanderFireAction = null;
  }

  function updateAction(deltaTime) {
    const action = session.charmanderFireAction;
    const charmander = getCharmander();

    if (!action || !charmander?.modelInstance) {
      return;
    }

    if (!Array.isArray(charmander.position)) {
      charmander.position = [...(charmander.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - charmander.position[0];
      const deltaZ = action.approachPosition[2] - charmander.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(settings.speed * deltaTime, distance);

      if (distance > settings.arriveDistance && travel > 0) {
        const nextPosition = [
          charmander.position[0] + (deltaX / distance) * travel,
          0.04,
          charmander.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(charmander, nextPosition)) {
          clearAction();
          onBlocked();
          syncCharmander();
          return;
        }
      } else {
        if (isPositionBlocked(action.approachPosition)) {
          clearAction();
          onBlocked();
          syncCharmander();
          return;
        }

        charmander.position = [...action.approachPosition];
        action.phase = "spray";
        action.sprayElapsed = 0;
      }

      charmander.modelInstance.yaw = getModelYawToward(
        charmander.position,
        action.targetPosition
      );
      syncCharmander();
      return;
    }

    if (action.phase !== "spray") {
      clearAction();
      return;
    }

    action.sprayElapsed += deltaTime;
    charmander.modelInstance.yaw = getModelYawToward(
      charmander.position,
      action.targetPosition
    );
    syncCharmander();

    if (!action.impactApplied && action.sprayElapsed >= settings.impactTime) {
      action.impactApplied = true;
      applyImpact(action);
    }

    if (action.sprayElapsed >= settings.sprayDuration) {
      clearAction();
    }
  }

  return {
    startAction,
    updateAction
  };
}
