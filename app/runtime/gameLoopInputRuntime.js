import {
  createGameplayInputFrameRuntime,
  createGameplayInputRuntime
} from "./input/createGameplayInputRuntime.js";

export function createGameLoopInputRuntimeBundle({
  camera,
  cameraDebugRuntime,
  controls,
  inputModalityPanelController,
  callbacks = {},
  createFrameRuntime = createGameplayInputFrameRuntime,
  createInputRuntime = createGameplayInputRuntime
} = {}) {
  const {
    getCurrentInputModalityState
  } = callbacks;
  const gameplayInputRuntime = createInputRuntime({
    controls
  });
  const gameplayInputFrameRuntime = createFrameRuntime({
    gameplayInputRuntime,
    inputModalityPanelController,
    getInputModalityState: getCurrentInputModalityState,
    getCameraTransitionActive: () => camera.isTargetTransitionActive(),
    updateCameraDebugFrameOverlay: (frameState) => {
      cameraDebugRuntime.updateFrameOverlay(frameState);
    }
  });

  return {
    gameplayInputFrameRuntime,
    gameplayInputRuntime
  };
}
