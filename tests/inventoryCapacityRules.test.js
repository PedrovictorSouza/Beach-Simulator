import { describe, expect, it } from "vitest";
import { createItemResourceRegistry } from "../app/gameplay/itemResourceRegistry.js";
import {
  canFitInventoryResource,
  clampInventoryResourceAddOperation,
  getInventoryResourceCapacity,
  normalizeInventoryCapacityRules,
  summarizeInventoryCapacity
} from "../app/gameplay/inventoryCapacityRules.js";

function createRegistry() {
  return createItemResourceRegistry([
    { id: "wood", kind: "material", maxStackSize: 20 },
    { id: "leaf", kind: "material", maxStackSize: 12 },
    { id: "greenhouse-kit", kind: "crafted-item", stackable: false },
    { id: "berry", kind: "food", maxStackSize: 8 }
  ]);
}

describe("inventory capacity rules", () => {
  it("normalizes slot capacity rules", () => {
    expect(normalizeInventoryCapacityRules({ maxSlots: 6 })).toEqual({ maxSlots: 6 });
    expect(normalizeInventoryCapacityRules({ capacity: { slotCount: 4 } })).toEqual({ maxSlots: 4 });
    expect(normalizeInventoryCapacityRules({ maxSlots: 0 })).toEqual({ maxSlots: null });
  });

  it("summarizes used, empty, and free stack space", () => {
    const registry = createRegistry();
    const summary = summarizeInventoryCapacity([
      { itemId: "wood", quantity: 12 },
      { itemId: "leaf", quantity: 12 },
      { itemId: "greenhouse-kit", quantity: 1 }
    ], { registry, maxSlots: 4 });

    expect(summary).toEqual({
      maxSlots: 4,
      usedSlots: 3,
      emptySlots: 1,
      totalQuantity: 25,
      totalFreeStackSpace: 8,
      overCapacity: false,
      full: false
    });
  });

  it("calculates resource capacity from merge space and empty slots", () => {
    const registry = createRegistry();
    const capacity = getInventoryResourceCapacity([
      { itemId: "wood", quantity: 12 },
      { itemId: "leaf", quantity: 12 },
      { itemId: "wood", quantity: 20 }
    ], { itemId: "wood", quantity: 40 }, { registry, maxSlots: 4 });

    expect(capacity).toEqual({
      itemId: "wood",
      requestedQuantity: 40,
      maxSlots: 4,
      usedSlots: 3,
      emptySlots: 1,
      mergeSpace: 8,
      emptySlotSpace: 20,
      availableQuantity: 28,
      acceptedQuantity: 28,
      rejectedQuantity: 12,
      canFit: false
    });
    expect(canFitInventoryResource([
      { itemId: "wood", quantity: 12 },
      { itemId: "leaf", quantity: 12 },
      { itemId: "wood", quantity: 20 }
    ], { itemId: "wood", quantity: 28 }, { registry, maxSlots: 4 })).toBe(true);
  });

  it("handles non-stackable resources by reserving one slot per item", () => {
    const registry = createRegistry();

    expect(getInventoryResourceCapacity([], {
      itemId: "greenhouse-kit",
      quantity: 3
    }, { registry, maxSlots: 2 })).toMatchObject({
      emptySlotSpace: 2,
      acceptedQuantity: 2,
      rejectedQuantity: 1,
      canFit: false
    });
  });

  it("respects stack metadata when calculating merge space", () => {
    const registry = createRegistry();
    const capacity = getInventoryResourceCapacity([
      { itemId: "berry", quantity: 6, data: { ripe: true } },
      { itemId: "berry", quantity: 5, data: { ripe: false } }
    ], {
      itemId: "berry",
      quantity: 5,
      data: { ripe: true }
    }, { registry, maxSlots: 2 });

    expect(capacity).toMatchObject({
      usedSlots: 2,
      emptySlots: 0,
      mergeSpace: 2,
      emptySlotSpace: 0,
      acceptedQuantity: 2,
      rejectedQuantity: 3
    });
  });

  it("treats missing maxSlots as unlimited empty slot capacity", () => {
    const registry = createRegistry();
    const capacity = getInventoryResourceCapacity([], {
      itemId: "wood",
      quantity: 200
    }, { registry });

    expect(capacity.emptySlots).toBe(Number.POSITIVE_INFINITY);
    expect(capacity.emptySlotSpace).toBe(Number.POSITIVE_INFINITY);
    expect(capacity.availableQuantity).toBe(Number.POSITIVE_INFINITY);
    expect(capacity.acceptedQuantity).toBe(200);
    expect(capacity.rejectedQuantity).toBe(0);
  });

  it("clamps add operations to accepted capacity", () => {
    const registry = createRegistry();
    const operation = clampInventoryResourceAddOperation([
      { itemId: "wood", quantity: 19 }
    ], { itemId: "wood", quantity: 25 }, { registry, maxSlots: 1 });

    expect(operation).toMatchObject({
      itemId: "wood",
      quantity: 1,
      rejectedQuantity: 24,
      capacity: {
        mergeSpace: 1,
        emptySlotSpace: 0,
        acceptedQuantity: 1,
        rejectedQuantity: 24
      }
    });
  });

  it("rejects malformed capacity operations", () => {
    expect(() => getInventoryResourceCapacity([], { quantity: 1 }))
      .toThrow("inventory capacity operation requires an itemId");
  });
});
