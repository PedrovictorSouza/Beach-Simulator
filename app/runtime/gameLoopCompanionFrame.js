import {
  createGameplayCompanionFrameRuntimeBundle
} from "./companions/companionFrameRuntimeBundle.js";

export function createGameLoopCompanionFrameRuntimeBundle({
  audio,
  controls,
  gameFlowValues = {},
  isGameFlow = () => false,
  rendering,
  session,
  runtimes = {},
  createCompanionFrameRuntimeBundle =
    createGameplayCompanionFrameRuntimeBundle
} = {}) {
  return createCompanionFrameRuntimeBundle({
    session,
    controls,
    rendering,
    audio,
    callbacks: {
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY)
    },
    runtimes
  });
}
