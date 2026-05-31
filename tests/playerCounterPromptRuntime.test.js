import { describe, expect, it } from "vitest";

import { createPlayerCounterPromptRuntime } from "../app/runtime/playerCounterPromptRuntime.js";

describe("createPlayerCounterPromptRuntime", () => {
  it("returns triggered prompts until the configured duration expires", () => {
    const runtime = createPlayerCounterPromptRuntime({ durationMs: 1500 });

    runtime.trigger("3 Leaves", 100);

    expect(runtime.get(1599)).toBe("3 Leaves");
    expect(runtime.get(1600)).toBeNull();
    expect(runtime.get(1601)).toBeNull();
  });

  it("ignores empty prompts", () => {
    const runtime = createPlayerCounterPromptRuntime({ durationMs: 1500 });

    runtime.trigger("", 100);

    expect(runtime.get(100)).toBeNull();
  });

  it("formats quest counters with bounded values", () => {
    const runtime = createPlayerCounterPromptRuntime({ durationMs: 1500 });

    runtime.triggerQuestCounter({
      count: 8,
      total: 5,
      label: "trees",
      now: 100
    });

    expect(runtime.get(100)).toBe("5/5 trees");
  });

  it("does not replace the active prompt for an empty quest counter", () => {
    const runtime = createPlayerCounterPromptRuntime({ durationMs: 1500 });

    runtime.trigger("2 Wood", 100);
    runtime.triggerQuestCounter({
      count: 0,
      total: 5,
      label: "trees",
      now: 200
    });

    expect(runtime.get(200)).toBe("2 Wood");
  });
});
