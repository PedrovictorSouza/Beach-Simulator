import { describe, expect, it } from "vitest";

import {
  getRepairBoxRevealParticleTarget,
  getSelectedRepairBoxParticleTarget
} from "../app/runtime/repairBoxParticleTargets.js";

describe("repair box particle targets", () => {
  it("selects the first active repair module with an offset", () => {
    const offset = [1, 2, 3];
    const target = getSelectedRepairBoxParticleTarget({
      repairModuleInstances: [
        { id: "inactive", active: false, offset: [9, 9, 9] },
        { id: "squirtle-box", active: true, offset },
        { id: "bulbasaur-box", active: true, offset: [4, 5, 6] }
      ]
    });

    expect(target).toEqual({
      id: "squirtle-box-rustling-particles",
      position: [1, 2, 3]
    });
    expect(target.position).not.toBe(offset);
  });

  it("skips selected targets without an active offset", () => {
    expect(getSelectedRepairBoxParticleTarget({
      repairModuleInstances: [
        { id: "inactive", active: false, offset: [1, 2, 3] },
        { id: "missing-offset", active: true, offset: null }
      ]
    })).toBeNull();
  });

  it("creates a reveal target from the active encounter", () => {
    const offset = [4, 5, 6];
    const target = getRepairBoxRevealParticleTarget({
      encounters: [{
        repairModuleInstance: { id: "grow-box", offset },
        revealBoxOpening: {
          active: true,
          elapsed: 2,
          duration: 8
        }
      }],
      getEncounterRepairBoxPosition: () => [9, 9, 9],
      clamp01: (value) => Math.min(1, Math.max(0, value))
    });

    expect(target).toEqual({
      id: "grow-box-reveal-rays",
      position: [4, 5, 6],
      progress: 0.25
    });
    expect(target.position).not.toBe(offset);
  });

  it("uses fallback repair-box position and clamps progress", () => {
    expect(getRepairBoxRevealParticleTarget({
      encounters: [{
        repairModuleInstance: { id: "thermal-box" },
        revealBoxOpening: {
          active: true,
          elapsed: 12,
          duration: 8
        }
      }],
      getEncounterRepairBoxPosition: () => [7, 8, 9],
      clamp01: (value) => Math.min(1, Math.max(0, value))
    })).toEqual({
      id: "thermal-box-reveal-rays",
      position: [7, 8, 9],
      progress: 1
    });
  });

  it("returns no reveal target when no opening is active or position is missing", () => {
    expect(getRepairBoxRevealParticleTarget({
      encounters: [{ revealBoxOpening: { active: false } }]
    })).toBeNull();
    expect(getRepairBoxRevealParticleTarget({
      encounters: [{ revealBoxOpening: { active: true } }],
      getEncounterRepairBoxPosition: () => null
    })).toBeNull();
  });
});
