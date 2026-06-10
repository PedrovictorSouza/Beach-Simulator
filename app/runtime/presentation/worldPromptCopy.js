import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackPlacementLabel,
  getColonyFeedbackPrompt
} from "../../gameplay/colonyFeedbackContracts.js";
import {
  resolveInputPrompt,
  resolvePlacementReadyPrompt,
  UI_PROMPT_ACTION
} from "../../ui/inputPromptResolver.js";

export function getPendingPlacementPrompt(intent, harvestTarget = null, inputModalityState = null) {
  if (!intent) {
    return "";
  }

  if (intent.itemId === "leafDenKit") {
    return intent.blockedReason === "needs-solar-station" ?
      getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.HOUSE_KIT_READY_NEEDS_SOLAR_STATION) :
      resolvePlacementReadyPrompt(
        getColonyFeedbackPlacementLabel(COLONY_FEEDBACK_IDS.HOUSE_KIT_READY_TO_PLACE),
        inputModalityState
      );
  }

  if (intent.itemId === "strawBed") {
    return harvestTarget?.strawBedPlacement?.canPlace ?
      resolvePlacementReadyPrompt(
        getColonyFeedbackPlacementLabel(COLONY_FEEDBACK_IDS.SOLAR_STATION_READY_TO_PLACE),
        inputModalityState
      ) :
      getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.SOLAR_STATION_READY_MOVE_TO_OPEN_TERRAIN);
  }

  return resolvePlacementReadyPrompt(`${intent.label || "Object"} ready`, inputModalityState);
}

export function getPendingPlacementWorldPromptText(
  intent,
  harvestTarget = null,
  inputModalityState = null
) {
  if (!intent) {
    return "";
  }

  if (intent.itemId === "leafDenKit" && intent.blockedReason === "needs-solar-station") {
    return getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_NEEDS_SOLAR_STATION);
  }

  if (intent.itemId === "strawBed" && !harvestTarget?.strawBedPlacement?.canPlace) {
    return getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_MOVE_TO_OPEN_TERRAIN);
  }

  return resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState);
}

export function getPlayerInteractionWorldPromptText(inputModalityState = null) {
  const prompt = resolveInputPrompt(UI_PROMPT_ACTION.INTERACT, inputModalityState);
  const inputLabel = prompt.replace(/\s+Interact$/u, "").trim();

  return inputLabel ? `press ${inputLabel}` : "press input";
}

export function getRunBreadcrumbWorldPromptText(inputModalityState = null) {
  const prompt = resolveInputPrompt(UI_PROMPT_ACTION.RUN, inputModalityState);
  const inputLabel = prompt.replace(/\s+Run$/u, "").trim();

  return inputLabel ? `press ${inputLabel} to run!` : "press input to run!";
}

export function getFieldToolWorldPromptText(inputModalityState = null) {
  const inputLabel = resolveInputPrompt(UI_PROMPT_ACTION.FIELD_TOOL, inputModalityState).trim();

  return inputLabel && inputLabel !== "Unassigned" ? `Press ${inputLabel}` : "Press input";
}

export function resolveWorldPromptVisibility({
  canShowWorldSpaceUi = false,
  hasPlayerCharacter = false,
  nearbyRepairBoxPrompt = null,
  waterGunFirstUsePromptVisible = false,
  leafageFirstUsePromptVisible = false,
  squirtleWaterCharging = false,
  squirtleChargingPosition = null,
  leafageInvalidTargetVisible = false,
  fireInvalidTargetVisible = false,
  fieldMoveSwitchPrompt = null,
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  pendingPlacementPrompt = "",
  workbenchRotationPrompt = "",
  destroyableObjectPrompt = null,
  freeBlockBuildCostMarker = null,
  transientNoticeRoute = null,
  playerCounterPromptText = "",
  isPlayerInteractionPromptTarget = false,
  nearbyDryGrassWorldPromptTarget = null,
  runBreadcrumbVisible = false
} = {}) {
  const canShow = Boolean(canShowWorldSpaceUi);
  const canShowPlayerPrompt = canShow && Boolean(hasPlayerCharacter);
  const shouldShowWorkbenchRotationPrompt =
    canShowPlayerPrompt &&
    Boolean(workbenchRotationPrompt);

  return {
    shouldShowSolarStationPlacementPrompt:
      canShow &&
      Boolean(solarStationPlacementPreview?.snappedPosition),
    shouldShowGreenhousePlacementPrompt:
      canShow &&
      Boolean(greenhousePlacementPreview?.snappedPosition),
    shouldShowCampfirePlacementPrompt:
      canShow &&
      Boolean(campfirePlacementPreview?.snappedPosition),
    shouldShowLeafDenKitPlacementPrompt:
      canShow &&
      Boolean(leafDenKitPlacementPreview?.snappedPosition),
    shouldShowPendingPlacementPrompt:
      canShowPlayerPrompt &&
      Boolean(pendingPlacementPrompt),
    shouldShowWorkbenchRotationPrompt,
    shouldShowDestroyableObjectPrompt:
      canShowPlayerPrompt &&
      !shouldShowWorkbenchRotationPrompt &&
      Boolean(destroyableObjectPrompt?.promptCopy),
    shouldShowFreeBlockBuildCostPrompt:
      canShow &&
      Boolean(freeBlockBuildCostMarker),
    shouldShowPlayerCounterPrompt:
      canShowPlayerPrompt &&
      Boolean(playerCounterPromptText),
    shouldShowFieldMoveSwitchPrompt:
      canShowPlayerPrompt &&
      Boolean(fieldMoveSwitchPrompt?.html),
    shouldShowSquirtleChargingPrompt:
      canShow &&
      squirtleWaterCharging &&
      Array.isArray(squirtleChargingPosition),
    shouldShowInvalidLeafageUsePrompt:
      canShowPlayerPrompt &&
      Boolean(leafageInvalidTargetVisible),
    shouldShowInvalidFireUsePrompt:
      canShowPlayerPrompt &&
      Boolean(fireInvalidTargetVisible),
    shouldShowTransientWorldPrompt:
      canShowPlayerPrompt &&
      Boolean(transientNoticeRoute?.worldPromptMessage),
    shouldShowDryGrassHydroPrompt:
      canShowPlayerPrompt &&
      Boolean(nearbyDryGrassWorldPromptTarget),
    shouldShowRunBreadcrumbPrompt:
      canShowPlayerPrompt &&
      Boolean(runBreadcrumbVisible),
    shouldShowPlayerInteractionPrompt:
      canShowPlayerPrompt &&
      Boolean(isPlayerInteractionPromptTarget),
    shouldShowRepairBoxPrompt:
      canShow &&
      Boolean(nearbyRepairBoxPrompt),
    shouldShowLeafageFirstUsePrompt:
      canShowPlayerPrompt &&
      Boolean(leafageFirstUsePromptVisible),
    shouldShowWaterGunFirstUsePrompt:
      canShowPlayerPrompt &&
      Boolean(waterGunFirstUsePromptVisible)
  };
}
