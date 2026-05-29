import { STATION_IDS } from "./stationIds.js";

export function resolveStationInteraction({
  stationId,
  storyState,
  inventory,
  workbenchRecipeOptions = [],
  activeQuest = null,
  placeholderRecipes = {},
  hasItemsFn = () => false
} = {}) {
  if (
    stationId === STATION_IDS.WORKBENCH &&
    storyState?.flags?.bulbasaurWorkbenchGuideAvailable &&
    !storyState.flags.workbenchDiyRecipesReceived
  ) {
    return {
      type: "open-workbench-intro",
      stationId
    };
  }

  if (
    stationId === STATION_IDS.WORKBENCH &&
    workbenchRecipeOptions.length > 0
  ) {
    return {
      type: "open-recipe-options",
      stationId,
      recipes: workbenchRecipeOptions
    };
  }

  const quest = activeQuest;
  const recipe = quest?.recipeId ? placeholderRecipes[quest.recipeId] : null;

  if (!recipe || quest?.stationId !== stationId) {
    return {
      type: "blocked",
      stationId,
      reason:
        stationId === STATION_IDS.STOVE
          ? "The stove has no active colony recipe."
          : "This station has no active colony protocol."
    };
  }

  if (!hasItemsFn(inventory, recipe.ingredients)) {
    return {
      type: "missing-materials",
      stationId,
      recipe
    };
  }

  return {
    type: "craft-quest-recipe",
    stationId,
    quest,
    recipe
  };
}