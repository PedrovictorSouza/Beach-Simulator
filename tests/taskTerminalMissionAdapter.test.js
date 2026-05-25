import { describe, expect, it } from "vitest";
import { createTaskTerminalMissionEntries } from "../app/tasks/taskTerminalMissionAdapter.js";

describe("taskTerminalMissionAdapter", () => {
  it("maps task terminal entries into terminal mission entries", () => {
    const missions = createTaskTerminalMissionEntries({
      taskEntries: [
        {
          id: "task:wake-guide",
          taskId: "wake-guide",
          source: "main task",
          status: "active",
          title: "Talk to Chopper",
          description: "Find Chopper after the crash.",
          progress: "0/1 objectives",
          objectives: []
        }
      ]
    });

    expect(missions).toEqual([
      {
        id: "task:wake-guide",
        taskId: "wake-guide",
        source: "main task",
        status: "active",
        title: "Talk to Chopper",
        description: "Find Chopper after the crash.",
        progress: "0/1 objectives",
        objectives: []
      }
    ]);
  });

  it("attaches terminal actions from objectives with legacy field task ids", () => {
    const missions = createTaskTerminalMissionEntries({
      taskEntries: [
        {
          id: "task:unlock-colony-terminal",
          taskId: "unlock-colony-terminal",
          source: "main task",
          status: "active",
          title: "Turn On the Colony Terminal",
          description: "Make the terminal the center of colony progress.",
          progress: "1/2 objectives",
          objectives: [
            {
              id: "inspect-terminal-ruins",
              legacyFieldTaskId: "ruined-pokemon-center"
            }
          ]
        }
      ],
      actionByLegacyFieldTaskId: {
        "ruined-pokemon-center": {
          actionId: "unlock-challenges",
          actionLabel: "Open Colony Checks"
        }
      }
    });

    expect(missions[0]).toMatchObject({
      id: "task:unlock-colony-terminal",
      actionId: "unlock-challenges",
      actionLabel: "Open Colony Checks"
    });
  });

  it("ignores legacy field task entries without an available action", () => {
    const missions = createTaskTerminalMissionEntries({
      taskEntries: [
        {
          id: "task:build-first-base",
          status: "active",
          title: "Build the First Base",
          description: "Use gathered materials.",
          objectives: [
            {
              id: "claim-house-kit",
              legacyFieldTaskId: "leaf-den-kit"
            }
          ]
        }
      ],
      actionByLegacyFieldTaskId: {
        "leaf-den-kit": {}
      }
    });

    expect(missions[0].actionId).toBeUndefined();
    expect(missions[0].actionLabel).toBeUndefined();
  });

  it("returns an empty list when no task entries exist", () => {
    expect(createTaskTerminalMissionEntries()).toEqual([]);
    expect(createTaskTerminalMissionEntries({ taskEntries: null })).toEqual([]);
  });
});
