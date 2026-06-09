import { describe, expect, it } from "vitest";

import {
  buildPlacementPreviewFootprintCells,
  buildSolarStationFieldMarkedGroundCells,
  doPlacementRectsOverlap,
  getPlacementPreviewFootprintWorldSize,
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

  it("builds placement preview footprint cells from snapped position and rotated footprint", () => {
    expect(buildPlacementPreviewFootprintCells({
      snappedPosition: [10, 0.03, 20],
      gridStep: 2,
      yaw: Math.PI * 0.5
    }, {
      idPrefix: "preview",
      footprint: {
        width: 3,
        height: 2
      },
      targetState: "preview"
    })).toEqual([
      {
        id: "preview-0-0",
        offset: [9, 0.03, 18],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      },
      {
        id: "preview-1-0",
        offset: [11, 0.03, 18],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      },
      {
        id: "preview-0-1",
        offset: [9, 0.03, 20],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      },
      {
        id: "preview-1-1",
        offset: [11, 0.03, 20],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      },
      {
        id: "preview-0-2",
        offset: [9, 0.03, 22],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      },
      {
        id: "preview-1-2",
        offset: [11, 0.03, 22],
        surfaceY: 0.03,
        tileSpan: 2,
        highlightTargetState: "preview"
      }
    ]);
  });

  it("resolves placement preview footprint world size", () => {
    expect(getPlacementPreviewFootprintWorldSize({
      gridConfig: {
        cellSize: 1.5
      },
      yaw: Math.PI * 0.5
    }, {
      width: 4,
      height: 2
    })).toEqual([3, 6]);
  });

  it("builds Solar Station marked field cells from finite bounds with a tile limit", () => {
    expect(buildSolarStationFieldMarkedGroundCells({
      bounds: {
        minX: 0,
        maxX: 2,
        minZ: 0,
        maxZ: 2
      },
      gridStep: 1,
      showField: true
    }, {
      markedTileLimit: 3
    })).toEqual([
      {
        id: "solar-station-field-0-0",
        offset: [0, 0.02, 0],
        surfaceY: 0.02,
        tileSpan: 1
      },
      {
        id: "solar-station-field-1-0",
        offset: [1, 0.02, 0],
        surfaceY: 0.02,
        tileSpan: 1
      },
      {
        id: "solar-station-field-2-0",
        offset: [2, 0.02, 0],
        surfaceY: 0.02,
        tileSpan: 1
      }
    ]);
  });
});
