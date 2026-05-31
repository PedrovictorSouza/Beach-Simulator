export function createGameLoopFrameRuntime({
  frameClock,
  frameSnapshotController,
  fpsPanelController,
  controls,
  readFlowState,
  advanceElapsed
}) {
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

  return {
    beginFrame,
    updateInputAndCheckPaused
  };
}
