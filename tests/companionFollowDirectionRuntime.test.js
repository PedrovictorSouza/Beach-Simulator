import { describe, expect, it } from "vitest";

import { createCompanionFollowDirectionRuntime } from "../app/runtime/companions/companionFollowDirectionRuntime.js";

describe("createCompanionFollowDirectionRuntime", () => {
  it("ignores movement at or below the existing threshold", () => {
    const runtime = createCompanionFollowDirectionRuntime();

    expect(runtime.update(0.0003, 0.0004)).toBe(false);
    expect(runtime.get()).toEqual([0, -1]);
  });

  it("stores normalized movement direction", () => {
    const runtime = createCompanionFollowDirectionRuntime();

    expect(runtime.update(3, 4)).toBe(true);
    expect(runtime.get()).toEqual([0.6, 0.8]);
  });

  it("falls back to player yaw before movement has established a direction", () => {
    const runtime = createCompanionFollowDirectionRuntime();

    expect(runtime.get(Math.PI / 2)).toEqual([
      expect.closeTo(0),
      expect.closeTo(1)
    ]);
  });

  it("uses the existing default direction when player yaw is unavailable", () => {
    const runtime = createCompanionFollowDirectionRuntime();

    expect(runtime.get()).toEqual([0, -1]);
  });

  it("keeps state independent between runtime instances", () => {
    const first = createCompanionFollowDirectionRuntime();
    const second = createCompanionFollowDirectionRuntime();

    first.update(1, 0);

    expect(first.get()).toEqual([1, 0]);
    expect(second.get()).toEqual([0, -1]);
  });
});
