import { resolveGameLoopBlockers } from "./gameLoopFramePolicies.js";

export function createGameLoopFlowStateReader({
  isGameFlow = () => false,
  gameFlowValues = {},
  actTwoTutorial = {},
  pokedexUiState = {},
  gameplayDialogue = {},
  controls = {}
} = {}) {
  return function readGameLoopFlowState() {
    const tutorialActive = isGameFlow(gameFlowValues.TUTORIAL);

    return {
      gameplayActive: isGameFlow(gameFlowValues.GAMEPLAY),
      cinematicActive: isGameFlow(gameFlowValues.CINEMATIC),
      introActive: isGameFlow(gameFlowValues.INTRO),
      tutorialActive,
      tutorialMovementLocked: tutorialActive ? actTwoTutorial.isMovementLocked() : false,
      pokedexModalOpen: pokedexUiState.open,
      dialogueActive: Boolean(gameplayDialogue.isActive?.()),
      skillLearnActive: Boolean(controls.isSkillLearnActive?.()),
      scriptedInteractionActive: Boolean(controls.isScriptedInteractionActive?.()),
      tutorialCameraFocus: tutorialActive ? actTwoTutorial.getCameraFocusTarget() : null
    };
  };
}

export function createGameLoopFrameRuntime({
  frameClock,
  frameSnapshotController,
  fpsPanelController,
  controls,
  readFlowState,
  advanceElapsed,
  gameplayOpeningRuntime = null,
  session = {},
  placement = {},
  placementCameraAssist = { update: () => {} },
  updateFoundationBuildZoneCameraFocus = () => false,
  resolveBlockers = resolveGameLoopBlockers,
  earlyFrame = {}
}) {
  const {
    contracts: placementContracts = [],
    hasActivePlacementPreview = () => false
  } = placement;
  const {
    processWorldCellPlannerClick = () => {},
    updateIntroRoomFrame = () => false,
    updateRustlingGrass = () => {}
  } = earlyFrame;

  function beginFrame(now) {
    const nextFrame = frameSnapshotController.beginFrame();
    const { rawDeltaTime, deltaTime } = frameClock.update(now);
    fpsPanelController.update(rawDeltaTime);
    advanceElapsed(deltaTime);

    return {
      nextFrame,
      rawDeltaTime,
      deltaTime,
      flowState: readFlowState()
    };
  }

  function updateInputAndCheckPaused(deltaTime) {
    controls.updateGamepads?.(deltaTime);

    if (!controls.isPaused?.()) {
      return false;
    }

    controls.clearPendingActions();
    controls.clearMovementInput();
    return true;
  }

  function commitFrame() {
    frameSnapshotController.commitFrame();
  }

  function beginGameplayFrameContext({
    now = 0,
    deltaTime = 0,
    flowState = {}
  } = {}) {
    const gameplayOpeningFrameStart = gameplayOpeningRuntime?.beginFrame?.({
      now,
      deltaTime,
      gameplayActive: flowState.gameplayActive
    }) || {};
    const gameplayOpeningCameraLocked = Boolean(
      gameplayOpeningRuntime?.isCameraLocked?.()
    );
    const gameplayOpeningMovementLocked = Boolean(
      gameplayOpeningRuntime?.isMovementLocked?.()
    );
    const placementPreviewActive = Boolean(
      hasActivePlacementPreview(session, placementContracts)
    );
    placementCameraAssist.update?.({ placementActive: placementPreviewActive });
    const foundationBuildZoneCameraFocusActive = Boolean(
      updateFoundationBuildZoneCameraFocus(now)
    );

    return {
      gameplayOpeningCameraFrame: gameplayOpeningFrameStart.cameraFrame,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      placementPreviewActive,
      foundationBuildZoneCameraFocusActive,
      ...resolveBlockers({
        gameplayOpeningMovementLocked,
        foundationBuildZoneCameraFocusActive,
        placementPreviewActive,
        flowState
      })
    };
  }

  function updateEarlyGameplayControlFrame({
    nextFrame,
    deltaTime = 0,
    introActive = false,
    shouldClearPendingActions = false,
    shouldClearMovementInput = false,
    canAdvanceRustlingGrass = false
  } = {}) {
    processWorldCellPlannerClick();

    if (
      introActive &&
      updateIntroRoomFrame({
        nextFrame,
        deltaTime
      })
    ) {
      commitFrame();
      return { committedEarlyFrame: true };
    }

    if (shouldClearPendingActions) {
      controls.clearPendingActions();
    }

    if (shouldClearMovementInput) {
      controls.clearMovementInput();
    }

    updateRustlingGrass({
      deltaTime,
      canAdvance: canAdvanceRustlingGrass
    });

    return { committedEarlyFrame: false };
  }

  return {
    beginGameplayFrameContext,
    beginFrame,
    commitFrame,
    updateEarlyGameplayControlFrame,
    updateInputAndCheckPaused
  };
}
