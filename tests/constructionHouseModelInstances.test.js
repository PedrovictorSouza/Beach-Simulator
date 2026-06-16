import { describe, expect, it, vi } from "vitest";

import {
  createConstructionHouseModelInstanceRuntime,
  ensurePlayerHouseModelInstances,
  syncCampfireTrainHouseModelInstance,
  syncGreenhouseModelInstances,
  syncLeafDenModelInstance,
  syncPlayerHouseModelInstances
} from "../app/runtime/construction/constructionHouseModelInstances.js";

describe("construction house model instances", () => {
  it("syncs the Campfire Train House model with dance, spawn and rotation tint callbacks", () => {
    const campfire = {
      position: [3, 0.02, 5],
      yaw: 0.5
    };
    const instance = {
      trainHouseBaseScale: 1.4,
      trainHouseGroundY: 0.03,
      active: false,
      alpha: 0.5,
      tintStrength: 0.8
    };
    const applyTrainHouseDance = vi.fn();
    const applyPlacementSpawn = vi.fn(() => false);
    const applyRotationTint = vi.fn();

    syncCampfireTrainHouseModelInstance({
      session: {
        campfire,
        campfireTrainHouseModelInstance: instance
      },
      storyState: {
        flags: {
          campfireSpatOut: true
        }
      },
      nowSeconds: 2.5,
      deltaTime: 0.2,
      getWorkbenchRotationPreviewYaw: () => 1.25,
      applyTrainHouseDance,
      applyPlacementSpawn,
      applyRotationTint
    });

    expect(applyTrainHouseDance).toHaveBeenCalledWith(
      instance,
      campfire.position,
      2.5,
      1.25
    );
    expect(applyPlacementSpawn).toHaveBeenCalledWith(campfire, instance, {
      baseScale: 1.4,
      groundY: 0.03,
      deltaTime: 0.2
    });
    expect(instance).toMatchObject({
      alpha: 1,
      tintStrength: 0
    });
    expect(applyRotationTint).toHaveBeenCalledWith("trainHouse", instance, 2.5);
  });

  it("hides the Campfire Train House model until the campfire has spat out", () => {
    const instance = {
      active: true
    };

    syncCampfireTrainHouseModelInstance({
      session: {
        campfire: {
          position: [3, 0.02, 5]
        },
        campfireTrainHouseModelInstance: instance
      },
      storyState: {
        flags: {
          campfireSpatOut: false
        }
      }
    });

    expect(instance.active).toBe(false);
  });

  it("creates a runtime that injects session state and model callbacks", () => {
    const campfire = {
      position: [3, 0.02, 5]
    };
    const trainHouseInstance = {
      trainHouseBaseScale: 1.4,
      trainHouseGroundY: 0.03,
      active: false
    };
    const greenhouse = {
      position: [7, 0.02, 9],
      yaw: 0.5
    };
    const greenhouseInstance = {
      greenhouseBaseScale: 1.8,
      greenhouseGroundY: 0.04,
      greenhouseBaseYaw: 0.25,
      active: false
    };
    const playerHouse = {
      id: "house-a",
      position: [8, 0.02, 9],
      yaw: 0.5
    };
    const playerHouseInstance = {
      offset: [0, 0.03, 0],
      scale: 1.75,
      yaw: 0.25,
      active: false
    };
    const session = {
      campfire,
      campfireTrainHouseModelInstance: trainHouseInstance,
      greenhouses: [greenhouse],
      greenhouseModelInstances: [greenhouseInstance],
      playerHouses: [playerHouse],
      playerHouseModelInstances: [playerHouseInstance],
      leafDenModelInstances: [playerHouseInstance]
    };
    const applyTrainHouseDance = vi.fn();
    const applyPlacementSpawn = vi.fn(() => false);
    const applyRotationTint = vi.fn();
    const runtime = createConstructionHouseModelInstanceRuntime({
      session,
      getStoryState: () => ({ flags: { campfireSpatOut: true } }),
      getNowSeconds: () => 2.5,
      getSelectedRotationKind: () => "playerHouse:house-a",
      prepareDistance: 1,
      getWorkbenchRotationPreviewYaw: () => 1.25,
      isWorldPositionWithinRenderDistance: () => false,
      applyTrainHouseDance,
      applyPlacementSpawn,
      applyRotationTint
    });

    runtime.syncCampfireTrainHouse(0.2);
    runtime.syncGreenhouse(0.1);
    runtime.syncPlayerHouses(0.15, [0, 0, 0]);

    expect(applyTrainHouseDance).toHaveBeenCalledWith(
      trainHouseInstance,
      campfire.position,
      2.5,
      1.25
    );
    expect(greenhouseInstance).toMatchObject({
      active: true,
      offset: [7, 0.04, 9],
      yaw: 0.75
    });
    expect(playerHouseInstance).toMatchObject({
      active: true,
      offset: [8, 0.03, 9],
      yaw: 1.5
    });
    expect(applyRotationTint).toHaveBeenCalledWith("trainHouse", trainHouseInstance, 2.5);
    expect(applyRotationTint).toHaveBeenCalledWith("playerHouse:house-a", playerHouseInstance);
  });

  it("syncs Greenhouse model instances from placements", () => {
    const placement = {
      position: [7, 0.02, 9],
      yaw: 0.5
    };
    const instance = {
      greenhouseBaseScale: 1.8,
      greenhouseGroundY: 0.04,
      greenhouseBaseYaw: 0.25,
      active: false
    };
    const applyPlacementSpawn = vi.fn(() => false);

    syncGreenhouseModelInstances({
      session: {
        greenhouses: [placement],
        greenhouseModelInstances: [instance]
      },
      deltaTime: 0.1,
      applyPlacementSpawn
    });

    expect(applyPlacementSpawn).toHaveBeenCalledWith(placement, instance, {
      baseScale: 1.8,
      groundY: 0.04,
      deltaTime: 0.1
    });
    expect(instance).toMatchObject({
      active: true,
      offset: [7, 0.04, 9],
      scale: 1.8,
      yaw: 0.75,
      alpha: 1,
      tintStrength: 0
    });
  });

  it("hides Greenhouse model instances when no placements exist", () => {
    const first = {
      active: true
    };
    const second = {
      active: true
    };

    syncGreenhouseModelInstances({
      session: {
        greenhouses: [],
        greenhouseModelInstances: [first, second]
      }
    });

    expect(first.active).toBe(false);
    expect(second.active).toBe(false);
  });

  it("syncs the Leaf Den model and applies spawn and rotation tint callbacks", () => {
    const leafDen = {
      id: "leafDen",
      position: [4, 0.02, 6]
    };
    const instance = {
      offset: [0, 0.04, 0],
      scale: 1.5,
      yaw: 0.25,
      active: false
    };
    const previewInstance = {
      active: true,
      alpha: 0.4,
      tintStrength: 0.9
    };
    const applyPlacementSpawn = vi.fn();
    const applyRotationTint = vi.fn();

    syncLeafDenModelInstance({
      session: {
        leafDen,
        leafDenModelInstance: instance,
        leafDenPlacementPreviewModelInstance: previewInstance,
        leafDenKitPlacementPreview: {
          active: false
        }
      },
      storyState: {
        flags: {
          leafDenKitPlaced: true
        }
      },
      deltaTime: 0.2,
      getWorkbenchRotationPreviewYaw: () => 1,
      applyPlacementSpawn,
      applyRotationTint
    });

    expect(previewInstance).toMatchObject({
      active: false,
      alpha: 1,
      tintStrength: 0
    });
    expect(instance).toMatchObject({
      offset: [4, 0.04, 6],
      scale: 1.5,
      yaw: 1.25,
      alpha: 1,
      tintStrength: 0,
      active: true,
      leafDenGroundY: 0.04,
      leafDenBaseScale: 1.5,
      leafDenBaseYaw: 0.25
    });
    expect(applyPlacementSpawn).toHaveBeenCalledWith(leafDen, instance, {
      baseScale: 1.5,
      groundY: 0.04,
      deltaTime: 0.2
    });
    expect(applyRotationTint).toHaveBeenCalledWith("house", instance);
  });

  it("does not sync the placed Leaf Den model while placement preview is active", () => {
    const instance = {
      active: true
    };

    syncLeafDenModelInstance({
      session: {
        leafDenModelInstance: instance,
        leafDenKitPlacementPreview: {
          active: true
        }
      },
      storyState: {
        flags: {
          leafDenKitPlaced: true
        }
      }
    });

    expect(instance).toEqual({
      active: true
    });
  });

  it("creates player house model instances from the Leaf Den model defaults", () => {
    const session = {
      playerHouses: [
        {
          id: "house-a",
          position: [8, 0.02, 9],
          yaw: 0.5
        }
      ],
      leafDenModelInstance: {
        leafDenBaseScale: 1.75,
        leafDenBaseYaw: 0.25,
        leafDenGroundY: 0.03
      }
    };

    const instances = ensurePlayerHouseModelInstances(session);

    expect(instances).toHaveLength(1);
    expect(instances[0]).toMatchObject({
      id: "house-a-model",
      offset: [8, 0.03, 9],
      scale: 1.75,
      yaw: 0.75,
      active: false,
      leafDenGroundY: 0.03,
      leafDenBaseScale: 1.75,
      leafDenBaseYaw: 0.25
    });
    expect(session.leafDenModelInstances).toContain(instances[0]);
  });

  it("syncs selected player house models even when they are outside render distance", () => {
    const house = {
      id: "house-a",
      position: [8, 0.02, 9],
      yaw: 0.5
    };
    const instance = {
      offset: [0, 0.03, 0],
      scale: 1.75,
      yaw: 0.25,
      active: false
    };
    const applyPlacementSpawn = vi.fn();
    const applyRotationTint = vi.fn();

    syncPlayerHouseModelInstances({
      session: {
        playerHouses: [house],
        playerHouseModelInstances: [instance],
        leafDenModelInstances: [instance]
      },
      deltaTime: 0.1,
      renderCenter: [0, 0, 0],
      selectedRotationKind: "playerHouse:house-a",
      prepareDistance: 1,
      getWorkbenchRotationPreviewYaw: () => 0.75,
      isWorldPositionWithinRenderDistance: () => false,
      applyPlacementSpawn,
      applyRotationTint
    });

    expect(instance).toMatchObject({
      offset: [8, 0.03, 9],
      scale: 1.75,
      yaw: 1,
      alpha: 1,
      tintStrength: 0,
      active: true,
      leafDenGroundY: 0.03,
      leafDenBaseScale: 1.75,
      leafDenBaseYaw: 0.25
    });
    expect(applyPlacementSpawn).toHaveBeenCalledWith(house, instance, {
      baseScale: 1.75,
      groundY: 0.03,
      deltaTime: 0.1
    });
    expect(applyRotationTint).toHaveBeenCalledWith("playerHouse:house-a", instance);
  });
});
