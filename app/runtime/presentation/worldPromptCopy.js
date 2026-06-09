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
