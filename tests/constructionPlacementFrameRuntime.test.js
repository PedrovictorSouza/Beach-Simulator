import { describe, expect, it, vi } from "vitest";

import {
  createConstructionPlacementFrameRuntime,
  resolveActiveConstructionPlacementPreviews
} from "../app/runtime/construction/constructionPlacementFrameRuntime.js";

function createRuntime({
  controls = {},
  session = {},
  workbenchRotationRuntime = { getSelection: () => null },
  callbacks = {}
} = {}) {
  return createConstructionPlacementFrameRuntime({
    controls: {
      consumePlacementRotationRequest: () => 0,
      consumePlacementCancelRequest: vi.fn(() => false),
      consumeJumpRequest: vi.fn(() => false),
      consumeFreeBlockBuildRequest: vi.fn(() => false),
      ...controls
    },
    session,
    placementContracts: ["contract"],
    workbenchRotationRuntime,
    callbacks: {
      rotateActivePlacementPreview: vi.fn(() => null),
      rotateNearbyWorkbenchConstruction: vi.fn(),
      hasActivePlacementPreview: vi.fn(() => false),
      hasPendingWorkbenchPlacementIntent: vi.fn(() => false),
      clearWorkbenchConstructionRotationSelection: vi.fn(),
      cancelActivePlacementPreviews: vi.fn(),
      cancelPendingWorkbenchPlacementIntentWithNotice: vi.fn(),
      isBuildBlockFieldMoveEquipped: vi.fn(() => false),
      startTimburrBuildBlockAction: vi.fn(),
      playCancelSound: vi.fn(),
      pushNotice: vi.fn(),
      getFreeBlockInvalidPlacementNotice: vi.fn(() => "Invalid spot"),
      updateSolarStationPlacementPreview: vi.fn(() => ({ id: "solar" })),
      updateGreenhousePlacementPreview: vi.fn(() => ({ id: "greenhouse" })),
      updateCampfirePlacementPreview: vi.fn(() => ({ id: "campfire" })),
      updateLeafDenKitPlacementPreview: vi.fn(() => ({ id: "leaf-den" })),
      updateSolarStationSpawnEffect: vi.fn(),
      syncSolarStationWorkbenchRotationVisual: vi.fn(),
      syncFreeBlockBuildPreview: vi.fn(() => ({ debug: { id: "debug" } })),
      updateBuildBlockDebugOverlay: vi.fn(),
      ...callbacks
    }
  });
}

