import { describe, expect, it, vi } from "vitest";
import {
  confirmWorldObjectRemoval,
  createWorldObjectRemovalRecord,
  WORLD_OBJECT_REMOVAL_REASON
} from "../app/gameplay/worldObjectRemovalAction.js";

describe("world object removal action", () => {
  const greenhouseRecord = Object.freeze({
    placedObjectId: "greenhouse@2:3",
    worldObjectId: "greenhouse",
    sourceDatabaseId: "greenhouse",
    originCell: Object.freeze({ x: 2, y: 3 }),
    size: Object.freeze({ width: 2, height: 2 }),
    occupiedCells: Object.freeze([
      Object.freeze({ x: 2, y: 3 }),
      Object.freeze({ x: 3, y: 3 }),
      Object.freeze({ x: 2, y: 4 }),
      Object.freeze({ x: 3, y: 4 })
    ]),
    removable: true
  });

  function createPlacementStore({
    record = greenhouseRecord,
    removeResult = greenhouseRecord
  } = {}) {
    return {
      getObjectAt: vi.fn(() => record),
      removePlacedObjectAt: vi.fn(() => removeResult)
    };
  }

  it("removes a placed object through the occupancy adapter and returns removal effects", () => {
    const placementStore = createPlacementStore();
    const result = confirmWorldObjectRemoval({
      targetCell: { x: 3, y: 4 },
      placementStore
    });

    expect(placementStore.getObjectAt).toHaveBeenCalledWith({ x: 3, y: 4 });
    expect(placementStore.removePlacedObjectAt).toHaveBeenCalledWith({ x: 3, y: 4 });
    expect(result).toMatchObject({
      removed: true,
      committed: true,
      reason: WORLD_OBJECT_REMOVAL_REASON.REMOVED,
      targetCell: { x: 3, y: 4 },
      removalRecord: {
        placedObjectId: "greenhouse@2:3",
        worldObjectId: "greenhouse",
        sourceDatabaseId: "greenhouse",
        targetCell: { x: 3, y: 4 },
        originCell: { x: 2, y: 3 },
        size: { width: 2, height: 2 },
        footprint: { width: 2, height: 2 },
        removable: true
      },
      effects: [
        {
          type: "remove-world-object",
          objectId: "greenhouse",
          placedObjectId: "greenhouse@2:3",
          targetCell: { x: 3, y: 4 },
          originCell: { x: 2, y: 3 }
        },
        {
          type: "release-footprint",
          placedObjectId: "greenhouse@2:3",
          cells: [
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 4 },
            { x: 3, y: 4 }
          ]
        }
      ]
    });
    expect(result.removalRecord.occupiedCells).toHaveLength(4);
    expect(result.committedRecord).toBe(greenhouseRecord);
  });

  it("creates a planned removal from a direct record without committing", () => {
    const result = confirmWorldObjectRemoval({
      record: greenhouseRecord
    });

    expect(result).toMatchObject({
      removed: true,
      committed: false,
      reason: WORLD_OBJECT_REMOVAL_REASON.REMOVED,
      targetCell: { x: 2, y: 3 },
      removalRecord: {
        placedObjectId: "greenhouse@2:3",
        worldObjectId: "greenhouse"
      },
      committedRecord: null
    });
    expect(createWorldObjectRemovalRecord(greenhouseRecord)).toMatchObject({
      placedObjectId: "greenhouse@2:3",
      targetCell: { x: 2, y: 3 },
      originCell: { x: 2, y: 3 }
    });
  });

  it("rejects missing target cells and empty targets", () => {
    expect(confirmWorldObjectRemoval()).toEqual({
      removed: false,
      committed: false,
      reason: WORLD_OBJECT_REMOVAL_REASON.MISSING_TARGET_CELL,
      targetCell: null,
      record: null,
      removalRecord: null,
      committedRecord: null,
      effects: []
    });

    const placementStore = createPlacementStore({ record: null, removeResult: null });
    expect(confirmWorldObjectRemoval({
      targetCell: { x: 1, y: 1 },
      placementStore
    })).toMatchObject({
      removed: false,
      committed: false,
      reason: WORLD_OBJECT_REMOVAL_REASON.MISSING_OBJECT,
      targetCell: { x: 1, y: 1 },
      removalRecord: null
    });
    expect(placementStore.removePlacedObjectAt).not.toHaveBeenCalled();
  });

  it("does not remove locked or non-removable records", () => {
    const lockedRecord = {
      ...greenhouseRecord,
      placedObjectId: "organic-bus",
      removable: false
    };
    const placementStore = createPlacementStore({ record: lockedRecord, removeResult: lockedRecord });
    const result = confirmWorldObjectRemoval({
      targetCell: { x: 2, y: 3 },
      placementStore
    });

    expect(result).toMatchObject({
      removed: false,
      committed: false,
      reason: WORLD_OBJECT_REMOVAL_REASON.LOCKED_OBJECT,
      removalRecord: {
        placedObjectId: "organic-bus",
        removable: false
      }
    });
    expect(placementStore.removePlacedObjectAt).not.toHaveBeenCalled();
  });

  it("reports commit rejection when the removal adapter refuses the record", () => {
    const placementStore = createPlacementStore({ removeResult: null });
    const result = confirmWorldObjectRemoval({
      targetCell: { x: 2, y: 3 },
      placementStore
    });

    expect(result).toMatchObject({
      removed: false,
      committed: false,
      reason: WORLD_OBJECT_REMOVAL_REASON.COMMIT_REJECTED,
      removalRecord: {
        placedObjectId: "greenhouse@2:3"
      },
      effects: []
    });
  });

  it("supports a custom removal adapter returning true", () => {
    const commitRemoval = vi.fn(() => true);
    const result = confirmWorldObjectRemoval({
      record: greenhouseRecord,
      commitRemoval
    });

    expect(commitRemoval).toHaveBeenCalledWith(
      expect.objectContaining({ placedObjectId: "greenhouse@2:3" }),
      { x: 2, y: 3 },
      greenhouseRecord
    );
    expect(result).toMatchObject({
      removed: true,
      committed: true,
      reason: WORLD_OBJECT_REMOVAL_REASON.REMOVED,
      committedRecord: {
        placedObjectId: "greenhouse@2:3"
      }
    });
  });
});
