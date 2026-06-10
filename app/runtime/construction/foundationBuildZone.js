import { createRectangularFreeBlockBuildZone } from "../../gameplay/freeBlockBuildSystem.js";
import {
  buildFoundationBuildZoneCandidateOrigins as buildFoundationBuildZoneCandidateOriginsWithConfig,
  createFoundationBuildZoneBlockerRect,
  doFoundationBuildZoneRectsOverlap,
  getFoundationBuildZoneCellKeys,
  getFoundationBuildZoneSignature,
  isFoundationBuildZoneOriginInsideGrid,
  normalizeFoundationBuildZoneOriginCell
} from "./placementGeometry.js";

export const BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL = Object.freeze({ x: 110, y: 100 });
export const BUILDER_TUTORIAL_FOUNDATION_WIDTH = 6;
export const BUILDER_TUTORIAL_FOUNDATION_HEIGHT = 4;
const BUILDER_TUTORIAL_FOUNDATION_SEARCH_RADIUS = 16;
const BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG = "builderTutorialFoundationOriginCell";
export const BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL = Object.freeze({
  x: Math.round(BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL.x - BUILDER_TUTORIAL_FOUNDATION_WIDTH / 2),
  y: Math.round(BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL.y - BUILDER_TUTORIAL_FOUNDATION_HEIGHT / 2)
});

export function createBuilderTutorialFoundationBuildZone(
  originCell = BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL
) {
  const zone = createRectangularFreeBlockBuildZone({
    id: "builder-tutorial-foundation",
    originCell,
    width: BUILDER_TUTORIAL_FOUNDATION_WIDTH,
    height: BUILDER_TUTORIAL_FOUNDATION_HEIGHT
  });

  return Object.freeze({
    ...zone,
    borderCells: zone.cells
  });
}

export function getBuilderTutorialFoundationZoneSignature(buildZone = null) {
  return getFoundationBuildZoneSignature(buildZone);
}

export function buildBuilderTutorialFoundationCandidateOrigins() {
  return buildFoundationBuildZoneCandidateOriginsWithConfig({
    defaultOriginCell: BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL,
    searchRadius: BUILDER_TUTORIAL_FOUNDATION_SEARCH_RADIUS
  });
}

export function isBuilderTutorialFoundationOriginInsideGrid({
  originCell = null,
  gridConfig = null
} = {}) {
  return isFoundationBuildZoneOriginInsideGrid({
    originCell,
    width: BUILDER_TUTORIAL_FOUNDATION_WIDTH,
    height: BUILDER_TUTORIAL_FOUNDATION_HEIGHT,
    gridConfig
  });
}

export function getSavedBuilderTutorialFoundationOriginCell({
  flags = null
} = {}) {
  return getSavedFoundationBuildZoneOriginCell({
    flags,
    originFlag: BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG,
    defaultOriginCell: BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL
  });
}

export function saveBuilderTutorialFoundationOriginCell({
  flags = null,
  originCell = null
} = {}) {
  return saveFoundationBuildZoneOriginCell({
    flags,
    originCell,
    originFlag: BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG,
    defaultOriginCell: BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL
  });
}

export function resolveActiveBuilderTutorialFoundationBuildZone({
  savedOriginCell = BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL,
  getFoundationProgressCount = () => 0,
  isBuildZoneBlocked = () => true,
  findAvailableBuildZone = () => null
} = {}) {
  let buildZone = createBuilderTutorialFoundationBuildZone(savedOriginCell);
  const hasFoundationProgress = getFoundationProgressCount(buildZone) > 0;

  if (!isBuildZoneBlocked(buildZone)) {
    return {
      buildZone,
      unavailable: false,
      originCellToSave: buildZone.originCell
    };
  }

  if (!hasFoundationProgress) {
    const availableZone = findAvailableBuildZone();
    if (availableZone) {
      buildZone = availableZone;
      return {
        buildZone,
        unavailable: false,
        originCellToSave: buildZone.originCell
      };
    }
  }

  return {
    buildZone,
    unavailable: true,
    originCellToSave: null
  };
}

