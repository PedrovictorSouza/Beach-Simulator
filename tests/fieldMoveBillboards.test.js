import { describe, expect, it } from "vitest";

import {
  SQUIRTLE_WATER_GUN_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_WIDTH
} from "../app/runtime/fieldMoveRuntime/fieldMoveTuning.js";
import {
  getSquirtleWaterGunBillboards
} from "../app/runtime/fieldMoveRuntime/fieldMoveBillboards.js";

describe("field move billboards", () => {
  const uvRect = [0, 0, 1, 1];

  it("builds Water Gun stream billboards from action timing and mouth position", () => {
    const [first, ...rest] = getSquirtleWaterGunBillboards({
      action: {
        phase: "spray",
        sprayElapsed: 0,
        sprayDuration: 1,
        impactTime: 999,
        targetPosition: [0, 0, 2]
      },
      texture: "water",
      uvRect,
      getMouthPosition: () => [0, 0.66, 0]
    });
    const lane = (0 % SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT) -
      (SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT - 1) * 0.5;
    const laneOffset = lane * SQUIRTLE_WATER_GUN_STREAM_WIDTH;

    expect(rest).toHaveLength(SQUIRTLE_WATER_GUN_PARTICLE_COUNT - 1);
    expect(first).toEqual({
      texture: "water",
      position: [-laneOffset, 0.66, 0],
      size: [0.14 * 1.08, 0.14 * 0.96],
      uvRect
    });
  });

  it("adds Water Gun splash billboards after impact time", () => {
    const billboards = getSquirtleWaterGunBillboards({
      action: {
        phase: "spray",
        sprayElapsed: 1,
        sprayDuration: 1,
        impactTime: 1,
        targetPosition: [0, 0, 2]
      },
      texture: "water",
      uvRect,
      getMouthPosition: () => [0, 0.66, 0]
    });

    expect(billboards).toHaveLength(
      SQUIRTLE_WATER_GUN_PARTICLE_COUNT + SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT
    );
  });

  it("returns no Water Gun billboards when inactive or missing texture", () => {
    expect(getSquirtleWaterGunBillboards({
      action: null,
      texture: "water",
      uvRect,
      getMouthPosition: () => [0, 0.66, 0]
    })).toEqual([]);
    expect(getSquirtleWaterGunBillboards({
      action: {
        phase: "spray",
        sprayElapsed: 0,
        targetPosition: [0, 0, 2]
      },
      texture: null,
      uvRect,
      getMouthPosition: () => [0, 0.66, 0]
    })).toEqual([]);
  });
});
