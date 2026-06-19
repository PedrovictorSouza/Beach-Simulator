import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopBaseRuntimeBundle
} from "../app/runtime/gameLoopBaseRuntimes.js";

describe("createGameLoopBaseRuntimeBundle", () => {
  it("wires base game-loop runtimes", () => {
    const frameClock = { id: "clock" };
    const cameraRuntimeBundle = {
      cameraDebugRuntime: { id: "camera-debug" },
      cameraZoomPresetController: { id: "zoom-presets" },
      createFoundationBuildZoneCameraFocusRuntime: vi.fn(),
      createGameplayCameraFrameRuntime: vi.fn(),
      gameplayCameraDirector: { id: "camera-director" },
      placementCameraAssist: { id: "placement-camera" }
    };
    const audioRuntimeBundle = {
      audio: { id: "audio" },
      playSoundEvent: vi.fn(),
      updateFrameAudio: vi.fn()
    };
    const audioCallbacks = {
      playGrowBotRevealSfx: vi.fn(),
      playInstanceObjectSfx: vi.fn(),
      playTreeBirthSfx: vi.fn()
    };
    const freeBlockBuildSessionRuntime = { id: "free-block-session" };
    const movementQuestRuntime = { id: "movement-quest" };
    const companionFacingRuntime = { id: "companion-facing" };
    const createFrameClock = vi.fn(() => frameClock);
    const createCameraRuntimeBundle = vi.fn(() => cameraRuntimeBundle);
    const createAudioRuntimeBundle = vi.fn(() => audioRuntimeBundle);
    const createAudioCallbacks = vi.fn(() => audioCallbacks);
    const createFreeBlockBuildSessionRuntime =
      vi.fn(() => freeBlockBuildSessionRuntime);
    const createMovementQuest = vi.fn(() => movementQuestRuntime);
    const createCompanionFacingRuntime = vi.fn(() => companionFacingRuntime);

    const result = createGameLoopBaseRuntimeBundle({
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresets: [{ zoom: 2 }],
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      mount: { id: "mount" },
      session: { id: "session" },
      initialNow: 1234,
      createAudioCallbacks,
      createAudioRuntimeBundle,
      createCameraRuntimeBundle,
      createCompanionFacingRuntime,
      createFrameClock,
      createFreeBlockBuildSessionRuntime,
      createMovementQuest
    });

    expect(result).toEqual({
      frameClock,
      ...cameraRuntimeBundle,
      ...audioRuntimeBundle,
      ...audioCallbacks,
      companionFacingRuntime,
      freeBlockBuildSessionRuntime,
      movementQuestRuntime
    });
    expect(createFrameClock).toHaveBeenCalledWith({
      now: 1234,
      maxDeltaTime: 0.033
    });
    expect(createCameraRuntimeBundle).toHaveBeenCalledWith({
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresets: [{ zoom: 2 }],
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      mount: { id: "mount" },
      session: { id: "session" }
    });
    expect(createAudioRuntimeBundle).toHaveBeenCalledWith({
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      session: { id: "session" }
    });
    expect(createAudioCallbacks).toHaveBeenCalledWith(audioRuntimeBundle.audio);
    expect(createFreeBlockBuildSessionRuntime).toHaveBeenCalledWith({
      session: { id: "session" }
    });
    expect(createMovementQuest).toHaveBeenCalledWith({
      minimumMovementDistance: 0.0005,
      reportDistance: 0.04
    });
    expect(createCompanionFacingRuntime).toHaveBeenCalledWith({
      session: { id: "session" }
    });
  });
});
