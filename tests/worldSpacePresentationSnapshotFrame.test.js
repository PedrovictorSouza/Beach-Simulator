import { describe, expect, it, vi } from "vitest";

import {
  updateWorldSpacePresentationSnapshotFrame
} from "../app/runtime/presentation/worldSpacePresentationSnapshotFrame.js";

function createNextFrame() {
  return {
    worldSpeech: {
      visible: false,
      text: "",
      worldPosition: null
    },
    worldPrompt: {
      state: null,
      visible: false,
      text: "",
      worldPosition: null
    },
    groundCellHighlight: {
      visible: false,
      groundCell: null,
      markedGroundCells: [],
      pulsePhase: 0,
      actionPulseGroundCell: null,
      actionPulsePhase: 0,
      actionPulseAbilityId: null
    },
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

describe("world space presentation snapshot frame", () => {
  it("writes speech, prompts, ground highlights and status popups", () => {
    const nextFrame = createNextFrame();
    const playerPosition = [5, 0, 6];
    const getPlayerPosition = vi.fn(() => playerPosition);
    const getQuestCompletionPop = vi.fn(() => ({
      text: "Task complete"
    }));

    updateWorldSpacePresentationSnapshotFrame(nextFrame, {
      now: 1200,
      activeQuest: { id: "quest-a" },
      activeMoveId: "waterGun",
      session: {
        playerCharacter: {
          getPosition: getPlayerPosition
        }
      },
      controls: {
        storyState: {
          flags: {
            charmanderFollowing: true
          }
        }
      },
      gameplay: {
        tangrowthOpeningLine: "Hello, Broky.",
        getQuestCompletionPop
      },
      inputModalityState: {},
      presentationState: {
        tangrowthPosition: [1, 0, 2],
        shouldShowTangrowthSpeech: true,
        shouldShowPlayerCounterPrompt: true,
        playerCounterPromptText: "+1 Wood",
        nearbyDryGrassHintTarget: {
          targetId: "dry-grass-a",
          worldPosition: [7, 0.04, 8]
        }
      },
      groundCellHighlightState: {
        shouldShowGroundCellHighlight: true,
        highlightedGroundCell: { id: "target-cell" },
        highlightedGroundCellTargetState: "valid",
        highlightedGroundCellAbilityId: "waterGun"
      }
    });

    expect(nextFrame.worldSpeech).toEqual({
      visible: true,
      text: "Hello, Broky.",
      worldPosition: [1, 0, 2]
    });
    expect(nextFrame.worldPrompt.state).toEqual({
      kind: "counter",
      text: "+1 Wood",
      worldPosition: playerPosition
    });
    expect(nextFrame.groundCellHighlight).toEqual(expect.objectContaining({
      visible: true,
      groundCell: {
        id: "target-cell",
        highlightTargetState: "valid",
        highlightAbilityId: "waterGun"
      }
    }));
    expect(nextFrame.dryGrassHint).toEqual({
      visible: true,
      targetId: "dry-grass-a",
      worldPosition: [7, 0.04, 8]
    });
    expect(nextFrame.taskPop).toEqual({
      visible: true,
      text: "Task complete",
      worldPosition: playerPosition
    });
    expect(getQuestCompletionPop).toHaveBeenCalledTimes(1);
  });
});
