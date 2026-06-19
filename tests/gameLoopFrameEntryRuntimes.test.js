import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFrameEntryRuntimeBundle
} from "../app/runtime/gameLoopFrameEntryRuntimes.js";

describe("createGameLoopFrameEntryRuntimeBundle", () => {
  it("wires input, opening and frame runtime bundles", () => {
    const inputRuntimeBundle = {
      gameplayInputFrameRuntime: { id: "input-frame" },
      gameplayInputRuntime: { id: "input" }
    };
    const openingRuntimeBundle = {
      gameplayCameraFrameRuntime: { id: "camera-frame" },
      gameplayOpeningPresentationFrameRuntime: { id: "opening-presentation" },
      gameplayOpeningRuntime: { id: "opening" },
      readGameLoopFlowState: vi.fn()
    };
    const frameRuntime = { id: "frame-runtime" };
    const createInputRuntime = vi.fn(() => inputRuntimeBundle);
    const createOpeningRuntime = vi.fn(() => openingRuntimeBundle);
    const createFrameRuntime = vi.fn(() => frameRuntime);
    const callbacks = {
      getCurrentInputModalityState: vi.fn(),
      playSoundEvent: vi.fn(),
      processWorldCellPlannerClick: vi.fn(),
      updateFrameAudio: vi.fn()
    };
    const createCameraFrameRuntime = vi.fn();

    const result = createGameLoopFrameEntryRuntimeBundle({
      actTwoTutorial: { id: "tutorial" },
      audio: { id: "audio" },
      camera: { id: "camera" },
      cameraDebugRuntime: { id: "camera-debug" },
      controls: { id: "controls" },
      frameClock: { id: "clock" },
      frameSnapshotController: { id: "snapshot" },
      fpsPanelController: { id: "fps" },
      gameFlowValues: { GAMEPLAY: "gameplay" },
      gameplayCameraDirector: { id: "camera-director" },
      gameplayDialogue: { id: "dialogue" },
      gameplayUiVisibility: { id: "ui-visibility" },
      inputModalityPanelController: { id: "input-panel" },
      isGameFlow: vi.fn(),
      placementCameraAssist: { id: "placement-camera" },
      pokedexUiState: { open: false },
      repairBoxMotionRuntime: { id: "repair-box-motion" },
      rustlingGrassEventRuntime: { id: "rustling-grass" },
      session: { id: "session" },
      updateFoundationBuildZoneCameraFocus: vi.fn(),
      worldCanvas: { id: "canvas" },
      callbacks,
      createCameraFrameRuntime,
      createFrameRuntime,
      createInputRuntime,
      createOpeningRuntime
    });

    expect(result).toEqual({
      ...inputRuntimeBundle,
      ...openingRuntimeBundle,
      frameRuntime
    });
    expect(createInputRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          getCurrentInputModalityState:
            callbacks.getCurrentInputModalityState
        }
      })
    );
    expect(createOpeningRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          playSoundEvent: callbacks.playSoundEvent,
          updateFrameAudio: callbacks.updateFrameAudio
        },
        createCameraFrameRuntime
      })
    );
    expect(createFrameRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        gameplayOpeningRuntime: openingRuntimeBundle.gameplayOpeningRuntime,
        readGameLoopFlowState: openingRuntimeBundle.readGameLoopFlowState,
        callbacks: {
          processWorldCellPlannerClick:
            callbacks.processWorldCellPlannerClick
        }
      })
    );
  });
});
