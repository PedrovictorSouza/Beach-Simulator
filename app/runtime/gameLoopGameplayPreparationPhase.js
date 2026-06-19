import { processFollowerCallFrame } from "./companions/followerCallFrame.js";
import { syncFirstTaughtActionFreedomWindow } from "../story/earlyFreedomWindow.js";

export function runGameLoopGameplayPreparationPhase({
  cinematicActive = false,
  constructionPlacementFrameRuntime,
  controls,
  deltaTime = 0,
  dialogueActive = false,
  foundationBuildZoneCameraFocusActive = false,
  frameFlowState = {},
  gameplayOpeningCameraLocked = false,
  gameplayOpeningMovementLocked = false,
  hud,
  movementBlocked = false,
  naturePresentationFrameRuntime,
  now = 0,
  playSoundEvent,
  playerActionFrameRuntime,
  playerMovementFrameRuntime,
  pokedexModalOpen = false,
  scriptedInteractionActive = false,
  session,
  skillLearnActive = false,
  tutorialActive = false,
  processFollowerCall = processFollowerCallFrame,
  syncFirstTaughtActionFreedom = syncFirstTaughtActionFreedomWindow
} = {}) {
  const placementPreviews =
    constructionPlacementFrameRuntime.updatePlacementControlsAndPreviews({
      now,
      deltaTime,
      movementBlocked
    });
  const { playerMovedThisFrame } = playerMovementFrameRuntime.update({
    deltaTime,
    now,
    flowState: frameFlowState,
    gameplayOpeningMovementLocked,
    gameplayOpeningCameraLocked,
    foundationBuildZoneCameraFocusActive,
    tutorialActive
  });
  naturePresentationFrameRuntime.updatePassiveEffects(deltaTime);

  const firstTaughtActionFreedomWindow = syncFirstTaughtActionFreedom(
    controls.storyState,
    { now }
  );
  const playerActionState = playerActionFrameRuntime.getActionState();
  const {
    activeMoveId,
    buildBlockEquipped
  } = playerActionState;
  const { freeBlockPreviewTarget } =
    constructionPlacementFrameRuntime.updateFreeBlockPreview({
      now,
      buildBlockEquipped,
      cinematicActive,
      gameplayOpeningMovementLocked,
      foundationBuildZoneCameraFocusActive,
      tutorialActive,
      pokedexModalOpen,
      skillLearnActive,
      scriptedInteractionActive,
      dialogueActive
    });
  playerActionFrameRuntime.update({
    now,
    flowState: frameFlowState,
    equipmentState: playerActionState
  });

  processFollowerCall({
    controls,
    session,
    pushNotice: (notice) => hud.pushNotice(notice),
    playSoundEvent
  });

  return {
    activeMoveId,
    firstTaughtActionFreedomWindow,
    freeBlockPreviewTarget,
    placementPreviews,
    playerActionState,
    playerMovedThisFrame
  };
}
