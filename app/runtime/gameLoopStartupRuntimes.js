import { createGameLoopBaseRuntimeBundle } from "./gameLoopBaseRuntimes.js";
import { createGameLoopEarlyRuntimeBundle } from "./gameLoopEarlyRuntimes.js";

export function createGameLoopStartupRuntimeBundle({
  camera,
  cameraOrbit,
  cameraZoomPresets,
  controls,
  gameplay,
  hud,
  mount,
  rendering,
  session,
  worldCanvas,
  callbacks = {},
  math = {},
  createBaseRuntime = createGameLoopBaseRuntimeBundle,
  createEarlyRuntime = createGameLoopEarlyRuntimeBundle
} = {}) {
  const baseRuntimeBundle = createBaseRuntime({
    camera,
    cameraOrbit,
    cameraZoomPresets,
    controls,
    gameplay,
    mount,
    session
  });
  const earlyRuntimeBundle = createEarlyRuntime({
    audio: baseRuntimeBundle.audio,
    camera,
    controls,
    gameplay,
    hud,
    rendering,
    session,
    worldCanvas,
    runtimes: {
      freeBlockBuildSessionRuntime:
        baseRuntimeBundle.freeBlockBuildSessionRuntime
    },
    callbacks,
    math
  });

  return {
    ...baseRuntimeBundle,
    ...earlyRuntimeBundle
  };
}
