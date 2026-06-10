import { describe, expect, it } from "vitest";

import {
  BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL,
  buildBuilderTutorialFoundationCandidateOrigins,
  canStackFreeBlockPlacement,
  createBuilderTutorialFoundationBuildZone,
  createUnavailableFoundationBuildZonePlacementResult,
  createUnavailableFoundationBuildZoneValidation,
  getBuilderTutorialFoundationZoneSignature,
  getFoundationBuildZoneProgressCount,
  getSavedFoundationBuildZoneOriginCell,
  hasFoundationWallObjective,
  isFoundationFreeBlockAllowedInZone,
  saveFoundationBuildZoneOriginCell,
  shouldShowFoundationBuildZone
} from "../app/runtime/construction/foundationBuildZone.js";

describe("foundation build zone", () => {
  it("creates the builder tutorial foundation zone with the existing defaults", () => {
    const zone = createBuilderTutorialFoundationBuildZone();

    expect(BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL).toEqual({
      x: 107,
      y: 98
    });
    expect(zone).toMatchObject({
      id: "builder-tutorial-foundation",
      originCell: { x: 107, y: 98 },
      width: 6,
      height: 4
    });
    expect(zone.cells).toHaveLength(24);
    expect(zone.borderCells).toBe(zone.cells);
    expect(Object.isFrozen(zone)).toBe(true);
  });

  it("creates builder tutorial foundation candidate origins with the existing search radius", () => {
    const origins = buildBuilderTutorialFoundationCandidateOrigins();

    expect(origins).toHaveLength(1089);
    expect(origins[0]).toEqual({ x: 107, y: 98 });
    expect(origins.at(-1)).toEqual({ x: 123, y: 114 });
  });

  it("gets builder tutorial foundation zone signatures", () => {
    expect(getBuilderTutorialFoundationZoneSignature({
      originCell: { x: 107, y: 98 },
      width: 6,
      height: 4
    })).toBe("107:98:6:4");
  });

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

  it("reads saved origin cells with fallback normalization", () => {
    const originFlag = "foundationOrigin";
    const defaultOriginCell = { x: 10, y: 20 };

    expect(getSavedFoundationBuildZoneOriginCell({
      flags: {
        [originFlag]: { x: "12.8", z: "22.4" }
      },
      originFlag,
      defaultOriginCell
    })).toEqual({ x: 12, y: 22 });

    expect(getSavedFoundationBuildZoneOriginCell({
      flags: {},
      originFlag,
      defaultOriginCell
    })).toEqual(defaultOriginCell);
  });

  it("saves normalized origin cells without requiring a story state", () => {
    const flags = {};
    const originFlag = "foundationOrigin";

    expect(saveFoundationBuildZoneOriginCell({
      flags,
      originCell: { x: "5.9", z: "7.2" },
      originFlag,
      defaultOriginCell: { x: 0, y: 0 }
    })).toEqual({ x: 5, y: 7 });
    expect(flags[originFlag]).toEqual({ x: 5, y: 7 });

    expect(saveFoundationBuildZoneOriginCell({
      flags: null,
      originCell: { x: 1, y: 2 },
      originFlag,
      defaultOriginCell: { x: 0, y: 0 }
    })).toBeNull();
  });

  it("creates unavailable foundation zone placement payloads", () => {
    expect(createUnavailableFoundationBuildZonePlacementResult({
      blockType: "wall",
      targetCell: { x: 1, y: 2 }
    })).toEqual({
      placed: false,
      reason: "blocked-cell",
      blockType: "wall",
      block: null,
      targetCell: { x: 1, y: 2 }
    });
  });

  it("creates unavailable foundation zone validation payloads", () => {
    expect(createUnavailableFoundationBuildZoneValidation({
      targetCell: { x: 3, y: 4 }
    })).toEqual({
      valid: false,
      reason: "blocked-cell",
      targetCell: { x: 3, y: 4 }
    });
  });
});
