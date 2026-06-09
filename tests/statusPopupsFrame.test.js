import { describe, expect, it, vi } from "vitest";

import { updateStatusPopupsFrame } from "../app/runtime/presentation/statusPopupsFrame.js";

function createFrame() {
  return {
    dryGrassHint: {
      visible: false,
      targetId: null,
      worldPosition: null
    },
    taskPop: {
      visible: false,
      text: "",
      worldPosition: null
    }
  };
}

describe("status popups frame", () => {
  it("writes dry grass hint data using target world position when supplied", () => {
    const nextFrame = createFrame();
    const getPlayerPosition = vi.fn(() => [1, 0, 2]);

    updateStatusPopupsFrame(nextFrame, {
      hasPlayerCharacter: true,
      nearbyDryGrassHintTarget: {
        targetId: "dry-grass-a",
        worldPosition: [3, 0.04, 4]
      },
      getPlayerPosition
    });

    expect(nextFrame.dryGrassHint).toEqual({
      visible: true,
      targetId: "dry-grass-a",
      worldPosition: [3, 0.04, 4]
    });
    expect(getPlayerPosition).not.toHaveBeenCalled();
  });

  it("falls back to player position for dry grass hints without explicit world position", () => {
    const nextFrame = createFrame();
    const getPlayerPosition = vi.fn(() => [1, 0, 2]);

    updateStatusPopupsFrame(nextFrame, {
      hasPlayerCharacter: true,
      nearbyDryGrassHintTarget: {
        targetId: "dry-grass-a"
      },
      getPlayerPosition
    });

    expect(nextFrame.dryGrassHint.worldPosition).toEqual([1, 0, 2]);
    expect(getPlayerPosition).toHaveBeenCalledTimes(1);
  });

  it("writes quest completion task pop only when frame blockers allow it", () => {
    const nextFrame = createFrame();
    const getPlayerPosition = vi.fn(() => [5, 0, 6]);

    updateStatusPopupsFrame(nextFrame, {
      hasPlayerCharacter: true,
      questCompletionPop: {
        text: "Task complete"
      },
      getPlayerPosition
    });

    expect(nextFrame.taskPop).toEqual({
      visible: true,
      text: "Task complete",
      worldPosition: [5, 0, 6]
    });

    const blockedFrame = createFrame();
    updateStatusPopupsFrame(blockedFrame, {
      hasPlayerCharacter: true,
      questCompletionPop: {
        text: "Blocked"
      },
      getPlayerPosition,
      cinematicActive: true
    });

    expect(blockedFrame.taskPop.visible).toBe(false);
  });
});
