import {
  SQUIRTLE_WATER_GUN_ARRIVE_DISTANCE,
  SQUIRTLE_WATER_GUN_SPEED
} from "./fieldMoveTuning.js";

const NOOP = () => {};

const DEFAULT_RESOURCES = Object.freeze({
  beginSquirtleWaterRecharge: NOOP,
  consumeSquirtleWaterStamina: () => false,
  getSquirtleWaterGunImpactTime: () => 0,
  getSquirtleWaterGunSpeedMultiplier: () => 1,
  getSquirtleWaterGunSprayDuration: () => 0,
  getSquirtleWaterStaminaState: () => ({ charging: false, current: 0 }),
  isSquirtleWaterCharging: () => false
});

const DEFAULT_CONFIG = Object.freeze({
  arriveDistance: SQUIRTLE_WATER_GUN_ARRIVE_DISTANCE,
  speed: SQUIRTLE_WATER_GUN_SPEED
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

export function createWaterGunRuntime({
  session = {},
  resources = DEFAULT_RESOURCES,
  getSquirtle = () => session.actTwoSquirtle,
  getPlayerPosition = () => null,
  getGroundCellCenterPosition = defaultGroundCellCenterPosition,
  getApproachPosition = ({ targetPosition }) => targetPosition,
  getModelYawToward = () => 0,
  tryMoveCompanionToPosition = defaultMoveCompanionToPosition,
  isPositionBlocked = () => false,
  syncSquirtle = NOOP,
  applyImpact = () => false,
  onBlocked = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function getQueue() {
    if (!Array.isArray(session.squirtleWaterGunQueue)) {
      session.squirtleWaterGunQueue = [];
    }

    return session.squirtleWaterGunQueue;
  }

  function isCellPending(groundCell) {
    if (!groundCell?.id) {
      return false;
    }

    if (session.squirtleWaterGunAction?.groundCell?.id === groundCell.id) {
      return true;
    }

    return getQueue().some((queuedAction) => {
      return queuedAction?.groundCell?.id === groundCell.id;
    });
  }

  function enqueueAction({ groundCell, playerPosition }) {
    if (!groundCell) {
      return "unavailable";
    }

    if (resources.isSquirtleWaterCharging()) {
      return "charging";
    }

    if (isCellPending(groundCell)) {
      return "duplicate";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    getQueue().push({
      groundCell,
      targetPosition,
      playerPosition: playerPosition ? [...playerPosition] : null
    });

    return "queued";
  }

  function startAction({ groundCell, playerPosition } = {}) {
    if (!groundCell) {
      return "unavailable";
    }

    const stamina = resources.getSquirtleWaterStaminaState();
    if (stamina.charging || stamina.current <= 0) {
      resources.beginSquirtleWaterRecharge();
      return "charging";
    }

    if (session.squirtleWaterGunAction) {
      return enqueueAction({
        groundCell,
        playerPosition
      });
    }

    const squirtle = getSquirtle();
    if (!squirtle?.modelInstance || !squirtle.recovered) {
      return "unavailable";
    }

    if (!Array.isArray(squirtle.position)) {
      squirtle.position = [...(squirtle.modelInstance.offset || playerPosition || [0, 0.04, 0])];
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getApproachPosition({
      targetPosition,
      playerPosition,
      squirtle
    });
    const speedMultiplier = resources.getSquirtleWaterGunSpeedMultiplier();

    session.squirtleWaterGunAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      speedMultiplier,
      sprayDuration: resources.getSquirtleWaterGunSprayDuration(speedMultiplier),
      impactTime: resources.getSquirtleWaterGunImpactTime(speedMultiplier),
      sprayElapsed: 0,
      impactApplied: false
    };
    squirtle.modelInstance.active = true;
    squirtle.modelInstance.yaw = getModelYawToward(squirtle.position, targetPosition);
    syncSquirtle();

    return "started";
  }

  function startNextQueued() {
    if (session.squirtleWaterGunAction) {
      return;
    }

    const stamina = resources.getSquirtleWaterStaminaState();
    if (stamina.charging) {
      return;
    }

    if (stamina.current <= 0) {
      resources.beginSquirtleWaterRecharge();
      return;
    }

    const queue = getQueue();
    while (queue.length) {
      const nextAction = queue.shift();
      if (!nextAction?.groundCell) {
        continue;
      }

      if (!session.groundDeadInstances?.includes(nextAction.groundCell)) {
        continue;
      }

      startAction({
        groundCell: nextAction.groundCell,
        playerPosition: nextAction.playerPosition || getPlayerPosition()
      });
      return;
    }
  }

  function getPendingGroundCells() {
    const pendingGroundCells = [];

    if (
      session.squirtleWaterGunAction?.phase === "approach" &&
      session.squirtleWaterGunAction.groundCell
    ) {
      pendingGroundCells.push(session.squirtleWaterGunAction.groundCell);
    }

    for (const queuedAction of getQueue()) {
      if (
        queuedAction?.groundCell &&
        session.groundDeadInstances?.includes(queuedAction.groundCell)
      ) {
        pendingGroundCells.push(queuedAction.groundCell);
      }
    }

    return pendingGroundCells;
  }

  function clearAction() {
    session.squirtleWaterGunAction = null;
  }

  function updateAction(deltaTime) {
    const action = session.squirtleWaterGunAction;
    const squirtle = getSquirtle();

    if (!action || !squirtle?.modelInstance) {
      return;
    }

    if (!Array.isArray(squirtle.position)) {
      squirtle.position = [...(squirtle.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - squirtle.position[0];
      const deltaZ = action.approachPosition[2] - squirtle.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const speedMultiplier = Number(action.speedMultiplier) > 0 ?
        action.speedMultiplier :
        resources.getSquirtleWaterGunSpeedMultiplier();
      const travel = Math.min(settings.speed * speedMultiplier * deltaTime, distance);

      if (distance > settings.arriveDistance && travel > 0) {
        const nextPosition = [
          squirtle.position[0] + (deltaX / distance) * travel,
          0.04,
          squirtle.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(squirtle, nextPosition)) {
          clearAction();
          onBlocked();
          syncSquirtle();
          return;
        }
      } else {
        if (isPositionBlocked(action.approachPosition)) {
          clearAction();
          onBlocked();
          syncSquirtle();
          return;
        }

        if (!resources.consumeSquirtleWaterStamina()) {
          clearAction();
          return;
        }

        squirtle.position = [...action.approachPosition];
        action.phase = "spray";
        action.sprayElapsed = 0;
      }

      squirtle.modelInstance.yaw = getModelYawToward(
        squirtle.position,
        action.targetPosition
      );
      syncSquirtle();
      return;
    }

    if (action.phase !== "spray") {
      clearAction();
      return;
    }

    action.sprayElapsed += deltaTime;
    const speedMultiplier = Number(action.speedMultiplier) > 0 ?
      action.speedMultiplier :
      resources.getSquirtleWaterGunSpeedMultiplier();
    const impactTime = Number(action.impactTime) > 0 ?
      action.impactTime :
      resources.getSquirtleWaterGunImpactTime(speedMultiplier);
    const sprayDuration = Number(action.sprayDuration) > 0 ?
      action.sprayDuration :
      resources.getSquirtleWaterGunSprayDuration(speedMultiplier);
    squirtle.modelInstance.yaw = getModelYawToward(
      squirtle.position,
      action.targetPosition
    );
    syncSquirtle();

    if (!action.impactApplied && action.sprayElapsed >= impactTime) {
      action.impactApplied = true;
      applyImpact(action);
    }

    if (action.sprayElapsed >= sprayDuration) {
      clearAction();
      if (resources.getSquirtleWaterStaminaState().current <= 0) {
        resources.beginSquirtleWaterRecharge();
      } else {
        startNextQueued();
      }
    }
  }

  return {
    enqueueAction,
    getPendingGroundCells,
    getQueue,
    isCellPending,
    startAction,
    startNextQueued,
    updateAction
  };
}
