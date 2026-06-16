import { describe, expect, it, vi } from "vitest";

import {
  createWorldSpacePresentationFrameRuntime,
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

  it("creates a runtime that resolves world-space state and writes the snapshot", () => {
    const nextFrame = createNextFrame();
    const playerPosition = [5, 0, 6];
    const tangrowthPosition = [1, 0, 2];
    const resolveWorldSpaceUiVisibility = vi.fn(() => true);
    const runtime = createWorldSpacePresentationFrameRuntime({
      controls: {
        storyState: {
          flags: {
            charmanderFollowing: true
          }
        },
        playerSkills: {
          waterGun: true
        },
        isPrimaryActionActive: () => false,
        getFieldMoveSwitchPrompt: () => null
      },
      session: {
        playerCharacter: {
          getPosition: () => playerPosition
        },
        npcActors: [
          {
            id: "tangrowth",
            character: {
              getPosition: () => tangrowthPosition
            }
          }
        ],
        workbenchGreenArrowModelInstance: {},
        groundGrassPatches: [],
        groundDeadInstances: [],
        groundPurifiedInstances: [],
        actTwoSquirtle: null,
        bulbasaurEncounter: null,
        charmanderEncounter: null,
        timburrEncounter: null,
        leppaTree: null
      },
      gameplay: {
        tangrowthOpeningLine: "Hello, Broky.",
        getQuestCompletionPop: () => null
      },
      repairBoxPromptDistance: 3,
      restoredGrassMissionTargetCount: 10,
      waterGunFirstUsePromptFlag: "waterGunFirstUsePromptDismissed",
      resolveWorldSpaceUiVisibility,
      shouldShowWorkbenchGreenArrowCue: () => false,
      applyWorkbenchGreenArrowCue: vi.fn(),
      isPlayerNearWorldPosition: () => false,
      isDryGrassHydroMissionActive: () => true,
      getEncounterRepairBoxPosition: () => null,
      getLeppaTreeSurroundingGroundCells: () => [],
      getSquirtleWorldPosition: () => null,
      isSquirtleWaterCharging: () => false,
      getFreeBlockBuildCostMarker: () => null,
      getPeriodicChopperAttentionCue: () => null,
      isLeafageInvalidTargetVisible: () => false,
      isFireInvalidTargetVisible: () => false,
      isRunBreadcrumbVisible: () => false
    });

    const result = runtime.update({
      nextFrame,
      now: 1200,
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true },
      activeMoveId: "waterGun",
      activeQuest: { id: "meetTangrowth" },
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      equipmentState: {
        buildBlockEquipped: false,
        waterGunEquipped: true,
        leafageEquipped: false
      },
      inputModalityState: {},
      placementPreviews: {},
      promptState: {
        playerCounterPromptText: "+1 Wood"
      },
      firstTaughtActionFreedomWindowActive: true,
      promptSources: {},
      groundCellHighlightState: {
        shouldShowGroundCellHighlight: true,
        highlightedGroundCell: { id: "target-cell" },
        highlightedGroundCellTargetState: "valid",
        highlightedGroundCellAbilityId: "waterGun"
      },
      frameBlockers: {}
    });

    expect(result.canShowWorldSpaceUi).toBe(true);
    expect(nextFrame.worldSpeech).toEqual({
      visible: true,
      text: "Hello, Broky.",
      worldPosition: tangrowthPosition
    });
    expect(nextFrame.groundCellHighlight).toEqual(expect.objectContaining({
      visible: true,
      groundCell: expect.objectContaining({
        id: "target-cell"
      })
    }));
    expect(resolveWorldSpaceUiVisibility).toHaveBeenCalledWith({
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true }
    });
  });
});
