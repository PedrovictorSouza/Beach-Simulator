import { PLAYER_SPEED } from "../movement/playerMovementTuning.js";
const ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 1.12;
const INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 2.28;
const COMPANION_FOLLOW_LINE_FIRST_DISTANCE = 1.18;
const COMPANION_FOLLOW_LINE_SLOT_SPACING = 1.18;
const COMPANION_FOLLOW_FORMATION_ORDER = Object.freeze(["squirtle", "bulbasaur", "charmander", "timburr"]);
const COMPANION_FOLLOW_ACTIVE_MOVE_COMPANIONS = Object.freeze({
  waterGun: "squirtle",
  leafage: "bulbasaur",
  fire: "charmander",
  buildBlock: "timburr"
});


export function isCompanionFollowFormationMember({
  companionId,
  flags = {},
  companions = {},
  actions = {},
  blockers = {}
} = {}) {
  if (companionId === "squirtle") {
    const squirtle = companions.squirtle;
    return Boolean(
      flags.squirtleFollowing &&
      squirtle?.recovered &&
      squirtle.assemblyState === "assembled" &&
      !actions.squirtleWaterGun &&
      !blockers.squirtleWaterGunQueueActive
    );
  }

  if (companionId === "bulbasaur") {
    const bulbasaur = companions.bulbasaur;
    return Boolean(
      flags.bulbasaurFollowing &&
      bulbasaur?.visible &&
      Array.isArray(bulbasaur.position) &&
      !actions.bulbasaurLeafage &&
      !bulbasaur.revealBoxOpening?.active &&
      !blockers.bulbasaurWorkbenchGuideActive
    );
  }

  if (companionId === "charmander") {
    return Boolean(
      flags.charmanderFollowing &&
      flags.charmanderRevealed &&
      companions.charmander?.visible &&
      !actions.charmanderFire &&
      !flags.leafDenConstructionStarted
    );
  }

  if (companionId === "timburr") {
    return Boolean(
      flags.timburrFollowing &&
      flags.timburrRevealed &&
      companions.timburr?.visible &&
      !actions.timburrBuildBlock &&
      !flags.leafDenConstructionStarted
    );
  }

  return false;
}

export function resolveCompanionFollowFormationIds({
  activeMoveId = null,
  isFollowing = () => false
} = {}) {
  const activeCompanionId = COMPANION_FOLLOW_ACTIVE_MOVE_COMPANIONS[activeMoveId] || null;
  const orderedIds = activeCompanionId ?
    [
      activeCompanionId,
      ...COMPANION_FOLLOW_FORMATION_ORDER.filter((companionId) => companionId !== activeCompanionId)
    ] :
    COMPANION_FOLLOW_FORMATION_ORDER;

  return orderedIds.filter(isFollowing);
}

export function resolveCompanionFollowFormationIndex({
  companionId,
  activeMoveId = null,
  isFollowing = () => false
} = {}) {
  const formationIds = resolveCompanionFollowFormationIds({ activeMoveId, isFollowing });
  const index = formationIds.indexOf(companionId);
  return index >= 0 ? index : null;
}

export function resolveCompanionFollowFormationIndexFromState({
  companionId,
  activeMoveId = null,
  flags = {},
  companions = {},
  actions = {},
  blockers = {}
} = {}) {
  return resolveCompanionFollowFormationIndex({
    companionId,
    activeMoveId,
    isFollowing: (candidateId) => isCompanionFollowFormationMember({
      companionId: candidateId,
      flags,
      companions,
      actions,
      blockers
    })
  });
}

export function resolveCompanionFollowDistance({
  companionId,
  activeMoveId,
  defaultDistance,
  formationIndex = null
} = {}) {
  if (Number.isFinite(formationIndex)) {
    return COMPANION_FOLLOW_LINE_FIRST_DISTANCE +
      Math.max(0, Math.floor(formationIndex)) * COMPANION_FOLLOW_LINE_SLOT_SPACING;
  }

  const activeCompanionId = COMPANION_FOLLOW_ACTIVE_MOVE_COMPANIONS[activeMoveId] || null;

  if (activeMoveId !== "waterGun" && activeMoveId !== "leafage") {
    return defaultDistance;
  }

  if (companionId === activeCompanionId) {
    return ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
  }

  if (companionId === "squirtle" || companionId === "bulbasaur") {
    return INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
  }

  return defaultDistance;
}

export function resolveCompanionFollowSpeed() {
  return PLAYER_SPEED;
}
