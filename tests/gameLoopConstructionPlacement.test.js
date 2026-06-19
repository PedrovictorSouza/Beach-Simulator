import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopConstructionPlacementRuntimeBundle
} from "../app/runtime/gameLoopConstructionPlacement.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopConstructionPlacementRuntimeBundle", () => {
  it("builds the construction placement boundary used by the game loop", () => {
    const createdRuntime = { constructionPlacementFrameRuntime: {} };
    const createRuntime = vi.fn(() => createdRuntime);
    const camera = {
      getMovementAxes: vi.fn(() => ({ forward: [0, 0, 1] }))
    };
    const controls = { id: "controls" };
    const session = { id: "session" };
    const hud = {
      pushNotice: vi.fn()
    };
    const playSoundEvent = vi.fn();
    const cancelActivePlacementPreviews = vi.fn();
    const createPlacementPreviewCancellation = vi.fn(() => cancelActivePlacementPreviews);
    const buildBlockDebugOverlay = {
      update: vi.fn()
    };
    const materialCost = { wood: 2 };
    const freeBlockBuildRuntime = {
      getController: vi.fn(() => ({
        getSelectedBlockMaterialCost: vi.fn(() => materialCost)
      })),
      syncPreview: vi.fn(() => "synced")
    };
    const runtimes = {
      buildBlockDebugOverlay,
      buildBlockRuntime: { id: "build" },
      freeBlockBuildRuntime,
      solarStationPlacementBlockerRuntime: { id: "blocker" },
      workbenchRotationRuntime: { id: "rotation" }
    };

    const runtime = createGameLoopConstructionPlacementRuntimeBundle({
      camera,
      controls,
      hud,
      session,
      runtimes,
      callbacks: {
        playSoundEvent
      },
      createPlacementPreviewCancellation,
      createRuntime
    });

    expect(runtime).toBe(createdRuntime);
    expect(createRuntime).toHaveBeenCalledWith(expect.objectContaining({
      controls,
      session,
      runtimes: {
        buildBlockRuntime: runtimes.buildBlockRuntime,
        solarStationPlacementBlockerRuntime: runtimes.solarStationPlacementBlockerRuntime,
        workbenchRotationRuntime: runtimes.workbenchRotationRuntime
      }
    }));

    const options = createRuntime.mock.calls[0][0];
    expect(options.callbacks.getMovementAxes()).toEqual({ forward: [0, 0, 1] });
    expect(options.callbacks.getSelectedBlockMaterialCost()).toBe(materialCost);
    expect(options.callbacks.syncFreeBlockBuildPreview("cell")).toBe("synced");
    options.callbacks.updateBuildBlockDebugOverlay({ valid: true });
    options.callbacks.pushNotice("Placed");
    options.callbacks.playCancelSound();
    options.callbacks.playRotateSound();

    expect(camera.getMovementAxes).toHaveBeenCalledOnce();
    expect(freeBlockBuildRuntime.syncPreview).toHaveBeenCalledWith("cell");
    expect(buildBlockDebugOverlay.update).toHaveBeenCalledWith({ valid: true });
    expect(hud.pushNotice).toHaveBeenCalledWith("Placed");
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.UI_CANCEL);
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.UI_NAVIGATE);
    expect(createPlacementPreviewCancellation).toHaveBeenCalledWith({
      session,
      controls,
      hud,
      playSoundEvent,
      cancelSoundEventId: SOUND_EVENT_IDS.UI_CANCEL,
      placementContracts: expect.any(Object)
    });
    expect(options.callbacks.cancelActivePlacementPreviews).toBe(cancelActivePlacementPreviews);
    expect(options.callbacks.hasActivePlacementPreview).toEqual(expect.any(Function));
    expect(options.callbacks.getFreeBlockInvalidPlacementNotice("unknown")).toBe(
      "Block can't be placed there."
    );
  });
});
