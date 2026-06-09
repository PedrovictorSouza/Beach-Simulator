import { describe, expect, it } from "vitest";

import {
  getConstructionCloudBurstBillboards,
  getLeafDenConstructionBillboards
} from "../app/runtime/construction/constructionBillboards.js";

describe("construction billboards", () => {
  it("builds Leaf Den construction progress bars and stars", () => {
    const billboards = getLeafDenConstructionBillboards({
      active: true,
      leafDen: {
        position: [2, 0.1, 3]
      },
      progress: 0.5,
      barBackTexture: "bar-back",
      barFillTexture: "bar-fill",
      starTexture: "star",
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    });

    expect(billboards).toHaveLength(14);
    expect(billboards[0]).toEqual({
      texture: "bar-back",
      position: [2, 2.65, 3],
      size: [2.5, 0.2],
      uvRect: [0, 0, 1, 1]
    });
    expect(billboards[1]).toEqual({
      texture: "bar-fill",
      position: [1.4375, 2.6599999999999997, 2.985],
      size: [1.125, 0.136],
      uvRect: [0, 0, 1, 1]
    });
    expect(billboards[2]).toEqual(expect.objectContaining({
      texture: "star",
      uvRect: [0, 0, 1, 1]
    }));
  });

  it("omits Leaf Den construction billboards when inactive or missing position", () => {
    expect(getLeafDenConstructionBillboards({
      active: false,
      leafDen: {
        position: [2, 0.1, 3]
      },
      progress: 0.5,
      barBackTexture: "bar-back",
      barFillTexture: "bar-fill",
      starTexture: "star",
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    })).toEqual([]);
    expect(getLeafDenConstructionBillboards({
      active: true,
      leafDen: {},
      progress: 0.5,
      barBackTexture: "bar-back",
      barFillTexture: "bar-fill",
      starTexture: "star",
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    })).toEqual([]);
  });

  it("builds construction cloud burst stars from active bursts", () => {
    const billboards = getConstructionCloudBurstBillboards({
      bursts: [
        {
          position: [2, 0.1, 3],
          progress: 0.5
        }
      ],
      starTexture: "star",
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    });

    expect(billboards).toHaveLength(10);
    expect(billboards[0].texture).toBe("star");
    expect(billboards[0].position[0]).toBeCloseTo(2.648);
    expect(billboards[0].position[1]).toBeCloseTo(1.08);
    expect(billboards[0].position[2]).toBeCloseTo(3);
    expect(billboards[0].size[0]).toBeCloseTo(0.24);
    expect(billboards[0].size[1]).toBeCloseTo(0.24);
    expect(billboards[0].uvRect).toEqual([0, 0, 1, 1]);
    expect(billboards[0].rotation).toBe(0);
  });

  it("omits construction cloud burst stars without texture or bursts", () => {
    expect(getConstructionCloudBurstBillboards({
      bursts: [],
      starTexture: "star",
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    })).toEqual([]);
    expect(getConstructionCloudBurstBillboards({
      bursts: [
        {
          position: [2, 0.1, 3],
          progress: 0.5
        }
      ],
      starTexture: null,
      uvRect: [0, 0, 1, 1],
      nowSeconds: 0
    })).toEqual([]);
  });
});
