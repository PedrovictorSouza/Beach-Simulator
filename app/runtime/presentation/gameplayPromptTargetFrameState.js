import { resolveFramePendingPlacementIntent } from "../construction/pendingPlacementIntent.js";
import { resolveFramePlacementPromptState } from "../construction/placementPreviewPrompts.js";
import { resolveTransientNoticeRoute } from "../contextualPromptNotice.js";
import {
  resolveInputPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../../ui/inputPromptResolver.js";
import { resolveFrameHudPromptCopy } from "./hudPromptCopy.js";
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

export function resolveGameplayPromptFrameState({
  now = 0,
  session = {},
  storyState = {},
  inventory = {},
  gameplay = {},
  hud = {},
  activeQuest = null,
  activeMoveId = null,
  pendingWaterGunGroundCells = [],
  nearbyHarvestTarget = null,
  nearbyInteractable = null,
  gameplayOpeningMovementLocked = false,
  cinematicActive = false,
  tutorialActive = false,
  skillLearnActive = false,
  scriptedInteractionActive = false,
  flowState = {},
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  getCurrentInputModalityState = () => null,
  getPlayerCounterPromptText = () => "",
  getSelectedRotatableWorkbenchPlacement = () => null,
  getNearestRotatableWorkbenchPlacement = () => null,
  debug = null
} = {}) {
  const inputModalityState = getCurrentInputModalityState();
  const transientNoticeRoute = resolveTransientNoticeRoute(hud.getNoticeMessage?.());
  const playerCounterPromptText = getPlayerCounterPromptText(now);
  const promptTargetState = resolveGameplayPromptTargetFrameState({
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    inputModalityState,
    nearbyHarvestTarget,
    gameplayOpeningMovementLocked,
    flowState,
    session,
    storyState,
    inventory,
    gameplay,
    getSelectedRotatableWorkbenchPlacement,
    getNearestRotatableWorkbenchPlacement,
    debug
  });
  const promptCopy = resolveFrameHudPromptCopy({
    gameplayOpeningMovementLocked,
    cinematicActive,
    tutorialActive,
    skillLearnActive,
    scriptedInteractionActive,
    placementPrompts: promptTargetState.framePlacementPrompts,
    pendingPlacementPrompt: promptTargetState.pendingPlacementPrompt,
    workbenchRotationPrompt: promptTargetState.workbenchRotationPrompt,
    destroyableObjectPrompt: promptTargetState.destroyableObjectPrompt,
    nearbyHarvestTarget,
    nearbyInteractable,
    activeQuest,
    transientNoticeRoute,
    activeMoveId,
    pendingWaterGunGroundCells,
    storyState,
    getItemLabel: gameplay.getItemLabel,
    buildNearbyPrompt: gameplay.buildNearbyPrompt,
    debug
  });

  return {
    inputModalityState,
    transientNoticeRoute,
    playerCounterPromptText,
    ...promptTargetState,
    promptCopy
  };
}
