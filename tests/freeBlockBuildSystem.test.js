import { describe, expect, it } from "vitest";
import {
  createFreeBlockBuildController,
  createFreeBlockBuildState,
  FREE_BLOCK_TYPES,
  resolveFreeBlockTargetCell
} from "../app/gameplay/freeBlockBuildSystem.js";
import { createGridSystem } from "../app/gameplay/gridBuildingSystem.js";

function createBuildState() {
  return createFreeBlockBuildState({
    buildId: "freeBuild",
    bounds: {
      originCell: { x: 0, y: 0 },
      width: 5,
      height: 5
    }
  });
}

describe("free block build system", () => {
  it("supports only the floor block type for the initial free-build contract", () => {
    expect(FREE_BLOCK_TYPES).toEqual({
      FLOOR: "floor"
    });
  });

  it("places and removes a floor block", () => {
    const buildState = createBuildState();
    const placeResult = buildState.placeFloorBlock({ x: 2, y: 3 });

    expect(placeResult).toMatchObject({
      placed: true,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block: {
        id: "freeBuild:floor:2:3",
        cell: { x: 2, y: 3 }
      }
    });
    expect(buildState.getCompletionState()).toEqual({
      floorCount: 1
    });

    expect(buildState.removeFloorBlock({ x: 2, y: 3 })).toMatchObject({
      removed: true,
      blockType: FREE_BLOCK_TYPES.FLOOR
    });
    expect(buildState.getCompletionState()).toEqual({
      floorCount: 0
    });
  });

  it("rejects floor blocks outside the build area and duplicate cells", () => {
    const buildState = createBuildState();

    expect(buildState.placeFloorBlock({ x: 5, y: 0 })).toEqual({
      placed: false,
      reason: "outside-build-area",
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block: null
    });
    expect(buildState.placeFloorBlock({ x: 1, y: 1 })).toMatchObject({
      placed: true
    });
    expect(buildState.placeFloorBlock({ x: 1, y: 1 })).toEqual({
      placed: false,
      reason: "duplicate-floor",
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block: null
    });
  });

  it("serializes and restores free floor blocks", () => {
    const buildState = createBuildState();
    buildState.placeFloorBlock({ x: 1, y: 1 });
    buildState.placeFloorBlock({ x: 2, y: 1 });

    const snapshot = buildState.serializeFreeBlocks();
    const restoredBuildState = createBuildState();
    const restoreResult = restoredBuildState.restoreFreeBlocks(snapshot);

    expect(restoreResult).toMatchObject({
      restored: {
        floorCount: 2
      },
      rejected: []
    });
    expect(restoredBuildState.serializeFreeBlocks()).toEqual(snapshot);
  });

  it("resolves the target cell in front of the player from yaw", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8
    });

    expect(resolveFreeBlockTargetCell({
      gridSystem,
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0,
      forwardDistance: 1
    })).toEqual({ x: 3, y: 2 });
    expect(resolveFreeBlockTargetCell({
      gridSystem,
      playerPosition: [2.5, 0, 2.5],
      playerYaw: Math.PI / 2,
      forwardDistance: 1
    })).toEqual({ x: 2, y: 3 });
  });

  it("places selected floor blocks through an extensible placement controller", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8,
      visualOffsetY: 0.03
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 8,
        height: 8
      }
    });
    const blockInstances = [];
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances
    });

    const result = controller.placeSelectedBlockAtTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0
    });

    expect(result).toMatchObject({
      handled: true,
      placed: true,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      targetCell: { x: 3, y: 2 }
    });
    expect(buildState.getCompletionState().floorCount).toBe(1);
    expect(blockInstances).toHaveLength(1);
    expect(blockInstances[0]).toMatchObject({
      id: "freeBuild:floor:3:2",
      active: true,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      freeBlockCell: { x: 3, y: 2 }
    });
  });

  it("resolves selected block targets without placing them", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 8,
        height: 8
      }
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState
    });

    expect(controller.resolveSelectedBlockTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0
    })).toEqual({
      handled: true,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      targetCell: { x: 3, y: 2 }
    });
    expect(buildState.getCompletionState().floorCount).toBe(0);
  });

  it("allows new block definitions without changing placement controller branching", () => {
    const gridSystem = createGridSystem({ cellSize: 1, width: 4, height: 4 });
    const buildState = createBuildState();
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockDefinitions: [{
        blockType: "debug-custom-block",
        place({ targetCell }) {
          return {
            handled: true,
            placed: true,
            reason: null,
            blockType: "debug-custom-block",
            block: { cell: targetCell },
            targetCell,
            instance: null,
            completionState: buildState.getCompletionState()
          };
        }
      }]
    });

    expect(controller.setSelectedBlockType("debug-custom-block")).toBe(true);
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 1, y: 1 }
    })).toMatchObject({
      handled: true,
      placed: true,
      blockType: "debug-custom-block",
      targetCell: { x: 1, y: 1 }
    });
  });
});
