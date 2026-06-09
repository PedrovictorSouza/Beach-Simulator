import { describe, expect, it } from "vitest";

import {
  canStackFreeBlockPlacement,
  getFoundationBuildZoneProgressCount,
  hasFoundationWallObjective,
  isFoundationFreeBlockAllowedInZone,
  shouldShowFoundationBuildZone
} from "../app/runtime/construction/foundationBuildZone.js";

describe("foundation build zone", () => {
  it("detects foundation wall objectives", () => {
    expect(hasFoundationWallObjective({
      objectives: [
        { targetId: "other" },
        { targetId: "foundation-wall" }
      ]
    })).toBe(true);
    expect(hasFoundationWallObjective({
      objectives: [
        { targetId: "other" }
      ]
    })).toBe(false);
    expect(hasFoundationWallObjective(null)).toBe(false);
  });

  it("shows the foundation build zone from active quest, system quest or objective", () => {
    expect(shouldShowFoundationBuildZone({
      activeQuest: { id: "build-first-base" }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeSystemQuest: { id: "build-first-base" }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeQuest: {
        id: "other",
        objectives: [{ targetId: "foundation-wall" }]
      }
    })).toBe(true);
    expect(shouldShowFoundationBuildZone({
      activeQuest: { id: "other" },
      activeSystemQuest: { id: "also-other" }
    })).toBe(false);
  });

  it("allows an existing free block only inside the active foundation zone", () => {
    const buildZone = {
      cells: [
        { x: 1, y: 2 }
      ]
    };
    const buildState = {
      getBlockAtCell(cell) {
        return cell.x === 1 && cell.y === 2 ? { blockType: "wall" } : null;
      }
    };

    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 1, y: 2 }
      },
      buildZone,
      buildState
    })).toBe(true);
    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 3, y: 4 }
      },
      buildZone,
      buildState
    })).toBe(false);
    expect(isFoundationFreeBlockAllowedInZone({
      instance: {
        freeBlockCell: { x: 1, y: 2 }
      },
      buildZone,
      buildState: null
    })).toBe(false);
  });

  it("uses completed progress first and falls back to saved floor blocks", () => {
    const buildZone = {
      cells: [
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ]
    };

    expect(getFoundationBuildZoneProgressCount({
      progress: { completedCount: 3 },
      buildZone,
      floorBlocks: []
    })).toBe(3);
    expect(getFoundationBuildZoneProgressCount({
      progress: { completedCount: 0 },
      buildZone,
      floorBlocks: [
        { cell: { x: 1, y: 2 } },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ]
    })).toBe(2);
  });

  it("allows stacking only after the foundation progress is complete", () => {
    expect(canStackFreeBlockPlacement({
      progress: { complete: true }
    })).toBe(true);
    expect(canStackFreeBlockPlacement({
      progress: { complete: false }
    })).toBe(false);
    expect(canStackFreeBlockPlacement()).toBe(false);
  });
});
