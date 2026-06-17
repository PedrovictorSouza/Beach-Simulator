import {
  CARBON_ITEM_ID,
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID
} from "../../../gameplayContent.js";
import {
  PLAYER_COUNTER_PROMPT_DURATION_MS
} from "../gameplayPresentationTuning.js";
import { createPlayerCounterPromptRuntime } from "../playerCounterPromptRuntime.js";
import { createSupplyCounterPromptController } from "./supplyCounterPrompt.js";
import { createSupplyPickupFeedbackRuntime } from "./supplyPickupFeedbackRuntime.js";

const GAMEPLAY_SUPPLY_PICKUP_FLY_ITEM_IDS = Object.freeze([
  "wood",
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID,
  CARBON_ITEM_ID
]);

export function createGameplaySupplyFeedbackRuntimeBundle(options = {}) {
  return createSupplyFeedbackRuntimeBundle({
    ...options,
    itemIds: GAMEPLAY_SUPPLY_PICKUP_FLY_ITEM_IDS,
    config: {
      ...options.config,
      playerCounterPromptDurationMs: PLAYER_COUNTER_PROMPT_DURATION_MS
    }
  });
}

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
