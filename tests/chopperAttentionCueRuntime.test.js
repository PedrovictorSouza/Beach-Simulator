import { describe, expect, it } from "vitest";

import {
  createChopperAttentionCueRuntime,
  resolveChopperAttentionCue
} from "../app/runtime/companions/chopperAttentionCueRuntime.js";

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

  it("consumes each sound cycle once without dispatching audio itself", () => {
    const runtime = createRuntime();

    expect(runtime.consumeSoundCycle(1)).toBe(true);
    expect(runtime.consumeSoundCycle(1)).toBe(false);
    expect(runtime.consumeSoundCycle(2)).toBe(true);
    expect(runtime.consumeSoundCycle(2)).toBe(false);
  });
});

describe("resolveChopperAttentionCue", () => {
  const chopperPosition = [1, 0, 2];

  it("returns a cue when the wake-guide task is active and Chopper is not near the player", () => {
    expect(resolveChopperAttentionCue({
      activeTaskId: "wake-guide",
      chopperPosition,
      isPlayerNearWorldPosition: () => false,
      text: "Hey!"
    })).toEqual({
      text: "Hey!",
      worldPosition: chopperPosition
    });
  });

  it("uses the active system quest when there is no active task", () => {
    expect(resolveChopperAttentionCue({
      activeSystemQuestId: "wake-guide",
      chopperPosition,
      isPlayerNearWorldPosition: () => false,
      text: "Hey!"
    })).toEqual({
      text: "Hey!",
      worldPosition: chopperPosition
    });
  });

  it("returns no cue outside wake-guide, without a position, or near the player", () => {
    expect(resolveChopperAttentionCue({
      activeTaskId: "other-task",
      chopperPosition,
      isPlayerNearWorldPosition: () => false,
      text: "Hey!"
    })).toBeNull();
    expect(resolveChopperAttentionCue({
      activeTaskId: "wake-guide",
      chopperPosition: null,
      isPlayerNearWorldPosition: () => false,
      text: "Hey!"
    })).toBeNull();
    expect(resolveChopperAttentionCue({
      activeTaskId: "wake-guide",
      chopperPosition,
      isPlayerNearWorldPosition: () => true,
      text: "Hey!"
    })).toBeNull();
  });
});
