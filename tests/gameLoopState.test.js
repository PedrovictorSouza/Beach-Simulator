import { describe, expect, it } from "vitest";
import { createGameLoopState } from "../app/runtime/gameLoopState.js";

describe("createGameLoopState", () => {
  it("initializes the frame-loop state contract", () => {
    const state = createGameLoopState();

    expect(state).toMatchObject({
      foundationBuildZoneCameraFocus: null
    });
  });

  it("does not share mutable arrays between instances", () => {
    const first = createGameLoopState();
    const second = createGameLoopState();

    first.woodCollectPopEffects.push({ id: "wood-1" });
    first.gearPickupParticleEffects.push({ id: "gear-1" });

    expect(second.woodCollectPopEffects).toEqual([]);
    expect(second.gearPickupParticleEffects).toEqual([]);
  });
});
