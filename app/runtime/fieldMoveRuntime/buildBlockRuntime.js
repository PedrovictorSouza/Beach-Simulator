import { TIMBURR_BUILD_BLOCK_STAND_DISTANCE } from "./fieldMoveTuning.js";

function normalizeBuildBlockApproachDirection(targetPosition, sourcePosition) {
  if (!Array.isArray(sourcePosition)) {
    return null;
  }

  const deltaX = Number(sourcePosition?.[0] || 0) - Number(targetPosition?.[0] || 0);
  const deltaZ = Number(sourcePosition?.[2] || 0) - Number(targetPosition?.[2] || 0);
  const distance = Math.hypot(deltaX, deltaZ);

  if (distance < 0.001) {
    return null;
  }

  return [deltaX / distance, deltaZ / distance];
}

function addUniqueBuildBlockApproachDirection(directions, direction) {
  if (!Array.isArray(direction)) {
    return;
  }

  const key = `${direction[0].toFixed(3)}:${direction[1].toFixed(3)}`;
  if (directions.some((entry) => entry.key === key)) {
    return;
  }

  directions.push({ key, direction });
}

function buildBuildBlockApproachDirections(preferredDirection) {
  const directions = [];
  addUniqueBuildBlockApproachDirection(directions, preferredDirection);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[1], preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [preferredDirection[1], -preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[0], -preferredDirection[1]]);
  addUniqueBuildBlockApproachDirection(directions, [1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [-1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [0, 1]);
  addUniqueBuildBlockApproachDirection(directions, [0, -1]);
  return directions;
}

export function resolveTimburrBuildBlockApproachPosition({
  targetPosition,
  timburrPosition = null,
  playerPosition = null,
  standDistance = TIMBURR_BUILD_BLOCK_STAND_DISTANCE,
  isBlocked = null
} = {}) {
  if (!Array.isArray(targetPosition)) {
    return null;
  }

  const fallbackPosition = Array.isArray(playerPosition) ? playerPosition : [0, 0.04, 0];
  const preferredDirection =
    normalizeBuildBlockApproachDirection(targetPosition, timburrPosition) ||
    normalizeBuildBlockApproachDirection(targetPosition, fallbackPosition) ||
    [0, 1];
  const directions = buildBuildBlockApproachDirections(preferredDirection);
  const resolvedStandDistance = Math.max(0, Number(standDistance) || 0);
  const candidates = directions.map(({ direction }) => ([
    Number(targetPosition[0] || 0) + direction[0] * resolvedStandDistance,
    0.04,
    Number(targetPosition[2] || 0) + direction[1] * resolvedStandDistance
  ]));

  if (typeof isBlocked !== "function") {
    return candidates[0] || null;
  }

  return candidates.find((candidate) => !isBlocked(candidate)) || candidates[0] || null;
}

export function resolveConstructionDisplacementPosition({
  targetPosition,
  playerPosition,
  cellSize = 1,
  isBlocked = null
} = {}) {
  if (!Array.isArray(targetPosition) || !Array.isArray(playerPosition)) {
    return null;
  }

  const preferredDirection =
    normalizeBuildBlockApproachDirection(targetPosition, playerPosition) ||
    [0, 1];
  const directions = buildBuildBlockApproachDirections(preferredDirection);
  const resolvedCellSize = Math.max(0.1, Number(cellSize) || 1);
  const distances = [
    resolvedCellSize,
    resolvedCellSize * Math.SQRT2,
    resolvedCellSize * 2
  ];

  const candidates = [];
  for (const distance of distances) {
    for (const { direction } of directions) {
      candidates.push([
        Number(targetPosition[0] || 0) + direction[0] * distance,
        Number(playerPosition[1] || 0.04),
        Number(targetPosition[2] || 0) + direction[1] * distance
      ]);
    }
  }

  if (typeof isBlocked !== "function") {
    return candidates[0] || null;
  }

  return candidates.find((candidate) => !isBlocked(candidate)) || candidates[0] || null;
}
