export function updateStatusPopupsFrame(nextFrame, {
  nearbyDryGrassHintTarget = null,
  questCompletionPop = null,
  hasPlayerCharacter = false,
  getPlayerPosition = () => null,
  gameplayOpeningCameraLocked = false,
  cinematicActive = false,
  tutorialActive = false,
  pokedexModalOpen = false
} = {}) {
  if (nearbyDryGrassHintTarget && hasPlayerCharacter) {
    nextFrame.dryGrassHint.visible = true;
    nextFrame.dryGrassHint.targetId = nearbyDryGrassHintTarget.targetId;
    nextFrame.dryGrassHint.worldPosition =
      nearbyDryGrassHintTarget.worldPosition || getPlayerPosition();
  }

  if (
    questCompletionPop?.text &&
    hasPlayerCharacter &&
    !gameplayOpeningCameraLocked &&
    !cinematicActive &&
    !tutorialActive &&
    !pokedexModalOpen
  ) {
    nextFrame.taskPop.visible = true;
    nextFrame.taskPop.text = questCompletionPop.text;
    nextFrame.taskPop.worldPosition = getPlayerPosition();
  }
}
