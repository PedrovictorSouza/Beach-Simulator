import { createGameLoopFlowStateReader } from "./gameLoopFrameRuntime.js";
import {
  createGameplayOpeningPresentationFrameRuntime,
  createGameplayOpeningRuntime
} from "./opening/createGameplayOpeningRuntime.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";

export function createGameLoopOpeningRuntimeBundle({
  actTwoTutorial,
  audio,
  controls,
  gameFlowValues,
  gameplayCameraDirector,
  gameplayDialogue,
  gameplayUiVisibility,
  isGameFlow,
  pokedexUiState,
  session,
  callbacks = {},
  createCameraFrameRuntime,
  createFlowStateReader = createGameLoopFlowStateReader,
  createOpeningPresentationFrameRuntime =
    createGameplayOpeningPresentationFrameRuntime,
  createOpeningRuntime = createGameplayOpeningRuntime
} = {}) {
  const {
    playSoundEvent = () => {},
    updateFrameAudio = () => {}
  } = callbacks;

  const gameplayOpeningRuntime = createOpeningRuntime({
    gameplayCameraDirector,
    session,
    controls,
    gameplayUiVisibility,
    audio
  });
  const gameplayOpeningPresentationFrameRuntime =
    createOpeningPresentationFrameRuntime({
      openingRuntime: gameplayOpeningRuntime,
      updateFrameAudio,
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY),
      isDialogueActive: () => gameplayDialogue.isActive()
    });
  const gameplayCameraFrameRuntime = createCameraFrameRuntime({
    tutorial: actTwoTutorial,
    openingRuntime: gameplayOpeningRuntime,
    isGameplayFlow: () => isGameFlow(gameFlowValues.GAMEPLAY),
    playNavigateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE)
  });
  const readGameLoopFlowState = createFlowStateReader({
    isGameFlow,
    gameFlowValues,
    actTwoTutorial,
    pokedexUiState,
    gameplayDialogue,
    controls
  });

  return {
    gameplayCameraFrameRuntime,
    gameplayOpeningPresentationFrameRuntime,
    gameplayOpeningRuntime,
    readGameLoopFlowState
  };
}
