import { createGameLoopFrameRuntimeBundle } from "./gameLoopFrameRuntimeBundle.js";
import { createGameLoopInputRuntimeBundle } from "./gameLoopInputRuntime.js";
import { createGameLoopOpeningRuntimeBundle } from "./gameLoopOpeningRuntime.js";

export function createGameLoopFrameEntryRuntimeBundle({
  actTwoTutorial,
  audio,
  camera,
  cameraDebugRuntime,
  controls,
  frameClock,
  frameSnapshotController,
  fpsPanelController,
  gameFlowValues,
  gameplayCameraDirector,
  gameplayDialogue,
  gameplayUiVisibility,
  inputModalityPanelController,
  isGameFlow,
  placementCameraAssist,
  pokedexUiState,
  repairBoxMotionRuntime,
  rustlingGrassEventRuntime,
  session,
  updateFoundationBuildZoneCameraFocus,
  worldCanvas,
  callbacks = {},
  createCameraFrameRuntime,
  createFrameRuntime = createGameLoopFrameRuntimeBundle,
  createInputRuntime = createGameLoopInputRuntimeBundle,
  createOpeningRuntime = createGameLoopOpeningRuntimeBundle
} = {}) {
  const {
    getCurrentInputModalityState,
    playSoundEvent,
    processWorldCellPlannerClick,
    updateFrameAudio
  } = callbacks;

  const inputRuntimeBundle = createInputRuntime({
    camera,
    cameraDebugRuntime,
    controls,
    inputModalityPanelController,
    callbacks: {
      getCurrentInputModalityState
    }
  });
  const openingRuntimeBundle = createOpeningRuntime({
    actTwoTutorial,
    audio,
    controls,
    isGameFlow,
    gameFlowValues,
    gameplayCameraDirector,
    gameplayDialogue,
    gameplayUiVisibility,
    pokedexUiState,
    session,
    callbacks: {
      playSoundEvent,
      updateFrameAudio
    },
    createCameraFrameRuntime
  });
  const frameRuntime = createFrameRuntime({
    camera,
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readGameLoopFlowState: openingRuntimeBundle.readGameLoopFlowState,
    gameplayOpeningRuntime: openingRuntimeBundle.gameplayOpeningRuntime,
    placementCameraAssist,
    repairBoxMotionRuntime,
    rustlingGrassEventRuntime,
    session,
    updateFoundationBuildZoneCameraFocus,
    worldCanvas,
    callbacks: {
      processWorldCellPlannerClick
    }
  });

  return {
    ...inputRuntimeBundle,
    ...openingRuntimeBundle,
    frameRuntime
  };
}
