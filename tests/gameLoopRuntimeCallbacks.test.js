import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopRuntimeCallbacks
} from "../app/runtime/gameLoopRuntimeCallbacks.js";

function createCallbacks() {
  const foundationBuildZoneCameraFocusRuntime = {
    updateFrame: vi.fn(({ now }) => now > 0)
  };
  const gameplayInputRuntime = {
    getFrame: vi.fn(() => ({
      inputModalityState: { type: "keyboard" }
    }))
  };
  const waterGunRuntime = {
    startNextQueued: vi.fn()
  };
  const worldCellPlannerInteractionRuntime = {
    processClick: vi.fn(() => "processed"),
    getSelectedGroundCell: vi.fn(() => ({ id: "planner-cell" }))
  };

  return {
    callbacks: createGameLoopRuntimeCallbacks({
      getFoundationBuildZoneCameraFocusRuntime: () => foundationBuildZoneCameraFocusRuntime,
      getGameplayInputRuntime: () => gameplayInputRuntime,
      getWaterGunRuntime: () => waterGunRuntime,
      getWorldCellPlannerInteractionRuntime: () => worldCellPlannerInteractionRuntime
    }),
    foundationBuildZoneCameraFocusRuntime,
    gameplayInputRuntime,
    waterGunRuntime,
    worldCellPlannerInteractionRuntime
  };
}

describe("createGameLoopRuntimeCallbacks", () => {
  it("forwards input, camera focus, water-gun queue and planner callbacks", () => {
    const context = createCallbacks();

    expect(context.callbacks.getCurrentInputModalityState()).toEqual({ type: "keyboard" });
    expect(context.callbacks.updateFoundationBuildZoneCameraFocus(1200)).toBe(true);
    expect(context.callbacks.processWorldCellPlannerClick()).toBe("processed");
    expect(context.callbacks.getWorldCellPlannerSelectedGroundCell()).toEqual({
      id: "planner-cell"
    });
    context.callbacks.startNextQueuedSquirtleWaterGunAction();

    expect(context.gameplayInputRuntime.getFrame).toHaveBeenCalledOnce();
    expect(context.foundationBuildZoneCameraFocusRuntime.updateFrame)
      .toHaveBeenCalledWith({ now: 1200 });
    expect(context.worldCellPlannerInteractionRuntime.processClick).toHaveBeenCalledOnce();
    expect(context.worldCellPlannerInteractionRuntime.getSelectedGroundCell)
      .toHaveBeenCalledOnce();
    expect(context.waterGunRuntime.startNextQueued).toHaveBeenCalledOnce();
  });

  it("returns null when the input frame has no modality state", () => {
    const context = createCallbacks();
    context.gameplayInputRuntime.getFrame.mockReturnValue(null);

    expect(context.callbacks.getCurrentInputModalityState()).toBeNull();
  });
});
