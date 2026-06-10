import { describe, expect, it, vi } from "vitest";

import {
  resolveWorldSpacePresentationFrameState
} from "../app/runtime/presentation/worldSpacePresentationFrameState.js";

function createPlayer(position = [0, 0, 0]) {
  return {
    getPosition: () => position
  };
}

describe("world space presentation frame state", () => {
  it("composes world-space UI, speech and prompt frame state", () => {
    const tangrowthPosition = [1, 0, 2];
    const workbenchGreenArrowModelInstance = { id: "arrow" };
    const resolveWorldSpaceUiVisibility = vi.fn(() => true);
    const shouldShowWorkbenchGreenArrowCue = vi.fn(() => true);
    const applyWorkbenchGreenArrowCue = vi.fn();
    const getPeriodicChopperAttentionCue = vi.fn(() => ({
      text: "Over here",
      cycleId: 4
    }));
    const isDryGrassHydroMissionActive = vi.fn(() => true);
    const getFreeBlockBuildCostMarker = vi.fn(() => ({
      text: "2 / 4 Wood",
      worldPosition: [2, 0, 2],
      affordable: false
    }));

    const state = resolveWorldSpacePresentationFrameState({
      now: 1000,
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true },
      activeMoveId: "waterGun",
      activeQuest: { id: "meetTangrowth" },
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      buildBlockEquipped: true,
      controls: {
        storyState: {
          flags: {
            leafageTallGrassCount: 1
          }
        },
        playerSkills: {
          waterGun: true
        },
        isPrimaryActionActive: () => false,
        getFieldMoveSwitchPrompt: () => null
      },
      session: {
        playerCharacter: createPlayer([0, 0, 0]),
        npcActors: [
          {
            id: "tangrowth",
            character: {
              getPosition: () => tangrowthPosition
            }
          }
        ],
        workbenchGreenArrowModelInstance,
        groundGrassPatches: [],
        groundDeadInstances: [],
        groundPurifiedInstances: [],
        actTwoSquirtle: null,
        bulbasaurEncounter: null,
        charmanderEncounter: null,
        timburrEncounter: null,
        leppaTree: null
      },
      inputModalityState: {},
      freeBlockPreviewTarget: { id: "preview" },
      waterGunEquipped: true,
      resolveWorldSpaceUiVisibility,
      shouldShowWorkbenchGreenArrowCue,
      applyWorkbenchGreenArrowCue,
      isDryGrassHydroMissionActive,
      getFreeBlockBuildCostMarker,
      getPeriodicChopperAttentionCue
    });

    expect(state.canShowWorldSpaceUi).toBe(true);
    expect(state.tangrowthPosition).toBe(tangrowthPosition);
    expect(state.shouldShowTangrowthSpeech).toBe(true);
    expect(state.freeBlockBuildCostMarker).toEqual({
      text: "2 / 4 Wood",
      worldPosition: [2, 0, 2],
      affordable: false
    });
    expect(state.chopperAttentionCue).toEqual({
      text: "Over here",
      cycleId: 4
    });
    expect(resolveWorldSpaceUiVisibility).toHaveBeenCalledWith({
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true }
    });
    expect(shouldShowWorkbenchGreenArrowCue).toHaveBeenCalledWith({
      activeQuest: { id: "meetTangrowth" },
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      storyState: {
        flags: {
          leafageTallGrassCount: 1
        }
      }
    });
    expect(applyWorkbenchGreenArrowCue).toHaveBeenCalledWith(
      workbenchGreenArrowModelInstance,
      {
        active: true,
        now: 1000
      }
    );
    expect(isDryGrassHydroMissionActive).toHaveBeenCalledWith(
      { id: "meetTangrowth" },
      {
        flags: {
          leafageTallGrassCount: 1
        }
      },
      {
        waterGun: true
      }
    );
    expect(getFreeBlockBuildCostMarker).toHaveBeenCalledWith({ id: "preview" });
    expect(getPeriodicChopperAttentionCue).toHaveBeenCalledWith({
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      chopperPosition: tangrowthPosition,
      now: 1000
    });
  });
});
