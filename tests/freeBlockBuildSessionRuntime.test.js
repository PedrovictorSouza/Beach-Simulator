import { describe, expect, it } from "vitest";

import {
  createRectangularFreeBlockBuildZone,
  FREE_BLOCK_TYPES
} from "../app/gameplay/freeBlockBuildSystem.js";
import {
  createFreeBlockBuildSessionRuntime,
  normalizeFreeBlockBuildGridConfig
} from "../app/runtime/construction/freeBlockBuildSessionRuntime.js";

const DEFAULT_GRID_CONFIG = Object.freeze({
  cellSize: 1,
  origin: Object.freeze({ x: -128, y: 0, z: -128 }),
  width: 256,
  height: 256,
  visualOffsetY: 0.03
});

describe("free block build session runtime", () => {
  it("normalizes grid config from session sources with default fallbacks", () => {
    expect(normalizeFreeBlockBuildGridConfig({
      sourceConfig: {
        cellSize: "2",
        origin: { x: "4", z: "6" },
        width: "3.8",
        height: "0",
        visualOffsetY: "0.2"
      },
      defaultGridConfig: DEFAULT_GRID_CONFIG
    })).toEqual({
      cellSize: 2,
      origin: { x: 4, y: 0, z: 6 },
      width: 3,
      height: 1,
      visualOffsetY: 0.2
    });
  });

  it("creates and reuses a session-backed controller", () => {
    const session = {};
    const runtime = createFreeBlockBuildSessionRuntime({
      session,
      defaultGridConfig: {
        ...DEFAULT_GRID_CONFIG,
        width: 4,
        height: 5
      }
    });

    const controller = runtime.getController();

    expect(controller).toBe(runtime.getController());
    expect(session.freeBlockPlacementController).toBe(controller);
    expect(session.freeBlockInstances).toEqual([]);
    expect(session.freeBlockBuildState.bounds).toEqual({
      minX: 0,
      maxX: 3,
      minY: 0,
      maxY: 4
    });
    expect(session.freeBlockPlacementGridSignature).toBe(JSON.stringify(runtime.getGridConfig()));
  });

  it("restores snapshots and syncs serialized state through the runtime", () => {
    const session = {
      freeBlockBuildSnapshot: {
        blocks: [
          {
            cell: { x: 1, y: 2 },
            blockType: FREE_BLOCK_TYPES.WALL
          }
        ]
      }
    };
    const runtime = createFreeBlockBuildSessionRuntime({
      session,
      defaultGridConfig: {
        ...DEFAULT_GRID_CONFIG,
        width: 4,
        height: 4
      }
    });

    runtime.getController();

    expect(session.freeBlockInstances).toHaveLength(1);
    expect(session.freeBlockInstances[0]).toMatchObject({
      blockType: FREE_BLOCK_TYPES.WALL,
      freeBlockCell: { x: 1, y: 2 }
    });

    const snapshot = runtime.syncSnapshot();
    expect(session.freeBlockBuildSnapshot).toBe(snapshot);
    expect(snapshot.blocks).toEqual([
      {
        cell: { x: 1, y: 2 },
        blockType: FREE_BLOCK_TYPES.WALL
      }
    ]);
  });

  it("counts foundation progress from restored floor blocks when no wall progress exists", () => {
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 0, y: 0 },
      width: 4,
      height: 4
    });
    const session = {
      freeBlockBuildSnapshot: {
        floorBlocks: [
          { cell: buildZone.borderCells[0] },
          { cell: { x: 99, y: 99 } }
        ]
      }
    };
    const runtime = createFreeBlockBuildSessionRuntime({
      session,
      defaultGridConfig: {
        ...DEFAULT_GRID_CONFIG,
        width: 8,
        height: 8
      }
    });

    runtime.getController();

    expect(runtime.getFoundationBuildZoneProgressCount({ buildZone })).toBe(1);
  });

  it("allows stacking only after the active foundation border is complete", () => {
    const buildZone = createRectangularFreeBlockBuildZone({
      originCell: { x: 0, y: 0 },
      width: 3,
      height: 3
    });
    const session = {};
    const runtime = createFreeBlockBuildSessionRuntime({
      session,
      defaultGridConfig: {
        ...DEFAULT_GRID_CONFIG,
        width: 8,
        height: 8
      }
    });

    runtime.getController();
    expect(runtime.canStackFreeBlockPlacement({ buildZone })).toBe(false);

    for (const cell of buildZone.borderCells) {
      session.freeBlockBuildState.placeBlock(cell, {
        blockType: FREE_BLOCK_TYPES.WALL
      });
    }

    expect(runtime.canStackFreeBlockPlacement({ buildZone })).toBe(true);
  });

  it("syncs the active foundation build zone into session state", () => {
    const session = {};
    const flags = {
      builderTutorialFoundationOriginCell: { x: 1, y: 2 }
    };
    const runtime = createFreeBlockBuildSessionRuntime({
      session,
      defaultGridConfig: DEFAULT_GRID_CONFIG
    });

    const buildZone = runtime.syncActiveBuildZone({
      flags,
      getFoundationProgressCount: () => 0,
      isBuildZoneBlocked: () => false,
      findAvailableBuildZone: () => {
        throw new Error("saved zone should be reused");
      }
    });

    expect(session.activeFreeBlockBuildZone).toBe(buildZone);
    expect(session.freeBlockBuildZoneUnavailable).toBe(false);
    expect(flags.builderTutorialFoundationOriginCell).toEqual(buildZone.originCell);
  });
});
