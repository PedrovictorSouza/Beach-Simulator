import { describe, expect, it } from "vitest";

import { createGearPickupParticleRuntime } from "../app/runtime/gearPickupParticleRuntime.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createRuntime() {
  return createGearPickupParticleRuntime({
    clamp01,
    count: 4,
    duration: 0.62,
    baseHeight: 0.42,
    lift: 0.78,
    radius: 0.72,
    size: 0.32
  });
}

describe("createGearPickupParticleRuntime", () => {
  it("creates one particle ring per valid source position", () => {
    const runtime = createRuntime();

    runtime.trigger([[1, 2, 3], null, [4, 5, 6]]);

    expect(runtime.getBillboards("spark-texture", [0, 0, 1, 1])).toHaveLength(8);
  });

  it("preserves the existing midpoint arc, pulse and rotation", () => {
    const runtime = createRuntime();

    runtime.trigger([[1, 2, 3]]);
    runtime.update(0.31);

    const [billboard] = runtime.getBillboards("spark-texture", [0, 0, 1, 1]);

    expect(billboard.texture).toBe("spark-texture");
    expect(billboard.position[0]).toBeCloseTo(1.2232);
    expect(billboard.position[1]).toBeCloseTo(3.2);
    expect(billboard.position[2]).toBeCloseTo(3);
    expect(billboard.size[0]).toBeCloseTo(0.40672);
    expect(billboard.size[1]).toBeCloseTo(0.40672);
    expect(billboard.uvRect).toEqual([0, 0, 1, 1]);
    expect(billboard.alpha).toBe(1);
    expect(billboard.rotation).toBeCloseTo(1.054);
  });

  it("removes particles when their duration expires", () => {
    const runtime = createRuntime();

    runtime.trigger([[1, 2, 3]]);
    runtime.update(0.62);

    expect(runtime.getBillboards("spark-texture", [0, 0, 1, 1])).toEqual([]);
  });

  it("keeps effects independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.trigger([[1, 2, 3]]);

    expect(first.getBillboards("spark-texture", [0, 0, 1, 1])).toHaveLength(4);
    expect(second.getBillboards("spark-texture", [0, 0, 1, 1])).toEqual([]);
  });
});
