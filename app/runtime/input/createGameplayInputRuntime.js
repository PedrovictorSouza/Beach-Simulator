export function createGameplayInputRuntime({ controls }) {
  let currentFrame = createEmptyGameplayInputFrame();

  function update({
    now = 0,
    deltaTime = 0,
    gameplayActive = false,
    cinematicActive = false,
    movementBlocked = false,
    placementActive = false,
    dialogueActive = false,
    tutorialActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = {}) {
    currentFrame = {
      now,
      deltaTime,

      gameplayActive,
      cinematicActive,
      movementBlocked,
      placementActive,
      dialogueActive,
      tutorialActive,
      skillLearnActive,
      scriptedInteractionActive,

      inputModalityState: controls?.getInputModalityState?.() || null,

      cinematicSkipHeld: Boolean(
        controls?.isCinematicSkipActionActive?.()
      ),

      placementRotationRequest: 0
    };

    return currentFrame;
  }

  function getFrame() {
    return currentFrame;
  }

  function clearGameplayActions() {
    controls?.clearPendingActions?.();
    controls?.clearMovementInput?.();
  }

  function clearMovementInput() {
    controls?.clearMovementInput?.();
  }

  function clearPendingActions() {
    controls?.clearPendingActions?.();
  }

  return {
    update,
    getFrame
  };
}

function createEmptyGameplayInputFrame() {
  return {
    now: 0,
    deltaTime: 0,

    gameplayActive: false,
    cinematicActive: false,
    movementBlocked: false,
    placementActive: false,
    dialogueActive: false,
    tutorialActive: false,
    skillLearnActive: false,
    scriptedInteractionActive: false,

    inputModalityState: null,

    cinematicSkipHeld: false,

    placementRotationRequest: 0
  };
}