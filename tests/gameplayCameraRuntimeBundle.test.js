import { describe, expect, it, vi } from "vitest";
import { createGameplayCameraRuntimeBundle } from "../app/runtime/camera/gameplayCameraRuntimeBundle.js";

describe("createGameplayCameraRuntimeBundle", () => {
  it("wires gameplay camera runtimes and debug state in the camera domain", () => {
    const camera = {
      getPose: vi.fn(() => ({ target: [1, 0, 2] }))
    };
    const cameraOrbit = { id: "orbit" };
    const cameraDebugRuntime = { attachGlobalListeners: vi.fn() };
    const cameraZoomPresetController = {
      getCurrentPreset: vi.fn(() => ({ zoom: 4, distance: 9 }))
    };
    const placementCameraAssist = { update: vi.fn() };
    const gameplayCameraDirector = {
      getState: vi.fn(() => ({ mode: "follow" }))
    };
    const gameplayCameraFrameRuntime = { updateInput: vi.fn(), updateFollow: vi.fn() };
    const foundationBuildZoneCameraFocusRuntime = { updateFrame: vi.fn() };
    const factories = {
      createCameraDebugRuntime: vi.fn(() => cameraDebugRuntime),
      createCameraZoomPresetController: vi.fn(() => cameraZoomPresetController),
      createFoundationBuildZoneCameraFocusRuntime: vi.fn(() => foundationBuildZoneCameraFocusRuntime),
      createGameplayCameraDirector: vi.fn(() => gameplayCameraDirector),
      createGameplayCameraFrameRuntime: vi.fn(() => gameplayCameraFrameRuntime),
      createPlacementCameraAssist: vi.fn(() => placementCameraAssist)
    };
    const controls = {
      storyState: {
        flags: {}
      }
    };
    const gameplay = {
      getActiveQuest: vi.fn(() => ({ id: "quest-a" })),
      getActiveSystemQuest: vi.fn(() => ({ id: "system-a" }))
    };
    const session = {
      gameplayOpeningShip: {
        position: [5, 0, 6],
        visible: true
      },
      playerCharacter: {
        getPosition: vi.fn(() => [3, 0, 4])
      }
    };
    const isGameplayFlow = vi.fn(() => true);
    const playNavigateSound = vi.fn();
    const getZoneSignature = vi.fn(() => "zone-a");
    const foundationBuildZoneRuntime = { id: "foundation" };

    const bundle = createGameplayCameraRuntimeBundle({
      camera,
      cameraOrbit,
      cameraZoomPresets: [{ zoom: 4 }],
      controls,
      enabledDebug: true,
      factories,
      gameplay,
      mount: { id: "mount" },
      session
    });

    expect(bundle).toMatchObject({
      cameraDebugRuntime,
      cameraZoomPresetController,
      placementCameraAssist,
      gameplayCameraDirector
    });
    expect(cameraDebugRuntime.attachGlobalListeners).toHaveBeenCalledTimes(1);
    expect(factories.createCameraZoomPresetController).toHaveBeenCalledWith({
      camera,
      presets: [{ zoom: 4 }]
    });
    expect(factories.createPlacementCameraAssist).toHaveBeenCalledWith({
      camera,
      getGameplayPreset: expect.any(Function)
    });
    expect(factories.createGameplayCameraDirector).toHaveBeenCalledWith({
      camera,
      cameraOrbit
    });

    const debugOptions = factories.createCameraDebugRuntime.mock.calls[0][0];
    expect(debugOptions.enabled).toBe(true);
    expect(debugOptions.mount).toEqual({ id: "mount" });
    expect(debugOptions.readFrameState({ now: 1200 })).toEqual({
      paused: false,
      gameplayCameraState: { mode: "follow" },
      cameraPose: { target: [1, 0, 2] },
      systemQuestId: "system-a",
      uiQuestId: "quest-a",
      playerPosition: [3, 0, 4],
      shipVisible: true,
      shipPosition: [5, 0, 6]
    });

    expect(bundle.createGameplayCameraFrameRuntime({
      isGameplayFlow,
      openingRuntime: { id: "opening" },
      playNavigateSound,
      tutorial: { id: "tutorial" }
    })).toBe(gameplayCameraFrameRuntime);
    expect(factories.createGameplayCameraFrameRuntime).toHaveBeenCalledWith({
      camera,
      cameraOrbit,
      cameraZoomPresetController,
      controls,
      tutorial: { id: "tutorial" },
      session,
      openingRuntime: { id: "opening" },
      callbacks: {
        isGameplayFlow,
        onCycleCameraZoom: playNavigateSound
      }
    });

    expect(bundle.createFoundationBuildZoneCameraFocusRuntime({
      foundationBuildZoneRuntime,
      getZoneSignature
    })).toBe(foundationBuildZoneCameraFocusRuntime);
    expect(factories.createFoundationBuildZoneCameraFocusRuntime).toHaveBeenCalledWith({
      foundationBuildZoneRuntime,
      gameplay,
      controls,
      camera,
      cameraOrbit,
      getZoneSignature
    });
  });
});
