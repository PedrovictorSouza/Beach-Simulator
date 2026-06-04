import { describe, expect, it } from "vitest";

import { getRustlingGrassParticleBillboards } from "../app/runtime/rustlingGrassParticleBillboards.js";

describe("getRustlingGrassParticleBillboards", () => {
  it("returns an empty list without a texture", () => {
    expect(getRustlingGrassParticleBillboards(
      { position: [1, 2, 3] },
      null,
      0,
      [0, 0, 1, 1]
    )).toEqual([]);
  });

  it("preserves the existing particle shape and count", () => {
    const billboards = getRustlingGrassParticleBillboards(
      { position: [1, 2, 3] },
      "spark",
      0,
      [0, 0, 1, 1]
    );

    expect(billboards).toHaveLength(5);
    expect(billboards[0]).toEqual({
      texture: "spark",
      position: [1.18, 2.38, 3],
      size: [0.13, 0.13],
      uvRect: [0, 0, 1, 1]
    });
    expect(billboards[1].position[0]).toBeCloseTo(1.049612);
    expect(billboards[1].position[1]).toBeCloseTo(2.4902);
    expect(billboards[1].position[2]).toBeCloseTo(3.255224);
  });

  it("calculates deterministic animation values from the frame timestamp", () => {
    const args = [
      { position: [1, 2, 3] },
      "spark",
      750,
      [0, 0, 1, 1]
    ];

    expect(getRustlingGrassParticleBillboards(...args)).toEqual(
      getRustlingGrassParticleBillboards(...args)
    );
  });
});
