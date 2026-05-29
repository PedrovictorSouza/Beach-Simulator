import { describe, expect, it } from "vitest";
import {
  createInMemoryWorldObjectStore,
  normalizeWorldObjectStoreRecord
} from "../app/gameplay/worldObjectMemoryStore.js";

describe("in-memory world object store", () => {
  it("normalizes immutable world object records with footprint cells", () => {
    const record = normalizeWorldObjectStoreRecord({
      placedObjectId: "greenhouse@2:3",
      worldObjectId: "greenhouse",
      sourceDatabaseId: "greenhouse",
      sourceItemId: "greenhouse",
      gridPlaceableId: "greenhouse",
      originCell: { x: 2.8, y: 3.2 },
      footprint: { width: 2, height: 2 },
      runtimeRefs: { meshId: "greenhouse-1" },
      data: { restored: true }
    });

    expect(record).toEqual({
      placedObjectId: "greenhouse@2:3",
      worldObjectId: "greenhouse",
      sourceDatabaseId: "greenhouse",
      sourceItemId: "greenhouse",
      gridPlaceableId: "greenhouse",
      originCell: { x: 2, y: 3 },
      size: { width: 2, height: 2 },
      footprint: { width: 2, height: 2 },
      occupiedCells: [
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 }
      ],
      removable: true,
      runtimeRefs: { meshId: "greenhouse-1" },
      data: { restored: true }
    });
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.originCell)).toBe(true);
    expect(Object.isFrozen(record.footprint)).toBe(true);
    expect(Object.isFrozen(record.occupiedCells)).toBe(true);
    expect(Object.isFrozen(record.runtimeRefs)).toBe(true);
    expect(Object.isFrozen(record.data)).toBe(true);
  });

  it("adds and lists records by stable placed object id", () => {
    const store = createInMemoryWorldObjectStore();
    const first = store.add({
      placedObjectId: "workbench",
      worldObjectId: "workbench",
      originCell: { x: 1, y: 2 },
      size: { width: 2, height: 1 },
      removable: false
    });
    const second = store.addPlacedObject({
      worldObjectId: "greenhouse",
      originCell: { x: 4, y: 5 },
      footprint: { width: 1, height: 1 }
    });

    expect(store.size).toBe(2);
    expect(store.has("workbench")).toBe(true);
    expect(store.get("workbench")).toBe(first);
    expect(second?.placedObjectId).toBe("world-object-2");
    expect(store.ids()).toEqual(["workbench", "world-object-2"]);
    expect(store.list()).toEqual([first, second]);
    expect(Object.isFrozen(store.list())).toBe(true);
    expect(first?.removable).toBe(false);
  });

  it("loads initial records in insertion order", () => {
    const store = createInMemoryWorldObjectStore({
      initialRecords: [
        {
          placedObjectId: "organic-bus",
          worldObjectId: "organic-bus",
          originCell: { x: 0, y: 0 },
          footprint: { width: 10, height: 4 },
          removable: false
        },
        {
          placedObjectId: "workbench",
          worldObjectId: "workbench",
          originCell: { x: 12, y: 4 }
        }
      ]
    });

    expect(store.size).toBe(2);
    expect(store.ids()).toEqual(["organic-bus", "workbench"]);
    expect(store.require("organic-bus")).toMatchObject({
      placedObjectId: "organic-bus",
      removable: false,
      footprint: { width: 10, height: 4 }
    });
  });

  it("looks up records by every occupied grid coordinate", () => {
    const store = createInMemoryWorldObjectStore();
    const greenhouse = store.add({
      placedObjectId: "greenhouse@2:3",
      worldObjectId: "greenhouse",
      originCell: { x: 2, y: 3 },
      footprint: { width: 2, height: 2 }
    });

    expect(store.getObjectAt({ x: 2, y: 3 })).toBe(greenhouse);
    expect(store.getObjectAt({ x: 3, y: 4 })).toBe(greenhouse);
    expect(store.hasObjectAt({ x: 3, y: 3 })).toBe(true);
    expect(store.getObjectAt({ x: 4, y: 4 })).toBeNull();
    expect(store.hasObjectAt({ x: 4, y: 4 })).toBe(false);
  });

  it("rejects records whose occupied cells overlap existing records", () => {
    const store = createInMemoryWorldObjectStore();
    const first = store.add({
      placedObjectId: "first-wall",
      originCell: { x: 1, y: 1 },
      footprint: { width: 2, height: 2 }
    });

    const overlapping = store.add({
      placedObjectId: "overlapping-wall",
      originCell: { x: 2, y: 2 },
      footprint: { width: 1, height: 1 }
    });
    const adjacent = store.add({
      placedObjectId: "adjacent-wall",
      originCell: { x: 3, y: 1 },
      footprint: { width: 1, height: 2 }
    });

    expect(first).not.toBeNull();
    expect(overlapping).toBeNull();
    expect(adjacent).not.toBeNull();
    expect(store.size).toBe(2);
    expect(store.getObjectAt({ x: 2, y: 2 })).toBe(first);
    expect(store.getObjectAt({ x: 3, y: 2 })).toBe(adjacent);
  });

  it("removes records by id or occupied grid coordinate", () => {
    const store = createInMemoryWorldObjectStore();
    const wall = store.add({
      placedObjectId: "foundation-wall",
      originCell: { x: 2, y: 3 },
      footprint: { width: 2, height: 2 }
    });
    const terminal = store.add({
      placedObjectId: "terminal",
      originCell: { x: 6, y: 1 },
      removable: false
    });

    expect(store.removeObjectAt({ x: 3, y: 4 })).toBe(wall);
    expect(store.get("foundation-wall")).toBeNull();
    expect(store.getObjectAt({ x: 2, y: 3 })).toBeNull();
    expect(store.removePlacedObjectAt({ x: 6, y: 1 })).toBeNull();
    expect(store.remove("terminal")).toBeNull();
    expect(store.removeObject("terminal", { force: true })).toBe(terminal);
    expect(store.size).toBe(0);
  });

  it("updates records and reindexes their occupied grid cells", () => {
    const store = createInMemoryWorldObjectStore();
    const wall = store.add({
      placedObjectId: "foundation-wall",
      originCell: { x: 1, y: 1 },
      footprint: { width: 2, height: 1 },
      data: { layer: 1 }
    });
    const blocker = store.add({
      placedObjectId: "workbench",
      originCell: { x: 5, y: 4 }
    });

    const moved = store.updateObject("foundation-wall", {
      originCell: { x: 3, y: 2 },
      footprint: { width: 1, height: 2 },
      data: { layer: 2 }
    });
    const blockedUpdate = store.update("foundation-wall", {
      originCell: { x: 5, y: 4 }
    });

    expect(wall).not.toBeNull();
    expect(moved).toMatchObject({
      placedObjectId: "foundation-wall",
      originCell: { x: 3, y: 2 },
      footprint: { width: 1, height: 2 },
      occupiedCells: [
        { x: 3, y: 2 },
        { x: 3, y: 3 }
      ],
      data: { layer: 2 }
    });
    expect(blockedUpdate).toBeNull();
    expect(store.getObjectAt({ x: 1, y: 1 })).toBeNull();
    expect(store.getObjectAt({ x: 3, y: 3 })).toBe(moved);
    expect(store.getObjectAt({ x: 5, y: 4 })).toBe(blocker);
  });

  it("queries objects by lightweight grid regions without duplicate records", () => {
    const store = createInMemoryWorldObjectStore();
    const greenhouse = store.add({
      placedObjectId: "greenhouse",
      originCell: { x: 2, y: 2 },
      footprint: { width: 3, height: 2 }
    });
    const workbench = store.add({
      placedObjectId: "workbench",
      originCell: { x: 7, y: 1 }
    });
    const farWall = store.add({
      placedObjectId: "far-wall",
      originCell: { x: 10, y: 8 }
    });

    expect(store.listObjectsInArea({
      originCell: { x: 1, y: 1 },
      footprint: { width: 7, height: 3 }
    })).toEqual([workbench, greenhouse]);
    expect(store.listObjectsAtCells([
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
      { x: 10, y: 8 }
    ])).toEqual([greenhouse, farWall]);
    expect(store.hasObjectsInArea({
      originCell: { x: 20, y: 20 },
      footprint: { width: 2, height: 2 }
    })).toBe(false);
    expect(store.hasObjectsInArea({
      originCell: { x: 7, y: 1 },
      footprint: { width: 1, height: 1 }
    })).toBe(true);
  });

  it("rejects duplicate ids and malformed initial records", () => {
    const store = createInMemoryWorldObjectStore();

    expect(store.add({ placedObjectId: "workbench" })?.placedObjectId).toBe("workbench");
    expect(store.add({ placedObjectId: "workbench" })).toBeNull();
    expect(() => store.require("missing")).toThrow("Unknown placed world object id: missing");
    expect(() => normalizeWorldObjectStoreRecord(null)).toThrow("world object store record must be an object");
    expect(() => createInMemoryWorldObjectStore({ initialRecords: null }))
      .toThrow("initial world object records must be an array");
    expect(() => createInMemoryWorldObjectStore({
      initialRecords: [
        { placedObjectId: "dup" },
        { placedObjectId: "dup" }
      ]
    })).toThrow("Duplicate placed world object id: dup");
  });
});
