import { FIELD_MOVE_INVALID_GROUND_CELL_RADIUS_FACTOR } from "../gameplayPresentationTuning.js";
import {
  BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION,
  BOULDER_SHADED_TALL_GRASS_RADIUS
} from "../../../gameplayContent.js";

export const BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT = 10;
export const BOULDER_SHADED_TALL_GRASS_TASK_ID = "boulder-shaded-tall-grass";
export const GROW_FIRST_HABITAT_TASK_ID = "grow-first-habitat";
export const GROW_FIRST_HABITAT_OBJECTIVE_ID = "grow-four-plants";
export const GROW_FIRST_HABITAT_MARKED_CELL_COUNT = 4;

const FREE_ROAM_RESTORATION_GRID_RADIUS_FACTOR = 3.2;
const FREE_ROAM_RESTORATION_GRID_MAX_CELLS = 24;

export function hasGroundPatchForCellId({
  cellId,
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  if (typeof cellId !== "string") {
    return false;
  }

  return [
    ...(groundGrassPatches || []),
    ...(groundFlowerPatches || [])
  ].some((patch) => patch?.cellId === cellId);
}

export function isDryGrassHydroMissionActive(activeQuest, storyState = {}, playerSkills = {}) {
  const flags = storyState?.flags || {};
  const restoredGrassCount = Number(flags.restoredGrassCount || 0);
  const activeDryGrassQuest = activeQuest?.id === "water-dry-grass";
  const activeBulbasaurDryGrassRequest =
    flags.bulbasaurDryGrassMissionAccepted &&
    !flags.bulbasaurDryGrassMissionComplete &&
    restoredGrassCount < BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT;

  return Boolean(
    playerSkills?.waterGun &&
    (
      activeDryGrassQuest ||
      activeBulbasaurDryGrassRequest
    )
  );
}

export function findNearbyFeedbackGroundCell(playerPosition, groundCells = []) {
  if (!Array.isArray(playerPosition) || !Array.isArray(groundCells)) {
    return null;
  }

  let nearestGroundCell = null;
  let nearestDistance = Infinity;

  for (const groundCell of groundCells) {
    if (
      !groundCell ||
      groundCell.active === false ||
      !Array.isArray(groundCell.offset)
    ) {
      continue;
    }

    const deltaX = playerPosition[0] - groundCell.offset[0];
    const deltaZ = playerPosition[2] - groundCell.offset[2];
    const distance = Math.hypot(deltaX, deltaZ);
    const interactDistance =
      (groundCell.tileSpan || groundCell.size?.[0] || 1) *
      FIELD_MOVE_INVALID_GROUND_CELL_RADIUS_FACTOR;

    if (distance <= interactDistance && distance < nearestDistance) {
      nearestGroundCell = groundCell;
      nearestDistance = distance;
    }
  }

  return nearestGroundCell;
}

export function isFreeRoamRestorationGroundCellCandidate(groundCell) {
  return Boolean(
    groundCell &&
    groundCell.active !== false &&
    Array.isArray(groundCell.offset) &&
    !groundCell.terrainLayer &&
    !groundCell.terrainStackHeight
  );
}

export function buildFreeRoamRestorationGroundCells(playerPosition, groundCells = [], abilityId = null) {
  if (!Array.isArray(playerPosition) || !Array.isArray(groundCells) || !abilityId) {
    return [];
  }

  return groundCells
    .filter(isFreeRoamRestorationGroundCellCandidate)
    .map((groundCell) => {
      const tileSpan = groundCell.tileSpan || groundCell.size?.[0] || 1;
      const maxDistance = tileSpan * FREE_ROAM_RESTORATION_GRID_RADIUS_FACTOR;
      const deltaX = playerPosition[0] - groundCell.offset[0];
      const deltaZ = playerPosition[2] - groundCell.offset[2];
      const distance = Math.hypot(deltaX, deltaZ);
      return {
        distance,
        groundCell,
        maxDistance
      };
    })
    .filter(({ distance, maxDistance }) => distance <= maxDistance)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, FREE_ROAM_RESTORATION_GRID_MAX_CELLS)
    .map(({ groundCell }) => ({
      ...groundCell,
      highlightTargetState: "valid",
      highlightAbilityId: abilityId
    }));
}

