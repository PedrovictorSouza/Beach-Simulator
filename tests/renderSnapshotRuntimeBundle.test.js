import { describe, expect, it, vi } from "vitest";
import {
  createGameplayRenderSnapshotFrameRuntime,
  createRenderSnapshotRuntimeBundle
} from "../app/runtime/presentation/renderSnapshotRuntimeBundle.js";

describe("createRenderSnapshotRuntimeBundle", () => {
  it("wires base and completion render snapshot runtimes through presentation dependencies", () => {
    const baseRenderSnapshotFrameRuntime = { update: vi.fn() };
    const renderSnapshotCompletionFrameRuntime = { update: vi.fn() };
    const createBaseRuntime = vi.fn(() => baseRenderSnapshotFrameRuntime);
    const createCompletionRuntime = vi.fn(() => renderSnapshotCompletionFrameRuntime);
    const session = { id: "session-a" };
    const companionRepairBoxModelRuntime = {
      syncSessionActiveHighlight: vi.fn()
    };
    const constructionHouseModelInstanceRuntime = {
      syncCampfireTrainHouse: vi.fn(),
      syncGreenhouse: vi.fn(),
      syncLeafDen: vi.fn(),
      syncPlayerHouses: vi.fn()
    };
    const leafDenConstructionPresentationRuntime = {
      get active() {
        return true;
      },
      isActive: vi.fn(() => true),
      syncCloudBurstEffects: vi.fn(),
      syncConstructionClouds: vi.fn()
    };
    const squirtleReassemblyRuntime = {
      getSceneObjects: vi.fn(() => ["squirtle-scene"])
    };
    const treeRevivalLeafBurstFrameRuntime = {
      appendBillboards: vi.fn()
    };
    const callbacks = {
      applyInteractionObjectHighlight: vi.fn(),
      getGameplayOpeningShipSceneObjects: vi.fn(() => ["ship-scene"]),
      getInteractionDebugColliders: vi.fn(() => []),
      resolvePsxDistanceFogSettings: vi.fn(() => ({ enabled: false }))
    };

    const result = createRenderSnapshotRuntimeBundle({
      camera: { id: "camera" },
      controls: { id: "controls" },
      createBaseRuntime,
      createCompletionRuntime,
      gameFlowValues: { GAMEPLAY: "gameplay" },
      rendering: { id: "rendering" },
      session,
      worldCanvas: { width: 100, height: 100 },
      construction: {
        companionRepairBoxModelRuntime,
        constructionHouseModelInstanceRuntime,
        leafDenConstructionPresentationRuntime
      },
      callbacks,
      runtimes: {
        squirtleReassemblyRuntime,
        treeRevivalLeafBurstFrameRuntime
      }
    });

    expect(result).toEqual({
      baseRenderSnapshotFrameRuntime,
      renderSnapshotCompletionFrameRuntime
    });
    expect(createBaseRuntime).toHaveBeenCalledWith(expect.objectContaining({
      applyInteractionObjectHighlight: callbacks.applyInteractionObjectHighlight,
      controls: { id: "controls" },
      gameFlowValues: { GAMEPLAY: "gameplay" },
      session,
      worldCanvas: { width: 100, height: 100 }
    }));
    expect(createCompletionRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls: { id: "controls" },
      getInteractionDebugColliders: callbacks.getInteractionDebugColliders,
      rendering: { id: "rendering" },
      session,
      treeRevivalLeafBurstFrameRuntime
    }));

    const baseOptions = createBaseRuntime.mock.calls[0][0];
    baseOptions.construction.syncActiveRepairBoxHighlight();
    expect(companionRepairBoxModelRuntime.syncSessionActiveHighlight)
      .toHaveBeenCalledWith(session);
    expect(baseOptions.construction.syncGreenhouseModelInstance)
      .toBe(constructionHouseModelInstanceRuntime.syncGreenhouse);
    expect(baseOptions.construction.syncCampfireTrainHouseModelInstance)
      .toBe(constructionHouseModelInstanceRuntime.syncCampfireTrainHouse);
    expect(baseOptions.construction.isLeafDenConstructionActive()).toBe(true);
    expect(baseOptions.construction.syncLeafDenConstructionClouds)
      .toBe(leafDenConstructionPresentationRuntime.syncConstructionClouds);
    expect(baseOptions.construction.syncConstructionCloudBurstEffects)
      .toBe(leafDenConstructionPresentationRuntime.syncCloudBurstEffects);
    expect(baseOptions.construction.syncLeafDenModelInstance)
      .toBe(constructionHouseModelInstanceRuntime.syncLeafDen);
    expect(baseOptions.construction.syncPlayerHouseModelInstances)
      .toBe(constructionHouseModelInstanceRuntime.syncPlayerHouses);

    expect(baseOptions.getSquirtleAssemblySceneObjects(["scene"], { id: "squirtle" }))
      .toEqual(["squirtle-scene"]);
    expect(squirtleReassemblyRuntime.getSceneObjects)
      .toHaveBeenCalledWith(["scene"], { id: "squirtle" });
  });

  it("updates gameplay render snapshot channels in the existing frame order", () => {
    const order = [];
    const nextFrame = {
      hud: {},
      render: {
        genericBillboards: []
      }
    };
    const controls = {
      storyState: { flags: {} },
      inventory: { wood: 2 }
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [1, 0.04, 2])
      }
    };
    const baseRenderSnapshotFrameRuntime = {
      update: vi.fn(() => order.push("base"))
    };
    const worldSpacePresentationFrameRuntime = {
      update: vi.fn(() => {
        order.push("world-space");
        return { canShowWorldSpaceUi: true };
      })
    };
    const naturePresentationFrameRuntime = {
      update: vi.fn(() => {
        order.push("nature");
        return {
          grassBendPlayerPosition: [1, 0, 2],
          natureRenderCenter: [1, 0, 2]
        };
      })
    };
    const companionRenderFrameRuntime = {
      update: vi.fn(() => order.push("companion"))
    };
    const renderSnapshotCompletionFrameRuntime = {
      update: vi.fn(() => order.push("completion"))
    };
    const updateHudSnapshot = vi.fn(() => order.push("hud"));
    const updateWorldObjectBillboards = vi.fn(() => order.push("world-objects"));
    const getMissionTargetPositionsById = vi.fn(() => [[5, 0, 6]]);
    const leafDenConstructionPresentationRuntime = {
      getConstructionBillboards: vi.fn(() => []),
      getCloudBurstBillboards: vi.fn(() => [])
    };
    const runtime = createGameplayRenderSnapshotFrameRuntime({
      controls,
      session,
      rendering: { fullUvRect: [0, 0, 1, 1] },
      clamp: vi.fn((value) => value),
      construction: {
        leafDenConstructionPresentationRuntime
      },
      callbacks: {
        getMissionTargetPositionsById,
        isOpeningLeppaTreeRequestActive: vi.fn(() => true)
      },
      runtimes: {
        baseRenderSnapshotFrameRuntime,
        worldSpacePresentationFrameRuntime,
        naturePresentationFrameRuntime,
        companionRenderFrameRuntime,
        renderSnapshotCompletionFrameRuntime
      },
      updates: {
        updateHudSnapshotFrame: updateHudSnapshot,
        updateWorldObjectBillboardFrame: updateWorldObjectBillboards
      }
    });

    const result = runtime.update({
      nextFrame,
      now: 123,
      deltaTime: 0.016,
      gameplayOpeningCameraLocked: false,
      gameplayOpeningHudHidden: false,
      currentFlowState: {
        cinematicActive: false,
        tutorialActive: false,
        pokedexModalOpen: false,
        skillLearnActive: false
      },
      playerActionState: {
        activeMoveId: "waterGun",
        buildBlockEquipped: false,
        fireEquipped: false,
        waterGunEquipped: true,
        leafageEquipped: false
      },
      promptPreparationFrame: {
        inputModalityState: { current: "keyboard" },
        solarStationPlacementPreview: null,
        greenhousePlacementPreview: null,
        campfirePlacementPreview: { active: true },
        leafDenKitPlacementPreview: null,
        pendingPlacementPrompt: "place",
        workbenchRotationPrompt: "rotate",
        destroyableObjectPrompt: "cut",
        transientNoticeRoute: null,
        playerCounterPromptText: "counter",
        pendingPlacementIntent: { kind: "campfire" },
        nearbyHarvestTarget: { id: "harvest" },
        nearbyWorkbenchRotationTarget: { id: "workbench" },
        nearbyInteractable: { id: "npc" },
        activeQuest: { id: "quest" },
        activeTask: { id: "task" },
        activeSystemQuest: { id: "system" },
        promptCopy: "Prompt",
        groundCellHighlightFrameState: { cells: [] }
      },
      freeBlockPreviewTarget: { id: "block" },
      chopperBulbasaurRepairBoxInvestigationTarget: { id: "box" },
      firstTaughtActionFreedomWindowActive: true
    });

    expect(order).toEqual([
      "hud",
      "base",
      "world-space",
      "nature",
      "world-objects",
      "companion",
      "completion"
    ]);
    expect(updateHudSnapshot).toHaveBeenCalledWith(nextFrame, expect.objectContaining({
      storyState: controls.storyState,
      inventory: controls.inventory,
      playerPosition: [1, 0.04, 2],
      promptCopy: "Prompt",
      inputModalityState: { current: "keyboard" }
    }));
    expect(worldSpacePresentationFrameRuntime.update).toHaveBeenCalledWith(expect.objectContaining({
      nextFrame,
      activeMoveId: "waterGun",
      promptState: expect.objectContaining({
        openingLeppaTreeRequestActive: true
      }),
      frameBlockers: expect.objectContaining({
        gameplayOpeningCameraLocked: false,
        cinematicActive: false,
        tutorialActive: false,
        pokedexModalOpen: false
      })
    }));
    expect(updateWorldObjectBillboards).toHaveBeenCalledWith(expect.objectContaining({
      canShowWorldSpaceUi: true,
      activeQuest: { id: "quest" },
      campfirePlacementPreview: { active: true },
      getMissionTargetPositionsById
    }));
    expect(companionRenderFrameRuntime.update).toHaveBeenCalledWith({
      nextFrame,
      activeMoveId: "waterGun",
      now: 123
    });
    expect(renderSnapshotCompletionFrameRuntime.update)
      .toHaveBeenCalledWith(nextFrame, { deltaTime: 0.016 });
    expect(result).toEqual({
      canShowWorldSpaceUi: true,
      grassBendPlayerPosition: [1, 0, 2],
      natureRenderCenter: [1, 0, 2]
    });
  });
});
