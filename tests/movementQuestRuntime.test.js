import { describe, expect, it, vi } from "vitest";

import { createMovementQuestRuntime } from "../app/runtime/movementQuestRuntime.js";

function createRuntime() {
  return createMovementQuestRuntime({
    minimumMovementDistance: 0.0005,
    reportDistance: 0.04
  });
}

describe("createMovementQuestRuntime", () => {
  it("does not accumulate movement while the quest is inactive", () => {
    const reportMovement = vi.fn();
    const runtime = createRuntime();

    runtime.update({ active: false, movedDistance: 0.05, reportMovement });
    runtime.update({ active: true, movedDistance: 0.001, reportMovement });

    expect(reportMovement).not.toHaveBeenCalled();
  });

  it("ignores movement at or below the existing minimum distance", () => {
    const reportMovement = vi.fn();
    const runtime = createRuntime();

    runtime.update({ active: true, movedDistance: 0.0005, reportMovement });
    runtime.update({ active: true, movedDistance: 0.0396, reportMovement });

    expect(reportMovement).not.toHaveBeenCalled();
  });

  it("reports movement after the accumulated distance reaches the threshold", () => {
    const reportMovement = vi.fn(() => ({ changed: true, completedQuestIds: [] }));
    const runtime = createRuntime();

    runtime.update({ active: true, movedDistance: 0.02, reportMovement });

    expect(runtime.update({ active: true, movedDistance: 0.02, reportMovement })).toBe(true);
    expect(reportMovement).toHaveBeenCalledTimes(1);
  });

  it("retries reporting until the callback acknowledges progress", () => {
    const reportMovement = vi
      .fn()
      .mockReturnValueOnce({ changed: false, completedQuestIds: [] })
      .mockReturnValueOnce({ changed: false, completedQuestIds: ["learn-to-move"] });
    const runtime = createRuntime();

    expect(runtime.update({ active: true, movedDistance: 0.04, reportMovement })).toBe(false);
    expect(runtime.update({ active: true, movedDistance: 0.001, reportMovement })).toBe(true);
    runtime.update({ active: true, movedDistance: 0.001, reportMovement });

    expect(reportMovement).toHaveBeenCalledTimes(2);
  });

  it("keeps state independent between runtime instances", () => {
    const reportMovement = vi.fn(() => ({ changed: true, completedQuestIds: [] }));
    const first = createRuntime();
    const second = createRuntime();

    first.update({ active: true, movedDistance: 0.04, reportMovement });
    second.update({ active: true, movedDistance: 0.001, reportMovement });

    expect(reportMovement).toHaveBeenCalledTimes(1);
  });
});
