import { getTallGrassInstanceScale } from "./tallGrassMotion.js";

const REBIRTH_OF_NATURE_CELL_ID = "ground-110-82";
const REBIRTH_OF_NATURE_GHOST_TREE_ALPHA_MAX = 0.5;
const REBIRTH_OF_NATURE_GHOST_TREE_PULSE_SPEED = 0.004;
const REBIRTH_OF_NATURE_GHOST_TREE_SIZE = Object.freeze([1.32, 1.32]);
const REBIRTH_OF_NATURE_GHOST_TREE_TINT = Object.freeze([1, 0.18, 0.72]);
const REBIRTH_OF_NATURE_COMPLETE_FLAG = "rebirthOfNatureComplete";

export function isRebirthOfNatureMissionActive(storyState) {
  return Boolean(
    storyState?.flags?.bulbasaurDryGrassRequestTurnedIn &&
    !storyState.flags[REBIRTH_OF_NATURE_COMPLETE_FLAG]
  );
}

export function getRebirthOfNatureGroundCell(session) {
  return (
    session?.groundDeadInstances?.find?.((groundCell) => {
      return groundCell?.id === REBIRTH_OF_NATURE_CELL_ID;
    }) ||
    session?.groundPurifiedInstances?.find?.((groundCell) => {
      return groundCell?.id === REBIRTH_OF_NATURE_CELL_ID;
    }) ||
    null
  );
}

export function getRebirthOfNatureGhostTreeAlpha(now) {
  const pulse = (Math.sin(now * REBIRTH_OF_NATURE_GHOST_TREE_PULSE_SPEED) + 1) * 0.5;
  return pulse * REBIRTH_OF_NATURE_GHOST_TREE_ALPHA_MAX;
}

export function appendRebirthOfNatureGhostTree(session, storyState, now) {
  if (
    !isRebirthOfNatureMissionActive(storyState) ||
    !session?.leafageNativeTreeModel ||
    !Array.isArray(session.leafageNativeTreeInstances)
  ) {
    return;
  }

  const groundCell = getRebirthOfNatureGroundCell(session);
  if (!groundCell?.offset) {
    return;
  }

  session.leafageNativeTreeInstances.push({
    id: "rebirth-of-nature-tree-preview",
    offset: [
      groundCell.offset[0],
      (groundCell.surfaceY || 0) + 0.02,
      groundCell.offset[2]
    ],
    scale: getTallGrassInstanceScale(
      session.leafageNativeTreeModel,
      { size: REBIRTH_OF_NATURE_GHOST_TREE_SIZE },
      1
    ) * (session.leafageNativeTreeModelScale || 1),
    alpha: getRebirthOfNatureGhostTreeAlpha(now),
    tint: REBIRTH_OF_NATURE_GHOST_TREE_TINT,
    tintStrength: 0.86,
    yaw: session.leafageNativeTreeModelFaceYawOffset || 0,
    swayStrength: 0
  });
}
