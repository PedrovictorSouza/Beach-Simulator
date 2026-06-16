import { describe, expect, it, vi } from "vitest";

import { createConstructionPlacementControlRuntime } from "../app/runtime/construction/constructionPlacementControlRuntime.js";

function createRuntime() {
  const session = {
    pendingPlacementIntent: {
      source: "workbench",
      itemId: "strawBed",
      label: "Solar Station"
    },
    strawBedPlacementPreview: {
      active: true,
      yaw: 0
    },
    greenhousePlacementPreview: {
      active: false,
      yaw: 0
    },
    campfirePlacementPreview: {
      active: false,
      yaw: 0
    },
    leafDenKitPlacementPreview: {
      active: false,
      yaw: 0
    }
  };
  const controls = {
    inventory: {
      wood: 3
    },
    playerSkills: {
      buildBlock: true
    },
    getActiveMoveId: vi.fn(() => "buildBlock")
  };
  const callbacks = {
    getSelectedBlockMaterialCost: vi.fn(() => ({
      itemId: "wood",
      quantity: 2
    })),
    normalizePlacementYaw: vi.fn((yaw) => yaw),
    playCancelSound: vi.fn(),
    playRotateSound: vi.fn(),
    pushNotice: vi.fn()
  };
  const runtime = createConstructionPlacementControlRuntime({
    session,
    controls,
    config: {
      placementRotationStep: Math.PI * 0.5
    },
    callbacks
  });

  return {
    callbacks,
    controls,
    runtime,
    session
  };
}

describe("createConstructionPlacementControlRuntime", () => {
  it("cancels pending Workbench placement intent with feedback", () => {
    const { callbacks, runtime, session } = createRuntime();

    expect(runtime.cancelPendingWorkbenchPlacementIntentWithNotice()).toBe(true);
    expect(session.pendingPlacementIntent).toBeNull();
    expect(callbacks.playCancelSound).toHaveBeenCalledTimes(1);
    expect(callbacks.pushNotice).toHaveBeenCalledWith("Solar Station placement canceled.");
  });

  it("rotates active placement previews with existing feedback", () => {
    const { callbacks, runtime, session } = createRuntime();

    expect(runtime.rotateActivePlacementPreview(1)).toBe(true);
    expect(session.strawBedPlacementPreview.yaw).toBe(Math.PI * 0.5);
    expect(callbacks.playRotateSound).toHaveBeenCalledTimes(1);
    expect(callbacks.pushNotice).toHaveBeenCalledWith("Preview rotated.");
  });

  it("resolves Build Block equipped state from controls", () => {
    const { controls, runtime } = createRuntime();

    expect(runtime.isBuildBlockFieldMoveEquipped()).toBe(true);
    controls.getActiveMoveId.mockReturnValue("waterGun");
    expect(runtime.isBuildBlockFieldMoveEquipped()).toBe(false);
  });

  it("builds Free Block cost marker from the selected material cost", () => {
    const { runtime } = createRuntime();

    expect(runtime.getFreeBlockBuildCostMarker({
      targetPosition: [1, 0.03, 2]
    })).toEqual({
      text: "2/3",
      affordable: true,
      worldPosition: [1, 0.03, 2]
    });
  });
});
