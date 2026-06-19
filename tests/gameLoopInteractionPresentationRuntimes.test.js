import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopInteractionPresentationRuntimeBundle
} from "../app/runtime/gameLoopInteractionPresentationRuntimes.js";

describe("createGameLoopInteractionPresentationRuntimeBundle", () => {
  it("wires interaction, utility, companion presentation and scene runtimes", () => {
    const companionSupportRuntimeBundle = {
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionFollowDirectionRuntime: { id: "direction" },
      companionFollowMovementRuntime: { id: "movement" },
      companionGroundPatrolFrameRuntime: { id: "patrol" },
      companionIdleMotionRuntime: { id: "idle" },
      companionWorldSpeechCueRuntime: { id: "speech" },
      fieldMoveActorPositionRuntime: { id: "actor-position" },
      fieldMoveApproachPositionRuntime: { id: "approach" },
      fieldMoveInvalidTargetPromptRuntime: { id: "invalid-prompt" },
      runBreadcrumbPromptRuntime: { id: "run-breadcrumb" }
    };
    const worldInteractionRuntimeBundle = {
      repairBoxRevealOpeningRuntime: { id: "repair-box-reveal" },
      workbenchRotationRuntime: { id: "workbench-rotation" }
    };
    const utilityRuntimeBundle = {
      buildBlockDebugOverlay: { id: "debug-overlay" },
      fpsPanelController: { id: "fps" },
      frameSnapshotController: { id: "snapshot" },
      inputModalityPanelController: { id: "input-panel" },
      snowstormFogRuntime: { id: "snowstorm" },
      waterGunSfxBurstRuntime: { id: "water-sfx" }
    };
    const companionModelSyncRuntime = {
      syncBulbasaur: vi.fn(),
      syncSquirtle: vi.fn()
    };
    const companionPresentationRuntimeBundle = {
      beeFieldRuntime: { id: "bee-field" },
      companionAbilityResourcesRuntime: { id: "abilities" },
      companionModelSyncRuntime,
      companionRenderFrameRuntime: { id: "render-frame" },
      companionRepairBoxModelRuntime: { id: "repair-box-model" },
      repairBoxMotionRuntime: { id: "repair-box-motion" },
      squirtleReassemblyRuntime: { id: "squirtle-reassembly" }
    };
    const scenePresentationRuntimeBundle = {
      constructionHelperMotionRuntime: { id: "helper-motion" },
      constructionHouseModelInstanceRuntime: { id: "house-models" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" },
      npcConversationFocusRuntime: { id: "npc-focus" }
    };
    const createCompanionSupportRuntime =
      vi.fn(() => companionSupportRuntimeBundle);
    const createWorldInteractionRuntime =
      vi.fn(() => worldInteractionRuntimeBundle);
    const createUtilityRuntime = vi.fn(() => utilityRuntimeBundle);
    const createCompanionPresentationRuntime =
      vi.fn(() => companionPresentationRuntimeBundle);
    const createScenePresentationRuntime =
      vi.fn(() => scenePresentationRuntimeBundle);
    const callbacks = {
      getCurrentInputModalityState: vi.fn(),
      getNowMs: vi.fn(),
      getNowSeconds: vi.fn(),
      getWaterGunRuntime: vi.fn(),
      playGrowBotRevealSfx: vi.fn(),
      playSoundEvent: vi.fn(),
      startNextQueuedSquirtleWaterGunAction: vi.fn()
    };
    const math = {
      easeOutCubic: vi.fn(),
      lerp: vi.fn(),
      moveValueToward: vi.fn()
    };

    const result = createGameLoopInteractionPresentationRuntimeBundle({
      actTwoTutorial: { id: "tutorial" },
      camera: { id: "camera" },
      clamp01: vi.fn(),
      colliderGizmos: { id: "colliders" },
      companionConstructionBlockerRuntime: { id: "blocker" },
      companionFacingRuntime: { id: "facing" },
      controls: { id: "controls" },
      dialogueCamera: { id: "dialogue-camera" },
      fpsPanel: { id: "fps-panel" },
      gameplayDialogue: { id: "dialogue" },
      groundCellHighlight: { id: "highlight" },
      hud: { id: "hud" },
      inputModalityPanel: { id: "input-panel-root" },
      mount: { id: "mount" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      worldRenderer: { id: "renderer" },
      worldSceneSyncRuntime: { id: "world-scene" },
      worldSpeech: { id: "speech-root" },
      callbacks,
      math,
      createCompanionPresentationRuntime,
      createCompanionSupportRuntime,
      createScenePresentationRuntime,
      createUtilityRuntime,
      createWorldInteractionRuntime
    });

    expect(result).toEqual({
      ...companionSupportRuntimeBundle,
      ...worldInteractionRuntimeBundle,
      ...utilityRuntimeBundle,
      ...companionPresentationRuntimeBundle,
      ...scenePresentationRuntimeBundle
    });
    expect(createCompanionSupportRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          getWaterGunRuntime: callbacks.getWaterGunRuntime
        },
        runtimes: expect.objectContaining({
          companionConstructionBlockerRuntime: { id: "blocker" },
          companionFacingRuntime: { id: "facing" },
          companionModelSyncRuntime: expect.any(Object)
        })
      })
    );
    expect(createWorldInteractionRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: expect.objectContaining({
          getCurrentInputModalityState: callbacks.getCurrentInputModalityState,
          playGrowBotRevealSfx: callbacks.playGrowBotRevealSfx,
          playSoundEvent: callbacks.playSoundEvent
        })
      })
    );
    expect(createCompanionPresentationRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: {
          fieldMoveActorPositionRuntime:
            companionSupportRuntimeBundle.fieldMoveActorPositionRuntime,
          worldSceneSyncRuntime: { id: "world-scene" }
        },
        callbacks: {
          onSquirtleRechargeComplete:
            callbacks.startNextQueuedSquirtleWaterGunAction
        },
        math: expect.objectContaining(math)
      })
    );
    expect(createScenePresentationRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        workbenchRotationRuntime:
          worldInteractionRuntimeBundle.workbenchRotationRuntime,
        callbacks: {
          getNowMs: callbacks.getNowMs,
          getNowSeconds: callbacks.getNowSeconds
        }
      })
    );

    const companionModelSyncRuntimeProxy =
      createCompanionSupportRuntime.mock.calls[0][0]
        .runtimes.companionModelSyncRuntime;
    companionModelSyncRuntimeProxy.syncBulbasaur("bulba");
    companionModelSyncRuntimeProxy.syncSquirtle("squirtle");

    expect(companionModelSyncRuntime.syncBulbasaur)
      .toHaveBeenCalledWith("bulba");
    expect(companionModelSyncRuntime.syncSquirtle)
      .toHaveBeenCalledWith("squirtle");
  });
});
