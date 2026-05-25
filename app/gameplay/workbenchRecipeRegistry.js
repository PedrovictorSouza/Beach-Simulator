export const WORKBENCH_RECIPE_REGISTRY_SCHEMA_VERSION = 1;

function shallowFreezeRecord(record) {
  Object.values(record).forEach((value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
    }
  });
  return Object.freeze(record);
}

export function cloneWorkbenchRecipe(recipe) {
  if (!recipe) {
    return null;
  }

  return shallowFreezeRecord({
    ...recipe,
    ingredients: Object.freeze({ ...(recipe.ingredients || {}) }),
    output: Object.freeze({ ...(recipe.output || {}) })
  });
}

export function createWorkbenchRecipeRegistry({
  baseRecipes = {},
  extraRecipes = []
} = {}) {
  const recipeMap = {};

  Object.entries(baseRecipes || {}).forEach(([recipeId, recipe]) => {
    const clonedRecipe = cloneWorkbenchRecipe(recipe);
    if (clonedRecipe) {
      recipeMap[recipeId] = clonedRecipe;
    }
  });

  extraRecipes.forEach((recipe) => {
    const clonedRecipe = cloneWorkbenchRecipe(recipe);
    if (clonedRecipe?.id) {
      recipeMap[clonedRecipe.id] = clonedRecipe;
    }
  });

  return Object.freeze(recipeMap);
}

export function getWorkbenchRecipeById(recipeRegistry = {}, recipeId = "") {
  return recipeRegistry?.[recipeId] || null;
}
