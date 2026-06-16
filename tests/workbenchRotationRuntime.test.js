import { describe, expect, it, vi } from "vitest";

import { createWorkbenchRotationRuntime } from "../app/runtime/construction/workbenchRotationRuntime.js";

const PLACEMENT_ROTATION_STEP = Math.PI * 0.5;

function normalizePlacementYaw(yaw = 0) {
  const fullTurn = Math.PI * 2;
  return ((yaw % fullTurn) + fullTurn) % fullTurn;
}

function getRotatedPlacementSize(size = [1, 1], yaw = 0) {
  const quarterTurn = Math.round(normalizePlacementYaw(yaw) / PLACEMENT_ROTATION_STEP) % 4;
  return quarterTurn % 2 === 1 ? [size[1], size[0]] : [...size];
}

function createRuntime() {
  return createWorkbenchRotationRuntime({
    normalizePlacementYaw,
    getRotatedPlacementSize,
    getTargetSize: (target) => [...(target?.placement?.size || target?.fallbackSize || [1, 1])],
    placementRotationStep: PLACEMENT_ROTATION_STEP
  });
}

function createTarget(overrides = {}) {
  return {
    kind: "trainHouse",
    placement: {
      position: [4, 0.02, 7],
      yaw: 0,
      size: [2, 3]
    },
    rotateSize: true,
    ...overrides
  };
}

describe("createWorkbenchRotationRuntime", () => {
  it("selects and clears a workbench construction", () => {
    const runtime = createRuntime();

    expect(runtime.select(createTarget())).toBe(true);
    expect(runtime.getSelection()).toEqual({
      kind: "trainHouse",
      originalYaw: 0,
      pendingYaw: 0,
      originalSize: [2, 3],
      pendingSize: [2, 3]
    });
    expect(runtime.clear()).toBe(true);
    expect(runtime.getSelection()).toBeNull();
  });

  it("rotates pending yaw and size before confirmation", () => {
    const runtime = createRuntime();
    const target = createTarget();

    runtime.select(target);

    expect(runtime.rotate(target, 1)).toBe(true);
    expect(runtime.getSelection()).toMatchObject({
      pendingYaw: Math.PI * 0.5,
      pendingSize: [3, 2]
    });
    expect(runtime.getPreviewYaw(target)).toBe(Math.PI * 0.5);
    expect(runtime.getPreviewSize(target)).toEqual([3, 2]);
  });

  it("applies confirmed yaw and size, then clears selection", () => {
    const runtime = createRuntime();
    const target = createTarget();
    const syncPlacementYaw = vi.fn();

    runtime.select(target);
    runtime.rotate(target, 1);

    expect(runtime.confirm(target, { syncPlacementYaw })).toBe(true);
    expect(target.placement).toMatchObject({
      yaw: Math.PI * 0.5,
      size: [3, 2]
    });
    expect(syncPlacementYaw).toHaveBeenCalledWith(target.placement);
    expect(runtime.getSelection()).toBeNull();
  });

  it("clears selection when the selected target is no longer valid", () => {
    const runtime = createRuntime();
    const target = createTarget();

    runtime.select(target);

    expect(runtime.getSelectedTarget([target], {
      isTargetValid: () => false
    })).toBeNull();
    expect(runtime.getSelection()).toBeNull();
  });

  it("preserves tint and ground-cell preview calculations", () => {
    const runtime = createRuntime();
    const target = createTarget();
    const instance = {};

    runtime.select(target);

    expect(runtime.applySelectionTint("trainHouse", instance, 0)).toBe(true);
    expect(instance).toEqual({
      tint: [0.35, 1.2, 0.35],
      tintStrength: 0.5,
      alpha: 1
    });
    expect(runtime.getGroundCell(target)).toMatchObject({
      id: "workbench-rotation-trainHouse",
      offset: [4, 0.02, 7],
      surfaceY: 0.02,
      tileSpan: 3.36,
      highlightTargetState: "valid",
      highlightAbilityId: "leafage"
    });
  });

  it("syncs Solar Station placement yaw and workbench rotation visual state", () => {
    const runtime = createRuntime();
    const placement = {
      position: [1, 0.02, 2],
      yaw: Math.PI * 0.5
    };
    const instance = {
      yaw: 0.25
    };

    expect(runtime.syncSolarStationPlacementYaw({
      instance,
      placement
    })).toBe(true);
    expect(instance).toMatchObject({
      solarStationBaseYaw: 0.25,
      yaw: 0.25 + Math.PI * 0.5
    });

    const selectedPlacement = {
      position: [2, 0.02, 3],
      yaw: 0
    };
    const selectedTarget = createTarget({
      kind: "solarStation",
      placement: selectedPlacement,
      rotateSize: false
    });
    const selectedInstance = {
      yaw: 0.1
    };

    runtime.select(selectedTarget);
    runtime.rotate(selectedTarget, 1);

    expect(runtime.syncSolarStationWorkbenchRotationVisual({
      instance: selectedInstance,
      placement: selectedPlacement,
      placed: true,
      nowSeconds: 0
    })).toBe(true);
    expect(selectedInstance).toMatchObject({
      solarStationBaseYaw: 0.1,
      yaw: 0.1 + Math.PI * 0.5,
      tint: [0.35, 1.2, 0.35],
      tintStrength: 0.5,
      alpha: 1
    });
  });

  it("guards Solar Station workbench rotation visual sync and resets inactive tint", () => {
    const runtime = createRuntime();
    const placement = {
      position: [1, 0.02, 2],
      yaw: Math.PI
    };
    const previewActiveInstance = { yaw: 0.2 };
    const instance = {
      yaw: 0.25,
      alpha: 0.5,
      tintStrength: 0.3
    };

    expect(runtime.syncSolarStationWorkbenchRotationVisual({
      instance: previewActiveInstance,
      placement,
      placementPreviewActive: true,
      placed: true
    })).toBe(false);
    expect(previewActiveInstance).toEqual({ yaw: 0.2 });

    expect(runtime.syncSolarStationWorkbenchRotationVisual({
      instance,
      placement,
      placed: true,
      nowSeconds: 0
    })).toBe(true);
    expect(instance).toMatchObject({
      solarStationBaseYaw: 0.25,
      yaw: 0.25 + Math.PI,
      alpha: 1,
      tintStrength: 0
    });
  });
});
