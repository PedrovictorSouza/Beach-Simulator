import {
  SQUIRTLE_WATER_GUN_ARC_HEIGHT,
  SQUIRTLE_WATER_GUN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPLASH_DURATION,
  SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPLASH_RADIUS,
  SQUIRTLE_WATER_GUN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_WIDTH
} from "./fieldMoveTuning.js";

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

export function getSquirtleWaterGunBillboards({
  action = null,
  texture = null,
  uvRect = [0, 0, 1, 1],
  getMouthPosition = () => [0, 0, 0]
} = {}) {
  if (!action || action.phase !== "spray" || !texture) {
    return [];
  }

  const sprayDuration = Number(action.sprayDuration) > 0 ?
    action.sprayDuration :
    SQUIRTLE_WATER_GUN_SPRAY_DURATION;
  const impactTime = Number(action.impactTime) > 0 ?
    action.impactTime :
    SQUIRTLE_WATER_GUN_IMPACT_TIME;
  const progress = Math.min(
    1,
    Math.max(0, action.sprayElapsed / sprayDuration)
  );
  const mouthPosition = getMouthPosition();
  const targetPosition = action.targetPosition;
  const streamDirectionX = targetPosition[0] - mouthPosition[0];
  const streamDirectionZ = targetPosition[2] - mouthPosition[2];
  const streamLength = Math.hypot(streamDirectionX, streamDirectionZ) || 1;
  const sideX = -streamDirectionZ / streamLength;
  const sideZ = streamDirectionX / streamLength;
  const forwardX = streamDirectionX / streamLength;
  const forwardZ = streamDirectionZ / streamLength;
  const billboards = [];

  for (let index = 0; index < SQUIRTLE_WATER_GUN_PARTICLE_COUNT; index += 1) {
    const pathProgress = (progress * 1.72 + index * 0.047) % 1;
    const lane = (index % SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT) -
      (SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT - 1) * 0.5;
    const impactStretch = clamp01((pathProgress - 0.74) / 0.26);
    const wobble = Math.sin(progress * 22 + index * 1.7) * 0.045;
    const laneOffset = lane * SQUIRTLE_WATER_GUN_STREAM_WIDTH;
    const splashSide = (index % 2 === 0 ? -1 : 1) *
      impactStretch *
      (0.11 + (index % 4) * 0.035);
    const splashForward = ((index % 5) - 2) * impactStretch * 0.035;
    const baseSize = 0.14 + (index % 4) * 0.018;
    const arcY = mouthPosition[1] +
      (targetPosition[1] - mouthPosition[1]) * pathProgress +
      Math.sin(pathProgress * Math.PI) * SQUIRTLE_WATER_GUN_ARC_HEIGHT;
    const groundY = targetPosition[1] + 0.045 + (index % 2) * 0.012;
    const y = lerp(arcY, groundY, impactStretch * impactStretch);

    billboards.push({
      texture,
      position: [
        mouthPosition[0] +
          (targetPosition[0] - mouthPosition[0]) * pathProgress +
          sideX * (wobble + laneOffset + splashSide) +
          forwardX * splashForward,
        y,
        mouthPosition[2] +
          (targetPosition[2] - mouthPosition[2]) * pathProgress +
          sideZ * (wobble + laneOffset + splashSide) +
          forwardZ * splashForward
      ],
      size: [
        baseSize * (1.08 + impactStretch * 2.35),
        baseSize * (0.96 - impactStretch * 0.48)
      ],
      uvRect
    });
  }

  const splashElapsed = action.sprayElapsed - impactTime;

  if (splashElapsed >= 0) {
    const splashProgress = clamp01(splashElapsed / SQUIRTLE_WATER_GUN_SPLASH_DURATION);
    const splashRadius = easeOutCubic(splashProgress) * SQUIRTLE_WATER_GUN_SPLASH_RADIUS;
    const splashLift = Math.sin(splashProgress * Math.PI) * 0.075 * (1 - splashProgress * 0.35);

    for (let index = 0; index < SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT; index += 1) {
      const angle = index * 2.39996 + progress * 1.6;
      const radius = splashRadius * (0.36 + (index % 4) * 0.18);
      const size = 0.16 + (index % 3) * 0.035;

      billboards.push({
        texture,
        position: [
          targetPosition[0] + Math.cos(angle) * radius,
          targetPosition[1] + 0.05 + splashLift + (index % 2) * 0.012,
          targetPosition[2] + Math.sin(angle) * radius
        ],
        size: [
          size * (1.45 + splashProgress * 1.85),
          size * (0.48 - splashProgress * 0.18)
        ],
        uvRect
      });
    }
  }

  return billboards;
}
