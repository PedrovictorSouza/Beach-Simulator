import {
  GREENHOUSE_ITEM_ID,
  LEAF_DEN_KIT_ITEM_ID
} from "../../gameplayContent.js";
import {
  getHouseKitPlacementReadiness,
  getHouseKitProgressState,
  getSolarStationProgressState,
  getTrainHouseProgressState,
  HOUSE_KIT_PROGRESS_STATE,
  SOLAR_STATION_PROGRESS_STATE,
  TRAIN_HOUSE_PROGRESS_STATE
} from "../story/progressionContracts.js";

export const WORKBENCH_MODAL_OPTION_SCHEMA_VERSION = 1;

export const WORKBENCH_GREENHOUSE_GUIDANCE = "Greenhouse creates green soil in its footprint.";
export const WORKBENCH_HOUSE_KIT_BLOCKED_GUIDANCE =
  "Place the Solar Station first. Its blue support zone enables House Kit placement.";

function defaultFormatRequirementSummary() {
  return "";
}

function getLockedRecipeStatus(recipe, inventory = {}, formatRequirementSummary = defaultFormatRequirementSummary) {
  const requirementSummary = formatRequirementSummary(recipe?.ingredients || {}, inventory);
  return requirementSummary ? `Locked · Needs ${requirementSummary}` : "Locked";
}

export function createWorkbenchRecipeOptions({
  storyState = {},
  inventory = {},
  workbenchRecipes = {},
  formatRequirementSummary = defaultFormatRequirementSummary
} = {}) {
  const flags = storyState?.flags || {};
  const recipeOptions = [];

  if (workbenchRecipes[GREENHOUSE_ITEM_ID]) {
    const greenhouseInBag = Number(inventory?.[GREENHOUSE_ITEM_ID] || 0) > 0;
    recipeOptions.push({
      recipe: workbenchRecipes[GREENHOUSE_ITEM_ID],
      disabled: false,
      status: greenhouseInBag ? "Ready to place" : null,
      actionLabel: greenhouseInBag ? "Place Greenhouse" : "Prepare Greenhouse",
      guidance: WORKBENCH_GREENHOUSE_GUIDANCE
    });
  }

  if (workbenchRecipes.campfire) {
    const trainHouseState = getTrainHouseProgressState({ flags, inventory });
    recipeOptions.push({
      recipe: workbenchRecipes.campfire,
      disabled: trainHouseState.disabled,
      status: trainHouseState.status ||
        (
          trainHouseState.state === TRAIN_HOUSE_PROGRESS_STATE.LOCKED ?
            getLockedRecipeStatus(workbenchRecipes.campfire, inventory, formatRequirementSummary) :
            null
        ),
      actionLabel: trainHouseState.actionLabel
    });
  }

  if (workbenchRecipes.strawBed) {
    const solarStationState = getSolarStationProgressState({ flags, inventory });
    recipeOptions.push({
      recipe: workbenchRecipes.strawBed,
      disabled: solarStationState.disabled,
      status: solarStationState.status ||
        (
          solarStationState.state === SOLAR_STATION_PROGRESS_STATE.LOCKED ?
            getLockedRecipeStatus(workbenchRecipes.strawBed, inventory, formatRequirementSummary) :
            null
        ),
      actionLabel: solarStationState.actionLabel
    });
  }

  const houseRecipe = workbenchRecipes[LEAF_DEN_KIT_ITEM_ID];

  if (houseRecipe) {
    const houseKitState = getHouseKitProgressState({ flags, inventory });
    const houseKitReadiness = houseKitState.state === HOUSE_KIT_PROGRESS_STATE.READY_TO_PLACE ?
      getHouseKitPlacementReadiness({ flags, inventory }) :
      null;
    const placementBlocked = Boolean(houseKitReadiness?.blockedReason);
    recipeOptions.push({
      recipe: houseRecipe,
      disabled: houseKitState.disabled || placementBlocked,
      status: houseKitReadiness?.reason || houseKitState.status,
      actionLabel: placementBlocked ? null : houseKitState.actionLabel,
      guidance: placementBlocked ? WORKBENCH_HOUSE_KIT_BLOCKED_GUIDANCE : null
    });
  }

  return recipeOptions;
}
