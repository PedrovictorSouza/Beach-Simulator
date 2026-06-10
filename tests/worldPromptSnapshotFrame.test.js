import { describe, expect, it } from "vitest";

import { updateWorldPromptSnapshotFrame } from "../app/runtime/presentation/worldPromptSnapshotFrame.js";

function createSnapshot() {
  return {
    worldPrompt: {
      state: null,
      visible: false,
      text: "",
      worldPosition: null
    }
  };
}

describe("world prompt snapshot frame", () => {
  it("writes placement prompts before lower-priority world prompts", () => {
    const snapshot = createSnapshot();

    updateWorldPromptSnapshotFrame(snapshot, {
      inputModalityState: {},
      playerPosition: [9, 0, 9],
      shouldShowSolarStationPlacementPrompt: true,
      solarStationPlacementPreview: {
        valid: true,
        snappedPosition: [1, 0, 1]
      },
      shouldShowPlayerCounterPrompt: true,
      playerCounterPromptText: "+1"
    });

    expect(snapshot.worldPrompt.state).toEqual({
      kind: "placement",
      target: "solarStation",
      valid: true,
      text: "X / Enter Place",
      worldPosition: [1, 0, 1]
    });
    expect(snapshot.worldPrompt.visible).toBe(true);
    expect(snapshot.worldPrompt.text).toBe("X / Enter Place");
    expect(snapshot.worldPrompt.worldPosition).toEqual([1, 0, 1]);
  });

  it("falls back to the player position for destroyable object prompts", () => {
    const snapshot = createSnapshot();

    updateWorldPromptSnapshotFrame(snapshot, {
      playerPosition: [3, 0, 4],
      shouldShowDestroyableObjectPrompt: true,
      destroyableObjectPrompt: {
        promptCopy: "Y Cut"
      }
    });

    expect(snapshot.worldPrompt.state).toEqual({
      kind: "destroyableObject",
      text: "Y Cut",
      worldPosition: [3, 0, 4]
    });
  });

  it("writes first-use prompt copy without changing existing text", () => {
    const snapshot = createSnapshot();

    updateWorldPromptSnapshotFrame(snapshot, {
      playerPosition: [5, 0, 6],
      shouldShowLeafageFirstUsePrompt: true,
      leafageEquipped: false
    });

    expect(snapshot.worldPrompt.state).toEqual({
      kind: "firstUse",
      abilityId: "leafage",
      text: "Press LT on dry ground, then <- / -> to select Grow Bot",
      worldPosition: [5, 0, 6]
    });
  });
});
