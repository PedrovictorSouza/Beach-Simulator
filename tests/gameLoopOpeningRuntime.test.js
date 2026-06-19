import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopOpeningRuntimeBundle
} from "../app/runtime/gameLoopOpeningRuntime.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopOpeningRuntimeBundle", () => {
  it("wires opening, camera, and flow state runtimes for the game loop", () => {
    const gameplayOpeningRuntime = { id: "opening" };
    const gameplayOpeningPresentationFrameRuntime = { id: "opening-frame" };
    const gameplayCameraFrameRuntime = { id: "camera-frame" };
    const readGameLoopFlowState = vi.fn();
    const createOpeningRuntime = vi.fn(() => gameplayOpeningRuntime);
    const createOpeningPresentationFrameRuntime =
      vi.fn(() => gameplayOpeningPresentationFrameRuntime);
    const createCameraFrameRuntime = vi.fn(() => gameplayCameraFrameRuntime);
    const createFlowStateReader = vi.fn(() => readGameLoopFlowState);
    const isGameFlow = vi.fn((flow) => flow === "gameplay");
    const updateFrameAudio = vi.fn();
    const playSoundEvent = vi.fn();
    const gameplayDialogue = {
      isActive: vi.fn(() => true)
    };
    const gameFlowValues = {
      GAMEPLAY: "gameplay",
      TUTORIAL: "tutorial"
    };

    const result = createGameLoopOpeningRuntimeBundle({
      actTwoTutorial: { id: "tutorial" },
      audio: { id: "audio" },
      controls: { id: "controls" },
      gameFlowValues,
      gameplayCameraDirector: { id: "camera-director" },
      gameplayDialogue,
      gameplayUiVisibility: { id: "ui-visibility" },
      isGameFlow,
      pokedexUiState: { open: false },
      session: { id: "session" },
      callbacks: {
        playSoundEvent,
        updateFrameAudio
      },
      createCameraFrameRuntime,
      createFlowStateReader,
      createOpeningPresentationFrameRuntime,
      createOpeningRuntime
    });

    expect(result).toEqual({
      gameplayCameraFrameRuntime,
      gameplayOpeningPresentationFrameRuntime,
      gameplayOpeningRuntime,
      readGameLoopFlowState
    });
    expect(createOpeningRuntime).toHaveBeenCalledWith({
      gameplayCameraDirector: { id: "camera-director" },
      session: { id: "session" },
      controls: { id: "controls" },
      gameplayUiVisibility: { id: "ui-visibility" },
      audio: { id: "audio" }
    });
    expect(createOpeningPresentationFrameRuntime).toHaveBeenCalledWith({
      openingRuntime: gameplayOpeningRuntime,
      updateFrameAudio,
      isGameplayActive: expect.any(Function),
      isDialogueActive: expect.any(Function)
    });
    expect(createCameraFrameRuntime).toHaveBeenCalledWith({
      tutorial: { id: "tutorial" },
      openingRuntime: gameplayOpeningRuntime,
      isGameplayFlow: expect.any(Function),
      playNavigateSound: expect.any(Function)
    });
    expect(createFlowStateReader).toHaveBeenCalledWith({
      isGameFlow,
      gameFlowValues,
      actTwoTutorial: { id: "tutorial" },
      pokedexUiState: { open: false },
      gameplayDialogue,
      controls: { id: "controls" }
    });

    const presentationOptions =
      createOpeningPresentationFrameRuntime.mock.calls[0][0];
    expect(presentationOptions.isGameplayActive()).toBe(true);
    expect(presentationOptions.isDialogueActive()).toBe(true);
    expect(gameplayDialogue.isActive).toHaveBeenCalledOnce();

    const cameraOptions = createCameraFrameRuntime.mock.calls[0][0];
    expect(cameraOptions.isGameplayFlow()).toBe(true);
    cameraOptions.playNavigateSound();

    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.UI_NAVIGATE);
  });
});
