import { createRectangularFreeBlockBuildZone } from "../../gameplay/freeBlockBuildSystem.js";
import {
  buildFoundationBuildZoneCandidateOrigins as buildFoundationBuildZoneCandidateOriginsWithConfig,
  createFoundationBuildZoneBlockerRect,
  doFoundationBuildZoneRectsOverlap,
  getFoundationBuildZoneCellKeys,
  getFoundationBuildZoneSignature,
  getFoundationBuildZoneWorldRect as getFoundationBuildZoneWorldRectWithGrid,
  isFoundationBuildZoneOriginInsideGrid,
  normalizeFoundationBuildZoneOriginCell
} from "./placementGeometry.js";

export const BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL = Object.freeze({ x: 110, y: 100 });
export const BUILDER_TUTORIAL_FOUNDATION_WIDTH = 6;
export const BUILDER_TUTORIAL_FOUNDATION_HEIGHT = 4;
const BUILDER_TUTORIAL_FOUNDATION_SEARCH_RADIUS = 16;
const BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG = "builderTutorialFoundationOriginCell";
const FOUNDATION_COMPLETE_GROUND_EFFECT_DURATION_MS = 3000;
const FOUNDATION_COMPLETE_CLOUD_BURST_DURATION_MS = 1800;
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

export function applyFoundationBuildZoneCompleteEffects({
  flags = null,
  position = null,
  constructionCloudBursts = [],
  nowMs = Date.now()
} = {}) {
  const result = {
    triggerInteriorFeedback: false,
    feedbackAbilityId: "foundationComplete",
    feedbackDurationMs: FOUNDATION_COMPLETE_GROUND_EFFECT_DURATION_MS,
    constructionCloudBursts: null
  };

  if (!flags || !Array.isArray(position)) {
    return result;
  }

  const cloudEffectPlayed = Boolean(flags.builderTutorialFoundationCompleteEffectPlayed);
  const interiorEffectPlayed = Boolean(flags.builderTutorialFoundationInteriorEffectPlayed);
  if (cloudEffectPlayed && interiorEffectPlayed) {
    return result;
  }

  if (!interiorEffectPlayed) {
    flags.builderTutorialFoundationInteriorEffectPlayed = true;
    result.triggerInteriorFeedback = true;
  }

  if (cloudEffectPlayed) {
    return result;
  }

  flags.builderTutorialFoundationCompleteEffectPlayed = true;
  result.constructionCloudBursts = (Array.isArray(constructionCloudBursts) ?
    constructionCloudBursts.filter((effect) => {
      const startedAt = Number(effect?.startedAt || 0);
      const durationMs = Number(effect?.durationMs || 0);
      return startedAt > 0 && durationMs > 0 && nowMs - startedAt < durationMs;
    }) :
    []
  );
  result.constructionCloudBursts.push({
    id: "builder-tutorial-foundation-complete",
    position,
    startedAt: nowMs,
    durationMs: FOUNDATION_COMPLETE_CLOUD_BURST_DURATION_MS
  });

  return result;
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

function getFoundationRuntimeNow() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ?
    performance.now() :
    Date.now();
}

