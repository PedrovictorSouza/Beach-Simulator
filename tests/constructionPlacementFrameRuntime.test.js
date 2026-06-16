import { describe, expect, it, vi } from "vitest";

import {
  createConstructionPlacementFrameRuntime,
  resolveActiveConstructionPlacementPreviews,
  syncPlacementPreviewPositionToPlayer,
  updateLeafDenKitConstructionPlacementPreview,
  updateRectangularConstructionPlacementPreview,
  updateSolarStationConstructionPlacementPreview
} from "../app/runtime/construction/constructionPlacementFrameRuntime.js";

function createRuntime({
  controls = {},
  getMovementAxes = () => ({ up: [0, 0, 1] }),
  getPlayerPosition = () => session.playerCharacter?.getPosition?.() || null,
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
    getMovementAxes,
    getPlayerPosition,
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
  it("syncs active placement preview position to the player with default forward spacing", () => {
    const preview = {
      active: true,
      position: [1.05, 0.02, 2.05]
    };

    expect(syncPlacementPreviewPositionToPlayer({
      preview,
      playerPosition: [1, 0.04, 2],
      defaultForwardDistance: 2,
      getMovementAxes: () => ({ up: [0, 0, 1] })
    })).toBe(preview);

    expect(preview.followPlayerOffset).toEqual([0, 0, 2]);
    expect(preview.position).toEqual([1, 0.02, 4]);
  });

  it("keeps existing placement preview offset and clamps to finite bounds", () => {
    const preview = {
      active: true,
      position: [1, 0.03, 2],
      followPlayerOffset: [10, 0, -10],
      bounds: {
        minX: -1,
        maxX: 3,
        minZ: -2,
        maxZ: 4
      }
    };

    syncPlacementPreviewPositionToPlayer({
      preview,
      playerPosition: [1, 0.04, 2]
    });

    expect(preview.followPlayerOffset).toEqual([10, 0, -10]);
    expect(preview.position).toEqual([3, 0.03, -2]);
  });

  it("exposes placement preview position sync through the construction frame runtime", () => {
    const preview = {
      active: true,
      position: [2.05, 0.02, 3.05]
    };
    const runtime = createRuntime({
      getPlayerPosition: () => [2, 0.04, 3],
      getMovementAxes: () => ({ up: [1, 0, 0] })
    });

    runtime.syncPlacementPreviewPositionToPlayer(preview, 1.5);

    expect(preview.followPlayerOffset).toEqual([1.5, 0, 0]);
    expect(preview.position).toEqual([3.5, 0.02, 3]);
  });

  it("updates Solar Station placement previews and their model instances", () => {
    const isPlacementBlocked = vi.fn(() => true);
    const preview = {
      active: true,
      position: [1, 0.02, 2],
      gridStep: 1,
      yaw: Math.PI * 0.5
    };
    const instance = {
      offset: [0, 0.2, 0],
      scale: 2,
      yaw: 0.25
    };

    expect(updateSolarStationConstructionPlacementPreview({
      preview,
      instance,
      timeSeconds: 0,
      gridFootprint: { width: 4, height: 4 },
      syncPlacementPreview: (activePreview) => {
        activePreview.position = [4, 0.02, 6];
      },
      isPlacementBlocked
    })).toBe(preview);

    expect(isPlacementBlocked).toHaveBeenCalledWith({
      minX: 2,
      maxX: 6,
      minZ: 4,
      maxZ: 8
    });
    expect(preview).toMatchObject({
      snappedPosition: [4, 0.02, 6],
      valid: false,
      readyForConfirm: true
    });
    expect(instance).toMatchObject({
      solarStationBaseYaw: 0.25,
      offset: [4, 0.2, 6],
      scale: 2,
      yaw: 0.25 + Math.PI * 0.5,
      active: true,
      tint: [1, 0.04, 0.02]
    });
    expect(instance.alpha).toBeCloseTo(0.46);
    expect(instance.tintStrength).toBeCloseTo(0.79);
  });

  it("honors inactive Solar Station preview visibility policy", () => {
    const hiddenInstance = { active: true };
    const keptInstance = { active: true };

    expect(updateSolarStationConstructionPlacementPreview({
      preview: { active: false },
      instance: hiddenInstance,
      shouldHideInactiveInstance: () => true
    })).toBeNull();
    expect(hiddenInstance.active).toBe(false);

    expect(updateSolarStationConstructionPlacementPreview({
      preview: { active: false },
      instance: keptInstance,
      shouldHideInactiveInstance: () => false
    })).toBeNull();
    expect(keptInstance.active).toBe(true);
  });

  it("updates rectangular construction previews and their model instances", () => {
    const validationCalls = [];
    const blockers = [{ id: "blocking-object" }];
    const preview = {
      active: true,
      position: [1, 0.02, 2],
      size: [4, 2],
      gridStep: 1,
      yaw: Math.PI * 0.5
    };
    const instance = {
      offset: [0, 0.1, 0],
      scale: 2,
      yaw: 0.25
    };

    expect(updateRectangularConstructionPlacementPreview({
      preview,
      instance,
      timeSeconds: 0,
      fallbackFootprint: [1.7, 1.45],
      gridFootprint: { width: 2, height: 3 },
      getBlockers: () => blockers,
      validatePlacement: (payload) => {
        validationCalls.push(payload);
        return {
          valid: false,
          reason: "blocked"
        };
      },
      syncPlacementPreview: (activePreview) => {
        activePreview.position = [4, 0.02, 6];
      },
      modelStateKeys: {
        groundY: "trainHouseGroundY",
        baseScale: "trainHouseBaseScale",
        baseYaw: "trainHouseBaseYaw"
      },
      resetSwayStrength: true
    })).toBe(preview);

    expect(validationCalls).toEqual([
      {
        position: [4, 0.02, 6],
        size: [3, 2],
        blockers
      }
    ]);
    expect(preview).toMatchObject({
      snappedPosition: [4, 0.02, 6],
      effectiveSize: [2, 4],
      valid: false,
      invalidReason: "blocked",
      readyForConfirm: true
    });
    expect(instance).toMatchObject({
      trainHouseGroundY: 0.1,
      trainHouseBaseScale: 2,
      trainHouseBaseYaw: 0.25,
      offset: [4, 0.1, 6],
      scale: 2,
      yaw: 0.25 + Math.PI * 0.5,
      swayStrength: 0,
      active: true,
      tint: [1, 0.04, 0.02]
    });
    expect(instance.alpha).toBeCloseTo(0.46);
    expect(instance.tintStrength).toBeCloseTo(0.79);
  });

  it("honors inactive rectangular construction preview visibility policy", () => {
    const hiddenInstance = { active: true };
    const keptInstance = { active: true };

    expect(updateRectangularConstructionPlacementPreview({
      preview: { active: false },
      instance: hiddenInstance,
      shouldHideInactiveInstance: () => true
    })).toBeNull();
    expect(hiddenInstance.active).toBe(false);

    expect(updateRectangularConstructionPlacementPreview({
      preview: { active: false },
      instance: keptInstance,
      shouldHideInactiveInstance: () => false
    })).toBeNull();
    expect(keptInstance.active).toBe(true);
  });

  it("updates Leaf Den Kit previews with power radius and site choice state", () => {
    const blockers = [{ id: "blocking-object" }];
    const siteChoice = { id: "site-choice" };
    const validatePlacement = vi.fn(() => ({
      valid: true,
      reason: null
    }));
    const isInsidePowerRadius = vi.fn(() => false);
    const evaluateSiteChoice = vi.fn(() => siteChoice);
    const preview = {
      active: true,
      position: [1, 0.02, 2],
      size: [1.95, 1.45],
      gridStep: 1,
      yaw: Math.PI * 0.5
    };
    const instance = {
      offset: [0, 0.12, 0],
      scale: 1.4,
      yaw: 0.3
    };

    expect(updateLeafDenKitConstructionPlacementPreview({
      preview,
      instance,
      timeSeconds: 0,
      fallbackFootprint: [1.95, 1.45],
      gridFootprint: { width: 3, height: 3 },
      getBlockers: () => blockers,
      validatePlacement,
      syncPlacementPreview: (activePreview) => {
        activePreview.position = [4, 0.02, 6];
      },
      isInsidePowerRadius,
      evaluateSiteChoice,
      getSolarStationPowerPosition: () => [8, 0.02, 8],
      workbenchPosition: [2, 0.02, 2],
      getSolarStationPowerRadius: () => 7
    })).toBe(preview);

    expect(validatePlacement).toHaveBeenCalledWith({
      position: [4, 0.02, 6],
      size: [3, 3],
      blockers
    });
    expect(isInsidePowerRadius).toHaveBeenCalledWith([4, 0.02, 6]);
    expect(evaluateSiteChoice).toHaveBeenCalledWith({
      position: [4, 0.02, 6],
      footprint: [3, 3],
      blockers,
      groundState: "stable",
      requiresPower: true,
      solarStationPosition: [8, 0.02, 8],
      workbenchPosition: [2, 0.02, 2],
      thresholds: {
        solarStationRadius: 7
      }
    });
    expect(preview).toMatchObject({
      snappedPosition: [4, 0.02, 6],
      effectiveSize: [1.45, 1.95],
      valid: false,
      invalidReason: "outside-solar-station-radius",
      siteChoice,
      readyForConfirm: true
    });
    expect(instance).toMatchObject({
      leafDenGroundY: 0.12,
      leafDenBaseScale: 1.4,
      leafDenBaseYaw: 0.3,
      offset: [4, 0.12, 6],
      scale: 1.4,
      yaw: 0.3 + Math.PI * 0.5,
      active: true,
      tint: [1, 0.04, 0.02]
    });
    expect(instance.alpha).toBeCloseTo(0.46);
    expect(instance.tintStrength).toBeCloseTo(0.79);
  });

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
