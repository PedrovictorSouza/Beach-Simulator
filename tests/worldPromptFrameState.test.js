import { describe, expect, it, vi } from "vitest";

import { resolveWorldPromptFrameState } from "../app/runtime/presentation/worldPromptFrameState.js";

function createPlayer(position = [0, 0, 0]) {
  return {
    getPosition: () => position
  };
}

function createBaseOptions(overrides = {}) {
  return {
    activeMoveId: null,
    activeQuest: null,
    activeTask: null,
    activeSystemQuest: null,
    buildBlockEquipped: false,
    canShowWorldSpaceUi: true,
    controls: {
      storyState: {
        flags: {}
      },
      playerSkills: {},
      isPrimaryActionActive: () => false,
      getFieldMoveSwitchPrompt: () => null
    },
    session: {
      playerCharacter: createPlayer(),
      groundGrassPatches: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [],
      actTwoSquirtle: null,
      bulbasaurEncounter: null,
      charmanderEncounter: null,
      timburrEncounter: null,
      leppaTree: null
    },
    now: 1000,
    inputModalityState: {},
    waterGunEquipped: false,
    leafageEquipped: false,
    repairBoxPromptDistance: 2,
    waterGunFirstUsePromptDismissed: false,
    dryGrassHydroMissionActive: false,
    openingLeppaTreeRequestActive: false,
    getEncounterRepairBoxPosition: () => null,
    getLeppaTreeSurroundingGroundCells: () => [],
    getSquirtleWorldPosition: () => [1, 0, 2],
    isSquirtleWaterCharging: () => false,
    getFreeBlockBuildCostMarker: () => null,
    getPeriodicChopperAttentionCue: () => null,
    isLeafageInvalidTargetVisible: () => false,
    isFireInvalidTargetVisible: () => false,
    isRunBreadcrumbVisible: () => false,
    ...overrides
  };
}

