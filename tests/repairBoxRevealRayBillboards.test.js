import { describe, expect, it } from "vitest";

import { getRepairBoxRevealRayBillboards } from "../app/runtime/repairBoxRevealRayBillboards.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const config = {
  count: 2,
  baseSize: 0.18,
  chargeProgressMax: 0.72
};

describe("getRepairBoxRevealRayBillboards", () => {
  it("returns an empty list without a target position or texture", () => {
    expect(getRepairBoxRevealRayBillboards({
      target: null,
      texture: "spark",
      now: 0,
      uvRect: [0, 0, 1, 1],
      clamp01,
      config
    })).toEqual([]);
    expect(getRepairBoxRevealRayBillboards({
      target: { position: [1, 2, 3] },
      texture: null,
      now: 0,
      uvRect: [0, 0, 1, 1],
      clamp01,
      config
    })).toEqual([]);
  });

  it("preserves the existing ray billboard shape and configured ray count", () => {
    const billboards = getRepairBoxRevealRayBillboards({
      target: { position: [1, 2, 3], progress: 0 },
      texture: "spark",
      now: 0,
      uvRect: [0, 0, 1, 1],
      clamp01,
      config
    });

    expect(billboards).toHaveLength(2);
    expect(billboards[0]).toMatchObject({
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      alpha: 0.38
    });
    expect(billboards[0].position[0]).toBeCloseTo(1.14);
    expect(billboards[0].position[1]).toBeCloseTo(2.14);
    expect(billboards[0].position[2]).toBeCloseTo(3);
    expect(billboards[0].size[0]).toBeCloseTo(0.10368);
    expect(billboards[0].size[1]).toBeCloseTo(0.2736);
    expect(billboards[0].rotation).toBeCloseTo(Math.PI * 0.5);
  });

  it("clamps progress before deriving the charged ray frame", () => {
    const [billboard] = getRepairBoxRevealRayBillboards({
      target: { position: [1, 2, 3], progress: 99 },
      texture: "spark",
      now: 0,
      uvRect: [0, 0, 1, 1],
      clamp01,
      config: {
        ...config,
        count: 1
      }
    });

    expect(billboard.alpha).toBeCloseTo(0.88);
    expect(billboard.size[0]).toBeCloseTo(0.25272);
    expect(billboard.size[1]).toBeCloseTo(0.6669);
  });

  it("calculates deterministic animation values from the frame timestamp", () => {
    const options = {
      target: { position: [1, 2, 3], progress: 0.44 },
      texture: "spark",
      now: 750,
      uvRect: [0, 0, 1, 1],
      clamp01,
      config
    };

    expect(getRepairBoxRevealRayBillboards(options)).toEqual(
      getRepairBoxRevealRayBillboards(options)
    );
  });
});
