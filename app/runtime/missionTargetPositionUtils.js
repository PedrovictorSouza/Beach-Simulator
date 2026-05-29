const DEFAULT_MISSION_TARGET_POSITION_DEDUPE_DISTANCE = 0.45;

export function isMissionTargetPosition(position) {
  return Array.isArray(position) &&
    position.length >= 3 &&
    Number.isFinite(Number(position[0])) &&
    Number.isFinite(Number(position[1])) &&
    Number.isFinite(Number(position[2]));
}

export function normalizeMissionTargetPositions(targetPositions) {
  if (!targetPositions) {
    return [];
  }

  if (isMissionTargetPosition(targetPositions)) {
    return [targetPositions];
  }

  if (!Array.isArray(targetPositions)) {
    return [];
  }

  return targetPositions.filter(isMissionTargetPosition);
}

export function addUniqueMissionTargetPosition(
  targetPositions,
  targetPosition,
  {
    dedupeDistance = DEFAULT_MISSION_TARGET_POSITION_DEDUPE_DISTANCE
  } = {}
) {
  if (!Array.isArray(targetPositions) || !isMissionTargetPosition(targetPosition)) {
    return;
  }

  const resolvedDedupeDistance = Math.max(0, Number(dedupeDistance) || 0);
  const dedupeDistanceSq = resolvedDedupeDistance * resolvedDedupeDistance;

  const hasDuplicate = targetPositions.some((existingPosition) => {
    const deltaX = existingPosition[0] - targetPosition[0];
    const deltaY = existingPosition[1] - targetPosition[1];
    const deltaZ = existingPosition[2] - targetPosition[2];

    return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ <= dedupeDistanceSq;
  });

  if (!hasDuplicate) {
    targetPositions.push(targetPosition);
  }
}

export function addUniqueMissionTargetPositions(
  targetPositions,
  candidatePositions,
  options = {}
) {
  for (const targetPosition of normalizeMissionTargetPositions(candidatePositions)) {
    addUniqueMissionTargetPosition(targetPositions, targetPosition, options);
  }
}