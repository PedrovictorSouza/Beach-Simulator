import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackPlacementLabel
} from "../../gameplay/colonyFeedbackContracts.js";
import { SANDBOTS_ITEM_NAMES } from "../../story/sandbotsLexicon.js";
import { resolvePlacementPreviewPrompt } from "../../ui/inputPromptResolver.js";

export function getFreeBlockInvalidPlacementNotice(reason) {
  if (reason === "outside-build-zone") {
    return "Build inside the blue foundation.";
  }

  if (reason === "duplicate-block") {
    return "That foundation edge is already built.";
  }

  if (reason === "player-cell") {
    return "Step off the foundation edge first.";
  }

  if (reason === "blocked-cell") {
    return "That foundation edge is blocked.";
  }

  if (reason === "outside-build-area") {
    return "Move back to the foundation build area.";
  }

  return "Block can't be placed there.";
}

export function getFreeBlockPlacementNotice(result, { wallBlockType = "wall" } = {}) {
  if (result?.reason === "missing-material") {
    return "Need Wood";
  }

  if (result?.placed && result.blockType === wallBlockType) {
    return "Wall placed.";
  }

  return result?.placed ? "Block placed." : getFreeBlockInvalidPlacementNotice(result?.reason);
}

export function formatFreeBlockCostNumber(value) {
  const number = Math.max(0, Number(value) || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

export function buildFreeBlockBuildCostMarker({
  previewTarget = null,
  materialCost = null,
  inventory = {}
} = {}) {
  if (!Array.isArray(previewTarget?.targetPosition) || !materialCost?.itemId) {
    return null;
  }

  const required = Math.max(0, Number(materialCost.quantity) || 0);
  const available = Math.max(0, Number(inventory?.[materialCost.itemId] || 0));

  return {
    text: `${formatFreeBlockCostNumber(required)}/${formatFreeBlockCostNumber(available)}`,
    affordable: available >= required,
    worldPosition: previewTarget.targetPosition
  };
}

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
