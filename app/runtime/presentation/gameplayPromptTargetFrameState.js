import { resolveFramePendingPlacementIntent } from "../construction/pendingPlacementIntent.js";
import { resolveFramePlacementPromptState } from "../construction/placementPreviewPrompts.js";
import {
  resolveInputPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../../ui/inputPromptResolver.js";
import { getPendingPlacementPrompt } from "./worldPromptCopy.js";

export function resolveGameplayPromptTargetFrameState({
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  inputModalityState = null,
  nearbyHarvestTarget = null,
  gameplayOpeningMovementLocked = false,
  flowState = {},
  session = {},
  storyState = {},
  inventory = {},
  gameplay = {},
  getSelectedRotatableWorkbenchPlacement = () => null,
  getNearestRotatableWorkbenchPlacement = () => null,
  debug = null
} = {}) {
  const {
    placementPreviewBlocked,
    framePlacementPrompts
  } = resolveFramePlacementPromptState({
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    inputModalityState
  });
  const pendingPlacementIntent = resolveFramePendingPlacementIntent({
    placementPreviewBlocked,
    session,
    storyState,
    inventory
  });
  const pendingPlacementPrompt = getPendingPlacementPrompt(
    pendingPlacementIntent,
    nearbyHarvestTarget,
    inputModalityState
  );
  const selectedWorkbenchRotationTarget =
    !placementPreviewBlocked ?
      getSelectedRotatableWorkbenchPlacement() :
      null;
  const nearbyWorkbenchRotationTarget =
    !selectedWorkbenchRotationTarget &&
    !placementPreviewBlocked &&
    session.playerCharacter &&
    !gameplayOpeningMovementLocked &&
    !flowState.cinematicActive &&
    !flowState.tutorialActive &&
    !flowState.skillLearnActive &&
    !flowState.scriptedInteractionActive ?
      getNearestRotatableWorkbenchPlacement() :
      null;
  const workbenchRotationPrompt = selectedWorkbenchRotationTarget ?
    resolveWorkbenchRotationPrompt(inputModalityState) :
    nearbyWorkbenchRotationTarget ?
      resolveInputPrompt(UI_PROMPT_ACTION.OPEN_BAG, inputModalityState) :
      "";
  const destroyableObjectPrompt =
    !placementPreviewBlocked &&
    session.playerCharacter ?
      gameplay.findNearbyDestroyableObjectPrompt?.({
        playerPosition: session.playerCharacter.getPosition(),
        storyState,
        groundGrassPatches: session.groundGrassPatches,
        groundFlowerPatches: session.groundFlowerPatches
      }) :
      null;

  debug?.("gameLoop.destroyableObjectPrompt", {
    hasMethod: typeof gameplay.findNearbyDestroyableObjectPrompt,
    prompt: destroyableObjectPrompt,
    playerPosition: session.playerCharacter?.getPosition?.(),
    grassCount: session.groundGrassPatches?.length || 0,
    flowerCount: session.groundFlowerPatches?.length || 0,
    blockedByPlacementPreview: placementPreviewBlocked
  });

  return {
    framePlacementPrompts,
    pendingPlacementIntent,
    pendingPlacementPrompt,
    selectedWorkbenchRotationTarget,
    nearbyWorkbenchRotationTarget,
    workbenchRotationPrompt,
    destroyableObjectPrompt
  };
}
