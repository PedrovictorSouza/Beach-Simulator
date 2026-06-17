import {
  createConstructionPlacementControlRuntime
} from "./constructionPlacementControlRuntime.js";
import {
  createConstructionPlacementFrameRuntime
} from "./constructionPlacementFrameRuntime.js";
import {
  createConstructionPlacementPreviewRuntime
} from "./constructionPlacementPreviewRuntime.js";
import {
  createSolarStationPowerRadiusRuntime
} from "./solarStationPowerRadius.js";

export function createConstructionPlacementRuntimeBundle({
  controls = {},
  session = {},
  runtimes = {},
  callbacks = {},
  placementContracts = [],
  config = {}
} = {}) {
  let constructionPlacementFrameRuntime = null;
  let constructionPlacementControlRuntime = null;
  let constructionPlacementPreviewRuntime = null;

  const solarStationPowerRadiusRuntime = createSolarStationPowerRadiusRuntime({
    session,
    getStoryState: () => controls.storyState,
    radiusMultiplier: config.leafDenKitSolarStationRadiusMultiplier,
    previewFootprint: config.solarStationPreviewFootprint,
    gridFootprint: config.solarStationGridFootprint,
    markedTileLimit: config.markedTileLimit,
    getPlacementCollisionSize: callbacks.getPlacementCollisionSize,
    getPlacementPreviewFootprintWorldSize:
      callbacks.getPlacementPreviewFootprintWorldSize
  });

  constructionPlacementPreviewRuntime = createConstructionPlacementPreviewRuntime({
    session,
    controls,
    solarStationPlacementBlockerRuntime: runtimes.solarStationPlacementBlockerRuntime,
    solarStationPowerRadiusRuntime,
    validatePlacement: callbacks.validatePlacement,
    evaluateSiteChoice: callbacks.evaluateHabitatSiteChoice,
    config: {
      solarStationGridFootprint: config.solarStationGridFootprint,
      solarStationFollowDistance: config.solarStationFollowDistance,
      leafDenKitFallbackFootprint: config.leafDenKitFallbackFootprint,
      leafDenKitGridFootprint: config.leafDenKitGridFootprint,
      trainHouseFallbackFootprint: config.trainHouseFallbackFootprint,
      trainHouseGridFootprint: config.trainHouseGridFootprint,
      greenhouseFallbackFootprint: config.greenhouseFallbackFootprint,
      greenhouseGridFootprint: config.greenhouseGridFootprint,
      workbenchPosition: config.workbenchPosition
    },
    callbacks: {
      syncPlacementPreviewPositionToPlayer: (...args) =>
        constructionPlacementFrameRuntime.syncPlacementPreviewPositionToPlayer(...args)
    }
  });

  constructionPlacementControlRuntime = createConstructionPlacementControlRuntime({
    session,
    controls,
    config: {
      placementRotationStep: config.placementRotationStep
    },
    callbacks: {
      getSelectedBlockMaterialCost: callbacks.getSelectedBlockMaterialCost,
      normalizePlacementYaw: callbacks.normalizePlacementYaw,
      playCancelSound: callbacks.playCancelSound,
      playRotateSound: callbacks.playRotateSound,
      pushNotice: callbacks.pushNotice
    }
  });

  constructionPlacementFrameRuntime = createConstructionPlacementFrameRuntime({
    controls,
    getMovementAxes: callbacks.getMovementAxes,
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    session,
    placementContracts,
    workbenchRotationRuntime: runtimes.workbenchRotationRuntime,
    callbacks: {
      rotateActivePlacementPreview: (...args) =>
        constructionPlacementControlRuntime.rotateActivePlacementPreview(...args),
      rotateNearbyWorkbenchConstruction:
        runtimes.workbenchRotationRuntime?.rotateNearbyTargetWithFeedback,
      hasActivePlacementPreview: callbacks.hasActivePlacementPreview,
      hasPendingWorkbenchPlacementIntent: callbacks.hasPendingWorkbenchPlacementIntent,
      clearWorkbenchConstructionRotationSelection:
        runtimes.workbenchRotationRuntime?.clearSelectionWithFeedback,
      cancelActivePlacementPreviews: callbacks.cancelActivePlacementPreviews,
      cancelPendingWorkbenchPlacementIntentWithNotice: () =>
        constructionPlacementControlRuntime.cancelPendingWorkbenchPlacementIntentWithNotice(),
      isBuildBlockFieldMoveEquipped: () =>
        constructionPlacementControlRuntime.isBuildBlockFieldMoveEquipped(),
      startTimburrBuildBlockAction: (options) =>
        runtimes.buildBlockRuntime?.startAction?.(options),
      playCancelSound: callbacks.playCancelSound,
      pushNotice: callbacks.pushNotice,
      getFreeBlockInvalidPlacementNotice: callbacks.getFreeBlockInvalidPlacementNotice,
      updateSolarStationPlacementPreview: (...args) =>
        constructionPlacementPreviewRuntime.updateSolarStation(...args),
      updateGreenhousePlacementPreview: (...args) =>
        constructionPlacementPreviewRuntime.updateGreenhouse(...args),
      updateCampfirePlacementPreview: (...args) =>
        constructionPlacementPreviewRuntime.updateCampfire(...args),
      updateLeafDenKitPlacementPreview: (...args) =>
        constructionPlacementPreviewRuntime.updateLeafDenKit(...args),
      updateSolarStationSpawnEffect: callbacks.applySolarStationSpawnEffect,
      syncSolarStationWorkbenchRotationVisual:
        runtimes.workbenchRotationRuntime?.syncSolarStationWorkbenchRotationVisualFromSources,
      syncFreeBlockBuildPreview: callbacks.syncFreeBlockBuildPreview,
      updateBuildBlockDebugOverlay: callbacks.updateBuildBlockDebugOverlay
    }
  });

  return {
    constructionPlacementControlRuntime,
    constructionPlacementFrameRuntime,
    constructionPlacementPreviewRuntime,
    solarStationPowerRadiusRuntime
  };
}
