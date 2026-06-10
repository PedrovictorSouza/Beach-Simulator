import { describe, expect, it, vi } from "vitest";

import { prepareRenderSnapshotContext } from "../app/runtime/presentation/renderSnapshotContext.js";

function createSession() {
  return {
    tallGrassInstances: [{ id: "tall" }],
    leafageGardenInstances: [{ id: "garden" }],
    leafageNativeTreeInstances: [{ id: "native" }],
    deadGrassInstances: [{ id: "dead" }],
    playerCharacter: {
      getPosition: vi.fn(() => [1, 0, 2])
    },
    actTwoSquirtle: {
      repairModuleInstance: { id: "squirtle-module" }
    },
    bulbasaurEncounter: {
      id: "bulbasaur",
      repairModuleInstance: { id: "bulbasaur-module" }
    },
    charmanderEncounter: {
      id: "charmander",
      repairModuleInstance: { id: "charmander-module" }
    },
    timburrEncounter: {
      repairModuleInstance: { id: "timburr-module" }
    }
  };
}

describe("render snapshot context", () => {
  it("clears temporary nature render collections before returning context", () => {
    const session = createSession();

    prepareRenderSnapshotContext({
      session,
      camera: { getPose: () => ({ target: [9, 0, 9] }) },
      cinematicActive: false,
      getGrassCollisionObjects: () => [],
      getSelectedRepairBoxParticleTarget: () => null,
      getRepairBoxRevealParticleTarget: () => null
    });

    expect(session.tallGrassInstances).toEqual([]);
    expect(session.leafageGardenInstances).toEqual([]);
    expect(session.leafageNativeTreeInstances).toEqual([]);
    expect(session.deadGrassInstances).toEqual([]);
  });

  it("uses player position outside cinematic and camera target as render center when available", () => {
    const session = createSession();
    const grassCollisionObjects = [{ id: "grass-collider" }];

    const result = prepareRenderSnapshotContext({
      session,
      camera: { getPose: () => ({ target: [9, 0, 9] }) },
      cinematicActive: false,
      getGrassCollisionObjects: () => grassCollisionObjects,
      getSelectedRepairBoxParticleTarget: () => "selected-target",
      getRepairBoxRevealParticleTarget: () => "reveal-target"
    });

    expect(result).toEqual({
      grassBendPlayerPosition: [1, 0, 2],
      natureRenderCenter: [9, 0, 9],
      grassCollisionObjects,
      selectedRepairBoxParticleTarget: "selected-target",
      repairBoxRevealParticleTarget: "reveal-target",
      shouldShowRepairBoxRustlingParticles: false
    });
  });

  it("hides player grass bend during cinematic and forwards repair box sources", () => {
    const session = createSession();
    const getSelectedRepairBoxParticleTarget = vi.fn(() => null);
    const getRepairBoxRevealParticleTarget = vi.fn(() => null);
    const getEncounterRepairBoxPosition = vi.fn();
    const clamp01 = vi.fn();

    const result = prepareRenderSnapshotContext({
      session,
      camera: { getPose: () => null },
      cinematicActive: true,
      getGrassCollisionObjects: () => [],
      getSelectedRepairBoxParticleTarget,
      getRepairBoxRevealParticleTarget,
      getEncounterRepairBoxPosition,
      clamp01
    });

    expect(result.grassBendPlayerPosition).toBeNull();
    expect(result.natureRenderCenter).toBeNull();
    expect(getSelectedRepairBoxParticleTarget).toHaveBeenCalledWith({
      repairModuleInstances: [
        session.actTwoSquirtle.repairModuleInstance,
        session.bulbasaurEncounter.repairModuleInstance,
        session.charmanderEncounter.repairModuleInstance,
        session.timburrEncounter.repairModuleInstance
      ]
    });
    expect(getRepairBoxRevealParticleTarget).toHaveBeenCalledWith({
      encounters: [
        session.bulbasaurEncounter,
        session.charmanderEncounter
      ],
      getEncounterRepairBoxPosition,
      clamp01
    });
  });
});
