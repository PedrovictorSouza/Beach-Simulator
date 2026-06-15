import {
  TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE,
  TIMBURR_BUILD_BLOCK_CAST_DURATION,
  TIMBURR_BUILD_BLOCK_IMPACT_TIME,
  TIMBURR_BUILD_BLOCK_SPEED,
  TIMBURR_BUILD_BLOCK_STAND_DISTANCE
} from "./fieldMoveTuning.js";

const NOOP = () => {};

const DEFAULT_CONFIG = Object.freeze({
  arriveDistance: TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE,
  castDuration: TIMBURR_BUILD_BLOCK_CAST_DURATION,
  impactTime: TIMBURR_BUILD_BLOCK_IMPACT_TIME,
  speed: TIMBURR_BUILD_BLOCK_SPEED
});

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

export function createBuildBlockRuntime({
  session = {},
  controls = {},
  getTimburr = () => session.timburrEncounter,
  resolveTarget = () => null,
  getApproachPosition = ({ targetPosition }) => targetPosition,
  getApproachBlockers = () => [],
  shouldCastFromBlockedApproach = () => false,
  tryMoveCompanionToPosition = () => false,
  getModelYawToward = () => 0,
  applyImpact = NOOP,
  onBlocked = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function startAction({ playerPosition } = {}) {
    const timburr = getTimburr();

    if (session.timburrBuildBlockAction) {
      return "busy";
    }

    if (!controls.playerSkills?.buildBlock || !controls.storyState?.flags?.timburrRevealed) {
      return "locked";
    }

    if (
      !timburr ||
      !timburr.visible ||
      !Array.isArray(timburr.position)
    ) {
      return "unavailable";
    }

    const target = resolveTarget(playerPosition);
    if (!target) {
      return "unavailable";
    }
    if (!target.valid) {
      session.lastTimburrBuildBlockInvalidReason = target.reason || "invalid";
      return target.reason === "missing-material" ? "missing-material" : "invalid";
    }

    session.lastTimburrBuildBlockInvalidReason = null;
    const approachPosition = getApproachPosition({
      targetPosition: target.targetPosition,
      playerPosition,
      timburr
    });
    const approachBlockers = getApproachBlockers(approachPosition);
    const castFromBlockedApproach = shouldCastFromBlockedApproach(approachBlockers);

    session.timburrBuildBlockAction = {
      phase: castFromBlockedApproach ? "cast" : "approach",
      targetCell: target.targetCell,
      targetPosition: target.targetPosition,
      approachPosition,
      castElapsed: 0,
      impactApplied: false,
      castFromBlockedApproach
    };

    return "started";
  }

  function clearAction() {
    session.timburrBuildBlockAction = null;
  }

  function updateAction(deltaTime, now) {
    const action = session.timburrBuildBlockAction;
    const timburr = getTimburr();

    if (!action || !timburr) {
      return;
    }

    if (!Array.isArray(timburr.position)) {
      timburr.position = [...action.approachPosition];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - timburr.position[0];
      const deltaZ = action.approachPosition[2] - timburr.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(settings.speed * deltaTime, distance);

      if (distance > settings.arriveDistance && travel > 0) {
        const previousPosition = [...timburr.position];
        const nextPosition = [
          timburr.position[0] + (deltaX / distance) * travel,
          0.04,
          timburr.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(timburr, nextPosition)) {
          const nextPositionBlockers = getApproachBlockers(nextPosition);
          if (shouldCastFromBlockedApproach(nextPositionBlockers)) {
            action.phase = "cast";
            action.castElapsed = 0;
            action.castFromBlockedApproach = true;
            return;
          }
          clearAction();
          onBlocked();
          return;
        }
        if (timburr.modelInstance) {
          timburr.modelInstance.yaw = getModelYawToward(
            previousPosition,
            timburr.position,
            Number(timburr.modelFaceYawOffset ?? config.modelFaceYawOffset ?? 0)
          );
        }
      } else {
        const approachBlockers = getApproachBlockers(action.approachPosition);
        if (approachBlockers.length > 0) {
          if (shouldCastFromBlockedApproach(approachBlockers)) {
            action.phase = "cast";
            action.castElapsed = 0;
            action.castFromBlockedApproach = true;
            return;
          }
          clearAction();
          onBlocked();
          return;
        }

        timburr.position = [...action.approachPosition];
        action.phase = "cast";
        action.castElapsed = 0;
      }

      return;
    }

    if (action.phase !== "cast") {
      clearAction();
      return;
    }

    action.castElapsed += deltaTime;

    if (!action.impactApplied && action.castElapsed >= settings.impactTime) {
      action.impactApplied = true;
      applyImpact(action, now);
    }

    if (action.castElapsed >= settings.castDuration) {
      clearAction();
    }
  }

  return {
    startAction,
    updateAction
  };
}
