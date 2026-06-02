import { describe, expect, it } from "vitest";

import { getLeppaTreeMissionParticleBillboards } from "../app/runtime/leppaTreeMissionParticleBillboards.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const config = {
  count: 3,
  radius: 0.72,
  baseHeight: 0.62,
  height: 1.64
};

describe("getLeppaTreeMissionParticleBillboards", () => {
  it("returns an empty list when the mission effect is inactive or incomplete", () => {
    expect(getLeppaTreeMissionParticleBillboards({
      active: false,
      leppaTree: { position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      clamp01,
      config
    })).toEqual([]);
    expect(getLeppaTreeMissionParticleBillboards({
      active: true,
      leppaTree: null,
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      clamp01,
      config
    })).toEqual([]);
    expect(getLeppaTreeMissionParticleBillboards({
      active: true,
      leppaTree: { position: [1, 2, 3] },
      texture: null,
      uvRect: [0, 0, 1, 1],
      now: 0,
      clamp01,
      config
    })).toEqual([]);
  });

  it("preserves the existing billboard shape and configured particle count", () => {
    const billboards = getLeppaTreeMissionParticleBillboards({
      active: true,
      leppaTree: { position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 0,
      clamp01,
      config
    });

    expect(billboards).toHaveLength(3);
    expect(billboards[0]).toMatchObject({
      texture: "spark",
      position: [1.3888, 2.62, 3],
      uvRect: [0, 0, 1, 1],
      alpha: 0,
      rotation: 0
    });
    expect(billboards[0].size[0]).toBeCloseTo(0.123);
    expect(billboards[0].size[1]).toBeCloseTo(0.123);
  });

  it("calculates deterministic animation values from the frame timestamp", () => {
    const options = {
      active: true,
      leppaTree: { position: [1, 2, 3] },
      texture: "spark",
      uvRect: [0, 0, 1, 1],
      now: 950,
      clamp01,
      config
    };

    expect(getLeppaTreeMissionParticleBillboards(options)).toEqual(
      getLeppaTreeMissionParticleBillboards(options)
    );
  });
});
