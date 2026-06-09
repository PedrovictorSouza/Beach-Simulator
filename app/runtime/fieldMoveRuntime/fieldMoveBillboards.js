import {
  BULBASAUR_LEAFAGE_ARC_HEIGHT,
  BULBASAUR_LEAFAGE_BURST_DURATION,
  BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT,
  BULBASAUR_LEAFAGE_BURST_RADIUS,
  BULBASAUR_LEAFAGE_CAST_DURATION,
  BULBASAUR_LEAFAGE_IMPACT_TIME,
  BULBASAUR_LEAFAGE_PARTICLE_COUNT,
  BULBASAUR_LEAFAGE_PARTICLE_SIZE_MAX,
  BULBASAUR_LEAFAGE_PARTICLE_SIZE_MIN,
  BULBASAUR_LEAFAGE_STREAM_WIDTH,
  CHARMANDER_FIRE_ARC_HEIGHT,
  CHARMANDER_FIRE_BURST_DURATION,
  CHARMANDER_FIRE_BURST_PARTICLE_COUNT,
  CHARMANDER_FIRE_BURST_RADIUS,
  CHARMANDER_FIRE_CONE_RADIUS,
  CHARMANDER_FIRE_IMPACT_TIME,
  CHARMANDER_FIRE_NOISE_POSITION_AMOUNT,
  CHARMANDER_FIRE_NOISE_ROTATION_AMOUNT,
  CHARMANDER_FIRE_NOISE_STRENGTH,
  CHARMANDER_FIRE_PARTICLE_COUNT,
  CHARMANDER_FIRE_PARTICLE_LIFETIME_MAX,
  CHARMANDER_FIRE_PARTICLE_LIFETIME_MIN,
  CHARMANDER_FIRE_PARTICLE_SIZE_MAX,
  CHARMANDER_FIRE_PARTICLE_SIZE_MIN,
  CHARMANDER_FIRE_SPRAY_DURATION,
  CHARMANDER_FIRE_VISUAL_SCALE,
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

function hashUnit(seed) {
  return (Math.sin(seed * 12.9898) * 43758.5453) % 1;
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

export function getBulbasaurLeafageBillboards({
  action = null,
  texture = null,
  uvRect = [0, 0, 1, 1],
  getEmitterPosition = () => [0, 0, 0]
} = {}) {
  if (!action || action.phase !== "cast" || !texture || !Array.isArray(action.targetPosition)) {
    return [];
  }

  const castElapsed = Math.max(0, Number(action.castElapsed || 0));
  const progress = clamp01(castElapsed / BULBASAUR_LEAFAGE_CAST_DURATION);
  const emitterPosition = getEmitterPosition();
  const targetPosition = action.targetPosition;
  const streamDirectionX = targetPosition[0] - emitterPosition[0];
  const streamDirectionZ = targetPosition[2] - emitterPosition[2];
  const streamLength = Math.hypot(streamDirectionX, streamDirectionZ) || 1;
  const sideX = -streamDirectionZ / streamLength;
  const sideZ = streamDirectionX / streamLength;
  const billboards = [];

  for (let index = 0; index < BULBASAUR_LEAFAGE_PARTICLE_COUNT; index += 1) {
    const seed = index + 1;
    const pathProgress = (progress * 1.48 + index * 0.041) % 1;
    const lane = ((index % 5) - 2) * BULBASAUR_LEAFAGE_STREAM_WIDTH;
    const sideWobble = Math.sin(castElapsed * 18 + seed * 1.73) * 0.08;
    const pathLift = Math.sin(pathProgress * Math.PI) * BULBASAUR_LEAFAGE_ARC_HEIGHT;
    const baseSize = lerp(
      BULBASAUR_LEAFAGE_PARTICLE_SIZE_MIN,
      BULBASAUR_LEAFAGE_PARTICLE_SIZE_MAX,
      hashUnit(seed + 0.37)
    );
    const fadeIn = clamp01(castElapsed / 0.08);
    const fadeOut = clamp01((BULBASAUR_LEAFAGE_CAST_DURATION - castElapsed) / 0.18);

    billboards.push({
      texture,
      position: [
        emitterPosition[0] +
          (targetPosition[0] - emitterPosition[0]) * pathProgress +
          sideX * (lane + sideWobble),
        emitterPosition[1] +
          (targetPosition[1] - emitterPosition[1]) * pathProgress +
          pathLift +
          (hashUnit(seed + 0.57) - 0.5) * 0.08,
        emitterPosition[2] +
          (targetPosition[2] - emitterPosition[2]) * pathProgress +
          sideZ * (lane + sideWobble)
      ],
      size: [
        baseSize * (0.82 + Math.sin(pathProgress * Math.PI) * 0.62),
        baseSize * (0.82 + hashUnit(seed + 0.77) * 0.5)
      ],
      alpha: fadeIn * fadeOut * (0.72 + hashUnit(seed + 0.91) * 0.28),
      rotation: castElapsed * (2.8 + hashUnit(seed + 1.11) * 3.2) + seed,
      uvRect
    });
  }

  const burstElapsed = castElapsed - BULBASAUR_LEAFAGE_IMPACT_TIME;
  if (burstElapsed >= 0) {
    const burstProgress = clamp01(burstElapsed / BULBASAUR_LEAFAGE_BURST_DURATION);
    const burstRadius = easeOutCubic(burstProgress) * BULBASAUR_LEAFAGE_BURST_RADIUS;
    const burstLift = Math.sin(burstProgress * Math.PI) * 0.24;
    const fade = 1 - burstProgress;

    for (let index = 0; index < BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT; index += 1) {
      const angle = index * 2.39996 + progress * 2.6;
      const radius = burstRadius * (0.32 + (index % 4) * 0.18);
      const size = 0.18 + (index % 3) * 0.04;

      billboards.push({
        texture,
        position: [
          targetPosition[0] + Math.cos(angle) * radius,
          targetPosition[1] + 0.1 + burstLift + (index % 2) * 0.018,
          targetPosition[2] + Math.sin(angle) * radius
        ],
        size: [
          size * (1.1 + burstProgress * 1.35),
          size * (1.1 + Math.sin(burstProgress * Math.PI) * 0.75)
        ],
        alpha: fade * 0.92,
        rotation: angle + burstProgress * 1.8,
        uvRect
      });
    }
  }

  return billboards;
}

export function getCharmanderFireBillboards({
  action = null,
  texture = null,
  uvRect = [0, 0, 1, 1],
  getMouthPosition = () => [0, 0, 0]
} = {}) {
  if (!action || action.phase !== "spray" || !texture) {
    return [];
  }

  const progress = clamp01(action.sprayElapsed / CHARMANDER_FIRE_SPRAY_DURATION);
  const elapsedSeconds = Math.max(0, action.sprayElapsed);
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

  for (let index = 0; index < CHARMANDER_FIRE_PARTICLE_COUNT; index += 1) {
    const seed = index + 1;
    const lifetime = lerp(
      CHARMANDER_FIRE_PARTICLE_LIFETIME_MIN,
      CHARMANDER_FIRE_PARTICLE_LIFETIME_MAX,
      hashUnit(seed + 0.11)
    );
    const life = ((elapsedSeconds + hashUnit(seed + 0.23) * lifetime) % lifetime) /
      lifetime;
    const pathProgress = clamp01(life * (1.08 + hashUnit(seed + 0.37) * 0.22));
    const opacityCurve = clamp01(life / 0.12) * (1 - life);
    const sizeCurve = Math.sin(life * Math.PI);
    const impactStretch = clamp01((pathProgress - 0.68) / 0.32);
    const coneRadius = CHARMANDER_FIRE_CONE_RADIUS * (0.44 + impactStretch * 0.72);
    const noiseTime = elapsedSeconds * 11.2 + seed * 1.91;
    const noiseSide = (
      Math.sin(noiseTime) * CHARMANDER_FIRE_NOISE_STRENGTH +
      Math.sin(noiseTime * 0.57 + seed) * CHARMANDER_FIRE_NOISE_POSITION_AMOUNT
    ) * (0.22 + pathProgress * 0.78);
    const sideOffset = (hashUnit(seed + 0.49) - 0.5) * coneRadius + noiseSide;
    const forwardOffset = (hashUnit(seed + 0.61) - 0.5) *
      CHARMANDER_FIRE_NOISE_POSITION_AMOUNT *
      impactStretch;
    const baseSize = lerp(
      CHARMANDER_FIRE_PARTICLE_SIZE_MIN,
      CHARMANDER_FIRE_PARTICLE_SIZE_MAX,
      hashUnit(seed + 0.73)
    ) * Math.max(0.08, sizeCurve);
    const arcY = mouthPosition[1] +
      (targetPosition[1] - mouthPosition[1]) * pathProgress +
      Math.sin(pathProgress * Math.PI) * CHARMANDER_FIRE_ARC_HEIGHT * 0.32;
    const gravityDrop = pathProgress * pathProgress * 0.08 * CHARMANDER_FIRE_VISUAL_SCALE;
    const y = Math.max(
      targetPosition[1] + 0.06,
      arcY - gravityDrop + (hashUnit(seed + 0.83) - 0.5) * coneRadius * 0.36
    );

    billboards.push({
      texture,
      position: [
        mouthPosition[0] +
          (targetPosition[0] - mouthPosition[0]) * pathProgress +
          sideX * sideOffset +
          forwardX * forwardOffset,
        y,
        mouthPosition[2] +
          (targetPosition[2] - mouthPosition[2]) * pathProgress +
          sideZ * sideOffset +
          forwardZ * forwardOffset
      ],
      size: [
        baseSize * (0.72 + impactStretch * 0.46),
        baseSize * (1.12 + sizeCurve * 0.32)
      ],
      alpha: opacityCurve * (0.84 + hashUnit(seed + 0.97) * 0.16),
      rotation: (hashUnit(seed + 1.09) - 0.5) * Math.PI * 2 +
        Math.sin(noiseTime * 0.42) * CHARMANDER_FIRE_NOISE_ROTATION_AMOUNT +
        lerp(-0.7, 0.7, hashUnit(seed + 1.17)) * life,
      uvRect
    });
  }

  const burstElapsed = action.sprayElapsed - CHARMANDER_FIRE_IMPACT_TIME;

  if (burstElapsed >= 0) {
    const burstProgress = clamp01(burstElapsed / CHARMANDER_FIRE_BURST_DURATION);
    const burstRadius = easeOutCubic(burstProgress) * CHARMANDER_FIRE_BURST_RADIUS;
    const fade = 1 - burstProgress;

    for (let index = 0; index < CHARMANDER_FIRE_BURST_PARTICLE_COUNT; index += 1) {
      const angle = index * 2.39996 + progress * 2.2;
      const radius = burstRadius * (0.28 + (index % 5) * 0.16);
      const size = (0.22 + (index % 3) * 0.045) *
        CHARMANDER_FIRE_VISUAL_SCALE;

      billboards.push({
        texture,
        position: [
          targetPosition[0] + Math.cos(angle) * radius,
          targetPosition[1] + 0.08 + Math.sin(burstProgress * Math.PI) * 0.18,
          targetPosition[2] + Math.sin(angle) * radius
        ],
        size: [
          size * (1.1 + burstProgress * 1.5),
          size * (1.35 + burstProgress * 1.1)
        ],
        alpha: fade * 0.9,
        rotation: angle + burstProgress * 1.2,
        uvRect
      });
    }
  }

  return billboards;
}
