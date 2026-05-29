import {
  LEPPA_BERRY_ITEM_ID,
  LEAVES_ITEM_ID,
  NITROGEN_ITEM_ID,
  PHOSPHORUS_ITEM_ID,
  POTASSIUM_ITEM_ID
} from "../../gameplayContent.js";
import {
  WORLD_OBJECT_IDS,
  getWorldObjectById,
  listWorldObjects
} from "./worldObjectCatalog.js";

export const WORLD_OBJECT_RECIPE_IDS = Object.freeze({
  PULSE_BERRY_PROPAGATION: "pulse-berry-propagation",
  BLACKBERRY_PROPAGATION: "blackberry-propagation",
  ROWANBERRY_PROPAGATION: "rowanberry-propagation",
  ELDERBERRY_PROPAGATION: "elderberry-propagation",
  LEAF_CULTURE: "leaf-culture"
});

export const WORLD_OBJECT_RECIPE_USE_SCOPE = Object.freeze({
  INSIDE_OBJECT: "inside-object"
});

export const WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE = Object.freeze({
  PLANNED: "planned",
  ACTIVE: "active"
});

export const WORLD_OBJECT_RECIPE_TAG = Object.freeze({
  CULTIVATION: "cultivation",
  GREENHOUSE_ONLY: "greenhouse-only",
  ORGANIC_BUS_UNLOCK: "organic-bus-unlock"
});

const ORGANIC_BUS_GREENHOUSE_RECIPE_UNLOCK_EVENT = "organicBusGreenhouseRecipesReceived";
const BLACKBERRY_ITEM_ID = "blackberry";
const ROWANBERRY_ITEM_ID = "rowanberry";
const ELDERBERRY_ITEM_ID = "elderberry";

function freezeRecord(record = {}) {
  return Object.freeze({ ...record });
}

function freezeStringArray(values = []) {
  return Object.freeze([...values]);
}

function getWorldObjectLabel(objectId) {
  return getWorldObjectById(objectId)?.label || objectId;
}

function getRecipeUseCopy(recipe, useLabel) {
  if (recipe.useScope === WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT) {
    return `Used inside ${useLabel}`;
  }

  return `Used at ${useLabel}`;
}

export function createWorldObjectRecipeChain(recipe = {}) {
  const sourceLabel = getWorldObjectLabel(recipe.sourceObjectId);
  const useLabel = getWorldObjectLabel(recipe.useObjectId);
  const learnedFrom = `Learned from ${sourceLabel}`;
  const usedAt = getRecipeUseCopy(recipe, useLabel);

  return Object.freeze({
    sourceObjectId: recipe.sourceObjectId,
    sourceLabel,
    learnedFrom,
    useObjectId: recipe.useObjectId,
    useLabel,
    usedAt,
    summary: `${learnedFrom}. ${usedAt}.`
  });
}

function freezeRecipe(recipe) {
  return Object.freeze({
    ...recipe,
    ingredients: freezeRecord(recipe.ingredients),
    output: freezeRecord(recipe.output),
    tags: freezeStringArray(recipe.tags),
    chain: createWorldObjectRecipeChain(recipe)
  });
}

function createOrganicBusGreenhouseRecipe({
  id,
  title,
  ingredients,
  output,
  note
}) {
  return freezeRecipe({
    id,
    title,
    sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
    unlockEventId: ORGANIC_BUS_GREENHOUSE_RECIPE_UNLOCK_EVENT,
    useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
    useScope: WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT,
    implementationState: WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE.PLANNED,
    ingredients,
    output,
    tags: [
      WORLD_OBJECT_RECIPE_TAG.ORGANIC_BUS_UNLOCK,
      WORLD_OBJECT_RECIPE_TAG.GREENHOUSE_ONLY,
      WORLD_OBJECT_RECIPE_TAG.CULTIVATION
    ],
    note
  });
}

