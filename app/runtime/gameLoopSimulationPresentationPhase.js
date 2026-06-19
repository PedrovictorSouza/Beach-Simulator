export function runGameLoopSimulationPresentationPhase({
  activeMoveId = null,
  actTwoSequence = {},
  cameraTransitionActive = false,
  cinematicActive = false,
  companionFrameRuntime,
  deltaTime = 0,
  dialogueActive = false,
  firstTaughtActionFreedomWindow = {},
  foundationBuildZoneCameraFocusActive = false,
  frameFlowState = {},
  freeBlockPreviewTarget = null,
  gameFlowValues = {},
  gameplayCameraFrameRuntime,
  gameplayOpeningCameraFrame = null,
  gameplayOpeningCameraLocked = false,
  gameplayOpeningMovementLocked = false,
  gameplayOpeningPresentationFrameRuntime,
  gameplayPresentationSnapshotFrameRuntime,
  isGameFlow = () => false,
  nextFrame,
  now = 0,
  placementPreviews = {},
  playerActionState = {},
  playerMovedThisFrame = false,
  playerResourceCollectionFrameRuntime,
  pokedexModalOpen = false,
  scriptedInteractionActive = false,
  skillLearnActive = false,
  tutorialActive = false,
  tutorialCameraFocus = null,
  worldSceneSyncRuntime
} = {}) {
  worldSceneSyncRuntime.updateAmbientWorldFrame({ deltaTime, now });
  const {
    chopperBulbasaurRepairBoxInvestigationTarget
  } = companionFrameRuntime.update({
    deltaTime,
    now,
    activeMoveId,
    gameplayOpeningMovementLocked,
    cinematicActive,
    tutorialActive,
    pokedexModalOpen,
    dialogueActive,
    skillLearnActive,
    scriptedInteractionActive
  });

  let resolvedCinematicActive = cinematicActive;
  let resolvedTutorialActive = tutorialActive;
  if (resolvedCinematicActive) {
    actTwoSequence.update(deltaTime);
    resolvedCinematicActive = isGameFlow(gameFlowValues.CINEMATIC);
    resolvedTutorialActive = isGameFlow(gameFlowValues.TUTORIAL);
  }

  playerResourceCollectionFrameRuntime.update({
    now,
    cinematicActive: resolvedCinematicActive,
    tutorialActive: resolvedTutorialActive,
    pokedexModalOpen,
    skillLearnActive,
    scriptedInteractionActive
  });

  const gameplayCameraFrame = gameplayCameraFrameRuntime.updateFollow({
    now,
    cinematicActive: resolvedCinematicActive,
    tutorialCameraFocus,
    foundationBuildZoneCameraFocusActive,
    gameplayOpeningCameraFrame,
    dialogueActive,
    cameraTransitionActive,
    scriptedInteractionActive
  });
  const cameraGameplayOpeningFrame =
    gameplayCameraFrame.gameplayOpeningCameraFrame;

  const gameplayPresentationFrame =
    gameplayOpeningPresentationFrameRuntime.update({
      now,
      deltaTime,
      playerMovedThisFrame,
      gameplayOpeningCameraFrame: cameraGameplayOpeningFrame,
      flowState: frameFlowState,
      cinematicActive: resolvedCinematicActive,
      tutorialActive: resolvedTutorialActive
    });
  const {
    gameplayOpeningHudHidden,
    currentFlowState
  } = gameplayPresentationFrame;

  gameplayPresentationSnapshotFrameRuntime.update({
    nextFrame,
    now,
    deltaTime,
    gameplayOpeningCameraLocked,
    gameplayOpeningMovementLocked,
    gameplayOpeningHudHidden,
    currentFlowState,
    playerActionState,
    placementPreviews,
    freeBlockPreviewTarget,
    chopperBulbasaurRepairBoxInvestigationTarget,
    firstTaughtActionFreedomWindowActive:
      firstTaughtActionFreedomWindow.active
  });

  return {
    chopperBulbasaurRepairBoxInvestigationTarget,
    cinematicActive: resolvedCinematicActive,
    gameplayPresentationFrame,
    tutorialActive: resolvedTutorialActive
  };
}
