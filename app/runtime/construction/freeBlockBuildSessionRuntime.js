import {
  createFreeBlockBuildController,
  createFreeBlockBuildState,
  FREE_BLOCK_TYPES,
  getFreeBlockBuildZoneProgress
} from "../../gameplay/freeBlockBuildSystem.js";
import { createGridSystem } from "../../gameplay/gridBuildingSystem.js";
import {
  canStackFreeBlockPlacement as canStackFreeBlockPlacementFromProgress,
  getFoundationBuildZoneProgressCount as getFoundationBuildZoneProgressCountFromState,
  getSavedBuilderTutorialFoundationOriginCell,
  resolveActiveBuilderTutorialFoundationBuildZone,
  saveBuilderTutorialFoundationOriginCell
} from "./foundationBuildZone.js";
import {
  buildFoundationBuildZoneGroundCells as buildFoundationBuildZoneGroundCellsWithGrid,
  buildFoundationCompletionInteriorGroundCells as buildFoundationCompletionInteriorGroundCellsWithGrid,
  buildFreeBlockFeedbackGroundCell,
  getFreeBlockBuildZoneCenterPosition as getFreeBlockBuildZoneCenterPositionWithGrid
} from "./placementGeometry.js";

export function normalizeFreeBlockBuildGridConfig({
  sourceConfig = null,
  defaultGridConfig
} = {}) {
  const fallback = defaultGridConfig || {
    cellSize: 1,
    origin: { x: 0, y: 0, z: 0 },
    width: 1,
    height: 1,
    visualOffsetY: 0
  };
  const config = sourceConfig || fallback;

  return {
    cellSize: Number(config.cellSize || fallback.cellSize),
    origin: {
      x: Number(config.origin?.x ?? fallback.origin.x),
      y: Number(config.origin?.y ?? fallback.origin.y),
      z: Number(config.origin?.z ?? fallback.origin.z)
    },
    width: Math.max(1, Math.trunc(Number(config.width || fallback.width))),
    height: Math.max(1, Math.trunc(Number(config.height || fallback.height))),
    visualOffsetY: Number(config.visualOffsetY ?? fallback.visualOffsetY)
  };
}

