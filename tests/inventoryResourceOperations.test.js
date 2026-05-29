import { describe, expect, it } from "vitest";
import { createItemResourceRegistry } from "../app/gameplay/itemResourceRegistry.js";
import {
  addInventoryResource,
  countInventoryResource,
  hasInventoryResource,
  normalizeInventoryResourceStacks,
  removeInventoryResource
} from "../app/gameplay/inventoryResourceOperations.js";

function createRegistry() {
  return createItemResourceRegistry([
    { id: "wood", kind: "material", maxStackSize: 20 },
    { id: "leaf", kind: "material", maxStackSize: 12 },
    { id: "greenhouse-kit", kind: "crafted-item", stackable: false },
    { id: "berry", kind: "food", maxStackSize: 8 }
  ]);
}

describe("inventory resource operations", () => {
  it("normalizes inventory stacks and drops empty entries", () => {
    const registry = createRegistry();
    const stacks = normalizeInventoryResourceStacks([
      { itemId: "wood", quantity: 3 },
      { itemId: "wood", quantity: 0 },
      null,
      { itemId: "leaf", quantity: 15 }
    ], { registry });

    expect(stacks.map((stack) => ({
      itemId: stack.itemId,
      quantity: stack.quantity,
      overflowQuantity: stack.overflowQuantity
    }))).toEqual([
      { itemId: "wood", quantity: 3, overflowQuantity: 0 },
      { itemId: "leaf", quantity: 12, overflowQuantity: 3 }
    ]);
    expect(Object.isFrozen(stacks)).toBe(true);
  });

  it("adds resources by filling matching stacks before appending new stacks", () => {
    const registry = createRegistry();
    const result = addInventoryResource([
      { itemId: "wood", quantity: 17 },
      { itemId: "leaf", quantity: 4 },
      { itemId: "wood", quantity: 6 }
    ], { itemId: "wood", quantity: 21 }, { registry });

    expect(result).toMatchObject({
      addedQuantity: 21,
      remainderQuantity: 0,
      changed: true
    });
    expect(result.stacks.map((stack) => [stack.itemId, stack.quantity])).toEqual([
      ["wood", 20],
      ["leaf", 4],
      ["wood", 20],
      ["wood", 4]
    ]);
  });

  it("adds non-stackable resources as separate stacks", () => {
    const registry = createRegistry();
    const result = addInventoryResource([], {
      itemId: "greenhouse-kit",
      quantity: 3
    }, { registry });

    expect(result.stacks.map((stack) => [stack.itemId, stack.quantity])).toEqual([
      ["greenhouse-kit", 1],
      ["greenhouse-kit", 1],
      ["greenhouse-kit", 1]
    ]);
  });

  it("counts and checks resources with optional data filters", () => {
    const registry = createRegistry();
    const stacks = [
      { itemId: "berry", quantity: 3, data: { ripe: true } },
      { itemId: "berry", quantity: 4, data: { ripe: false } },
      { itemId: "wood", quantity: 5 }
    ];

    expect(countInventoryResource(stacks, { itemId: "berry" }, { registry })).toBe(7);
    expect(countInventoryResource(stacks, {
      itemId: "berry",
      data: { ripe: true }
    }, { registry })).toBe(3);
    expect(hasInventoryResource(stacks, { itemId: "wood", quantity: 5 }, { registry })).toBe(true);
    expect(hasInventoryResource(stacks, { itemId: "wood", quantity: 6 }, { registry })).toBe(false);
  });

  it("removes resources across matching stacks and reports missing quantities", () => {
    const registry = createRegistry();
    const result = removeInventoryResource([
      { itemId: "wood", quantity: 6 },
      { itemId: "leaf", quantity: 2 },
      { itemId: "wood", quantity: 4 }
    ], { itemId: "wood", quantity: 8 }, { registry });

    expect(result).toMatchObject({
      removedQuantity: 8,
      missingQuantity: 0,
      changed: true,
      complete: true
    });
    expect(result.stacks.map((stack) => [stack.itemId, stack.quantity])).toEqual([
      ["leaf", 2],
      ["wood", 2]
    ]);
  });

  it("removes only stacks matching a data filter", () => {
    const registry = createRegistry();
    const result = removeInventoryResource([
      { itemId: "berry", quantity: 3, data: { ripe: true } },
      { itemId: "berry", quantity: 4, data: { ripe: false } }
    ], {
      itemId: "berry",
      quantity: 4,
      data: { ripe: true }
    }, { registry });

    expect(result).toMatchObject({
      removedQuantity: 3,
      missingQuantity: 1,
      complete: false
    });
    expect(result.stacks.map((stack) => ({
      itemId: stack.itemId,
      quantity: stack.quantity,
      data: stack.data
    }))).toEqual([
      { itemId: "berry", quantity: 4, data: { ripe: false } }
    ]);
  });

  it("rejects malformed add/remove operations", () => {
    expect(() => normalizeInventoryResourceStacks(null)).toThrow("inventory resource stacks must be an array");
    expect(() => addInventoryResource([], { quantity: 1 })).toThrow("inventory resource add operation requires an itemId");
    expect(() => removeInventoryResource([], { quantity: 1 })).toThrow("inventory resource remove operation requires an itemId");
  });
});
