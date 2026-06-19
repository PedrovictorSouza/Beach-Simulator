import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopStartupRuntimeBundle
} from "../app/runtime/gameLoopStartupRuntimes.js";

describe("createGameLoopStartupRuntimeBundle", () => {
  it("wires base runtime output into early runtime creation", () => {
    const baseRuntimeBundle = {
      audio: { id: "audio" },
      cameraDebugRuntime: { id: "camera-debug" },
      freeBlockBuildSessionRuntime: { id: "free-block-session" },
      playSoundEvent: vi.fn()
    };
    const earlyRuntimeBundle = {
      landscapeCutEffectRuntime: { id: "landscape" },
      worldSceneSyncRuntime: { id: "world-scene" }
    };
    const createBaseRuntime = vi.fn(() => baseRuntimeBundle);
    const createEarlyRuntime = vi.fn(() => earlyRuntimeBundle);
    const callbacks = {
      getGameplayInputRuntime: vi.fn(),
      getNowMs: vi.fn()
    };
    const math = {
      clamp01: vi.fn(),
      easeOutCubic: vi.fn(),
      lerp: vi.fn()
    };

    const result = createGameLoopStartupRuntimeBundle({
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresets: [{ zoom: 2 }],
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      mount: { id: "mount" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      callbacks,
      math,
      createBaseRuntime,
      createEarlyRuntime
    });

    expect(result).toEqual({
      ...baseRuntimeBundle,
      ...earlyRuntimeBundle
    });
    expect(createBaseRuntime).toHaveBeenCalledWith({
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresets: [{ zoom: 2 }],
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      mount: { id: "mount" },
      session: { id: "session" }
    });
    expect(createEarlyRuntime).toHaveBeenCalledWith({
      audio: baseRuntimeBundle.audio,
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      runtimes: {
        freeBlockBuildSessionRuntime:
          baseRuntimeBundle.freeBlockBuildSessionRuntime
      },
      callbacks,
      math
    });
  });
});
