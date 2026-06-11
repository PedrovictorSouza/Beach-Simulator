import { describe, expect, it, vi } from "vitest";

import {
  createCompanionRepairBoxModelRuntime
} from "../app/runtime/companions/companionRepairBoxModelRuntime.js";

const CONFIG = Object.freeze({
  modelPitchOffset: 0.1,
  openPitch: 0.6,
  openRoll: 0.2,
  openLift: 0.3,
  openBackstep: 0.4,
  revealBoxDuration: 4,
  revealBoxOpenStartProgress: 0.5,
  revealBoxShakeEndProgress: 0.25,
  revealBoxSpinAcceleration: 2,
  repairBoxRustleLift: 0.08,
  repairBoxRustleRoll: 0.11,
  repairBoxRustlePitch: 0.08,
  repairBoxRustleYaw: 0.12
});

function createRuntime(overrides = {}) {
  const motion = {
    getFloatOffset: vi.fn((position) => [position[0], position[1] + 1, position[2]]),
    getYaw: vi.fn((yaw) => yaw + 0.25)
  };

  return {
    motion,
    runtime: createCompanionRepairBoxModelRuntime({
      motion,
      getRepairBoxPosition: (encounter) => encounter?.repairBoxPosition || encounter?.repairPosition || null,
      clamp01: (value) => Math.max(0, Math.min(1, value)),
      easeOutCubic: (value) => value,
      isRevealBoxBotVisible: () => false,
      config: CONFIG,
      ...overrides
    })
  };
}

describe("createCompanionRepairBoxModelRuntime", () => {
  it("normalizes reveal opening progress after the configured open start", () => {
    const { runtime } = createRuntime();

    expect(runtime.getOpeningProgress({
      revealBoxOpening: {
        active: true,
        elapsed: 3,
        duration: 4,
        openStartProgress: 0.5
      }
    })).toBe(0.5);

    expect(runtime.getOpeningProgress({
      revealBoxOpening: {
        active: true,
        elapsed: 1,
        duration: 4,
        openStartProgress: 0.5
      }
    })).toBe(0);
  });

  it("syncs repair box transform while preserving base yaw and scale", () => {
    const { runtime, motion } = createRuntime();
    const instance = {
      yaw: 0.5,
      scale: 2
    };

    runtime.syncRepairBoxInstance(instance, [4, 0, 8], true, {
      openingProgress: 0.5
    });

    expect(motion.getFloatOffset).toHaveBeenCalledWith([4, 0, 8]);
    expect(motion.getYaw).toHaveBeenCalledWith(0.5);
    expect(instance.baseOffset).toEqual([4, 0, 8]);
    expect(instance.offset).toEqual([4, 1 + CONFIG.openLift * 0.5, 8 + CONFIG.openBackstep * 0.5]);
    expect(instance.yaw).toBe(0.75);
    expect(instance.pitch).toBe(CONFIG.modelPitchOffset - CONFIG.openPitch * 0.5);
    expect(instance.roll).toBe(CONFIG.openRoll * 0.5);
    expect(instance.scale).toBe(2 * (1 - 0.08 * 0.5));
    expect(instance.active).toBe(true);
  });

  it("hides dismantled encounter repair box after the reveal bot becomes visible", () => {
    const { runtime } = createRuntime({
      isRevealBoxBotVisible: () => true
    });
    const encounter = {
      visible: false,
      repairBoxPosition: [1, 0, 2],
      repairModuleInstance: {},
      revealBoxOpening: {
        active: true,
        elapsed: 4,
        duration: 4,
        hideBoxWhenVisible: true
      }
    };

    runtime.syncDismantledEncounterModule(encounter);

    expect(encounter.repairModuleInstance.active).toBe(false);
  });

  it("applies reveal cinematic and rustle as local model mutations", () => {
    const { runtime } = createRuntime();
    const instance = {
      yaw: 0,
      pitch: 0,
      roll: 0,
      scale: 1,
      offset: [0, 1, 0]
    };
    const encounter = {
      repairModuleInstance: instance,
      revealBoxOpening: {
        active: true,
        elapsed: 0.5,
        duration: 4
      },
      repairBoxRustle: {
        active: true,
        elapsed: 0.25,
        duration: 1
      }
    };

    runtime.applyRevealBoxCinematic(encounter);
    runtime.applyRepairBoxRustle(encounter);

    expect(instance.tint).toEqual([1.45, 1.72, 0.84]);
    expect(instance.tintStrength).toBeGreaterThan(0.32);
    expect(instance.alpha).toBe(1);
    expect(instance.scale).toBeGreaterThan(1);
    expect(instance.offset).not.toEqual([0, 1, 0]);
  });
});
