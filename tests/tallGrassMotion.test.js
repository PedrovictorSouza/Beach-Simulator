import { describe, expect, it } from "vitest";

import {
  getTallGrassSway,
  getTallGrassYaw
} from "../app/runtime/tallGrassMotion.js";

describe("tall grass motion", () => {
  it("calculates deterministic yaw from the patch identity", () => {
    const patch = {
      cellId: "cell-1",
      id: "grass-1"
    };

    expect(getTallGrassYaw(patch)).toBeCloseTo(3.036593);
    expect(getTallGrassYaw(patch)).toBe(getTallGrassYaw(patch));
    expect(getTallGrassYaw({
      cellId: "cell-2",
      id: "grass-1"
    })).not.toBe(getTallGrassYaw(patch));
  });

  it("keeps a stable fallback yaw without patch identity", () => {
    expect(getTallGrassYaw(null)).toBeCloseTo(Math.PI);
    expect(getTallGrassYaw({})).toBeCloseTo(Math.PI);
  });

  it("calculates ambient sway from time and patch position", () => {
    expect(getTallGrassSway(
      { position: [1, 0, 2] },
      false,
      500
    )).toBeCloseTo(0.012807);
  });

  it("adds rustle sway when the rustling encounter is active", () => {
    const patch = { position: [1, 0, 2] };
    const ambient = getTallGrassSway(patch, false, 500);
    const rustling = getTallGrassSway(patch, true, 500);

    expect(rustling).toBeCloseTo(ambient - 0.048292);
  });
});
