import { describe, expect, it } from "vitest";

import { getBulbasaurInteractionRadiusGizmoBillboards } from "../app/runtime/bulbasaurInteractionRadiusGizmoBillboards.js";

const config = {
  dotCount: 4,
  dotSize: 0.16,
  interactDistance: 2
};

describe("getBulbasaurInteractionRadiusGizmoBillboards", () => {
  it("returns an empty list without a visible encounter, position or texture", () => {
    expect(getBulbasaurInteractionRadiusGizmoBillboards({
      encounter: { visible: false, position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      config
    })).toEqual([]);
    expect(getBulbasaurInteractionRadiusGizmoBillboards({
      encounter: { visible: true },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      config
    })).toEqual([]);
    expect(getBulbasaurInteractionRadiusGizmoBillboards({
      encounter: { visible: true, position: [1, 2, 3] },
      texture: null,
      uvRect: [0, 0, 1, 1],
      now: 0,
      config
    })).toEqual([]);
  });

  it("preserves the existing ring billboard shape and configured dot count", () => {
    const billboards = getBulbasaurInteractionRadiusGizmoBillboards({
      encounter: { visible: true, position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      config
    });

    expect(billboards).toHaveLength(4);
    expect(billboards[0]).toMatchObject({
      texture: "spark",
      position: [3, 2.14, 3],
      uvRect: [0, 0, 1, 1],
      alpha: 0.74,
      rotation: 0
    });
    expect(billboards[0].size[0]).toBeCloseTo(0.1312);
    expect(billboards[0].size[1]).toBeCloseTo(0.1312);
    expect(billboards[1].position[0]).toBeCloseTo(1);
    expect(billboards[1].position[2]).toBeCloseTo(5);
  });

  it("calculates deterministic animation values from the frame timestamp", () => {
    const options = {
      encounter: { visible: true, position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 750,
      config
    };

    expect(getBulbasaurInteractionRadiusGizmoBillboards(options)).toEqual(
      getBulbasaurInteractionRadiusGizmoBillboards(options)
    );
  });
});
