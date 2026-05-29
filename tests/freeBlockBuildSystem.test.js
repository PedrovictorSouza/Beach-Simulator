import { describe, expect, it } from "vitest";
import {
  createFreeBlockBuildController,
  createFreeBlockBuildState,
  createFreeBlockModelInstance,
  createRectangularFreeBlockBuildZone,
  FREE_BLOCK_TYPES,
  FREE_BLOCK_WALL_COST,
  getFreeBlockBuildZoneProgress,
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
  it("supports floor blocks and wall pieces for the Builder Bot contract", () => {
    expect(FREE_BLOCK_TYPES).toEqual({
      BLOCK: "block",
      WALL: "wall"
    });
    expect(FREE_BLOCK_WALL_COST).toEqual({
      itemId: "wood",
      quantity: 1
    });
  });

  it("exposes the selected block material cost for build preview markers", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8
    });
    const buildState = createBuildState();
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.BLOCK
    });

    expect(controller.getSelectedBlockMaterialCost()).toBeNull();

    controller.setSelectedBlockType(FREE_BLOCK_TYPES.WALL);
    expect(controller.getSelectedBlockMaterialCost()).toEqual({
      itemId: "wood",
      quantity: 1
    });
  });

  it("places and removes a block", () => {
    const buildState = createBuildState();
    const placeResult = buildState.placeBlock({ x: 2, y: 3 });

    expect(placeResult).toMatchObject({
      placed: true,
      blockType: FREE_BLOCK_TYPES.BLOCK,
      block: {
        id: "freeBuild:block:2:3",
        cell: { x: 2, y: 3 }
      }
    });
    expect(buildState.getCompletionState()).toEqual({
      blockCount: 1
    });

    expect(buildState.removeBlock({ x: 2, y: 3 })).toMatchObject({
      removed: true,
      blockType: FREE_BLOCK_TYPES.BLOCK
    });
    expect(buildState.getCompletionState()).toEqual({
      blockCount: 0
    });
  });

  it("rejects blocks outside the build area and duplicate cells", () => {
    const buildState = createBuildState();

    expect(buildState.placeBlock({ x: 5, y: 0 })).toEqual({
      placed: false,
      reason: "outside-build-area",
      blockType: FREE_BLOCK_TYPES.BLOCK,
      block: null
    });
    expect(buildState.placeBlock({ x: 1, y: 1 })).toMatchObject({
      placed: true
    });
    expect(buildState.placeBlock({ x: 1, y: 1 })).toEqual({
      placed: false,
      reason: "duplicate-block",
      blockType: FREE_BLOCK_TYPES.BLOCK,
      block: null
    });
  });

  it("validates block placement without mutating the build state", () => {
    const buildState = createBuildState();

    expect(buildState.canPlaceBlock({ x: 1, y: 1 })).toEqual({
      placed: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.BLOCK,
      block: null,
      targetCell: { x: 1, y: 1 }
    });
    expect(buildState.getCompletionState().blockCount).toBe(0);

    buildState.placeBlock({ x: 1, y: 1 });
    expect(buildState.canPlaceBlock({ x: 1, y: 1 })).toEqual({
      placed: false,
      reason: "duplicate-block",
      blockType: FREE_BLOCK_TYPES.BLOCK,
      block: null
    });
  });

  it("serializes and restores free blocks while keeping legacy floorBlocks snapshots readable", () => {
    const buildState = createBuildState();
    buildState.placeBlock({ x: 1, y: 1 });
    buildState.placeBlock({ x: 2, y: 1 });

    const snapshot = buildState.serializeFreeBlocks();
    const restoredBuildState = createBuildState();
    const restoreResult = restoredBuildState.restoreFreeBlocks(snapshot);

    expect(restoreResult).toMatchObject({
      restored: {
        blockCount: 2
      },
      rejected: []
    });
    expect(restoredBuildState.serializeFreeBlocks()).toEqual(snapshot);

    const legacyBuildState = createBuildState();
    expect(legacyBuildState.restoreFreeBlocks({
      ...snapshot,
      blocks: undefined,
      floorBlocks: [{ cell: { x: 3, y: 3 } }]
    })).toMatchObject({
      restored: {
        blockCount: 1
      },
      rejected: []
    });
    expect(legacyBuildState.getBlockAtCell({ x: 3, y: 3 })).toMatchObject({
      blockType: FREE_BLOCK_TYPES.BLOCK
    });
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

  it("places selected blocks through an extensible placement controller", () => {
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
      blockType: FREE_BLOCK_TYPES.BLOCK,
      targetCell: { x: 3, y: 2 }
    });
    expect(buildState.getCompletionState().blockCount).toBe(1);
    expect(blockInstances).toHaveLength(1);
    expect(blockInstances[0]).toMatchObject({
      id: "freeBuild:block:3:2",
      active: true,
      blockType: FREE_BLOCK_TYPES.BLOCK,
      freeBlockCell: { x: 3, y: 2 }
    });
  });

  it("places selected walls through the controller and spends one wood", () => {
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
    const inventory = { wood: 2 };
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    const result = controller.placeSelectedBlockAtTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0,
      inventory
    });

    expect(result).toMatchObject({
      handled: true,
      placed: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 3, y: 2 }
    });
    expect(inventory.wood).toBe(1);
    expect(buildState.getBlockAtCell({ x: 3, y: 2 })).toMatchObject({
      id: "freeBuild:wall:3:2",
      blockType: FREE_BLOCK_TYPES.WALL
    });
    expect(blockInstances).toHaveLength(1);
    expect(blockInstances[0]).toMatchObject({
      id: "freeBuild:wall:3:2",
      active: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      freeBlockCell: { x: 3, y: 2 }
    });
  });

  it("rejects selected walls without wood before mutating build state", () => {
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
    const inventory = { wood: 0 };
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.validateSelectedBlockTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0,
      inventory
    })).toMatchObject({
      handled: true,
      valid: false,
      reason: "missing-material",
      blockType: FREE_BLOCK_TYPES.WALL,
      missingItemId: "wood",
      requiredQuantity: 1,
      availableQuantity: 0,
      targetCell: { x: 3, y: 2 }
    });

    expect(controller.placeSelectedBlockAtTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0,
      inventory
    })).toMatchObject({
      handled: true,
      placed: false,
      reason: "missing-material",
      blockType: FREE_BLOCK_TYPES.WALL,
      missingItemId: "wood"
    });
    expect(inventory.wood).toBe(0);
    expect(buildState.getCompletionState().blockCount).toBe(0);
  });

  it("refunds wood when removing a selected wall", () => {
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
    const inventory = { wood: 1 };
    const blockInstances = [];
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    });
    expect(inventory.wood).toBe(0);

    expect(controller.removeBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    })).toMatchObject({
      handled: true,
      removed: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 2, y: 2 }
    });
    expect(inventory.wood).toBe(1);
    expect(buildState.getCompletionState().blockCount).toBe(0);
    expect(blockInstances).toHaveLength(0);
  });

  it("can remove a wall for a collectible drop instead of a direct refund", () => {
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
    const inventory = { wood: 1 };
    const blockInstances = [];
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    });
    expect(inventory.wood).toBe(0);

    expect(controller.removeBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory,
      refundMaterial: false
    })).toMatchObject({
      handled: true,
      removed: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      materialCost: {
        itemId: "wood",
        quantity: 1
      },
      targetCell: { x: 2, y: 2 }
    });
    expect(inventory.wood).toBe(0);
    expect(buildState.getCompletionState().blockCount).toBe(0);
    expect(blockInstances).toHaveLength(0);
  });

  it("stacks selected walls above occupied cells only when stacking is unlocked", () => {
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
    const inventory = { wood: 3 };
    const blockInstances = [];
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    })).toMatchObject({
      placed: true,
      targetCell: { x: 2, y: 2 }
    });

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    })).toMatchObject({
      placed: false,
      reason: "duplicate-block",
      targetCell: { x: 2, y: 2 }
    });

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      allowStacking: true,
      inventory
    })).toMatchObject({
      placed: true,
      targetCell: { x: 2, y: 2, layer: 1 },
      block: {
        cell: { x: 2, y: 2, layer: 1 }
      }
    });

    expect(inventory.wood).toBe(1);
    expect(buildState.getCompletionState().blockCount).toBe(2);
    expect(buildState.getBlockAtCell({ x: 2, y: 2 })).toMatchObject({
      cell: { x: 2, y: 2 }
    });
    expect(buildState.getBlockAtCell({ x: 2, y: 2, layer: 1 })).toMatchObject({
      cell: { x: 2, y: 2, layer: 1 }
    });
    expect(blockInstances).toHaveLength(2);
    expect(blockInstances[1]).toMatchObject({
      id: "freeBuild:wall:2:2:1",
      freeBlockCell: { x: 2, y: 2, layer: 1 },
      offset: [2.5, 1.03, 2.5]
    });

    expect(controller.removeBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      inventory
    })).toMatchObject({
      removed: true,
      targetCell: { x: 2, y: 2, layer: 1 }
    });
    expect(inventory.wood).toBe(2);
    expect(buildState.getCompletionState().blockCount).toBe(1);
    expect(buildState.getBlockAtCell({ x: 2, y: 2 })).not.toBeNull();
    expect(buildState.getBlockAtCell({ x: 2, y: 2, layer: 1 })).toBeNull();
    expect(blockInstances).toHaveLength(1);
  });

  it("serializes and restores stacked free block layers", () => {
    const buildState = createBuildState();
    buildState.placeBlock({ x: 1, y: 1 }, { blockType: FREE_BLOCK_TYPES.WALL });
    buildState.placeBlock({ x: 1, y: 1 }, {
      allowStacking: true,
      blockType: FREE_BLOCK_TYPES.WALL
    });

    const snapshot = buildState.serializeFreeBlocks();
    expect(snapshot.blocks).toContainEqual({
      cell: { x: 1, y: 1, layer: 1 },
      blockType: FREE_BLOCK_TYPES.WALL
    });

    const restoredBuildState = createBuildState();
    expect(restoredBuildState.restoreFreeBlocks(snapshot)).toMatchObject({
      restored: {
        blockCount: 2
      },
      rejected: []
    });
    expect(restoredBuildState.getBlockAtCell({ x: 1, y: 1, layer: 1 })).toMatchObject({
      blockType: FREE_BLOCK_TYPES.WALL
    });
  });

  it("creates a rectangular build zone with 12 border cells for a 4x4 foundation", () => {
    const buildZone = createRectangularFreeBlockBuildZone({
      id: "tutorial-foundation",
      originCell: { x: 2, y: 3 },
      width: 4,
      height: 4
    });

    expect(buildZone).toMatchObject({
      id: "tutorial-foundation",
      originCell: { x: 2, y: 3 },
      width: 4,
      height: 4
    });
    expect(buildZone.cells).toHaveLength(16);
    expect(buildZone.borderCells).toHaveLength(12);
    expect(buildZone.interiorCells).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 5 }
    ]);
  });

  it("limits wall placement to build-zone border cells", () => {
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
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 2, y: 2 },
      width: 4,
      height: 4
    });
    const inventory = { wood: 2 };
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 3, y: 3 },
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      valid: false,
      reason: "outside-build-zone",
      blockType: FREE_BLOCK_TYPES.WALL
    });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 3, y: 3 },
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      placed: false,
      reason: "outside-build-zone",
      blockType: FREE_BLOCK_TYPES.WALL
    });
    expect(inventory.wood).toBe(2);

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 3 },
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      placed: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 2, y: 3 }
    });
    expect(inventory.wood).toBe(1);
  });

  it("keeps an empty floor cell valid between two placed Builder Bot blocks", () => {
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

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 3 }
    })).toMatchObject({ placed: true });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 4, y: 3 }
    })).toMatchObject({ placed: true });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 3, y: 3 }
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      targetCell: { x: 3, y: 3 }
    });
  });

  it("keeps an empty foundation wall cell valid between two placed walls", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const inventory = { wood: 3 };
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 3, y: 1 },
      buildZone,
      inventory
    })).toMatchObject({ placed: true });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 5, y: 1 },
      buildZone,
      inventory
    })).toMatchObject({ placed: true });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 1 },
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 4, y: 1 },
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      placed: true,
      targetCell: { x: 4, y: 1 }
    });
    expect(inventory.wood).toBe(0);
  });

  it("snaps an interior wall preview to the empty border gap between two placed walls", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    buildState.placeBlock({ x: 3, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });
    buildState.placeBlock({ x: 5, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.resolveSelectedBlockTarget({
      playerPosition: [4.5, 0, 4.5],
      forwardDirection: [0, -1],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
    expect(controller.validateSelectedBlockTarget({
      playerPosition: [4.5, 0, 4.5],
      forwardDirection: [0, -1],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
  });

  it("snaps an occupied border wall target to the empty gap beside it", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    buildState.placeBlock({ x: 3, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });
    buildState.placeBlock({ x: 5, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.resolveSelectedBlockTarget({
      playerPosition: [3.5, 0, 2.5],
      forwardDirection: [0, -1],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
    expect(controller.validateSelectedBlockTarget({
      playerPosition: [3.5, 0, 2.5],
      forwardDirection: [0, -1],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
  });

  it("does not reject a wall gap because the player or another blocker is on an adjacent cell", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    buildState.placeBlock({ x: 3, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });
    buildState.placeBlock({ x: 5, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 1 },
      buildZone,
      blockedCells: [
        { x: 3, y: 1 },
        { x: 5, y: 1 },
        { x: 4, y: 2 }
      ],
      blockedReason: "player-cell",
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
  });

  it("does not treat playerPosition as a placement blocker by itself", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 1 },
      playerPosition: [4.5, 0, 1.5],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 4, y: 1 }
    });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 4, y: 1 },
      playerPosition: [4.5, 0, 1.5],
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      handled: true,
      placed: true,
      targetCell: { x: 4, y: 1 }
    });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 5, y: 1 },
      playerPosition: [5.5, 0, 1.5],
      buildZone,
      inventory: { wood: 0 }
    })).toMatchObject({
      handled: true,
      valid: false,
      reason: "missing-material",
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 5, y: 1 }
    });
  });

  it("keeps Builder Bot wall rejection reasons distinct while investigating red previews", () => {
    const gridSystem = createGridSystem({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 10,
      height: 10
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 10,
        height: 10
      }
    });
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 1, y: 1 },
      width: 7,
      height: 7
    });
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    buildState.placeBlock({ x: 3, y: 1 }, {
      blockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 3, y: 1 },
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      valid: false,
      reason: "duplicate-block"
    });
    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 4 },
      buildZone,
      inventory: { wood: 1 }
    })).toMatchObject({
      valid: false,
      reason: "outside-build-zone"
    });
    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 1 },
      buildZone,
      blockedCells: [{ x: 4, y: 1 }],
      blockedReason: "player-cell",
      inventory: { wood: 1 }
    })).toMatchObject({
      valid: false,
      reason: "player-cell"
    });
    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 4, y: 1 },
      buildZone,
      inventory: { wood: 0 }
    })).toMatchObject({
      valid: false,
      reason: "missing-material"
    });
  });

  it("snaps player-aimed foundation wall targets from interior cells to the border", () => {
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
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 2, y: 2 },
      width: 4,
      height: 4
    });
    const inventory = { wood: 2 };
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });

    expect(controller.resolveSelectedBlockTarget({
      playerPosition: [3.5, 0, 3.5],
      forwardDirection: [0, 1],
      buildZone
    })).toMatchObject({
      handled: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 3, y: 5 }
    });

    expect(controller.placeSelectedBlockAtTarget({
      playerPosition: [3.5, 0, 3.5],
      forwardDirection: [0, 1],
      buildZone,
      inventory
    })).toMatchObject({
      handled: true,
      placed: true,
      blockType: FREE_BLOCK_TYPES.WALL,
      targetCell: { x: 3, y: 5 }
    });
    expect(inventory.wood).toBe(1);
  });

  it("tracks foundation border progress from wall cells", () => {
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 0, y: 0 },
      width: 4,
      height: 4
    });
    const buildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: 4,
        height: 4
      }
    });

    buildState.placeBlock(buildZone.borderCells[0], {
      blockType: FREE_BLOCK_TYPES.WALL
    });
    buildState.placeBlock(buildZone.interiorCells[0], {
      blockType: FREE_BLOCK_TYPES.WALL
    });

    expect(getFreeBlockBuildZoneProgress({ buildState, buildZone })).toMatchObject({
      buildZoneId: "free-block-build-zone",
      blockType: FREE_BLOCK_TYPES.WALL,
      requiredCount: 12,
      completedCount: 1,
      complete: false
    });

    for (const cell of buildZone.borderCells.slice(1)) {
      buildState.placeBlock(cell, {
        blockType: FREE_BLOCK_TYPES.WALL
      });
    }

    expect(getFreeBlockBuildZoneProgress({ buildState, buildZone })).toMatchObject({
      requiredCount: 12,
      completedCount: 12,
      complete: true,
      missingCells: []
    });
  });

  it("restores wall blocks from snapshots and syncs wall instances", () => {
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
    const blockInstances = [];
    const controller = createFreeBlockBuildController({
      gridSystem,
      buildState,
      blockInstanceStore: blockInstances
    });

    expect(buildState.restoreFreeBlocks({
      blocks: [
        { cell: { x: 1, y: 1 }, blockType: FREE_BLOCK_TYPES.WALL }
      ]
    })).toMatchObject({
      restored: {
        blockCount: 1
      },
      rejected: []
    });

    expect(buildState.serializeFreeBlocks().blocks).toEqual([
      { cell: { x: 1, y: 1 }, blockType: FREE_BLOCK_TYPES.WALL }
    ]);
    expect(controller.syncInstancesFromState()).toEqual([
      expect.objectContaining({
        id: "freeBuild:wall:1:1",
        blockType: FREE_BLOCK_TYPES.WALL,
        freeBlockCell: { x: 1, y: 1 }
      })
    ]);
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
      blockType: FREE_BLOCK_TYPES.BLOCK,
      targetCell: { x: 3, y: 2 }
    });
    expect(buildState.getCompletionState().blockCount).toBe(0);
  });

  it("validates selected block targets through the placement controller", () => {
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

    expect(controller.validateSelectedBlockTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0
    })).toMatchObject({
      handled: true,
      valid: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.BLOCK,
      targetCell: { x: 3, y: 2 }
    });

    buildState.placeBlock({ x: 3, y: 2 });
    expect(controller.validateSelectedBlockTarget({
      playerPosition: [2.5, 0, 2.5],
      playerYaw: 0
    })).toMatchObject({
      handled: true,
      valid: false,
      reason: "duplicate-block",
      targetCell: { x: 3, y: 2 }
    });
  });

  it("rejects block placement on blocked cells such as the current player cell", () => {
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

    expect(controller.validateSelectedBlockTarget({
      targetCell: { x: 2, y: 2 },
      blockedCells: [{ x: 2, y: 2 }],
      blockedReason: "player-cell"
    })).toMatchObject({
      handled: true,
      valid: false,
      reason: "player-cell",
      blockType: FREE_BLOCK_TYPES.BLOCK
    });
    expect(controller.placeSelectedBlockAtTarget({
      targetCell: { x: 2, y: 2 },
      blockedCells: [{ x: 2, y: 2 }],
      blockedReason: "player-cell"
    })).toMatchObject({
      handled: true,
      placed: false,
      reason: "player-cell",
      blockType: FREE_BLOCK_TYPES.BLOCK
    });
  });

  it("sizes free block model instances to the grid cell and keeps them on the ground", () => {
    const gridSystem = createGridSystem({
      cellSize: 1.25,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8,
      visualOffsetY: 0.03
    });
    const instance = createFreeBlockModelInstance({
      block: { id: "freeBuild:block:2:3", cell: { x: 2, y: 3 } },
      gridSystem
    });

    expect(instance).toMatchObject({
      id: "freeBuild:block:2:3",
      offset: [3.125, 0.03, 4.375],
      scale: 1.25,
      blockType: FREE_BLOCK_TYPES.BLOCK,
      freeBlockCell: { x: 2, y: 3 }
    });
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
