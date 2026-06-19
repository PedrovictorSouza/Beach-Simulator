import { createGameplayCompanionWorldSpeechCueRuntime } from "./companions/companionWorldSpeechCueRuntime.js";
import { createFieldMoveSupportRuntimeBundle } from "./fieldMoveRuntime/fieldMoveSupportRuntimeBundle.js";
import { createGameLoopCompanionMotionRuntimeBundle } from "./gameLoopCompanionMotion.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import {
  BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
} from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import { POKEMON_TALK_INTERACT_DISTANCE } from "../../gameplayContent.js";

const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;

export function createGameLoopCompanionSupportRuntimeBundle({
  controls,
  session,
  worldSceneSyncRuntime,
  runtimes = {},
  callbacks = {},
  createCompanionMotionRuntime = createGameLoopCompanionMotionRuntimeBundle,
  createFieldMoveSupportRuntime = createFieldMoveSupportRuntimeBundle,
  createRunBreadcrumbRuntime = createRunBreadcrumbPromptRuntime,
  createWorldSpeechCueRuntime = createGameplayCompanionWorldSpeechCueRuntime
} = {}) {
  const {
    companionConstructionBlockerRuntime,
    companionFacingRuntime,
    companionModelSyncRuntime
  } = runtimes;

  const fieldMoveSupportRuntimeBundle = createFieldMoveSupportRuntime({
    session,
    companionFacingRuntime,
    companionConstructionBlockerRuntime
  });
  const {
    fieldMoveActorPositionRuntime
  } = fieldMoveSupportRuntimeBundle;

  const companionWorldSpeechCueRuntime = createWorldSpeechCueRuntime({
    controls,
    session,
    fieldMoveActorPositionRuntime,
    worldSceneSyncRuntime,
    config: {
      chopperInteractDistance: POKEMON_TALK_INTERACT_DISTANCE + 0.45,
      restoreTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
    }
  });

  const companionMotionRuntimeBundle = createCompanionMotionRuntime({
    controls,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      companionFacingRuntime,
      companionModelSyncRuntime
    },
    callbacks: {
      getWaterGunRuntime: callbacks.getWaterGunRuntime
    }
  });

  return {
    ...fieldMoveSupportRuntimeBundle,
    companionWorldSpeechCueRuntime,
    ...companionMotionRuntimeBundle,
    runBreadcrumbPromptRuntime: createRunBreadcrumbRuntime({
      durationMs: RUN_BREADCRUMB_PROMPT_DURATION_MS
    })
  };
}
