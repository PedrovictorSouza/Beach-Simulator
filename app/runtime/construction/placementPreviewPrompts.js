import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackPlacementLabel
} from "../../gameplay/colonyFeedbackContracts.js";
import { SANDBOTS_ITEM_NAMES } from "../../story/sandbotsLexicon.js";
import { resolvePlacementPreviewPrompt } from "../../ui/inputPromptResolver.js";

export function resolveFramePlacementPrompts({
  solarStationPlacementPreview,
  greenhousePlacementPreview,
  campfirePlacementPreview,
  leafDenKitPlacementPreview,
  inputModalityState
} = {}) {
  const solarStationPlacementPreviewLabel = getColonyFeedbackPlacementLabel(
    COLONY_FEEDBACK_IDS.SOLAR_STATION_PLACEMENT_VALID
  );
  const houseKitPlacementPreviewLabel = getColonyFeedbackPlacementLabel(
    COLONY_FEEDBACK_IDS.HOUSE_KIT_PLACEMENT_VALID
  );
  const houseKitNeedsPowerPreviewLabel = getColonyFeedbackPlacementLabel(
    COLONY_FEEDBACK_IDS.HOUSE_KIT_PLACEMENT_NEEDS_POWER_RADIUS
  );
  const placementBlockedPreviewLabel = getColonyFeedbackPlacementLabel(
    COLONY_FEEDBACK_IDS.PLACEMENT_BLOCKED_BY_OBJECTS
  );
  const solarStationPlacementPrompt = solarStationPlacementPreview ?
    (
      solarStationPlacementPreview.valid ?
        resolvePlacementPreviewPrompt(solarStationPlacementPreviewLabel, inputModalityState) :
        resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
          includePlace: false
        })
    ) :
    "";
  const campfirePlacementPrompt = campfirePlacementPreview ?
    (
      campfirePlacementPreview.valid ?
        resolvePlacementPreviewPrompt(`Move the ${SANDBOTS_ITEM_NAMES.thermalCabin} preview`, inputModalityState) :
        resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
          includePlace: false
        })
    ) :
    "";
  const greenhousePlacementPrompt = greenhousePlacementPreview ?
    (
      greenhousePlacementPreview.valid ?
        resolvePlacementPreviewPrompt("Move the Greenhouse preview", inputModalityState) :
        resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
          includePlace: false
        })
    ) :
    "";
  const leafDenKitPlacementPrompt = leafDenKitPlacementPreview ?
    (
      leafDenKitPlacementPreview.valid ?
        resolvePlacementPreviewPrompt(houseKitPlacementPreviewLabel, inputModalityState) :
        leafDenKitPlacementPreview.invalidReason === "outside-solar-station-radius" ?
          resolvePlacementPreviewPrompt(houseKitNeedsPowerPreviewLabel, inputModalityState, {
            includePlace: false
          }) :
          resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
            includePlace: false
          })
    ) :
    "";

  return {
    solarStationPlacementPrompt,
    greenhousePlacementPrompt,
    campfirePlacementPrompt,
    leafDenKitPlacementPrompt
  };
}
