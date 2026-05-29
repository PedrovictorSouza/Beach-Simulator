import { WORLD_OBJECT_IDS } from "./worldObjectCatalog.js";
import {
  canUseWorldObjectRecipeAtObject,
  getWorldObjectRecipeById,
  listWorldObjectRecipes,
  listWorldObjectRecipesBySourceObjectId,
  listWorldObjectRecipesForUseObjectId
} from "./worldObjectRecipeCatalog.js";

export const WORLD_OBJECT_RECIPE_BOOK_FLAG = "worldObjectRecipeBook";

export const WORLD_OBJECT_RECIPE_CRAFT_REASON = Object.freeze({
  LOCKED: "locked",
  MISSING_INGREDIENTS: "missing-ingredients",
  UNKNOWN_RECIPE: "unknown-recipe",
  WRONG_OBJECT: "wrong-object"
});

function getFlags(storyState = {}) {
  if (!storyState.flags || typeof storyState.flags !== "object") {
    storyState.flags = {};
  }

  return storyState.flags;
}

function normalizeRecipeIdList(recipeIds = []) {
  return [...new Set(recipeIds.filter((recipeId) => typeof recipeId === "string" && recipeId.length > 0))];
}

function getRecipeBook(storyState = {}, { create = false } = {}) {
  const flags = create ? getFlags(storyState) : (storyState.flags || {});
  const currentBook = flags[WORLD_OBJECT_RECIPE_BOOK_FLAG];

  if (!currentBook || typeof currentBook !== "object") {
    if (!create) {
      return {
        knownRecipeIds: [],
        seenRecipeIds: []
      };
    }

    const book = {
      knownRecipeIds: [],
      seenRecipeIds: []
    };
    flags[WORLD_OBJECT_RECIPE_BOOK_FLAG] = book;
    return book;
  }

  if (create) {
    if (!Array.isArray(currentBook.knownRecipeIds)) {
      currentBook.knownRecipeIds = [];
    }
    if (!Array.isArray(currentBook.seenRecipeIds)) {
      currentBook.seenRecipeIds = [];
    }
    currentBook.knownRecipeIds = normalizeRecipeIdList(currentBook.knownRecipeIds);
    currentBook.seenRecipeIds = normalizeRecipeIdList(currentBook.seenRecipeIds);
    return currentBook;
  }

  return {
    knownRecipeIds: Array.isArray(currentBook.knownRecipeIds) ? currentBook.knownRecipeIds : [],
    seenRecipeIds: Array.isArray(currentBook.seenRecipeIds) ? currentBook.seenRecipeIds : []
  };
}

function hasKnownRecipeId(storyState = {}, recipeId) {
  return getRecipeBook(storyState).knownRecipeIds.includes(recipeId);
}

function hasLegacyUnlockEvent(recipe, storyState = {}) {
  return !recipe?.unlockEventId || Boolean(storyState?.flags?.[recipe.unlockEventId]);
}

function addKnownRecipeIds(storyState = {}, recipeIds = []) {
  const book = getRecipeBook(storyState, { create: true });
  book.knownRecipeIds = normalizeRecipeIdList([
    ...book.knownRecipeIds,
    ...recipeIds
  ]);
  return book.knownRecipeIds;
}

function addSeenRecipeIds(storyState = {}, recipeIds = []) {
  const knownRecipeIds = getKnownWorldObjectRecipeIds(storyState);
  const knownRecipeIdSet = new Set(knownRecipeIds);
  const book = getRecipeBook(storyState, { create: true });
  book.knownRecipeIds = normalizeRecipeIdList([
    ...book.knownRecipeIds,
    ...knownRecipeIds
  ]);
  book.seenRecipeIds = normalizeRecipeIdList([
    ...book.seenRecipeIds,
    ...recipeIds.filter((recipeId) => knownRecipeIdSet.has(recipeId))
  ]);
  return book.seenRecipeIds;
}

function hasIngredients(inventory = {}, ingredients = {}) {
  return Object.entries(ingredients).every(([itemId, amount]) => {
    return Number(inventory[itemId] || 0) >= Number(amount || 0);
  });
}

function getMissingIngredients(inventory = {}, ingredients = {}) {
  return Object.entries(ingredients)
    .map(([itemId, amount]) => {
      const required = Math.max(0, Number(amount || 0));
      const current = Math.max(0, Number(inventory[itemId] || 0));

      return {
        itemId,
        current,
        required,
        missing: Math.max(0, required - current)
      };
    })
    .filter((entry) => entry.missing > 0);
}

function consumeIngredients(inventory = {}, ingredients = {}) {
  Object.entries(ingredients).forEach(([itemId, amount]) => {
    inventory[itemId] = Math.max(0, Number(inventory[itemId] || 0) - Number(amount || 0));
  });
}

function addOutput(inventory = {}, output = {}) {
  Object.entries(output).forEach(([itemId, amount]) => {
    inventory[itemId] = Number(inventory[itemId] || 0) + Number(amount || 0);
  });
}

