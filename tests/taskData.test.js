import { describe, expect, it } from "vitest";
import {
  getSmallIslandTaskById,
  listSmallIslandTasks,
  TASK_EFFECT,
  TASK_EVENT,
  TASK_KIND,
  TASK_OBJECTIVE_KIND,
  TASK_STATUS
} from "../app/tasks/taskData.js";

const EXPECTED_MAIN_TASK_IDS = [
  "learn-to-move",
  "wake-guide",
  "wake-hydro",
  "restore-first-patch",
  "restore-dry-grass",
  "meet-grow",
  "grow-first-habitat",
  "clear-white-ground",
  "unlock-colony-terminal",
  "build-first-base",
  "report-base-ready"
];

const EXPECTED_LEGACY_FIELD_TASK_IDS = [
  "making-habitats",
  "bulbasaur-dry-grass-request",
  "revive-leppa-tree",
  "water-dry-tall-grass",
  "bulbasaur-leafage-reward",
  "bulbasaur-green-corner-play-seed",
  "give-leppa-berry",
  "tangrowth-log-chair",
  "build-greenhouse",
  "workbench-campfire",
  "spit-out-campfire",
  "charmander-tall-grass",
  "ruined-pokemon-center",
  "boulder-shaded-tall-grass",
  "bulbasaur-straw-bed",
  "straw-bed-recipe",
  "new-challenges-in-pc",
  "leaf-den-kit",
  "build-leaf-den",
  "leaf-den-furniture",
  "charmander-celebration",
  "ditto-flag-house"
];

function getAllObjectives() {
  return listSmallIslandTasks().flatMap((task) => (
    task.objectives.map((objective) => ({
      task,
      objective
    }))
  ));
}

describe("taskData", () => {
  it("defines the main restoration task chain without depending on legacy quest runtime", () => {
    const tasks = listSmallIslandTasks();

    expect(tasks.map((task) => task.id)).toEqual(EXPECTED_MAIN_TASK_IDS);
    expect(tasks[0]).toMatchObject({
      id: "learn-to-move",
      kind: TASK_KIND.MAIN,
      status: TASK_STATUS.ACTIVE,
      nextTaskId: "wake-guide"
    });
    expect(tasks.at(-1)).toMatchObject({
      id: "report-base-ready",
      nextTaskId: null
    });
  });

  it("keeps task ids unique and the nextTaskId chain reachable", () => {
    const tasks = listSmallIslandTasks();
    const taskIds = tasks.map((task) => task.id);
    const uniqueTaskIds = new Set(taskIds);

    expect(uniqueTaskIds.size).toBe(taskIds.length);

    let currentTaskId = tasks[0].id;
    const visited = [];
    while (currentTaskId) {
      expect(visited).not.toContain(currentTaskId);
      visited.push(currentTaskId);
      currentTaskId = getSmallIslandTaskById(currentTaskId)?.nextTaskId || null;
    }

    expect(visited).toEqual(EXPECTED_MAIN_TASK_IDS);
  });

  it("configures the Chopper talk task as title-only in the HUD", () => {
    const task = getSmallIslandTaskById("wake-guide");
    const objective = task.objectives.find((entry) => entry.id === "talk-to-chopper");

    expect(objective).toMatchObject({
      hudDisplayMode: "title-only",
      hudIllustration: {
        imageId: "chopper-selfie",
        alt: "Chopper",
        width: 100,
        height: 100
      }
    });
  });

  it("configures the first dry patch task with the Hydro Jet HUD image", () => {
    const task = getSmallIslandTaskById("restore-first-patch");
    const objective = task.objectives.find((entry) => entry.id === "restore-one-dry-patch");

    expect(objective).toMatchObject({
      hudIllustration: {
        imageId: "hydro-jet-tutorial",
        alt: "Hydro Jet tutorial",
        width: 384,
        height: 216,
        showInChecklist: false
      }
    });
  });

  it("keeps every task player-facing and backed by at least one required objective", () => {
    for (const task of listSmallIslandTasks()) {
      expect(task.title).toEqual(expect.any(String));
      expect(task.title.trim().length).toBeGreaterThan(0);
      expect(task.description).toEqual(expect.any(String));
      expect(task.description.trim().length).toBeGreaterThan(0);
      expect(task.kind).toBe(TASK_KIND.MAIN);
      expect(Object.values(TASK_STATUS)).toContain(task.status);
      expect(task.objectives.some((objective) => objective.required === true)).toBe(true);
    }
  });

  it("uses valid objective progress contracts", () => {
    for (const { objective } of getAllObjectives()) {
      expect(objective.id).toEqual(expect.any(String));
      expect(objective.title.trim().length).toBeGreaterThan(0);
      expect(objective.description.trim().length).toBeGreaterThan(0);
      expect(typeof objective.required).toBe("boolean");
      expect(Object.values(TASK_OBJECTIVE_KIND)).toContain(objective.progress.kind);

      if (objective.progress.kind === TASK_OBJECTIVE_KIND.EVENT) {
        expect(Object.values(TASK_EVENT)).toContain(objective.progress.eventType);
        expect(objective.progress.targetId).toEqual(expect.any(String));
      }

      if (objective.progress.kind === TASK_OBJECTIVE_KIND.FACT) {
        expect(objective.progress.factId).toEqual(expect.any(String));
      }

      if (objective.progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
        expect(objective.progress.counterId).toEqual(expect.any(String));
        expect(objective.progress.required).toBeGreaterThan(0);
      }
    }
  });

  it("maps every current field task into a secondary or required objective for migration", () => {
    const legacyFieldTaskIds = getAllObjectives()
      .map(({ objective }) => objective.legacyFieldTaskId)
      .filter(Boolean)
      .sort();

    expect(legacyFieldTaskIds).toEqual([...EXPECTED_LEGACY_FIELD_TASK_IDS].sort());
  });

  it("uses valid effects and stores terminal progress as part of the task chain", () => {
    const validEffectTypes = Object.values(TASK_EFFECT);

    for (const task of listSmallIslandTasks()) {
      for (const effect of task.effects || []) {
        expect(validEffectTypes).toContain(effect.type);
      }
    }

    expect(getSmallIslandTaskById("unlock-colony-terminal")).toMatchObject({
      ownerId: "terminal",
      effects: expect.arrayContaining([
        expect.objectContaining({
          type: TASK_EFFECT.OPEN_TERMINAL
        })
      ])
    });
  });

  it("exposes immutable catalog data", () => {
    const tasks = listSmallIslandTasks();

    expect(Object.isFrozen(tasks)).toBe(true);
    expect(Object.isFrozen(tasks[0])).toBe(true);
    expect(Object.isFrozen(tasks[0].objectives)).toBe(true);
    expect(Object.isFrozen(tasks[0].objectives[0])).toBe(true);
    expect(Object.isFrozen(tasks[0].effects)).toBe(true);
  });
});
