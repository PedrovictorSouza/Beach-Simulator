import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getRuntimeNowMs,
  getRuntimeNowSeconds
} from "../app/runtime/runtimeNow.js";

describe("runtime now helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses performance.now when it is available", () => {
    vi.stubGlobal("performance", {
      now: vi.fn(() => 1234)
    });

    expect(getRuntimeNowMs()).toBe(1234);
    expect(getRuntimeNowSeconds()).toBe(1.234);
  });

  it("falls back to Date.now when performance.now is unavailable", () => {
    vi.stubGlobal("performance", undefined);
    vi.spyOn(Date, "now").mockReturnValue(5000);

    expect(getRuntimeNowMs()).toBe(5000);
    expect(getRuntimeNowSeconds()).toBe(5);
  });
});
