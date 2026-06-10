import { describe, expect, it } from "vitest";

import {
  getWrappedPlanarDelta,
  isWorldPositionWithinRenderDistance
} from "../app/runtime/presentation/renderDistance.js";

describe("render distance presentation helpers", () => {
  it("keeps objects inside the planar render distance", () => {
    expect(isWorldPositionWithinRenderDistance(
      [3, 0, 4],
      [0, 0, 0],
      5,
      { worldLimit: 100 }
    )).toBe(true);

    expect(isWorldPositionWithinRenderDistance(
      [6, 0, 0],
      [0, 0, 0],
      5,
      { worldLimit: 100 }
    )).toBe(false);
  });

  it("wraps planar distance around the configured world limit", () => {
    expect(getWrappedPlanarDelta(-9, 9, 10)).toBe(2);
    expect(getWrappedPlanarDelta(9, -9, 10)).toBe(-2);

    expect(isWorldPositionWithinRenderDistance(
      [-9, 0, 0],
      [9, 0, 0],
      3,
      { worldLimit: 10 }
    )).toBe(true);
  });

  it("keeps the previous permissive fallback for invalid inputs", () => {
    expect(isWorldPositionWithinRenderDistance(null, [0, 0, 0], 5)).toBe(true);
    expect(isWorldPositionWithinRenderDistance([0, 0, 0], null, 5)).toBe(true);
    expect(isWorldPositionWithinRenderDistance([100, 0, 0], [0, 0, 0], 0)).toBe(true);
  });
});
