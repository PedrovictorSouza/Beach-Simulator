import { describe, expect, it } from "vitest";

import {
  getLogicalFacingYaw,
  getModelYawToward,
  getYawToward
} from "../app/runtime/modelFacing.js";

describe("model facing", () => {
  it("resolves yaw toward another world position on the ground plane", () => {
    expect(getYawToward([0, 0, 0], [1, 0, 0])).toBeCloseTo(Math.PI * 0.5);
    expect(getYawToward([0, 0, 0], [0, 0, 1])).toBeCloseTo(0);
    expect(getYawToward([0, 0, 0], [-1, 0, 0])).toBeCloseTo(-Math.PI * 0.5);
  });

  it("adds the model face yaw offset without changing the logical direction", () => {
    expect(getModelYawToward([0, 0, 0], [0, 0, 1], Math.PI)).toBeCloseTo(Math.PI);
    expect(getModelYawToward([0, 0, 0], [1, 0, 0], 0.25)).toBeCloseTo(Math.PI * 0.5 + 0.25);
  });

  it("resolves logical facing yaw from visual model yaw and offset", () => {
    expect(getLogicalFacingYaw(Math.PI + 0.25, 0.25)).toBeCloseTo(Math.PI);
    expect(getLogicalFacingYaw(undefined, Math.PI)).toBeCloseTo(-Math.PI);
  });
});
