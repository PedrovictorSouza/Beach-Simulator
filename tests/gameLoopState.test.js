import { describe, expect, it } from "vitest";
import { createGameLoopState } from "../app/runtime/gameLoopState.js";

describe("createGameLoopState", () => {
  it("creates an empty frame-loop state after runtime ownership migration", () => {
    expect(createGameLoopState()).toEqual({});
  });
});
