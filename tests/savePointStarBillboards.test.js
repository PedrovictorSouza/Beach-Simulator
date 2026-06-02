import { describe, expect, it } from "vitest";

import { getSavePointStarBillboards } from "../app/runtime/savePointStarBillboards.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const config = {
  count: 3,
  radius: 0.64,
  height: 1.18,
  duration: 1.9
};

describe("getSavePointStarBillboards", () => {
  it("returns an empty list without a save-point position or texture", () => {
    expect(getSavePointStarBillboards({
      logChair: null,
      texture: "star",
      uvRect: [0, 0, 1, 1],
      now: 1000,
      clamp01,
      config
    })).toEqual([]);
    expect(getSavePointStarBillboards({
      logChair: { position: [1, 2, 3] },
      texture: null,
      uvRect: [0, 0, 1, 1],
      now: 1000,
      clamp01,
      config
    })).toEqual([]);
  });

  it("preserves the existing billboard shape and star count", () => {
    const billboards = getSavePointStarBillboards({
      logChair: { position: [1, 2, 3] },
      texture: "star",
      uvRect: [0, 0, 1, 1],
      now: 0,
      clamp01,
      config
    });

    expect(billboards).toHaveLength(3);
    expect(billboards[0]).toEqual({
      texture: "star",
      position: [1.2176, 2.24, 3],
      size: [0.0936, 0.0936],
      uvRect: [0, 0, 1, 1],
      alpha: 0,
      rotation: 0
    });
  });

  it("calculates deterministic animation values from the frame timestamp", () => {
    const [billboard] = getSavePointStarBillboards({
      logChair: { position: [1, 2, 3] },
      texture: "star",
      uvRect: [0, 0, 1, 1],
      now: 950,
      clamp01,
      config: {
        ...config,
        count: 1
      }
    });

    expect(billboard.texture).toBe("star");
    expect(billboard.uvRect).toEqual([0, 0, 1, 1]);
    expect(billboard.position[0]).toBeCloseTo(1.299362);
    expect(billboard.position[1]).toBeCloseTo(2.83);
    expect(billboard.position[2]).toBeCloseTo(3.307004);
    expect(billboard.size[0]).toBeCloseTo(0.113084);
    expect(billboard.size[1]).toBeCloseTo(0.113084);
    expect(billboard.alpha).toBe(1);
    expect(billboard.rotation).toBeCloseTo(0.60306);
  });
});
