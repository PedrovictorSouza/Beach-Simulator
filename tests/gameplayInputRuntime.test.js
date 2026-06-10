import { describe, expect, it, vi } from "vitest";

import {
  createGameplayInputFrameRuntime,
  createGameplayInputRuntime
} from "../app/runtime/input/createGameplayInputRuntime.js";

describe("gameplay input runtime", () => {
  it("captures the current input modality and cinematic skip state", () => {
    const runtime = createGameplayInputRuntime({
      controls: {
        getInputModalityState: () => ({ modality: "gamepad" }),
        isCinematicSkipActionActive: () => true
      }
    });

    expect(runtime.update({
      now: 120,
      deltaTime: 0.016,
      gameplayActive: true,
      movementBlocked: true
    })).toMatchObject({
      now: 120,
      deltaTime: 0.016,
      gameplayActive: true,
      movementBlocked: true,
      inputModalityState: { modality: "gamepad" },
      cinematicSkipHeld: true
    });
    expect(runtime.getFrame().inputModalityState).toEqual({ modality: "gamepad" });
  });

  it("coordinates frame input, modality panel and camera-debug payload", () => {
    const gameplayInputRuntime = {
      update: vi.fn(),
      getFrame: vi.fn(() => ({
        inputModalityState: { modality: "keyboard" }
      }))
    };
    const inputModalityPanelController = {
      update: vi.fn()
    };
    const updateCameraDebugFrameOverlay = vi.fn();
    const frameRuntime = createGameplayInputFrameRuntime({
      gameplayInputRuntime,
      inputModalityPanelController,
      getCameraTransitionActive: () => true,
      getInputModalityState: () => gameplayInputRuntime.getFrame()?.inputModalityState || null,
      updateCameraDebugFrameOverlay
    });

    const result = frameRuntime.update({
      now: 250,
      deltaTime: 0.02,
      flowState: { gameplayActive: true },
      cinematicActive: false,
      movementBlocked: true,
      placementPreviewActive: true,
      dialogueActive: false,
      tutorialActive: true,
      skillLearnActive: false,
      scriptedInteractionActive: true,
      gameplayOpeningMovementLocked: true
    });

    expect(gameplayInputRuntime.update).toHaveBeenCalledWith({
      now: 250,
      deltaTime: 0.02,
      gameplayActive: true,
      cinematicActive: false,
      movementBlocked: true,
      placementActive: true,
      dialogueActive: false,
      tutorialActive: true,
      skillLearnActive: false,
      scriptedInteractionActive: true
    });
    expect(inputModalityPanelController.update).toHaveBeenCalledWith({
      modality: "keyboard"
    });
    expect(updateCameraDebugFrameOverlay).toHaveBeenCalledWith({
      now: 250,
      flowState: { gameplayActive: true },
      movementBlocked: true,
      gameplayOpeningMovementLocked: true,
      cameraTransitionActive: true
    });
    expect(result).toEqual({ cameraTransitionActive: true });
  });
});
