import { describe, expect, it } from "vitest";

import { createWoodCollectPopRuntime } from "../app/runtime/woodCollectPopRuntime.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createRuntime() {
  return createWoodCollectPopRuntime({
    clamp01,
    duration: 0.34,
    lift: 0.24,
    scale: 1.65
  });
}

function createSnapshots({ collected = true, uvRect } = {}) {
  return new Map([
    [
      { collected },
      {
        position: [1, 2, 3],
        size: [0.5, 0.75],
        uvRect
      }
    ]
  ]);
}

describe("createWoodCollectPopRuntime", () => {
  it("creates a billboard only for a collected wood drop", () => {
    const runtime = createRuntime();

    runtime.trigger(createSnapshots({ collected: false }));
    runtime.trigger(createSnapshots());

    expect(runtime.getBillboards("wood-texture", [0, 0, 1, 1])).toEqual([
      {
        texture: "wood-texture",
        position: [1, 2, 3],
        size: [0.5, 0.75],
        uvRect: [0, 0, 1, 1],
        alpha: 1
      }
    ]);
  });

  it("preserves the pop scale, lift, fade and snapshot uv rect", () => {
    const runtime = createRuntime();

    runtime.trigger(createSnapshots({ uvRect: [0.1, 0.2, 0.3, 0.4] }));
    runtime.update(0.17);

    const [billboard] = runtime.getBillboards("wood-texture", [0, 0, 1, 1]);

    expect(billboard.position).toEqual([1, 2.24, 3]);
    expect(billboard.size[0]).toBeCloseTo(0.825);
    expect(billboard.size[1]).toBeCloseTo(1.2375);
    expect(billboard.uvRect).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(billboard.alpha).toBe(1);
  });

  it("removes the effect when its duration expires", () => {
    const runtime = createRuntime();

    runtime.trigger(createSnapshots());
    runtime.update(0.34);

    expect(runtime.getBillboards("wood-texture", [0, 0, 1, 1])).toEqual([]);
  });

  it("keeps effects independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.trigger(createSnapshots());

    expect(first.getBillboards("wood-texture", [0, 0, 1, 1])).toHaveLength(1);
    expect(second.getBillboards("wood-texture", [0, 0, 1, 1])).toEqual([]);
  });
});
