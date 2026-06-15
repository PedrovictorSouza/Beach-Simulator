import {
  BULBASAUR_LEAFAGE_ARRIVE_DISTANCE,
  BULBASAUR_LEAFAGE_CAST_DURATION,
  BULBASAUR_LEAFAGE_IMPACT_TIME,
  BULBASAUR_LEAFAGE_SPEED
} from "./fieldMoveTuning.js";

const NOOP = () => {};

const DEFAULT_CONFIG = Object.freeze({
  arriveDistance: BULBASAUR_LEAFAGE_ARRIVE_DISTANCE,
  castDuration: BULBASAUR_LEAFAGE_CAST_DURATION,
  impactTime: BULBASAUR_LEAFAGE_IMPACT_TIME,
  speed: BULBASAUR_LEAFAGE_SPEED
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

export function createLeafageRuntime({
  session = {},
  getBulbasaur = () => session.bulbasaurEncounter,
  isBusy = () => false,
  getGroundCellCenterPosition = defaultGroundCellCenterPosition,
  getApproachPosition = ({ targetPosition }) => targetPosition,
  getModelYawToward = () => 0,
  tryMoveCompanionToPosition = defaultMoveCompanionToPosition,
  isPositionBlocked = () => false,
  syncBulbasaur = NOOP,
  applyImpact = () => false,
  onBlocked = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function startAction({ groundCell, playerPosition } = {}) {
    const bulbasaur = getBulbasaur();
    if (!groundCell) {
      return "unavailable";
    }

    if (isBusy()) {
      return "busy";
    }

    if (session.bulbasaurLeafageAction) {
      return "busy";
    }

    if (
      !bulbasaur?.modelInstance ||
      !bulbasaur.visible ||
      !Array.isArray(bulbasaur.position)
    ) {
      return "unavailable";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getApproachPosition({
      targetPosition,
      playerPosition,
      bulbasaur
    });

    session.bulbasaurLeafageAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      castElapsed: 0,
      impactApplied: false
    };
    bulbasaur.modelInstance.active = true;
    bulbasaur.modelInstance.yaw = getModelYawToward(
      bulbasaur.position,
      targetPosition
    );
    syncBulbasaur();

    return "started";
  }

  function clearAction() {
    session.bulbasaurLeafageAction = null;
  }

  function updateAction(deltaTime) {
    const action = session.bulbasaurLeafageAction;
    const bulbasaur = getBulbasaur();

    if (!action || !bulbasaur?.modelInstance) {
      return;
    }

    if (!Array.isArray(bulbasaur.position)) {
      bulbasaur.position = [...(bulbasaur.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - bulbasaur.position[0];
      const deltaZ = action.approachPosition[2] - bulbasaur.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(settings.speed * deltaTime, distance);

      if (distance > settings.arriveDistance && travel > 0) {
        const nextPosition = [
          bulbasaur.position[0] + (deltaX / distance) * travel,
          0.04,
          bulbasaur.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(bulbasaur, nextPosition)) {
          clearAction();
          onBlocked();
          syncBulbasaur();
          return;
        }
      } else {
        if (isPositionBlocked(action.approachPosition)) {
          clearAction();
          onBlocked();
          syncBulbasaur();
          return;
        }

        bulbasaur.position = [...action.approachPosition];
        action.phase = "cast";
        action.castElapsed = 0;
      }

      bulbasaur.modelInstance.yaw = getModelYawToward(
        bulbasaur.position,
        action.targetPosition
      );
      syncBulbasaur();
      return;
    }

    if (action.phase !== "cast") {
      clearAction();
      return;
    }

    action.castElapsed += deltaTime;
    bulbasaur.modelInstance.yaw = getModelYawToward(
      bulbasaur.position,
      action.targetPosition
    );
    syncBulbasaur();

    if (!action.impactApplied && action.castElapsed >= settings.impactTime) {
      action.impactApplied = true;
      applyImpact(action);
    }

    if (action.castElapsed >= settings.castDuration) {
      clearAction();
    }
  }

  return {
    startAction,
    updateAction
  };
}
