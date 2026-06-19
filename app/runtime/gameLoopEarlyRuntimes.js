import {
  createGameLoopConstructionBlockerRuntimeBundle
} from "./gameLoopConstructionBlockers.js";
import {
  createGameLoopNaturePresentationRuntimeBundle
} from "./gameLoopNaturePresentation.js";
import { createGameLoopRuntimeCallbacks } from "./gameLoopRuntimeCallbacks.js";
import { createGameLoopSupplyFeedbackRuntimeBundle } from "./gameLoopSupplyFeedback.js";
import { createGameLoopWorldRuntimeBundle } from "./gameLoopWorldRuntime.js";

export function createGameLoopEarlyRuntimeBundle({
  audio,
  camera,
  controls,
  gameplay,
  hud,
  rendering,
  session,
  worldCanvas,
  callbacks = {},
  math = {},
  runtimes = {},
  createConstructionBlockerRuntime =
    createGameLoopConstructionBlockerRuntimeBundle,
  createNaturePresentationRuntime =
    createGameLoopNaturePresentationRuntimeBundle,
  createRuntimeCallbacks = createGameLoopRuntimeCallbacks,
  createSupplyFeedbackRuntime = createGameLoopSupplyFeedbackRuntimeBundle,
  createWorldRuntime = createGameLoopWorldRuntimeBundle
} = {}) {
  const {
    getFoundationBuildZoneCameraFocusRuntime,
    getGameplayInputRuntime,
    getNowMs,
    getSnowstormFogRuntime,
    getWaterGunRuntime,
    playSoundEvent
  } = callbacks;
  const {
    clamp01,
    easeOutCubic,
    lerp
  } = math;
  const {
    freeBlockBuildSessionRuntime
  } = runtimes;
  let landscapeCutEffectRuntime = null;

  const supplyFeedbackRuntimeBundle = createSupplyFeedbackRuntime({
    audio,
    camera,
    controls,
    gameplay,
    hud,
    session,
    worldCanvas,
    callbacks: {
      getNowMs
    }
  });
  const worldRuntimeBundle = createWorldRuntime({
    camera,
    controls,
    gameplay,
    hud,
    rendering,
    session,
    worldCanvas,
    runtimes: {
      freeBlockBuildSessionRuntime
    },
    callbacks: {
      getLandscapeCutEffectRuntime: () => landscapeCutEffectRuntime,
      getSnowstormFogRuntime
    }
  });
  const runtimeCallbacks = createRuntimeCallbacks({
    getFoundationBuildZoneCameraFocusRuntime,
    getGameplayInputRuntime,
    getWaterGunRuntime,
    getWorldCellPlannerInteractionRuntime: () =>
      worldRuntimeBundle.worldCellPlannerInteractionRuntime
  });
  const naturePresentationRuntimeBundle = createNaturePresentationRuntime({
    camera,
    controls,
    rendering,
    session,
    math: {
      clamp01,
      easeOutCubic,
      lerp
    }
  });
  landscapeCutEffectRuntime =
    naturePresentationRuntimeBundle.landscapeCutEffectRuntime;
  const constructionBlockerRuntimeBundle = createConstructionBlockerRuntime({
    controls,
    hud,
    session,
    callbacks: {
      playSoundEvent
    }
  });

  return {
    ...supplyFeedbackRuntimeBundle,
    ...worldRuntimeBundle,
    ...runtimeCallbacks,
    ...naturePresentationRuntimeBundle,
    ...constructionBlockerRuntimeBundle
  };
}
