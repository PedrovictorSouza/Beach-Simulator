import { describe, expect, it } from "vitest";
import { buildPokemonCenterPcMissionEntries } from "../app/bootstrap/pokemonCenterPcMissions.js";

describe("pokemon center pc missions", () => {
  it("builds field task and quest entries from fallback data", () => {
    const storyState = {
      flags: {
        trackedTaskIds: ["known-task"],
        completeFlag: true
      }
    };
    const fieldTasks = {
      known: {
        id: "known-task",
        title: "Known Task",
        description: (state) => `Tracked ${state.flags.trackedTaskIds.length}`
      },
      hidden: {
        id: "hidden-task",
        title: "Hidden Task",
        description: "Hidden description"
      },
      done: {
        id: "done-task",
        title: "Done Task",
        completeFlag: "completeFlag"
      }
    };
    const questSystem = {
      getTaskTerminalEntries: () => [],
      getQuestLog: () => [
        {
          id: "repair",
          status: "available",
          title: "Repair",
          description: "Fix it",
          objectives: [{ current: 3, required: 5 }]
        },
        {
          id: "locked",
          status: "locked",
          title: "Locked",
          description: "Secret",
          objectives: [{ current: 1, required: 1 }]
        }
      ]
    };

    expect(buildPokemonCenterPcMissionEntries({
      questSystem,
      storyState,
      fieldTasks,
      getActionForTask: (taskId) => (
        taskId === "hidden-task" ?
          { actionId: "review", actionLabel: "Review" } :
          {}
      )
    })).toEqual([
      {
        id: "field:known-task",
        source: "request",
        status: "available",
        title: "Known Task",
        description: "Tracked 1"
      },
      {
        id: "field:hidden-task",
        source: "request",
        status: "available",
        title: "Hidden Task",
        description: "Hidden description",
        actionId: "review",
        actionLabel: "Review"
      },
      {
        id: "field:done-task",
        source: "request",
        status: "completed",
        title: "Done Task",
        description: ""
      },
      {
        id: "quest:repair",
        source: "story",
        status: "available",
        title: "Repair",
        description: "Fix it",
        progress: "3/5"
      },
      {
        id: "quest:locked",
        source: "story",
        status: "locked",
        title: "????",
        description: "Check data has not been recovered yet.",
        progress: ""
      }
    ]);
  });

  it("uses task terminal entries when the bridge provides them", () => {
    const fieldTasks = {
      legacy: {
        id: "legacy-task",
        title: "Legacy Task"
      }
    };
    const questSystem = {
      getTaskTerminalEntries: () => [
        {
          id: "task-entry-1",
          taskId: "task-entry-1",
          title: "Legacy Task",
          description: "Bridge task",
          status: "available",
          source: "request",
          objectives: [{ legacyFieldTaskId: "legacy-task" }]
        }
      ]
    };

    expect(buildPokemonCenterPcMissionEntries({
      questSystem,
      fieldTasks,
      getActionForTask: () => ({ actionId: "claim", actionLabel: "Claim" })
    })).toEqual([
      {
        id: "task-entry-1",
        taskId: "task-entry-1",
        title: "Legacy Task",
        description: "Bridge task",
        status: "available",
        source: "request",
        progress: "",
        objectives: [{ legacyFieldTaskId: "legacy-task" }],
        actionId: "claim",
        actionLabel: "Claim"
      }
    ]);
  });
});
