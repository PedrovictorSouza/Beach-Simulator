import { resolveGameLoopBlockers } from "./gameLoopFramePolicies.js";

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
