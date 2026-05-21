const INTERACTION_HIGHLIGHT_STATE_KEY = "__interactionObjectHighlight";

export const INTERACTION_OBJECT_HIGHLIGHT_TINT = Object.freeze([1, 0.92, 0.05]);
export const INTERACTION_OBJECT_HIGHLIGHT_TINT_STRENGTH = 0.68;

function compactInstances(instances) {
  return instances.filter((instance) => {
    return instance && instance.active !== false;
  });
}

function collectSceneInstances(session) {
  const instances = [];
  for (const sceneObject of session?.sceneObjects || []) {
    if (Array.isArray(sceneObject?.instances)) {
      instances.push(...sceneObject.instances);
    }
  }
  return instances;
}

function rememberInstanceVisualState(instance) {
  if (!instance || instance[INTERACTION_HIGHLIGHT_STATE_KEY]) {
    return;
  }

  Object.defineProperty(instance, INTERACTION_HIGHLIGHT_STATE_KEY, {
    configurable: true,
    enumerable: false,
    value: {
      hasTint: Object.prototype.hasOwnProperty.call(instance, "tint"),
      tint: Array.isArray(instance.tint) ? [...instance.tint] : instance.tint,
      hasTintStrength: Object.prototype.hasOwnProperty.call(instance, "tintStrength"),
      tintStrength: instance.tintStrength
    }
  });
}

function restoreInstanceVisualState(instance) {
  const state = instance?.[INTERACTION_HIGHLIGHT_STATE_KEY];
  if (!state) {
    return false;
  }

  if (state.hasTint) {
    instance.tint = Array.isArray(state.tint) ? [...state.tint] : state.tint;
  } else {
    delete instance.tint;
  }

  if (state.hasTintStrength) {
    instance.tintStrength = state.tintStrength;
  } else {
    delete instance.tintStrength;
  }

  delete instance[INTERACTION_HIGHLIGHT_STATE_KEY];
  return true;
}

export function clearInteractionObjectHighlights(session) {
  let restoredCount = 0;
  for (const instance of collectSceneInstances(session)) {
    if (restoreInstanceVisualState(instance)) {
      restoredCount += 1;
    }
  }
  return restoredCount;
}

function getTargetId(interactTarget) {
  return interactTarget?.target?.id || interactTarget?.id || null;
}

function getTargetKind(interactTarget) {
  return interactTarget?.target?.kind || interactTarget?.kind || null;
}

function isBulbasaurTarget(targetId, targetKind) {
  return (
    targetId === "bulbasaur" ||
    String(targetId || "").startsWith("bulbasaur") ||
    String(targetKind || "").startsWith("bulbasaur")
  );
}

function isCharmanderTarget(targetId, targetKind) {
  return (
    targetId === "charmander" ||
    String(targetId || "").startsWith("charmander") ||
    String(targetKind || "").startsWith("charmander")
  );
}

function isTimburrTarget(targetId, targetKind) {
  return (
    targetId === "timburr" ||
    String(targetId || "").startsWith("timburr") ||
    String(targetKind || "").startsWith("timburr")
  );
}

function getPlayerHouseModelInstance(session, placement) {
  const placementId = placement?.id;
  if (!placementId) {
    return null;
  }
  return (session?.playerHouseModelInstances || [])
    .find((instance) => instance?.id === `${placementId}-model`) || null;
}

export function getInteractionObjectHighlightInstances(session, {
  interactTarget = null,
  workbenchRotationTarget = null
} = {}) {
  if (workbenchRotationTarget?.kind) {
    if (workbenchRotationTarget.kind === "solarStation") {
      return compactInstances([session?.strawBedModelInstance]);
    }
    if (workbenchRotationTarget.kind === "trainHouse") {
      return compactInstances([session?.campfireTrainHouseModelInstance]);
    }
    if (workbenchRotationTarget.kind === "house") {
      return compactInstances([session?.leafDenModelInstance]);
    }
    if (String(workbenchRotationTarget.kind).startsWith("playerHouse:")) {
      return compactInstances([
        getPlayerHouseModelInstance(session, workbenchRotationTarget.placement)
      ]);
    }
  }

  const targetId = getTargetId(interactTarget);
  const targetKind = getTargetKind(interactTarget);

  if (targetId === "workbench") {
    return compactInstances([session?.workbenchModelInstance]);
  }

  if (targetId === "ruinedPokemonCenter") {
    return compactInstances([
      session?.pokemonCenterWorkshopAssembledInstance,
      ...(session?.pokemonCenterWorkshopDismantledInstances || [])
    ]);
  }

  if (targetId === "beeFieldRepairBox") {
    return compactInstances([session?.beeFieldRepairBox]);
  }

  if (targetId === "squirtle") {
    return compactInstances([
      session?.actTwoSquirtle?.modelInstance,
      session?.actTwoSquirtle?.repairModuleInstance
    ]);
  }

  if (targetId === "tangrowth") {
    return compactInstances([
      session?.chopperNpcActor?.bodyInstance,
      session?.chopperNpcActor?.propellerInstance
    ]);
  }

  if (isBulbasaurTarget(targetId, targetKind)) {
    return compactInstances([
      session?.bulbasaurEncounter?.modelInstance,
      session?.bulbasaurEncounter?.repairModuleInstance
    ]);
  }

  if (isCharmanderTarget(targetId, targetKind)) {
    return compactInstances([
      session?.charmanderEncounter?.modelInstance,
      session?.charmanderEncounter?.repairModuleInstance
    ]);
  }

  if (isTimburrTarget(targetId, targetKind)) {
    return compactInstances([
      session?.timburrEncounter?.modelInstance,
      session?.timburrEncounter?.repairModuleInstance
    ]);
  }

  if (targetId === "leppaTree") {
    return compactInstances([
      session?.leppaTree?.deadInstance,
      session?.leppaTree?.aliveInstance
    ]);
  }

  if (targetId === "leafDen") {
    return compactInstances([session?.leafDenModelInstance]);
  }

  return [];
}

export function applyInteractionObjectHighlight(session, options = {}) {
  const instances = getInteractionObjectHighlightInstances(session, options);
  for (const instance of instances) {
    rememberInstanceVisualState(instance);
    instance.tint = [...INTERACTION_OBJECT_HIGHLIGHT_TINT];
    instance.tintStrength = INTERACTION_OBJECT_HIGHLIGHT_TINT_STRENGTH;
  }
  return instances.length;
}
