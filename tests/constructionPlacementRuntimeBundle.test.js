import { describe, expect, it, vi } from "vitest";

import {
  createConstructionPlacementRuntimeBundle,
  createGameplayConstructionPlacementRuntimeBundle
} from "../app/runtime/construction/constructionPlacementRuntimeBundle.js";

function createHarness() {
  const controls = {
    inventory: {},
    playerSkills: {
      buildBlock: true
    },
    getActiveMoveId: vi.fn(() => "buildBlock"),
    consumeFreeBlockBuildRequest: vi.fn(() => false),
    consumeJumpRequest: vi.fn(() => false),
    consumePlacementCancelRequest: vi.fn(() => false),
    consumePlacementRotationRequest: vi.fn(() => 0),
    storyState: {
      flags: {}
    }
  };
  const session = {
    playerCharacter: {
      getPosition: vi.fn(() => [2, 0.04, 3])
    }
  };
  const callbacks = {
    applySolarStationSpawnEffect: vi.fn(),
    cancelActivePlacementPreviews: vi.fn(),
    evaluateHabitatSiteChoice: vi.fn(() => null),
    getFreeBlockInvalidPlacementNotice: vi.fn(() => "Invalid placement"),
    getMovementAxes: vi.fn(() => ({ forward: [0, 0, 1], right: [1, 0, 0] })),
    getPlacementCollisionSize: vi.fn(() => [1, 1]),
    getPlacementPreviewFootprintWorldSize: vi.fn(() => [1, 1]),
    getSelectedBlockMaterialCost: vi.fn(() => ({ wood: 1 })),
    hasActivePlacementPreview: vi.fn(() => false),
    hasPendingWorkbenchPlacementIntent: vi.fn(() => false),
    normalizePlacementYaw: vi.fn((yaw) => yaw),
    playCancelSound: vi.fn(),
    playRotateSound: vi.fn(),
    pushNotice: vi.fn(),
    syncFreeBlockBuildPreview: vi.fn(() => ({
      debug: { id: "debug-target" },
      targetCell: { x: 2, z: 3 }
    })),
    updateBuildBlockDebugOverlay: vi.fn(),
    validatePlacement: vi.fn(() => ({ valid: true, reason: null }))
  };
  const runtimes = {
    buildBlockRuntime: {
      startAction: vi.fn(() => "started")
    },
    solarStationPlacementBlockerRuntime: {
      getBlockers: vi.fn(() => []),
      isBlocked: vi.fn(() => false)
    },
    workbenchRotationRuntime: {
      clearSelectionWithFeedback: vi.fn(),
      getSelection: vi.fn(() => null),
      rotateNearbyTargetWithFeedback: vi.fn(),
      syncSolarStationWorkbenchRotationVisualFromSources: vi.fn()
    }
  };

  return {
    bundle: createConstructionPlacementRuntimeBundle({
      controls,
      session,
      runtimes,
      callbacks,
      placementContracts: [],
      config: {
        greenhouseFallbackFootprint: [2, 2],
        greenhouseGridFootprint: [2, 2],
        leafDenKitFallbackFootprint: [2, 2],
        leafDenKitGridFootprint: [2, 2],
        leafDenKitSolarStationRadiusMultiplier: 1,
        markedTileLimit: 8,
        placementRotationStep: Math.PI / 2,
        solarStationFollowDistance: 2,
        solarStationGridFootprint: [2, 2],
        solarStationPreviewFootprint: [2, 2],
        trainHouseFallbackFootprint: [2, 2],
        trainHouseGridFootprint: [2, 2],
        workbenchPosition: [0, 0, 0]
      }
    }),
    callbacks,
    controls,
    session
  };
}

describe("createConstructionPlacementRuntimeBundle", () => {
  it("creates construction placement runtimes with the existing public contract", () => {
    const { bundle, callbacks, controls, session } = createHarness();

    expect(bundle.constructionPlacementControlRuntime.isBuildBlockFieldMoveEquipped())
      .toBe(true);

    const { freeBlockPreviewTarget } =
      bundle.constructionPlacementFrameRuntime.updateFreeBlockPreview({
        now: 1200,
        buildBlockEquipped: true
      });

    expect(callbacks.syncFreeBlockBuildPreview).toHaveBeenCalledWith({
      active: true,
      playerPosition: [2, 0.04, 3],
      nowSeconds: 1.2
    });
    expect(callbacks.updateBuildBlockDebugOverlay)
      .toHaveBeenCalledWith({ id: "debug-target" });
    expect(freeBlockPreviewTarget).toMatchObject({
      targetCell: { x: 2, z: 3 }
    });
    expect(controls.getActiveMoveId).toHaveBeenCalled();
    expect(session.playerCharacter.getPosition).toHaveBeenCalled();
  });

  it("creates the gameplay bundle with construction defaults", () => {
    const controls = { storyState: { flags: {} } };
    const session = {};
    const runtimes = {};
    const callbacks = {};
    const calls = [];
    const bundle = { constructionPlacementControlRuntime: {} };

    expect(createGameplayConstructionPlacementRuntimeBundle({
      controls,
      session,
      runtimes,
      callbacks,
      createRuntimeBundle: (options) => {
        calls.push(options);
        return bundle;
      }
    })).toBe(bundle);

    expect(calls).toEqual([
      expect.objectContaining({
        controls,
        session,
        runtimes,
        callbacks,
        placementContracts: expect.any(Array),
        config: expect.objectContaining({
          greenhouseFallbackFootprint: [2.85, 1.7],
          leafDenKitFallbackFootprint: [1.95, 1.45],
          leafDenKitSolarStationRadiusMultiplier: 3,
          markedTileLimit: 1200,
          placementRotationStep: Math.PI * 0.5,
          solarStationFollowDistance: 2.85,
          trainHouseFallbackFootprint: [1.7, 1.45],
          workbenchPosition: expect.any(Array)
        })
      })
    ]);
  });
});
