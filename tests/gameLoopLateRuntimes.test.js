import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopLateRuntimeBundle
} from "../app/runtime/gameLoopLateRuntimes.js";

describe("createGameLoopLateRuntimeBundle", () => {
  it("wires construction, action, presentation, and impact runtimes in order", () => {
    const constructionBuildRuntimeBundle = {
      groundActionFeedbackRuntime: { id: "ground-feedback" },
      foundationBuildZoneCameraFocusRuntime: { id: "camera-focus" },
      foundationBuildZoneRuntime: { id: "foundation-zone" },
      freeBlockBuildRuntime: { id: "free-block" }
    };
    const playerActionRuntimeBundle = {
      playerActionFrameRuntime: { id: "player-action-frame" },
      playerActionRuntime: { id: "player-action" }
    };
    const gameplayPresentationSnapshotFrameRuntime = { id: "presentation" };
    const fieldMoveImpactRuntime = { id: "impact" };
    const createConstructionBuildRuntime =
      vi.fn(() => constructionBuildRuntimeBundle);
    const createPlayerActionRuntime = vi.fn(() => playerActionRuntimeBundle);
    const createPresentationSnapshotRuntime =
      vi.fn(() => gameplayPresentationSnapshotFrameRuntime);
    const createFieldMoveImpactRuntime = vi.fn(() => fieldMoveImpactRuntime);
    const landscapeCutEffectRuntime = {
      queue: vi.fn()
    };
    const treeRevivalLeafBurstFrameRuntime = {
      queueForNewlyRevivedTrees: vi.fn()
    };
    const callbacks = {
      createFoundationBuildZoneCameraFocusRuntime: vi.fn(),
      debugInteractionFlow: vi.fn(),
      getCurrentInputModalityState: vi.fn(),
      getNowMs: vi.fn(() => 1000),
      getNowSeconds: vi.fn(() => 1),
      getTerrainColliders: vi.fn(),
      getWorldCellPlannerSelectedGroundCell: vi.fn(),
      playInstanceObjectSfx: vi.fn(),
      playSoundEvent: vi.fn(),
      playTreeBirthSfx: vi.fn(),
      queueChangedSupplyPickupFlyItems: vi.fn()
    };
    const runtimes = {
      buildBlockRuntime: { id: "build-block" },
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionAbilityResourcesRuntime: { id: "abilities" },
      companionConstructionBlockerRuntime: { id: "blocker" },
      constructionPlacementControlRuntime: { id: "placement" },
      fieldMoveInvalidTargetPromptRuntime: { id: "invalid-prompt" },
      fireRuntime: { id: "fire" },
      freeBlockBuildSessionRuntime: { id: "free-block-session" },
      leafageRuntime: { id: "leafage" },
      leafDenConstructionPresentationRuntime: {
        isBusyCompanionTarget: vi.fn()
      },
      landscapeCutEffectRuntime,
      npcConversationFocusRuntime: {
        handleInteractionStart: vi.fn()
      },
      playerCounterPromptRuntime: { id: "counter-prompt" },
      playerModelRuntime: { id: "player-model" },
      solarStationPowerRadiusRuntime: { id: "solar-radius" },
      supplyCounterPromptController: { id: "supply-counter" },
      treeRevivalLeafBurstFrameRuntime,
      waterGunRuntime: { id: "water-gun" },
      waterGunSfxBurstRuntime: { id: "water-sfx" },
      workbenchRotationRuntime: { id: "workbench" },
      worldObjectPlacementBlockerRuntime: { id: "world-blocker" }
    };

    const result = createGameLoopLateRuntimeBundle({
      audio: { id: "audio" },
      clamp01: vi.fn(),
      controls: { id: "controls" },
      gameplay: { id: "gameplay" },
      gameplayRenderSnapshotFrameRuntime: { id: "render-snapshot" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      callbacks,
      config: {
        restoredGrassMissionTargetCount: 10,
        waterGunFirstUsePromptFlag: "waterGunPrompt"
      },
      runtimes,
      createConstructionBuildRuntime,
      createFieldMoveImpactRuntime,
      createPlayerActionRuntime,
      createPresentationSnapshotRuntime
    });

    expect(result).toEqual({
      ...constructionBuildRuntimeBundle,
      ...playerActionRuntimeBundle,
      fieldMoveImpactRuntime,
      gameplayPresentationSnapshotFrameRuntime
    });
    expect(createConstructionBuildRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: expect.objectContaining({
          playPlacedSound: callbacks.playInstanceObjectSfx,
          playSoundEvent: callbacks.playSoundEvent
        }),
        runtimes: expect.objectContaining({
          companionConstructionBlockerRuntime:
            runtimes.companionConstructionBlockerRuntime,
          freeBlockBuildSessionRuntime: runtimes.freeBlockBuildSessionRuntime,
          playerModelRuntime: runtimes.playerModelRuntime,
          worldObjectPlacementBlockerRuntime:
            runtimes.worldObjectPlacementBlockerRuntime
        })
      })
    );
    expect(createPlayerActionRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: expect.objectContaining({
          freeBlockBuildRuntime:
            constructionBuildRuntimeBundle.freeBlockBuildRuntime,
          groundActionFeedbackRuntime:
            constructionBuildRuntimeBundle.groundActionFeedbackRuntime
        }),
        config: {
          restoredGrassMissionTargetCount: 10,
          waterGunFirstUsePromptFlag: "waterGunPrompt"
        }
      })
    );
    expect(createPresentationSnapshotRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        gameplayRenderSnapshotFrameRuntime: { id: "render-snapshot" },
        runtimes: expect.objectContaining({
          foundationBuildZoneRuntime:
            constructionBuildRuntimeBundle.foundationBuildZoneRuntime,
          groundActionFeedbackRuntime:
            constructionBuildRuntimeBundle.groundActionFeedbackRuntime
        })
      })
    );
    expect(createFieldMoveImpactRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: expect.objectContaining({
          playerActionRuntime: playerActionRuntimeBundle.playerActionRuntime,
          groundActionFeedbackRuntime:
            constructionBuildRuntimeBundle.groundActionFeedbackRuntime
        })
      })
    );

    const playerActionCallbacks =
      createPlayerActionRuntime.mock.calls[0][0].callbacks;
    playerActionCallbacks.queueLandscapeCutEffect("patch");
    playerActionCallbacks.queueTreeRevivalLeafBurst("snapshot");

    expect(landscapeCutEffectRuntime.queue).toHaveBeenCalledWith("patch");
    expect(treeRevivalLeafBurstFrameRuntime.queueForNewlyRevivedTrees)
      .toHaveBeenCalledWith("snapshot");
  });
});
