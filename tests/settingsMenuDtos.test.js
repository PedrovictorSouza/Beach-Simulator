import { describe, expect, it } from "vitest";
import {
  createSettingsBagDto,
  createSettingsBotsDto,
  getSettingsMenuBotContract,
  isSettingsMenuLeafDenValidHome
} from "../app/settings/settingsMenuDtos.js";

describe("settingsMenuDtos", () => {
  it("builds Bag slots from inventory contracts", () => {
    const dto = createSettingsBagDto({
      inventory: {
        wood: 3,
        gear: 2,
        squirtleFollowing: 1
      },
      inventoryOrder: ["wood", "gear", "squirtleFollowing"],
      itemDefs: {
        wood: {
          id: "wood",
          bagLabel: "Sturdy stick",
          description: "Recovered wood",
          color: "#8c5a34",
          ink: "#fff1e8",
          slotRole: "material"
        },
        gear: {
          id: "gear",
          bagLabel: "Gear",
          color: "#c7ccd7",
          ink: "#11151d",
          slotRole: "material"
        },
        squirtleFollowing: {
          id: "squirtleFollowing",
          label: "Hydro Bot",
          slotRole: "pokemon"
        }
      }
    });

    expect(dto.hasSlots).toBe(true);
    expect(dto.slots).toHaveLength(2);
    expect(dto.slots.map((slot) => slot.itemId)).toEqual(["wood", "gear"]);
    expect(dto.slots[0]).toEqual(expect.objectContaining({
      count: 3,
      label: "Sturdy stick",
      iconKind: "image",
      slotRole: "material",
      slotRoleLabel: "Mat",
      title: "Recovered wood"
    }));
    expect(dto.slots[0].imageUrl).toContain("Objects/wood.png");
    expect(dto.slots[1].imageUrl).toContain("images/gear.png");
  });

  it("builds captured bot DTOs from story flags", () => {
    const storyState = {
      flags: {
        squirtleRobotReactivated: true,
        squirtleFollowing: true,
        charmanderRevealed: true,
        leafDenBuilt: true,
        leafDenFurniturePlacedCount: 3,
        creatureHomeAssignments: {
          charmander: "leafDen"
        }
      }
    };

    const dto = createSettingsBotsDto({
      storyState,
      selectedBotId: "squirtle"
    });

    expect(dto.hasBots).toBe(true);
    expect(dto.bots.map((bot) => bot.id)).toEqual(["squirtle", "charmander"]);
    expect(dto.selectedBot?.id).toBe("squirtle");
    expect(dto.bots[0]).toEqual(expect.objectContaining({
      name: "Hydro Bot",
      following: true,
      selected: true,
      leafDenMoveInAvailable: true
    }));
    expect(dto.bots[1]).toEqual(expect.objectContaining({
      name: "Thermal Bot",
      following: false,
      currentHomeId: "leafDen",
      leafDenMoveInAvailable: false
    }));
  });

  it("exposes bot and home rule contracts for menu actions", () => {
    expect(getSettingsMenuBotContract("charmander")).toEqual(expect.objectContaining({
      name: "Thermal Bot",
      followingFlag: "charmanderFollowing"
    }));
    expect(getSettingsMenuBotContract("missing")).toBeNull();
    expect(isSettingsMenuLeafDenValidHome({
      flags: {
        leafDenBuilt: true,
        leafDenFurniturePlacedCount: 3
      }
    })).toBe(true);
    expect(isSettingsMenuLeafDenValidHome({
      flags: {
        leafDenBuilt: true,
        leafDenFurniturePlacedCount: 2
      }
    })).toBe(false);
  });
});