export const WORLD_OBJECT_RECIPES = Object.freeze([
  createOrganicBusGreenhouseRecipe({
    id: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
    title: "Pulse Berry Propagation",
    ingredients: {
      [LEPPA_BERRY_ITEM_ID]: 1,
      [NITROGEN_ITEM_ID]: 1,
      [PHOSPHORUS_ITEM_ID]: 1,
      [POTASSIUM_ITEM_ID]: 1
    },
    output: {
      [LEPPA_BERRY_ITEM_ID]: 2
    },
    note: "A planned Greenhouse-only cultivation recipe learned from the Organic Bus."
  }),
  createOrganicBusGreenhouseRecipe({
    id: WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
    title: "Blackberry Cuttings",
    ingredients: {
      [BLACKBERRY_ITEM_ID]: 1,
      [NITROGEN_ITEM_ID]: 1,
      [POTASSIUM_ITEM_ID]: 1
    },
    output: {
      [BLACKBERRY_ITEM_ID]: 3
    },
    note: "A starter berry propagation recipe for Greenhouse food loops."
  }),
  createOrganicBusGreenhouseRecipe({
    id: WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
    title: "Rowanberry Cuttings",
    ingredients: {
      [ROWANBERRY_ITEM_ID]: 1,
      [NITROGEN_ITEM_ID]: 1,
      [PHOSPHORUS_ITEM_ID]: 1
    },
    output: {
      [ROWANBERRY_ITEM_ID]: 3
    },
    note: "A Greenhouse-only propagation recipe for tart field-ration fruit."
  }),
  createOrganicBusGreenhouseRecipe({
    id: WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
    title: "Elderberry Cuttings",
    ingredients: {
      [ELDERBERRY_ITEM_ID]: 1,
      [PHOSPHORUS_ITEM_ID]: 1,
      [POTASSIUM_ITEM_ID]: 1
    },
    output: {
      [ELDERBERRY_ITEM_ID]: 3
    },
    note: "A slower Greenhouse-only berry recipe for higher-value rations."
  }),
  createOrganicBusGreenhouseRecipe({
    id: WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE,
    title: "Leaf Culture Tray",
    ingredients: {
      [LEAVES_ITEM_ID]: 1,
      [NITROGEN_ITEM_ID]: 1,
      [PHOSPHORUS_ITEM_ID]: 1,
      [POTASSIUM_ITEM_ID]: 1
    },
    output: {
      [LEAVES_ITEM_ID]: 3
    },
    note: "A Greenhouse-only cultivation recipe for renewable shelter material."
  })
]);

function hasEntries(record) {
  return record && typeof record === "object" && Object.keys(record).length > 0;
}

function getObjectByIdFromList(objects, objectId) {
  return objects.find((object) => object.id === objectId) || null;
}

export function listWorldObjectRecipes() {
  return WORLD_OBJECT_RECIPES;
}

export function getWorldObjectRecipeById(recipeId) {
  return WORLD_OBJECT_RECIPES.find((recipe) => recipe.id === recipeId) || null;
}

export function listWorldObjectRecipesBySourceObjectId(sourceObjectId) {
  return WORLD_OBJECT_RECIPES.filter((recipe) => recipe.sourceObjectId === sourceObjectId);
}

export function listWorldObjectRecipesForUseObjectId(useObjectId) {
  return WORLD_OBJECT_RECIPES.filter((recipe) => recipe.useObjectId === useObjectId);
}

export function canUseWorldObjectRecipeAtObject(recipeId, objectId) {
  const recipe = getWorldObjectRecipeById(recipeId);
  return Boolean(
    recipe &&
    recipe.useScope === WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT &&
    recipe.useObjectId === objectId
  );
}

export function validateWorldObjectRecipeCatalog({
  recipes = WORLD_OBJECT_RECIPES,
  objects = listWorldObjects()
} = {}) {
  const errors = [];
  const ids = new Set();
  const useScopes = new Set(Object.values(WORLD_OBJECT_RECIPE_USE_SCOPE));
  const implementationStates = new Set(Object.values(WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE));

  recipes.forEach((recipe, index) => {
    if (!recipe?.id) {
      errors.push({ type: "missing-world-object-recipe-id", index });
      return;
    }

    if (ids.has(recipe.id)) {
      errors.push({ type: "duplicate-world-object-recipe-id", recipeId: recipe.id, index });
    }
    ids.add(recipe.id);

    if (!recipe.title) {
      errors.push({ type: "missing-world-object-recipe-title", recipeId: recipe.id, index });
    }

    const sourceObject = getObjectByIdFromList(objects, recipe.sourceObjectId);
    if (!sourceObject) {
      errors.push({
        type: "unknown-world-object-recipe-source",
        recipeId: recipe.id,
        sourceObjectId: recipe.sourceObjectId,
        index
      });
    }

    const useObject = getObjectByIdFromList(objects, recipe.useObjectId);
    if (!useObject) {
      errors.push({
        type: "unknown-world-object-recipe-use-object",
        recipeId: recipe.id,
        useObjectId: recipe.useObjectId,
        index
      });
    }

    if (!useScopes.has(recipe.useScope)) {
      errors.push({
        type: "unknown-world-object-recipe-use-scope",
        recipeId: recipe.id,
        useScope: recipe.useScope,
        index
      });
    }

    if (!implementationStates.has(recipe.implementationState)) {
      errors.push({
        type: "unknown-world-object-recipe-implementation-state",
        recipeId: recipe.id,
        implementationState: recipe.implementationState,
        index
      });
    }

    if (!hasEntries(recipe.ingredients)) {
      errors.push({ type: "missing-world-object-recipe-ingredients", recipeId: recipe.id, index });
    }

    if (!hasEntries(recipe.output)) {
      errors.push({ type: "missing-world-object-recipe-output", recipeId: recipe.id, index });
    }

    if (
      sourceObject &&
      recipe.unlockEventId &&
      !(sourceObject.emits || []).includes(recipe.unlockEventId)
    ) {
      errors.push({
        type: "world-object-recipe-unlock-event-not-emitted",
        recipeId: recipe.id,
        sourceObjectId: recipe.sourceObjectId,
        unlockEventId: recipe.unlockEventId,
        index
      });
    }
  });

  return errors;
}
