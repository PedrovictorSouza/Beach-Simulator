import { describe, expect, it } from "vitest";
import { createGameLoopState } from "../app/runtime/gameLoopState.js";

describe("createGameLoopState", () => {
  it("initializes the frame-loop state contract", () => {
    const state = createGameLoopState();

    expect(state).toMatchObject({
      foundationBuildZoneCameraFocus: null
    });
  });
});
