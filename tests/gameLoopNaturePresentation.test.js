import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopNaturePresentationRuntimeBundle
} from "../app/runtime/gameLoopNaturePresentation.js";

describe("createGameLoopNaturePresentationRuntimeBundle", () => {
  it("wires nature presentation runtime dependencies for the game loop", () => {
    const natureBundle = {
      gearPickupParticleRuntime: { id: "gear" },
      landscapeCutEffectRuntime: { id: "landscape" },
      naturePresentationFrameRuntime: { id: "nature-frame" },
      treeRevivalLeafBurstFrameRuntime: { id: "tree-burst" },
      woodCollectPopRuntime: { id: "wood-pop" }
    };
    const createRuntime = vi.fn(() => natureBundle);
    const math = {
      clamp01: vi.fn((value) => value),
      easeOutCubic: vi.fn((value) => value),
      lerp: vi.fn()
    };

    const result = createGameLoopNaturePresentationRuntimeBundle({
      camera: { id: "camera" },
      controls: { id: "controls" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      math,
      createRuntime
    });

    expect(result).toBe(natureBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      camera: { id: "camera" },
      controls: { id: "controls" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      callbacks: {
        getEncounterRepairBoxPosition: expect.any(Function)
      },
      math
    });
  });
});
