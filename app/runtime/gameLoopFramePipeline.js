import { runGameLoopFrameControlPhase } from "./gameLoopFrameControlPhase.js";
import {
  runGameLoopGameplayPreparationPhase
} from "./gameLoopGameplayPreparationPhase.js";
import {
  runGameLoopSimulationPresentationPhase
} from "./gameLoopSimulationPresentationPhase.js";

export function createGameLoopFramePipeline({
  actTwoSequence,
  actTwoTutorial,
  companionFrameRuntime,
  constructionPlacementFrameRuntime,
  controls,
  frameRuntime,
  gameFlowValues,
  gameplayCameraFrameRuntime,
  gameplayInputFrameRuntime,
  gameplayOpeningPresentationFrameRuntime,
  gameplayPresentationSnapshotFrameRuntime,
  hud,
  isGameFlow,
  naturePresentationFrameRuntime,
  playSoundEvent,
  playerActionFrameRuntime,
  playerMovementFrameRuntime,
  playerResourceCollectionFrameRuntime,
  session,
  worldSceneSyncRuntime,
  requestFrame = requestAnimationFrame,
  runFrameControlPhase = runGameLoopFrameControlPhase,
  runGameplayPreparationPhase = runGameLoopGameplayPreparationPhase,
  runSimulationPresentationPhase = runGameLoopSimulationPresentationPhase
} = {}) {
  function frame(now) {
    const frameControlPhase = runFrameControlPhase({
      actTwoTutorial,
      frameRuntime,
      gameplayCameraFrameRuntime,
      gameplayInputFrameRuntime,
      now,
      session,
      worldSceneSyncRuntime
    });
    if (frameControlPhase.shouldRequestNextFrame) {
      requestFrame(frame);
      return;
    }
    let {
      cameraTransitionActive,
      cinematicActive,
      deltaTime,
      dialogueActive,
      foundationBuildZoneCameraFocusActive,
      frameFlowState,
      gameplayOpeningCameraFrame,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      movementBlocked,
      nextFrame,
      pokedexModalOpen,
      scriptedInteractionActive,
      skillLearnActive,
      tutorialActive,
      tutorialCameraFocus
    } = frameControlPhase;

    const {
      activeMoveId,
      firstTaughtActionFreedomWindow,
      freeBlockPreviewTarget,
      placementPreviews,
      playerActionState,
      playerMovedThisFrame
    } = runGameplayPreparationPhase({
      cinematicActive,
      constructionPlacementFrameRuntime,
      controls,
      deltaTime,
      dialogueActive,
      foundationBuildZoneCameraFocusActive,
      frameFlowState,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      hud,
      movementBlocked,
      naturePresentationFrameRuntime,
      now,
      playSoundEvent,
      playerActionFrameRuntime,
      playerMovementFrameRuntime,
      pokedexModalOpen,
      scriptedInteractionActive,
      session,
      skillLearnActive,
      tutorialActive
    });
    runSimulationPresentationPhase({
      activeMoveId,
      actTwoSequence,
      cameraTransitionActive,
      cinematicActive,
      companionFrameRuntime,
      deltaTime,
      dialogueActive,
      firstTaughtActionFreedomWindow,
      foundationBuildZoneCameraFocusActive,
      frameFlowState,
      freeBlockPreviewTarget,
      gameFlowValues,
      gameplayCameraFrameRuntime,
      gameplayOpeningCameraFrame,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      gameplayOpeningPresentationFrameRuntime,
      gameplayPresentationSnapshotFrameRuntime,
      isGameFlow,
      nextFrame,
      now,
      placementPreviews,
      playerActionState,
      playerMovedThisFrame,
      playerResourceCollectionFrameRuntime,
      pokedexModalOpen,
      scriptedInteractionActive,
      skillLearnActive,
      tutorialActive,
      tutorialCameraFocus,
      worldSceneSyncRuntime
    });
    // Commit after all snapshot channels are populated.
    frameRuntime.commitFrame();
    requestFrame(frame);
  }

  return frame;
}
