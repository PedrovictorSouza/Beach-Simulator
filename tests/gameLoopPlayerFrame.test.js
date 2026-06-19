import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopPlayerFrameRuntimeBundle
} from "../app/runtime/gameLoopPlayerFrame.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopPlayerFrameRuntimeBundle", () => {
  it("builds the player frame boundary used by the game loop", () => {
    const createdRuntime = { playerMovementFrameRuntime: {} };
    const createRuntime = vi.fn(() => createdRuntime);
    const supplyCounterPromptController = {
      trigger: vi.fn(() => "triggered")
    };
    const runtimes = {
      companionFollowDirectionRuntime: { id: "follow-direction" },
      gearPickupParticleRuntime: { id: "gear" },
      movementQuestRuntime: { id: "movement-quest" },
      runBreadcrumbPromptRuntime: { id: "run-breadcrumb" },
      supplyCounterPromptController,
      woodCollectPopRuntime: { id: "wood-pop" }
    };
    const callbacks = {
      playSoundEvent: vi.fn(),
      pushSupplyResourceCollectFeedback: vi.fn(),
      queueSupplyPickupFlyItems: vi.fn()
    };
    const math = {
      moveValueToward: vi.fn(),
      rotateAngleToward: vi.fn()
    };
    const context = {
      audio: { id: "audio" },
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresetController: { id: "zoom" },
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      session: { id: "session" }
    };

    const runtime = createGameLoopPlayerFrameRuntimeBundle({
      ...context,
      runtimes,
      callbacks,
      math,
      createRuntime
    });

    expect(runtime).toBe(createdRuntime);
    expect(createRuntime).toHaveBeenCalledWith(expect.objectContaining({
      ...context,
      runtimes: {
        companionFollowDirectionRuntime: runtimes.companionFollowDirectionRuntime,
        gearPickupParticleRuntime: runtimes.gearPickupParticleRuntime,
        movementQuestRuntime: runtimes.movementQuestRuntime,
        runBreadcrumbPromptRuntime: runtimes.runBreadcrumbPromptRuntime,
        woodCollectPopRuntime: runtimes.woodCollectPopRuntime
      },
      soundEventIds: SOUND_EVENT_IDS,
      math
    }));

    const options = createRuntime.mock.calls[0][0];
    expect(options.policies.resolvePlayerMovementPermission).toEqual(expect.any(Function));
    expect(options.callbacks.getColonyFeedbackNotice).toEqual(expect.any(Function));
    expect(options.callbacks.playSoundEvent).toBe(callbacks.playSoundEvent);
    expect(options.callbacks.pushSupplyResourceCollectFeedback)
      .toBe(callbacks.pushSupplyResourceCollectFeedback);
    expect(options.callbacks.queueSupplyPickupFlyItems).toBe(callbacks.queueSupplyPickupFlyItems);
    expect(options.callbacks.restoreActiveZoomPresetOnMovement).toEqual(expect.any(Function));
    expect(options.callbacks.triggerSupplyCounterPrompt("wood", { wood: 1 }, 1200))
      .toBe("triggered");
    expect(supplyCounterPromptController.trigger).toHaveBeenCalledWith(
      "wood",
      { wood: 1 },
      1200
    );
  });
});
