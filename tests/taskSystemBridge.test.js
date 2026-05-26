import { describe, expect, it } from "vitest";
import {
  createTaskSystemBridge,
  normalizeLegacyQuestEvent
} from "../app/tasks/taskSystemBridge.js";
import {
  TASK_EFFECT,
  TASK_EVENT,
  TASK_FACT_IDS,
  TASK_STATUS
} from "../app/tasks/taskData.js";

const MVP_TASK_IDS = [
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

const LEGACY_MVP_EVENTS = [
  { type: "MOVE", targetId: "player" },
  { type: "TALK", targetId: "tangrowth" },
  { type: "UNLOCK", targetId: "waterGun" },
  { type: "BUILD", targetId: "revived-grass", amount: 1 },
  { type: "BUILD", targetId: "revived-grass", amount: 4 },
  { type: "TALK", targetId: "leaf-helper" },
  { type: "PLACE", targetId: "leafy-home-patch", amount: 4 },
  { type: "BUILD", targetId: "snow-melted" },
  { type: "UNLOCK", targetId: "challenges" },
  { type: "COLLECT", targetId: "wood", amount: 6 },
  { type: "BUILD", targetId: "foundation-wall", amount: 24 },
  { type: "TALK", targetId: "chopper-first-habitat-report" }
];

function playLegacyMvpSequence(bridge) {
  return LEGACY_MVP_EVENTS.map((event) => bridge.recordLegacyQuestEvent(event));
}

function getTerminalEntry(bridge, taskId) {
  return bridge.getTerminalEntries().find((entry) => entry.taskId === taskId) || null;
}

describe("taskSystemBridge", () => {
  it("normalizes legacy quest events into task events", () => {
    expect(normalizeLegacyQuestEvent({
      type: "UNLOCK",
      targetId: "waterGun"
    })).toEqual({
      type: TASK_EVENT.UNLOCK,
      targetId: "hydroTool"
    });

    expect(normalizeLegacyQuestEvent({
      type: "BUILD",
      targetId: "revived-grass",
      amount: 3
    })).toEqual({
      type: TASK_EVENT.RESTORE,
      targetId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
      amount: 3
    });

    expect(normalizeLegacyQuestEvent({
      type: "BUILD",
      targetId: "snow-melted"
    })).toEqual({
      type: TASK_EVENT.RESTORE,
      targetId: TASK_FACT_IDS.WHITE_GROUND_CLEARED
    });

    expect(normalizeLegacyQuestEvent({
      type: "UNLOCK",
      targetId: "challenges"
    })).toEqual({
      type: TASK_EVENT.TERMINAL_ACTION,
      targetId: "unlock-colony-checks"
    });

    expect(normalizeLegacyQuestEvent()).toBe(null);
  });

  it("keeps legacy events ordered by the active task lifecycle", () => {
    const bridge = createTaskSystemBridge();

    const earlyTalk = bridge.recordLegacyQuestEvent({
      type: "TALK",
      targetId: "tangrowth"
    });
    expect(earlyTalk).toMatchObject({
      changed: false,
      normalizedEvent: {
        type: TASK_EVENT.TALK,
        targetId: "chopper"
      }
    });
    expect(bridge.getHudView()).toMatchObject({
      taskId: "learn-to-move",
      objectiveId: "move-after-crash"
    });

    const move = bridge.recordLegacyQuestEvent({
      type: "MOVE",
      targetId: "player"
    });
    expect(move.completedTaskIds).toEqual(["learn-to-move"]);
    expect(bridge.getHudView()).toMatchObject({
      taskId: "wake-guide",
      objectiveId: "talk-to-chopper"
    });

    const talk = bridge.recordLegacyQuestEvent({
      type: "TALK",
      targetId: "tangrowth"
    });
    expect(talk.completedTaskIds).toEqual(["wake-guide"]);
    expect(bridge.getHudView()).toMatchObject({
      taskId: "wake-hydro",
      objectiveId: "wake-hydro-bot"
    });
  });

  it("plays the legacy MVP campaign sequence through the new task lifecycle", () => {
    const bridge = createTaskSystemBridge();
    const results = playLegacyMvpSequence(bridge);
    const terminalResult = results[8];
    const state = bridge.getState();

    expect(state.completedTaskIds).toEqual(MVP_TASK_IDS);
    expect(state.activeTaskId).toBe(null);
    expect(state.facts).toMatchObject({
      [TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH]: true,
      [TASK_FACT_IDS.CHOPPER_FIRST_CONTACT]: true,
      [TASK_FACT_IDS.HYDRO_AWAKE]: true,
      [TASK_FACT_IDS.HYDRO_TOOL_UNLOCKED]: true,
      [TASK_FACT_IDS.FIRST_DRY_PATCH_RESTORED]: true,
      [TASK_FACT_IDS.GROW_MET]: true,
      [TASK_FACT_IDS.GROW_TOOL_UNLOCKED]: true,
      [TASK_FACT_IDS.THERMAL_CABIN_PLACED]: true,
      [TASK_FACT_IDS.COLONY_TERMINAL_UNLOCKED]: true,
      [TASK_FACT_IDS.TERMINAL_INSPECTED]: true,
      [TASK_FACT_IDS.FIRST_BASE_READY]: true,
      [TASK_FACT_IDS.CHOPPER_BASE_REPORT_COMPLETE]: true,
      [TASK_FACT_IDS.MVP_CHAPTER_COMPLETE]: true
    });
    expect(state.facts[TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT]).toBe(5);
    expect(state.facts[TASK_FACT_IDS.FIRST_HABITAT_PATCH_COUNT]).toBe(4);
    expect(state.facts[TASK_FACT_IDS.WHITE_GROUND_CLEARED]).toBe(1);
    expect(state.facts[TASK_FACT_IDS.FIRST_BASE_WOOD_COLLECTED]).toBe(6);
    expect(state.facts[TASK_FACT_IDS.FIRST_BASE_WALLS_BUILT]).toBe(24);

    expect(terminalResult.completedTaskIds).toEqual(["unlock-colony-terminal"]);
    expect(terminalResult.effects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.TERMINAL_INSPECTED
      }),
      expect.objectContaining({
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.COLONY_TERMINAL_UNLOCKED
      }),
      expect.objectContaining({
        type: TASK_EFFECT.OPEN_TERMINAL
      })
    ]));

    expect(bridge.getHudView()).toMatchObject({
      active: false,
      source: "none"
    });
    expect(getTerminalEntry(bridge, "report-base-ready")).toMatchObject({
      status: TASK_STATUS.COMPLETED,
      completed: true,
      progress: "1/1 objectives"
    });
  });

  it("treats Bulbasaur talk events as Grow Bot task progress", () => {
    const bridge = createTaskSystemBridge();

    for (const event of LEGACY_MVP_EVENTS.slice(0, 5)) {
      bridge.recordLegacyQuestEvent(event);
    }

    const talk = bridge.recordLegacyQuestEvent({
      type: "TALK",
      targetId: "bulbasaur"
    });

    expect(talk).toMatchObject({
      changed: true,
      completedTaskIds: ["meet-grow"],
      normalizedEvent: {
        type: TASK_EVENT.TALK,
        targetId: "grow"
      }
    });
    expect(bridge.getHudView()).toMatchObject({
      taskId: "grow-first-habitat"
    });
  });

  it("ignores malformed legacy events without moving the task lifecycle", () => {
    const bridge = createTaskSystemBridge();

    expect(bridge.recordLegacyQuestEvent({})).toMatchObject({
      changed: false,
      completedTaskIds: [],
      effects: []
    });
    expect(bridge.getState().completedTaskIds).toEqual([]);
    expect(bridge.getHudView()).toMatchObject({
      taskId: "learn-to-move"
    });
  });
});
