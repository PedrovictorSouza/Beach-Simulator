export function resolveActiveConstructionPlacementPreviews({
  session = {},
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null
} = {}) {
  return {
    solarStationPlacementPreview: session.strawBedPlacementPreview?.active ?
      solarStationPlacementPreview :
      null,
    greenhousePlacementPreview: session.greenhousePlacementPreview?.active ?
      greenhousePlacementPreview :
      null,
    campfirePlacementPreview: session.campfirePlacementPreview?.active ?
      campfirePlacementPreview :
      null,
    leafDenKitPlacementPreview: session.leafDenKitPlacementPreview?.active ?
      leafDenKitPlacementPreview :
      null
  };
}

export function createConstructionPlacementFrameRuntime({
  controls,
  session,
  placementContracts = [],
  workbenchRotationRuntime,
  callbacks = {}
} = {}) {
  const {
    rotateActivePlacementPreview = () => null,
    rotateNearbyWorkbenchConstruction = () => {},
    hasActivePlacementPreview = () => false,
    hasPendingWorkbenchPlacementIntent = () => false,
    clearWorkbenchConstructionRotationSelection = () => {},
    cancelActivePlacementPreviews = () => {},
    cancelPendingWorkbenchPlacementIntentWithNotice = () => {},
    isBuildBlockFieldMoveEquipped = () => false,
    startTimburrBuildBlockAction = () => null,
    playCancelSound = () => {},
    pushNotice = () => {},
    getFreeBlockInvalidPlacementNotice = () => "",
    updateSolarStationPlacementPreview = () => null,
    updateGreenhousePlacementPreview = () => null,
    updateCampfirePlacementPreview = () => null,
    updateLeafDenKitPlacementPreview = () => null,
    updateSolarStationSpawnEffect = () => {},
    syncSolarStationWorkbenchRotationVisual = () => {},
    syncFreeBlockBuildPreview = () => null,
    updateBuildBlockDebugOverlay = () => {}
  } = callbacks;

  function updatePlacementControlsAndPreviews({
    now = 0,
    deltaTime = 0,
    movementBlocked = false
  } = {}) {
    const nowSeconds = now * 0.001;
    const placementRotationRequest = controls?.consumePlacementRotationRequest?.() || 0;
    if (placementRotationRequest) {
      const rotatedPreview = rotateActivePlacementPreview(placementRotationRequest);
      if (!rotatedPreview) {
        rotateNearbyWorkbenchConstruction(placementRotationRequest);
      }
    }

    const shouldConsumePlacementCancel = Boolean(
      workbenchRotationRuntime?.getSelection?.() ||
      hasActivePlacementPreview(session, placementContracts) ||
      hasPendingWorkbenchPlacementIntent(session)
    );
    let placementCancelRequested = false;
    if (shouldConsumePlacementCancel) {
      placementCancelRequested = typeof controls?.consumePlacementCancelRequest === "function" ?
        controls.consumePlacementCancelRequest() :
        controls?.consumeJumpRequest?.() || false;
    }

    if (
      placementCancelRequested &&
      workbenchRotationRuntime?.getSelection?.()
    ) {
      clearWorkbenchConstructionRotationSelection();
    } else if (
      placementCancelRequested &&
      hasActivePlacementPreview(session, placementContracts)
    ) {
      cancelActivePlacementPreviews();
    } else if (placementCancelRequested) {
      cancelPendingWorkbenchPlacementIntentWithNotice();
    }

    if (!shouldConsumePlacementCancel && (movementBlocked || !session?.playerCharacter)) {
      controls?.consumeFreeBlockBuildRequest?.();
      controls?.consumeJumpRequest?.();
    }

    if (
      !shouldConsumePlacementCancel &&
      !movementBlocked &&
      session?.playerCharacter &&
      controls?.consumeFreeBlockBuildRequest?.()
    ) {
      if (isBuildBlockFieldMoveEquipped()) {
        const buildRequestResult = startTimburrBuildBlockAction({
          playerPosition: session.playerCharacter.getPosition()
        });
        if (buildRequestResult === "invalid") {
          playCancelSound();
          pushNotice(getFreeBlockInvalidPlacementNotice(
            session.lastTimburrBuildBlockInvalidReason
          ));
        } else if (buildRequestResult === "missing-material") {
          playCancelSound();
          pushNotice("Need Wood");
        }
      } else {
        playCancelSound();
      }
    }

    const solarStationPlacementPreview = updateSolarStationPlacementPreview(nowSeconds);
    const greenhousePlacementPreview = updateGreenhousePlacementPreview(nowSeconds);
    const campfirePlacementPreview = updateCampfirePlacementPreview(nowSeconds);
    const leafDenKitPlacementPreview = updateLeafDenKitPlacementPreview(nowSeconds);
    updateSolarStationSpawnEffect(session?.strawBedModelInstance, deltaTime);
    syncSolarStationWorkbenchRotationVisual(nowSeconds);

    return {
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    };
  }

  function updateFreeBlockPreview({
    now = 0,
    buildBlockEquipped = false,
    cinematicActive = false,
    gameplayOpeningMovementLocked = false,
    foundationBuildZoneCameraFocusActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    skillLearnActive = false,
    scriptedInteractionActive = false,
    dialogueActive = false
  } = {}) {
    const freeBlockPreviewTarget = syncFreeBlockBuildPreview({
      active: Boolean(
        buildBlockEquipped &&
        session?.playerCharacter &&
        !cinematicActive &&
        !gameplayOpeningMovementLocked &&
        !foundationBuildZoneCameraFocusActive &&
        !tutorialActive &&
        !pokedexModalOpen &&
        !skillLearnActive &&
        !scriptedInteractionActive &&
        !dialogueActive
      ),
      playerPosition: session?.playerCharacter?.getPosition?.(),
      nowSeconds: now * 0.001
    });
    updateBuildBlockDebugOverlay(freeBlockPreviewTarget?.debug || null);

    return { freeBlockPreviewTarget };
  }

  return {
    updatePlacementControlsAndPreviews,
    updateFreeBlockPreview
  };
}
