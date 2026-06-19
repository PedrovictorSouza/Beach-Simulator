import {
  LEAF_DEN_KIT_ITEM_ID,
  listBuildingKits
} from "../../gameplayContent.js";
import { hasItems } from "../../story/progression.js";

export function resolveSelectableBuildingKit({
  storyState,
  inventory,
  buildingKits = listBuildingKits(),
  hasItemsFn = hasItems
} = {}) {
  const flags = storyState?.flags || {};

  return (
    buildingKits.find((kit) => {
      if (!kit?.itemId || !hasItemsFn(inventory, { [kit.itemId]: 1 })) {
        return false;
      }

      if (kit.itemId === LEAF_DEN_KIT_ITEM_ID) {
        return Boolean(flags.leafDenBuildAvailable);
      }

      return false;
    }) || null
  );
}

export function shouldChainHouseKitPlacementAfterSolarStation({
  storyState,
  inventory,
  gameSession,
  hasItemsFn = hasItems
} = {}) {
  const flags = storyState?.flags || {};
  return Boolean(
    flags.leafDenKitSelected &&
    !flags.leafDenKitPlaced &&
    !gameSession?.leafDen &&
    !gameSession?.leafDenKitPlacementPreview?.active &&
    hasItemsFn(inventory, { [LEAF_DEN_KIT_ITEM_ID]: 1 })
  );
}
