import { describe, expect, it } from "vitest";
import {
  GREENHOUSE_ITEM_ID,
  LEAF_DEN_KIT_ITEM_ID,
  STRAW_BED_ITEM_ID
} from "../gameplayContent.js";
import { createWorkbenchRecipeMap } from "../app/gameplay/buildableCatalog.js";
import { GRID_PLACEABLE_IDS } from "../app/gameplay/gridBuildingSystem.js";
import {
  createWorkbenchRecipeOptions,
  WORKBENCH_GREENHOUSE_GUIDANCE,
  WORKBENCH_HOUSE_KIT_BLOCKED_GUIDANCE
} from "../app/gameplay/workbenchModalOptionContract.js";
import {
  getWorkbenchProtocolEntryById,
  listWorkbenchProtocolCategories,
  resolveWorkbenchContainerState,
  WORKBENCH_PROTOCOL_ACTION,
  WORKBENCH_PROTOCOL_BLOCKED_REASON,
  WORKBENCH_PROTOCOL_CATEGORY,
  WORKBENCH_PROTOCOL_CATEGORY_ORDER,
  WORKBENCH_PROTOCOL_STATE,
  WORKBENCH_STATION_GUIDANCE
} from "../app/gameplay/workbenchContainerContract.js";

describe("workbench container contract", () => {
  it("summarizes Workbench protocols in stable buildable order", () => {
    const state = resolveWorkbenchContainerState({
      storyState: { flags: {} },
      inventory: {}
    });

    expect(state.stationId).toBe("workbench");
    expect(state.guidance).toBe(WORKBENCH_STATION_GUIDANCE);
    expect(state.entries.map((entry) => entry.id)).toEqual([
      GRID_PLACEABLE_IDS.GREENHOUSE,
      GRID_PLACEABLE_IDS.TRAIN_HOUSE,
      GRID_PLACEABLE_IDS.SOLAR_STATION,
      GRID_PLACEABLE_IDS.LEAF_DEN
    ]);
    expect(state.categories).toEqual([
      WORKBENCH_PROTOCOL_CATEGORY.SOIL,
      WORKBENCH_PROTOCOL_CATEGORY.POWER,
      WORKBENCH_PROTOCOL_CATEGORY.WATER,
      WORKBENCH_PROTOCOL_CATEGORY.SHELTER
    ]);
    expect(state.categoryOrder).toEqual(WORKBENCH_PROTOCOL_CATEGORY_ORDER);
    expect(state.canIssueAny).toBe(true);
    expect(state.canStartAnyPlacement).toBe(false);
  });

  it("preserves legacy inventory item ids behind Sandbots protocol labels", () => {
    const state = resolveWorkbenchContainerState({
      storyState: { flags: {} },
      inventory: {}
    });

    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.GREENHOUSE)).toMatchObject({
      label: "Greenhouse",
      inventoryItemId: GREENHOUSE_ITEM_ID,
      recipeId: GREENHOUSE_ITEM_ID
    });
    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.TRAIN_HOUSE)).toMatchObject({
      label: "Thermal Cabin",
      inventoryItemId: "campfire",
      recipeId: "campfire"
    });
    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.SOLAR_STATION)).toMatchObject({
      label: "Solar Station",
      inventoryItemId: STRAW_BED_ITEM_ID,
      recipeId: "strawBed"
    });
    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.LEAF_DEN)).toMatchObject({
      label: "House Kit",
      inventoryItemId: LEAF_DEN_KIT_ITEM_ID,
      recipeId: LEAF_DEN_KIT_ITEM_ID,
      status: "Needs colony viability"
    });
  });

  it("declares the canonical Workbench category order before every category has content", () => {
    expect(listWorkbenchProtocolCategories()).toEqual([
      WORKBENCH_PROTOCOL_CATEGORY.POWER,
      WORKBENCH_PROTOCOL_CATEGORY.WATER,
      WORKBENCH_PROTOCOL_CATEGORY.SOIL,
      WORKBENCH_PROTOCOL_CATEGORY.SHELTER,
      WORKBENCH_PROTOCOL_CATEGORY.BOTS,
      WORKBENCH_PROTOCOL_CATEGORY.TOOLS,
      WORKBENCH_PROTOCOL_CATEGORY.MATERIALS
    ]);
    expect(Object.isFrozen(listWorkbenchProtocolCategories())).toBe(true);
  });

  it("keeps the Thermal Cabin locked until the Greenhouse is placed", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true
        }
      },
      inventory: {}
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.TRAIN_HOUSE);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.LOCKED,
      action: WORKBENCH_PROTOCOL_ACTION.NONE,
      canIssue: false,
      canStartPlacement: false,
      status: "Plan unavailable"
    });
  });

  it("allows issuing the Thermal Cabin after the Greenhouse is placed", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true,
          greenhousePlaced: true
        }
      },
      inventory: {}
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.TRAIN_HOUSE);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.CAN_ISSUE,
      action: WORKBENCH_PROTOCOL_ACTION.ISSUE,
      actionLabel: "Prepare Thermal Cabin",
      canIssue: true,
      canStartPlacement: false,
      status: "Ready to prepare",
      guidance: "Prepare this kit here, then place it from your supplies.",
      usesCurrency: false,
      blockedReason: null
    });
  });

  it("keeps Greenhouse issuable after one has already been placed", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true,
          greenhouseCrafted: true,
          greenhousePlaced: true
        }
      },
      inventory: {}
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.GREENHOUSE);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.CAN_ISSUE,
      action: WORKBENCH_PROTOCOL_ACTION.ISSUE,
      actionLabel: "Prepare Greenhouse",
      canIssue: true,
      canStartPlacement: false
    });
  });

  it("keeps owned extra Greenhouses placeable after one has already been placed", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true,
          greenhouseCrafted: true,
          greenhousePlaced: true
        }
      },
      inventory: {
        [GREENHOUSE_ITEM_ID]: 1
      }
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.GREENHOUSE);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.READY_TO_PLACE,
      action: WORKBENCH_PROTOCOL_ACTION.PLACE,
      actionLabel: "Place Greenhouse",
      canIssue: false,
      canStartPlacement: true
    });
  });

  it("switches Solar Station from issue to placement when the item is in the bag", () => {
    const craftable = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          strawBedRecipeUnlocked: true
        }
      },
      inventory: {}
    });
    const readyToPlace = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          strawBedRecipeUnlocked: true,
          strawBedCrafted: true
        }
      },
      inventory: {
        [STRAW_BED_ITEM_ID]: 1
      }
    });

    expect(getWorkbenchProtocolEntryById(craftable, GRID_PLACEABLE_IDS.SOLAR_STATION)).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.CAN_ISSUE,
      actionLabel: "Prepare Solar Station",
      canIssue: true
    });
    expect(getWorkbenchProtocolEntryById(readyToPlace, GRID_PLACEABLE_IDS.SOLAR_STATION)).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.READY_TO_PLACE,
      action: WORKBENCH_PROTOCOL_ACTION.PLACE,
      actionLabel: "Place Solar Station",
      canStartPlacement: true
    });
  });

  it("blocks House Kit placement until Solar Station is placed", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          leafDenBuildAvailable: true
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      }
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.LEAF_DEN);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.READY_TO_PLACE,
      action: WORKBENCH_PROTOCOL_ACTION.NONE,
      actionLabel: null,
      canStartPlacement: false,
      blockedReason: WORKBENCH_PROTOCOL_BLOCKED_REASON.NEEDS_SOLAR_STATION,
      guidance: "Place the Solar Station first. Its blue support zone enables House Kit placement."
    });
  });

  it("allows House Kit placement once Solar Station is ready", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          leafDenBuildAvailable: true,
          strawBedPlacedInBulbasaurHabitat: true
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      }
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.LEAF_DEN);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.READY_TO_PLACE,
      action: WORKBENCH_PROTOCOL_ACTION.PLACE,
      actionLabel: "Place House Kit",
      canStartPlacement: true,
      blockedReason: null,
      guidance: "Prepared. Select it to choose a site in the world."
    });
  });

  it("keeps House Kit issuing currency-free when authorized but not in the bag", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          leafDenBuildAvailable: true
        }
      },
      inventory: {}
    });
    const entry = getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.LEAF_DEN);

    expect(entry).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.CAN_ISSUE,
      action: WORKBENCH_PROTOCOL_ACTION.ISSUE,
      actionLabel: "Prepare House Kit",
      canIssue: true,
      usesCurrency: false,
      blockedReason: null
    });
  });

  it("keeps Terminal issue verbs out of Workbench action labels", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true,
          greenhousePlaced: true,
          strawBedRecipeUnlocked: true,
          leafDenBuildAvailable: true
        }
      },
      inventory: {}
    });

    const actionCopy = state.entries
      .flatMap((entry) => [entry.actionLabel, entry.status])
      .filter(Boolean);

    expect(actionCopy).toEqual([
      "Prepare Greenhouse",
      "Ready to prepare",
      "Prepare Thermal Cabin",
      "Ready to prepare",
      "Prepare Solar Station",
      "Ready to prepare",
      "Prepare House Kit",
      "Ready to prepare"
    ]);
    expect(actionCopy.some((label) => label.toLocaleLowerCase().includes("issue"))).toBe(false);
  });

  it("marks placed and built protocols as unavailable actions", () => {
    const state = resolveWorkbenchContainerState({
      storyState: {
        flags: {
          campfireSpatOut: true,
          strawBedPlacedInBulbasaurHabitat: true,
          leafDenBuilt: true
        }
      },
      inventory: {}
    });

    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.TRAIN_HOUSE)).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.PLACED,
      blockedReason: WORKBENCH_PROTOCOL_BLOCKED_REASON.ALREADY_PLACED,
      action: WORKBENCH_PROTOCOL_ACTION.NONE,
      guidance: "Already placed in the world."
    });
    expect(getWorkbenchProtocolEntryById(state, GRID_PLACEABLE_IDS.LEAF_DEN)).toMatchObject({
      state: WORKBENCH_PROTOCOL_STATE.BUILT,
      blockedReason: WORKBENCH_PROTOCOL_BLOCKED_REASON.ALREADY_BUILT,
      action: WORKBENCH_PROTOCOL_ACTION.NONE,
      guidance: "Already built."
    });
  });

  it("adapts Workbench progress entries into modal recipe options", () => {
    const workbenchRecipes = createWorkbenchRecipeMap();

    const lockedOptions = createWorkbenchRecipeOptions({
      storyState: {
        flags: {
          workbenchDiyRecipesReceived: true
        }
      },
      inventory: {},
      workbenchRecipes,
      formatRequirementSummary: () => "Gear 0/20"
    });

    expect(lockedOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        recipe: expect.objectContaining({ id: GREENHOUSE_ITEM_ID }),
        disabled: false,
        status: null,
        actionLabel: "Prepare Greenhouse",
        guidance: WORKBENCH_GREENHOUSE_GUIDANCE
      }),
      expect.objectContaining({
        recipe: expect.objectContaining({ id: "campfire" }),
        disabled: true,
        status: "Locked · Build Greenhouse first",
        actionLabel: null
      }),
      expect.objectContaining({
        recipe: expect.objectContaining({ id: "strawBed" }),
        disabled: true,
        status: "Locked · Needs Gear 0/20",
        actionLabel: null
      })
    ]));

    const blockedHouseOptions = createWorkbenchRecipeOptions({
      storyState: {
        flags: {
          leafDenBuildAvailable: true
        }
      },
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      },
      workbenchRecipes
    });

    expect(blockedHouseOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        recipe: expect.objectContaining({ id: LEAF_DEN_KIT_ITEM_ID }),
        disabled: true,
        status: "Place the Solar Station before placing the House Kit.",
        actionLabel: null,
        guidance: WORKBENCH_HOUSE_KIT_BLOCKED_GUIDANCE
      })
    ]));
  });
});
