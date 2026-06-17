import { describe, expect, it, vi } from "vitest";
import { createRenderSnapshotRuntimeBundle } from "../app/runtime/presentation/renderSnapshotRuntimeBundle.js";

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
});
