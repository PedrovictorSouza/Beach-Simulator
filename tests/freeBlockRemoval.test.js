import { describe, expect, it, vi } from "vitest";

import {
  findNearbyFreeBlockTarget,
  getNextFreeBlockWoodDropId,
  spawnFreeBlockRemovalDrops,
  tryRemoveNearbyFreeBlock
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

  it("removes a nearby block and applies drops, feedback and notice", () => {
    const targetCell = { x: 2, y: 3, layer: 1 };
    const woodDrops = [{ id: "wood-2" }];
    const controller = {
      removeBlockAtTarget: vi.fn(() => ({
        removed: true,
        materialCost: { itemId: "wood", quantity: 2 }
      }))
    };
    const actions = {
      syncSnapshot: vi.fn(),
      triggerFeedback: vi.fn(),
      playImpactSound: vi.fn(),
      pushNotice: vi.fn()
    };
    const feedbackGroundCell = { id: "feedback-cell" };

    expect(tryRemoveNearbyFreeBlock({
      playerPosition: [0, 0, 0],
      freeBlockInstances: [{
        offset: [0.4, 0, 0.2],
        freeBlockCell: targetCell
      }],
      inventory: { wood: 0 },
      getController: () => controller,
      getWoodDrops: () => woodDrops,
      buildFeedbackGroundCell: vi.fn(() => feedbackGroundCell),
      now: 789,
      dropSize: [0.5, 0.5],
      pickupRadius: 0.25,
      spread: 0.1,
      actions
    })).toBe(true);

    expect(controller.removeBlockAtTarget).toHaveBeenCalledWith({
      targetCell,
      inventory: { wood: 0 },
      refundMaterial: false
    });
    expect(woodDrops).toHaveLength(3);
    expect(actions.syncSnapshot).toHaveBeenCalledTimes(1);
    expect(actions.triggerFeedback).toHaveBeenCalledWith(feedbackGroundCell, "build", 789);
    expect(actions.playImpactSound).toHaveBeenCalledTimes(1);
    expect(actions.pushNotice).toHaveBeenCalledWith("Block broken. Wood dropped.");
  });

  it("does not emit removal side effects when no block is removed", () => {
    const controller = {
      removeBlockAtTarget: vi.fn(() => ({ removed: false }))
    };
    const actions = {
      syncSnapshot: vi.fn(),
      triggerFeedback: vi.fn(),
      playImpactSound: vi.fn(),
      pushNotice: vi.fn()
    };

    expect(tryRemoveNearbyFreeBlock({
      playerPosition: [0, 0, 0],
      freeBlockInstances: [{
        offset: [0.4, 0, 0.2],
        freeBlockCell: { x: 1, y: 1 }
      }],
      getController: () => controller,
      getWoodDrops: vi.fn(() => []),
      actions
    })).toBe(false);

    expect(actions.syncSnapshot).not.toHaveBeenCalled();
    expect(actions.triggerFeedback).not.toHaveBeenCalled();
    expect(actions.playImpactSound).not.toHaveBeenCalled();
    expect(actions.pushNotice).not.toHaveBeenCalled();
  });
});
