import {
  getNewlyCollectedDropPositions,
  getNewlyCollectedResourcePositions,
  snapshotAvailableWoodDrops,
  snapshotCollectibleSources
} from "../runtime/collectibleSourceSnapshots.js";

const DEFAULT_ITEM_IDS = Object.freeze({
  wood: "wood",
  leaves: "leaves",
  gear: "gear",
  carbon: "carbon",
  leppaBerry: "leppaBerry"
});

const DEFAULT_LABELS = Object.freeze({
  leaves: "Leaves",
  gear: "Gear",
  carbon: "Carbon",
  leppaBerry: "Pulse Berry"
});

function createEmptyResult() {
  return {
    collectedAny: false,
    collectedWoodCount: 0,
    collectedLeafCount: 0,
    collectedGearCount: 0,
    collectedCarbonCount: 0,
    collectedLeppaBerryCount: 0
  };
}

export function createPlayerResourceCollectionFrameRuntime({
  session,
  controls,
  gameplay,
  feedback = {},
  itemIds = {},
  labels = {}
} = {}) {
  const resolvedItemIds = {
    ...DEFAULT_ITEM_IDS,
    ...itemIds
  };
  const resolvedLabels = {
    ...DEFAULT_LABELS,
    ...labels
  };

  function update({
    now = 0,
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = {}) {
    const result = createEmptyResult();
    const playerCharacter = session?.playerCharacter;
    if (
      !playerCharacter ||
      cinematicActive ||
      tutorialActive ||
      pokedexModalOpen ||
      skillLearnActive ||
      scriptedInteractionActive
    ) {
      return result;
    }

    const inventory = controls?.inventory;
    const playerPosition = playerCharacter.getPosition?.();
    const woodDropSnapshots = snapshotAvailableWoodDrops(session?.woodDrops);
    const collectedWoodCount = gameplay?.collectWoodDrops?.(
      playerPosition,
      session?.woodDrops,
      inventory
    ) || 0;
    result.collectedWoodCount = collectedWoodCount;

    if (collectedWoodCount > 0) {
      feedback.triggerWoodCollectPop?.(woodDropSnapshots);
      const collectedWoodPositions = getNewlyCollectedDropPositions(woodDropSnapshots);
      for (let woodIndex = 0; woodIndex < collectedWoodCount; woodIndex += 1) {
        feedback.playWoodGrab?.({
          active: true,
          nowSeconds: (now * 0.001) + woodIndex * 0.025
        });
      }
      feedback.syncInventoryUi?.(inventory);
      feedback.queueSupplyPickupFlyItems?.(resolvedItemIds.wood, collectedWoodPositions);
      feedback.pushNotice?.(`+${collectedWoodCount} Wood`);
      feedback.triggerSupplyCounterPrompt?.(resolvedItemIds.wood, inventory, now);

      const flags = controls?.storyState?.flags;
      if (flags?.bulbasaurStrawBedChallengeCompletionNoticePending) {
        flags.bulbasaurStrawBedChallengeCompletionNoticePending = false;
        const notice = feedback.getHabitatCheckCompleteNotice?.();
        if (notice) {
          feedback.pushNotice?.(notice);
        }
      }
    }

    const leafDropSnapshots = snapshotCollectibleSources(
      session?.woodDrops,
      (drop) => drop.itemId === resolvedItemIds.leaves && !drop.collected
    );
    const leafResourceSnapshots = snapshotCollectibleSources(
      session?.resourceNodes,
      (resourceNode) => resourceNode.itemId === resolvedItemIds.leaves
    );
    const collectedLeafDropCount = gameplay?.collectLeafDrops?.(
      playerPosition,
      session?.woodDrops,
      inventory
    ) || 0;
    const collectedLeafResourceCount = gameplay?.collectLeafResourceNodes?.(
      playerPosition,
      session?.resourceNodes,
      inventory
    ) || 0;
    const collectedLeafCount = collectedLeafDropCount + collectedLeafResourceCount;
    result.collectedLeafCount = collectedLeafCount;

    if (collectedLeafCount > 0) {
      feedback.pushSupplyResourceCollectFeedback?.({
        itemId: resolvedItemIds.leaves,
        count: collectedLeafCount,
        sourcePositions: [
          ...getNewlyCollectedDropPositions(leafDropSnapshots),
          ...getNewlyCollectedResourcePositions(leafResourceSnapshots)
        ],
        label: resolvedLabels.leaves,
        now
      });
    }

    const gearResourceSnapshots = snapshotCollectibleSources(
      session?.resourceNodes,
      (resourceNode) => resourceNode.itemId === resolvedItemIds.gear
    );
    const collectedGearCount = gameplay?.collectGearResourceNodes?.(
      playerPosition,
      session?.resourceNodes,
      inventory
    ) || 0;
    result.collectedGearCount = collectedGearCount;

    if (collectedGearCount > 0) {
      const collectedGearPositions = getNewlyCollectedResourcePositions(gearResourceSnapshots);
      feedback.triggerGearPickupParticles?.(collectedGearPositions);
      feedback.pushSupplyResourceCollectFeedback?.({
        itemId: resolvedItemIds.gear,
        count: collectedGearCount,
        sourcePositions: collectedGearPositions,
        label: resolvedLabels.gear,
        now
      });
    }

    const carbonResourceSnapshots = snapshotCollectibleSources(
      session?.resourceNodes,
      (resourceNode) => resourceNode.itemId === resolvedItemIds.carbon
    );
    const collectedCarbonCount = gameplay?.collectCarbonResourceNodes?.(
      playerPosition,
      session?.resourceNodes,
      inventory
    ) || 0;
    result.collectedCarbonCount = collectedCarbonCount;

    if (collectedCarbonCount > 0) {
      feedback.pushSupplyResourceCollectFeedback?.({
        itemId: resolvedItemIds.carbon,
        count: collectedCarbonCount,
        sourcePositions: getNewlyCollectedResourcePositions(carbonResourceSnapshots),
        label: resolvedLabels.carbon,
        now
      });
    }

    const leppaBerrySnapshots = snapshotCollectibleSources(
      session?.leppaBerryDrops,
      (drop) => !drop.collected
    );
    const collectedLeppaBerryCount = gameplay?.collectLeppaBerryDrops?.(
      playerCharacter.getPosition?.(),
      session?.leppaBerryDrops,
      inventory
    ) || 0;
    result.collectedLeppaBerryCount = collectedLeppaBerryCount;

    if (collectedLeppaBerryCount > 0) {
      const collectedLeppaBerryPositions = getNewlyCollectedDropPositions(leppaBerrySnapshots);
      feedback.syncInventoryUi?.(inventory);
      feedback.queueSupplyPickupFlyItems?.(resolvedItemIds.leppaBerry, collectedLeppaBerryPositions);
      feedback.pushNotice?.(`+${collectedLeppaBerryCount} ${resolvedLabels.leppaBerry}`);
      feedback.triggerSupplyCounterPrompt?.(resolvedItemIds.leppaBerry, inventory, now);
    }

    result.collectedAny = Boolean(
      collectedWoodCount ||
      collectedLeafCount ||
      collectedGearCount ||
      collectedCarbonCount ||
      collectedLeppaBerryCount
    );
    return result;
  }

  return {
    update
  };
}
