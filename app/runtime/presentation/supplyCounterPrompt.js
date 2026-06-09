import { formatResourcePickupPrompt } from "../../story/resourcePurposeCatalog.js";

export function createSupplyCounterPromptController({
  getItemLabel = null,
  triggerPrompt = null
} = {}) {
  function snapshot(inventory = {}) {
    return Object.fromEntries(
      Object.keys(inventory || {}).map((itemId) => [
        itemId,
        Number(inventory?.[itemId] || 0)
      ])
    );
  }

  function getLabel(itemId) {
    const label = getItemLabel?.(itemId) || itemId;
    return typeof label === "string" && label.trim() ? label : itemId;
  }

  function trigger(itemId, inventory = {}, now) {
    const label = getLabel(itemId);
    const count = Number(inventory?.[itemId] || 0);
    if (!label || count <= 0) {
      return false;
    }

    triggerPrompt?.(formatResourcePickupPrompt({
      itemId,
      label,
      count
    }), now);
    return true;
  }

  function triggerChanged(previousCounts, inventory = {}, now) {
    for (const itemId of Object.keys(inventory || {})) {
      const nextCount = Number(inventory?.[itemId] || 0);
      if (nextCount > Number(previousCounts?.[itemId] || 0)) {
        return trigger(itemId, inventory, now);
      }
    }

    return false;
  }

  return {
    getLabel,
    snapshot,
    trigger,
    triggerChanged
  };
}
