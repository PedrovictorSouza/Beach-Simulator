function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function easeOutCubic(value) {
  const progress = clamp01(value);
  return 1 - Math.pow(1 - progress, 3);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

export function updateSolarStationSpawnEffect(instance, deltaTime) {
  const effect = instance?.solarStationSpawnEffect;

  if (!effect || instance.active === false) {
    return;
  }

  effect.elapsed = Math.min(effect.duration, Number(effect.elapsed || 0) + deltaTime);
  const progress = easeOutCubic(effect.elapsed / Math.max(0.001, effect.duration));
  const groundY = Number.isFinite(effect.groundY) ? effect.groundY : Number(instance.offset?.[1] || 0.02);

  instance.scale = lerp(effect.fromScale, effect.toScale, progress);
  instance.alpha = lerp(effect.fromAlpha, effect.toAlpha, progress);
  instance.offset = [
    instance.offset?.[0] || 0,
    groundY + lerp(effect.fromYOffset, effect.toYOffset, progress),
    instance.offset?.[2] || 0
  ];
  instance.tint = [1, 1.14, 0.72];
  instance.tintStrength = lerp(0.34, 0, progress);

  if (progress >= 1) {
    instance.scale = effect.toScale;
    instance.alpha = effect.toAlpha;
    instance.offset[1] = groundY;
    instance.tintStrength = 0;
    instance.solarStationSpawnEffect = null;
  }
}

export function advancePlayerPlacementSpawnEffect(placement, deltaTime) {
  const effect = placement?.spawnEffect;
  if (!effect) {
    return null;
  }

  effect.elapsed = Math.min(
    Number(effect.duration || 0.82),
    Number(effect.elapsed || 0) + Math.max(0, Number(deltaTime) || 0)
  );

  const duration = Math.max(0.001, Number(effect.duration || 0.82));
  const progress = easeOutCubic(effect.elapsed / duration);
  const pose = {
    progress,
    scale: lerp(Number(effect.fromScale ?? 0.18), Number(effect.toScale ?? 1), progress),
    yOffset: lerp(Number(effect.fromYOffset ?? 0.54), Number(effect.toYOffset ?? 0), progress),
    alpha: lerp(Number(effect.fromAlpha ?? 0.08), Number(effect.toAlpha ?? 1), progress)
  };

  if (progress >= 1) {
    placement.spawnEffect = null;
  }

  return pose;
}

export function applyPlayerPlacementSpawnToBillboard(placement, billboard, deltaTime) {
  const pose = advancePlayerPlacementSpawnEffect(placement, deltaTime);
  if (!pose || !billboard) {
    return billboard;
  }

  return {
    ...billboard,
    position: [
      billboard.position[0],
      billboard.position[1] + pose.yOffset,
      billboard.position[2]
    ],
    size: Array.isArray(billboard.size) ?
      [
        billboard.size[0] * pose.scale,
        billboard.size[1] * pose.scale
      ] :
      billboard.size,
    alpha: (billboard.alpha ?? billboard.opacity ?? 1) * pose.alpha
  };
}

export function applyPlayerPlacementSpawnToModelInstance(placement, instance, {
  baseScale,
  groundY,
  deltaTime
} = {}) {
  const pose = advancePlayerPlacementSpawnEffect(placement, deltaTime);
  if (!pose || !instance) {
    return false;
  }

  const resolvedGroundY = Number.isFinite(groundY) ? groundY : Number(instance.offset?.[1] || 0.02);
  const resolvedBaseScale = Number.isFinite(baseScale) ? baseScale : Number(instance.scale || 1);
  instance.scale = resolvedBaseScale * pose.scale;
  instance.offset = [
    instance.offset?.[0] || 0,
    resolvedGroundY + pose.yOffset,
    instance.offset?.[2] || 0
  ];
  instance.alpha = pose.alpha;
  instance.tint = [1, 1.14, 0.72];
  instance.tintStrength = lerp(0.34, 0, pose.progress);
  return true;
}
