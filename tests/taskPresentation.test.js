import { describe, expect, it } from "vitest";
import { createTaskSystem } from "../app/tasks/createTaskSystem.js";
import {
  createTaskHudView,
  createTaskTerminalEntries,
  getTaskTerminalEntryByTaskId,
  TASK_PRESENTATION_SOURCE
} from "../app/tasks/taskPresentation.js";
import {
  TASK_EVENT,
  TASK_KIND,
  TASK_OBJECTIVE_KIND,
  TASK_STATUS
} from "../app/tasks/taskData.js";

describe("taskPresentation", () => {
  it("creates a HUD view from the active task focus", () => {
    const taskSystem = createTaskSystem();
    const hudView = createTaskHudView(taskSystem);

    expect(hudView).toMatchObject({
      active: true,
      taskId: "learn-to-move",
      objectiveId: "move-after-crash",
      taskTitle: "Take Your First Steps",
      title: "Move away from the crash site",
      source: "main"
    });
    expect(hudView.objectives).toEqual([
      expect.objectContaining({
        id: "move-after-crash",
        required: true,
        completed: false,
        progressText: "0/1"
      })
    ]);
  });

  it("returns an inactive HUD view when no focus exists", () => {
    const taskSystem = createTaskSystem({
      tasks: []
    });

    expect(createTaskHudView(taskSystem)).toEqual({
      active: false,
      taskId: null,
      objectiveId: null,
      taskTitle: "",
      title: "",
      description: "",
      progressText: "",
      source: "none",
      objectives: []
    });
  });

  it("creates terminal entries matching the existing terminal mission shape", () => {
    const taskSystem = createTaskSystem();
    const entries = createTaskTerminalEntries(taskSystem);

    expect(entries[0]).toMatchObject({
      id: "task:learn-to-move",
      taskId: "learn-to-move",
      source: TASK_PRESENTATION_SOURCE.MAIN,
      status: TASK_STATUS.ACTIVE,
      active: true,
      completed: false,
      title: "Take Your First Steps",
      progress: "0/1 objectives"
    });
    expect(entries[0].objectives[0]).toMatchObject({
      id: "move-after-crash",
      taskId: "learn-to-move",
      required: true,
      completed: false
    });
  });

  it("masks locked terminal entries until task data is recovered", () => {
    const taskSystem = createTaskSystem();
    const wakeHydroEntry = getTaskTerminalEntryByTaskId(taskSystem, "wake-hydro");

    expect(wakeHydroEntry).toMatchObject({
      status: TASK_STATUS.LOCKED,
      title: "????",
      description: "Check data has not been recovered yet.",
      progress: "",
      objectives: []
    });
  });

  it("updates terminal progress after task events complete objectives", () => {
    const taskSystem = createTaskSystem();

    taskSystem.applyEvent({
      type: TASK_EVENT.MOVE,
      targetId: "player"
    });

    expect(getTaskTerminalEntryByTaskId(taskSystem, "learn-to-move")).toMatchObject({
      status: TASK_STATUS.COMPLETED,
      completed: true,
      progress: "1/1 objectives"
    });
    expect(getTaskTerminalEntryByTaskId(taskSystem, "wake-guide")).toMatchObject({
      status: TASK_STATUS.ACTIVE,
      active: true,
      progress: "0/1 objectives"
    });

    expect(createTaskHudView(taskSystem)).toMatchObject({
      taskId: "wake-guide",
      objectiveId: "talk-to-chopper",
      hudDisplayMode: "title-only",
      hudIllustration: {
        imageId: "chopper-selfie",
        alt: "Chopper",
        width: 100,
        height: 100
      },
      objectives: []
    });
  });

  it("keeps main focus ahead of tracked optional objectives while exposing tracking in terminal data", () => {
    const taskSystem = createTaskSystem();

    taskSystem.applyEvent({
      type: TASK_EVENT.MOVE,
      targetId: "player"
    });
    taskSystem.trackObjective("set-up-log-chair");
    taskSystem.applyEvent({
      type: TASK_EVENT.TALK,
      targetId: "chopper"
    });

    const hudView = createTaskHudView(taskSystem);
    const terminalEntry = getTaskTerminalEntryByTaskId(taskSystem, "wake-guide");

    expect(hudView).toMatchObject({
      objectiveId: "wake-hydro-bot",
      source: "main"
    });
    expect(terminalEntry.objectives).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "set-up-log-chair",
        tracked: true,
        required: false
      })
    ]));
  });

  it("uses tracked optional objectives as HUD fallback when no main task is active", () => {
    const taskSystem = createTaskSystem({
      tasks: [
        {
          id: "single-task",
          title: "Single Task",
          description: "A task with one required and one optional objective.",
          kind: TASK_KIND.MAIN,
          status: TASK_STATUS.ACTIVE,
          priority: 1,
          chapterId: "test",
          ownerId: "system",
          objectives: [
            {
              id: "required-event",
              title: "Required event",
              description: "Complete the required event.",
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
              description: "Track this optional objective after the main task completes.",
              required: false,
              progress: {
                kind: TASK_OBJECTIVE_KIND.FACT,
                factId: "test.optional"
              }
            }
          ],
          effects: [],
          nextTaskId: null
        }
      ]
    });

    taskSystem.trackObjective("optional-fact");
    taskSystem.applyEvent({
      type: TASK_EVENT.TALK,
      targetId: "tester"
    });

    expect(createTaskHudView(taskSystem)).toMatchObject({
      objectiveId: "optional-fact",
      source: "tracked"
    });
  });
});
