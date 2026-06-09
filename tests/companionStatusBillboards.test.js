import { describe, expect, it } from "vitest";

import {
  CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET,
  CHARMANDER_CARBON_BAR_HEIGHT,
  CHARMANDER_CARBON_BAR_WIDTH,
  CHARMANDER_CARBON_BAR_Y_OFFSET,
  SQUIRTLE_WATER_STAMINA_BAR_HEIGHT,
  SQUIRTLE_WATER_STAMINA_BAR_WIDTH
} from "../app/runtime/fieldMoveRuntime/fieldMoveTuning.js";
import {
  getCharmanderCarbonBillboards,
  getSquirtleStaminaBillboards
} from "../app/runtime/companions/companionStatusBillboards.js";

describe("companion status billboards", () => {
  const uvRect = [0, 0, 1, 1];

  it("builds a Squirtle stamina fill billboard from visual stamina", () => {
    const [billboard] = getSquirtleStaminaBillboards({
      position: [2, 0.5, 4],
      fillTexture: "water-fill",
      uvRect,
      stamina: {
        visualCurrent: 25,
        max: 100
      },
      billboardRight: [0, 0, 1]
    });

    const fillWidth = SQUIRTLE_WATER_STAMINA_BAR_WIDTH * 0.25;
    const fillCenterOffset = -(SQUIRTLE_WATER_STAMINA_BAR_WIDTH * 0.5) + (fillWidth * 0.5);

    expect(billboard).toEqual({
      texture: "water-fill",
      position: [2, 1.75, 4 + fillCenterOffset],
      size: [fillWidth, SQUIRTLE_WATER_STAMINA_BAR_HEIGHT],
      uvRect: [0, 0, 0.25, 1],
      alpha: 0.95
    });
  });

  it("returns no Squirtle stamina billboard without a valid position or texture", () => {
    expect(getSquirtleStaminaBillboards({
      position: null,
      fillTexture: "water-fill",
      uvRect,
      stamina: { visualCurrent: 25, max: 100 }
    })).toEqual([]);
    expect(getSquirtleStaminaBillboards({
      position: [0, 0, 0],
      fillTexture: null,
      uvRect,
      stamina: { visualCurrent: 25, max: 100 }
    })).toEqual([]);
  });

  it("builds Charmander carbon back and fill billboards with camera depth offset", () => {
    const billboards = getCharmanderCarbonBillboards({
      position: [1, 0.25, 3],
      fillTexture: "carbon-fill",
      backTexture: "carbon-back",
      uvRect,
      energy: {
        visualCurrent: 0.5
      },
      billboardRight: [1, 0, 0],
      cameraDirection: [0, 0, -1]
    });

    const fillWidth = CHARMANDER_CARBON_BAR_WIDTH * 0.5;
    const fillCenterOffset = -(CHARMANDER_CARBON_BAR_WIDTH * 0.5) + (fillWidth * 0.5);

    expect(billboards).toEqual([
      {
        texture: "carbon-back",
        position: [1, 0.25 + CHARMANDER_CARBON_BAR_Y_OFFSET, 3],
        size: [CHARMANDER_CARBON_BAR_WIDTH, CHARMANDER_CARBON_BAR_HEIGHT],
        uvRect,
        alpha: 0.88
      },
      {
        texture: "carbon-fill",
        position: [
          1 + fillCenterOffset,
          0.25 + CHARMANDER_CARBON_BAR_Y_OFFSET,
          3 - CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET
        ],
        size: [fillWidth, CHARMANDER_CARBON_BAR_HEIGHT],
        uvRect: [0, 0, 0.5, 1],
        alpha: 0.96
      }
    ]);
  });

  it("omits the Charmander fill when carbon energy is nearly empty", () => {
    expect(getCharmanderCarbonBillboards({
      position: [1, 0, 3],
      fillTexture: "carbon-fill",
      backTexture: "carbon-back",
      uvRect,
      energy: {
        visualCurrent: 0.01
      }
    })).toEqual([
      {
        texture: "carbon-back",
        position: [1, CHARMANDER_CARBON_BAR_Y_OFFSET, 3],
        size: [CHARMANDER_CARBON_BAR_WIDTH, CHARMANDER_CARBON_BAR_HEIGHT],
        uvRect,
        alpha: 0.88
      }
    ]);
  });
});
