import { createGameplayRepairBoxRevealRuntimeBundle } from "./companions/repairBoxRevealOpeningRuntime.js";
import { createGameplayConstructionWorkbenchRotationRuntime } from "./construction/workbenchRotationRuntime.js";
import { getEncounterRepairBoxPosition } from "./encounterRepairBoxPosition.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import { resolveWorkbenchRotationPrompt } from "../ui/inputPromptResolver.js";

export function createGameLoopWorldInteractionRuntimeBundle({
  camera,
  clamp01,
  controls,
  hud,
  mount,
  session,
  worldCanvas,
  callbacks = {},
  createRepairBoxRevealRuntime = createGameplayRepairBoxRevealRuntimeBundle,
  createWorkbenchRotationRuntime = createGameplayConstructionWorkbenchRotationRuntime
} = {}) {
  const {
    getCurrentInputModalityState = () => null,
    getNowSeconds,
    playGrowBotRevealSfx,
    playSoundEvent
  } = callbacks;

  const repairBoxRevealOpeningRuntime = createRepairBoxRevealRuntime({
    mount,
    worldCanvas,
    camera,
    clamp01,
    getRepairBoxPosition: getEncounterRepairBoxPosition,
    playRevealSfx: playGrowBotRevealSfx
  });

  const workbenchRotationRuntime = createWorkbenchRotationRuntime({
    session,
    controls,
    hud,
    feedback: {
      getPromptText: () => resolveWorkbenchRotationPrompt(getCurrentInputModalityState()),
      playSoundEvent,
      soundEventIds: {
        confirm: SOUND_EVENT_IDS.UI_CONFIRM,
        cancel: SOUND_EVENT_IDS.UI_CANCEL,
        navigate: SOUND_EVENT_IDS.UI_NAVIGATE
      }
    },
    solarStation: {
      getNowSeconds
    }
  });

  return {
    repairBoxRevealOpeningRuntime,
    workbenchRotationRuntime
  };
}