describe("construction placement frame runtime", () => {
  it("keeps only placement previews whose session preview is still active", () => {
    expect(resolveActiveConstructionPlacementPreviews({
      session: {
        strawBedPlacementPreview: { active: true },
        greenhousePlacementPreview: { active: false },
        campfirePlacementPreview: { active: true },
        leafDenKitPlacementPreview: null
      },
      solarStationPlacementPreview: { id: "solar" },
      greenhousePlacementPreview: { id: "greenhouse" },
      campfirePlacementPreview: { id: "campfire" },
      leafDenKitPlacementPreview: { id: "leaf-den" }
    })).toEqual({
      solarStationPlacementPreview: { id: "solar" },
      greenhousePlacementPreview: null,
      campfirePlacementPreview: { id: "campfire" },
      leafDenKitPlacementPreview: null
    });
  });

  it("rotates active placement previews before falling back to workbench rotation", () => {
    const rotateActivePlacementPreview = vi.fn(() => ({ id: "preview" }));
    const rotateNearbyWorkbenchConstruction = vi.fn();
    const runtime = createRuntime({
      controls: {
        consumePlacementRotationRequest: vi.fn(() => 1)
      },
      callbacks: {
        rotateActivePlacementPreview,
        rotateNearbyWorkbenchConstruction
      }
    });

    runtime.updatePlacementControlsAndPreviews({ now: 1000, deltaTime: 0.1 });

    expect(rotateActivePlacementPreview).toHaveBeenCalledWith(1);
    expect(rotateNearbyWorkbenchConstruction).not.toHaveBeenCalled();
  });

  it("uses the existing placement cancel priority", () => {
    const clearWorkbenchConstructionRotationSelection = vi.fn();
    const cancelActivePlacementPreviews = vi.fn();
    const cancelPendingWorkbenchPlacementIntentWithNotice = vi.fn();
    const runtime = createRuntime({
      controls: {
        consumePlacementCancelRequest: vi.fn(() => true)
      },
      workbenchRotationRuntime: {
        getSelection: () => ({ id: "selection" })
      },
      callbacks: {
        clearWorkbenchConstructionRotationSelection,
        cancelActivePlacementPreviews,
        cancelPendingWorkbenchPlacementIntentWithNotice
      }
    });

    runtime.updatePlacementControlsAndPreviews({ now: 1000, deltaTime: 0.1 });

    expect(clearWorkbenchConstructionRotationSelection).toHaveBeenCalledTimes(1);
    expect(cancelActivePlacementPreviews).not.toHaveBeenCalled();
    expect(cancelPendingWorkbenchPlacementIntentWithNotice).not.toHaveBeenCalled();
  });

  it("drains build and jump input while movement is blocked and no placement cancel is active", () => {
    const consumeFreeBlockBuildRequest = vi.fn(() => true);
    const consumeJumpRequest = vi.fn(() => true);
    const runtime = createRuntime({
      controls: {
        consumeFreeBlockBuildRequest,
        consumeJumpRequest
      },
      session: {
        playerCharacter: { getPosition: () => [1, 0, 1] }
      }
    });

    runtime.updatePlacementControlsAndPreviews({
      now: 1000,
      deltaTime: 0.1,
      movementBlocked: true
    });

    expect(consumeFreeBlockBuildRequest).toHaveBeenCalledTimes(1);
    expect(consumeJumpRequest).toHaveBeenCalledTimes(1);
  });

  it("keeps Build Block request feedback equivalent", () => {
    const playCancelSound = vi.fn();
    const pushNotice = vi.fn();
    const startTimburrBuildBlockAction = vi.fn(() => "missing-material");
    const runtime = createRuntime({
      controls: {
        consumeFreeBlockBuildRequest: vi.fn(() => true)
      },
      session: {
        playerCharacter: { getPosition: () => [2, 0, 3] }
      },
      callbacks: {
        isBuildBlockFieldMoveEquipped: () => true,
        startTimburrBuildBlockAction,
        playCancelSound,
        pushNotice
      }
    });

    runtime.updatePlacementControlsAndPreviews({
      now: 1000,
      deltaTime: 0.1,
      movementBlocked: false
    });

    expect(startTimburrBuildBlockAction).toHaveBeenCalledWith({
      playerPosition: [2, 0, 3]
    });
    expect(playCancelSound).toHaveBeenCalledTimes(1);
    expect(pushNotice).toHaveBeenCalledWith("Need Wood");
  });

  it("updates placement previews and construction visuals with the existing timing", () => {
    const updateSolarStationPlacementPreview = vi.fn(() => ({ id: "solar" }));
    const updateGreenhousePlacementPreview = vi.fn(() => ({ id: "greenhouse" }));
    const updateCampfirePlacementPreview = vi.fn(() => ({ id: "campfire" }));
    const updateLeafDenKitPlacementPreview = vi.fn(() => ({ id: "leaf-den" }));
    const updateSolarStationSpawnEffect = vi.fn();
    const syncSolarStationWorkbenchRotationVisual = vi.fn();
    const session = {
      strawBedModelInstance: { id: "straw-bed" }
    };
    const runtime = createRuntime({
      session,
      callbacks: {
        updateSolarStationPlacementPreview,
        updateGreenhousePlacementPreview,
        updateCampfirePlacementPreview,
        updateLeafDenKitPlacementPreview,
        updateSolarStationSpawnEffect,
        syncSolarStationWorkbenchRotationVisual
      }
    });

    expect(runtime.updatePlacementControlsAndPreviews({
      now: 1500,
      deltaTime: 0.25
    })).toEqual({
      solarStationPlacementPreview: { id: "solar" },
      greenhousePlacementPreview: { id: "greenhouse" },
      campfirePlacementPreview: { id: "campfire" },
      leafDenKitPlacementPreview: { id: "leaf-den" }
    });
    expect(updateSolarStationPlacementPreview).toHaveBeenCalledWith(1.5);
    expect(updateGreenhousePlacementPreview).toHaveBeenCalledWith(1.5);
    expect(updateCampfirePlacementPreview).toHaveBeenCalledWith(1.5);
    expect(updateLeafDenKitPlacementPreview).toHaveBeenCalledWith(1.5);
    expect(updateSolarStationSpawnEffect).toHaveBeenCalledWith(
      session.strawBedModelInstance,
      0.25
    );
    expect(syncSolarStationWorkbenchRotationVisual).toHaveBeenCalledWith(1.5);
  });

  it("updates the Build Block preview and debug overlay from resolved frame gates", () => {
    const syncFreeBlockBuildPreview = vi.fn(() => ({ debug: { id: "debug" } }));
    const updateBuildBlockDebugOverlay = vi.fn();
    const runtime = createRuntime({
      session: {
        playerCharacter: {
          getPosition: () => [4, 0, 5]
        }
      },
      callbacks: {
        syncFreeBlockBuildPreview,
        updateBuildBlockDebugOverlay
      }
    });

    expect(runtime.updateFreeBlockPreview({
      now: 2000,
      buildBlockEquipped: true,
      cinematicActive: false,
      gameplayOpeningMovementLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      tutorialActive: false,
      pokedexModalOpen: false,
      skillLearnActive: false,
      scriptedInteractionActive: false,
      dialogueActive: false
    })).toEqual({
      freeBlockPreviewTarget: { debug: { id: "debug" } }
    });
    expect(syncFreeBlockBuildPreview).toHaveBeenCalledWith({
      active: true,
      playerPosition: [4, 0, 5],
      nowSeconds: 2
    });
    expect(updateBuildBlockDebugOverlay).toHaveBeenCalledWith({ id: "debug" });
  });
});
