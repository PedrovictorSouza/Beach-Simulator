import { describe, expect, it, vi } from "vitest";

import {
  createConstructionPresentationRuntimeBundle
} from "../app/runtime/construction/constructionPresentationRuntimeBundle.js";

describe("createConstructionPresentationRuntimeBundle", () => {
  it("wires construction model, Leaf Den presentation and helper motion runtimes", () => {
    const storyState = {
      flags: {
        leafDenBuilt: false,
        leafDenConstructionCompletesAt: 3000,
        leafDenConstructionStarted: true,
        leafDenConstructionStartedAt: 1000
      }
    };
    const greenhouseInstance = {};
    const session = {
      greenhouseModelInstances: [greenhouseInstance],
      greenhouses: [
        {
          position: [7, 0.02, 9],
          yaw: 0.75
        }
      ],
      leafDen: {
        position: [4, 0.02, 6]
      }
    };
    const applyPlacementSpawn = vi.fn(() => false);
    const getRobotModelYawToward = vi.fn(() => 1.25);

    const bundle = createConstructionPresentationRuntimeBundle({
      controls: {
        storyState
      },
      session,
      workbenchRotationRuntime: {
        applySelectionTint: vi.fn(),
        getPreviewYaw: vi.fn(() => 1.5),
        getSelection: vi.fn(() => null)
      },
      callbacks: {
        applyPlacementSpawn,
        applyTrainHouseDance: vi.fn(),
        getRobotModelYawToward,
        isWorldPositionWithinRenderDistance: vi.fn(() => true)
      },
      config: {
        playerConstructionModelPrepareDistance: 3
      },
      getNowMs: () => 2000,
      getNowSeconds: () => 2
    });

    bundle.constructionHouseModelInstanceRuntime.syncGreenhouse(0.1);
    expect(greenhouseInstance).toMatchObject({
      active: true,
      offset: [7, 0.02, 9],
      yaw: 0.75
    });

    expect(bundle.leafDenConstructionPresentationRuntime.isActive()).toBe(true);
    expect(bundle.leafDenConstructionPresentationRuntime.getProgress()).toBe(0.5);

    const encounter = {
      visible: false,
      position: [0, 0, 0],
      modelInstance: {
        scale: 1,
        yaw: 0
      }
    };
    expect(bundle.constructionHelperMotionRuntime.moveToLeafDen(encounter)).toBe(true);
    expect(encounter.visible).toBe(true);
    expect(getRobotModelYawToward).toHaveBeenCalledWith(
      encounter.position,
      [4, 0.02, 6],
      0
    );
  });
});
