import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopInputRuntimeBundle
} from "../app/runtime/gameLoopInputRuntime.js";

describe("createGameLoopInputRuntimeBundle", () => {
  it("wires gameplay input runtimes for the game loop", () => {
    const gameplayInputRuntime = { id: "input" };
    const gameplayInputFrameRuntime = { id: "input-frame" };
    const createInputRuntime = vi.fn(() => gameplayInputRuntime);
    const createFrameRuntime = vi.fn(() => gameplayInputFrameRuntime);
    const camera = {
      isTargetTransitionActive: vi.fn(() => true)
    };
    const cameraDebugRuntime = {
      updateFrameOverlay: vi.fn()
    };
    const getCurrentInputModalityState = vi.fn(() => ({ device: "keyboard" }));

    const result = createGameLoopInputRuntimeBundle({
      camera,
      cameraDebugRuntime,
      controls: { id: "controls" },
      inputModalityPanelController: { id: "input-panel" },
      callbacks: {
        getCurrentInputModalityState
      },
      createFrameRuntime,
      createInputRuntime
    });

    expect(result).toEqual({
      gameplayInputFrameRuntime,
      gameplayInputRuntime
    });
    expect(createInputRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" }
    });
    expect(createFrameRuntime).toHaveBeenCalledWith({
      gameplayInputRuntime,
      inputModalityPanelController: { id: "input-panel" },
      getInputModalityState: getCurrentInputModalityState,
      getCameraTransitionActive: expect.any(Function),
      updateCameraDebugFrameOverlay: expect.any(Function)
    });

    const options = createFrameRuntime.mock.calls[0][0];
    expect(options.getCameraTransitionActive()).toBe(true);
    options.updateCameraDebugFrameOverlay({ now: 1 });

    expect(camera.isTargetTransitionActive).toHaveBeenCalledOnce();
    expect(cameraDebugRuntime.updateFrameOverlay).toHaveBeenCalledWith({ now: 1 });
  });
});
