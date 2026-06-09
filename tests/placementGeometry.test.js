import { describe, expect, it } from "vitest";

import {
  doPlacementRectsOverlap,
  getPlacementCollisionSize,
  getPlacementRect,
  getRotatedGridFootprint,
  getRotatedPlacementSize,
  normalizePlacementYaw
} from "../app/runtime/construction/placementGeometry.js";

describe("placement geometry", () => {
  it("creates a centered placement rect from world position and footprint size", () => {
    expect(getPlacementRect([4, 0, 8], [2, 4])).toEqual({
      minX: 3,
      maxX: 5,
      minZ: 6,
      maxZ: 10
    });
  });

  it("checks placement rect overlap with the existing gutter behavior", () => {
    const a = {
      minX: 0,
      maxX: 2,
      minZ: 0,
      maxZ: 2
    };
    const touching = {
      minX: 2,
      maxX: 4,
      minZ: 0,
      maxZ: 2
    };
    const overlapping = {
      minX: 1,
      maxX: 3,
      minZ: 1,
      maxZ: 3
    };

    expect(doPlacementRectsOverlap(a, touching, 0)).toBe(false);
    expect(doPlacementRectsOverlap(a, overlapping, 0)).toBe(true);
  });

  it("uses placement size when valid and fallback size otherwise", () => {
    expect(getPlacementCollisionSize({
      size: [3, 2]
    }, [1, 1])).toEqual([3, 2]);
    expect(getPlacementCollisionSize({
      size: [0, 2]
    }, [1, 1])).toEqual([1, 1]);
  });

  it("normalizes yaw and rotates rectangular placement size by quarter turns", () => {
    expect(normalizePlacementYaw(-Math.PI * 0.5)).toBeCloseTo(Math.PI * 1.5);
    expect(getRotatedPlacementSize([2, 3], 0)).toEqual([2, 3]);
    expect(getRotatedPlacementSize([2, 3], Math.PI * 0.5)).toEqual([3, 2]);
    expect(getRotatedPlacementSize([2, 3], Math.PI)).toEqual([2, 3]);
  });

  it("normalizes and rotates grid footprints by quarter turns", () => {
    expect(getRotatedGridFootprint({
      width: 4,
      height: 2
    }, Math.PI * 0.5)).toEqual({
      width: 2,
      height: 4
    });
    expect(getRotatedGridFootprint({
      width: 4.4,
      height: 1.2
    }, Math.PI)).toEqual({
      width: 4,
      height: 1
    });
  });
});
