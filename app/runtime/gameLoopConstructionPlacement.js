import {
  createGameplayConstructionPlacementRuntimeBundle
} from "./construction/constructionPlacementRuntimeBundle.js";
import {
  createGameplayPlacementPreviewCancellation
} from "./construction/constructionPlacementControlRuntime.js";
import {
  getPlacementCollisionSize,
  getPlacementPreviewFootprintWorldSize,
  normalizePlacementYaw
} from "./construction/placementGeometry.js";
import {
  hasPendingWorkbenchPlacementIntent
} from "./construction/pendingPlacementIntent.js";
import {
  getFreeBlockInvalidPlacementNotice
} from "./construction/placementPreviewPrompts.js";
import {
  updateSolarStationSpawnEffect
} from "./construction/playerPlacementSpawnEffect.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import { evaluateHabitatSiteChoice } from "../gameplay/habitatSiteChoiceContract.js";
import { PLACEMENT_CONTRACTS } from "../gameplay/contracts/placementContracts.js";
import { hasActivePlacementPreview } from "../gameplay/contracts/placementRuntime.js";
import { validateBuildingKitPlacement } from "../../world/islandWorld.js";

export function createGameLoopConstructionPlacementRuntimeBundle({
  camera,
  controls,
  hud,
  session,
  runtimes = {},
  callbacks = {},
  createPlacementPreviewCancellation = createGameplayPlacementPreviewCancellation,
  createRuntime = createGameplayConstructionPlacementRuntimeBundle
} = {}) {
  const {
    buildBlockDebugOverlay,
    buildBlockRuntime,
    freeBlockBuildRuntime,
    solarStationPlacementBlockerRuntime,
    workbenchRotationRuntime
  } = runtimes;
  const {
    playSoundEvent
  } = callbacks;
  const cancelActivePlacementPreviews = createPlacementPreviewCancellation({
    session,
    controls,
    hud,
    playSoundEvent,
    cancelSoundEventId: SOUND_EVENT_IDS.UI_CANCEL,
    placementContracts: PLACEMENT_CONTRACTS
  });

  return createRuntime({
    controls,
    session,
    runtimes: {
      buildBlockRuntime,
      solarStationPlacementBlockerRuntime,
      workbenchRotationRuntime
    },
    callbacks: {
      applySolarStationSpawnEffect: updateSolarStationSpawnEffect,
      cancelActivePlacementPreviews,
      evaluateHabitatSiteChoice,
      getFreeBlockInvalidPlacementNotice,
      getMovementAxes: () => camera.getMovementAxes(),
      getPlacementCollisionSize,
      getPlacementPreviewFootprintWorldSize,
      getSelectedBlockMaterialCost: () =>
        freeBlockBuildRuntime.getController()?.getSelectedBlockMaterialCost?.(),
      hasActivePlacementPreview,
      hasPendingWorkbenchPlacementIntent,
      normalizePlacementYaw,
      playCancelSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      playRotateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE),
      pushNotice: (notice) => hud?.pushNotice?.(notice),
      syncFreeBlockBuildPreview: (...args) => freeBlockBuildRuntime.syncPreview(...args),
      updateBuildBlockDebugOverlay: (debug) => buildBlockDebugOverlay.update(debug),
      validatePlacement: validateBuildingKitPlacement
    }
  });
}
