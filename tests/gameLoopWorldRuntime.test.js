import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopWorldRuntimeBundle
} from "../app/runtime/gameLoopWorldRuntime.js";

describe("createGameLoopWorldRuntimeBundle", () => {
  it("wires world runtime dependencies for the game loop", () => {
    const worldBundle = {
      rustlingGrassEventRuntime: { id: "grass" },
      worldCellPlannerInteractionRuntime: { id: "planner" },
      worldSceneSyncRuntime: { id: "scene-sync" }
    };
    const createRuntime = vi.fn(() => worldBundle);
    const freeBlockBuildSessionRuntime = {
      getGridConfig: vi.fn(() => ({ cellSize: 1.5 }))
    };
    const landscapeCutEffectRuntime = {
      update: vi.fn()
    };
    const snowstormFogRuntime = {
      update: vi.fn()
    };
    const session = { id: "session" };

    const result = createGameLoopWorldRuntimeBundle({
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session,
      worldCanvas: { id: "canvas" },
      runtimes: {
        freeBlockBuildSessionRuntime
      },
      callbacks: {
        getLandscapeCutEffectRuntime: () => landscapeCutEffectRuntime,
        getSnowstormFogRuntime: () => snowstormFogRuntime
      },
      createRuntime
    });

    expect(result).toBe(worldBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session,
      worldCanvas: { id: "canvas" },
      callbacks: {
        clearInteractionObjectHighlights: expect.any(Function),
        updateLandscapeCutEffect: expect.any(Function),
        updateSnowstormFog: expect.any(Function)
      },
      config: {
        worldCellPlannerPickMaxDistancePx: 72,
        workbenchPosition: expect.any(Array),
        workbenchInteractDistance: expect.any(Number)
      },
      getGridConfig: expect.any(Function)
    });

    const options = createRuntime.mock.calls[0][0];
    expect(options.getGridConfig()).toEqual({ cellSize: 1.5 });
    options.callbacks.updateLandscapeCutEffect(0.25);
    options.callbacks.updateSnowstormFog({ deltaTime: 0.5 });

    expect(landscapeCutEffectRuntime.update).toHaveBeenCalledWith(0.25);
    expect(snowstormFogRuntime.update).toHaveBeenCalledWith({
      session,
      deltaTime: 0.5
    });
  });
});
