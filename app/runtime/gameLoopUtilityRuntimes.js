import { createBuildBlockDebugOverlay } from "./buildBlockDebugOverlay.js";
import { createFrameSnapshotController } from "./frameSnapshotController.js";
import {
  createFpsPanelController,
  createInputModalityPanelController
} from "./gameplayDebugPanels.js";
import { createWaterGunSfxBurstRuntime } from "./waterGunSfxBurstRuntime.js";
import { createGameplaySnowstormFogRuntime } from "./world/snowstormFogRuntime.js";

export function createGameLoopUtilityRuntimeBundle({
  actTwoTutorial,
  camera,
  clamp01,
  colliderGizmos,
  fpsPanel,
  groundCellHighlight,
  hud,
  inputModalityPanel,
  mount,
  worldCanvas,
  worldRenderer,
  worldSpeech,
  createBuildBlockOverlayRuntime = createBuildBlockDebugOverlay,
  createFrameSnapshotRuntime = createFrameSnapshotController,
  createFpsController = createFpsPanelController,
  createInputModalityController = createInputModalityPanelController,
  createSnowstormFogRuntime = createGameplaySnowstormFogRuntime,
  createWaterGunBurstRuntime = createWaterGunSfxBurstRuntime
} = {}) {
  const snowstormFogRuntime = createSnowstormFogRuntime({
    mount,
    clamp01
  });

  const buildBlockDebugOverlay = createBuildBlockOverlayRuntime({
    mount,
    worldCanvas
  });

  const frameSnapshotController = createFrameSnapshotRuntime({
    camera,
    mount,
    worldRenderer,
    worldSpeech,
    colliderGizmos,
    groundCellHighlight,
    actTwoTutorial,
    hud
  });

  return {
    buildBlockDebugOverlay,
    fpsPanelController: createFpsController(fpsPanel),
    frameSnapshotController,
    inputModalityPanelController: createInputModalityController(inputModalityPanel),
    snowstormFogRuntime,
    waterGunSfxBurstRuntime: createWaterGunBurstRuntime()
  };
}
