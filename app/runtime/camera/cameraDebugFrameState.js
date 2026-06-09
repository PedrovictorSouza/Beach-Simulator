export function createCameraDebugFrameState({
  now,
  flowState,
  movementBlocked,
  gameplayOpeningMovementLocked,
  cameraTransitionActive,
  paused,
  gameplayCameraState,
  cameraPose,
  systemQuestId,
  uiQuestId,
  playerPosition,
  shipVisible,
  shipPosition
} = {}) {
  return {
    frame: Math.round(now),
    flow: {
      gameplay: flowState.gameplayActive,
      cinematic: flowState.cinematicActive,
      intro: flowState.introActive,
      tutorial: flowState.tutorialActive
    },
    blockers: {
      movementBlocked,
      tutorialMovementLocked: flowState.tutorialMovementLocked,
      pokedexModalOpen: flowState.pokedexModalOpen,
      dialogueActive: flowState.dialogueActive,
      skillLearnActive: flowState.skillLearnActive,
      scriptedInteractionActive: flowState.scriptedInteractionActive,
      paused
    },
    camera: {
      ...gameplayCameraState,
      openingCameraActiveForInput: gameplayOpeningMovementLocked,
      transitionActive: cameraTransitionActive,
      pose: cameraPose || null
    },
    quest: {
      system: systemQuestId || null,
      ui: uiQuestId || null
    },
    player: playerPosition || null,
    ship: shipVisible ? shipPosition : null
  };
}
