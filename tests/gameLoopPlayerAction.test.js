import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopPlayerActionRuntimeBundle
} from "../app/runtime/gameLoopPlayerAction.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopPlayerActionRuntimeBundle", () => {
  it("builds the player action boundary used by the game loop", () => {
    const createdRuntime = { playerActionRuntime: {} };
    const createRuntime = vi.fn(() => createdRuntime);
    const callbacks = {
      debugInteractionFlow: vi.fn(),
      getNowMs: vi.fn(() => 1000),
      getNowSeconds: vi.fn(() => 1),
      isBusyCompanionTarget: vi.fn(() => false),
      onNpcInteractionStart: vi.fn(),
      playSoundEvent: vi.fn(),
      playTreeBirthSfx: vi.fn(),
      queueChangedSupplyPickupFlyItems: vi.fn(),
      queueLandscapeCutEffect: vi.fn(),
      queueTreeRevivalLeafBurst: vi.fn()
    };
    const runtimes = {
      buildBlockRuntime: { id: "build" },
      waterGunRuntime: { id: "water" }
    };
    const controls = { id: "controls" };
    const session = { id: "session" };
    const gameplay = { id: "gameplay" };
    const hud = { id: "hud" };

    const runtime = createGameLoopPlayerActionRuntimeBundle({
      controls,
      session,
      gameplay,
      hud,
      runtimes,
      callbacks,
      config: {
        restoredGrassMissionTargetCount: 3,
        waterGunFirstUsePromptFlag: "waterFlag"
      },
      createRuntime
    });

    expect(runtime).toBe(createdRuntime);
    expect(createRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls,
      session,
      gameplay,
      hud,
      runtimes,
      soundEventIds: SOUND_EVENT_IDS,
      config: expect.objectContaining({
        leafDenBusyNotice: "im busy, boss...",
        restoredGrassMissionTargetCount: 3,
        waterGunFirstUsePromptFlag: "waterFlag"
      })
    }));

    const options = createRuntime.mock.calls[0][0];
    expect(options.callbacks.debugInteractionFlow).toBe(callbacks.debugInteractionFlow);
    expect(options.callbacks.getNowMs).toBe(callbacks.getNowMs);
    expect(options.callbacks.getNowSeconds).toBe(callbacks.getNowSeconds);
    expect(options.callbacks.isBusyCompanionTarget).toBe(callbacks.isBusyCompanionTarget);
    expect(options.callbacks.onNpcInteractionStart).toBe(callbacks.onNpcInteractionStart);
    expect(options.callbacks.playSoundEvent).toBe(callbacks.playSoundEvent);
    expect(options.callbacks.playTreeBirthSfx).toBe(callbacks.playTreeBirthSfx);
    expect(options.callbacks.queueChangedSupplyPickupFlyItems)
      .toBe(callbacks.queueChangedSupplyPickupFlyItems);
    expect(options.callbacks.queueLandscapeCutEffect)
      .toBe(callbacks.queueLandscapeCutEffect);
    expect(options.callbacks.queueTreeRevivalLeafBurst)
      .toBe(callbacks.queueTreeRevivalLeafBurst);
    expect(options.callbacks.findAlreadyResolvedFieldMoveGroundCell)
      .toEqual(expect.any(Function));
    expect(options.callbacks.findNearbyDestroyableInstantiatedObject)
      .toEqual(expect.any(Function));
    expect(options.callbacks.getFreeBlockInvalidPlacementNotice)
      .toEqual(expect.any(Function));
    expect(options.callbacks.resolveGameplayActionPermission)
      .toEqual(expect.any(Function));
  });
});
