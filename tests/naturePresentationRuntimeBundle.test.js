import { describe, expect, it } from "vitest";

import {
  createGameplayNaturePresentationRuntimeBundle,
  createNaturePresentationRuntimeBundle
} from "../app/runtime/presentation/naturePresentationRuntimeBundle.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createSnapshots({ collected = true } = {}) {
  return new Map([
    [
      { collected },
      {
        position: [1, 2, 3],
        size: [0.5, 0.75]
      }
    ]
  ]);
}

function createBundle() {
  return createNaturePresentationRuntimeBundle({
    camera: {},
    controls: {
      storyState: {
        flags: {}
      }
    },
    rendering: {
      fullUvRect: [0, 0, 1, 1]
    },
    session: {},
    callbacks: {
      getEncounterRepairBoxPosition: () => null
    },
    math: {
      clamp01,
      easeOutCubic: (value) => value,
      lerp: (start, end, progress) => start + (end - start) * progress
    },
    config: {
      gearPickupParticleBaseHeight: 0.42,
      gearPickupParticleCount: 4,
      gearPickupParticleDuration: 0.62,
      gearPickupParticleLift: 0.78,
      gearPickupParticleRadius: 0.72,
      gearPickupParticleSize: 0.32,
      landscapeCutEffectDuration: 0.4,
      landscapeCutEffectLerpPortion: 0.5,
      landscapeCutEffectLift: 0.2,
      landscapeCutEffectPopScale: 1.2,
      treeRevivalLeafBurstBaseHeight: 0.2,
      treeRevivalLeafBurstCount: 3,
      treeRevivalLeafBurstDrift: 0.4,
      treeRevivalLeafBurstDuration: 0.5,
      treeRevivalLeafBurstGravity: 0.3,
      treeRevivalLeafBurstHeightRange: 0.6,
      treeRevivalLeafBurstSizeMax: 0.2,
      treeRevivalLeafBurstSizeMin: 0.1,
      woodCollectPopDuration: 0.34,
      woodCollectPopLift: 0.24,
      woodCollectPopScale: 1.65
    }
  });
}

describe("createNaturePresentationRuntimeBundle", () => {
  it("wires nature passive effects and frame runtimes with the existing public contract", () => {
    const bundle = createBundle();

    bundle.woodCollectPopRuntime.trigger(createSnapshots());
    bundle.gearPickupParticleRuntime.trigger([[1, 2, 3]]);
    bundle.naturePresentationFrameRuntime.updatePassiveEffects(0.17);

    expect(bundle.woodCollectPopRuntime.getBillboards("wood", [0, 0, 1, 1]))
      .toHaveLength(1);
    expect(bundle.gearPickupParticleRuntime.getBillboards("spark", [0, 0, 1, 1]))
      .toHaveLength(4);
    expect(bundle.treeRevivalLeafBurstFrameRuntime)
      .toHaveProperty("queueForNewlyRevivedTrees");
    expect(bundle.landscapeCutEffectRuntime).toHaveProperty("queue");
  });

  it("wires gameplay nature effect tuning by default", () => {
    const bundle = createGameplayNaturePresentationRuntimeBundle({
      camera: {},
      controls: {
        storyState: {
          flags: {}
        }
      },
      rendering: {
        fullUvRect: [0, 0, 1, 1]
      },
      session: {},
      callbacks: {
        getEncounterRepairBoxPosition: () => null
      },
      math: {
        clamp01,
        easeOutCubic: (value) => value,
        lerp: (start, end, progress) => start + (end - start) * progress
      }
    });

    bundle.gearPickupParticleRuntime.trigger([[1, 2, 3]]);

    expect(bundle.gearPickupParticleRuntime.getBillboards("spark", [0, 0, 1, 1]))
      .toHaveLength(12);
    expect(bundle.woodCollectPopRuntime).toHaveProperty("trigger");
    expect(bundle.landscapeCutEffectRuntime).toHaveProperty("queue");
  });
});
