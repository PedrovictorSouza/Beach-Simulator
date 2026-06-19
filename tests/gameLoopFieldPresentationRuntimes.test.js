import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFieldPresentationRuntimeBundle
} from "../app/runtime/gameLoopFieldPresentationRuntimes.js";

describe("createGameLoopFieldPresentationRuntimeBundle", () => {
  it("wires field moves, placement, world-space presentation and render snapshot", () => {
    const fieldMoveRuntimeBundle = {
      buildBlockRuntime: { id: "build-block" },
      fireRuntime: { id: "fire" },
      leafageRuntime: { id: "leafage" },
      waterGunRuntime: { id: "water-gun" }
    };
    const constructionPlacementRuntimeBundle = {
      constructionPlacementControlRuntime: { id: "placement-control" },
      constructionPlacementFrameRuntime: { id: "placement-frame" },
      solarStationPowerRadiusRuntime: { id: "solar-radius" }
    };
    const worldSpacePresentationFrameRuntime = { id: "world-space" };
    const gameplayRenderSnapshotFrameRuntime = { id: "render-snapshot" };
    const createFieldMoveRuntime = vi.fn(() => fieldMoveRuntimeBundle);
    const createConstructionPlacementRuntime =
      vi.fn(() => constructionPlacementRuntimeBundle);
    const createWorldSpacePresentationRuntime =
      vi.fn(() => worldSpacePresentationFrameRuntime);
    const createRenderSnapshotRuntime =
      vi.fn(() => gameplayRenderSnapshotFrameRuntime);
    const callbacks = {
      getFieldMoveImpactRuntime: vi.fn(),
      getFreeBlockBuildRuntime: vi.fn(),
      playSoundEvent: vi.fn()
    };
    const config = {
      restoredGrassMissionTargetCount: 10,
      waterGunFirstUsePromptFlag: "waterGunPrompt"
    };
    const construction = {
      foundationBuildZoneRuntime: { id: "foundation-zone" },
      freeBlockBuildRuntime: { id: "free-block" }
    };
    const runtimes = {
      buildBlockDebugOverlay: { id: "debug" },
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionAbilityResourcesRuntime: { id: "abilities" },
      companionConstructionBlockerRuntime: { id: "blocker" },
      companionFacingRuntime: { id: "facing" },
      companionModelSyncRuntime: { id: "sync" },
      companionRenderFrameRuntime: { id: "companion-render" },
      companionRepairBoxModelRuntime: { id: "repair-model" },
      companionWorldSpeechCueRuntime: { id: "speech" },
      constructionHouseModelInstanceRuntime: { id: "houses" },
      fieldMoveActorPositionRuntime: { id: "actor-position" },
      fieldMoveApproachPositionRuntime: { id: "approach" },
      fieldMoveInvalidTargetPromptRuntime: { id: "invalid-prompt" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" },
      naturePresentationFrameRuntime: { id: "nature" },
      runBreadcrumbPromptRuntime: { id: "run-breadcrumb" },
      solarStationPlacementBlockerRuntime: { id: "solar-blocker" },
      squirtleReassemblyRuntime: { id: "squirtle" },
      treeRevivalLeafBurstFrameRuntime: { id: "tree-burst" },
      workbenchRotationRuntime: { id: "workbench" },
      worldSceneSyncRuntime: { id: "world-scene" }
    };

    const result = createGameLoopFieldPresentationRuntimeBundle({
      camera: { id: "camera" },
      clamp01: vi.fn(),
      controls: { id: "controls" },
      gameFlowValues: { GAMEPLAY: "gameplay" },
      gameplay: { id: "gameplay" },
      hud: { id: "hud" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      callbacks,
      config,
      construction,
      runtimes,
      createConstructionPlacementRuntime,
      createFieldMoveRuntime,
      createRenderSnapshotRuntime,
      createWorldSpacePresentationRuntime
    });

    expect(result).toEqual({
      ...fieldMoveRuntimeBundle,
      ...constructionPlacementRuntimeBundle,
      gameplayRenderSnapshotFrameRuntime,
      worldSpacePresentationFrameRuntime
    });
    expect(createFieldMoveRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        callbacks: {
          getFieldMoveImpactRuntime: callbacks.getFieldMoveImpactRuntime,
          getFreeBlockBuildRuntime: callbacks.getFreeBlockBuildRuntime
        },
        runtimes: expect.objectContaining({
          companionFacingRuntime: runtimes.companionFacingRuntime,
          fieldMoveApproachPositionRuntime:
            runtimes.fieldMoveApproachPositionRuntime
        })
      })
    );
    expect(createConstructionPlacementRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: expect.objectContaining({
          buildBlockRuntime: fieldMoveRuntimeBundle.buildBlockRuntime,
          freeBlockBuildRuntime: construction.freeBlockBuildRuntime
        }),
        callbacks: {
          playSoundEvent: callbacks.playSoundEvent
        }
      })
    );
    expect(createWorldSpacePresentationRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimes: expect.objectContaining({
          constructionPlacementControlRuntime:
            constructionPlacementRuntimeBundle
              .constructionPlacementControlRuntime,
          fieldMoveActorPositionRuntime:
            runtimes.fieldMoveActorPositionRuntime
        }),
        callbacks: expect.objectContaining({
          getEncounterRepairBoxPosition: expect.any(Function),
          getLeppaTreeSurroundingGroundCells: expect.any(Function),
          playSoundEvent: callbacks.playSoundEvent
        }),
        config
      })
    );
    expect(createRenderSnapshotRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        construction: expect.objectContaining({
          foundationBuildZoneRuntime: construction.foundationBuildZoneRuntime,
          leafDenConstructionPresentationRuntime:
            runtimes.leafDenConstructionPresentationRuntime
        }),
        runtimes: expect.objectContaining({
          worldSpacePresentationFrameRuntime,
          treeRevivalLeafBurstFrameRuntime:
            runtimes.treeRevivalLeafBurstFrameRuntime
        })
      })
    );
  });
});
