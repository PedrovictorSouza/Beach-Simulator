import { describe, expect, it } from "vitest";
import {
  LEPPA_BERRY_ITEM_ID,
  LEAVES_ITEM_ID,
  NITROGEN_ITEM_ID,
  PHOSPHORUS_ITEM_ID,
  POTASSIUM_ITEM_ID
} from "../gameplayContent.js";
import { WORLD_OBJECT_IDS } from "../app/gameplay/worldObjectCatalog.js";
import { WORLD_OBJECT_RECIPE_IDS } from "../app/gameplay/worldObjectRecipeCatalog.js";
import {
  WORLD_OBJECT_RECIPE_CRAFT_REASON,
  craftWorldObjectRecipe,
  createGreenhouseRecipeState,
  createWorldObjectRecipeState,
  unlockOrganicBusGreenhouseRecipes
} from "../app/gameplay/worldObjectRecipeRuntime.js";

function createReadyInventory() {
  return {
    [LEPPA_BERRY_ITEM_ID]: 1,
    [NITROGEN_ITEM_ID]: 1,
    [PHOSPHORUS_ITEM_ID]: 1,
    [POTASSIUM_ITEM_ID]: 1
  };
}

describe("world object recipe runtime", () => {
  it("unlocks Organic Bus recipes for Greenhouse use", () => {
    const storyState = { flags: {} };

    expect(unlockOrganicBusGreenhouseRecipes(storyState)).toEqual({
      ok: true,
      sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
      unlockedEventId: "organicBusGreenhouseRecipesReceived",
      unlockedRecipeIds: [
        WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
        WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
        WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
        WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
        WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
      ]
    });
    expect(storyState.flags.organicBusGreenhouseRecipesReceived).toBe(true);
  });

  it("lists unlocked recipes only when inspecting the Greenhouse recipe state", () => {
    const inventory = createReadyInventory();

    expect(createGreenhouseRecipeState({
      storyState: { flags: {} },
      inventory
    })).toEqual({
      useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
      recipes: []
    });

    const unlockedState = createGreenhouseRecipeState({
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      inventory
    });

    expect(unlockedState.recipes.map((recipe) => recipe.recipeId)).toEqual([
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
    ]);
    expect(unlockedState.recipes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
        sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
        useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
        unlocked: true,
        canCraft: true,
        missingIngredients: []
      })
    ]));
    expect(Object.isFrozen(unlockedState)).toBe(true);
    expect(Object.isFrozen(unlockedState.recipes)).toBe(true);
  });

  it("lists the full Organic Bus Greenhouse recipe set after unlock", () => {
    const state = createGreenhouseRecipeState({
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      inventory: {
        [LEPPA_BERRY_ITEM_ID]: 1,
        blackberry: 1,
        rowanberry: 1,
        elderberry: 1,
        [LEAVES_ITEM_ID]: 1,
        [NITROGEN_ITEM_ID]: 5,
        [PHOSPHORUS_ITEM_ID]: 5,
        [POTASSIUM_ITEM_ID]: 5
      }
    });

    expect(state.recipes).toEqual([
      expect.objectContaining({ recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION, canCraft: true }),
      expect.objectContaining({ recipeId: WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION, canCraft: true }),
      expect.objectContaining({ recipeId: WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION, canCraft: true }),
      expect.objectContaining({ recipeId: WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION, canCraft: true }),
      expect.objectContaining({ recipeId: WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE, canCraft: true })
    ]);
  });

  it("does not show the Greenhouse-only recipe on other world objects", () => {
    const storyState = { flags: { organicBusGreenhouseRecipesReceived: true } };
    const inventory = createReadyInventory();

    expect(createWorldObjectRecipeState({
      storyState,
      inventory,
      useObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS
    }).recipes).toEqual([]);
    expect(createWorldObjectRecipeState({
      storyState,
      inventory,
      useObjectId: WORLD_OBJECT_IDS.WORKBENCH
    }).recipes).toEqual([]);
  });

  it("reports missing ingredients before crafting", () => {
    const state = createGreenhouseRecipeState({
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      inventory: {
        [LEPPA_BERRY_ITEM_ID]: 1,
        [NITROGEN_ITEM_ID]: 0,
        [PHOSPHORUS_ITEM_ID]: 1
      }
    });

    expect(state.recipes[0]).toMatchObject({
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      canCraft: false,
      missingIngredients: [
        { itemId: NITROGEN_ITEM_ID, current: 0, required: 1, missing: 1 },
        { itemId: POTASSIUM_ITEM_ID, current: 0, required: 1, missing: 1 }
      ]
    });
  });

  it("refuses locked, wrong-object, and underfunded crafts", () => {
    expect(craftWorldObjectRecipe({
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      inventory: createReadyInventory(),
      storyState: { flags: {} },
      currentObjectId: WORLD_OBJECT_IDS.GREENHOUSE
    })).toMatchObject({
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.LOCKED
    });

    expect(craftWorldObjectRecipe({
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      inventory: createReadyInventory(),
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      currentObjectId: WORLD_OBJECT_IDS.WORKBENCH
    })).toMatchObject({
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.WRONG_OBJECT,
      requiredObjectId: WORLD_OBJECT_IDS.GREENHOUSE
    });

    expect(craftWorldObjectRecipe({
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      inventory: { [LEPPA_BERRY_ITEM_ID]: 1 },
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      currentObjectId: WORLD_OBJECT_IDS.GREENHOUSE
    })).toMatchObject({
      ok: false,
      reason: WORLD_OBJECT_RECIPE_CRAFT_REASON.MISSING_INGREDIENTS,
      missingIngredients: expect.arrayContaining([
        expect.objectContaining({ itemId: NITROGEN_ITEM_ID }),
        expect.objectContaining({ itemId: PHOSPHORUS_ITEM_ID }),
        expect.objectContaining({ itemId: POTASSIUM_ITEM_ID })
      ])
    });
  });

  it("crafts a Greenhouse-only recipe by consuming inputs and adding output", () => {
    const inventory = createReadyInventory();
    const result = craftWorldObjectRecipe({
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      inventory,
      storyState: { flags: { organicBusGreenhouseRecipesReceived: true } },
      currentObjectId: WORLD_OBJECT_IDS.GREENHOUSE
    });

    expect(result).toMatchObject({
      ok: true,
      recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      currentObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
      output: { [LEPPA_BERRY_ITEM_ID]: 2 }
    });
    expect(inventory).toEqual({
      [LEPPA_BERRY_ITEM_ID]: 2,
      [NITROGEN_ITEM_ID]: 0,
      [PHOSPHORUS_ITEM_ID]: 0,
      [POTASSIUM_ITEM_ID]: 0
    });
  });
});
