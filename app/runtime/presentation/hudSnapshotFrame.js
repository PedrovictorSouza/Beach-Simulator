export function updateHudSnapshotFrame(nextFrame, {
  gameplayOpeningCameraLocked = false,
  gameplayOpeningHudHidden = false,
  cinematicActive = false,
  tutorialActive = false,
  pokedexModalOpen = false,
  skillLearnActive = false,
  storyState = null,
  inventory = null,
  playerPosition = [0, 0, 0],
  promptCopy = "",
  inputModalityState = null
} = {}) {
  if (
    gameplayOpeningCameraLocked ||
    gameplayOpeningHudHidden ||
    cinematicActive ||
    tutorialActive ||
    pokedexModalOpen ||
    skillLearnActive
  ) {
    return;
  }

  nextFrame.hud.active = true;
  nextFrame.hud.storyState = storyState;
  nextFrame.hud.inventory = inventory;
  nextFrame.hud.playerPosition = playerPosition;
  nextFrame.hud.promptCopy = promptCopy;
  nextFrame.hud.inputModalityState = inputModalityState;
  nextFrame.hud.statusMessage = promptCopy;
}
