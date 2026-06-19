export function runGameLoopFrameControlPhase({
  actTwoTutorial = {},
  frameRuntime,
  gameplayCameraFrameRuntime,
  gameplayInputFrameRuntime,
  now = 0,
  session = {},
  worldSceneSyncRuntime = {}
} = {}) {
  const {
    nextFrame,
    deltaTime,
    flowState: frameFlowState
  } = frameRuntime.beginFrame(now);
  const {
    introActive,
    pokedexModalOpen,
    dialogueActive,
    skillLearnActive,
    scriptedInteractionActive,
    tutorialCameraFocus
  } = frameFlowState;
  const {
    cinematicActive,
    tutorialActive
  } = frameFlowState;

  if (session.actTwoRepairPlant && actTwoTutorial.isRepairPlantFixed()) {
    session.actTwoRepairPlant.fixed = true;
  }

  if (frameRuntime.updateInputAndCheckPaused(deltaTime)) {
    return {
      shouldRequestNextFrame: true,
      nextFrame,
      deltaTime,
      frameFlowState
    };
  }

  worldSceneSyncRuntime.updateEarlySceneFrame(deltaTime);

  const {
    gameplayOpeningCameraFrame,
    gameplayOpeningCameraLocked,
    gameplayOpeningMovementLocked,
    placementPreviewActive,
    foundationBuildZoneCameraFocusActive,
    movementBlocked,
    shouldClearPendingActions,
    shouldClearMovementInput,
    canAdvanceRustlingGrass
  } = frameRuntime.beginGameplayFrameContext({
    now,
    deltaTime,
    flowState: frameFlowState
  });

  const { cameraTransitionActive } = gameplayInputFrameRuntime.update({
    now,
    deltaTime,
    flowState: frameFlowState,
    cinematicActive,
    movementBlocked,
    placementPreviewActive,
    dialogueActive,
    tutorialActive,
    skillLearnActive,
    scriptedInteractionActive,
    gameplayOpeningMovementLocked
  });

  const { committedEarlyFrame } = frameRuntime.updateEarlyGameplayControlFrame({
    nextFrame,
    deltaTime,
    introActive,
    shouldClearPendingActions,
    shouldClearMovementInput,
    canAdvanceRustlingGrass
  });
  if (committedEarlyFrame) {
    return {
      shouldRequestNextFrame: true,
      committedEarlyFrame,
      nextFrame,
      deltaTime,
      frameFlowState
    };
  }

  gameplayCameraFrameRuntime.updateInput({
    deltaTime,
    flowState: frameFlowState,
    gameplayOpeningCameraLocked,
    foundationBuildZoneCameraFocusActive,
    placementPreviewActive,
    tutorialActive
  });

  return {
    cameraTransitionActive,
    cinematicActive,
    deltaTime,
    dialogueActive,
    foundationBuildZoneCameraFocusActive,
    frameFlowState,
    gameplayOpeningCameraFrame,
    gameplayOpeningCameraLocked,
    gameplayOpeningMovementLocked,
    movementBlocked,
    nextFrame,
    pokedexModalOpen,
    scriptedInteractionActive,
    shouldRequestNextFrame: false,
    skillLearnActive,
    tutorialActive,
    tutorialCameraFocus
  };
}
