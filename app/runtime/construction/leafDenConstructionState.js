const LEAF_DEN_CONSTRUCTION_HELPER_IDS = Object.freeze([
  "charmander",
  "timburr"
]);

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

export function isLeafDenConstructionActive({ storyState = null, leafDen = null } = {}) {
  const flags = storyState?.flags || {};

  return Boolean(
    flags.leafDenConstructionStarted &&
    !flags.leafDenBuilt &&
    leafDen?.position
  );
}

export function isLeafDenBusyCompanionTarget({ active = false, target = null } = {}) {
  return Boolean(
    active &&
    target?.kind === "pokemonCompanion" &&
    LEAF_DEN_CONSTRUCTION_HELPER_IDS.includes(target.id)
  );
}

export function getLeafDenConstructionProgress({ storyState = null, nowMs = Date.now() } = {}) {
  const flags = storyState?.flags || {};
  const startedAt = Number(flags.leafDenConstructionStartedAt || 0);
  const completesAt = Number(flags.leafDenConstructionCompletesAt || 0);

  if (!startedAt || !completesAt || completesAt <= startedAt) {
    return 0;
  }

  return clamp01((nowMs - startedAt) / (completesAt - startedAt));
}
