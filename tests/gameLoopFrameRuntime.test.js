import { describe, expect, it, vi } from "vitest";

import { createGameLoopFrameRuntime } from "../app/runtime/gameLoopFrameRuntime.js";

function createRuntime({
  paused = false,
  frameRuntimeOverrides = {}
} = {}) {
  const nextFrame = { id: "frame-1" };
  const flowState = { gameplayActive: true };
  const frameClock = {
    update: vi.fn(() => ({
      rawDeltaTime: 0.12,
      deltaTime: 0.033
    }))
  };
  const frameSnapshotController = {
    beginFrame: vi.fn(() => nextFrame),
    commitFrame: vi.fn()
  };
  const fpsPanelController = {
    update: vi.fn()
  };
  const controls = {
    updateGamepads: vi.fn(),
    isPaused: vi.fn(() => paused),
    clearPendingActions: vi.fn(),
    clearMovementInput: vi.fn()
  };
  const readFlowState = vi.fn(() => flowState);
  const advanceElapsed = vi.fn();
  const runtime = createGameLoopFrameRuntime({
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState,
    advanceElapsed,
    ...frameRuntimeOverrides
  });

  return {
    runtime,
    nextFrame,
    flowState,
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState,
    advanceElapsed
  };
}

describe("createGameLoopFrameRuntime", () => {
  it("begins a snapshot and returns timing with the current flow state", () => {
    const context = createRuntime();

    expect(context.runtime.beginFrame(1200)).toEqual({
      nextFrame: context.nextFrame,
      rawDeltaTime: 0.12,
      deltaTime: 0.033,
      flowState: context.flowState
    });
    expect(context.frameSnapshotController.beginFrame).toHaveBeenCalledOnce();
    expect(context.frameClock.update).toHaveBeenCalledWith(1200);
    expect(context.fpsPanelController.update).toHaveBeenCalledWith(0.12);
    expect(context.advanceElapsed).toHaveBeenCalledWith(0.033);
    expect(context.readFlowState).toHaveBeenCalledOnce();
  });

  it("updates gamepads without clearing input while gameplay is not paused", () => {
    const context = createRuntime();

    expect(context.runtime.updateInputAndCheckPaused(0.016)).toBe(false);
    expect(context.controls.updateGamepads).toHaveBeenCalledWith(0.016);
    expect(context.controls.clearPendingActions).not.toHaveBeenCalled();
    expect(context.controls.clearMovementInput).not.toHaveBeenCalled();
  });

  it("clears pending actions and movement input when paused", () => {
    const context = createRuntime({ paused: true });

    expect(context.runtime.updateInputAndCheckPaused(0.016)).toBe(true);
    expect(context.controls.updateGamepads).toHaveBeenCalledWith(0.016);
    expect(context.controls.clearPendingActions).toHaveBeenCalledOnce();
    expect(context.controls.clearMovementInput).toHaveBeenCalledOnce();
  });

  it("commits the current snapshot through the snapshot controller", () => {
    const context = createRuntime();

    context.runtime.commitFrame();

    expect(context.frameSnapshotController.commitFrame).toHaveBeenCalledOnce();
  });

  it("does not schedule animation frames directly", () => {
    const context = createRuntime();

    expect(context.runtime).not.toHaveProperty("requestAnimationFrame");
  });

  it("begins the gameplay frame context with opening, placement and blocker state", () => {
    const openingRuntime = {
      beginFrame: vi.fn(() => ({
        cameraFrame: { phase: "establishing" }
      })),
      isCameraLocked: vi.fn(() => true),
      isMovementLocked: vi.fn(() => true)
    };
    const hasActivePlacementPreview = vi.fn(() => true);
    const placementCameraAssist = {
      update: vi.fn()
    };
    const updateFoundationBuildZoneCameraFocus = vi.fn(() => false);
    const resolveBlockers = vi.fn(() => ({
      movementBlocked: true,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: false
    }));
    const session = { id: "session" };
    const placementContracts = [{ id: "contract" }];
    const context = createRuntime({
      frameRuntimeOverrides: {
        gameplayOpeningRuntime: openingRuntime,
        session,
        placement: {
          contracts: placementContracts,
          hasActivePlacementPreview
        },
        placementCameraAssist,
        updateFoundationBuildZoneCameraFocus,
        resolveBlockers
      }
    });
    const flowState = {
      gameplayActive: true,
      tutorialActive: false
    };

    expect(context.runtime.beginGameplayFrameContext({
      now: 1200,
      deltaTime: 0.016,
      flowState
    })).toEqual({
      gameplayOpeningCameraFrame: { phase: "establishing" },
      gameplayOpeningCameraLocked: true,
      gameplayOpeningMovementLocked: true,
      placementPreviewActive: true,
      foundationBuildZoneCameraFocusActive: false,
      movementBlocked: true,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: false
    });
    expect(openingRuntime.beginFrame).toHaveBeenCalledWith({
      now: 1200,
      deltaTime: 0.016,
      gameplayActive: true
    });
    expect(hasActivePlacementPreview).toHaveBeenCalledWith(session, placementContracts);
    expect(placementCameraAssist.update).toHaveBeenCalledWith({
      placementActive: true
    });
    expect(updateFoundationBuildZoneCameraFocus).toHaveBeenCalledWith(1200);
    expect(resolveBlockers).toHaveBeenCalledWith({
      gameplayOpeningMovementLocked: true,
      foundationBuildZoneCameraFocusActive: false,
      placementPreviewActive: true,
      flowState
    });
  });
});
