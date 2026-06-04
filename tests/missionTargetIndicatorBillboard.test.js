import { describe, expect, it } from "vitest";

import { createMissionTargetIndicatorBillboard } from "../app/runtime/missionTargetIndicatorBillboard.js";

describe("mission target indicator billboard", () => {
  it("creates a mission target indicator billboard from texture and target position", () => {
    const texture = { id: "mission-target" };
    const uvRect = [0, 0, 1, 1];
    const billboard = createMissionTargetIndicatorBillboard({
      texture,
      targetPosition: [4, 0.02, -3],
      now: 250,
      uvRect
    });

    expect(billboard.texture).toBe(texture);
    expect(billboard.uvRect).toBe(uvRect);
    expect(billboard.position[2]).toBe(-3);
    expect(billboard.position[1]).toBeGreaterThan(2.2);
    expect(billboard.size[1]).toBe(0.82);
    expect(billboard.size[0]).toBeGreaterThan(0);
    expect(billboard.alpha).toBeGreaterThanOrEqual(0.72);
    expect(billboard.alpha).toBeLessThanOrEqual(0.94);
    expect(typeof billboard.rotation).toBe("number");
  });

  it("skips missing texture or invalid target position", () => {
    expect(createMissionTargetIndicatorBillboard({
      texture: null,
      targetPosition: [0, 0, 0]
    })).toBeNull();
    expect(createMissionTargetIndicatorBillboard({
      texture: { id: "mission-target" },
      targetPosition: null
    })).toBeNull();
  });
});
