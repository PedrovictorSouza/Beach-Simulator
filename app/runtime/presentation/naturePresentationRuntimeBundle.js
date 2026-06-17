import { createGearPickupParticleRuntime } from "../gearPickupParticleRuntime.js";
import { createLandscapeCutEffectRuntime } from "../landscapeCutEffectRuntime.js";
import { createTreeRevivalLeafBurstRuntime } from "../treeRevivalLeafBurstRuntime.js";
import { createWoodCollectPopRuntime } from "../woodCollectPopRuntime.js";
import { createNaturePresentationFrameRuntime } from "./natureRenderFrame.js";
import { createTreeRevivalLeafBurstFrameRuntime } from "./treeRevivalLeafBurstFrameRuntime.js";
import {
  LANDSCAPE_CUT_EFFECT_DURATION,
  LANDSCAPE_CUT_EFFECT_LERP_PORTION,
  LANDSCAPE_CUT_EFFECT_LIFT,
  LANDSCAPE_CUT_EFFECT_POP_SCALE,
  TREE_REVIVAL_LEAF_BURST_BASE_HEIGHT,
  TREE_REVIVAL_LEAF_BURST_DRIFT,
  TREE_REVIVAL_LEAF_BURST_GRAVITY,
  TREE_REVIVAL_LEAF_BURST_HEIGHT_RANGE,
  TREE_REVIVAL_LEAF_BURST_SIZE_MAX,
  TREE_REVIVAL_LEAF_BURST_SIZE_MIN
} from "../gameplayPresentationTuning.js";

const GAMEPLAY_WOOD_COLLECT_POP_DURATION = 0.34;
const GAMEPLAY_WOOD_COLLECT_POP_LIFT = 0.24;
const GAMEPLAY_WOOD_COLLECT_POP_SCALE = 1.65;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_COUNT = 12;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_DURATION = 0.62;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_BASE_HEIGHT = 0.42;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_LIFT = 0.78;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_RADIUS = 0.72;
const GAMEPLAY_GEAR_PICKUP_PARTICLE_SIZE = 0.32;
const GAMEPLAY_TREE_REVIVAL_LEAF_BURST_COUNT = 18;
const GAMEPLAY_TREE_REVIVAL_LEAF_BURST_DURATION = 1.65;

const GAMEPLAY_NATURE_PRESENTATION_CONFIG = Object.freeze({
  gearPickupParticleBaseHeight: GAMEPLAY_GEAR_PICKUP_PARTICLE_BASE_HEIGHT,
  gearPickupParticleCount: GAMEPLAY_GEAR_PICKUP_PARTICLE_COUNT,
  gearPickupParticleDuration: GAMEPLAY_GEAR_PICKUP_PARTICLE_DURATION,
  gearPickupParticleLift: GAMEPLAY_GEAR_PICKUP_PARTICLE_LIFT,
  gearPickupParticleRadius: GAMEPLAY_GEAR_PICKUP_PARTICLE_RADIUS,
  gearPickupParticleSize: GAMEPLAY_GEAR_PICKUP_PARTICLE_SIZE,
  landscapeCutEffectDuration: LANDSCAPE_CUT_EFFECT_DURATION,
  landscapeCutEffectLerpPortion: LANDSCAPE_CUT_EFFECT_LERP_PORTION,
  landscapeCutEffectLift: LANDSCAPE_CUT_EFFECT_LIFT,
  landscapeCutEffectPopScale: LANDSCAPE_CUT_EFFECT_POP_SCALE,
  treeRevivalLeafBurstBaseHeight: TREE_REVIVAL_LEAF_BURST_BASE_HEIGHT,
  treeRevivalLeafBurstCount: GAMEPLAY_TREE_REVIVAL_LEAF_BURST_COUNT,
  treeRevivalLeafBurstDrift: TREE_REVIVAL_LEAF_BURST_DRIFT,
  treeRevivalLeafBurstDuration: GAMEPLAY_TREE_REVIVAL_LEAF_BURST_DURATION,
  treeRevivalLeafBurstGravity: TREE_REVIVAL_LEAF_BURST_GRAVITY,
  treeRevivalLeafBurstHeightRange: TREE_REVIVAL_LEAF_BURST_HEIGHT_RANGE,
  treeRevivalLeafBurstSizeMax: TREE_REVIVAL_LEAF_BURST_SIZE_MAX,
  treeRevivalLeafBurstSizeMin: TREE_REVIVAL_LEAF_BURST_SIZE_MIN,
  woodCollectPopDuration: GAMEPLAY_WOOD_COLLECT_POP_DURATION,
  woodCollectPopLift: GAMEPLAY_WOOD_COLLECT_POP_LIFT,
  woodCollectPopScale: GAMEPLAY_WOOD_COLLECT_POP_SCALE
});

export function createGameplayNaturePresentationRuntimeBundle(options = {}) {
  return createNaturePresentationRuntimeBundle({
    ...options,
    config: {
      ...GAMEPLAY_NATURE_PRESENTATION_CONFIG,
      ...options.config
    }
  });
}

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
