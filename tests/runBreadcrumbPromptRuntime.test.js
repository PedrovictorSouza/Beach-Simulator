import { describe, expect, it } from "vitest";

import { createRunBreadcrumbPromptRuntime } from "../app/runtime/runBreadcrumbPromptRuntime.js";

function createRuntime() {
  return createRunBreadcrumbPromptRuntime({
    durationMs: 100
  });
}

describe("createRunBreadcrumbPromptRuntime", () => {
  it("starts hidden and stays visible until the configured duration expires", () => {
    const runtime = createRuntime();

    expect(runtime.isVisible(10)).toBe(false);
    expect(runtime.trigger(10)).toBe(true);
    expect(runtime.isVisible(109)).toBe(true);
    expect(runtime.isVisible(110)).toBe(false);
  });

  it("does not show the breadcrumb again after its first trigger", () => {
    const runtime = createRuntime();

    runtime.trigger(10);
    expect(runtime.isVisible(110)).toBe(false);

    expect(runtime.trigger(200)).toBe(false);
    expect(runtime.isVisible(200)).toBe(false);
  });

  it("keeps state independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.trigger(10);

    expect(first.isVisible(20)).toBe(true);
    expect(second.isVisible(20)).toBe(false);
    expect(second.trigger(20)).toBe(true);
  });
});