export function getFreeRoamRestorationGroundCells({
  playerPosition,
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false,
  groundDeadInstances = [],
  groundPurifiedInstances = [],
  iceGroundInstances = [],
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  if (fireEquipped) {
    return buildFreeRoamRestorationGroundCells(playerPosition, iceGroundInstances, "fire");
  }

  if (leafageEquipped) {
    return buildFreeRoamRestorationGroundCells(
      playerPosition,
      (groundPurifiedInstances || []).filter((groundCell) => {
        return hasGroundPatchForCellId({
          cellId: groundCell?.id,
          groundFlowerPatches,
          groundGrassPatches
        });
      }),
      "leafage"
    );
  }

  if (waterGunEquipped) {
    return buildFreeRoamRestorationGroundCells(playerPosition, groundDeadInstances, "waterGun");
  }

  return [];
}

export function hasGrowFirstHabitatObjective(task = null) {
  return (task?.objectives || []).some((objective) => {
    return objective?.id === GROW_FIRST_HABITAT_OBJECTIVE_ID;
  });
}

export function isGrowFirstHabitatTaskActive(...tasks) {
  return tasks.some((task) => {
    return task?.id === GROW_FIRST_HABITAT_TASK_ID ||
      hasGrowFirstHabitatObjective(task);
  });
}

export function getGrowFirstHabitatMarkedCellCount(storyState = {}) {
  const grownCount = Math.max(0, Math.trunc(Number(storyState?.flags?.leafageTallGrassCount || 0)));
  return Math.max(0, GROW_FIRST_HABITAT_MARKED_CELL_COUNT - grownCount);
}

export function getGrowFirstHabitatTaskGroundCells({
  activeQuest = null,
  activeSystemQuest = null,
  activeTask = null,
  storyState = {},
  referencePosition = null,
  groundPurifiedInstances = [],
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  if (!isGrowFirstHabitatTaskActive(activeQuest, activeSystemQuest, activeTask)) {
    return [];
  }

  const remainingCellCount = getGrowFirstHabitatMarkedCellCount(storyState);
  if (remainingCellCount <= 0 || !Array.isArray(referencePosition)) {
    return [];
  }

  return (groundPurifiedInstances || [])
    .filter(isFreeRoamRestorationGroundCellCandidate)
    .filter((groundCell) => !hasGroundPatchForCellId({
      cellId: groundCell?.id,
      groundFlowerPatches,
      groundGrassPatches
    }))
    .map((groundCell) => {
      const deltaX = groundCell.offset[0] - referencePosition[0];
      const deltaZ = groundCell.offset[2] - referencePosition[2];
      return {
        distance: Math.hypot(deltaX, deltaZ),
        groundCell
      };
    })
    .sort((left, right) => left.distance - right.distance)
    .slice(0, remainingCellCount)
    .map(({ groundCell }) => ({
      ...groundCell,
      highlightTargetState: "leafage",
      highlightAbilityId: "leafage"
    }));
}

export function isBoulderShadedTallGrassTaskActive(storyState = {}) {
  const flags = storyState.flags || {};
  const trackedTaskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];
  const taskTracked =
    !Array.isArray(flags.trackedTaskIds) ||
    trackedTaskIds.includes(BOULDER_SHADED_TALL_GRASS_TASK_ID);

  return Boolean(
    taskTracked &&
    flags.boulderChallengeAvailable &&
    !flags.boulderShadedTallGrassHabitatCreated &&
    !flags.boulderChallengeRewardClaimed
  );
}

export function getBoulderShadedGroundCellDistanceEntries({
  groundCells = [],
  boulderPosition,
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  return (groundCells || [])
    .filter(isFreeRoamRestorationGroundCellCandidate)
    .filter((groundCell) => !hasGroundPatchForCellId({
      cellId: groundCell?.id,
      groundFlowerPatches,
      groundGrassPatches
    }))
    .map((groundCell) => {
      const deltaX = groundCell.offset[0] - boulderPosition[0];
      const deltaZ = groundCell.offset[2] - boulderPosition[2];
      return {
        distance: Math.hypot(deltaX, deltaZ),
        groundCell
      };
    })
    .filter(({ distance }) => distance <= BOULDER_SHADED_TALL_GRASS_RADIUS)
    .sort((left, right) => left.distance - right.distance);
}

export function getBoulderShadedTaskGroundCells({
  storyState = {},
  boulderPosition = null,
  challengeBoulder = null,
  groundDeadInstances = [],
  groundPurifiedInstances = [],
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  if (!isBoulderShadedTallGrassTaskActive(storyState)) {
    return [];
  }

  const resolvedBoulderPosition =
    boulderPosition ||
    challengeBoulder?.position ||
    BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION;

  const sharedOptions = {
    boulderPosition: resolvedBoulderPosition,
    groundFlowerPatches,
    groundGrassPatches
  };
  const waterGunGroundCells = getBoulderShadedGroundCellDistanceEntries({
    ...sharedOptions,
    groundCells: groundDeadInstances
  }).map(({ groundCell }) => ({
    ...groundCell,
    highlightTargetState: "valid",
    highlightAbilityId: "waterGun"
  }));
  const leafageGroundCells = getBoulderShadedGroundCellDistanceEntries({
    ...sharedOptions,
    groundCells: groundPurifiedInstances
  }).map(({ groundCell }) => ({
    ...groundCell,
    highlightTargetState: "valid",
    highlightAbilityId: "leafage"
  }));

  return [
    ...waterGunGroundCells,
    ...leafageGroundCells
  ];
}

export function findAlreadyResolvedFieldMoveGroundCell(playerPosition, {
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false,
  groundDeadInstances = [],
  groundPurifiedInstances = [],
  groundFlowerPatches = [],
  groundGrassPatches = []
} = {}) {
  if (waterGunEquipped) {
    return findNearbyFeedbackGroundCell(
      playerPosition,
      groundPurifiedInstances
    );
  }

  if (leafageEquipped) {
    return findNearbyFeedbackGroundCell(
      playerPosition,
      (groundPurifiedInstances || []).filter((groundCell) => {
        return hasGroundPatchForCellId({
          cellId: groundCell?.id,
          groundFlowerPatches,
          groundGrassPatches
        });
      })
    );
  }

  if (fireEquipped) {
    return findNearbyFeedbackGroundCell(
      playerPosition,
      groundDeadInstances
    );
  }

  return null;
}
