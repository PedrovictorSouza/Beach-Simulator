import { WORLD_LIMIT } from "../../../gameplayContent.js";

function isVector3Like(value) {
  return value && value.length >= 3;
}

export function getWrappedPlanarDelta(value, reference, worldLimit = WORLD_LIMIT) {
  const numericValue = Number(value) || 0;
  const numericReference = Number(reference) || 0;
  let delta = numericValue - numericReference;

  if (!(worldLimit > 0)) {
    return delta;
  }

  const period = worldLimit * 2;
  if (delta > worldLimit) {
    delta -= period;
  } else if (delta < -worldLimit) {
    delta += period;
  }

  return delta;
}

export function isWorldPositionWithinRenderDistance(
  position,
  referencePosition,
  distance,
  { worldLimit = WORLD_LIMIT } = {}
) {
  if (!(distance > 0) || !isVector3Like(position) || !isVector3Like(referencePosition)) {
    return true;
  }

  const dx = getWrappedPlanarDelta(position[0], referencePosition[0], worldLimit);
  const dz = getWrappedPlanarDelta(position[2], referencePosition[2], worldLimit);
  return dx * dx + dz * dz <= distance * distance;
}
