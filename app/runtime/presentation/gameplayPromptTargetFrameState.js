import { resolveActiveConstructionPlacementPreviews } from "../construction/constructionPlacementFrameRuntime.js";
import { resolveFramePendingPlacementIntent } from "../construction/pendingPlacementIntent.js";
import { resolveFramePlacementPromptState } from "../construction/placementPreviewPrompts.js";
import { resolveTransientNoticeRoute } from "../contextualPromptNotice.js";
import {
  resolveInputPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../../ui/inputPromptResolver.js";
import { resolveFrameHudPromptCopy } from "./hudPromptCopy.js";
import { resolveGameplayTargetFrameState } from "./gameplayTargetFrameState.js";
import {
  resolveGameplayGroundCellHighlightFrameState,
  resolveGameplayGroundGuidanceFrameState
} from "./groundCellHighlightFrameState.js";
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

export function createGameplayPromptPreparationFrameRuntime({
  controls = {},
  session = {},
  gameplay = {},
  getCurrentInputModalityState = () => null,
  getPlayerCounterPromptText = () => "",
  getSelectedRotatableWorkbenchPlacement = () => null,
  getNearestRotatableWorkbenchPlacement = () => null,
  debug = null,
  getPendingSquirtleWaterGunGroundCells = () => [],
  getFreeRoamRestorationGroundCells = () => [],
  getLeppaTreeSurroundingGroundCells = () => [],
  isOpeningLeppaTreeRequestActive = () => false,
  buildSolarStationFieldMarkedGroundCells = () => [],
  getBoulderShadedTaskGroundCells = () => [],
  getGrowFirstHabitatTaskGroundCells = () => [],
  buildFoundationBuildZoneGroundCells = () => [],
  getWorldCellPlannerSelectedGroundCell = () => null,
  getWorkbenchRotationGroundCell = () => null,
  buildSolarStationPreviewPowerRadiusGroundCells = () => [],
  buildPlacedSolarStationPowerRadiusGroundCells = () => [],
  getGroundActionFeedbackFrame = () => null,
  getFieldToolTargetPulseFrame = () => null
} = {}) {
  function update({
    now = 0,
    gameplayOpeningMovementLocked = false,
    gameplayOpeningHudHidden = false,
    flowState = {},
    equipmentState = {},
    placementPreviews = {},
    placementFootprints = {}
  } = {}) {
    const {
      activeMoveId = null,
      waterGunEquipped = false,
      leafageEquipped = false,
      fireEquipped = false
    } = equipmentState;
    let {
      solarStationPlacementPreview = null,
      greenhousePlacementPreview = null,
      campfirePlacementPreview = null,
      leafDenKitPlacementPreview = null
    } = placementPreviews;

    const targetState = resolveGameplayTargetFrameState({
      session,
      controls,
      gameplay,
      flowState,
      gameplayOpeningMovementLocked,
      waterGunEquipped,
      leafageEquipped,
      fireEquipped
    });
    const activeQuest = gameplay.getActiveQuest?.(controls.storyState) || null;
    const activeTask = gameplay.getActiveTask?.() || null;
    const activeSystemQuest = gameplay.getActiveSystemQuest?.() || null;
    const guidanceState = resolveGameplayGroundGuidanceFrameState({
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      flowState,
      activeQuest,
      activeSystemQuest,
      activeTask,
      storyState: controls.storyState,
      session,
      now,
      solarStationPlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      nearbyHarvestTarget: targetState.nearbyHarvestTarget,
      waterGunEquipped,
      leafageEquipped,
      fireEquipped,
      openingLeppaTreeRequestActive: isOpeningLeppaTreeRequestActive(controls.storyState),
      getPendingSquirtleWaterGunGroundCells,
      getFreeRoamRestorationGroundCells,
      getLeppaTreeSurroundingGroundCells,
      isLeppaTreeTileHintFlashing: () => gameplay.isLeppaTreeTileHintFlashing?.(),
      buildSolarStationFieldMarkedGroundCells,
      getBoulderShadedTaskGroundCells,
      getGrowFirstHabitatTaskGroundCells,
      buildFoundationBuildZoneGroundCells,
      getWorldCellPlannerSelectedGroundCell
    });
    ({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    } = resolveActiveConstructionPlacementPreviews({
      session,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    }));
    const promptState = resolveGameplayPromptFrameState({
      now,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      nearbyHarvestTarget: targetState.nearbyHarvestTarget,
      nearbyInteractable: targetState.nearbyInteractable,
      gameplayOpeningMovementLocked,
      cinematicActive: flowState.cinematicActive,
      tutorialActive: flowState.tutorialActive,
      skillLearnActive: flowState.skillLearnActive,
      scriptedInteractionActive: flowState.scriptedInteractionActive,
      flowState,
      session,
      storyState: controls.storyState,
      inventory: controls.inventory,
      gameplay,
      activeQuest,
      activeMoveId,
      pendingWaterGunGroundCells: guidanceState.pendingWaterGunGroundCells,
      getCurrentInputModalityState,
      getPlayerCounterPromptText,
      getSelectedRotatableWorkbenchPlacement,
      getNearestRotatableWorkbenchPlacement,
      debug
    });
    const groundCellHighlightFrameState = resolveGameplayGroundCellHighlightFrameState({
      gameplayOpeningMovementLocked,
      flowState,
      highlightedGroundCell: targetState.highlightedGroundCell,
      placementFootprints,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      selectedWorkbenchRotationTarget: promptState.selectedWorkbenchRotationTarget,
      activeFireGroundCell: guidanceState.activeFireGroundCell,
      session,
      storyState: controls.storyState,
      getWorkbenchRotationGroundCell,
      buildSolarStationPreviewPowerRadiusGroundCells,
      buildPlacedSolarStationPowerRadiusGroundCells,
      getGroundActionFeedbackFrame: () => getGroundActionFeedbackFrame(now),
      getFieldToolTargetPulseFrame: (groundCell) => getFieldToolTargetPulseFrame(groundCell, now)
    });

    return {
      ...targetState,
      activeQuest,
      activeTask,
      activeSystemQuest,
      ...guidanceState,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      ...promptState,
      groundCellHighlightFrameState
    };
  }

  return {
    update
  };
}
