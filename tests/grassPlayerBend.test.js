import { describe, expect, it } from "vitest";

import { getGrassPlayerBend } from "../app/runtime/grassPlayerBend.js";

describe("getGrassPlayerBend", () => {
  it("returns a neutral bend without a valid grass patch or player position", () => {
    expect(getGrassPlayerBend(null, [0, 0, 0])).toEqual({
      offsetX: 0,
      offsetZ: 0,
      swayStrength: 0
    });
    expect(getGrassPlayerBend({ position: [1, 0, 1] }, null)).toEqual({
      offsetX: 0,
      offsetZ: 0,
      swayStrength: 0
    });
  });

  it("does not bend grass at or outside the reaction radius", () => {
    expect(getGrassPlayerBend({ position: [0.92, 0, 0] }, [0, 0, 0])).toEqual({
      offsetX: 0,
      offsetZ: 0,
      swayStrength: 0
    });
    expect(getGrassPlayerBend({ position: [2, 0, 0] }, [0, 0, 0])).toEqual({
      offsetX: 0,
      offsetZ: 0,
      swayStrength: 0
    });
  });

  it("calculates the existing directional bend inside the reaction radius", () => {
    const bend = getGrassPlayerBend(
      { position: [1, 0, 1] },
      [0.6, 0, 0.8]
    );

    expect(bend.offsetX).toBeCloseTo(0.033075);
    expect(bend.offsetZ).toBeCloseTo(0.016538);
    expect(bend.swayStrength).toBeCloseTo(0.042525);
  });

  it("uses the existing fallback direction when the player overlaps the grass patch", () => {
    const bend = getGrassPlayerBend(
      { position: [1, 0, 1] },
      [1, 0, 1]
    );

    expect(bend.offsetX).toBeCloseTo(139.695818);
    expect(bend.offsetZ).toBe(0);
    expect(bend.swayStrength).toBeCloseTo(179.608908);
  });
});
