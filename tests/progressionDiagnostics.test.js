import { describe, expect, it } from "vitest";
import {
  createProgressionDiagnostics,
  getProgressionDiagnosticWarningCodes,
  PROGRESSION_DIAGNOSTIC_WARNING,
} from "../app/story/progressionDiagnostics.js";
import { SMALL_ISLAND_QUESTS } from "../app/quest/questData.js";
import { FIELD_TASK_IDS } from "../app/story/storyBeatData.js";
import { WORLD_OBJECT_IDS } from "../app/gameplay/worldObjectCatalog.js";
import {
  WORLD_OBJECT_RECIPE_IDS,
  WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE,
  WORLD_OBJECT_RECIPE_USE_SCOPE
} from "../app/gameplay/worldObjectRecipeCatalog.js";

function getQuest(questId) {
  return SMALL_ISLAND_QUESTS.find((quest) => quest.id === questId);
}

describe("progression diagnostics", () => {
  it("summarizes the current quest, legacy quest, field tasks, and unlocked skills", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("gather-first-supplies"),
      storyState: {
        questIndex: 1,
        flags: {
          trackedTaskIds: [FIELD_TASK_IDS.WATER_DRY_TALL_GRASS],
        },
        restoredGrassCount: 2,
      },
      playerSkills: {
        leafage: false,
        waterGun: true,
      },
      runtimeAbilityCostKinds: {},
    });

    expect(diagnostics.systemQuest).toMatchObject({
      id: "gather-first-supplies",
      title: "Wake up Hydro Bot",
    });
    expect(diagnostics.legacyQuest).toMatchObject({
      id: "findPokemon",
      title: "Find the Stranded Bot",
      index: 1,
    });
    expect(diagnostics.activeFieldTasks).toEqual([
      expect.objectContaining({
        id: FIELD_TASK_IDS.WATER_DRY_TALL_GRASS,
        done: false,
      }),
    ]);
    expect(diagnostics.unlockedSkills).toEqual(["waterGun"]);
  });

  it("reports which field tasks are linked to world object progression events", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("learn-to-move"),
      storyState: { questIndex: 0, flags: {} },
      runtimeAbilityCostKinds: {},
    });

    expect(diagnostics.worldObjectProgression.linkedFieldTaskIds).toEqual(expect.arrayContaining([
      FIELD_TASK_IDS.REVIVE_LEPPA_TREE,
      FIELD_TASK_IDS.BUILD_GREENHOUSE,
    ]));
    expect(diagnostics.worldObjectProgression.unlinkedFieldTaskIds).toEqual(expect.arrayContaining([
      FIELD_TASK_IDS.WATER_DRY_TALL_GRASS,
      FIELD_TASK_IDS.BULBASAUR_DRY_GRASS_REQUEST,
    ]));
    expect(diagnostics.worldObjectProgression.links).toEqual(expect.arrayContaining([
      expect.objectContaining({
        taskId: FIELD_TASK_IDS.REVIVE_LEPPA_TREE,
        eventId: "leppaTreeRevived",
        objectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
      }),
      expect.objectContaining({
        taskId: FIELD_TASK_IDS.BUILD_GREENHOUSE,
        eventId: "greenhousePlaced",
        objectId: WORLD_OBJECT_IDS.GREENHOUSE,
      }),
    ]));
  });

  it("reports planned world object recipes by source and use object", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("learn-to-move"),
      storyState: { questIndex: 0, flags: {} },
      runtimeAbilityCostKinds: {},
    });

    expect(diagnostics.worldObjectRecipes.plannedRecipeIds).toContain(
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION
    );
    expect(diagnostics.worldObjectRecipes.activeRecipeIds).toEqual([]);
    expect(diagnostics.worldObjectRecipes.bySourceObjectId[WORLD_OBJECT_IDS.ORGANIC_BUS]).toEqual([
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
    ]);
    expect(diagnostics.worldObjectRecipes.byUseObjectId[WORLD_OBJECT_IDS.GREENHOUSE]).toEqual([
      WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.BLACKBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ROWANBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.ELDERBERRY_PROPAGATION,
      WORLD_OBJECT_RECIPE_IDS.LEAF_CULTURE
    ]);
    expect(diagnostics.worldObjectRecipes.links).toEqual(expect.arrayContaining([
      expect.objectContaining({
        recipeId: WORLD_OBJECT_RECIPE_IDS.PULSE_BERRY_PROPAGATION,
        sourceObjectId: WORLD_OBJECT_IDS.ORGANIC_BUS,
        useObjectId: WORLD_OBJECT_IDS.GREENHOUSE,
        useScope: WORLD_OBJECT_RECIPE_USE_SCOPE.INSIDE_OBJECT,
        implementationState: WORLD_OBJECT_RECIPE_IMPLEMENTATION_STATE.PLANNED
      })
    ]));
  });

  it("flags parallel Hydro chains and stale Wake Up Hydro copy that no longer matches its objective", () => {
    const hydroQuest = getQuest("gather-first-supplies");
    const staleHydroQuest = {
      ...hydroQuest,
      guidance: "Scan or collect warm wood before the heat signature disappears.",
      errandQuest: {
        ...hydroQuest.errandQuest,
        hudText: "Wake up Hydro Bot: scan warm wood before the heat signature disappears."
      }
    };
    const diagnostics = createProgressionDiagnostics({
      systemQuest: staleHydroQuest,
      storyState: { questIndex: 1, flags: {} },
      playerSkills: {},
      runtimeAbilityCostKinds: {},
    });

    expect(getProgressionDiagnosticWarningCodes(diagnostics)).toEqual(
      expect.arrayContaining([
        PROGRESSION_DIAGNOSTIC_WARNING.PARALLEL_HYDRO_QUESTS,
        PROGRESSION_DIAGNOSTIC_WARNING.QUEST_COPY_ACTION_MISMATCH,
      ]),
    );
  });

  it("flags stale Wake Up Hydro copy when the mismatch only appears in errand HUD text", () => {
    const hydroQuest = getQuest("gather-first-supplies");
    const staleHydroQuest = {
      ...hydroQuest,
      guidance: "Follow Chopper's marker to Hydro Bot, then interact when the prompt appears.",
      errandQuest: {
        ...hydroQuest.errandQuest,
        hudText: "Wake up Hydro Bot: scan warm wood before the heat signature disappears."
      }
    };
    const diagnostics = createProgressionDiagnostics({
      systemQuest: staleHydroQuest,
      storyState: { questIndex: 0, flags: {} },
      playerSkills: {},
      runtimeAbilityCostKinds: {},
    });

    expect(getProgressionDiagnosticWarningCodes(diagnostics)).toContain(
      PROGRESSION_DIAGNOSTIC_WARNING.QUEST_COPY_ACTION_MISMATCH,
    );
  });

  it("flags Wake Up Hydro if Water Gun is already unlocked", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("gather-first-supplies"),
      storyState: { questIndex: 0, flags: {} },
      playerSkills: { waterGun: true },
      runtimeAbilityCostKinds: {},
    });

    expect(getProgressionDiagnosticWarningCodes(diagnostics)).toContain(
      PROGRESSION_DIAGNOSTIC_WARNING.WATERGUN_UNLOCKED_HYDRO_ACTIVE,
    );
  });

  it("flags detached quests when they become active", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: {
        ...getQuest("water-first-dry-patch"),
        detached: true
      },
      storyState: { questIndex: 0, flags: {} },
      playerSkills: {},
      runtimeAbilityCostKinds: {},
    });

    expect(getProgressionDiagnosticWarningCodes(diagnostics)).toContain(
      PROGRESSION_DIAGNOSTIC_WARNING.DETACHED_SYSTEM_QUEST_ACTIVE,
    );
  });

  it("flags dry grass tracking when the same beat is active in quest and field-task layers", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("water-dry-grass"),
      storyState: {
        questIndex: 0,
        flags: {
          trackedTaskIds: [FIELD_TASK_IDS.WATER_DRY_TALL_GRASS],
        },
        restoredGrassCount: 4,
      },
      playerSkills: {},
      runtimeAbilityCostKinds: {},
    });

    expect(getProgressionDiagnosticWarningCodes(diagnostics)).toContain(
      PROGRESSION_DIAGNOSTIC_WARNING.DUPLICATE_DRY_GRASS_TRACKING,
    );
  });

  it("flags field ability costs that exist in data but are not used by runtime behavior", () => {
    const diagnostics = createProgressionDiagnostics({
      systemQuest: getQuest("learn-to-move"),
      storyState: { questIndex: 0, flags: {} },
      playerSkills: {},
    });

    expect(diagnostics.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: PROGRESSION_DIAGNOSTIC_WARNING.FIELD_ABILITY_COST_DISCONNECTED,
          details: expect.objectContaining({
            abilityId: "leafage",
            declaredKind: "materialBundle",
            runtimeKind: "none",
          }),
        }),
        expect.objectContaining({
          code: PROGRESSION_DIAGNOSTIC_WARNING.FIELD_ABILITY_COST_DISCONNECTED,
          details: expect.objectContaining({
            abilityId: "waterGun",
            declaredKind: "materialBundle",
            runtimeKind: "stamina",
          }),
        }),
      ]),
    );
    expect(
      diagnostics.warnings.some(
        (warning) =>
          warning.code === PROGRESSION_DIAGNOSTIC_WARNING.FIELD_ABILITY_COST_DISCONNECTED &&
          warning.details.abilityId === "fire",
      ),
    ).toBe(false);
  });
});
