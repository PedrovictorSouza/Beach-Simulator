import { describe, expect, it } from "vitest";

import { createFieldMoveInvalidTargetPromptRuntime } from "../app/runtime/fieldMoveInvalidTargetPromptRuntime.js";

function createRuntime() {
  return createFieldMoveInvalidTargetPromptRuntime({
    leafageDurationMs: 1600,
    fireDurationMs: 1600
  });
}

describe("createFieldMoveInvalidTargetPromptRuntime", () => {
  it("starts with both prompts hidden", () => {
    const runtime = createRuntime();

    expect(runtime.isLeafageVisible(0)).toBe(false);
    expect(runtime.isFireVisible(0)).toBe(false);
  });

  it("shows and expires the Leafage prompt", () => {
    const runtime = createRuntime();

    runtime.triggerLeafage(1000);

    expect(runtime.isLeafageVisible(2599)).toBe(true);
    expect(runtime.isLeafageVisible(2600)).toBe(false);
  });

  it("shows and resets the Fire prompt independently", () => {
    const runtime = createRuntime();

    runtime.triggerLeafage(1000);
    runtime.triggerFire(1200);
    runtime.resetFire();

    expect(runtime.isLeafageVisible(1300)).toBe(true);
    expect(runtime.isFireVisible(1300)).toBe(false);
  });

  it("keeps state independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.triggerLeafage(1000);

    expect(first.isLeafageVisible(1001)).toBe(true);
    expect(second.isLeafageVisible(1001)).toBe(false);
  });
});
