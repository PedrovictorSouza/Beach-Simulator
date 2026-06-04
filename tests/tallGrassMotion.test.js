import { describe, expect, it } from "vitest";

import {
  getTallGrassInstanceScale,
  getTallGrassSway,
  getTallGrassYaw,
  TALL_GRASS_MIN_FOOTPRINT
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

  it("keeps revival scale when the model has no usable footprint", () => {
    expect(getTallGrassInstanceScale(
      null,
      { size: [1.6, 1.6] },
      0.75
    )).toBe(0.75);
    expect(getTallGrassInstanceScale(
      { size: [0, 1, 0] },
      { size: [1.6, 1.6] },
      0.75
    )).toBe(0.75);
  });

  it("scales the instance from target footprint and model footprint", () => {
    expect(getTallGrassInstanceScale(
      { size: [2, 1, 1] },
      { size: [1.5, 1.5] },
      0.8
    )).toBeCloseTo(0.6);
  });

  it("uses the minimum footprint when the patch is smaller", () => {
    expect(getTallGrassInstanceScale(
      { size: [2, 1, 1] },
      { size: [0.5, 0.5] },
      1
    )).toBeCloseTo(TALL_GRASS_MIN_FOOTPRINT / 2);
  });
});
