import { describe, expect, it, vi } from "vitest";

import {
  createConstructionBuildRuntimeBundle
} from "../app/runtime/construction/constructionBuildRuntimeBundle.js";

describe("createConstructionBuildRuntimeBundle", () => {
  it("wires foundation and free-block build runtimes behind the construction domain", () => {
    const gridConfig = {
      cellSize: 1,
      height: 8,
      origin: { x: 0, y: 0, z: 0 },
      visualOffsetY: 0.03,
      width: 8
    };
    const controller = {
      removeBlockAtTarget: vi.fn(() => ({
        materialCost: {
          itemId: "wood",
          quantity: 1
        },
        removed: true
      }))
    };
    const freeBlockBuildSessionRuntime = {
      buildFeedbackGroundCell: vi.fn(() => ({ id: "feedback:2:3" })),
      getController: vi.fn(() => controller),
      getGridConfig: vi.fn(() => gridConfig),
      syncSnapshot: vi.fn()
    };
    const foundationCameraFocusRuntime = {
      updateFrame: vi.fn()
    };
    const createFoundationBuildZoneCameraFocusRuntime = vi.fn(() => foundationCameraFocusRuntime);
    const groundActionFeedbackRuntime = {
      triggerFeedback: vi.fn()
    };
    const playImpactSound = vi.fn();
    const pushNotice = vi.fn();
    const session = {
      freeBlockBuildState: {},
      freeBlockInstances: [
        {
          active: true,
          freeBlockCell: { x: 2, y: 3 },
          id: "wall-1",
          offset: [2.5, 0.03, 3.5]
        }
      ],
      playerCharacter: {
        getPosition: vi.fn(() => [2.5, 0, 3.5])
      },
      playerModelInstance: {
        yaw: 0
      },
      woodDrops: []
    };
    const controls = {
      inventory: {},
      storyState: {
        flags: {}
      }
    };

    const bundle = createConstructionBuildRuntimeBundle({
      controls,
      rendering: {},
      session,
      runtimes: {
        companionConstructionBlockerRuntime: { isBlocked: vi.fn(() => false) },
        freeBlockBuildSessionRuntime,
        groundActionFeedbackRuntime,
        playerModelRuntime: { sync: vi.fn() },
        worldObjectPlacementBlockerRuntime: { getBlockers: vi.fn(() => []) }
      },
      callbacks: {
        createFoundationBuildZoneCameraFocusRuntime,
        getActorPosition: vi.fn(() => [0, 0, 0]),
        getTerrainColliders: vi.fn(() => []),
        isPositionInsideCollider: vi.fn(() => false),
        playImpactSound,
        playInvalidSound: vi.fn(),
        playPlacedSound: vi.fn(),
        pushNotice,
        resolveDisplacementPosition: vi.fn(() => [3, 0, 3]),
        resolvePreviewValidity: vi.fn(({ validation }) => validation)
      },
      config: {
        wallBlockType: "wall"
      }
    });

    expect(createFoundationBuildZoneCameraFocusRuntime).toHaveBeenCalledWith({
      foundationBuildZoneRuntime: bundle.foundationBuildZoneRuntime,
      getZoneSignature: expect.any(Function)
    });
    expect(bundle.foundationBuildZoneCameraFocusRuntime).toBe(foundationCameraFocusRuntime);
    expect(bundle.freeBlockBuildRuntime.getGridConfig()).toBe(gridConfig);
    expect(bundle.freeBlockBuildRuntime.getController()).toBe(controller);

    expect(bundle.freeBlockBuildRuntime.tryRemoveNearby([2.5, 0, 3.5], 300))
      .toBe(true);
    expect(session.woodDrops).toEqual([
      expect.objectContaining({
        id: "wood-1",
        itemId: "wood",
        pickupRadius: 0.64,
        size: [0.78, 0.78]
      })
    ]);
    expect(playImpactSound).toHaveBeenCalledTimes(1);
    expect(pushNotice).toHaveBeenCalledWith("Block broken. Wood dropped.");
  });
});
