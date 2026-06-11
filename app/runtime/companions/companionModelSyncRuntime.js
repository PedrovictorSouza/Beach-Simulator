const NOOP = () => {};

const DEFAULT_CONFIG = Object.freeze({
  robotModelScale: 0.5,
  bulbasaurModelScale: 0.65,
  charmanderModelScale: 0.75,
  timburrModelScale: 0.58
});

export function createCompanionModelSyncRuntime({
  session = {},
  repairBoxModelRuntime = null,
  syncInteractablePosition = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function syncSquirtle() {
    const squirtle = session.actTwoSquirtle;

    if (!squirtle?.modelInstance || !Array.isArray(squirtle.position)) {
      return;
    }

    squirtle.modelInstance.offset = [...squirtle.position];
    squirtle.modelInstance.scale = settings.robotModelScale;

    if (squirtle.repairModuleInstance) {
      repairBoxModelRuntime?.syncRepairBoxInstance?.(
        squirtle.repairModuleInstance,
        squirtle.position,
        Boolean(
          !squirtle.recovered &&
          squirtle.assemblyState !== "assembled" &&
          !squirtle.reassembly?.active
        )
      );
    }

    syncInteractablePosition("squirtle", squirtle.position);
  }

  function syncDismantledEncounterModel(encounter, scale) {
    if (!encounter?.modelInstance) {
      repairBoxModelRuntime?.syncDismantledEncounterModule?.(encounter);
      return;
    }

    repairBoxModelRuntime?.syncDismantledEncounterModule?.(encounter);
    encounter.modelInstance.active = Boolean(encounter.visible && Array.isArray(encounter.position));
    encounter.modelInstance.scale = scale;

    if (Array.isArray(encounter.position)) {
      encounter.modelInstance.offset = [...encounter.position];
    }
  }

  function syncBulbasaur() {
    syncDismantledEncounterModel(session.bulbasaurEncounter, settings.bulbasaurModelScale);
  }

  function syncCharmander() {
    syncDismantledEncounterModel(session.charmanderEncounter, settings.charmanderModelScale);
  }

  function syncTimburr() {
    const encounter = session.timburrEncounter;

    if (!encounter?.modelInstance) {
      return;
    }

    encounter.modelInstance.active = Boolean(encounter.visible && Array.isArray(encounter.position));
    encounter.modelInstance.scale = Number(encounter.modelBaseScale || settings.timburrModelScale);

    if (Array.isArray(encounter.position)) {
      encounter.modelInstance.offset = [...encounter.position];
    }
  }

  function syncRepairModules() {
    syncCharmander();
    syncTimburr();
    repairBoxModelRuntime?.syncDismantledEncounterModule?.(session.timburrEncounter);
  }

  return {
    syncBulbasaur,
    syncCharmander,
    syncRepairModules,
    syncSquirtle,
    syncTimburr
  };
}
