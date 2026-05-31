import { describe, expect, it } from "vitest";
import { createGameLoopState } from "../app/runtime/gameLoopState.js";

describe("createGameLoopState", () => {
  it("initializes the frame-loop state contract", () => {
    const state = createGameLoopState({ now: 123 });

    expect(state).toMatchObject({
      previousTime: 123,
      movementQuestReported: false,
      movementQuestDistance: 0,
      pendingWorldCellPlannerClick: null,
      foundationBuildZoneCameraFocus: null,
      repairBoxElapsed: 0,
      waterGunSfxBurstUntilSeconds: 0,
      companionFollowDirection: null
    });
  });

  it("does not share mutable arrays between instances", () => {
    const first = createGameLoopState({ now: 123 });
    const second = createGameLoopState({ now: 456 });

    first.woodCollectPopEffects.push({ id: "wood-1" });
    first.gearPickupParticleEffects.push({ id: "gear-1" });

    expect(second.previousTime).toBe(456);
    expect(second.woodCollectPopEffects).toEqual([]);
    expect(second.gearPickupParticleEffects).toEqual([]);
  });
});
