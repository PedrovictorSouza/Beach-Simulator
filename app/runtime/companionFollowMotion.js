import { ACT_TWO_PLAYER_SPEED } from "../session/configurePlayerSpawner.js";

const ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 1.12;
const INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 2.28;
const COMPANION_FOLLOW_LINE_FIRST_DISTANCE = 1.18;
const COMPANION_FOLLOW_LINE_SLOT_SPACING = 1.18;

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

  if (activeMoveId === "waterGun") {
    if (companionId === "squirtle") {
      return ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }

    if (companionId === "bulbasaur") {
      return INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }
  }

  if (activeMoveId === "leafage") {
    if (companionId === "bulbasaur") {
      return ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }

    if (companionId === "squirtle") {
      return INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }
  }

  return defaultDistance;
}

export function resolveCompanionFollowSpeed() {
  return ACT_TWO_PLAYER_SPEED;
}
