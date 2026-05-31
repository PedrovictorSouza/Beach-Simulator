import { describe, expect, it } from "vitest";

import { createCompanionLostHintRuntime } from "../app/runtime/companionLostHintRuntime.js";

function createRuntime() {
  return createCompanionLostHintRuntime({
    initialDelayMs: 100,
    repeatMs: 300,
    durationMs: 80
  });
}

describe("createCompanionLostHintRuntime", () => {
  it("waits for the initial delay, then exposes the hint until it expires", () => {
    const runtime = createRuntime();
    const hint = {
      key: "squirtle-use-water-gun",
      text: "Use Water Gun",
      worldPosition: [1, 0, 2]
    };

    expect(runtime.get(hint, 10)).toBeNull();
    expect(runtime.get(hint, 109)).toBeNull();
    expect(runtime.get(hint, 110)).toEqual(hint);
    expect(runtime.get(hint, 189)).toEqual(hint);
    expect(runtime.get(hint, 190)).toBeNull();
  });

  it("uses the latest world position while an active hint remains visible", () => {
    const runtime = createRuntime();
    const firstHint = {
      key: "squirtle-use-water-gun",
      text: "Use Water Gun",
      worldPosition: [1, 0, 2]
    };
    const movedHint = {
      ...firstHint,
      worldPosition: [4, 0, 5]
    };

    runtime.get(firstHint, 10);
    runtime.get(firstHint, 110);

    expect(runtime.get(movedHint, 120)).toEqual(movedHint);
  });

  it("resets the initial delay when the hint key changes or disappears", () => {
    const runtime = createRuntime();
    const squirtleHint = {
      key: "squirtle-use-water-gun",
      text: "Use Water Gun",
      worldPosition: [1, 0, 2]
    };
    const bulbasaurHint = {
      key: "bulbasaur-switch-to-squirtle",
      text: "Switch companion",
      worldPosition: [3, 0, 4]
    };

    runtime.get(squirtleHint, 10);
    expect(runtime.get(bulbasaurHint, 110)).toBeNull();
    expect(runtime.get(bulbasaurHint, 209)).toBeNull();
    expect(runtime.get(bulbasaurHint, 210)).toEqual(bulbasaurHint);

    expect(runtime.get(null, 220)).toBeNull();
    expect(runtime.get(bulbasaurHint, 300)).toBeNull();
    expect(runtime.get(bulbasaurHint, 399)).toBeNull();
    expect(runtime.get(bulbasaurHint, 400)).toEqual(bulbasaurHint);
  });

  it("repeats the hint on the configured schedule", () => {
    const runtime = createRuntime();
    const hint = {
      key: "squirtle-use-water-gun",
      text: "Use Water Gun",
      worldPosition: [1, 0, 2]
    };

    runtime.get(hint, 10);
    runtime.get(hint, 110);

    expect(runtime.get(hint, 409)).toBeNull();
    expect(runtime.get(hint, 410)).toEqual(hint);
  });
});
