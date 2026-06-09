export function resolveHudPromptCopy({
  blockedByMode = {},
  placementPrompts = {},
  pendingPlacementPrompt = "",
  workbenchRotationPrompt = "",
  destroyableObjectPrompt = null,
  nearbyHarvestTarget = null,
  nearbyInteractable = null,
  activeQuest = null,
  transientNoticeRoute = {},
  activeMoveId = null,
  pendingWaterGunGroundCells = [],
  storyState = null,
  getItemLabel = null,
  buildNearbyPrompt = () => "",
  debug = null
} = {}) {
  const promptCopy = Object.values(blockedByMode).some(Boolean) ?
    "" :
    placementPrompts.solarStationPlacementPrompt ||
    placementPrompts.greenhousePlacementPrompt ||
    placementPrompts.campfirePlacementPrompt ||
    placementPrompts.leafDenKitPlacementPrompt ||
    pendingPlacementPrompt ||
    workbenchRotationPrompt ||
    destroyableObjectPrompt?.promptCopy ||
    buildNearbyPrompt({
      harvestTarget: nearbyHarvestTarget,
      interactTarget: nearbyInteractable,
      quest: activeQuest,
      transientMessage: transientNoticeRoute.hudMessage,
      getItemLabel,
      storyState,
      activeMoveId,
      pendingWaterGunCount: pendingWaterGunGroundCells.length
    });

  debug?.("gameLoop.promptCopy.resolved", {
    promptCopy,
    destroyableObjectPrompt: destroyableObjectPrompt?.promptCopy || "",
    sources: {
      ...placementPrompts,
      pendingPlacementPrompt,
      workbenchRotationPrompt
    },
    blockedByMode
  });

  return promptCopy;
}
