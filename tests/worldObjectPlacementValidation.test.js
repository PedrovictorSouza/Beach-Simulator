import { describe, expect, it } from "vitest";
import { createGridPlacementArea } from "../app/gameplay/worldCoordinateModel.js";
import { validateWorldObjectPlacement } from "../app/gameplay/worldObjectPlacementValidation.js";

describe("world object placement validation", () => {
  const greenhouse = {
    id: "greenhouse",
    label: "Greenhouse",
    placementMode: "crafted-placeable",
    footprint: { width: 5, height: 3 },
    sourceItemId: "greenhouse",
    gridPlaceableId: "greenhouse"
  };

  it("accepts a crafted object when its grid footprint is inside the available area", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8
    });

    const result = validateWorldObjectPlacement(greenhouse, {
      originCell: { x: 2, y: 3 },
      placementArea
    });

    expect(result).toMatchObject({
      valid: true,
      reason: "valid",
      objectId: "greenhouse",
      placementRuleType: "grid-footprint",
      originCell: { x: 2, y: 3 },
      footprint: { width: 5, height: 3 }
    });
    expect(result.footprintCells).toHaveLength(15);
    expect(result.failures).toEqual([]);
  });

  it("rejects grid placement when a target cell is missing", () => {
    const result = validateWorldObjectPlacement(greenhouse);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("missing-grid-cell");
    expect(result.originCell).toBeNull();
    expect(result.footprintCells).toEqual([]);
    expect(result.failures).toEqual([{
      code: "missing-grid-cell",
      source: "requirement",
      requirement: "grid-cell"
    }]);
  });

  it("rejects footprints that do not fit the placement bounds", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 8,
      height: 6
    });

    const result = validateWorldObjectPlacement(greenhouse, {
      originCell: { x: 5, y: 4 },
      placementArea
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("outside-world-bounds");
    expect(result.failures).toContainEqual({
      code: "outside-world-bounds",
      source: "blocker",
      blocker: "world-bounds"
    });
  });

  it("rejects footprints blocked by the placement area", () => {
    const placementArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8,
      blockedCells: [{ x: 4, y: 4 }]
    });

    const result = validateWorldObjectPlacement(greenhouse, {
      originCell: { x: 2, y: 3 },
      placementArea
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("occupied-footprint");
    expect(result.failures).toEqual([{
      code: "occupied-footprint",
      source: "blocker",
      blocker: "occupied-footprint"
    }]);
  });

  it("accepts authored objects with fixed world positions", () => {
    const result = validateWorldObjectPlacement({
      id: "workbench",
      placementMode: "authored",
      position: [1, 0, 2],
      footprint: { width: 2, height: 1 }
    });

    expect(result).toMatchObject({
      valid: true,
      reason: "valid",
      objectId: "workbench",
      placementRuleType: "authored-fixed"
    });
  });

  it("rejects authored objects without a fixed world position", () => {
    const result = validateWorldObjectPlacement({
      id: "workbench",
      placementMode: "authored"
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("missing-world-position");
    expect(result.failures).toEqual([{
      code: "missing-world-position",
      source: "requirement",
      requirement: "world-position"
    }]);
  });

  it("rejects crafted objects missing source item or grid placeable metadata", () => {
    const result = validateWorldObjectPlacement({
      id: "greenhouse",
      placementMode: "crafted-placeable",
      footprint: { width: 5, height: 3 }
    }, {
      originCell: { x: 1, y: 1 }
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("missing-source-item");
    expect(result.failures).toEqual([
      {
        code: "missing-source-item",
        source: "requirement",
        requirement: "source-item"
      },
      {
        code: "missing-grid-placeable",
        source: "requirement",
        requirement: "grid-placeable"
      }
    ]);
  });
});
