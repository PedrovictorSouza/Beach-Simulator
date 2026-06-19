import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopEarlyRuntimeBundle
} from "../app/runtime/gameLoopEarlyRuntimes.js";

describe("createGameLoopEarlyRuntimeBundle", () => {
  it("wires supply, world, runtime callbacks, nature and blockers", () => {
    const supplyFeedbackRuntimeBundle = {
      playerCounterPromptRuntime: { id: "counter" },
      pushSupplyResourceCollectFeedback: vi.fn(),
      queueChangedSupplyPickupFlyItems: vi.fn(),
      queueSupplyPickupFlyItems: vi.fn(),
      supplyCounterPromptController: { id: "supply-controller" }
    };
    const worldRuntimeBundle = {
      rustlingGrassEventRuntime: { id: "rustling" },
      worldCellPlannerInteractionRuntime: { id: "planner" },
      worldSceneSyncRuntime: { id: "world-scene" }
    };
    const runtimeCallbacks = {
      getCurrentInputModalityState: vi.fn(),
      updateFoundationBuildZoneCameraFocus: vi.fn(),
      startNextQueuedSquirtleWaterGunAction: vi.fn(),
      processWorldCellPlannerClick: vi.fn(),
      getWorldCellPlannerSelectedGroundCell: vi.fn()
    };
    const naturePresentationRuntimeBundle = {
      gearPickupParticleRuntime: { id: "gear" },
      landscapeCutEffectRuntime: { id: "landscape-cut" },
      naturePresentationFrameRuntime: { id: "nature" },
      treeRevivalLeafBurstFrameRuntime: { id: "tree-burst" },
      woodCollectPopRuntime: { id: "wood-pop" }
    };
    const constructionBlockerRuntimeBundle = {
      companionConstructionBlockerRuntime: { id: "companion-blocker" },
      getPlayerConstructionTerrainColliders: vi.fn(),
      solarStationPlacementBlockerRuntime: { id: "solar-blocker" },
      worldObjectPlacementBlockerRuntime: { id: "world-blocker" }
    };
    const createSupplyFeedbackRuntime =
      vi.fn(() => supplyFeedbackRuntimeBundle);
    const createWorldRuntime = vi.fn(() => worldRuntimeBundle);
    const createRuntimeCallbacks = vi.fn(() => runtimeCallbacks);
    const createNaturePresentationRuntime =
      vi.fn(() => naturePresentationRuntimeBundle);
    const createConstructionBlockerRuntime =
      vi.fn(() => constructionBlockerRuntimeBundle);
    const callbacks = {
      getFoundationBuildZoneCameraFocusRuntime: vi.fn(),
      getGameplayInputRuntime: vi.fn(),
      getNowMs: vi.fn(),
      getSnowstormFogRuntime: vi.fn(),
      getWaterGunRuntime: vi.fn(),
      playSoundEvent: vi.fn()
    };
    const math = {
      clamp01: vi.fn(),
      easeOutCubic: vi.fn(),
      lerp: vi.fn()
    };

    const result = createGameLoopEarlyRuntimeBundle({
      audio: { id: "audio" },
      camera: { id: "camera" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      callbacks,
      math,
      runtimes: {
        freeBlockBuildSessionRuntime: { id: "free-block-session" }
      },
      createConstructionBlockerRuntime,
      createNaturePresentationRuntime,
      createRuntimeCallbacks,
      createSupplyFeedbackRuntime,
      createWorldRuntime
    });

    expect(result).toEqual({
      ...supplyFeedbackRuntimeBundle,
      ...worldRuntimeBundle,
      ...runtimeCallbacks,
      ...naturePresentationRuntimeBundle,
      ...constructionBlockerRuntimeBundle
    });
    expect(createSupplyFeedbackRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          getNowMs: callbacks.getNowMs
        }
      })
    );
    expect(createWorldRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          getLandscapeCutEffectRuntime: expect.any(Function),
          getSnowstormFogRuntime: callbacks.getSnowstormFogRuntime
        },
        runtimes: {
          freeBlockBuildSessionRuntime: { id: "free-block-session" }
        }
      })
    );
    expect(createRuntimeCallbacks).toHaveBeenCalledWith({
      getFoundationBuildZoneCameraFocusRuntime:
        callbacks.getFoundationBuildZoneCameraFocusRuntime,
      getGameplayInputRuntime: callbacks.getGameplayInputRuntime,
      getWaterGunRuntime: callbacks.getWaterGunRuntime,
      getWorldCellPlannerInteractionRuntime: expect.any(Function)
    });
    expect(createNaturePresentationRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        math
      })
    );
    expect(createConstructionBlockerRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          playSoundEvent: callbacks.playSoundEvent
        }
      })
    );

    const worldOptions = createWorldRuntime.mock.calls[0][0];
    expect(worldOptions.callbacks.getLandscapeCutEffectRuntime())
      .toBe(naturePresentationRuntimeBundle.landscapeCutEffectRuntime);
    const runtimeCallbackOptions = createRuntimeCallbacks.mock.calls[0][0];
    expect(runtimeCallbackOptions.getWorldCellPlannerInteractionRuntime())
      .toBe(worldRuntimeBundle.worldCellPlannerInteractionRuntime);
  });
});
