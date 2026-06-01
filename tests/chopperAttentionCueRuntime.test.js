import { describe, expect, it } from "vitest";

import { createChopperAttentionCueRuntime } from "../app/runtime/chopperAttentionCueRuntime.js";

function createRuntime() {
  return createChopperAttentionCueRuntime({
    initialDelayMs: 100,
    repeatMs: 300,
    durationMs: 80
  });
}

describe("createChopperAttentionCueRuntime", () => {
  it("waits for the initial delay, then exposes the cue until it expires", () => {
    const runtime = createRuntime();
    const cue = {
      text: "Hey!",
      worldPosition: [1, 0, 2]
    };

    expect(runtime.get(cue, 10)).toBeNull();
    expect(runtime.get(cue, 109)).toBeNull();
    expect(runtime.get(cue, 110)).toEqual({
      ...cue,
      cycleId: 1
    });
    expect(runtime.get(cue, 189)).toEqual({
      ...cue,
      cycleId: 1
    });
    expect(runtime.get(cue, 190)).toBeNull();
  });

  it("uses the latest cue position while a cycle remains active", () => {
    const runtime = createRuntime();
    const cue = {
      text: "Hey!",
      worldPosition: [1, 0, 2]
    };

    runtime.get(cue, 10);
    runtime.get(cue, 110);

    expect(runtime.get({
      ...cue,
      worldPosition: [4, 0, 5]
    }, 120)).toEqual({
      text: "Hey!",
      worldPosition: [4, 0, 5],
      cycleId: 1
    });
  });

  it("resets its schedule when the cue disappears without reusing a cycle id", () => {
    const runtime = createRuntime();
    const cue = {
      text: "Hey!",
      worldPosition: [1, 0, 2]
    };

    runtime.get(cue, 10);
    runtime.get(cue, 110);
    expect(runtime.get(null, 120)).toBeNull();

    expect(runtime.get(cue, 200)).toBeNull();
    expect(runtime.get(cue, 299)).toBeNull();
    expect(runtime.get(cue, 300)).toEqual({
      ...cue,
      cycleId: 2
    });
  });

  it("repeats the cue on the configured schedule", () => {
    const runtime = createRuntime();
    const cue = {
      text: "Hey!",
      worldPosition: [1, 0, 2]
    };

    runtime.get(cue, 10);
    runtime.get(cue, 110);

    expect(runtime.get(cue, 409)).toBeNull();
    expect(runtime.get(cue, 410)).toEqual({
      ...cue,
      cycleId: 2
    });
  });
});
