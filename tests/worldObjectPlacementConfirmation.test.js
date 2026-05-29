import { describe, expect, it, vi } from "vitest";
import { createGridPlacementArea } from "../app/gameplay/worldCoordinateModel.js";
import {
  confirmWorldObjectPlacement,
  createWorldObjectPlacementRecord,
  WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON
} from "../app/gameplay/worldObjectPlacementConfirmation.js";
import { createWorldObjectPlacementPreviewDescriptor } from "../app/gameplay/worldObjectPlacementPreview.js";

describe("world object placement confirmation", () => {
  const greenhouse = {
    id: "greenhouse",
    label: "Greenhouse",
    placementMode: "crafted-placeable",
    footprint: { width: 5, height: 3 },
    sourceItemId: "greenhouse",
    gridPlaceableId: "greenhouse"
  };

  function createValidContext(extra = {}) {
    return {
      originCell: { x: 2, y: 3 },
      placementArea: createGridPlacementArea({
        originCell: { x: 0, y: 0 },
        width: 12,
        height: 8
      }),
      ...extra
    };
  }

  it("confirms a valid preview into a placement record and effects without requiring a commit adapter", () => {
    const result = confirmWorldObjectPlacement(greenhouse, createValidContext());

    expect(result).toMatchObject({
      confirmed: true,
      committed: false,
      reason: WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.CONFIRMED,
      placementRecord: {
        placedObjectId: "greenhouse@2:3",
        worldObjectId: "greenhouse",
        sourceDatabaseId: "greenhouse",
        sourceItemId: "greenhouse",
        gridPlaceableId: "greenhouse",
        originCell: { x: 2, y: 3 },
        size: { width: 5, height: 3 },
        footprint: { width: 5, height: 3 },
        placementRuleType: "grid-footprint"
      },
      committedRecord: null,
      effects: [
        {
          type: "place-world-object",
          objectId: "greenhouse",
          placedObjectId: "greenhouse@2:3",
          originCell: { x: 2, y: 3 },
          footprint: { width: 5, height: 3 }
        },
        {
          type: "consume-item",
          itemId: "greenhouse",
          quantity: 1
        }
      ]
    });
    expect(result.placementRecord.occupiedCells).toHaveLength(15);
    expect(result.preview.readyForConfirm).toBe(true);
  });

  it("commits through an addPlacedObject adapter only after preview validation passes", () => {
    const addPlacedObject = vi.fn((record) => ({
      placedObjectId: record.placedObjectId,
      originCell: record.originCell,
      size: record.size
    }));

    const result = confirmWorldObjectPlacement(greenhouse, createValidContext({
      placementStore: { addPlacedObject }
    }));

    expect(addPlacedObject).toHaveBeenCalledTimes(1);
    expect(addPlacedObject).toHaveBeenCalledWith(expect.objectContaining({
      placedObjectId: "greenhouse@2:3",
      sourceDatabaseId: "greenhouse",
      originCell: { x: 2, y: 3 },
      size: { width: 5, height: 3 }
    }));
    expect(result).toMatchObject({
      confirmed: true,
      committed: true,
      committedRecord: {
        placedObjectId: "greenhouse@2:3",
        originCell: { x: 2, y: 3 },
        size: { width: 5, height: 3 }
      }
    });
  });

  it("does not commit pending or invalid previews", () => {
    const commitPlacement = vi.fn();

    expect(confirmWorldObjectPlacement(greenhouse, { commitPlacement })).toMatchObject({
      confirmed: false,
      committed: false,
      reason: "missing-grid-cell",
      placementRecord: null
    });

    const invalidArea = createGridPlacementArea({
      originCell: { x: 0, y: 0 },
      width: 12,
      height: 8,
      blockedCells: [{ x: 4, y: 4 }]
    });
    expect(confirmWorldObjectPlacement(greenhouse, {
      originCell: { x: 2, y: 3 },
      placementArea: invalidArea,
      commitPlacement
    })).toMatchObject({
      confirmed: false,
      committed: false,
      reason: "occupied-footprint",
      placementRecord: null
    });

    expect(commitPlacement).not.toHaveBeenCalled();
  });

  it("reports commit rejection if the adapter refuses the valid placement", () => {
    const result = confirmWorldObjectPlacement(greenhouse, createValidContext({
      commitPlacement: () => null
    }));

    expect(result).toMatchObject({
      confirmed: false,
      committed: false,
      reason: WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.COMMIT_REJECTED,
      committedRecord: null,
      effects: []
    });
    expect(result.placementRecord).toMatchObject({
      placedObjectId: "greenhouse@2:3",
      originCell: { x: 2, y: 3 }
    });
  });

  it("uses supplied previews and rejects inactive previews", () => {
    const preview = createWorldObjectPlacementPreviewDescriptor(greenhouse, createValidContext({
      active: false
    }));

    expect(createWorldObjectPlacementRecord(greenhouse, preview)).toBeNull();
    expect(confirmWorldObjectPlacement(greenhouse, { preview })).toMatchObject({
      confirmed: false,
      committed: false,
      reason: WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.INACTIVE_PREVIEW,
      placementRecord: null
    });
  });
});