function isRecipeUnlocked(recipe, storyState = {}) {
  return hasLegacyUnlockEvent(recipe, storyState) || hasKnownRecipeId(storyState, recipe?.id);
}

function createRecipeStateEntry(recipe, {
  inventory = {},
  storyState = {}
} = {}) {
  const unlocked = isRecipeUnlocked(recipe, storyState);
  const seen = getRecipeBook(storyState).seenRecipeIds.includes(recipe.id);
  const missingIngredients = getMissingIngredients(inventory, recipe.ingredients);

  return Object.freeze({
    recipeId: recipe.id,
    title: recipe.title,
    sourceObjectId: recipe.sourceObjectId,
    unlockEventId: recipe.unlockEventId || null,
    useObjectId: recipe.useObjectId,
    useScope: recipe.useScope,
    ingredients: recipe.ingredients,
    output: recipe.output,
    chain: recipe.chain,
    implementationState: recipe.implementationState,
    unlocked,
    seen,
    isNew: unlocked && !seen,
    canCraft: unlocked && missingIngredients.length === 0,
    missingIngredients: Object.freeze(missingIngredients.map((entry) => Object.freeze(entry)))
  });
}

export function getKnownWorldObjectRecipeIds(storyState = {}) {
  const knownRecipeIds = new Set(getRecipeBook(storyState).knownRecipeIds);

  listWorldObjectRecipes()
    .filter((recipe) => hasLegacyUnlockEvent(recipe, storyState))
    .forEach((recipe) => knownRecipeIds.add(recipe.id));

  return Object.freeze([...knownRecipeIds]);
}

export function getSeenWorldObjectRecipeIds(storyState = {}) {
  return Object.freeze(normalizeRecipeIdList(getRecipeBook(storyState).seenRecipeIds));
}

export function unlockOrganicBusGreenhouseRecipes(storyState = {}) {
  const recipes = listWorldObjectRecipesBySourceObjectId(WORLD_OBJECT_IDS.ORGANIC_BUS)
    .filter((recipe) => recipe.useObjectId === WORLD_OBJECT_IDS.GREENHOUSE);
  const flags = getFlags(storyState);
  const unlockEventId = recipes[0]?.unlockEventId || null;

  if (!recipes.length || !unlockEventId) {
    return {
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.UNKNOWN_RECIPE,
      sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
      unlockedRecipeIds: []
    };
  }

  flags[unlockEventId] = true;
  addKnownRecipeIds(storyState, recipes.map((recipe) => recipe.id));

  return {
    ok: true,
    sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
    unlockedEventId: unlockEventId,
    unlockedRecipeIds: recipes.map((recipe) => recipe.id)
  };
}

export function markWorldObjectRecipesSeenForObject({
  storyState = {},
  useObjectId
} = {}) {
  const recipeIds = listWorldObjectRecipesForUseObjectId(useObjectId)
    .map((recipe) => recipe.id);
  const seenRecipeIds = addSeenRecipeIds(storyState, recipeIds);

  return {
    ok: true,
    useObjectId,
    seenRecipeIds: Object.freeze([...seenRecipeIds])
  };
}

export function createWorldObjectRecipeState({
  storyState = {},
  inventory = {},
  useObjectId
} = {}) {
  const recipes = listWorldObjectRecipesForUseObjectId(useObjectId);

  return Object.freeze({
    useObjectId,
    recipes: Object.freeze(recipes
      .map((recipe) => createRecipeStateEntry(recipe, { inventory, storyState }))
      .filter((entry) => entry.unlocked))
  });
}

export function createGreenhouseRecipeState({
  storyState = {},
  inventory = {}
} = {}) {
  return createWorldObjectRecipeState({
    storyState,
    inventory,
    useObjectId: WORLD_OBJECT_IDS.GREENHOUSE
  });
}

export function craftWorldObjectRecipe({
  recipeId,
  inventory = {},
  storyState = {},
  currentObjectId
} = {}) {
  const recipe = getWorldObjectRecipeById(recipeId);

  if (!recipe) {
    return {
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.UNKNOWN_RECIPE,
      recipeId
    };
  }

  if (!isRecipeUnlocked(recipe, storyState)) {
    return {
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.LOCKED,
      recipeId: recipe.id,
      unlockEventId: recipe.unlockEventId || null
    };
  }

  if (!canUseWorldObjectRecipeAtObject(recipe.id, currentObjectId)) {
    return {
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.WRONG_OBJECT,
      recipeId: recipe.id,
      currentObjectId,
      requiredObjectId: recipe.useObjectId
    };
  }

  if (!hasIngredients(inventory, recipe.ingredients)) {
    return {
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.MISSING_INGREDIENTS,
      recipeId: recipe.id,
      missingIngredients: getMissingIngredients(inventory, recipe.ingredients)
    };
  }

  consumeIngredients(inventory, recipe.ingredients);
  addOutput(inventory, recipe.output);

  return {
    ok: true,
    recipeId: recipe.id,
    currentObjectId,
    consumed: recipe.ingredients,
    output: recipe.output
  };
}
