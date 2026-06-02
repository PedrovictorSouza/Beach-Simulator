import { describe, expect, it } from "vitest";

import { createWorldCellPlannerClickRuntime } from "../app/runtime/worldCellPlannerClickRuntime.js";

describe("createWorldCellPlannerClickRuntime", () => {
  it("starts without a pending click", () => {
    const runtime = createWorldCellPlannerClickRuntime();

    expect(runtime.consume()).toBe(null);
  });

  it("returns a queued click once", () => {
    const runtime = createWorldCellPlannerClickRuntime();

    runtime.queue({ clientX: 12, clientY: 34 });

    expect(runtime.consume()).toEqual({ clientX: 12, clientY: 34 });
    expect(runtime.consume()).toBe(null);
  });

  it("keeps only the latest queued click", () => {
    const runtime = createWorldCellPlannerClickRuntime();

    runtime.queue({ clientX: 12, clientY: 34 });
    runtime.queue({ clientX: 56, clientY: 78 });

    expect(runtime.consume()).toEqual({ clientX: 56, clientY: 78 });
  });

  it("keeps state independent between runtime instances", () => {
    const first = createWorldCellPlannerClickRuntime();
    const second = createWorldCellPlannerClickRuntime();

    first.queue({ clientX: 12, clientY: 34 });

    expect(first.consume()).toEqual({ clientX: 12, clientY: 34 });
    expect(second.consume()).toBe(null);
  });
});
