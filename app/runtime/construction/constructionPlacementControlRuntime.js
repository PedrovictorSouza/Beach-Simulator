import {
  cancelPendingWorkbenchPlacementIntent
} from "./pendingPlacementIntent.js";
import {
  buildFreeBlockBuildCostMarker
} from "./placementPreviewPrompts.js";
import {
  rotateActiveConstructionPlacementPreviews
} from "./constructionPlacementFrameRuntime.js";
import {
  cancelActivePlacementPreviews
} from "../../gameplay/contracts/placementRuntime.js";

export function createGameplayPlacementPreviewCancellation({
  session = {},
  controls = {},
  hud = {},
  playSoundEvent = null,
  cancelSoundEventId = null,
  placementContracts = [],
  cancelPendingIntent = cancelPendingWorkbenchPlacementIntent
} = {}) {
  return function cancelGameplayPlacementPreviews() {
    return cancelActivePlacementPreviews({
      session,
      storyState: controls.storyState,
      contracts: placementContracts,
      playSoundEvent,
      hud,
      cancelPendingWorkbenchPlacementIntent: cancelPendingIntent,
      cancelSoundEventId
    });
  };
}

export function createConstructionPlacementControlRuntime({
  session = {},
  controls = {},
  config = {},
  callbacks = {}
} = {}) {
  function cancelPendingWorkbenchPlacementIntentWithNotice() {
    const canceledIntent = cancelPendingWorkbenchPlacementIntent(session);
    if (!canceledIntent) {
      return false;
    }

    callbacks.playCancelSound?.();
    callbacks.pushNotice?.(`${canceledIntent.label || "Workbench object"} placement canceled.`);
    return true;
  }

  function rotateActivePlacementPreview(direction) {
    return rotateActiveConstructionPlacementPreviews({
      direction,
      previews: [
        session.strawBedPlacementPreview,
        session.greenhousePlacementPreview,
        session.campfirePlacementPreview,
        session.leafDenKitPlacementPreview
      ],
      rotationStep: config.placementRotationStep,
      normalizePlacementYaw: callbacks.normalizePlacementYaw,
      playRotateSound: callbacks.playRotateSound,
      pushNotice: callbacks.pushNotice
    });
  }

  function isBuildBlockFieldMoveEquipped() {
    return Boolean(
      controls.playerSkills?.buildBlock &&
      controls.getActiveMoveId?.() === "buildBlock"
    );
  }

  function getFreeBlockBuildCostMarker(previewTarget = null) {
    return buildFreeBlockBuildCostMarker({
      previewTarget,
      materialCost: callbacks.getSelectedBlockMaterialCost?.(),
      inventory: controls.inventory
    });
  }

  return {
    cancelPendingWorkbenchPlacementIntentWithNotice,
    getFreeBlockBuildCostMarker,
    isBuildBlockFieldMoveEquipped,
    rotateActivePlacementPreview
  };
}
