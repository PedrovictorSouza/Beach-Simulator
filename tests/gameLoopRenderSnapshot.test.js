import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopRenderSnapshotFrameRuntime
} from "../app/runtime/gameLoopRenderSnapshot.js";

describe("createGameLoopRenderSnapshotFrameRuntime", () => {
  it("wires render snapshot providers and frame runtimes for the game loop", () => {
    const getInteractionDebugColliders = vi.fn(() => []);
    const getMissionTargetPositionsById = vi.fn(() => []);
    const baseRenderSnapshotFrameRuntime = { update: vi.fn() };
    const renderSnapshotCompletionFrameRuntime = { update: vi.fn() };
    const gameplayRenderSnapshotFrameRuntime = { update: vi.fn() };
    const createInteractionDebugColliderProvider =
      vi.fn(() => getInteractionDebugColliders);
    const createMissionTargetPositionProvider =
      vi.fn(() => getMissionTargetPositionsById);
    const createRuntimeBundle = vi.fn(() => ({
      baseRenderSnapshotFrameRuntime,
      renderSnapshotCompletionFrameRuntime
    }));
    const createRenderFrameRuntime = vi.fn(() => gameplayRenderSnapshotFrameRuntime);
    const controls = { storyState: { flags: { ready: true } } };
    const session = { id: "session" };
    const rendering = { id: "rendering" };
    const foundationBuildZoneRuntime = {
      getBuildZoneCenterPosition: vi.fn(() => [3, 0, 4])
    };
    const construction = {
      companionRepairBoxModelRuntime: { id: "repair-box" },
      constructionHouseModelInstanceRuntime: { id: "house-models" },
      foundationBuildZoneRuntime,
      leafDenConstructionPresentationRuntime: { id: "leaf-den" }
    };
    const runtimes = {
      companionRenderFrameRuntime: { id: "companion-render" },
      naturePresentationFrameRuntime: { id: "nature" },
      squirtleReassemblyRuntime: { id: "squirtle" },
      treeRevivalLeafBurstFrameRuntime: { id: "leaf-burst" },
      worldSpacePresentationFrameRuntime: { id: "world-space" }
    };

    const runtime = createGameLoopRenderSnapshotFrameRuntime({
      camera: { id: "camera" },
      clamp: (value) => value,
      controls,
      gameFlowValues: { GAMEPLAY: "gameplay" },
      rendering,
      session,
      worldCanvas: { width: 320, height: 180 },
      construction,
      runtimes,
      createInteractionDebugColliderProvider,
      createMissionTargetPositionProvider,
      createRenderFrameRuntime,
      createRuntimeBundle
    });

    expect(runtime).toBe(gameplayRenderSnapshotFrameRuntime);
    expect(createInteractionDebugColliderProvider).toHaveBeenCalledWith({
      session,
      getStoryState: expect.any(Function),
      rendering
    });
    expect(createInteractionDebugColliderProvider.mock.calls[0][0].getStoryState())
      .toBe(controls.storyState);
    expect(createRuntimeBundle).toHaveBeenCalledWith(expect.objectContaining({
      camera: { id: "camera" },
      controls,
      gameFlowValues: { GAMEPLAY: "gameplay" },
      rendering,
      session,
      worldCanvas: { width: 320, height: 180 },
      construction: {
        companionRepairBoxModelRuntime: construction.companionRepairBoxModelRuntime,
        constructionHouseModelInstanceRuntime:
          construction.constructionHouseModelInstanceRuntime,
        leafDenConstructionPresentationRuntime:
          construction.leafDenConstructionPresentationRuntime
      },
      callbacks: {
        applyInteractionObjectHighlight: expect.any(Function),
        getGameplayOpeningShipSceneObjects: expect.any(Function),
        getInteractionDebugColliders,
        resolvePsxDistanceFogSettings: expect.any(Function)
      },
      runtimes: {
        squirtleReassemblyRuntime: runtimes.squirtleReassemblyRuntime,
        treeRevivalLeafBurstFrameRuntime: runtimes.treeRevivalLeafBurstFrameRuntime
      }
    }));
    expect(createMissionTargetPositionProvider).toHaveBeenCalledWith({
      session,
      getFreeBlockBuildZoneCenterPosition: expect.any(Function)
    });
    expect(createMissionTargetPositionProvider.mock.calls[0][0]
      .getFreeBlockBuildZoneCenterPosition()).toEqual([3, 0, 4]);
    expect(createRenderFrameRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls,
      session,
      rendering,
      construction: {
        leafDenConstructionPresentationRuntime:
          construction.leafDenConstructionPresentationRuntime
      },
      callbacks: {
        getMissionTargetPositionsById,
        isOpeningLeppaTreeRequestActive: expect.any(Function)
      },
      runtimes: {
        baseRenderSnapshotFrameRuntime,
        worldSpacePresentationFrameRuntime: runtimes.worldSpacePresentationFrameRuntime,
        naturePresentationFrameRuntime: runtimes.naturePresentationFrameRuntime,
        companionRenderFrameRuntime: runtimes.companionRenderFrameRuntime,
        renderSnapshotCompletionFrameRuntime
      }
    }));
  });
});
