import { describe, expect, it, vi } from "vitest";

import {
  BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
} from "../app/runtime/fieldMoveRuntime/fieldMoveGroundTargets.js";
import {
  createGameLoopRuntimeGraph
} from "../app/runtime/gameLoopRuntimeGraph.js";

describe("createGameLoopRuntimeGraph", () => {
  it("wires runtime bundles and deferred runtime lookups", () => {
    const startupRuntimeBundle = {
      audio: { id: "audio" },
      cameraDebugRuntime: { id: "camera-debug" },
      cameraZoomPresetController: { id: "zoom-controller" },
      companionConstructionBlockerRuntime: { id: "companion-blocker" },
      companionFacingRuntime: { id: "facing" },
      createFoundationBuildZoneCameraFocusRuntime: vi.fn(),
      createGameplayCameraFrameRuntime: vi.fn(),
      frameClock: { id: "clock" },
      freeBlockBuildSessionRuntime: { id: "free-block-session" },
      gearPickupParticleRuntime: { id: "gear-pickup" },
      gameplayCameraDirector: { id: "camera-director" },
      getCurrentInputModalityState: vi.fn(),
      getPlayerConstructionTerrainColliders: vi.fn(),
      getWorldCellPlannerSelectedGroundCell: vi.fn(),
      landscapeCutEffectRuntime: { id: "landscape-cut" },
      movementQuestRuntime: { id: "movement-quest" },
      naturePresentationFrameRuntime: { id: "nature-frame" },
      placementCameraAssist: { id: "placement-camera" },
      playGrowBotRevealSfx: vi.fn(),
      playInstanceObjectSfx: vi.fn(),
      playSoundEvent: vi.fn(() => "played"),
      playTreeBirthSfx: vi.fn(),
      playerCounterPromptRuntime: { id: "player-counter" },
      processWorldCellPlannerClick: vi.fn(),
      pushSupplyResourceCollectFeedback: vi.fn(),
      queueChangedSupplyPickupFlyItems: vi.fn(),
      queueSupplyPickupFlyItems: vi.fn(),
      rustlingGrassEventRuntime: { id: "rustling-grass" },
      solarStationPlacementBlockerRuntime: { id: "solar-blocker" },
      startNextQueuedSquirtleWaterGunAction: vi.fn(),
      supplyCounterPromptController: { id: "supply-counter" },
      treeRevivalLeafBurstFrameRuntime: { id: "tree-leaf-burst" },
      updateFoundationBuildZoneCameraFocus: vi.fn(),
      updateFrameAudio: vi.fn(),
      woodCollectPopRuntime: { id: "wood-pop" },
      worldCellPlannerInteractionRuntime: { id: "planner-interaction" },
      worldObjectPlacementBlockerRuntime: { id: "world-placement-blocker" },
      worldSceneSyncRuntime: { id: "world-scene-sync" }
    };
    const interactionPresentationRuntimeBundle = {
      beeFieldRuntime: { id: "bee-field" },
      buildBlockDebugOverlay: { id: "build-debug" },
      bulbasaurWorkbenchGuideRuntime: { id: "bulbasaur-guide" },
      companionAbilityResourcesRuntime: { id: "ability-resources" },
      companionFollowDirectionRuntime: { id: "follow-direction" },
      companionFollowMovementRuntime: { id: "follow-movement" },
      companionGroundPatrolFrameRuntime: { id: "ground-patrol" },
      companionIdleMotionRuntime: { id: "idle-motion" },
      companionModelSyncRuntime: { id: "model-sync" },
      companionRenderFrameRuntime: { id: "render-frame" },
      companionRepairBoxModelRuntime: { id: "repair-box-model" },
      companionWorldSpeechCueRuntime: { id: "speech-cue" },
      constructionHelperMotionRuntime: { id: "helper-motion" },
      constructionHouseModelInstanceRuntime: { id: "house-model" },
      fieldMoveActorPositionRuntime: { id: "field-actor-position" },
      fieldMoveApproachPositionRuntime: { id: "field-approach" },
      fieldMoveInvalidTargetPromptRuntime: { id: "invalid-target" },
      fpsPanelController: { id: "fps-panel" },
      frameSnapshotController: { id: "snapshot" },
      inputModalityPanelController: { id: "input-modality" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" },
      npcConversationFocusRuntime: { id: "npc-focus" },
      repairBoxMotionRuntime: { id: "repair-motion" },
      repairBoxRevealOpeningRuntime: { id: "repair-reveal" },
      runBreadcrumbPromptRuntime: { id: "run-breadcrumb" },
      snowstormFogRuntime: { id: "snowstorm-fog" },
      squirtleReassemblyRuntime: { id: "squirtle-reassembly" },
      waterGunSfxBurstRuntime: { id: "water-sfx" },
      workbenchRotationRuntime: { id: "workbench-rotation" }
    };
    const fieldPresentationRuntimeBundle = {
      buildBlockRuntime: { id: "build-block" },
      constructionPlacementControlRuntime: { id: "placement-control" },
      constructionPlacementFrameRuntime: { id: "placement-frame" },
      fireRuntime: { id: "fire" },
      gameplayRenderSnapshotFrameRuntime: { id: "render-snapshot" },
      leafageRuntime: { id: "leafage" },
      solarStationPowerRadiusRuntime: { id: "solar-radius" },
      waterGunRuntime: { id: "water-gun" }
    };
    const actorFrameRuntimeBundle = {
      companionFrameRuntime: { id: "companion-frame" },
      playerModelRuntime: { id: "player-model" },
      playerMovementFrameRuntime: { id: "player-movement" },
      playerResourceCollectionFrameRuntime: { id: "resource-collection" }
    };
    const frameEntryRuntimeBundle = {
      frameRuntime: { id: "frame" },
      gameplayCameraFrameRuntime: { id: "camera-frame" },
      gameplayInputFrameRuntime: { id: "input-frame" },
      gameplayInputRuntime: { id: "gameplay-input" },
      gameplayOpeningPresentationFrameRuntime: { id: "opening-frame" },
      gameplayOpeningRuntime: { id: "opening" }
    };
    const lateRuntimeBundle = {
      fieldMoveImpactRuntime: { id: "field-impact" },
      foundationBuildZoneCameraFocusRuntime: { id: "build-zone-camera" },
      foundationBuildZoneRuntime: {
        getBuildZoneCenterPosition: vi.fn(() => "build-zone-center")
      },
      freeBlockBuildRuntime: {
        getController: vi.fn(() => "free-block-controller"),
        syncPreview: vi.fn(() => "synced-preview")
      },
      gameplayPresentationSnapshotFrameRuntime: { id: "presentation-snapshot" },
      groundActionFeedbackRuntime: { id: "ground-feedback" },
      playerActionFrameRuntime: { id: "player-action-frame" },
      playerActionRuntime: { id: "player-action" }
    };

    const createStartupRuntime = vi.fn(() => startupRuntimeBundle);
    const createInteractionPresentationRuntime = vi.fn(
      () => interactionPresentationRuntimeBundle
    );
    const createFieldPresentationRuntime = vi.fn(
      () => fieldPresentationRuntimeBundle
    );
    const createActorFrameRuntime = vi.fn(() => actorFrameRuntimeBundle);
    const createFrameEntryRuntime = vi.fn(() => frameEntryRuntimeBundle);
    const createLateRuntime = vi.fn(() => lateRuntimeBundle);

    const result = createGameLoopRuntimeGraph({
      actTwoTutorial: { id: "tutorial" },
      camera: { id: "camera" },
      cameraOrbit: { id: "orbit" },
      cameraZoomPresets: [{ id: "zoom" }],
      colliderGizmos: { id: "gizmos" },
      controls: { id: "controls" },
      dialogueCamera: { id: "dialogue-camera" },
      fpsPanel: { id: "fps-panel-element" },
      gameFlowValues: { GAMEPLAY: "gameplay" },
      gameplay: { id: "gameplay" },
      gameplayDialogue: { id: "dialogue" },
      gameplayUiVisibility: { id: "ui-visibility" },
      groundCellHighlight: { id: "ground-highlight" },
      hud: { id: "hud" },
      inputModalityPanel: { id: "input-panel" },
      isGameFlow: vi.fn(),
      mount: { id: "mount" },
      pokedexUiState: { id: "pokedex" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      worldRenderer: { id: "renderer" },
      worldSpeech: { id: "speech" },
      createActorFrameRuntime,
      createFieldPresentationRuntime,
      createFrameEntryRuntime,
      createInteractionPresentationRuntime,
      createLateRuntime,
      createStartupRuntime
    });

    expect(result).toEqual({
      ...startupRuntimeBundle,
      ...interactionPresentationRuntimeBundle,
      ...fieldPresentationRuntimeBundle,
      ...actorFrameRuntimeBundle,
      ...frameEntryRuntimeBundle,
      ...lateRuntimeBundle
    });

    const startupArgs = createStartupRuntime.mock.calls[0][0];
    const interactionArgs =
      createInteractionPresentationRuntime.mock.calls[0][0];
    const fieldArgs = createFieldPresentationRuntime.mock.calls[0][0];
    const actorArgs = createActorFrameRuntime.mock.calls[0][0];
    const frameEntryArgs = createFrameEntryRuntime.mock.calls[0][0];
    const lateArgs = createLateRuntime.mock.calls[0][0];

    expect(startupArgs.callbacks.getSnowstormFogRuntime()).toBe(
      interactionPresentationRuntimeBundle.snowstormFogRuntime
    );
    expect(startupArgs.callbacks.getWaterGunRuntime()).toBe(
      fieldPresentationRuntimeBundle.waterGunRuntime
    );
    expect(startupArgs.callbacks.getGameplayInputRuntime()).toBe(
      frameEntryRuntimeBundle.gameplayInputRuntime
    );
    expect(startupArgs.callbacks.getFoundationBuildZoneCameraFocusRuntime()).toBe(
      lateRuntimeBundle.foundationBuildZoneCameraFocusRuntime
    );
    expect(startupArgs.callbacks.playSoundEvent("sfx")).toBe("played");
    expect(startupRuntimeBundle.playSoundEvent).toHaveBeenCalledWith("sfx");

    expect(interactionArgs.companionConstructionBlockerRuntime).toBe(
      startupRuntimeBundle.companionConstructionBlockerRuntime
    );
    expect(interactionArgs.worldSceneSyncRuntime).toBe(
      startupRuntimeBundle.worldSceneSyncRuntime
    );
    expect(interactionArgs.callbacks.getWaterGunRuntime()).toBe(
      fieldPresentationRuntimeBundle.waterGunRuntime
    );
    expect(interactionArgs.callbacks.playSoundEvent).toBe(
      startupRuntimeBundle.playSoundEvent
    );

    expect(fieldArgs.config).toEqual({
      restoredGrassMissionTargetCount:
        BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      waterGunFirstUsePromptFlag: "waterGunFirstUsePromptDismissed"
    });
    expect(fieldArgs.callbacks.getFieldMoveImpactRuntime()).toBe(
      lateRuntimeBundle.fieldMoveImpactRuntime
    );
    expect(fieldArgs.runtimes.buildBlockDebugOverlay).toBe(
      interactionPresentationRuntimeBundle.buildBlockDebugOverlay
    );
    expect(
      fieldArgs.construction.foundationBuildZoneRuntime
        .getBuildZoneCenterPosition()
    ).toBe("build-zone-center");
    expect(fieldArgs.construction.freeBlockBuildRuntime.getController()).toBe(
      "free-block-controller"
    );
    expect(fieldArgs.construction.freeBlockBuildRuntime.syncPreview()).toBe(
      "synced-preview"
    );

    expect(actorArgs.runtimes.waterGunRuntime).toBe(
      fieldPresentationRuntimeBundle.waterGunRuntime
    );
    expect(actorArgs.runtimes.beeFieldRuntime).toBe(
      interactionPresentationRuntimeBundle.beeFieldRuntime
    );
    expect(actorArgs.callbacks.queueSupplyPickupFlyItems).toBe(
      startupRuntimeBundle.queueSupplyPickupFlyItems
    );

    expect(frameEntryArgs.frameClock).toBe(startupRuntimeBundle.frameClock);
    expect(frameEntryArgs.frameSnapshotController).toBe(
      interactionPresentationRuntimeBundle.frameSnapshotController
    );
    expect(frameEntryArgs.createCameraFrameRuntime).toBe(
      startupRuntimeBundle.createGameplayCameraFrameRuntime
    );

    expect(lateArgs.runtimes.playerModelRuntime).toBe(
      actorFrameRuntimeBundle.playerModelRuntime
    );
    expect(lateArgs.runtimes.gameplayRenderSnapshotFrameRuntime).toBe(
      undefined
    );
    expect(lateArgs.gameplayRenderSnapshotFrameRuntime).toBe(
      fieldPresentationRuntimeBundle.gameplayRenderSnapshotFrameRuntime
    );
    expect(lateArgs.config).toEqual(fieldArgs.config);
  });
});
