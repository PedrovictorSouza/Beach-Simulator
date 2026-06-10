import { describe, expect, it } from "vitest";

import {
  findNearbyFreeBlockTarget,
  getNextFreeBlockWoodDropId,
  spawnFreeBlockRemovalDrops
} from "../app/runtime/construction/freeBlockRemoval.js";

describe("free block removal", () => {
  it("finds the nearest active free block target within range", () => {
    const nearTarget = {
      id: "near",
      offset: [0.8, 0, 0.2],
      freeBlockCell: { x: 1, y: 1 }
    };
    const farTarget = {
      id: "far",
      offset: [2, 0, 0],
      freeBlockCell: { x: 2, y: 1 }
    };

    expect(findNearbyFreeBlockTarget({
      playerPosition: [0, 0, 0],
      freeBlockInstances: [
        { id: "inactive", active: false, offset: [0.1, 0, 0], freeBlockCell: { x: 0, y: 0 } },
        { id: "missing-cell", offset: [0.2, 0, 0] },
        farTarget,
        nearTarget
      ]
    })).toBe(nearTarget);
  });

  it("uses the higher layer when two targets are effectively tied", () => {
    const lowerTarget = {
      id: "lower",
      offset: [1, 0, 0],
      freeBlockCell: { x: 1, y: 1, layer: 0 }
    };
    const higherTarget = {
      id: "higher",
      offset: [1, 0, 0],
      freeBlockCell: { x: 1, y: 1, layer: 2 }
    };

    expect(findNearbyFreeBlockTarget({
      playerPosition: [0, 0, 0],
      freeBlockInstances: [lowerTarget, higherTarget]
    })).toBe(higherTarget);
  });

  it("returns the next wood drop id after existing numeric wood ids", () => {
    expect(getNextFreeBlockWoodDropId([
      { id: "wood-2" },
      { id: "stone-10" },
      { id: "wood-9" },
      { id: "wood-bad" }
    ])).toBe(10);
  });

  it("does not spawn drops for non-wood or invalid removal results", () => {
    const woodDrops = [];
    const target = { offset: [1, 0, 2] };

    expect(spawnFreeBlockRemovalDrops({
      result: { materialCost: { itemId: "stone", quantity: 3 } },
      target,
      woodDrops
    })).toBe(0);
    expect(spawnFreeBlockRemovalDrops({
      result: { materialCost: { itemId: "wood", quantity: 0 } },
      target,
      woodDrops
    })).toBe(0);
    expect(spawnFreeBlockRemovalDrops({
      result: { materialCost: { itemId: "wood", quantity: 3 } },
      target: null,
      woodDrops
    })).toBe(0);
    expect(woodDrops).toEqual([]);
  });

  it("spawns wood drops with stable ids and configured drop payload", () => {
    const dropSize = [0.78, 0.78];
    const woodDrops = [
      { id: "wood-4" }
    ];

    expect(spawnFreeBlockRemovalDrops({
      result: { materialCost: { itemId: "wood", quantity: 2 } },
      target: { offset: [5, 0, 7] },
      woodDrops,
      dropSize,
      pickupRadius: 0.64,
      spread: 0.22
    })).toBe(2);

    expect(woodDrops.slice(1)).toEqual([
      {
        id: "wood-5",
        itemId: "wood",
        position: [5.22, 0.02, 7],
        size: [0.78, 0.78],
        uvRect: [0, 0, 1, 1],
        pickupRadius: 0.64,
        collected: false
      },
      {
        id: "wood-6",
        itemId: "wood",
        position: [4.78, 0.02, 7],
        size: [0.78, 0.78],
        uvRect: [0, 0, 1, 1],
        pickupRadius: 0.64,
        collected: false
      }
    ]);
    expect(woodDrops[1].size).not.toBe(dropSize);
  });
});
