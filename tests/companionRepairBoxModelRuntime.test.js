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
  repairBoxRustleYaw: 0.12,
  investigationOffset: [-1, 0, -0.5],
  activeTint: [0.1, 0.9, 0.2],
  activeTintStrength: 0.7,
  inactiveAlpha: 0.4
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

  it("highlights only the first active repair box and fades the rest", () => {
    const { runtime } = createRuntime();
    const inactive = { active: false, alpha: 1 };
    const firstActive = { active: true };
    const secondActive = { active: true };

    runtime.syncActiveHighlight({
      repairModuleInstances: [inactive, firstActive, secondActive],
      revealEncounters: []
    });

    expect(inactive).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: 1
    });
    expect(firstActive).toMatchObject({
      tint: CONFIG.activeTint,
      tintStrength: CONFIG.activeTintStrength,
      alpha: 1
    });
    expect(secondActive).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: CONFIG.inactiveAlpha
    });
  });

  it("keeps reveal-opening repair boxes from being overwritten by highlight state", () => {
    const { runtime } = createRuntime();
    const revealModule = {
      active: true,
      tint: [1, 1, 1],
      tintStrength: 0.5,
      alpha: 0.8
    };
    const nextActive = { active: true };

    runtime.syncActiveHighlight({
      repairModuleInstances: [revealModule, nextActive],
      revealEncounters: [{
        repairModuleInstance: revealModule,
        revealBoxOpening: { active: true }
      }]
    });

    expect(revealModule).toMatchObject({
      tint: [1, 1, 1],
      tintStrength: 0.5,
      alpha: 0.8
    });
    expect(nextActive).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: CONFIG.inactiveAlpha
    });
  });

  it("syncs active companion repair-box highlights from the session shape", () => {
    const { runtime } = createRuntime();
    const squirtleModule = { active: false };
    const bulbasaurModule = { active: true };
    const charmanderModule = { active: true };
    const timburrModule = { active: true };
    const session = {
      actTwoSquirtle: { repairModuleInstance: squirtleModule },
      bulbasaurEncounter: {
        repairModuleInstance: bulbasaurModule,
        revealBoxOpening: { active: true }
      },
      charmanderEncounter: { repairModuleInstance: charmanderModule },
      timburrEncounter: { repairModuleInstance: timburrModule }
    };

    runtime.syncSessionActiveHighlight(session);

    expect(bulbasaurModule).toMatchObject({
      active: true
    });
    expect(charmanderModule).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: CONFIG.inactiveAlpha
    });
    expect(timburrModule).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: CONFIG.inactiveAlpha
    });
    expect(squirtleModule).toMatchObject({
      tint: null,
      tintStrength: 0,
      alpha: 1
    });
  });

  it("resolves a repair-box investigation target only while the rustling grass is alive", () => {
    const { runtime } = createRuntime();
    const encounter = {
      repairBoxPosition: [3, 0.2, 7],
      repairModuleInstance: {
        active: true
      }
    };
    const flags = {
      rustlingGrassCellId: "grass-1",
      chopperBulbasaurRepairBoxIntroComplete: true,
      bulbasaurRevealed: false
    };
    const groundGrassPatches = [
      { cellId: "grass-1", state: "alive" }
    ];

    expect(runtime.getInvestigationTarget({
      encounter,
      flags,
      groundGrassPatches
    })).toEqual({
      position: [2, 0.2, 6.5],
      lookAtPosition: [3, 0.2, 7]
    });

    expect(runtime.getInvestigationTarget({
      encounter,
      flags: {
        ...flags,
        bulbasaurRevealed: true
      },
      groundGrassPatches
    })).toBeNull();
    expect(runtime.getInvestigationTarget({
      encounter,
      flags,
      groundGrassPatches: [
        { cellId: "grass-1", state: "cut" }
      ]
    })).toBeNull();
  });

  it("advances repair-box rustle timing and deactivates it at duration", () => {
    const { runtime } = createRuntime();
    const encounter = {
      repairBoxRustle: {
        active: true,
        elapsed: 0.25,
        duration: 1
      }
    };

    runtime.updateRepairBoxRustle(encounter, 0.5);

    expect(encounter.repairBoxRustle).toMatchObject({
      active: true,
      elapsed: 0.75
    });

    runtime.updateRepairBoxRustle(encounter, 0.5);

    expect(encounter.repairBoxRustle).toMatchObject({
      active: false,
      elapsed: 1
    });
  });
});
