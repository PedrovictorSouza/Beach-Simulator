import { describe, expect, it } from "vitest";

import { getFlowerArrangementBillboards } from "../app/runtime/flowerArrangementBillboards.js";

function createPatch(overrides = {}) {
  return {
    id: "flower-1",
    cellId: "cell-1",
    position: [1, 2, 3],
    size: [0.5, 0.75],
    ...overrides
  };
}

describe("getFlowerArrangementBillboards", () => {
  it("returns the provided target unchanged when the patch or texture is missing", () => {
    const target = [{ texture: "existing" }];

    expect(getFlowerArrangementBillboards({
      groundFlowerPatch: null,
      texture: "flower",
      target
    })).toBe(target);
    expect(getFlowerArrangementBillboards({
      groundFlowerPatch: createPatch(),
      texture: null,
      target
    })).toBe(target);
    expect(target).toEqual([{ texture: "existing" }]);
  });

  it("appends the existing flower arrangement shape and caches jitter on the patch", () => {
    const patch = createPatch();
    const target = [{ texture: "existing" }];

    const billboards = getFlowerArrangementBillboards({
      groundFlowerPatch: patch,
      texture: "flower",
      playerPosition: null,
      revivalScale: 1,
      now: 0,
      target
    });

    expect(billboards).toBe(target);
    expect(billboards).toHaveLength(8);
    expect(patch.flowerArrangementSeedHash).toBe(3109401523);
    expect(patch.flowerArrangementJitters).toHaveLength(7);
    expect(billboards[1].texture).toBe("flower");
    expect(billboards[1].position[0]).toBeCloseTo(0.615);
    expect(billboards[1].position[1]).toBe(2);
    expect(billboards[1].position[2]).toBeCloseTo(2.769);
    expect(billboards[1].size).toEqual([0.41, 0.615]);
    expect(billboards[1].rotation).toBeCloseTo(0.036956);
  });

  it("keeps deterministic output and reacts to a nearby player", () => {
    const farPatch = createPatch();
    const nearPatch = createPatch();

    const farBillboards = getFlowerArrangementBillboards({
      groundFlowerPatch: farPatch,
      texture: "flower",
      playerPosition: [20, 0, 20],
      revivalScale: 1,
      now: 500
    });
    const nearBillboards = getFlowerArrangementBillboards({
      groundFlowerPatch: nearPatch,
      texture: "flower",
      playerPosition: [0.8, 0, 2.8],
      revivalScale: 1,
      now: 500
    });

    expect(getFlowerArrangementBillboards({
      groundFlowerPatch: createPatch(),
      texture: "flower",
      playerPosition: [20, 0, 20],
      revivalScale: 1,
      now: 500
    })).toEqual(farBillboards);
    expect(nearBillboards[0].position[1]).toBeGreaterThan(farBillboards[0].position[1]);
    expect(nearBillboards[0].size[0]).toBeGreaterThan(farBillboards[0].size[0]);
    expect(nearBillboards[0].rotation).not.toBe(farBillboards[0].rotation);
  });
});
