import { describe, expect, it } from "vitest";

import {
  getActiveQuestMissionTargetPositions,
  getMissionTargetPositions,
  getMissionTargetPositionsFromCopy,
  getTrackedMissionTargetPositions,
  resolveMissionCopyValue
} from "../app/runtime/missionTargetPositions.js";

const positionById = {
  "leaf-helper": [[1, 0, 1]],
  workbench: [[2, 0, 2]],
  "water-dry-tall-grass": [[3, 0, 3]],
  "revive-leppa-tree": [[4, 0, 4]],
  squirtle: [[5, 0, 5]],
  charmander: [[6, 0, 6]]
};

const getMissionTargetPositionsById = (targetId) => positionById[targetId] || [];

describe("mission target positions", () => {
  it("resolves tracked task targets with the existing task guards", () => {
    expect(getTrackedMissionTargetPositions({
      storyState: {
        flags: {
          trackedTaskIds: ["workbench-campfire", "water-dry-tall-grass", "revive-leppa-tree"],
          campfireCrafted: false,
          workbenchDiyRecipesReceived: false,
          bulbasaurDryGrassMissionComplete: false,
          leppaTreeRevived: false
        }
      },
      getMissionTargetPositionsById
    })).toEqual([
      [1, 0, 1],
      [2, 0, 2],
      [3, 0, 3],
      [4, 0, 4]
    ]);
  });

  it("resolves active quest target ids and mission copy fallback", () => {
    const activeQuest = {
      id: "test-quest",
      title: "Talk to Thermal Bot",
      objectives: [
        {
          type: "TALK",
          current: 0,
          required: 1,
          hiddenFromHud: false,
          label: "Talk to Thermal Bot"
        }
      ]
    };

    expect(getActiveQuestMissionTargetPositions({
      activeQuest,
      storyState: { flags: {} },
      getMissionTargetPositionsById
    })).toEqual([[6, 0, 6]]);
  });

  it("includes the first supplies companion target and deduplicates combined targets", () => {
    expect(getMissionTargetPositions({
      activeQuest: {
        id: "gather-first-supplies",
        objectives: []
      },
      storyState: {
        flags: {
          trackedTaskIds: ["water-dry-tall-grass"],
          bulbasaurDryGrassMissionComplete: false
        }
      },
      getMissionTargetPositionsById: (targetId) => {
        if (targetId === "squirtle") {
          return [[3.1, 0, 3.1]];
        }
        return getMissionTargetPositionsById(targetId);
      }
    })).toEqual([[3, 0, 3]]);
  });

  it("uses safe mission copy values", () => {
    expect(resolveMissionCopyValue(() => "Talk to Hydro Bot", { flags: {} })).toBe("Talk to Hydro Bot");
    expect(resolveMissionCopyValue(() => {
      throw new Error("bad copy");
    }, { flags: {} })).toBe("");
    expect(getMissionTargetPositionsFromCopy({
      source: {
        title: "Talk to Hydro Bot"
      },
      storyState: { flags: {} },
      getMissionTargetPositionsById
    })).toEqual([[5, 0, 5]]);
  });
});
