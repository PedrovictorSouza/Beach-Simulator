import { resolveSupplyPickupViewportOrigin } from "../supplyPickupViewportOrigin.js";

function defaultNowMs() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ?
    performance.now() :
    Date.now();
}

export function createSupplyPickupFeedbackRuntime({
  audio = {},
  camera = null,
  controls = {},
  getNowMs = defaultNowMs,
  hud = {},
  itemIds = [],
  session = {},
  supplyCounterPromptController = {},
  worldCanvas = null
} = {}) {
  function queueFlyItems(itemId, sourcePositions = []) {
    if (typeof hud.queueSupplyPickupFlyToSlot !== "function") {
      return;
    }

    const projectedOrigins = sourcePositions
      .map((sourcePosition) => resolveSupplyPickupViewportOrigin({
        sourcePosition,
        getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
        camera,
        worldCanvas
      }))
      .filter(Boolean)
      .slice(0, 3);

    for (const origin of projectedOrigins) {
      hud.queueSupplyPickupFlyToSlot({ itemId, origin });
    }
  }

  function queueChangedFlyItems(previousCounts, inventory = {}) {
    let queuedAny = false;

    for (const itemId of itemIds) {
      const previousCount = Number(previousCounts?.[itemId] || 0);
      const nextCount = Number(inventory?.[itemId] || 0);
      const gainedCount = Math.max(0, Math.floor(nextCount - previousCount));

      if (gainedCount <= 0) {
        continue;
      }

      queueFlyItems(itemId, Array.from({ length: gainedCount }));
      queuedAny = true;
    }

    return queuedAny;
  }

  function pushResourceCollectFeedback({
    itemId,
    count,
    sourcePositions = [],
    label = supplyCounterPromptController.getLabel?.(itemId),
    now = getNowMs()
  } = {}) {
    if (count <= 0 || !itemId) {
      return;
    }

    for (let index = 0; index < count; index += 1) {
      audio.playWoodGrab?.();
    }
    hud.syncInventoryUi?.(controls.inventory);
    queueFlyItems(itemId, sourcePositions);
    hud.pushNotice?.(`+${count} ${label}`);
    supplyCounterPromptController.trigger?.(itemId, controls.inventory, now);
  }

  return {
    pushResourceCollectFeedback,
    queueChangedFlyItems,
    queueFlyItems
  };
}
