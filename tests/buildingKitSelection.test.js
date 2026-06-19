// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { LEAF_DEN_KIT_ITEM_ID } from "../gameplayContent.js";
import {
  resolveSelectableBuildingKit,
  shouldChainHouseKitPlacementAfterSolarStation
} from "../app/bootstrap/buildingKitSelection.js";

describe("building kit inventory selection", () => {
  it("selects an owned House Kit when building placement is available", () => {
    expect(resolveSelectableBuildingKit({
      storyState: {
        flags: {
          leafDenBuildAvailable: true,
          leafDenKitPlaced: false
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      }
    })).toMatchObject({
      itemId: LEAF_DEN_KIT_ITEM_ID,
      name: "House Kit"
    });
  });

  it("does not select a building kit that is missing", () => {
    expect(resolveSelectableBuildingKit({
      storyState: {
        flags: {
          leafDenBuildAvailable: true,
          leafDenKitPlaced: false
        }
      },
      inventory: {}
    })).toBeNull();
  });

  it("selects another House Kit after the first house is already placed", () => {
    expect(resolveSelectableBuildingKit({
      storyState: {
        flags: {
          leafDenBuildAvailable: true,
          leafDenKitPlaced: true
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      }
    })).toMatchObject({
      itemId: LEAF_DEN_KIT_ITEM_ID,
      name: "House Kit"
    });
  });

  it("chains Solar Station placement into House Kit placement when the player already selected the kit", () => {
    expect(shouldChainHouseKitPlacementAfterSolarStation({
      storyState: {
        flags: {
          leafDenKitSelected: true,
          leafDenKitPlaced: false
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      },
      gameSession: {}
    })).toBe(true);
  });

  it("does not chain House Kit placement when the first house is already placed", () => {
    expect(shouldChainHouseKitPlacementAfterSolarStation({
      storyState: {
        flags: {
          leafDenKitSelected: true,
          leafDenKitPlaced: true
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      },
      gameSession: {}
    })).toBe(false);
  });
});