export function findAvailableBuilderTutorialFoundationBuildZone({
  gridConfig = null,
  candidateOrigins = buildBuilderTutorialFoundationCandidateOrigins(),
  isBuildZoneBlocked = () => true
} = {}) {
  for (const originCell of candidateOrigins || []) {
    if (!isBuilderTutorialFoundationOriginInsideGrid({ originCell, gridConfig })) {
      continue;
    }

    const candidateZone = createBuilderTutorialFoundationBuildZone(originCell);
    if (!isBuildZoneBlocked(candidateZone)) {
      return candidateZone;
    }
  }

  return null;
}

function pushFoundationBuildZoneBlocker(blockers, blocker) {
  if (blocker) {
    blockers.push(blocker);
  }
}

export function buildFoundationBuildZoneBlockers({
  terrainColliders = [],
  freeBlockInstances = [],
  isFoundationFreeBlockAllowed = () => false,
  worldObjectBlockers = [],
  playerPosition = null,
  npcActors = [],
  isNpcActive = () => true,
  getActorPosition = (actor) => actor?.position || null,
  interactables = [],
  isInteractableActive = () => true,
  companions = [],
  resourceNodes = [],
  isResourceNodeActive = () => true,
  drops = [],
  groundPatches = []
} = {}) {
  const blockers = [];

  for (const collider of terrainColliders || []) {
    if (collider?.kind === "freeBlock") {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: collider?.id,
      kind: collider?.kind,
      position: collider?.position,
      size: [collider?.size?.[0], collider?.size?.[2]]
    }));
  }

  for (const instance of freeBlockInstances || []) {
    if (
      instance?.active === false ||
      !Array.isArray(instance?.offset) ||
      isFoundationFreeBlockAllowed(instance)
    ) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: instance.id ? `free-block:${instance.id}` : "free-block",
      kind: "freeBlock",
      position: instance.offset,
      size: [1, 1]
    }));
  }

  for (const blocker of worldObjectBlockers || []) {
    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect(blocker));
  }

  pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
    id: "player",
    kind: "player",
    position: playerPosition,
    radius: 0.55
  }));

  for (const npcActor of npcActors || []) {
    if (isNpcActive(npcActor) === false) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: npcActor?.id ? `npc:${npcActor.id}` : "npc",
      kind: "npc",
      position: getActorPosition(npcActor),
      radius: 0.72
    }));
  }

  for (const interactable of interactables || []) {
    if (isInteractableActive(interactable) === false) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: interactable?.id ? `interactable:${interactable.id}` : "interactable",
      kind: "interactable",
      position: interactable?.position,
      radius: Number(interactable?.interactDistance) || 1.1
    }));
  }

  for (const companion of companions || []) {
    if (companion?.visible === false) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: companion?.id ? `companion:${companion.id}` : "companion",
      kind: "companion",
      position: companion?.position || companion?.repairPosition || null,
      radius: 0.72
    }));
  }

  for (const resourceNode of resourceNodes || []) {
    if (isResourceNodeActive(resourceNode) === false) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: resourceNode?.id ? `resource:${resourceNode.id}` : "resource",
      kind: "resource",
      position: resourceNode?.position,
      radius: 0.72
    }));
  }

  for (const drop of drops || []) {
    if (drop?.collected) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: drop?.id ? `drop:${drop.id}` : "drop",
      kind: "drop",
      position: drop?.position,
      radius: 0.42
    }));
  }

  for (const patch of groundPatches || []) {
    if (!Array.isArray(patch?.position)) {
      continue;
    }

    pushFoundationBuildZoneBlocker(blockers, createFoundationBuildZoneBlockerRect({
      id: patch?.id || patch?.cellId || "ground-patch",
      kind: "groundPatch",
      position: patch.position,
      radius: 0.48
    }));
  }

  return blockers;
}

export function isBuilderTutorialFoundationBuildZoneBlocked({
  zoneRect = null,
  blockers = []
} = {}) {
  if (!zoneRect) {
    return true;
  }

  return (blockers || []).some((blocker) => doFoundationBuildZoneRectsOverlap(zoneRect, blocker));
}

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
