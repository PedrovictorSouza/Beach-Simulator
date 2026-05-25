import { describe, expect, it, vi } from "vitest";
import { createTaskSystem } from "../app/tasks/createTaskSystem.js";
import {
  TASK_EFFECT,
  TASK_EVENT,
  TASK_FACT_IDS,
  TASK_KIND,
  TASK_OBJECTIVE_KIND,
  TASK_STATUS
} from "../app/tasks/taskData.js";

function createSingleTask(overrides = {}) {
  return {
    id: "single-task",
    title: "Single Task",
    description: "A focused task for runtime tests.",
    kind: TASK_KIND.MAIN,
    status: TASK_STATUS.ACTIVE,
    priority: 1,
    chapterId: "test",
    ownerId: "system",
    objectives: [
      {
        id: "complete-single-task",
        title: "Complete single task",
        description: "Complete the required test objective.",
        required: true,
        progress: {
          kind: TASK_OBJECTIVE_KIND.EVENT,
          eventType: TASK_EVENT.TALK,
          targetId: "tester",
          required: 1
        }
      }
    ],
    effects: [],
    nextTaskId: null,
    ...overrides
  };
}

describe("createTaskSystem", () => {
  it("starts from the first active Small Island task and exposes a HUD focus", () => {
    const taskSystem = createTaskSystem();

    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "learn-to-move"
    });
    expect(taskSystem.getActiveFocus()).toMatchObject({
      taskId: "learn-to-move",
      objectiveId: "move-after-crash",
      source: "main",
      required: true
    });
  });

  it("does not advance the campaign from unrelated events", () => {
    const onChange = vi.fn();
    const taskSystem = createTaskSystem({ onChange });

    const result = taskSystem.applyEvent({
      type: TASK_EVENT.TALK,
      targetId: "chopper"
    });

    expect(result.changed).toBe(false);
    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "learn-to-move"
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("completes the first task, applies effects, and activates the next task", () => {
    const onChange = vi.fn();
    const taskSystem = createTaskSystem({ onChange });

    const result = taskSystem.applyEvent({
      type: TASK_EVENT.MOVE,
      targetId: "player"
    });

    expect(result).toMatchObject({
      changed: true,
      completedTaskIds: ["learn-to-move"]
    });
    expect(result.effects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH,
        value: true
      })
    ]));
    expect(taskSystem.getFacts()[TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]).toBe(true);
    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "wake-guide"
    });
    expect(taskSystem.getActiveFocus()).toMatchObject({
      taskId: "wake-guide",
      objectiveId: "talk-to-chopper"
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      reason: "task-completed",
      payload: expect.objectContaining({
        completedTaskIds: ["learn-to-move"]
      })
    }));
  });

  it("increments counter objectives through matching events", () => {
    const tasks = [
      createSingleTask({
        objectives: [
          {
            id: "restore-counter",
            title: "Restore dry grass",
            description: "Restore dry grass through a counter fact.",
            required: true,
            progress: {
              kind: TASK_OBJECTIVE_KIND.COUNTER,
              counterId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
              required: 3
            }
          }
        ]
      })
    ];
    const taskSystem = createTaskSystem({ tasks });

    expect(taskSystem.applyEvent({
      type: TASK_EVENT.RESTORE,
      targetId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
      amount: 2
    })).toMatchObject({
      changed: true,
      completedTaskIds: []
    });
    expect(taskSystem.getActiveFocus()).toMatchObject({
      progressText: "2/3"
    });

    const result = taskSystem.applyEvent({
      type: TASK_EVENT.RESTORE,
      targetId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
      amount: 1
    });

    expect(result.completedTaskIds).toEqual(["single-task"]);
    expect(taskSystem.getFacts()[TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT]).toBe(3);
    expect(taskSystem.getActiveTask()).toBe(null);
  });

  it("applies effects through the same fact/objective completion path", () => {
    const tasks = [
      createSingleTask({
        objectives: [
          {
            id: "set-fact-objective",
            title: "Set fact objective",
            description: "Complete when a fact is set.",
            required: true,
            progress: {
              kind: TASK_OBJECTIVE_KIND.FACT,
              factId: "test.fact.complete"
            }
          }
        ]
      })
    ];
    const taskSystem = createTaskSystem({ tasks });

    const result = taskSystem.applyEffects([
      {
        type: TASK_EFFECT.SET_FACT,
        id: "test.fact.complete",
        value: true
      }
    ]);

    expect(result).toMatchObject({
      changed: true,
      completedTaskIds: ["single-task"]
    });
    expect(taskSystem.getFacts()["test.fact.complete"]).toBe(true);
  });

  it("tracks optional objectives for terminal rendering and fallback focus", () => {
    const tasks = [
      createSingleTask({
        objectives: [
          {
            id: "required-event",
            title: "Required event",
            description: "Complete the required objective first.",
            required: true,
            progress: {
              kind: TASK_OBJECTIVE_KIND.EVENT,
              eventType: TASK_EVENT.TALK,
              targetId: "tester",
              required: 1
            }
          },
          {
            id: "optional-fact",
            title: "Optional fact",
            description: "A tracked optional objective.",
            required: false,
            progress: {
              kind: TASK_OBJECTIVE_KIND.FACT,
              factId: "test.optional"
            }
          }
        ]
      })
    ];
    const taskSystem = createTaskSystem({ tasks });

    expect(taskSystem.trackObjective("optional-fact")).toBe(true);
    expect(taskSystem.getTerminalTaskTree()[0].objectives).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "optional-fact",
        tracked: true
      })
    ]));

    taskSystem.applyEvent({
      type: TASK_EVENT.TALK,
      targetId: "tester"
    });

    expect(taskSystem.getActiveFocus()).toMatchObject({
      objectiveId: "optional-fact",
      source: "tracked"
    });
    expect(taskSystem.untrackObjective("optional-fact")).toBe(true);
  });

  it("resets incompatible saved state versions instead of migrating legacy progress", () => {
    const taskSystem = createTaskSystem({
      initialState: {
        version: 999,
        activeTaskId: "report-base-ready",
        facts: {
          [TASK_FACT_IDS.MVP_CHAPTER_COMPLETE]: true
        }
      }
    });

    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "learn-to-move"
    });
    expect(taskSystem.getFacts()[TASK_FACT_IDS.MVP_CHAPTER_COMPLETE]).toBeUndefined();
  });

  it("restores a saved state after the system has already advanced", () => {
    const taskSystem = createTaskSystem();

    taskSystem.applyEvent({
      type: TASK_EVENT.MOVE,
      targetId: "player"
    });
    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "wake-guide"
    });

    taskSystem.restoreState({
      version: 1,
      activeTaskId: "learn-to-move",
      trackedObjectiveIds: [],
      completedTaskIds: [],
      facts: {},
      taskProgress: {
        "learn-to-move": {
          status: TASK_STATUS.ACTIVE,
          objectives: {
            "move-after-crash": {
              current: 0,
              completed: false,
              visible: true
            }
          }
        }
      }
    });

    expect(taskSystem.getActiveTask()).toMatchObject({
      id: "learn-to-move"
    });
    expect(taskSystem.getFacts()[TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]).toBeUndefined();
  });
});
