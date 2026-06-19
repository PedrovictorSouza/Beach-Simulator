import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopActorFrameRuntimeBundle
} from "../app/runtime/gameLoopActorFrameRuntimes.js";

describe("createGameLoopActorFrameRuntimeBundle", () => {
  it("wires player and companion frame runtime bundles", () => {
    const playerFrameRuntimeBundle = {
      playerModelRuntime: { id: "player-model" },
      playerMovementFrameRuntime: { id: "player-movement" },
      playerResourceCollectionFrameRuntime: { id: "resource-collection" }
    };
    const companionFrameRuntimeBundle = {
      companionFrameRuntime: { id: "companion-frame" }
    };
    const createPlayerFrameRuntime = vi.fn(() => playerFrameRuntimeBundle);
    const createCompanionFrameRuntime = vi.fn(() => companionFrameRuntimeBundle);
    const callbacks = {
      playSoundEvent: vi.fn(),
      pushSupplyResourceCollectFeedback: vi.fn(),
      queueSupplyPickupFlyItems: vi.fn()
    };
    const math = {
      moveValueToward: vi.fn(),
      rotateAngleToward: vi.fn()
    };
    const runtimes = {
      beeFieldRuntime: { id: "bee-field" },
      buildBlockRuntime: { id: "build-block" },
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionAbilityResourcesRuntime: { id: "abilities" },
      companionFollowDirectionRuntime: { id: "follow-direction" },
      companionFollowMovementRuntime: { id: "follow-movement" },
      companionGroundPatrolFrameRuntime: { id: "patrol" },
      companionIdleMotionRuntime: { id: "idle" },
      companionModelSyncRuntime: { id: "sync" },
      companionRepairBoxModelRuntime: { id: "repair-model" },
      constructionHelperMotionRuntime: { id: "helper-motion" },
      fireRuntime: { id: "fire" },
      gearPickupParticleRuntime: { id: "gear" },
      leafageRuntime: { id: "leafage" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" },
      movementQuestRuntime: { id: "movement-quest" },
      repairBoxRevealOpeningRuntime: { id: "repair-reveal" },
      runBreadcrumbPromptRuntime: { id: "run-breadcrumb" },
      squirtleReassemblyRuntime: { id: "squirtle" },
      supplyCounterPromptController: { id: "supply-counter" },
      waterGunRuntime: { id: "water-gun" },
      waterGunSfxBurstRuntime: { id: "water-sfx" },
      woodCollectPopRuntime: { id: "wood-pop" }
    };

    const result = createGameLoopActorFrameRuntimeBundle({
      audio: { id: "audio" },
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresetController: { id: "zoom" },
      controls: { id: "controls" },
      gameFlowValues: { GAMEPLAY: "gameplay" },
      gameplay: { id: "gameplay" },
      gameplayDialogue: { id: "dialogue" },
      hud: { id: "hud" },
      isGameFlow: vi.fn(),
      rendering: { id: "rendering" },
      session: { id: "session" },
      callbacks,
      math,
      runtimes,
      createCompanionFrameRuntime,
      createPlayerFrameRuntime
    });

    expect(result).toEqual({
      ...playerFrameRuntimeBundle,
      ...companionFrameRuntimeBundle
    });
    expect(createPlayerFrameRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks,
        math,
        runtimes: expect.objectContaining({
          companionFollowDirectionRuntime:
            runtimes.companionFollowDirectionRuntime,
          movementQuestRuntime: runtimes.movementQuestRuntime,
          supplyCounterPromptController:
            runtimes.supplyCounterPromptController
        })
      })
    );
    expect(createCompanionFrameRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: expect.objectContaining({
          buildBlockRuntime: runtimes.buildBlockRuntime,
          companionModelSyncRuntime: runtimes.companionModelSyncRuntime,
          gameplayDialogue: { id: "dialogue" },
          waterGunRuntime: runtimes.waterGunRuntime
        })
      })
    );
  });
});
