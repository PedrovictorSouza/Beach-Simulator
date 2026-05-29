import { describe, expect, it } from "vitest";
import { createItemResourceRegistry } from "../app/gameplay/itemResourceRegistry.js";
import {
  DEFAULT_ITEM_MAX_STACK_SIZE,
  canMergeInventoryItemStacks,
  createInventoryItemStack,
  getInventoryItemStackSpace,
  mergeInventoryItemStacks,
  resolveInventoryItemStackRules,
  splitItemQuantityIntoStacks
} from "../app/gameplay/inventoryItemStack.js";

function createRegistry() {
  return createItemResourceRegistry([
    { id: "wood", kind: "material", maxStackSize: 20 },
    { id: "leaf", kind: "material", stack: { maxStackSize: 12 } },
    { id: "greenhouse-kit", kind: "crafted-item", stackable: false },
    { id: "berry", kind: "food", maxStackSize: 8 }
  ]);
}

describe("inventory item stacks", () => {
  it("resolves stack rules from the item/resource registry", () => {
    const registry = createRegistry();

    expect(resolveInventoryItemStackRules("wood", { registry })).toEqual({
      itemId: "wood",
      stackable: true,
      maxStackSize: 20
    });
    expect(resolveInventoryItemStackRules("greenhouse-kit", { registry })).toEqual({
      itemId: "greenhouse-kit",
      stackable: false,
      maxStackSize: 1
    });
    expect(resolveInventoryItemStackRules("unknown")).toEqual({
      itemId: "unknown",
      stackable: true,
      maxStackSize: DEFAULT_ITEM_MAX_STACK_SIZE
    });
  });

  it("creates immutable stacks capped to the item max stack size", () => {
    const registry = createRegistry();
    const stack = createInventoryItemStack({
      itemId: "wood",
      quantity: 27,
      data: { source: "tree" }
    }, { registry });
    const single = createInventoryItemStack({
      itemId: "greenhouse-kit",
      quantity: 3
    }, { registry });

    expect(stack).toEqual({
      itemId: "wood",
      quantity: 20,
      requestedQuantity: 27,
      overflowQuantity: 7,
      stackable: true,
      maxStackSize: 20,
      space: 0,
      empty: false,
      stackKey: "{\"source\":\"tree\"}",
      data: { source: "tree" }
    });
    expect(single).toMatchObject({
      itemId: "greenhouse-kit",
      quantity: 1,
      requestedQuantity: 3,
      overflowQuantity: 2,
      stackable: false,
      maxStackSize: 1
    });
    expect(Object.isFrozen(stack)).toBe(true);
    expect(Object.isFrozen(stack.data)).toBe(true);
  });

  it("splits quantities into legal stack sizes", () => {
    const registry = createRegistry();

    expect(splitItemQuantityIntoStacks("wood", 45, { registry }).map((stack) => stack.quantity))
      .toEqual([20, 20, 5]);
    expect(splitItemQuantityIntoStacks("greenhouse-kit", 3, { registry }).map((stack) => stack.quantity))
      .toEqual([1, 1, 1]);
    expect(splitItemQuantityIntoStacks("wood", 0, { registry })).toEqual([]);
  });

  it("merges matching stackable items up to capacity", () => {
    const registry = createRegistry();
    const result = mergeInventoryItemStacks(
      { itemId: "leaf", quantity: 8 },
      { itemId: "leaf", quantity: 7 },
      { registry }
    );

    expect(result).toMatchObject({
      movedQuantity: 4,
      stack: {
        itemId: "leaf",
        quantity: 12,
        space: 0
      },
      remainder: {
        itemId: "leaf",
        quantity: 3,
        space: 9
      }
    });
    expect(getInventoryItemStackSpace(result.stack, { registry })).toBe(0);
  });

  it("does not merge different items, non-stackable items, or different stack keys", () => {
    const registry = createRegistry();

    expect(canMergeInventoryItemStacks(
      { itemId: "wood", quantity: 2 },
      { itemId: "leaf", quantity: 2 },
      { registry }
    )).toBe(false);
    expect(canMergeInventoryItemStacks(
      { itemId: "greenhouse-kit", quantity: 1 },
      { itemId: "greenhouse-kit", quantity: 1 },
      { registry }
    )).toBe(false);
    expect(canMergeInventoryItemStacks(
      { itemId: "berry", quantity: 2, data: { ripe: true } },
      { itemId: "berry", quantity: 2, data: { ripe: false } },
      { registry }
    )).toBe(false);

    const result = mergeInventoryItemStacks(
      { itemId: "wood", quantity: 2 },
      { itemId: "leaf", quantity: 2 },
      { registry }
    );
    expect(result.stack.itemId).toBe("wood");
    expect(result.remainder?.itemId).toBe("leaf");
    expect(result.movedQuantity).toBe(0);
  });

  it("rejects malformed stack records", () => {
    expect(() => createInventoryItemStack(null)).toThrow("inventory item stack must be an object");
    expect(() => createInventoryItemStack({ quantity: 1 })).toThrow("inventory item stack requires an itemId");
  });
});
