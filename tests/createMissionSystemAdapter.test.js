import { describe, expect, it, vi } from "vitest";
import { createMissionSystemAdapter } from "../app/tasks/createMissionSystemAdapter.js";
import {
  TASK_EFFECT,
  TASK_EVENT,
  TASK_FACT_IDS
} from "../app/tasks/taskData.js";

function advanceToMeetGrow(missionSystem) {
  missionSystem.emit({
    type: "MOVE",
    targetId: "player"
  });
  missionSystem.emit({
    type: "TALK",
    targetId: "tangrowth"
  });
  missionSystem.emit({
    type: "UNLOCK",
    targetId: "waterGun"
  });
  missionSystem.emit({
    type: "BUILD",
    targetId: "revived-grass",
    amount: 5
  });
}

describe("createMissionSystemAdapter", () => {
  it("uses task progress as the mission source of truth", () => {
    const missionSystem = createMissionSystemAdapter();

    const result = missionSystem.emit({
      type: "MOVE",
      targetId: "player"
    });

    expect(result).toMatchObject({
      changed: true,
      completedQuestIds: ["learn-to-move"],
      taskResult: {
        completedTaskIds: ["learn-to-move"],
        normalizedEvent: {
          type: TASK_EVENT.MOVE,
          targetId: "player"
        }
      }
    });
    expect(missionSystem.getActiveQuest()).toMatchObject({
      id: "wake-guide",
      status: "active"
    });
    expect(missionSystem.getState()).toMatchObject({
      activeQuestId: "wake-guide",
      activeTaskId: "wake-guide",
      completedQuestIds: ["learn-to-move"],
      completedTaskIds: ["learn-to-move"],
      facts: {
        [TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]: true
      }
    });
  });

  it("derives quest-shaped objective data for legacy HUD callers", () => {
    const missionSystem = createMissionSystemAdapter();
    const quest = missionSystem.getQuest("learn-to-move");

    expect(quest).toMatchObject({
      id: "learn-to-move",
      title: "Take Your First Steps",
      objectives: [
        {
          id: "move-after-crash",
          type: "MOVE",
          targetId: "player",
          current: 0,
          required: 1
        }
      ],
      nextQuestId: "wake-guide"
    });
  });

  it("keeps unlock checks task-backed while supporting old unlock names during migration", () => {
    const missionSystem = createMissionSystemAdapter();

    missionSystem.emit({
      type: "MOVE",
      targetId: "player"
    });
    missionSystem.emit({
      type: "TALK",
      targetId: "tangrowth"
    });
    missionSystem.emit({
      type: "UNLOCK",
      targetId: "waterGun"
    });

    expect(missionSystem.hasUnlocked("hydroTool")).toBe(true);
    expect(missionSystem.hasUnlocked("waterGun")).toBe(true);
    expect(missionSystem.hasUnlocked("water-restoration")).toBe(true);
    expect(missionSystem.getState().unlocked).toContain("hydroTool");
  });

  it("lets story beats explicitly complete the active mission", () => {
    const onChange = vi.fn();
    const onTaskCompleteMotionRequested = vi.fn();
    const missionSystem = createMissionSystemAdapter({
      onChange,
      onTaskCompleteMotionRequested
    });
    advanceToMeetGrow(missionSystem);

    const result = missionSystem.completeMission("meet-grow", {
      event: {
        type: TASK_EVENT.STORY_BEAT_COMPLETE,
        targetId: "meet-grow"
      }
    });

    expect(result).toMatchObject({
      changed: true,
      completedQuestIds: ["meet-grow"],
      taskResult: {
        completedTaskIds: ["meet-grow"],
        effects: expect.arrayContaining([
          expect.objectContaining({
            type: TASK_EFFECT.UNLOCK,
            id: "growTool"
          })
        ])
      }
    });
    expect(missionSystem.getActiveQuest()).toMatchObject({
      id: "grow-first-habitat"
    });
    expect(missionSystem.hasUnlocked("leafage")).toBe(true);
    expect(onTaskCompleteMotionRequested).toHaveBeenCalledWith(expect.objectContaining({
      motionId: "task-complete",
      questId: "meet-grow"
    }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      reason: "quest-progress-completed",
      payload: expect.objectContaining({
        completedQuestIds: ["meet-grow"]
      })
    }));
  });

  it("exposes terminal entries directly from tasks", () => {
    const missionSystem = createMissionSystemAdapter();

    expect(missionSystem.getTaskTerminalEntries()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        taskId: "learn-to-move",
        title: "Take Your First Steps",
        source: "main task"
      }),
      expect.objectContaining({
        taskId: "meet-grow",
        title: "????",
        status: "locked"
      })
    ]));
  });
});
