import { describe, expect, it, vi } from "vitest";

import { createFreeBlockBuildRuntime } from "../app/runtime/construction/freeBlockBuildRuntime.js";

function createRuntime({
  sessionOverrides = {},
  controllerOverrides = {}
} = {}) {
  const controller = {
    resolveSelectedBlockTarget: vi.fn(() => ({
      targetCell: { x: 2, y: 3 }
    })),
    validateSelectedBlockTarget: vi.fn(() => ({
      valid: true,
      targetCell: { x: 2, y: 3 }
    })),
    placeSelectedBlockAtTarget: vi.fn(() => ({
      placed: true,
      blockType: "wall",
      targetCell: { x: 2, y: 3 },
      block: { id: "wall-1" }
    })),
    removeBlockAtTarget: vi.fn(() => ({
      removed: true,
      materialCost: {
        itemId: "wood",
        quantity: 1
      }
    })),
    ...controllerOverrides
  };
  const session = {
    playerCharacter: {
      getPosition: () => [2.5, 0, 3.5],
      setPosition: vi.fn()
    },
    playerModelInstance: {
      yaw: 0
    },
    freeBlockBuildState: {
      getBlockAtCell: () => null
    },
    freeBlockPreviewInstance: {},
    freeBlockInstances: [
      {
        id: "block-1",
        active: true,
        offset: [2.5, 0, 3.5],
        freeBlockCell: { x: 2, y: 3 }
      }
    ],
    woodDrops: [],
    ...sessionOverrides
  };
  const controls = {
    inventory: {
      wood: 3
    },
    storyState: {
      flags: {}
    },
    onFoundationWallBuilt: vi.fn()
  };
  const freeBlockBuildSessionRuntime = {
    getGridConfig: () => ({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8,
      visualOffsetY: 0.03
    }),
    getController: () => controller,
    buildFeedbackGroundCell: ({ result }) => ({
      id: `feedback:${result?.targetCell?.x}:${result?.targetCell?.y}`
    }),
    syncSnapshot: vi.fn()
  };
  const foundationBuildZoneRuntime = {
    isBuildZoneUnavailable: vi.fn(() => false),
    getActiveBuildZone: vi.fn(() => ({ id: "foundation" })),
    canStack: vi.fn(() => true),
    syncCompletionEffects: vi.fn()
  };
  const companionConstructionBlockerRuntime = {
    isBlocked: vi.fn(() => false)
  };
  const playerModelRuntime = {
    sync: vi.fn()
  };
  const groundActionFeedbackRuntime = {
    triggerFeedback: vi.fn()
  };
  const playPlacedSound = vi.fn();
  const playInvalidSound = vi.fn();
  const playImpactSound = vi.fn();
  const pushNotice = vi.fn();

  const runtime = createFreeBlockBuildRuntime({
    session,
    controls,
    freeBlockBuildSessionRuntime,
    foundationBuildZoneRuntime,
    companionConstructionBlockerRuntime,
    playerModelRuntime,
    groundActionFeedbackRuntime,
    config: {
      wallBlockType: "wall",
      dropSize: [0.5, 0.5],
      pickupRadius: 0.25,
      spread: 0.1
    },
    callbacks: {
      getTerrainColliders: () => [],
      isPositionInsideCollider: () => false,
      resolvePreviewValidity: ({ validation }) => ({
        valid: validation.valid !== false,
        reason: validation.reason || null
      }),
      resolveDisplacementPosition: () => [3.5, 0, 3.5],
      playPlacedSound,
      playInvalidSound,
      playImpactSound,
      pushNotice
    }
  });

  return {
    controls,
    controller,
    foundationBuildZoneRuntime,
    freeBlockBuildSessionRuntime,
    groundActionFeedbackRuntime,
    playImpactSound,
    playInvalidSound,
    playPlacedSound,
    playerModelRuntime,
    pushNotice,
    runtime,
    session
  };
}

describe("createFreeBlockBuildRuntime", () => {
  it("resolves, previews, places and removes Free Blocks through injected runtime sources", () => {
    const {
      controls,
      controller,
      foundationBuildZoneRuntime,
      freeBlockBuildSessionRuntime,
      groundActionFeedbackRuntime,
      playImpactSound,
      playPlacedSound,
      playerModelRuntime,
      pushNotice,
      runtime,
      session
    } = createRuntime();

    expect(runtime.resolveBuildTarget([2.5, 0, 3.5])).toMatchObject({
      targetCell: { x: 2, y: 3 },
      targetPosition: [2.5, 0.03, 3.5],
      valid: true
    });

    expect(runtime.getPreviewTarget([2.5, 0, 3.5])).toMatchObject({
      targetCell: { x: 2, y: 3 },
      valid: true
    });
    expect(runtime.syncPreview({
      active: true,
      playerPosition: [2.5, 0, 3.5],
      nowSeconds: 0
    })).toMatchObject({
      targetCell: { x: 2, y: 3 }
    });
    expect(session.freeBlockPreviewInstance).toMatchObject({
      active: true,
      freeBlockCell: { x: 2, y: 3 }
    });

    expect(runtime.tryPlaceFromBuildInput(100)).toMatchObject({
      handled: true,
      result: {
        placed: true
      }
    });
    expect(controller.placeSelectedBlockAtTarget).toHaveBeenCalledWith({
      playerPosition: [2.5, 0, 3.5],
      buildZone: { id: "foundation" },
      allowStacking: true,
      playerYaw: 0,
      inventory: controls.inventory
    });
    expect(groundActionFeedbackRuntime.triggerFeedback).toHaveBeenCalledWith(
      { id: "feedback:2:3" },
      "build",
      100
    );
    expect(controls.storyState.flags.firstFreeBlockPlaced).toBe(true);
    expect(controls.onFoundationWallBuilt).toHaveBeenCalledTimes(1);
    expect(foundationBuildZoneRuntime.syncCompletionEffects).toHaveBeenCalledWith(100);
    expect(freeBlockBuildSessionRuntime.syncSnapshot).toHaveBeenCalledTimes(1);
    expect(playPlacedSound).toHaveBeenCalledTimes(1);
    expect(playerModelRuntime.sync).toHaveBeenCalledWith(session, 0);
    expect(pushNotice).toHaveBeenCalledWith("Wall placed.");

    expect(runtime.applyTimburrImpact({ targetCell: { x: 2, y: 3 } }, 200)).toMatchObject({
      placed: true
    });

    expect(runtime.tryRemoveNearby([2.5, 0, 3.5], 300)).toBe(true);
    expect(playImpactSound).toHaveBeenCalledTimes(1);
    expect(session.woodDrops).toEqual([
      expect.objectContaining({
        id: "wood-1",
        itemId: "wood",
        pickupRadius: 0.25,
        size: [0.5, 0.5]
      })
    ]);
  });

  it("uses unavailable foundation validation without placing through the controller", () => {
    const {
      controller,
      foundationBuildZoneRuntime,
      playInvalidSound,
      runtime
    } = createRuntime();
    foundationBuildZoneRuntime.isBuildZoneUnavailable.mockReturnValue(true);

    expect(runtime.tryPlaceFromBuildInput(100)).toMatchObject({
      handled: true,
      result: {
        placed: false,
        reason: "blocked-cell"
      }
    });
    expect(controller.placeSelectedBlockAtTarget).not.toHaveBeenCalled();
    expect(playInvalidSound).toHaveBeenCalledTimes(1);
  });
});
