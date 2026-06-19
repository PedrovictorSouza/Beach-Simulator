import { describe, expect, it } from "vitest";

import {
  clamp01,
  easeOutCubic,
  getShortestAngleDelta,
  lerp,
  moveValueToward,
  rotateAngleToward
} from "../app/runtime/gameLoopMath.js";

describe("game loop math helpers", () => {
  it("clamps normalized values", () => {
    expect(clamp01(-0.25)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(1.25)).toBe(1);
  });

  it("eases cubic progress after clamping input", () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  });

  it("interpolates between scalar values", () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it("moves scalar and angular values toward their targets", () => {
    expect(moveValueToward(2, 5, 1.5)).toBe(3.5);
    expect(moveValueToward(2, 2.5, 1.5)).toBe(2.5);
    expect(getShortestAngleDelta(0, Math.PI * 1.5)).toBeCloseTo(-Math.PI / 2);
    expect(rotateAngleToward(0, Math.PI, 0.25)).toBe(0.25);
    expect(rotateAngleToward(0, 0.2, 0.25)).toBe(0.2);
  });
});
