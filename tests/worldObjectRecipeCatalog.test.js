import { describe, expect, it } from "vitest";
import {
  LEPPA_BERRY_ITEM_ID,
  LEAVES_ITEM_ID,
  NITROGEN_ITEM_ID,
  PHOSPHORUS_ITEM_ID,
  POTASSIUM_ITEM_ID
} from "../gameplayContent.js";
import {
  WORLD_OBJECT_IDS,
  getWorldObjectById
} from "../app/gameplay/worldObjectCatalog.js";
import {
  WORLD_OBJECT_RECIPE_IDS,
  WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE,
  WORLD_OBJECT_RECIPE_TAG,
  WORLD_OBJECT_RECIPE_USE_SCOPE,
  canUseWorldObjectRecipeAtObject,
  getWorldObjectRecipeById,
  listWorldObjectRecipes,
  listWorldObjectRecipesBySourceObjectId,
  listWorldObjectRecipesForUseObjectId,
  validateWorldObjectRecipeCatalog
} from "../app/gameplay/worldObjectRecipeCatalog.js";

describe("world object recipe catalog", () => {
  it("defines Organic Bus recipes as Greenhouse-only recipes", () => {
    const organicBusRecipes = listWorldObjectRecipesBySourceObjectId(WORLD_OBJECT_IDS.ORGANIC_BUS);

    expect(organicBusRecipes.map((recipe) => recipe.id)).toEqual([
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
    ]);
    expect(organicBusRecipes.every((recipe) => (
      recipe.useObjectId === WORLD_OBJECT_IDS.GREENHOUSE &&
      recipe.useScope === WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT
    ))).toBe(true);
    expect(validateWorldObjectRecipeCatalog()).toEqual([]);
  });

  it("keeps the Greenhouse recipe list focused on existing renewable materials", () => {
    expect(listWorldObjectRecipes().map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      output: recipe.output
    }))).toEqual([
      {
        id: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
        title: "Pulse Berry Propagation",
        output: { [LEPPA_BERRY_ITEM_ID]: 2 }
      },
      {
        id: WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
        title: "Blackberry Cuttings",
        output: { blackberry: 3 }
      },
      {
        id: WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
        title: "Rowanberry Cuttings",
        output: { rowanberry: 3 }
      },
      {
        id: WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
        title: "Elderberry Cuttings",
        output: { elderberry: 3 }
      },
      {
        id: WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE,
        title: "Leaf Culture Tray",
        output: { [LEAVES_ITEM_ID]: 3 }
      }
    ]);
  });

  it("uses an Organic Bus emitted event to unlock the Greenhouse recipe", () => {
    const recipe = getWorldObjectRecipeById(WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION);
    const organicBus = getWorldObjectById(WORLD_OBJECT_IDS.ORGANIC_BUS);

    expect(recipe).toMatchObject({
      title: "Pulse Berry Propagation",
      sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
      unlockEventId: "organicBusGreenhouseRecipesReceived",
      useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
      useScope: WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT,
      implementationState: WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE.PLANNED,
      ingredients: {
        [LEPPA_BERRY_ITEM_ID]: 1,
        [NITROGEN_ITEM_ID]: 1,
        [PHOSPHORUS_ITEM_ID]: 1,
        [POTASSIUM_ITEM_ID]: 1
      },
      output: {
        [LEPPA_BERRY_ITEM_ID]: 2
      }
    });
    expect(organicBus.emits).toContain(recipe.unlockEventId);
    expect(recipe.tags).toEqual(expect.arrayContaining([
      WORLD_OBJECT_RECIPE_TAG.ORGANIC_BUS_UNLOCK,
      WORLD_OBJECT_RECIPE_TAG.GREENHOUSE_ONLY,
      WORLD_OBJECT_RECIPE_TAG.CULTIVATION
    ]));
  });

  it("allows the recipe only at the Greenhouse object", () => {
    expect(canUseWorldObjectRecipeAtObject(
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_IDS.GREENHOUSE
    )).toBe(true);
    expect(canUseWorldObjectRecipeAtObject(
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_IDS.ORGANIC_BUS
    )).toBe(false);
    expect(canUseWorldObjectRecipeAtObject(
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_IDS.WORKBENCH
    )).toBe(false);
    expect(listWorldObjectRecipesForUseObjectId(WORLD_OBJECT_IDS.GREENHOUSE).map((recipe) => recipe.id)).toEqual([
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
    ]);
  });

  it("exposes immutable recipe records", () => {
    const recipes = listWorldObjectRecipes();
    const recipe = getWorldObjectRecipeById(WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION);

    expect(Object.isFrozen(recipes)).toBe(true);
    expect(Object.isFrozen(recipe)).toBe(true);
    expect(Object.isFrozen(recipe.ingredients)).toBe(true);
    expect(Object.isFrozen(recipe.output)).toBe(true);
    expect(Object.isFrozen(recipe.tags)).toBe(true);
  });

  it("validates missing ids, unknown objects, malformed scope, and disconnected unlock events", () => {
    expect(validateWorldObjectRecipeCatalog({
      recipes: [
        {
          id: "alpha",
          title: "Alpha",
          sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
          unlockEventId: "missing-event",
          useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
          useScope: WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT,
          implementationState: WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE.PLANNED,
          ingredients: { [LEPPA_BERRY_ITEM_ID]: 1 },
          output: { [LEPPA_BERRY_ITEM_ID]: 1 }
        },
        {
          id: "alpha",
          title: "",
          sourceObjectId: "missing-source",
          useObjectId: "missing-use-object",
          useScope: "anywhere",
          implementationState: "unknown",
          ingredients: {},
          output: {}
        },
        {
          title: "No id"
        }
      ]
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "world-object-recipe-unlock-event-not-emitted", recipeId: "alpha" }),
      expect.objectContaining({ type: "duplicate-world-object-recipe-id", recipeId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-recipe-title", recipeId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-recipe-source", recipeId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-recipe-use-object", recipeId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-recipe-use-scope", recipeId: "alpha" }),
      expect.objectContaining({ type: "unknown-world-object-recipe-implementation-state", recipeId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-recipe-ingredients", recipeId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-recipe-output", recipeId: "alpha" }),
      expect.objectContaining({ type: "missing-world-object-recipe-id", index: 2 })
    ]));
  });
});
