import { describe, expect, it } from "vitest";
import {
  CREATURE_SPECIALTY,
  GEAR_ITEM_ID,
  GREENHOUSE_ITEM_ID,
  LEAF_DEN_KIT_ITEM_ID,
  LEAVES_ITEM_ID
} from "../gameplayContent.js";
import {
  BUILDABLE_SOURCE_TYPES,
  createWorkbenchRecipeMap,
  getWorkbenchBuildableById,
  getWorkbenchBuildableByInventoryItemId,
  listWorkbenchBuildables
} from "../app/gameplay/buildableCatalog.js";
import {
  GRID_BUILD_CATEGORIES,
  GRID_PLACEABLE_IDS,
  GRID_PLACEMENT_TYPES
} from "../app/gameplay/gridBuildingSystem.js";

describe("buildable catalog", () => {
  it("exposes the current Workbench buildables in one stable order", () => {
    expect(listWorkbenchBuildables().map((buildable) => buildable.id)).toEqual([
      GRID_PLACEABLE_IDS.GREENHOUSE,
      GRID_PLACEABLE_IDS.TRAIN_HOUSE,
      GRID_PLACEABLE_IDS.SOLAR_STATION,
      GRID_PLACEABLE_IDS.LEAF_DEN
    ]);
  });

  it("normalizes recipe buildables with inventory, grid, and ingredient data", () => {
    expect(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.GREENHOUSE)).toMatchObject({
      id: GRID_PLACEABLE_IDS.GREENHOUSE,
      label: "Greenhouse",
      group: GRID_BUILD_CATEGORIES.WORKBENCH,
      sourceType: BUILDABLE_SOURCE_TYPES.RECIPE,
      sourceId: GREENHOUSE_ITEM_ID,
      sourceItemId: GREENHOUSE_ITEM_ID,
      inventoryItemId: GREENHOUSE_ITEM_ID,
      recipeId: GREENHOUSE_ITEM_ID,
      ingredients: { [GEAR_ITEM_ID]: 5 },
      output: { [GREENHOUSE_ITEM_ID]: 1 },
      gridPlaceableId: GRID_PLACEABLE_IDS.GREENHOUSE,
      prefabKey: "greenhouseModel",
      footprint: { width: 5, height: 3 },
      placementType: GRID_PLACEMENT_TYPES.OBJECT,
      buildCategory: GRID_BUILD_CATEGORIES.WORKBENCH
    });

    expect(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.TRAIN_HOUSE)).toMatchObject({
      id: GRID_PLACEABLE_IDS.TRAIN_HOUSE,
      label: "Thermal Cabin",
      group: GRID_BUILD_CATEGORIES.WORKBENCH,
      sourceType: BUILDABLE_SOURCE_TYPES.RECIPE,
      sourceId: "campfire",
      sourceItemId: "campfire",
      inventoryItemId: "campfire",
      recipeId: "campfire",
      ingredients: { [GEAR_ITEM_ID]: 10 },
      output: { campfire: 1 },
      gridPlaceableId: GRID_PLACEABLE_IDS.TRAIN_HOUSE,
      prefabKey: "trainHouseModel",
      footprint: { width: 3, height: 3 },
      placementType: GRID_PLACEMENT_TYPES.OBJECT,
      buildCategory: GRID_BUILD_CATEGORIES.WORKBENCH
    });

    expect(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.SOLAR_STATION)).toMatchObject({
      id: GRID_PLACEABLE_IDS.SOLAR_STATION,
      label: "Solar Station",
      sourceType: BUILDABLE_SOURCE_TYPES.RECIPE,
      sourceId: "strawBed",
      sourceItemId: "strawBed",
      inventoryItemId: "strawBed",
      ingredients: { [GEAR_ITEM_ID]: 20 },
      gridPlaceableId: GRID_PLACEABLE_IDS.SOLAR_STATION,
      prefabKey: "solarStationModel",
      footprint: { width: 4, height: 4 }
    });
  });

  it("normalizes House as a building kit while preserving leafDen internal ids", () => {
    expect(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.LEAF_DEN)).toMatchObject({
      id: GRID_PLACEABLE_IDS.LEAF_DEN,
      label: "House Kit",
      sourceType: BUILDABLE_SOURCE_TYPES.BUILDING_KIT,
      sourceId: LEAF_DEN_KIT_ITEM_ID,
      sourceItemId: LEAF_DEN_KIT_ITEM_ID,
      inventoryItemId: LEAF_DEN_KIT_ITEM_ID,
      buildingKitId: LEAF_DEN_KIT_ITEM_ID,
      gridPlaceableId: GRID_PLACEABLE_IDS.LEAF_DEN_KIT,
      completedGridPlaceableId: GRID_PLACEABLE_IDS.LEAF_DEN,
      prefabKey: "leafDenKit",
      completedPrefabKey: "leafDenModel",
      footprint: { width: 3, height: 3 },
      completedFootprint: { width: 3, height: 3 },
      placementType: GRID_PLACEMENT_TYPES.BUILDING_KIT,
      buildCategory: GRID_BUILD_CATEGORIES.BUILDING_KIT,
      requiredMaterials: [
        { itemId: "wood", quantity: 3 },
        { itemId: LEAVES_ITEM_ID, quantity: 3 }
      ],
      requiredSpecialties: [
        CREATURE_SPECIALTY.BUILD,
        CREATURE_SPECIALTY.BURN
      ],
      buildDurationSeconds: 15,
      minFurnitureRequired: 3,
      validPlacementRules: ["unoccupied-ground"]
    });
    expect(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.LEAF_DEN).workbenchRecipe).toMatchObject({
      id: LEAF_DEN_KIT_ITEM_ID,
      title: "House",
      stationId: "workbench",
      ingredients: {},
      output: { [LEAF_DEN_KIT_ITEM_ID]: 1 }
    });
  });

  it("looks up buildables by inventory item id", () => {
    expect(getWorkbenchBuildableByInventoryItemId(GREENHOUSE_ITEM_ID)?.id).toBe(GRID_PLACEABLE_IDS.GREENHOUSE);
    expect(getWorkbenchBuildableByInventoryItemId("campfire")?.id).toBe(GRID_PLACEABLE_IDS.TRAIN_HOUSE);
    expect(getWorkbenchBuildableByInventoryItemId("strawBed")?.id).toBe(GRID_PLACEABLE_IDS.SOLAR_STATION);
    expect(getWorkbenchBuildableByInventoryItemId(LEAF_DEN_KIT_ITEM_ID)?.id).toBe(GRID_PLACEABLE_IDS.LEAF_DEN);
    expect(getWorkbenchBuildableByInventoryItemId("missing")).toBeNull();
  });

  it("returns immutable catalog records", () => {
    const buildables = listWorkbenchBuildables();

    expect(Object.isFrozen(buildables)).toBe(true);
    expect(Object.isFrozen(buildables[0])).toBe(true);
    expect(Object.isFrozen(buildables[0].ingredients)).toBe(true);
    expect(Object.isFrozen(buildables[0].footprint)).toBe(true);
    expect(Object.isFrozen(getWorkbenchBuildableById(GRID_PLACEABLE_IDS.LEAF_DEN).requiredMaterials)).toBe(true);
  });

  it("creates a Workbench recipe map that includes the House Kit issue recipe", () => {
    const recipes = createWorkbenchRecipeMap();

    expect(recipes[GREENHOUSE_ITEM_ID]).toMatchObject({
      id: GREENHOUSE_ITEM_ID,
      title: "Greenhouse",
      ingredients: { [GEAR_ITEM_ID]: 5 },
      output: { [GREENHOUSE_ITEM_ID]: 1 }
    });
    expect(recipes.campfire).toMatchObject({
      id: "campfire",
      title: "Thermal Cabin",
      ingredients: { [GEAR_ITEM_ID]: 10 },
      output: { campfire: 1 }
    });
    expect(recipes.strawBed).toMatchObject({
      id: "strawBed",
      title: "Solar Station",
      ingredients: { [GEAR_ITEM_ID]: 20 },
      output: { strawBed: 1 }
    });
    expect(recipes[LEAF_DEN_KIT_ITEM_ID]).toMatchObject({
      id: LEAF_DEN_KIT_ITEM_ID,
      title: "House",
      ingredients: {},
      output: { [LEAF_DEN_KIT_ITEM_ID]: 1 }
    });
    expect(Object.isFrozen(recipes)).toBe(true);
    expect(Object.isFrozen(recipes[LEAF_DEN_KIT_ITEM_ID].ingredients)).toBe(true);
  });
});
