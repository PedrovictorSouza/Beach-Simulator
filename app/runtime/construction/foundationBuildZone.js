import {
  getFoundationBuildZoneCellKeys,
  normalizeFoundationBuildZoneOriginCell
} from "./placementGeometry.js";

export function hasFoundationWallObjective(quest = null) {
  return (quest?.objectives || []).some((objective) => {
    return objective?.targetId === "foundation-wall";
  });
}

export function shouldShowFoundationBuildZone({
  activeQuest = null,
  activeSystemQuest = null
} = {}) {
  return activeQuest?.id === "build-first-base" ||
    activeSystemQuest?.id === "build-first-base" ||
    hasFoundationWallObjective(activeQuest) ||
    hasFoundationWallObjective(activeSystemQuest);
}

export function isFoundationFreeBlockAllowedInZone({
  instance = null,
  buildZone = null,
  buildState = null
} = {}) {
  if (!instance?.freeBlockCell || !buildZone) {
    return false;
  }

  const zoneCellKeys = getFoundationBuildZoneCellKeys(buildZone);
  const cell = instance.freeBlockCell;
  if (!zoneCellKeys.has(`${cell.x}:${cell.y}`)) {
    return false;
  }

  return Boolean(buildState?.getBlockAtCell?.(cell));
}

export function getFoundationBuildZoneProgressCount({
  progress = null,
  buildZone = null,
  floorBlocks = []
} = {}) {
  if (Number(progress?.completedCount) > 0) {
    return progress.completedCount;
  }

  const zoneCellKeys = getFoundationBuildZoneCellKeys(buildZone);
  return (floorBlocks || [])
    .filter((block) => {
      const cell = block?.cell || block;
      return zoneCellKeys.has(`${cell?.x}:${cell?.y}`);
    })
    .length;
}

export function canStackFreeBlockPlacement({ progress = null } = {}) {
  return Boolean(progress?.complete);
}

export function getSavedFoundationBuildZoneOriginCell({
  flags = null,
  originFlag = "builderTutorialFoundationOriginCell",
  defaultOriginCell = { x: 0, y: 0 }
} = {}) {
  return normalizeFoundationBuildZoneOriginCell(
    flags?.[originFlag],
    defaultOriginCell
  );
}

export function saveFoundationBuildZoneOriginCell({
  flags = null,
  originCell = null,
  originFlag = "builderTutorialFoundationOriginCell",
  defaultOriginCell = { x: 0, y: 0 }
} = {}) {
  if (!flags) {
    return null;
  }

  const normalizedOrigin = normalizeFoundationBuildZoneOriginCell(
    originCell,
    defaultOriginCell
  );
  flags[originFlag] = {
    x: normalizedOrigin.x,
    y: normalizedOrigin.y
  };
  return flags[originFlag];
}

export function createUnavailableFoundationBuildZonePlacementResult({
  blockType = "wall",
  targetCell = null
} = {}) {
  return {
    placed: false,
    reason: "blocked-cell",
    blockType,
    block: null,
    targetCell
  };
}

export function createUnavailableFoundationBuildZoneValidation({
  targetCell = null
} = {}) {
  return {
    valid: false,
    reason: "blocked-cell",
    targetCell
  };
}
