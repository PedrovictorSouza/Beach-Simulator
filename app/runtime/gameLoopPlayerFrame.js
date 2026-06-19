import { createGameplayPlayerFrameRuntimeBundle } from "../player/playerFrameRuntimeBundle.js";
import { getColonyFeedbackNotice } from "../gameplay/colonyFeedbackContracts.js";
import { restoreActiveZoomPresetOnMovement } from "./camera/cameraZoomPresetController.js";
import { resolvePlayerMovementPermission } from "./gameLoopFramePolicies.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";

export function createGameLoopPlayerFrameRuntimeBundle({
  audio,
  camera,
  cameraOrbit,
  cameraZoomPresetController,
  controls,
  gameplay,
  hud,
  session,
  runtimes = {},
  callbacks = {},
  math = {},
  createRuntime = createGameplayPlayerFrameRuntimeBundle
} = {}) {
  const {
    companionFollowDirectionRuntime,
    gearPickupParticleRuntime,
    movementQuestRuntime,
    runBreadcrumbPromptRuntime,
    supplyCounterPromptController,
    woodCollectPopRuntime
  } = runtimes;
  const {
    playSoundEvent,
    pushSupplyResourceCollectFeedback,
    queueSupplyPickupFlyItems
  } = callbacks;

  return createRuntime({
    audio,
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls,
    gameplay,
    hud,
    policies: {
      resolvePlayerMovementPermission
    },
    runtimes: {
      companionFollowDirectionRuntime,
      gearPickupParticleRuntime,
      movementQuestRuntime,
      runBreadcrumbPromptRuntime,
      woodCollectPopRuntime
    },
    callbacks: {
      getColonyFeedbackNotice,
      playSoundEvent,
      pushSupplyResourceCollectFeedback,
      queueSupplyPickupFlyItems,
      restoreActiveZoomPresetOnMovement,
      triggerSupplyCounterPrompt: (itemId, inventory, promptNow) =>
        supplyCounterPromptController.trigger(itemId, inventory, promptNow)
    },
    soundEventIds: SOUND_EVENT_IDS,
    math,
    session
  });
}
