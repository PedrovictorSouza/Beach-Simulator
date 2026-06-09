import { describe, expect, it } from "vitest";

import {
  BULBASAUR_LEAFAGE_STAND_DISTANCE,
  CHARMANDER_FIRE_STAND_DISTANCE,
  SQUIRTLE_WATER_GUN_STAND_DISTANCE
} from "../app/runtime/fieldMoveRuntime/fieldMoveTuning.js";
import {
  resolveBulbasaurLeafageApproachPosition,
  resolveCharmanderFireApproachPosition,
  resolveSquirtleWaterGunApproachPosition
} from "../app/runtime/fieldMoveRuntime/fieldMoveApproachPositions.js";

describe("field move approach positions", () => {
  it("places Hydro Bot at Water Gun stand distance from the target", () => {
    expect(resolveSquirtleWaterGunApproachPosition({
      targetPosition: [0, 0, 0],
      squirtlePosition: [0, 0.04, 2]
    })).toEqual([
      0,
      0.04,
      SQUIRTLE_WATER_GUN_STAND_DISTANCE
    ]);
  });

  it("falls back to the player position when Grow Bot overlaps the Leafage target", () => {
    expect(resolveBulbasaurLeafageApproachPosition({
      targetPosition: [0, 0, 0],
      bulbasaurPosition: [0, 0.04, 0],
      playerPosition: [3, 0.04, 0]
    })).toEqual([
      BULBASAUR_LEAFAGE_STAND_DISTANCE,
      0.04,
      0
    ]);
  });

  it("uses the default forward direction when Thermal Bot and player positions are unresolved", () => {
    expect(resolveCharmanderFireApproachPosition({
      targetPosition: [0, 0, 0]
    })).toEqual([
      0,
      0.04,
      CHARMANDER_FIRE_STAND_DISTANCE
    ]);
  });
});
