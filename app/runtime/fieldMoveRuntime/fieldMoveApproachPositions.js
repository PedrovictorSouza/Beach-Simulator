import {
  BULBASAUR_LEAFAGE_STAND_DISTANCE,
  CHARMANDER_FIRE_STAND_DISTANCE,
  SQUIRTLE_WATER_GUN_STAND_DISTANCE
} from "./fieldMoveTuning.js";

function resolveFieldMoveApproachPosition({
  targetPosition,
  companionPosition = null,
  playerPosition = null,
  standDistance
} = {}) {
  if (!Array.isArray(targetPosition)) {
    return null;
  }

  const fallbackPosition = playerPosition || [0, 0.04, 0];
  const sourcePosition = companionPosition || fallbackPosition;
  let deltaX = sourcePosition[0] - targetPosition[0];
  let deltaZ = sourcePosition[2] - targetPosition[2];
  let distance = Math.hypot(deltaX, deltaZ);

  if (distance < 0.001 && playerPosition) {
    deltaX = playerPosition[0] - targetPosition[0];
    deltaZ = playerPosition[2] - targetPosition[2];
    distance = Math.hypot(deltaX, deltaZ);
  }

  if (distance < 0.001) {
    deltaX = 0;
    deltaZ = 1;
    distance = 1;
  }

  return [
    targetPosition[0] + (deltaX / distance) * standDistance,
    0.04,
    targetPosition[2] + (deltaZ / distance) * standDistance
  ];
}

export function resolveSquirtleWaterGunApproachPosition({
  targetPosition,
  squirtlePosition = null,
  playerPosition = null
} = {}) {
  return resolveFieldMoveApproachPosition({
    targetPosition,
    companionPosition: squirtlePosition,
    playerPosition,
    standDistance: SQUIRTLE_WATER_GUN_STAND_DISTANCE
  });
}

export function resolveBulbasaurLeafageApproachPosition({
  targetPosition,
  bulbasaurPosition = null,
  playerPosition = null
} = {}) {
  return resolveFieldMoveApproachPosition({
    targetPosition,
    companionPosition: bulbasaurPosition,
    playerPosition,
    standDistance: BULBASAUR_LEAFAGE_STAND_DISTANCE
  });
}

export function resolveCharmanderFireApproachPosition({
  targetPosition,
  charmanderPosition = null,
  playerPosition = null
} = {}) {
  return resolveFieldMoveApproachPosition({
    targetPosition,
    companionPosition: charmanderPosition,
    playerPosition,
    standDistance: CHARMANDER_FIRE_STAND_DISTANCE
  });
}
