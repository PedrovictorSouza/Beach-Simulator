import { describe, expect, it, vi } from "vitest";

import { createGameplayCameraFrameRuntime } from "../app/runtime/camera/gameplayCameraFrameRuntime.js";

function createRuntime({
  controls = {},
  session = { playerCharacter: { id: "player" } },
  tutorial = {},
  openingRuntime = {},
  isGameplayFlow = () => true,
  onCycleCameraZoom = vi.fn()
} = {}) {
  const camera = {
    follow: vi.fn(),
    isTargetTransitionActive: vi.fn(() => false),
    setPose: vi.fn()
  };
  const cameraOrbit = {
    turnSpeed: 2,
    getDirection: vi.fn(() => [0, -1, 0]),
    rotate: vi.fn()
  };
  const cameraZoomPresetController = {
    cycle: vi.fn()
  };
  const runtime = createGameplayCameraFrameRuntime({
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls: {
      isBuilderPanelOpen: () => false,
      cameraTurnKeys: new Set(),
      consumeCameraLookDelta: () => ({ yaw: 0, pitch: 0 }),
      consumeCameraZoomCycleRequest: () => false,
      clearCameraLookInput: vi.fn(),
      ...controls
    },
    tutorial: {
      allowsCameraLook: () => false,
      registerCameraLook: vi.fn(),
      ...tutorial
    },
    session,
    openingRuntime: {
      updateCamera: vi.fn(() => ({ phase: "opening" })),
      ...openingRuntime
    },
    callbacks: {
      isGameplayFlow,
      onCycleCameraZoom
    }
  });

  return {
    runtime,
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls: runtime.controls,
    tutorial: runtime.tutorial,
    openingRuntime: runtime.openingRuntime,
    onCycleCameraZoom
  };
}

describe("gameplay camera frame runtime", () => {
  it("applies camera look input and registers tutorial look without changing tuning", () => {
    const registerCameraLook = vi.fn();
    const { runtime, cameraOrbit } = createRuntime({
      controls: {
        cameraTurnKeys: new Set(["ArrowRight"]),
        consumeCameraLookDelta: vi.fn(() => ({ yaw: 0.25, pitch: -0.1 }))
      },
      tutorial: {
        allowsCameraLook: () => true,
        registerCameraLook
      }
    });

    runtime.updateInput({
      deltaTime: 0.5,
      flowState: { tutorialActive: true },
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      placementPreviewActive: false,
      tutorialActive: true
    });

    expect(cameraOrbit.rotate).toHaveBeenCalledWith(1.25, -0.1);
    expect(registerCameraLook).toHaveBeenCalledTimes(1);
  });

  it("consumes zoom cycle requests only when camera zoom is allowed", () => {
    const consumeCameraZoomCycleRequest = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const onCycleCameraZoom = vi.fn();
    const { runtime, cameraZoomPresetController } = createRuntime({
      controls: {
        consumeCameraZoomCycleRequest
      },
      onCycleCameraZoom
    });

    runtime.updateInput({
      deltaTime: 0.1,
      flowState: {},
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      placementPreviewActive: false,
      tutorialActive: false
    });

    expect(cameraZoomPresetController.cycle).toHaveBeenCalledTimes(1);
    expect(onCycleCameraZoom).toHaveBeenCalledTimes(1);
  });

  it("clears camera look input when rotation is blocked", () => {
    const clearCameraLookInput = vi.fn();
    const { runtime, cameraOrbit } = createRuntime({
      session: { playerCharacter: null },
      controls: {
        clearCameraLookInput,
        cameraTurnKeys: new Set(["ArrowRight"])
      },
      tutorial: {
        allowsCameraLook: () => true
      }
    });

    runtime.updateInput({
      deltaTime: 0.5,
      flowState: {},
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      placementPreviewActive: false,
      tutorialActive: false
    });

    expect(cameraOrbit.rotate).not.toHaveBeenCalled();
    expect(clearCameraLookInput).toHaveBeenCalledTimes(1);
  });

  it("keeps tutorial focus ahead of opening and follow camera updates", () => {
    const openingRuntime = {
      updateCamera: vi.fn(() => ({ phase: "opening" }))
    };
    const { runtime, camera } = createRuntime({
      openingRuntime
    });

    const result = runtime.updateFollow({
      now: 1000,
      cinematicActive: false,
      tutorialCameraFocus: [3, 0, 4],
      foundationBuildZoneCameraFocusActive: false,
      gameplayOpeningCameraFrame: null,
      dialogueActive: false,
      cameraTransitionActive: false,
      scriptedInteractionActive: false
    });

    expect(camera.setPose).toHaveBeenCalledWith({
      target: [3, 1.25, 4],
      direction: [0, -1, 0],
      zoom: 3.95,
      distance: 7.35
    });
    expect(openingRuntime.updateCamera).not.toHaveBeenCalled();
    expect(result).toEqual({ gameplayOpeningCameraFrame: null });
  });

  it("delegates gameplay opening camera follow while opening is active", () => {
    const openingFrame = { phase: "establishingShots" };
    const openingRuntime = {
      updateCamera: vi.fn(() => openingFrame)
    };
    const { runtime } = createRuntime({
      openingRuntime,
      isGameplayFlow: () => true
    });

    expect(runtime.updateFollow({
      now: 2000,
      cinematicActive: false,
      tutorialCameraFocus: null,
      foundationBuildZoneCameraFocusActive: false,
      gameplayOpeningCameraFrame: { phase: "shipFall" },
      dialogueActive: false,
      cameraTransitionActive: false,
      scriptedInteractionActive: false
    })).toEqual({
      gameplayOpeningCameraFrame: openingFrame
    });
    expect(openingRuntime.updateCamera).toHaveBeenCalledWith({
      now: 2000,
      gameplayActive: true,
      canFollow: true
    });
  });
});
