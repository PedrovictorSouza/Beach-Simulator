import { createFieldMoveImpactRuntime } from "./fieldMoveRuntime/fieldMoveImpactRuntime.js";
import { CARBON_ITEM_ID } from "../../gameplayContent.js";

export function createGameLoopFieldMoveImpactRuntime({
  controls,
  hud,
  session,
  runtimes = {},
  callbacks = {},
  createRuntime = createFieldMoveImpactRuntime
} = {}) {
  const {
    companionAbilityResourcesRuntime,
    groundActionFeedbackRuntime,
    playerActionRuntime,
    supplyCounterPromptController
  } = runtimes;
  const {
    getNowMs,
    playInstanceObjectSfx
  } = callbacks;

  return createRuntime({
    session,
    controls,
    carbonItemId: CARBON_ITEM_ID,
    companionAbilityResourcesRuntime,
    getNowMs,
    groundActionFeedbackRuntime,
    hud,
    performGameplayHarvestAction: (...args) =>
      playerActionRuntime.performHarvest(...args),
    playInstanceObjectSfx,
    supplyCounterPromptController
  });
}