export function createFreeBlockBuildSessionRuntime({
  session = null,
  defaultGridConfig,
  buildId = "freeBuild",
  initialBlockType = FREE_BLOCK_TYPES.WALL
} = {}) {
  const targetSession = session || {};

  function getGridConfig() {
    return normalizeFreeBlockBuildGridConfig({
      sourceConfig: targetSession.buildGridConfig || targetSession.gridPlacement?.gridConfig || defaultGridConfig,
      defaultGridConfig
    });
  }

  function getController() {
    const gridConfig = getGridConfig();
    const gridSignature = JSON.stringify(gridConfig);
    if (
      targetSession.freeBlockPlacementController &&
      targetSession.freeBlockPlacementGridSignature === gridSignature
    ) {
      return targetSession.freeBlockPlacementController;
    }

    const gridSystem = createGridSystem(gridConfig);
    targetSession.freeBlockInstances ||= [];
    targetSession.freeBlockBuildState = createFreeBlockBuildState({
      buildId,
      bounds: {
        originCell: { x: 0, y: 0 },
        width: gridSystem.width,
        height: gridSystem.height
      }
    });
    targetSession.freeBlockPlacementController = createFreeBlockBuildController({
      gridSystem,
      buildState: targetSession.freeBlockBuildState,
      blockInstanceStore: targetSession.freeBlockInstances,
      initialBlockType
    });
    if (targetSession.freeBlockBuildSnapshot) {
      targetSession.freeBlockBuildState.restoreFreeBlocks(targetSession.freeBlockBuildSnapshot);
      targetSession.freeBlockPlacementController.syncInstancesFromState();
    }
    targetSession.freeBlockPlacementGridSignature = gridSignature;
    return targetSession.freeBlockPlacementController;
  }

  function syncSnapshot() {
    const controller = getController();
    targetSession.freeBlockBuildSnapshot = controller.serializeFreeBlocks();
    return targetSession.freeBlockBuildSnapshot;
  }

  function getBuildZoneProgress({
    buildZone = null,
    blockType = initialBlockType
  } = {}) {
    return getFreeBlockBuildZoneProgress({
      buildState: targetSession.freeBlockBuildState,
      buildZone,
      blockType
    });
  }

  function getFoundationBuildZoneProgressCount({
    buildZone = null,
    blockType = initialBlockType
  } = {}) {
    const progress = getBuildZoneProgress({
      buildZone,
      blockType
    });
    return getFoundationBuildZoneProgressCountFromState({
      progress,
      buildZone,
      floorBlocks: targetSession.freeBlockBuildSnapshot?.floorBlocks || []
    });
  }

  function canStackFreeBlockPlacement({
    buildZone = null,
    blockType = initialBlockType
  } = {}) {
    const progress = getBuildZoneProgress({
      buildZone,
      blockType
    });
    return canStackFreeBlockPlacementFromProgress({ progress });
  }

  function syncActiveBuildZone({
    flags = null,
    getFoundationProgressCount = getFoundationBuildZoneProgressCount,
    isBuildZoneBlocked = () => true,
    findAvailableBuildZone = () => null
  } = {}) {
    const savedOrigin = getSavedBuilderTutorialFoundationOriginCell({ flags });
    const resolution = resolveActiveBuilderTutorialFoundationBuildZone({
      savedOriginCell: savedOrigin,
      getFoundationProgressCount,
      isBuildZoneBlocked,
      findAvailableBuildZone
    });

    if (resolution.originCellToSave) {
      saveBuilderTutorialFoundationOriginCell({
        flags,
        originCell: resolution.originCellToSave
      });
    }

    targetSession.freeBlockBuildZoneUnavailable = resolution.unavailable;
    targetSession.activeFreeBlockBuildZone = resolution.buildZone;
    return resolution.buildZone;
  }

  function isBuildZoneUnavailable() {
    return Boolean(targetSession.freeBlockBuildZoneUnavailable);
  }

  function getBuildZoneCenterPosition({
    buildZone = targetSession.activeFreeBlockBuildZone
  } = {}) {
    return getFreeBlockBuildZoneCenterPositionWithGrid({
      buildZone,
      gridConfig: getGridConfig()
    });
  }

  function buildFoundationBuildZoneGroundCells({
    buildZone = targetSession.activeFreeBlockBuildZone,
    zoneUnavailable = isBuildZoneUnavailable(),
    wallBlockType = initialBlockType
  } = {}) {
    getController();
    return buildFoundationBuildZoneGroundCellsWithGrid({
      buildZone,
      gridSystem: createGridSystem(getGridConfig()),
      buildState: targetSession.freeBlockBuildState,
      zoneUnavailable,
      wallBlockType
    });
  }

  function buildFoundationCompletionInteriorGroundCells({
    buildZone = targetSession.activeFreeBlockBuildZone
  } = {}) {
    return buildFoundationCompletionInteriorGroundCellsWithGrid({
      buildZone,
      gridSystem: createGridSystem(getGridConfig())
    });
  }

  function buildFeedbackGroundCell({
    result = null
  } = {}) {
    return buildFreeBlockFeedbackGroundCell({
      result,
      gridSystem: createGridSystem(getGridConfig())
    });
  }

  return {
    getGridConfig,
    getController,
    syncSnapshot,
    getBuildZoneProgress,
    getFoundationBuildZoneProgressCount,
    canStackFreeBlockPlacement,
    syncActiveBuildZone,
    isBuildZoneUnavailable,
    getBuildZoneCenterPosition,
    buildFoundationBuildZoneGroundCells,
    buildFoundationCompletionInteriorGroundCells,
    buildFeedbackGroundCell
  };
}
