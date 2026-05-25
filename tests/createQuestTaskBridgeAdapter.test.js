import { describe, expect, it, vi } from "vitest";
import { createQuestTaskBridgeAdapter } from "../app/tasks/createQuestTaskBridgeAdapter.js";
import {
  TASK_EVENT,
  TASK_FACT_IDS
} from "../app/tasks/taskData.js";

function createLegacyQuestSystem() {
  return {
    activateQuest: vi.fn(),
    emit: vi.fn(() => ({
      changed: true,
      completedQuestIds: ["legacy-quest"]
    })),
    getActiveQuest: vi.fn(() => ({ id: "legacy-active" })),
    getQuest: vi.fn(),
    getQuestLog: vi.fn(() => []),
    getState: vi.fn(() => ({ activeQuestId: "legacy-active" })),
    hasUnlocked: vi.fn(() => false),
    reset: vi.fn(() => true)
  };
}

describe("createQuestTaskBridgeAdapter", () => {
  it("preserves the legacy quest API while recording task progress", () => {
    const legacyQuestSystem = createLegacyQuestSystem();
    const questSystem = createQuestTaskBridgeAdapter({
      questSystem: legacyQuestSystem
    });

    const result = questSystem.emit({
      type: "MOVE",
      targetId: "player"
    });

    expect(legacyQuestSystem.emit).toHaveBeenCalledWith({
      type: "MOVE",
      targetId: "player"
    });
    expect(result).toMatchObject({
      changed: true,
      completedQuestIds: ["legacy-quest"],
      taskResult: {
        changed: true,
        completedTaskIds: ["learn-to-move"],
        normalizedEvent: {
          type: TASK_EVENT.MOVE,
          targetId: "player"
        }
      }
    });
    expect(questSystem.getActiveQuest()).toEqual({ id: "legacy-active" });
    expect(questSystem.getActiveTask()).toMatchObject({
      id: "wake-guide"
    });
    expect(questSystem.getTaskHudView()).toMatchObject({
      taskId: "wake-guide",
      objectiveId: "talk-to-chopper"
    });
    expect(questSystem.hasTaskFact(TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH)).toBe(true);
    expect(questSystem.getTaskFact(TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH)).toBe(true);
  });

  it("keeps legacy state as the default save state and exposes task state separately", () => {
    const legacyQuestSystem = createLegacyQuestSystem();
    const questSystem = createQuestTaskBridgeAdapter({
      questSystem: legacyQuestSystem
    });

    questSystem.emit({
      type: "MOVE",
      targetId: "player"
    });

    expect(questSystem.getState()).toEqual({ activeQuestId: "legacy-active" });
    expect(questSystem.getTaskState()).toMatchObject({
      completedTaskIds: ["learn-to-move"],
      facts: {
        [TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]: true
      }
    });
  });

  it("restores the task state separately from the legacy quest state", () => {
    const legacyQuestSystem = createLegacyQuestSystem();
    const questSystem = createQuestTaskBridgeAdapter({
      questSystem: legacyQuestSystem,
      initialTaskState: {
        version: 1,
        activeTaskId: "wake-guide",
        trackedObjectiveIds: [],
        completedTaskIds: ["learn-to-move"],
        facts: {
          [TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]: true
        },
        taskProgress: {
          "learn-to-move": {
            status: "completed",
            objectives: {
              "move-after-crash": {
                current: 1,
                completed: true,
                visible: true
              }
            }
          },
          "wake-guide": {
            status: "active",
            objectives: {
              "talk-to-chopper": {
                current: 0,
                completed: false,
                visible: true
              },
              "set-up-log-chair": {
                current: 0,
                completed: false,
                visible: true
              }
            }
          }
        }
      }
    });

    expect(questSystem.getState()).toEqual({ activeQuestId: "legacy-active" });
    expect(questSystem.getTaskHudView()).toMatchObject({
      taskId: "wake-guide",
      objectiveId: "talk-to-chopper"
    });
    expect(questSystem.getTaskState()).toMatchObject({
      activeTaskId: "wake-guide",
      completedTaskIds: ["learn-to-move"]
    });
  });

  it("resets both task and legacy state through the existing reset call", () => {
    const legacyQuestSystem = createLegacyQuestSystem();
    const questSystem = createQuestTaskBridgeAdapter({
      questSystem: legacyQuestSystem
    });

    questSystem.emit({
      type: "MOVE",
      targetId: "player"
    });
    expect(questSystem.getTaskState().completedTaskIds).toEqual(["learn-to-move"]);

    expect(questSystem.reset()).toBe(true);

    expect(legacyQuestSystem.reset).toHaveBeenCalledTimes(1);
    expect(questSystem.getTaskState().completedTaskIds).toEqual([]);
    expect(questSystem.getTaskHudView()).toMatchObject({
      taskId: "learn-to-move"
    });
  });

  it("restores legacy and task state together for save slot changes", () => {
    const legacyQuestSystem = createLegacyQuestSystem();
    legacyQuestSystem.restoreState = vi.fn((state) => state);
    const questSystem = createQuestTaskBridgeAdapter({
      questSystem: legacyQuestSystem
    });

    questSystem.emit({
      type: "MOVE",
      targetId: "player"
    });
    expect(questSystem.getTaskState().completedTaskIds).toEqual(["learn-to-move"]);

    const result = questSystem.restoreState({
      questState: {
        activeQuestId: "learn-to-move"
      },
      taskState: null
    });

    expect(legacyQuestSystem.restoreState).toHaveBeenCalledWith({
      activeQuestId: "learn-to-move"
    });
    expect(result.taskState.completedTaskIds).toEqual([]);
    expect(questSystem.getTaskHudView()).toMatchObject({
      taskId: "learn-to-move",
      objectiveId: "move-after-crash"
    });
  });

  it("requires a legacy quest system with emit", () => {
    expect(() => createQuestTaskBridgeAdapter()).toThrow(
      "QuestTaskBridgeAdapter requires a questSystem with emit()."
    );
  });
});
