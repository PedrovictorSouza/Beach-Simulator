import { describe, expect, it, vi } from "vitest";

import {
  createWorldCellPlannerSelection,
  getWorldCellPlannerGroundCells,
  projectWorldCellPlannerGroundCell,
  resolveWorldCellPlannerPick
} from "../app/runtime/worldCellPlannerPicking.js";

function createCanvas({
  width = 200,
  height = 100,
  rect = {
    left: 10,
    top: 20,
    width: 400,
    height: 200
  }
} = {}) {
  return {
    width,
    height,
    getBoundingClientRect: () => rect
  };
}

describe("world cell planner picking", () => {
  it("collects unique selectable ground cells from planner collections", () => {
    const deadCell = { id: "ground-1-2", offset: [1, 0, 2] };
    const duplicateCell = { id: "ground-1-2", offset: [9, 0, 9] };
    const coldCell = { id: "cold-cell", offset: [3, 0, 4] };
    const invalidCell = { id: "missing-offset" };

    expect(getWorldCellPlannerGroundCells({
      groundDeadInstances: [deadCell, null, invalidCell],
      groundPurifiedInstances: [duplicateCell],
      iceGroundInstances: [coldCell]
    })).toEqual([deadCell, coldCell]);
  });

  it("projects a ground cell through the camera and canvas rect", () => {
    const project = vi.fn(() => ({ x: 50, y: 25, depth: 0.5 }));
    const camera = { project };
    const worldCanvas = createCanvas();

    expect(projectWorldCellPlannerGroundCell({
      groundCell: {
        offset: [1, 0, 3],
        surfaceY: 2
      },
      camera,
      worldCanvas
    })).toEqual({ x: 110, y: 70 });
    expect(project).toHaveBeenCalledWith([1, 2.08, 3], 200, 100);
  });

  it("returns raw projected coordinates when the canvas rect is unusable", () => {
    expect(projectWorldCellPlannerGroundCell({
      groundCell: {
        offset: [1, 0, 3],
        surfaceY: 2
      },
      camera: {
        project: () => ({ x: 12, y: 18, depth: 0.2 })
      },
      worldCanvas: createCanvas({
        rect: {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        }
      })
    })).toEqual({ x: 12, y: 18 });
  });

  it("builds the planner selection DTO without owning grid rules", () => {
    const groundCell = {
      id: "cell-a",
      offset: [1.2349, 0, -2.3451],
      surfaceY: 0.1239,
      tileSpan: 2
    };

    expect(createWorldCellPlannerSelection({
      groundCell,
      getGridCell: () => ({ x: 7, y: 8 }),
      isColdGroundCell: (cell) => cell === groundCell
    })).toEqual({
      cellId: "cell-a",
      gridCell: { x: 7, y: 8 },
      worldPosition: [1.235, 0.124, -2.345],
      tileSpan: 2,
      groundKind: "cold"
    });

    expect(createWorldCellPlannerSelection({
      groundCell: {
        ...groundCell,
        groundKind: "purified"
      }
    }).groundKind).toBe("purified");
  });

  it("selects the nearest projected cell inside the pick radius", () => {
    const farCell = { id: "far", offset: [0, 0, 0] };
    const nearCell = { id: "near", offset: [0, 0, 0] };

    expect(resolveWorldCellPlannerPick({
      request: { clientX: 100, clientY: 100 },
      groundCells: [farCell, nearCell],
      projectGroundCell: (groundCell) => (
        groundCell === nearCell ?
          { x: 105, y: 104 } :
          { x: 130, y: 130 }
      ),
      createSelection: (groundCell) => ({ cellId: groundCell.id }),
      maxDistancePx: 10
    })).toEqual({
      groundCell: nearCell,
      selection: { cellId: "near" }
    });
  });

  it("ignores invalid requests, unprojectable cells and out-of-range picks", () => {
    expect(resolveWorldCellPlannerPick({
      request: { clientX: Number.NaN, clientY: 100 },
      groundCells: []
    })).toBeNull();

    expect(resolveWorldCellPlannerPick({
      request: { clientX: 100, clientY: 100 },
      groundCells: [{ id: "hidden" }],
      projectGroundCell: () => null,
      maxDistancePx: 10
    })).toBeNull();

    expect(resolveWorldCellPlannerPick({
      request: { clientX: 100, clientY: 100 },
      groundCells: [{ id: "far" }],
      projectGroundCell: () => ({ x: 200, y: 200 }),
      maxDistancePx: 10
    })).toBeNull();
  });
});
