import { describe, expect, it } from "vitest";

import {
  getNewlyCollectedDropPositions,
  getNewlyCollectedResourcePositions,
  snapshotAvailableWoodDrops,
  snapshotCollectibleSources
} from "../app/runtime/collectibleSourceSnapshots.js";

describe("collectible source snapshots", () => {
  it("snapshots available wood drops and keeps position data independent", () => {
    const availableDrop = {
      collected: false,
      position: [1, 2, 3],
      size: [0.5, 0.5],
      uvRect: [0.1, 0.2, 0.3, 0.4]
    };
    const collectedDrop = {
      collected: true,
      position: [4, 5, 6],
      size: [1, 1]
    };

    const snapshots = snapshotAvailableWoodDrops([availableDrop, collectedDrop, null]);

    expect(snapshots.has(availableDrop)).toBe(true);
    expect(snapshots.has(collectedDrop)).toBe(false);
    expect(snapshots.get(availableDrop)).toEqual({
      position: [1, 2, 3],
      size: [0.5, 0.5],
      uvRect: [0.1, 0.2, 0.3, 0.4]
    });

    availableDrop.position[0] = 99;
    availableDrop.size[0] = 99;

    expect(snapshots.get(availableDrop).position).toEqual([1, 2, 3]);
    expect(snapshots.get(availableDrop).size).toEqual([0.5, 0.5]);
  });

  it("returns positions for drops collected after the snapshot", () => {
    const drop = {
      collected: false,
      position: [1, 0, 2],
      size: [0.5, 0.5]
    };
    const snapshots = snapshotAvailableWoodDrops([drop]);

    expect(getNewlyCollectedDropPositions(snapshots)).toEqual([]);

    drop.collected = true;

    expect(getNewlyCollectedDropPositions(snapshots)).toEqual([[1, 0, 2]]);
  });

  it("snapshots resource sources with predicate, cooldown and yield", () => {
    const leafNode = {
      itemId: "leaves",
      active: true,
      cooldown: 2,
      position: [2, 0, 3],
      yield: 3
    };
    const gearNode = {
      itemId: "gear",
      active: true,
      cooldown: 2,
      position: [4, 0, 5],
      yield: 1
    };

    const snapshots = snapshotCollectibleSources(
      [leafNode, gearNode],
      (resourceNode) => resourceNode.itemId === "leaves"
    );

    expect(snapshots.has(leafNode)).toBe(true);
    expect(snapshots.has(gearNode)).toBe(false);
    expect(snapshots.get(leafNode)).toEqual({
      active: true,
      collected: false,
      cooldown: 2,
      position: [2, 0, 3],
      yield: 3
    });

    leafNode.active = false;
    leafNode.cooldown = 5;

    expect(getNewlyCollectedResourcePositions(snapshots)).toEqual([
      [2, 0, 3],
      [2, 0, 3],
      [2, 0, 3]
    ]);
  });

  it("does not report resources that stayed active or did not enter cooldown", () => {
    const stayedActive = {
      active: true,
      cooldown: 1,
      position: [1, 0, 1]
    };
    const cooldownUnchanged = {
      active: true,
      cooldown: 4,
      position: [2, 0, 2]
    };
    const invalidPosition = {
      active: true,
      cooldown: 1,
      position: null
    };
    const snapshots = snapshotCollectibleSources([
      stayedActive,
      cooldownUnchanged,
      invalidPosition
    ]);

    cooldownUnchanged.active = false;
    cooldownUnchanged.cooldown = 4;
    invalidPosition.active = false;
    invalidPosition.cooldown = 2;

    expect(getNewlyCollectedResourcePositions(snapshots)).toEqual([]);
  });
});
