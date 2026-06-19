import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopCompanionFrameRuntimeBundle
} from "../app/runtime/gameLoopCompanionFrame.js";

describe("createGameLoopCompanionFrameRuntimeBundle", () => {
  it("wires companion frame runtime dependencies for the game loop", () => {
    const companionFrameBundle = {
      companionEncounterRuntime: { id: "encounter" },
      companionFrameRuntime: { id: "frame" }
    };
    const createCompanionFrameRuntimeBundle =
      vi.fn(() => companionFrameBundle);
    const isGameFlow = vi.fn((flow) => flow === "gameplay");
    const runtimes = {
      beeFieldRuntime: { id: "bee-field" },
      gameplayDialogue: { id: "dialogue" }
    };

    const result = createGameLoopCompanionFrameRuntimeBundle({
      audio: { id: "audio" },
      controls: { id: "controls" },
      gameFlowValues: {
        GAMEPLAY: "gameplay"
      },
      isGameFlow,
      rendering: { id: "rendering" },
      session: { id: "session" },
      runtimes,
      createCompanionFrameRuntimeBundle
    });

    expect(result).toBe(companionFrameBundle);
    expect(createCompanionFrameRuntimeBundle).toHaveBeenCalledWith({
      session: { id: "session" },
      controls: { id: "controls" },
      rendering: { id: "rendering" },
      audio: { id: "audio" },
      callbacks: {
        isGameplayActive: expect.any(Function)
      },
      runtimes
    });

    const options = createCompanionFrameRuntimeBundle.mock.calls[0][0];
    expect(options.callbacks.isGameplayActive()).toBe(true);
    expect(isGameFlow).toHaveBeenCalledWith("gameplay");
  });
});
