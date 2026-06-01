import { describe, expect, it } from "vitest";

import { createRepairBoxMotionRuntime } from "../app/runtime/repairBoxMotionRuntime.js";

function createRuntime() {
  return createRepairBoxMotionRuntime({
    floatHeight: 0.74,
    bobHeight: 0.06,
    bobSpeed: 2.2,
    spinSpeed: Math.PI * 0.826
  });
}

describe("createRepairBoxMotionRuntime", () => {
  it("starts with the existing float height and base yaw", () => {
    const runtime = createRuntime();

    expect(runtime.getFloatOffset([2, 1, 4])).toEqual([2, 1.74, 4]);
    expect(runtime.getYaw(0.5)).toBe(0.5);
  });

  it("advances bob and spin with accumulated delta time", () => {
    const runtime = createRuntime();

    runtime.update(0.25);
    runtime.update(0.5);

    expect(runtime.getFloatOffset([2, 1, 4])).toEqual([
      2,
      1 + 0.74 + Math.sin(0.75 * 2.2) * 0.06,
      4
    ]);
    expect(runtime.getYaw(0.5)).toBe(0.5 + 0.75 * Math.PI * 0.826);
  });

  it("keeps elapsed state independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();

    first.update(1);

    expect(first.getYaw(0)).not.toBe(0);
    expect(second.getYaw(0)).toBe(0);
  });
});
