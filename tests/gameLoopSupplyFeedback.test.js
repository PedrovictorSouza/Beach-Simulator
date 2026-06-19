import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopSupplyFeedbackRuntimeBundle
} from "../app/runtime/gameLoopSupplyFeedback.js";

describe("createGameLoopSupplyFeedbackRuntimeBundle", () => {
  it("wires supply feedback dependencies for the game loop", () => {
    const supplyBundle = {
      playerCounterPromptRuntime: { id: "counter" },
      pushSupplyResourceCollectFeedback: vi.fn(),
      queueChangedSupplyPickupFlyItems: vi.fn(),
      queueSupplyPickupFlyItems: vi.fn(),
      supplyCounterPromptController: { id: "controller" }
    };
    const createRuntime = vi.fn(() => supplyBundle);
    const getNowMs = vi.fn(() => 1000);

    const result = createGameLoopSupplyFeedbackRuntimeBundle({
      audio: { id: "audio" },
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      callbacks: {
        getNowMs
      },
      createRuntime
    });

    expect(result).toBe(supplyBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      audio: { id: "audio" },
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      getNowMs,
      hud: { id: "hud" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" }
    });
  });
});
