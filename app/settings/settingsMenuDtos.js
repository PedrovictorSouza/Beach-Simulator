import {
  getInventoryItemImageUrl,
  getInventoryPresentationOrder,
  getInventorySlotRole,
  getInventorySlotRoleLabel
} from "../ui/inventoryPresentation.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES
} from "../story/sandbotsLexicon.js";

export const SETTINGS_MENU_BOT_ROSTER = Object.freeze([
  {
    id: "squirtle",
    name: SANDBOTS_BOT_NAMES.hydro,
    element: "Hydro",
    ability: SANDBOTS_ITEM_NAMES.hydroTool,
    abilityDescription: `${SANDBOTS_ITEM_NAMES.hydroTool} restores dry ground, revives thirsty trees, and turns dead ground green again.`,
    imageUrl: new URL("../ui/images/Robot-1-thumb.png", import.meta.url).href,
    color: "#75c6ee",
    ink: "#ffffff",
    revealedFlag: "squirtleRobotReactivated",
    followingFlag: "squirtleFollowing"
  },
  {
    id: "bulbasaur",
    name: SANDBOTS_BOT_NAMES.grow,
    element: "Growth",
    ability: SANDBOTS_ITEM_NAMES.growTool,
    abilityDescription: `${SANDBOTS_ITEM_NAMES.growTool} places ${SANDBOTS_BOT_NAMES.grow}'s selected plant kit on valid ground, such as tall grass or Garden-1.`,
    imageUrl: new URL("../ui/images/Robot-2-thumb.png", import.meta.url).href,
    color: "#7ed36d",
    ink: "#ffffff",
    revealedFlag: "bulbasaurRevealed",
    followingFlag: "bulbasaurFollowing"
  },
  {
    id: "charmander",
    name: SANDBOTS_BOT_NAMES.thermal,
    element: "Thermal",
    ability: SANDBOTS_ITEM_NAMES.thermalTool,
    abilityDescription: `${SANDBOTS_ITEM_NAMES.thermalTool} spends Carbon charges to burn white ground into dead ground so ${SANDBOTS_ITEM_NAMES.hydroTool} can restore it later.`,
    imageUrl: new URL("../ui/images/Robot-3-thumb.png", import.meta.url).href,
    color: "#ff8a3d",
    ink: "#ffffff",
    revealedFlag: "charmanderRevealed",
    followingFlag: "charmanderFollowing"
  },
  {
    id: "timburr",
    name: SANDBOTS_BOT_NAMES.builder,
    element: "Build",
    ability: "Construction",
    abilityDescription: `Construction lets ${SANDBOTS_BOT_NAMES.builder} help finish building kits that need heavy support.`,
    color: "#c5945d",
    ink: "#ffffff",
    glyph: "T",
    revealedFlag: "timburrRevealed",
    followingFlag: "timburrFollowing"
  }
]);

export function createSettingsBagDto({
  inventory = {},
  inventoryOrder = [],
  itemDefs = {}
} = {}) {
  const slots = getInventoryPresentationOrder(inventory, inventoryOrder, itemDefs)
    .map((itemId) => {
      const item = itemDefs[itemId] || {};
      const count = inventory[itemId] || 0;
      const label = item.bagLabel || item.label || itemId;
      const glyph = item.glyph || item.shortLabel?.[0] || label[0] || "?";
      const imageUrl = getInventoryItemImageUrl(itemId);
      const slotRole = getInventorySlotRole(item);

      return {
        itemId,
        count,
        label,
        glyph,
        imageUrl,
        iconKind: imageUrl ? "image" : "glyph",
        slotRole,
        slotRoleLabel: getInventorySlotRoleLabel(item),
        title: item.description || label,
        color: item.color || "rgba(255, 255, 255, 0.08)",
        ink: item.ink || "#fff1e8"
      };
    });

  return {
    slots,
    hasSlots: slots.length > 0
  };
}

export function isSettingsMenuBotCaptured(bot, storyState = {}) {
  const flags = storyState?.flags || {};
  const reactivatedIds = Array.isArray(flags.reactivatedHelperRobotIds) ?
    flags.reactivatedHelperRobotIds :
    [];

  return Boolean(
    flags[bot.revealedFlag] ||
    flags[`${bot.id}RobotReactivated`] ||
    flags[bot.followingFlag] ||
    reactivatedIds.includes(bot.id)
  );
}

export function isSettingsMenuLeafDenValidHome(storyState = {}) {
  const flags = storyState?.flags || {};
  return Boolean(
    flags.leafDenBuilt &&
    Number(flags.leafDenFurniturePlacedCount || 0) >= 3
  );
}

export function getSettingsMenuBotContract(botId) {
  return SETTINGS_MENU_BOT_ROSTER.find((bot) => bot.id === botId) || null;
}

export function createSettingsBotsDto({
  storyState = {},
  selectedBotId = null
} = {}) {
  const flags = storyState?.flags || {};
  const leafDenMoveInEnabled = isSettingsMenuLeafDenValidHome(storyState);
  const bots = SETTINGS_MENU_BOT_ROSTER
    .filter((bot) => isSettingsMenuBotCaptured(bot, storyState))
    .map((bot) => {
      const currentHomeId = flags.creatureHomeAssignments?.[bot.id] || bot.currentHomeId || null;

      return {
        ...bot,
        captured: true,
        following: Boolean(flags[bot.followingFlag]),
        currentHomeId,
        leafDenMoveInAvailable: leafDenMoveInEnabled && currentHomeId !== "leafDen",
        selected: bot.id === selectedBotId
      };
    });

  return {
    bots,
    selectedBot: bots.find((bot) => bot.selected) || null,
    hasBots: bots.length > 0
  };
}
