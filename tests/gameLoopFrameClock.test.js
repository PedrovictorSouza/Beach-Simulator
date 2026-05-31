import { describe, expect, it } from "vitest";

import { createGameLoopFrameClock } from "../app/runtime/gameLoopFrameClock.js";

describe("createGameLoopFrameClock", () => {
  it("returns elapsed frame time in seconds", () => {
    const clock = createGameLoopFrameClock({
      now: 1000,
      maxDeltaTime: 0.033
    });

    expect(clock.update(1016)).toEqual({
      rawDeltaTime: 0.016,
      deltaTime: 0.016
    });
  });

  it("clamps simulation delta without changing raw delta", () => {
    const clock = createGameLoopFrameClock({
      now: 1000,
      maxDeltaTime: 0.033
    });

    expect(clock.update(1100)).toEqual({
      rawDeltaTime: 0.1,
      deltaTime: 0.033
    });
  });

  it("never returns a negative delta when time moves backward", () => {
    const clock = createGameLoopFrameClock({
      now: 1000,
      maxDeltaTime: 0.033
    });

    expect(clock.update(900)).toEqual({
      rawDeltaTime: 0,
      deltaTime: 0
    });
  });

  it("uses the latest update as the next previous frame time", () => {
    const clock = createGameLoopFrameClock({
      now: 1000,
      maxDeltaTime: 0.033
    });

    clock.update(1016);

    expect(clock.update(1032)).toEqual({
      rawDeltaTime: 0.016,
      deltaTime: 0.016
    });
  });
});
