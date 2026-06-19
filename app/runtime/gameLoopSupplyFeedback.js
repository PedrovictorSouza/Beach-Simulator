import {
  createGameplaySupplyFeedbackRuntimeBundle
} from "./presentation/supplyFeedbackRuntimeBundle.js";

export function createGameLoopSupplyFeedbackRuntimeBundle({
  audio,
  camera,
  controls,
  gameplay,
  hud,
  session,
  worldCanvas,
  callbacks = {},
  createRuntime = createGameplaySupplyFeedbackRuntimeBundle
} = {}) {
  const {
    getNowMs
  } = callbacks;

  return createRuntime({
    audio,
    camera,
    controls,
    gameplay,
    getNowMs,
    hud,
    session,
    worldCanvas
  });
}