export function createFoundationBuildZoneRuntime({
  session = null,
  controls = null,
  rendering = null,
  freeBlockBuildSessionRuntime = null,
  worldObjectPlacementBlockerRuntime = null,
  groundActionFeedbackRuntime = null,
  config = {},
  callbacks = {}
} = {}) {
  const targetSession = session || {};
  const targetControls = controls || {};
  const wallBlockType = config.wallBlockType || "wall";
  const getActorPosition = callbacks.getActorPosition || ((actor) => actor?.position || null);
  const getPerformanceNow = callbacks.getPerformanceNow || getFoundationRuntimeNow;
  const getNowMs = callbacks.getNowMs || (() => Date.now());

  function getGridConfig() {
    return freeBlockBuildSessionRuntime?.getGridConfig?.() || null;
  }

  function getWorldRect(buildZone = null) {
    return getFoundationBuildZoneWorldRectWithGrid(buildZone, getGridConfig());
  }

  function isFreeBlockAllowed(instance, buildZone) {
    return isFoundationFreeBlockAllowedInZone({
      instance,
      buildZone,
      buildState: targetSession.freeBlockBuildState
    });
  }

  function getProgressCount(buildZone = null) {
    return freeBlockBuildSessionRuntime?.getFoundationBuildZoneProgressCount?.({
      buildZone,
      blockType: wallBlockType
    }) || 0;
  }

  function getBlockers(buildZone = null) {
    return buildFoundationBuildZoneBlockers({
      terrainColliders: callbacks.getTerrainColliders?.() || [],
      freeBlockInstances: targetSession.freeBlockInstances || [],
      isFoundationFreeBlockAllowed: (instance) => isFreeBlockAllowed(instance, buildZone),
      worldObjectBlockers: worldObjectPlacementBlockerRuntime?.getBlockers?.() || [],
      playerPosition: targetSession.playerCharacter?.getPosition?.() || null,
      npcActors: targetSession.npcActors || [],
      isNpcActive: (npcActor) => rendering?.isNpcActive?.(npcActor, targetControls.storyState),
      getActorPosition,
      interactables: targetSession.interactables || [],
      isInteractableActive: (interactable) =>
        rendering?.isInteractableActive?.(interactable, targetControls.storyState),
      companions: [
        targetSession.actTwoSquirtle,
        targetSession.bulbasaurEncounter,
        targetSession.timburrEncounter,
        targetSession.charmanderEncounter
      ],
      resourceNodes: targetSession.resourceNodes || [],
      isResourceNodeActive: (resourceNode) =>
        rendering?.isResourceNodeActive?.(resourceNode, targetControls.storyState),
      drops: [
        ...(targetSession.woodDrops || []),
        ...(targetSession.fieldDrops || []),
        ...(targetSession.leppaBerryDrops || [])
      ],
      groundPatches: [
        ...(targetSession.groundGrassPatches || []),
        ...(targetSession.groundFlowerPatches || [])
      ]
    });
  }

  function isBuildZoneBlocked(buildZone = null) {
    return isBuilderTutorialFoundationBuildZoneBlocked({
      zoneRect: getWorldRect(buildZone),
      blockers: getBlockers(buildZone)
    });
  }

  function findAvailableBuildZone() {
    return findAvailableBuilderTutorialFoundationBuildZone({
      gridConfig: getGridConfig(),
      isBuildZoneBlocked
    });
  }

  function syncActiveBuildZone() {
    return freeBlockBuildSessionRuntime?.syncActiveBuildZone?.({
      flags: targetControls.storyState?.flags,
      getFoundationProgressCount: getProgressCount,
      isBuildZoneBlocked,
      findAvailableBuildZone
    }) || null;
  }

  function getActiveBuildZone() {
    return syncActiveBuildZone();
  }

  function isBuildZoneUnavailable() {
    return Boolean(freeBlockBuildSessionRuntime?.isBuildZoneUnavailable?.());
  }

  function getBuildZoneCenterPosition(buildZone = getActiveBuildZone()) {
    return freeBlockBuildSessionRuntime?.getBuildZoneCenterPosition?.({ buildZone }) || null;
  }

  function shouldShow(activeQuest = null, activeSystemQuest = null) {
    return shouldShowFoundationBuildZone({
      activeQuest,
      activeSystemQuest
    });
  }

  function buildGroundCells(activeQuest = null, activeSystemQuest = null) {
    if (!shouldShow(activeQuest, activeSystemQuest)) {
      return [];
    }

    const buildZone = getActiveBuildZone();
    if (!Array.isArray(buildZone?.borderCells)) {
      return [];
    }

    return freeBlockBuildSessionRuntime?.buildFoundationBuildZoneGroundCells?.({
      buildZone,
      zoneUnavailable: isBuildZoneUnavailable(),
      wallBlockType
    }) || [];
  }

  function buildCompletionInteriorGroundCells() {
    const buildZone = getActiveBuildZone();
    if (!Array.isArray(buildZone?.interiorCells) || !buildZone.interiorCells.length) {
      return [];
    }

    return freeBlockBuildSessionRuntime?.buildFoundationCompletionInteriorGroundCells?.({
      buildZone
    }) || [];
  }

  function triggerCompleteEffects(now = getPerformanceNow()) {
    const flags = targetControls.storyState?.flags;
    if (!flags) {
      return;
    }

    const effects = applyFoundationBuildZoneCompleteEffects({
      flags,
      position: getBuildZoneCenterPosition(),
      constructionCloudBursts: targetSession.constructionCloudBursts,
      nowMs: getNowMs()
    });

    if (effects.triggerInteriorFeedback) {
      groundActionFeedbackRuntime?.triggerFeedback?.(
        buildCompletionInteriorGroundCells(),
        effects.feedbackAbilityId,
        now,
        { durationMs: effects.feedbackDurationMs }
      );
    }

    if (effects.constructionCloudBursts) {
      targetSession.constructionCloudBursts = effects.constructionCloudBursts;
    }
  }

  function syncCompletionEffects(now = getPerformanceNow()) {
    const progress = freeBlockBuildSessionRuntime?.getBuildZoneProgress?.({
      buildZone: getActiveBuildZone(),
      blockType: wallBlockType
    }) || { complete: false };

    if (progress.complete) {
      triggerCompleteEffects(now);
    }

    return progress;
  }

  function canStack() {
    return Boolean(freeBlockBuildSessionRuntime?.canStackFreeBlockPlacement?.({
      buildZone: getActiveBuildZone(),
      blockType: wallBlockType
    }));
  }

  return {
    buildCompletionInteriorGroundCells,
    buildGroundCells,
    canStack,
    findAvailableBuildZone,
    getActiveBuildZone,
    getBlockers,
    getBuildZoneCenterPosition,
    getGridConfig,
    getProgressCount,
    getWorldRect,
    isBuildZoneBlocked,
    isBuildZoneUnavailable,
    isFreeBlockAllowed,
    shouldShow,
    syncActiveBuildZone,
    syncCompletionEffects,
    triggerCompleteEffects
  };
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
