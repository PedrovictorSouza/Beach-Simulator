import { describe, expect, it } from "vitest";

import {
  BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT,
  BULBASAUR_LEAFAGE_IMPACT_TIME,
  BULBASAUR_LEAFAGE_PARTICLE_COUNT,
  CHARMANDER_FIRE_BURST_PARTICLE_COUNT,
  CHARMANDER_FIRE_IMPACT_TIME,
  CHARMANDER_FIRE_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_WIDTH
} from "../app/runtime/fieldMoveRuntime/fieldMoveTuning.js";
import {
  getBulbasaurLeafageBillboards,
  getCharmanderFireBillboards,
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

  it("builds Charmander Fire spray billboards before impact", () => {
    const [first, ...rest] = getCharmanderFireBillboards({
      action: {
        phase: "spray",
        sprayElapsed: CHARMANDER_FIRE_IMPACT_TIME - 0.01,
        targetPosition: [0, 0, 2]
      },
      texture: "fire",
      uvRect,
      getMouthPosition: () => [0, 0.58, 0]
    });

    expect(rest).toHaveLength(CHARMANDER_FIRE_PARTICLE_COUNT - 1);
    expect(first.texture).toBe("fire");
    expect(first.position).toHaveLength(3);
    expect(first.size).toHaveLength(2);
    expect(Number.isFinite(first.alpha)).toBe(true);
    expect(Number.isFinite(first.rotation)).toBe(true);
    expect(first.uvRect).toBe(uvRect);
  });

  it("adds Charmander Fire burst billboards after impact time", () => {
    const billboards = getCharmanderFireBillboards({
      action: {
        phase: "spray",
        sprayElapsed: CHARMANDER_FIRE_IMPACT_TIME,
        targetPosition: [0, 0, 2]
      },
      texture: "fire",
      uvRect,
      getMouthPosition: () => [0, 0.58, 0]
    });

    expect(billboards).toHaveLength(
      CHARMANDER_FIRE_PARTICLE_COUNT + CHARMANDER_FIRE_BURST_PARTICLE_COUNT
    );
  });

  it("returns no Charmander Fire billboards when inactive or missing texture", () => {
    expect(getCharmanderFireBillboards({
      action: null,
      texture: "fire",
      uvRect,
      getMouthPosition: () => [0, 0.58, 0]
    })).toEqual([]);
    expect(getCharmanderFireBillboards({
      action: {
        phase: "spray",
        sprayElapsed: 0,
        targetPosition: [0, 0, 2]
      },
      texture: null,
      uvRect,
      getMouthPosition: () => [0, 0.58, 0]
    })).toEqual([]);
  });

  it("builds Bulbasaur Leafage stream billboards before impact", () => {
    const [first, ...rest] = getBulbasaurLeafageBillboards({
      action: {
        phase: "cast",
        castElapsed: BULBASAUR_LEAFAGE_IMPACT_TIME - 0.01,
        targetPosition: [0, 0, 2]
      },
      texture: "leaf",
      uvRect,
      getEmitterPosition: () => [0, 0.72, 0]
    });

    expect(rest).toHaveLength(BULBASAUR_LEAFAGE_PARTICLE_COUNT - 1);
    expect(first.texture).toBe("leaf");
    expect(first.position).toHaveLength(3);
    expect(first.size).toHaveLength(2);
    expect(Number.isFinite(first.alpha)).toBe(true);
    expect(Number.isFinite(first.rotation)).toBe(true);
    expect(first.uvRect).toBe(uvRect);
  });

  it("adds Bulbasaur Leafage burst billboards after impact time", () => {
    const billboards = getBulbasaurLeafageBillboards({
      action: {
        phase: "cast",
        castElapsed: BULBASAUR_LEAFAGE_IMPACT_TIME,
        targetPosition: [0, 0, 2]
      },
      texture: "leaf",
      uvRect,
      getEmitterPosition: () => [0, 0.72, 0]
    });

    expect(billboards).toHaveLength(
      BULBASAUR_LEAFAGE_PARTICLE_COUNT + BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT
    );
  });

  it("returns no Bulbasaur Leafage billboards when inactive or missing target", () => {
    expect(getBulbasaurLeafageBillboards({
      action: null,
      texture: "leaf",
      uvRect,
      getEmitterPosition: () => [0, 0.72, 0]
    })).toEqual([]);
    expect(getBulbasaurLeafageBillboards({
      action: {
        phase: "cast",
        castElapsed: 0,
        targetPosition: null
      },
      texture: "leaf",
      uvRect,
      getEmitterPosition: () => [0, 0.72, 0]
    })).toEqual([]);
  });
});
