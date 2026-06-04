import { describe, expect, it } from "vitest";

import { getCampfireWoodPileBillboards } from "../app/runtime/campfireWoodPileBillboards.js";

describe("getCampfireWoodPileBillboards", () => {
  it("creates the existing five wood pile billboards around the campfire", () => {
    const texture = { id: "wood" };
    const uvRect = [0, 0, 1, 1];
    const billboards = getCampfireWoodPileBillboards({
      campfire: { position: [10, 0.5, -4] },
      texture,
      uvRect
    });

    expect(billboards).toHaveLength(5);
    expect(billboards[0]).toEqual({
      texture,
      position: [9.64, 0.52, -4.16],
      size: [0.52, 0.38],
      uvRect,
      rotation: -0.48
    });
    expect(billboards[4]).toEqual({
      texture,
      position: [10, 0.545, -4.01],
      size: [0.52, 0.38],
      uvRect,
      rotation: 0.82
    });
  });

  it("returns no billboards without a campfire position or texture", () => {
    expect(getCampfireWoodPileBillboards({
      campfire: null,
      texture: { id: "wood" },
      uvRect: [0, 0, 1, 1]
    })).toEqual([]);
    expect(getCampfireWoodPileBillboards({
      campfire: { position: [0, 0, 0] },
      texture: null,
      uvRect: [0, 0, 1, 1]
    })).toEqual([]);
  });
});
