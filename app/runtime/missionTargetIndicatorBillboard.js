const MISSION_TARGET_INDICATOR_HEIGHT = 2.35;
const MISSION_TARGET_INDICATOR_SIZE = 0.82;
const MISSION_TARGET_INDICATOR_SPIN_SPEED = 0.0048;

export function createMissionTargetIndicatorBillboard({
  texture,
  targetPosition,
  now = 0,
  uvRect = null
} = {}) {
  if (!texture || !Array.isArray(targetPosition)) {
    return null;
  }

  const spin = now * MISSION_TARGET_INDICATOR_SPIN_SPEED;
  const widthScale = 0.18 + Math.abs(Math.cos(spin)) * 0.82;
  const bob = Math.sin(now * 0.0052) * 0.13;
  const pixelJitter = Math.round(Math.sin(now * 0.031) * 2) * 0.01;
  const alpha = 0.72 + Math.abs(Math.sin(spin)) * 0.22;

  return {
    texture,
    position: [
      targetPosition[0] + pixelJitter,
      targetPosition[1] + MISSION_TARGET_INDICATOR_HEIGHT + bob,
      targetPosition[2]
    ],
    size: [
      MISSION_TARGET_INDICATOR_SIZE * widthScale,
      MISSION_TARGET_INDICATOR_SIZE
    ],
    uvRect,
    alpha,
    rotation: Math.sin(spin * 2) * 0.035
  };
}
