import { describe, expect, it } from "vitest";

import {
  buildPlacementPreviewFootprintCells,
  buildSolarStationFieldMarkedGroundCells,
  createFoundationBuildZoneBlockerRect,
  doFoundationBuildZoneRectsOverlap,
  doPlacementRectsOverlap,
  getFoundationBuildZoneCellKeys,
  getFoundationBuildZoneWorldRect,
  getPlacementPreviewFootprintWorldSize,
  getPlacementCollisionSize,
  getPlacementRect,
  getRotatedGridFootprint,
  getRotatedPlacementSize,
  getSnappedPlacementPreviewPosition,
  hasFinitePlacementBounds,
  isFoundationBuildZoneOriginInsideGrid,
  normalizeFoundationBuildZoneOriginCell,
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

  it("detects finite placement bounds", () => {
    expect(hasFinitePlacementBounds({
      minX: 0,
      maxX: 1,
      minZ: 2,
      maxZ: 3
    })).toBe(true);
    expect(hasFinitePlacementBounds({
      minX: 0,
      maxX: Number.POSITIVE_INFINITY,
      minZ: 2,
      maxZ: 3
    })).toBe(false);
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

  it("snaps placement preview position to grid cells inside finite bounds", () => {
    expect(getSnappedPlacementPreviewPosition({
      position: [2.9, 0.02, 4.2],
      gridConfig: {
        cellSize: 2,
        origin: {
          x: 0,
          z: 0
        },
        width: 4,
        height: 4
      },
      bounds: {
        minX: 1,
        maxX: 5,
        minZ: 1,
        maxZ: 5
      }
    })).toEqual([3, 0.02, 5]);
  });

  it("snaps placement preview position to bounded grid step when grid config is missing", () => {
    expect(getSnappedPlacementPreviewPosition({
      position: [2.6, 0.02, 3.6],
      gridStep: 1,
      bounds: {
        minX: 0,
        maxX: 3,
        minZ: 0,
        maxZ: 3
      }
    })).toEqual([3, 0.02, 3]);
  });

  it("returns the preview position when snap bounds are unavailable", () => {
    expect(getSnappedPlacementPreviewPosition({
      position: [2.6, 0.04, 3.6]
    })).toEqual([2.6, 0.02, 3.6]);
  });

  it("normalizes foundation build-zone origin cells with a fallback", () => {
    const fallbackOriginCell = { x: 10, y: 20 };

    expect(normalizeFoundationBuildZoneOriginCell({
      x: "3.8",
      z: "7.2"
    }, fallbackOriginCell)).toEqual({
      x: 3,
      y: 7
    });
    expect(normalizeFoundationBuildZoneOriginCell(null, fallbackOriginCell)).toEqual(fallbackOriginCell);
  });

  it("checks whether a foundation build-zone origin fits inside a grid", () => {
    const gridConfig = {
      width: 12,
      height: 8
    };

    expect(isFoundationBuildZoneOriginInsideGrid({
      originCell: { x: 6, y: 4 },
      width: 6,
      height: 4,
      gridConfig
    })).toBe(true);
    expect(isFoundationBuildZoneOriginInsideGrid({
      originCell: { x: 7, y: 4 },
      width: 6,
      height: 4,
      gridConfig
    })).toBe(false);
  });

  it("builds foundation build-zone cell keys and world rects", () => {
    const buildZone = {
      originCell: { x: 2, y: 3 },
      width: 4,
      height: 2,
      cells: [
        { x: 2, y: 3 },
        { x: 3, y: 3 }
      ]
    };
    const gridConfig = {
      cellSize: 1.5,
      origin: {
        x: -10,
        z: 5
      }
    };

    expect([...getFoundationBuildZoneCellKeys(buildZone)]).toEqual(["2:3", "3:3"]);
    expect(getFoundationBuildZoneWorldRect(buildZone, gridConfig)).toEqual({
      minX: -7,
      maxX: -1,
      minZ: 9.5,
      maxZ: 12.5
    });
    expect(getFoundationBuildZoneWorldRect(null, gridConfig)).toBeNull();
  });

  it("creates foundation blocker rects and checks padded overlap", () => {
    expect(createFoundationBuildZoneBlockerRect({
      id: "player",
      kind: "player",
      position: [4, 0.02, 8],
      radius: 0.5
    })).toEqual({
      id: "player",
      kind: "player",
      minX: 3.5,
      maxX: 4.5,
      minZ: 7.5,
      maxZ: 8.5
    });
    expect(createFoundationBuildZoneBlockerRect({
      position: [4, 0.02, 8],
      size: [2, 4]
    })).toEqual({
      id: "blocker",
      kind: "object",
      minX: 3,
      maxX: 5,
      minZ: 6,
      maxZ: 10
    });
    expect(createFoundationBuildZoneBlockerRect({
      position: null
    })).toBeNull();
    expect(doFoundationBuildZoneRectsOverlap({
      minX: 0,
      maxX: 2,
      minZ: 0,
      maxZ: 2
    }, {
      minX: 2.05,
      maxX: 4,
      minZ: 0,
      maxZ: 2
    }, 0.08)).toBe(true);
  });
});
