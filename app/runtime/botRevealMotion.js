const clamp01Default = (value) => Math.min(1, Math.max(0, value));

export function getBotRevealLandingPosition(encounter) {
  if (!encounter || !Array.isArray(encounter.repairPosition)) {
    return null;
  }

  return [...encounter.repairPosition];
}

export function getBotRevealOriginPosition({
  encounter,
  getRepairBoxPosition = () => null,
  fallHeight = 0
} = {}) {
  const boxPosition = getRepairBoxPosition(encounter);
  const landingPosition = getBotRevealLandingPosition(encounter);
  const originBase = Array.isArray(boxPosition) ? boxPosition : landingPosition;

  if (!originBase) {
    return null;
  }

  return [
    originBase[0],
    originBase[1] + fallHeight,
    originBase[2]
  ];
}

export function revealBotAtRepairPosition({
  encounter,
  falling = false,
  getRepairBoxPosition = () => null,
  fallHeight = 0
} = {}) {
  const landingPosition = getBotRevealLandingPosition(encounter);

  if (!landingPosition) {
    return false;
  }

  const originPosition = falling ?
    getBotRevealOriginPosition({
      encounter,
      getRepairBoxPosition,
      fallHeight
    }) :
    null;

  encounter.visible = true;
  encounter.jumpTimer = 0;
  encounter.originPosition = originPosition;
  encounter.landingPosition = falling && originPosition ? landingPosition : null;
  encounter.position = originPosition ? [...originPosition] : landingPosition;
  return true;
}

export function isRevealBoxBotVisible(opening) {
  return Boolean(opening?.botVisible || opening?.bulbasaurVisible);
}

export function setRevealBoxBotVisible(opening) {
  if (!opening) {
    return;
  }

  opening.botVisible = true;
  opening.bulbasaurVisible = true;
}

export function updateBotRevealFall({
  opening,
  encounter,
  progress,
  clamp01 = clamp01Default,
  defaultVisibleProgress = 0,
  defaultFallEndProgress = 1
} = {}) {
  if (!isRevealBoxBotVisible(opening) || !encounter?.originPosition || !encounter?.landingPosition) {
    return;
  }

  const fallStart = clamp01(
    Number(opening.visibleProgress ?? defaultVisibleProgress)
  );
  const fallEnd = clamp01(
    Number(opening.fallEndProgress ?? defaultFallEndProgress)
  );
  const fallProgress = clamp01((progress - fallStart) / Math.max(0.001, fallEnd - fallStart));
  const easedProgress = fallProgress * fallProgress;
  const landingBounce = Math.sin(fallProgress * Math.PI) * 0.16;

  encounter.position = [
    encounter.originPosition[0] +
      (encounter.landingPosition[0] - encounter.originPosition[0]) * easedProgress,
    encounter.originPosition[1] +
      (encounter.landingPosition[1] - encounter.originPosition[1]) * easedProgress +
      landingBounce,
    encounter.originPosition[2] +
      (encounter.landingPosition[2] - encounter.originPosition[2]) * easedProgress
  ];

  if (fallProgress >= 1) {
    encounter.position = [...encounter.landingPosition];
    encounter.originPosition = null;
    encounter.landingPosition = null;
  }
}
