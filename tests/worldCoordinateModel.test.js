import { describe, expect, it } from "vitest";
import {
  areGridCellsEqual,
  clampGridCellToBounds,
  createGridDebugVisualization,
  createGridPlacementArea,
  createGridCoordinateModel,
  doesGridRectFitBounds,
  getCardinalGridCellNeighbors,
  getGridCellKey,
  getGridCellNeighbor,
  getGridCellRange,
  getGridCellRect,
  isGridCellInsideBounds,
  normalizeGridAreaSize,
  normalizeGridBounds,
  normalizeGridCell,
  normalizeWorldPosition,
  offsetGridCell,
  parseGridCellKey,
  SANDBOTS_WORLD_COORDINATE_MODEL
} from "../app/gameplay/worldCoordinateModel.js";

describe("Sandbots world coordinate model", () => {
  it("defines the world axes and the ground grid axes", () => {
    expect(SANDBOTS_WORLD_COORDINATE_MODEL).toMatchObject({
      worldPositionShape: ["x", "y", "z"],
      gridCellShape: ["x", "y"],
      groundPlane: {
        columnWorldAxis: "x",
        rowWorldAxis: "z",
        heightWorldAxis: "y"
      },
      cellKeySeparator: ":",
      defaultCellSize: 1
    });
    expect(Object.isFrozen(SANDBOTS_WORLD_COORDINATE_MODEL)).toBe(true);
  });

  it("normalizes array and object world positions into x/y/z objects", () => {
    expect(normalizeWorldPosition([3, 2, -4])).toEqual({ x: 3, y: 2, z: -4 });
    expect(normalizeWorldPosition({ x: "7", y: 1.5, z: null })).toEqual({ x: 7, y: 1.5, z: 0 });
    expect(normalizeWorldPosition({ x: Number.NaN, y: undefined, z: Infinity })).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("normalizes grid cells and keeps deterministic keys", () => {
    expect(normalizeGridCell({ x: 3.9, y: -2.2 })).toEqual({ x: 3, y: -2 });
    expect(normalizeGridCell({ col: 3, row: 9 })).toEqual({ x: 3, y: 9 });
    expect(getGridCellKey({ x: -4, y: 12 })).toBe("-4:12");
    expect(parseGridCellKey("-4:12")).toEqual({ x: -4, y: 12 });
    expect(parseGridCellKey("-4:12:0")).toBeNull();
    expect(parseGridCellKey("a:12")).toBeNull();
  });

  it("compares and offsets grid cells without mutating inputs", () => {
    const cell = { x: 4, y: 5 };

    expect(areGridCellsEqual(cell, { col: 4, row: 5 })).toBe(true);
    expect(areGridCellsEqual(cell, { x: 5, y: 5 })).toBe(false);
    expect(areGridCellsEqual(cell, null)).toBe(false);
    expect(offsetGridCell(cell, { x: -2, y: 3 })).toEqual({ x: 2, y: 8 });
    expect(cell).toEqual({ x: 4, y: 5 });
  });

  it("resolves cardinal neighbors with explicit grid directions", () => {
    expect(getGridCellNeighbor({ x: 10, y: 20 }, "north")).toEqual({ x: 10, y: 19 });
    expect(getGridCellNeighbor({ x: 10, y: 20 }, "east", 3)).toEqual({ x: 13, y: 20 });
    expect(getCardinalGridCellNeighbors({ x: 0, y: 0 })).toEqual([
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ]);
    expect(() => getGridCellNeighbor({ x: 0, y: 0 }, "up")).toThrow("Unknown grid cell direction");
  });

  it("creates stable inclusive ranges and rectangular footprints", () => {
    expect(getGridCellRange({ x: 2, y: 1 }, { x: 0, y: 2 })).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 }
    ]);
    expect(getGridCellRect({ x: -1, y: 3 }, { width: 2, height: 2 })).toEqual([
      { x: -1, y: 3 },
      { x: 0, y: 3 },
      { x: -1, y: 4 },
      { x: 0, y: 4 }
    ]);
  });

  it("normalizes grid bounds and checks whether cells fit inside them", () => {
    const bounds = normalizeGridBounds({
      originCell: { x: 2, y: 3 },
      width: 4,
      height: 3
    });

    expect(bounds).toEqual({
      originCell: { x: 2, y: 3 },
      width: 4,
      height: 3,
      minCell: { x: 2, y: 3 },
      maxCell: { x: 5, y: 5 }
    });
    expect(normalizeGridAreaSize({ width: 0, height: Number.NaN })).toEqual({ width: 1, height: 1 });
    expect(isGridCellInsideBounds({ x: 5, y: 5 }, bounds)).toBe(true);
    expect(isGridCellInsideBounds({ x: 6, y: 5 }, bounds)).toBe(false);
    expect(clampGridCellToBounds({ x: 8, y: 1 }, bounds)).toEqual({ x: 5, y: 3 });
    expect(doesGridRectFitBounds({ x: 4, y: 4 }, { width: 2, height: 2 }, bounds)).toBe(true);
    expect(doesGridRectFitBounds({ x: 5, y: 4 }, { width: 2, height: 2 }, bounds)).toBe(false);
  });

  it("defines valid placement areas with optional allowed and blocked cells", () => {
    const area = createGridPlacementArea({
      id: "tutorial-zone",
      originCell: { x: 10, y: 20 },
      width: 3,
      height: 2,
      allowedCells: [
        { x: 10, y: 20 },
        { x: 11, y: 20 },
        { x: 12, y: 20 }
      ],
      blockedCells: [{ x: 11, y: 20 }]
    });

    expect(area.id).toBe("tutorial-zone");
    expect(area.isCellInside({ x: 12, y: 21 })).toBe(true);
    expect(area.isCellInside({ x: 13, y: 21 })).toBe(false);
    expect(area.isCellAllowed({ x: 10, y: 20 })).toBe(true);
    expect(area.isCellAllowed({ x: 11, y: 20 })).toBe(false);
    expect(area.isCellAllowed({ x: 10, y: 21 })).toBe(false);
    expect(area.canPlaceRect({ x: 10, y: 20 }, { width: 1, height: 1 })).toBe(true);
    expect(area.canPlaceRect({ x: 10, y: 20 }, { width: 2, height: 1 })).toBe(false);
    expect(area.canPlaceRect({ x: 12, y: 20 }, { width: 2, height: 1 })).toBe(false);
  });

  it("creates a renderer-agnostic debug visualization payload for grid cells", () => {
    const grid = createGridCoordinateModel({
      cellSize: 2,
      origin: { x: -10, y: 1, z: 4 },
      visualOffsetY: 0.08
    });
    const placementArea = createGridPlacementArea({
      originCell: { x: 2, y: 3 },
      width: 2,
      height: 2,
      allowedCells: [
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 4 }
      ],
      blockedCells: [{ x: 3, y: 3 }]
    });

    const debug = createGridDebugVisualization({
      grid,
      placementArea
    });

    expect(debug).toMatchObject({
      kind: "grid-debug-visualization",
      bounds: {
        originCell: { x: 2, y: 3 },
        width: 2,
        height: 2
      },
      cellCount: 4
    });
    expect(debug.cells.map((cell) => [cell.key, cell.label, cell.state])).toEqual([
      ["2:3", "2:3", "valid"],
      ["3:3", "3:3", "blocked"],
      ["2:4", "2:4", "valid"],
      ["3:4", "3:4", "restricted"]
    ]);
    expect(debug.cells[0].centerWorldPosition).toEqual({ x: -5, y: 1.08, z: 11 });
    expect(debug.cells[0].cellSize).toBe(2);
    expect(Object.isFrozen(debug.cells)).toBe(true);
  });

  it("can create unlabeled debug visualization from explicit bounds only", () => {
    const debug = createGridDebugVisualization({
      originCell: { x: -1, y: -1 },
      width: 2,
      height: 1,
      includeLabels: false
    });

    expect(debug.cells).toEqual([
      {
        key: "-1:-1",
        cell: { x: -1, y: -1 },
        label: "",
        state: "normal",
        centerWorldPosition: null,
        cellSize: 1
      },
      {
        key: "0:-1",
        cell: { x: 0, y: -1 },
        label: "",
        state: "normal",
        centerWorldPosition: null,
        cellSize: 1
      }
    ]);
  });

  it("converts world positions to cells and cells back to world positions with a moved origin", () => {
    const grid = createGridCoordinateModel({
      cellSize: 2,
      origin: { x: -10, y: 1, z: 4 },
      visualOffsetY: 0.08
    });

    expect(grid.worldToCell({ x: -9.9, z: 4.1 })).toEqual({ x: 0, y: 0 });
    expect(grid.worldToCell({ x: -4.1, z: 8.2 })).toEqual({ x: 2, y: 2 });
    expect(grid.cellToWorld({ x: 2, y: 2 })).toEqual({ x: -6, y: 1, z: 8 });
    expect(grid.cellToWorld({ x: 2, y: 2 }, { center: true, includeVisualOffset: true })).toEqual({
      x: -5,
      y: 1.08,
      z: 9
    });
    expect(grid.getCellRect({ x: 2, y: 2 }, { width: 2, height: 1 })).toEqual([
      { x: 2, y: 2 },
      { x: 3, y: 2 }
    ]);
    expect(grid.doesRectFitBounds(
      { x: 2, y: 2 },
      { width: 2, height: 1 },
      { originCell: { x: 0, y: 0 }, width: 4, height: 4 }
    )).toBe(true);
  });

  it("rejects invalid grid configuration early", () => {
    expect(() => createGridCoordinateModel({ cellSize: 0 })).toThrow("cellSize must be greater than zero");
    expect(() => createGridCoordinateModel({ cellSize: Number.NaN })).toThrow("cellSize must be a finite number");
  });
});
