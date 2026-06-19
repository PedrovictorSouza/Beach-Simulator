import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopCompanionMotionRuntimeBundle
} from "../app/runtime/gameLoopCompanionMotion.js";

describe("createGameLoopCompanionMotionRuntimeBundle", () => {
  it("wires companion motion callbacks for the game loop", () => {
    const motionBundle = {
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionFollowDirectionRuntime: { id: "direction" },
      companionFollowMovementRuntime: { id: "movement" },
      companionGroundPatrolFrameRuntime: { id: "patrol" },
      companionIdleMotionRuntime: { id: "idle" }
    };
    const createRuntime = vi.fn(() => motionBundle);
    const companionModelSyncRuntime = {
      syncBulbasaur: vi.fn(),
      syncSquirtle: vi.fn()
    };
    const waterGunRuntime = {
      getQueue: vi.fn(() => ["water-action"])
    };
    const runtimes = {
      companionConstructionBlockerRuntime: { id: "blocker" },
      companionFacingRuntime: { id: "facing" },
      companionModelSyncRuntime
    };

    const result = createGameLoopCompanionMotionRuntimeBundle({
      controls: { id: "controls" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        getWaterGunRuntime: () => waterGunRuntime
      },
      createRuntime
    });

    expect(result).toBe(motionBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" },
      session: { id: "session" },
      runtimes: {
        companionConstructionBlockerRuntime: runtimes.companionConstructionBlockerRuntime,
        companionFacingRuntime: runtimes.companionFacingRuntime
      },
      callbacks: {
        getSquirtleWaterGunQueue: expect.any(Function),
        syncSquirtleModelInstance: expect.any(Function),
        syncBulbasaurModelInstance: expect.any(Function)
      }
    });

    const callbacks = createRuntime.mock.calls[0][0].callbacks;
    expect(callbacks.getSquirtleWaterGunQueue()).toEqual(["water-action"]);
    callbacks.syncSquirtleModelInstance();
    callbacks.syncBulbasaurModelInstance();

    expect(waterGunRuntime.getQueue).toHaveBeenCalledOnce();
    expect(companionModelSyncRuntime.syncSquirtle).toHaveBeenCalledOnce();
    expect(companionModelSyncRuntime.syncBulbasaur).toHaveBeenCalledOnce();
  });
});
