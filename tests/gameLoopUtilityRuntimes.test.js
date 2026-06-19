import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopUtilityRuntimeBundle
} from "../app/runtime/gameLoopUtilityRuntimes.js";

describe("createGameLoopUtilityRuntimeBundle", () => {
  it("wires utility and debug runtimes for the game loop", () => {
    const buildBlockDebugOverlay = { id: "build-debug" };
    const frameSnapshotController = { id: "snapshot" };
    const fpsPanelController = { id: "fps" };
    const inputModalityPanelController = { id: "input-panel" };
    const snowstormFogRuntime = { id: "fog" };
    const waterGunSfxBurstRuntime = { id: "water-burst" };
    const createBuildBlockOverlayRuntime = vi.fn(() => buildBlockDebugOverlay);
    const createFrameSnapshotRuntime = vi.fn(() => frameSnapshotController);
    const createFpsController = vi.fn(() => fpsPanelController);
    const createInputModalityController = vi.fn(() => inputModalityPanelController);
    const createSnowstormFogRuntime = vi.fn(() => snowstormFogRuntime);
    const createWaterGunBurstRuntime = vi.fn(() => waterGunSfxBurstRuntime);

    const result = createGameLoopUtilityRuntimeBundle({
      actTwoTutorial: { id: "tutorial" },
      camera: { id: "camera" },
      clamp01: (value) => value,
      colliderGizmos: { id: "colliders" },
      fpsPanel: { id: "fps-panel" },
      groundCellHighlight: { id: "ground-highlight" },
      hud: { id: "hud" },
      inputModalityPanel: { id: "input-modality" },
      mount: { id: "mount" },
      worldCanvas: { id: "canvas" },
      worldRenderer: { id: "renderer" },
      worldSpeech: { id: "speech" },
      createBuildBlockOverlayRuntime,
      createFrameSnapshotRuntime,
      createFpsController,
      createInputModalityController,
      createSnowstormFogRuntime,
      createWaterGunBurstRuntime
    });

    expect(result).toEqual({
      buildBlockDebugOverlay,
      fpsPanelController,
      frameSnapshotController,
      inputModalityPanelController,
      snowstormFogRuntime,
      waterGunSfxBurstRuntime
    });
    expect(createSnowstormFogRuntime).toHaveBeenCalledWith({
      mount: { id: "mount" },
      clamp01: expect.any(Function)
    });
    expect(createBuildBlockOverlayRuntime).toHaveBeenCalledWith({
      mount: { id: "mount" },
      worldCanvas: { id: "canvas" }
    });
    expect(createFrameSnapshotRuntime).toHaveBeenCalledWith({
      camera: { id: "camera" },
      mount: { id: "mount" },
      worldRenderer: { id: "renderer" },
      worldSpeech: { id: "speech" },
      colliderGizmos: { id: "colliders" },
      groundCellHighlight: { id: "ground-highlight" },
      actTwoTutorial: { id: "tutorial" },
      hud: { id: "hud" }
    });
    expect(createFpsController).toHaveBeenCalledWith({ id: "fps-panel" });
    expect(createInputModalityController).toHaveBeenCalledWith({ id: "input-modality" });
    expect(createWaterGunBurstRuntime).toHaveBeenCalledOnce();
  });
});
