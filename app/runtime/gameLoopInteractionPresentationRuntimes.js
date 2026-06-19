import {
  createGameLoopCompanionPresentationRuntimeBundle
} from "./gameLoopCompanionPresentation.js";
import {
  createGameLoopCompanionSupportRuntimeBundle
} from "./gameLoopCompanionSupport.js";
import {
  createGameLoopScenePresentationRuntimeBundle
} from "./gameLoopScenePresentation.js";
import {
  createGameLoopUtilityRuntimeBundle
} from "./gameLoopUtilityRuntimes.js";
import {
  createGameLoopWorldInteractionRuntimeBundle
} from "./gameLoopWorldInteractions.js";

export function createGameLoopInteractionPresentationRuntimeBundle({
  actTwoTutorial,
  camera,
  clamp01,
  colliderGizmos,
  companionConstructionBlockerRuntime,
  companionFacingRuntime,
  controls,
  dialogueCamera,
  fpsPanel,
  gameplayDialogue,
  groundCellHighlight,
  hud,
  inputModalityPanel,
  mount,
  rendering,
  session,
  worldCanvas,
  worldRenderer,
  worldSceneSyncRuntime,
  worldSpeech,
  callbacks = {},
  math = {},
  createCompanionPresentationRuntime =
    createGameLoopCompanionPresentationRuntimeBundle,
  createCompanionSupportRuntime =
    createGameLoopCompanionSupportRuntimeBundle,
  createScenePresentationRuntime =
    createGameLoopScenePresentationRuntimeBundle,
  createUtilityRuntime = createGameLoopUtilityRuntimeBundle,
  createWorldInteractionRuntime =
    createGameLoopWorldInteractionRuntimeBundle
} = {}) {
  const {
    getCurrentInputModalityState,
    getNowMs,
    getNowSeconds,
    getWaterGunRuntime,
    playGrowBotRevealSfx,
    playSoundEvent,
    startNextQueuedSquirtleWaterGunAction
  } = callbacks;
  const {
    easeOutCubic,
    lerp,
    moveValueToward
  } = math;
  let companionModelSyncRuntime = null;
  const companionModelSyncRuntimeProxy = {
    syncBulbasaur: (...args) => companionModelSyncRuntime?.syncBulbasaur?.(...args),
    syncSquirtle: (...args) => companionModelSyncRuntime?.syncSquirtle?.(...args)
  };

  const companionSupportRuntimeBundle = createCompanionSupportRuntime({
    controls,
    session,
    worldSceneSyncRuntime,
    runtimes: {
      companionConstructionBlockerRuntime,
      companionFacingRuntime,
      companionModelSyncRuntime: companionModelSyncRuntimeProxy
    },
    callbacks: {
      getWaterGunRuntime
    }
  });
  const worldInteractionRuntimeBundle = createWorldInteractionRuntime({
    camera,
    clamp01,
    controls,
    hud,
    mount,
    session,
    worldCanvas,
    callbacks: {
      getCurrentInputModalityState,
      getNowSeconds,
      playGrowBotRevealSfx,
      playSoundEvent
    }
  });
  const utilityRuntimeBundle = createUtilityRuntime({
    actTwoTutorial,
    camera,
    clamp01,
    colliderGizmos,
    fpsPanel,
    groundCellHighlight,
    hud,
    inputModalityPanel,
    mount,
    worldCanvas,
    worldRenderer,
    worldSpeech
  });
  const companionPresentationRuntimeBundle =
    createCompanionPresentationRuntime({
      actTwoTutorial,
      camera,
      controls,
      rendering,
      session,
      runtimes: {
        fieldMoveActorPositionRuntime:
          companionSupportRuntimeBundle.fieldMoveActorPositionRuntime,
        worldSceneSyncRuntime
      },
      callbacks: {
        onSquirtleRechargeComplete: startNextQueuedSquirtleWaterGunAction
      },
      math: {
        clamp01,
        easeOutCubic,
        lerp,
        moveValueToward
      }
    });
  companionModelSyncRuntime =
    companionPresentationRuntimeBundle.companionModelSyncRuntime;
  const scenePresentationRuntimeBundle = createScenePresentationRuntime({
    companionFacingRuntime,
    controls,
    dialogueCamera,
    gameplayDialogue,
    session,
    workbenchRotationRuntime:
      worldInteractionRuntimeBundle.workbenchRotationRuntime,
    callbacks: {
      getNowMs,
      getNowSeconds
    }
  });

  return {
    ...companionSupportRuntimeBundle,
    ...worldInteractionRuntimeBundle,
    ...utilityRuntimeBundle,
    ...companionPresentationRuntimeBundle,
    ...scenePresentationRuntimeBundle
  };
}
