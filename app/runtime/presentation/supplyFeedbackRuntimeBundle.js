import { createPlayerCounterPromptRuntime } from "../playerCounterPromptRuntime.js";
import { createSupplyCounterPromptController } from "./supplyCounterPrompt.js";
import { createSupplyPickupFeedbackRuntime } from "./supplyPickupFeedbackRuntime.js";

export function createSupplyFeedbackRuntimeBundle({
  audio = {},
  camera = null,
  controls = {},
  gameplay = {},
  getNowMs,
  hud = {},
  itemIds = [],
  session = {},
  worldCanvas = null,
  config = {}
} = {}) {
  const playerCounterPromptRuntime = createPlayerCounterPromptRuntime({
    durationMs: config.playerCounterPromptDurationMs
  });

  const supplyCounterPromptController = createSupplyCounterPromptController({
    getItemLabel: (itemId) => gameplay.getItemLabel?.(itemId),
    triggerPrompt: (text, now) => {
      playerCounterPromptRuntime.trigger(text, now);
    }
  });

  const supplyPickupFeedbackRuntime = createSupplyPickupFeedbackRuntime({
    audio,
    camera,
    controls,
    getNowMs,
    hud,
    itemIds,
    session,
    supplyCounterPromptController,
    worldCanvas
  });

  return {
    playerCounterPromptRuntime,
    pushSupplyResourceCollectFeedback:
      supplyPickupFeedbackRuntime.pushResourceCollectFeedback,
    queueChangedSupplyPickupFlyItems:
      supplyPickupFeedbackRuntime.queueChangedFlyItems,
    queueSupplyPickupFlyItems: supplyPickupFeedbackRuntime.queueFlyItems,
    supplyCounterPromptController,
    supplyPickupFeedbackRuntime
  };
}
