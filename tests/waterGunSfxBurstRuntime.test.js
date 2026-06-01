import { describe, expect, it } from "vitest";

import { createWaterGunSfxBurstRuntime } from "../app/runtime/waterGunSfxBurstRuntime.js";

describe("createWaterGunSfxBurstRuntime", () => {
  it("starts inactive", () => {
    const runtime = createWaterGunSfxBurstRuntime();

    expect(runtime.isActive(0)).toBe(false);
  });

  it("keeps a triggered burst active until its duration expires", () => {
    const runtime = createWaterGunSfxBurstRuntime();

    runtime.trigger(10, 0.82);

    expect(runtime.isActive(10.81)).toBe(true);
    expect(runtime.isActive(10.82)).toBe(false);
  });

  it("does not shorten an active burst when triggered again", () => {
    const runtime = createWaterGunSfxBurstRuntime();

    runtime.trigger(10, 0.82);
    runtime.trigger(10.2, 0.1);

    expect(runtime.isActive(10.81)).toBe(true);
    expect(runtime.isActive(10.82)).toBe(false);
  });

  it("keeps state independent between runtime instances", () => {
    const first = createWaterGunSfxBurstRuntime();
    const second = createWaterGunSfxBurstRuntime();

    first.trigger(10, 0.82);

    expect(first.isActive(10.1)).toBe(true);
    expect(second.isActive(10.1)).toBe(false);
  });
});
