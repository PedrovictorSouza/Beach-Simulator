import { describe, expect, it, vi } from "vitest";

import {
  createGameplayPromptPreparationFrameRuntime,
  resolveGameplayPromptFrameState,
  resolveGameplayPromptTargetFrameState
} from "../app/runtime/presentation/gameplayPromptTargetFrameState.js";

function createSession(overrides = {}) {
  return {
    playerCharacter: {
      getPosition: vi.fn(() => [2, 0, 3])
    },
    groundGrassPatches: ["grass"],
    groundFlowerPatches: ["flower"],
    ...overrides
  };
}

describe("gameplay prompt target frame state", () => {
  it("resolves the frame prompt presentation state without changing prompt priority", () => {
    const session = createSession({
      pendingPlacementIntent: {
        itemId: "crate",
        label: "Crate"
      }
    });
    const inputModalityState = { device: "keyboard" };
    const gameplay = {
      findNearbyDestroyableObjectPrompt: vi.fn(() => ({ promptCopy: "Cut" })),
      getItemLabel: vi.fn(),
      buildNearbyPrompt: vi.fn(() => "nearby")
    };

    const state = resolveGameplayPromptFrameState({
      now: 123,
      session,
      storyState: { flags: {} },
      inventory: { crate: 1 },
      gameplay,
      hud: {
        getNoticeMessage: () => "Missing: Wood 1 / 2"
      },
      activeQuest: { id: "quest" },
      activeMoveId: "waterGun",
      pendingWaterGunGroundCells: [{ id: "water" }],
      nearbyHarvestTarget: { id: "harvest" },
      nearbyInteractable: { id: "interact" },
      gameplayOpeningMovementLocked: false,
      flowState: {},
      getCurrentInputModalityState: vi.fn(() => inputModalityState),
      getPlayerCounterPromptText: vi.fn(() => "2/5"),
      getSelectedRotatableWorkbenchPlacement: vi.fn(() => null),
      getNearestRotatableWorkbenchPlacement: vi.fn(() => null)
    });

    expect(state.inputModalityState).toBe(inputModalityState);
    expect(state.transientNoticeRoute).toEqual({
      hudMessage: "",
      worldPromptMessage: "Need more Wood"
    });
    expect(state.playerCounterPromptText).toBe("2/5");
    expect(state.pendingPlacementPrompt).toBe("Crate ready  X / Enter Place");
    expect(state.promptCopy).toBe("Crate ready  X / Enter Place");
    expect(gameplay.buildNearbyPrompt).not.toHaveBeenCalled();
  });

  it("resolves pending placement prompt, workbench prompt and destroyable prompt targets", () => {
    const session = createSession({
      pendingPlacementIntent: {
        itemId: "crate",
        label: "Crate"
      }
    });
    const selectedWorkbenchRotationTarget = { id: "selected-workbench" };
    const destroyableObjectPrompt = { promptCopy: "Cut" };
    const gameplay = {
      findNearbyDestroyableObjectPrompt: vi.fn(() => destroyableObjectPrompt)
    };
    const debug = vi.fn();

    const state = resolveGameplayPromptTargetFrameState({
      session,
      storyState: { flags: {} },
      inventory: { crate: 1 },
      gameplay,
      inputModalityState: {},
      nearbyHarvestTarget: null,
      gameplayOpeningMovementLocked: false,
      flowState: {},
      getSelectedRotatableWorkbenchPlacement: vi.fn(() => selectedWorkbenchRotationTarget),
      getNearestRotatableWorkbenchPlacement: vi.fn(() => ({ id: "nearby-workbench" })),
      debug
    });

    expect(state.framePlacementPrompts).toEqual({
      solarStationPlacementPrompt: "",
      greenhousePlacementPrompt: "",
      campfirePlacementPrompt: "",
      leafDenKitPlacementPrompt: ""
    });
    expect(state.pendingPlacementIntent).toEqual({
      itemId: "crate",
      label: "Crate"
    });
    expect(state.pendingPlacementPrompt).toBe("Crate ready  X / Enter Place");
    expect(state.selectedWorkbenchRotationTarget).toBe(selectedWorkbenchRotationTarget);
    expect(state.nearbyWorkbenchRotationTarget).toBe(null);
    expect(state.workbenchRotationPrompt).toBe("Enter Confirm  Space Cancel");
    expect(state.destroyableObjectPrompt).toBe(destroyableObjectPrompt);
    expect(gameplay.findNearbyDestroyableObjectPrompt).toHaveBeenCalledWith({
      playerPosition: [2, 0, 3],
      storyState: { flags: {} },
      groundGrassPatches: ["grass"],
      groundFlowerPatches: ["flower"]
    });
    expect(debug).toHaveBeenCalledWith("gameLoop.destroyableObjectPrompt", {
      hasMethod: "function",
      prompt: destroyableObjectPrompt,
      playerPosition: [2, 0, 3],
      grassCount: 1,
      flowerCount: 1,
      blockedByPlacementPreview: false
    });
  });

  it("blocks lower priority prompt targets while placement preview is active", () => {
    const session = createSession({
      pendingPlacementIntent: {
        itemId: "crate",
        label: "Crate"
      }
    });
    const gameplay = {
      findNearbyDestroyableObjectPrompt: vi.fn()
    };
    const getSelectedRotatableWorkbenchPlacement = vi.fn();
    const getNearestRotatableWorkbenchPlacement = vi.fn();

    const state = resolveGameplayPromptTargetFrameState({
      session,
      storyState: { flags: {} },
      inventory: { crate: 1 },
      gameplay,
      solarStationPlacementPreview: { valid: true },
      inputModalityState: {},
      nearbyHarvestTarget: null,
      gameplayOpeningMovementLocked: false,
      flowState: {},
      getSelectedRotatableWorkbenchPlacement,
      getNearestRotatableWorkbenchPlacement
    });

    expect(state.framePlacementPrompts.solarStationPlacementPrompt).toBe(
      "Set Solar Station site  X / Enter Place  Space Cancel"
    );
    expect(state.pendingPlacementIntent).toBe(null);
    expect(state.pendingPlacementPrompt).toBe("");
    expect(state.selectedWorkbenchRotationTarget).toBe(null);
    expect(state.nearbyWorkbenchRotationTarget).toBe(null);
    expect(state.workbenchRotationPrompt).toBe("");
    expect(state.destroyableObjectPrompt).toBe(null);
    expect(gameplay.findNearbyDestroyableObjectPrompt).not.toHaveBeenCalled();
    expect(getSelectedRotatableWorkbenchPlacement).not.toHaveBeenCalled();
    expect(getNearestRotatableWorkbenchPlacement).not.toHaveBeenCalled();
  });

  it("only resolves nearby workbench rotation when movement and flow state allow it", () => {
    const session = createSession();
    const nearbyWorkbenchRotationTarget = { id: "nearby-workbench" };
    const getNearestRotatableWorkbenchPlacement = vi.fn(() => nearbyWorkbenchRotationTarget);

    expect(resolveGameplayPromptTargetFrameState({
      session,
      inputModalityState: {},
      flowState: {},
      getNearestRotatableWorkbenchPlacement
    }).nearbyWorkbenchRotationTarget).toBe(nearbyWorkbenchRotationTarget);
    expect(getNearestRotatableWorkbenchPlacement).toHaveBeenCalledTimes(1);

    expect(resolveGameplayPromptTargetFrameState({
      session,
      inputModalityState: {},
      gameplayOpeningMovementLocked: true,
      flowState: {},
      getNearestRotatableWorkbenchPlacement
    }).nearbyWorkbenchRotationTarget).toBe(null);

    expect(resolveGameplayPromptTargetFrameState({
      session,
      inputModalityState: {},
      flowState: { cinematicActive: true },
      getNearestRotatableWorkbenchPlacement
    }).nearbyWorkbenchRotationTarget).toBe(null);
  });

  it("creates a runtime that prepares gameplay target, prompt and highlight frame state", () => {
    const activeQuest = { id: "quest-a" };
    const activeTask = { id: "task-a" };
    const activeSystemQuest = { id: "system-a" };
    const groundCell = { id: "ground-a" };
    const runtime = createGameplayPromptPreparationFrameRuntime({
      controls: {
        storyState: { flags: {} },
        inventory: {}
      },
      session: {
        ...createSession(),
        strawBedPlacementPreview: { active: true },
        greenhousePlacementPreview: { active: false },
        campfirePlacementPreview: { active: true },
        leafDenKitPlacementPreview: { active: false },
        groundDeadInstances: [],
        groundFlowerPatches: [],
        groundGrassPatches: [],
        groundPurifiedInstances: [],
        iceGroundInstances: []
      },
      gameplay: {
        getActiveQuest: vi.fn(() => activeQuest),
        getActiveTask: vi.fn(() => activeTask),
        getActiveSystemQuest: vi.fn(() => activeSystemQuest),
        findNearbyActionTarget: vi.fn(() => ({ groundCell })),
        findNearbyInteractable: vi.fn(() => ({ id: "interactable" })),
        findNearbyDestroyableObjectPrompt: vi.fn(() => null),
        isLeppaTreeTileHintFlashing: vi.fn(() => false),
        buildNearbyPrompt: vi.fn(() => "nearby"),
        getItemLabel: vi.fn()
      },
      getCurrentInputModalityState: () => ({ device: "keyboard" }),
      getPlayerCounterPromptText: () => "+1 Wood",
      getPendingSquirtleWaterGunGroundCells: () => [groundCell],
      getFreeRoamRestorationGroundCells: () => [],
      getLeppaTreeSurroundingGroundCells: () => [],
      buildSolarStationFieldMarkedGroundCells: () => [],
      getBoulderShadedTaskGroundCells: () => [],
      getGrowFirstHabitatTaskGroundCells: () => [],
      buildFoundationBuildZoneGroundCells: () => [],
      getWorldCellPlannerSelectedGroundCell: () => null,
      getWorkbenchRotationGroundCell: () => null,
      buildSolarStationPreviewPowerRadiusGroundCells: () => [],
      buildPlacedSolarStationPowerRadiusGroundCells: () => [],
      getGroundActionFeedbackFrame: () => null,
      getFieldToolTargetPulseFrame: () => ({ pulse: true })
    });

    const state = runtime.update({
      now: 1000,
      gameplayOpeningMovementLocked: false,
      gameplayOpeningHudHidden: false,
      flowState: { gameplayActive: true },
      equipmentState: {
        activeMoveId: "waterGun",
        waterGunEquipped: true,
        leafageEquipped: false,
        fireEquipped: false
      },
      placementPreviews: {
        solarStationPlacementPreview: { id: "solar" },
        greenhousePlacementPreview: { id: "greenhouse" },
        campfirePlacementPreview: { id: "campfire" },
        leafDenKitPlacementPreview: { id: "leaf-den" }
      },
      placementFootprints: {}
    });

    expect(state.activeQuest).toBe(activeQuest);
    expect(state.activeTask).toBe(activeTask);
    expect(state.activeSystemQuest).toBe(activeSystemQuest);
    expect(state.nearbyHarvestTarget).toEqual({ groundCell });
    expect(state.nearbyInteractable).toEqual({ id: "interactable" });
    expect(state.pendingWaterGunGroundCells).toEqual([groundCell]);
    expect(state.solarStationPlacementPreview).toEqual({ id: "solar" });
    expect(state.greenhousePlacementPreview).toBe(null);
    expect(state.campfirePlacementPreview).toEqual({ id: "campfire" });
    expect(state.leafDenKitPlacementPreview).toBe(null);
    expect(state.inputModalityState).toEqual({ device: "keyboard" });
    expect(state.playerCounterPromptText).toBe("+1 Wood");
    expect(state.groundCellHighlightFrameState).toEqual(expect.objectContaining({
      shouldShowGroundCellHighlight: true,
      fieldToolTargetPulseFrame: { pulse: true }
    }));
  });
});
