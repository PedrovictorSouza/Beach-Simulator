import { describe, expect, it, vi } from "vitest";

import {
  createCompanionModelSyncRuntime
} from "../app/runtime/companions/companionModelSyncRuntime.js";

const CONFIG = Object.freeze({
  robotModelScale: 0.5,
  bulbasaurModelScale: 0.65,
  charmanderModelScale: 0.75,
  timburrModelScale: 0.58
});

function createRuntime({ session = {} } = {}) {
  const repairBoxModelRuntime = {
    syncDismantledEncounterModule: vi.fn(),
    syncRepairBoxInstance: vi.fn()
  };
  const syncInteractablePosition = vi.fn();
  const runtime = createCompanionModelSyncRuntime({
    session,
    repairBoxModelRuntime,
    syncInteractablePosition,
    config: CONFIG
  });

  return {
    repairBoxModelRuntime,
    runtime,
    session,
    syncInteractablePosition
  };
}

describe("createCompanionModelSyncRuntime", () => {
  it("syncs Squirtle model, repair box visibility and interactable position", () => {
    const session = {
      actTwoSquirtle: {
        modelInstance: {},
        repairModuleInstance: {},
        position: [2, 0.04, 3],
        recovered: false,
        assemblyState: "scattered",
        reassembly: { active: false }
      }
    };
    const {
      repairBoxModelRuntime,
      runtime,
      syncInteractablePosition
    } = createRuntime({ session });

    runtime.syncSquirtle();

    expect(session.actTwoSquirtle.modelInstance).toMatchObject({
      offset: [2, 0.04, 3],
      scale: CONFIG.robotModelScale
    });
    expect(repairBoxModelRuntime.syncRepairBoxInstance).toHaveBeenCalledWith(
      session.actTwoSquirtle.repairModuleInstance,
      session.actTwoSquirtle.position,
      true
    );
    expect(syncInteractablePosition).toHaveBeenCalledWith("squirtle", [2, 0.04, 3]);
  });

  it("does not sync Squirtle without a model and position", () => {
    const {
      repairBoxModelRuntime,
      runtime,
      syncInteractablePosition
    } = createRuntime({
      session: {
        actTwoSquirtle: {
          repairModuleInstance: {},
          position: [2, 0.04, 3]
        }
      }
    });

    runtime.syncSquirtle();

    expect(repairBoxModelRuntime.syncRepairBoxInstance).not.toHaveBeenCalled();
    expect(syncInteractablePosition).not.toHaveBeenCalled();
  });

  it("syncs Bulbasaur encounter model and dismantled module", () => {
    const session = {
      bulbasaurEncounter: {
        visible: true,
        position: [1, 0.04, 4],
        modelInstance: {}
      }
    };
    const { repairBoxModelRuntime, runtime } = createRuntime({ session });

    runtime.syncBulbasaur();

    expect(repairBoxModelRuntime.syncDismantledEncounterModule).toHaveBeenCalledWith(
      session.bulbasaurEncounter
    );
    expect(session.bulbasaurEncounter.modelInstance).toMatchObject({
      active: true,
      offset: [1, 0.04, 4],
      scale: CONFIG.bulbasaurModelScale
    });
  });

  it("keeps dismantled Bulbasaur module synced when the model is missing", () => {
    const session = {
      bulbasaurEncounter: {
        visible: false,
        repairModuleInstance: {}
      }
    };
    const { repairBoxModelRuntime, runtime } = createRuntime({ session });

    runtime.syncBulbasaur();

    expect(repairBoxModelRuntime.syncDismantledEncounterModule).toHaveBeenCalledWith(
      session.bulbasaurEncounter
    );
  });

  it("syncs Charmander encounter model and dismantled module", () => {
    const session = {
      charmanderEncounter: {
        visible: true,
        position: [5, 0.04, 6],
        modelInstance: {}
      }
    };
    const { repairBoxModelRuntime, runtime } = createRuntime({ session });

    runtime.syncCharmander();

    expect(repairBoxModelRuntime.syncDismantledEncounterModule).toHaveBeenCalledWith(
      session.charmanderEncounter
    );
    expect(session.charmanderEncounter.modelInstance).toMatchObject({
      active: true,
      offset: [5, 0.04, 6],
      scale: CONFIG.charmanderModelScale
    });
  });

  it("syncs Timburr model with encounter scale override", () => {
    const session = {
      timburrEncounter: {
        visible: true,
        position: [7, 0.04, 8],
        modelBaseScale: 0.9,
        modelInstance: {}
      }
    };
    const { repairBoxModelRuntime, runtime } = createRuntime({ session });

    runtime.syncTimburr();

    expect(session.timburrEncounter.modelInstance).toMatchObject({
      active: true,
      offset: [7, 0.04, 8],
      scale: 0.9
    });
    expect(repairBoxModelRuntime.syncDismantledEncounterModule).not.toHaveBeenCalled();
  });

  it("syncs the companion repair modules in the same order as the game loop", () => {
    const session = {
      charmanderEncounter: {
        visible: true,
        position: [1, 0.04, 1],
        modelInstance: {}
      },
      timburrEncounter: {
        visible: true,
        position: [2, 0.04, 2],
        modelInstance: {}
      }
    };
    const { repairBoxModelRuntime, runtime } = createRuntime({ session });

    runtime.syncRepairModules();

    expect(session.charmanderEncounter.modelInstance.scale).toBe(CONFIG.charmanderModelScale);
    expect(session.timburrEncounter.modelInstance.scale).toBe(CONFIG.timburrModelScale);
    expect(repairBoxModelRuntime.syncDismantledEncounterModule).toHaveBeenNthCalledWith(
      1,
      session.charmanderEncounter
    );
    expect(repairBoxModelRuntime.syncDismantledEncounterModule).toHaveBeenNthCalledWith(
      2,
      session.timburrEncounter
    );
  });
});
