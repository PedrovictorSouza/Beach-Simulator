import { describe, expect, it } from "vitest";
import { createGridPlacementArea } from "../app/gameplay/worldCoordinateModel.js";
import { createWorldObjectPlacementPreviewDescriptor } from "../app/gameplay/worldObjectPlacementPreview.js";

describe("world object placement preview", () => {
  const greenhouse = {
    id: "greenhouse",
    label: "Greenhouse",
    placementMode: "crafted-placeable",
    footprint: { width: 5, height: 3 },
    sourceItemId: "greenhouse",
    gridPlaceableId: "greenhouse"
  };

  it("builds a valid preview descriptor without mutating the world", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8
    });
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse, {
      originCell: { x: 2, y: 3 },
      placementArea,
      gridSystem: {
        cellToWorld(cell) {
          return { x: cell.x, y: 0, z: cell.y };
        }
      }
    });

    expect(preview).toMatchObject({
      kind: "world-object-placement-preview",
      active: true,
      readyForConfirm: true,
      state: "valid",
      reason: null,
      objectId: "greenhouse",
      placementRuleType: "grid-footprint",
      originCell: { x: 2, y: 3 },
      worldPosition: { x: 2, y: 0, z: 3 },
      footprint: { width: 5, height: 3 },
      outline: {
        state: "valid",
        originCell: { x: 2, y: 3 },
        footprint: { width: 5, height: 3 },
        cellCount: 15
      },
      visual: {
        alpha: 0.64,
        tint: [0.55, 1, 0.46],
        tintStrength: 0.22,
        outline: "#7effa5"
      }
    });
    expect(preview.cells).toHaveLength(15);
    expect(preview.cells.every((entry) => entry.state === "valid")).toBe(true);
    expect(preview.validation.valid).toBe(true);
  });

  it("returns a pending preview before a target cell exists", () => {
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse);

    expect(preview).toMatchObject({
      active: true,
      readyForConfirm: false,
      state: "pending",
      reason: "missing-grid-cell",
      originCell: null,
      worldPosition: null,
      outline: {
        state: "pending",
        originCell: null,
        footprint: { width: 5, height: 3 },
        cellCount: 0
      },
      visual: {
        alpha: 0.36,
        tint: [1, 0.84, 0.43],
        tintStrength: 0.34,
        outline: "#ffd66d"
      }
    });
    expect(preview.cells).toEqual([]);
  });

  it("marks blocked cells while keeping the full footprint visible", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8,
      blockedCells: [{ x: 4, y: 4 }]
    });
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse, {
      originCell: { x: 2, y: 3 },
      placementArea
    });

    expect(preview).toMatchObject({
      readyForConfirm: false,
      state: "invalid",
      reason: "occupied-footprint",
      outline: {
        state: "invalid",
        cellCount: 15
      },
      visual: {
        alpha: 0.42,
        tint: [1, 0.04, 0.02],
        tintStrength: 0.82,
        outline: "#ff5a36"
      }
    });
    expect(preview.cells.find((entry) => entry.cell.x === 4 && entry.cell.y === 4)?.state).toBe("blocked");
    expect(preview.cells.filter((entry) => entry.state === "available")).toHaveLength(14);
  });

  it("marks cells outside bounds for previews that cross the placement area", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 8,
      height: 6
    });
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse, {
      originCell: { x: 5, y: 4 },
      placementArea
    });

    expect(preview.state).toBe("invalid");
    expect(preview.reason).toBe("outside-world-bounds");
    expect(preview.cells.some((entry) => entry.state === "outside")).toBe(true);
    expect(preview.cells).toHaveLength(15);
  });

  it("keeps inactive previews visible but not confirmable", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8
    });
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse, {
      active: false,
      originCell: { x: 1, y: 1 },
      placementArea
    });

    expect(preview.active).toBe(false);
    expect(preview.state).toBe("valid");
    expect(preview.readyForConfirm).toBe(false);
  });
});
