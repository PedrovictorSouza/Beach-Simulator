import { createGearPickupParticleRuntime } from "../gearPickupParticleRuntime.js";
import { createLandscapeCutEffectRuntime } from "../landscapeCutEffectRuntime.js";
import { createTreeRevivalLeafBurstRuntime } from "../treeRevivalLeafBurstRuntime.js";
import { createWoodCollectPopRuntime } from "../woodCollectPopRuntime.js";
import { createNaturePresentationFrameRuntime } from "./natureRenderFrame.js";
import { createTreeRevivalLeafBurstFrameRuntime } from "./treeRevivalLeafBurstFrameRuntime.js";

export function createNaturePresentationRuntimeBundle({
  camera = null,
  controls = {},
  rendering = {},
  session = {},
  callbacks = {},
  math = {},
  config = {}
} = {}) {
  const woodCollectPopRuntime = createWoodCollectPopRuntime({
    clamp01: math.clamp01,
    duration: config.woodCollectPopDuration,
    lift: config.woodCollectPopLift,
    scale: config.woodCollectPopScale
  });

  const gearPickupParticleRuntime = createGearPickupParticleRuntime({
    clamp01: math.clamp01,
    count: config.gearPickupParticleCount,
    duration: config.gearPickupParticleDuration,
    baseHeight: config.gearPickupParticleBaseHeight,
    lift: config.gearPickupParticleLift,
    radius: config.gearPickupParticleRadius,
    size: config.gearPickupParticleSize
  });

  const treeRevivalLeafBurstRuntime = createTreeRevivalLeafBurstRuntime({
    clamp01: math.clamp01,
    easeOutCubic: math.easeOutCubic,
    lerp: math.lerp,
    config: {
      count: config.treeRevivalLeafBurstCount,
      duration: config.treeRevivalLeafBurstDuration,
      drift: config.treeRevivalLeafBurstDrift,
      gravity: config.treeRevivalLeafBurstGravity,
      baseHeight: config.treeRevivalLeafBurstBaseHeight,
      heightRange: config.treeRevivalLeafBurstHeightRange,
      sizeMin: config.treeRevivalLeafBurstSizeMin,
      sizeMax: config.treeRevivalLeafBurstSizeMax
    }
  });

  const treeRevivalLeafBurstFrameRuntime = createTreeRevivalLeafBurstFrameRuntime({
    leafBurstRuntime: treeRevivalLeafBurstRuntime,
    session,
    getStoryState: () => controls.storyState,
    rendering
  });

  const landscapeCutEffectRuntime = createLandscapeCutEffectRuntime({
    clamp01: math.clamp01,
    easeOutCubic: math.easeOutCubic,
    lerp: math.lerp,
    config: {
      duration: config.landscapeCutEffectDuration,
      lerpPortion: config.landscapeCutEffectLerpPortion,
      lift: config.landscapeCutEffectLift,
      popScale: config.landscapeCutEffectPopScale
    }
  });

  const naturePresentationFrameRuntime = createNaturePresentationFrameRuntime({
    session,
    controls,
    rendering,
    camera,
    landscapeCutEffectRuntime,
    treeRevivalLeafBurstFrameRuntime,
    woodCollectPopRuntime,
    gearPickupParticleRuntime,
    getEncounterRepairBoxPosition: callbacks.getEncounterRepairBoxPosition,
    clamp: math.clamp01
  });

  return {
    gearPickupParticleRuntime,
    landscapeCutEffectRuntime,
    naturePresentationFrameRuntime,
    treeRevivalLeafBurstFrameRuntime,
    woodCollectPopRuntime
  };
}
