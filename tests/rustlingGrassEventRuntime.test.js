import { describe, expect, it } from "vitest";
import { createRustlingGrassEventRuntime } from "../app/runtime/world/rustlingGrassEventRuntime.js";

function createRuntimeWithFlags(flags) {
  return createRustlingGrassEventRuntime({
    getStoryState: () => ({ flags })
  });
}

describe("createRustlingGrassEventRuntime", () => {
  it("does not tick pending rustling grass while blocked", () => {
    const flags = {
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 1
    };
    const runtime = createRuntimeWithFlags(flags);

    const result = runtime.update({ deltaTime: 0.5, canAdvance: false });

    expect(result).toEqual({ advanced: false, activeCellId: null });
    expect(flags).toEqual({
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 1
    });
  });

  it("ticks the pending rustling grass delay without activating early", () => {
    const flags = {
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 1
    };
    const runtime = createRuntimeWithFlags(flags);

    const result = runtime.update({ deltaTime: 0.4, canAdvance: true });

    expect(result).toEqual({ advanced: false, activeCellId: null });
    expect(flags).toEqual({
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 0.6
    });
  });

  it("promotes pending rustling grass when the delay expires", () => {
    const flags = {
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 0.25
    };
    const runtime = createRuntimeWithFlags(flags);

    const result = runtime.update({ deltaTime: 0.5, canAdvance: true });

    expect(result).toEqual({ advanced: true, activeCellId: "ground-4-3" });
    expect(flags).toEqual({
      rustlingGrassCellId: "ground-4-3"
    });
  });

  it("does not promote pending grass when the encounter is already resolved or active", () => {
    const activeFlags = {
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 0,
      rustlingGrassCellId: "ground-1-1"
    };
    const resolvedFlags = {
      pendingRustlingGrassCellId: "ground-4-3",
      rustlingGrassDelay: 0,
      bulbasaurRevealed: true
    };

    expect(createRuntimeWithFlags(activeFlags).update({
      deltaTime: 0.5,
      canAdvance: true
    })).toEqual({ advanced: false, activeCellId: "ground-1-1" });
    expect(activeFlags.pendingRustlingGrassCellId).toBe("ground-4-3");

    expect(createRuntimeWithFlags(resolvedFlags).update({
      deltaTime: 0.5,
      canAdvance: true
    })).toEqual({ advanced: false, activeCellId: null });
    expect(resolvedFlags.pendingRustlingGrassCellId).toBe("ground-4-3");
  });
});