describe("world prompt frame state", () => {
  it("resolves prompt targets, visibility flags and prompt text for the frame", () => {
    const getFreeBlockBuildCostMarker = vi.fn(() => ({
      text: "2 / 4 Wood",
      worldPosition: [2, 0, 2],
      affordable: false
    }));
    const getPeriodicChopperAttentionCue = vi.fn(() => ({
      text: "Over here",
      cycleId: 3
    }));
    const session = {
      playerCharacter: createPlayer([0.25, 0, 0]),
      groundGrassPatches: [
        {
          id: "dry-patch",
          cellId: "dry-cell",
          state: "dead",
          position: [0.4, 0, 0],
          size: [1, 1]
        }
      ],
      groundDeadInstances: [
        {
          id: "dry-cell",
          offset: [0.4, 0, 0],
          tileSpan: 1.425,
          active: true,
          purifiable: true
        }
      ],
      groundPurifiedInstances: [],
      actTwoSquirtle: {
        repairModuleInstance: {
          active: true,
          baseOffset: [0.6, 0, 0]
        }
      },
      bulbasaurEncounter: null,
      charmanderEncounter: null,
      timburrEncounter: null,
      leppaTree: null
    };

    const frameState = resolveWorldPromptFrameState(createBaseOptions({
      activeMoveId: "waterGun",
      activeQuest: { id: "water-dry-grass" },
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      buildBlockEquipped: true,
      controls: {
        storyState: {
          flags: {
            leafageTallGrassCount: 0,
            leafageTallGrassHabitatCreated: false
          }
        },
        playerSkills: {
          waterGun: true,
          leafage: true
        },
        isPrimaryActionActive: () => false,
        getFieldMoveSwitchPrompt: () => ({ html: "switch" })
      },
      session,
      waterGunEquipped: true,
      leafageEquipped: true,
      freeBlockPreviewTarget: { id: "preview" },
      nearbyInteractable: { target: { id: "squirtle" } },
      dryGrassHydroMissionActive: true,
      getFreeBlockBuildCostMarker,
      getPeriodicChopperAttentionCue,
      isSquirtleWaterCharging: () => true,
      isLeafageInvalidTargetVisible: () => true,
      isFireInvalidTargetVisible: () => true,
      isRunBreadcrumbVisible: () => true
    }));

    expect(frameState.nearbyRepairBoxPrompt).toEqual({
      text: "Hydro Bot",
      worldPosition: [0.6, 0, 0]
    });
    expect(frameState.nearbyDryGrassWorldPromptTarget?.patch.id).toBe("dry-patch");
    expect(frameState.nearbyDryGrassHintTarget?.targetId).toBe("dry-patch");
    expect(frameState.playerInteractionPromptText).toBe("press E");
    expect(frameState.dryGrassHydroPromptText).toBe("Press Enter");
    expect(frameState.runBreadcrumbPromptText).toBe("press Shift to run!");
    expect(frameState.chopperAttentionCue).toEqual({
      text: "Over here",
      cycleId: 3
    });
    expect(frameState.freeBlockBuildCostMarker).toEqual({
      text: "2 / 4 Wood",
      worldPosition: [2, 0, 2],
      affordable: false
    });
    expect(frameState.shouldShowWaterGunFirstUsePrompt).toBe(true);
    expect(frameState.shouldShowLeafageFirstUsePrompt).toBe(true);
    expect(frameState.shouldShowFieldMoveSwitchPrompt).toBe(true);
    expect(frameState.shouldShowSquirtleChargingPrompt).toBe(true);
    expect(frameState.shouldShowInvalidLeafageUsePrompt).toBe(true);
    expect(frameState.shouldShowInvalidFireUsePrompt).toBe(true);
    expect(frameState.shouldShowDryGrassHydroPrompt).toBe(true);
    expect(frameState.shouldShowRunBreadcrumbPrompt).toBe(true);
    expect(frameState.shouldShowPlayerInteractionPrompt).toBe(true);
    expect(frameState.shouldShowRepairBoxPrompt).toBe(true);
    expect(getFreeBlockBuildCostMarker).toHaveBeenCalledWith({ id: "preview" });
    expect(getPeriodicChopperAttentionCue).toHaveBeenCalledWith({
      activeTask: { id: "task-a" },
      activeSystemQuest: { id: "quest-a" },
      chopperPosition: null,
      now: 1000
    });
  });

  it("gates world-space prompts when the UI cannot be shown", () => {
    const getFreeBlockBuildCostMarker = vi.fn(() => ({
      text: "hidden"
    }));
    const getPeriodicChopperAttentionCue = vi.fn(() => ({
      text: "hidden"
    }));

    const frameState = resolveWorldPromptFrameState(createBaseOptions({
      canShowWorldSpaceUi: false,
      buildBlockEquipped: true,
      controls: {
        storyState: {
          flags: {}
        },
        playerSkills: {
          waterGun: true,
          leafage: true
        },
        isPrimaryActionActive: () => false,
        getFieldMoveSwitchPrompt: () => ({ html: "switch" })
      },
      waterGunEquipped: true,
      leafageEquipped: true,
      dryGrassHydroMissionActive: true,
      isSquirtleWaterCharging: () => true,
      isLeafageInvalidTargetVisible: () => true,
      isFireInvalidTargetVisible: () => true,
      isRunBreadcrumbVisible: () => true,
      getFreeBlockBuildCostMarker,
      getPeriodicChopperAttentionCue
    }));

    expect(frameState.freeBlockBuildCostMarker).toBeNull();
    expect(frameState.chopperAttentionCue).toBeNull();
    expect(frameState.nearbyDryGrassWorldPromptTarget).toBeNull();
    expect(frameState.nearbyDryGrassHintTarget).toBeNull();
    expect(frameState.shouldShowWaterGunFirstUsePrompt).toBe(false);
    expect(frameState.shouldShowLeafageFirstUsePrompt).toBe(false);
    expect(frameState.shouldShowFieldMoveSwitchPrompt).toBe(false);
    expect(frameState.shouldShowSquirtleChargingPrompt).toBe(false);
    expect(frameState.shouldShowInvalidLeafageUsePrompt).toBe(false);
    expect(frameState.shouldShowInvalidFireUsePrompt).toBe(false);
    expect(frameState.shouldShowDryGrassHydroPrompt).toBe(false);
    expect(frameState.shouldShowRunBreadcrumbPrompt).toBe(false);
    expect(getFreeBlockBuildCostMarker).not.toHaveBeenCalled();
    expect(getPeriodicChopperAttentionCue).not.toHaveBeenCalled();
  });
});
