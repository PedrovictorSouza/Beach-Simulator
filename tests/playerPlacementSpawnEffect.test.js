import { describe, expect, it } from "vitest";

import {
  advancePlayerPlacementSpawnEffect,
  applyPlayerPlacementSpawnToBillboard,
  applyPlayerPlacementSpawnToModelInstance,
  updateSolarStationSpawnEffect
} from "../app/runtime/construction/playerPlacementSpawnEffect.js";

describe("player placement spawn effect", () => {
  it("advances placement spawn pose and clears the effect when complete", () => {
    const placement = {
      spawnEffect: {
        elapsed: 0,
        duration: 1,
        fromScale: 0.2,
        toScale: 1,
        fromYOffset: 0.5,
        toYOffset: 0,
        fromAlpha: 0.1,
        toAlpha: 1
      }
    };

    expect(advancePlayerPlacementSpawnEffect(placement, 0.5)).toEqual({
      progress: 0.875,
      scale: 0.9000000000000001,
      yOffset: 0.0625,
      alpha: 0.8875
    });
    expect(placement.spawnEffect).not.toBeNull();

    expect(advancePlayerPlacementSpawnEffect(placement, 0.5)).toEqual({
      progress: 1,
      scale: 1,
      yOffset: 0,
      alpha: 1
    });
    expect(placement.spawnEffect).toBeNull();
  });

  it("applies placement spawn pose to billboards without mutating the source billboard", () => {
    const placement = {
      spawnEffect: {
        elapsed: 0,
        duration: 1,
        fromScale: 0.5,
        toScale: 1,
        fromYOffset: 0.4,
        toYOffset: 0,
        fromAlpha: 0.5,
        toAlpha: 1
      }
    };
    const billboard = {
      position: [1, 2, 3],
      size: [2, 4],
      alpha: 0.8
    };

    expect(applyPlayerPlacementSpawnToBillboard(placement, billboard, 0.5)).toEqual({
      position: [1, 2.05, 3],
      size: [1.875, 3.75],
      alpha: 0.75
    });
    expect(billboard.position).toEqual([1, 2, 3]);
  });

  it("applies placement spawn pose to model instances", () => {
    const placement = {
      spawnEffect: {
        elapsed: 0,
        duration: 1,
        fromScale: 0.5,
        toScale: 1,
        fromYOffset: 0.4,
        toYOffset: 0,
        fromAlpha: 0.5,
        toAlpha: 1
      }
    };
    const instance = {
      offset: [1, 0.02, 3],
      scale: 2
    };

    expect(applyPlayerPlacementSpawnToModelInstance(placement, instance, {
      baseScale: 2,
      groundY: 0.1,
      deltaTime: 0.5
    })).toBe(true);
    expect(instance.offset[0]).toBe(1);
    expect(instance.offset[1]).toBeCloseTo(0.15);
    expect(instance.offset[2]).toBe(3);
    expect(instance.scale).toBeCloseTo(1.875);
    expect(instance.alpha).toBeCloseTo(0.9375);
    expect(instance.tint).toEqual([1, 1.14, 0.72]);
    expect(instance.tintStrength).toBeCloseTo(0.0425);
  });

  it("updates and clears the solar station spawn effect", () => {
    const instance = {
      active: true,
      offset: [1, 0.02, 3],
      scale: 0.2,
      alpha: 0.1,
      solarStationSpawnEffect: {
        elapsed: 0,
        duration: 1,
        fromScale: 0.2,
        toScale: 1,
        fromYOffset: 0.4,
        toYOffset: 0,
        fromAlpha: 0.1,
        toAlpha: 1,
        groundY: 0.02
      }
    };

    updateSolarStationSpawnEffect(instance, 1);

    expect(instance.scale).toBe(1);
    expect(instance.alpha).toBe(1);
    expect(instance.offset).toEqual([1, 0.02, 3]);
    expect(instance.tint).toEqual([1, 1.14, 0.72]);
    expect(instance.tintStrength).toBe(0);
    expect(instance.solarStationSpawnEffect).toBeNull();
  });
});
