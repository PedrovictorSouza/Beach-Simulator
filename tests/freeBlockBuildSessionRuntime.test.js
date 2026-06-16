import { describe, expect, it } from "vitest";

import { FREE_BLOCK_TYPES } from "../app/gameplay/freeBlockBuildSystem.js";
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
});
