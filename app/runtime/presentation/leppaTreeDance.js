const LEPPA_TREE_DANCE_SWAY = 0.28;
const LEPPA_TREE_DANCE_SPEED = 0.0056;

export function updateLeppaTreeDance({ leppaTree, now } = {}) {
  const deadInstance = leppaTree?.deadInstance;

  if (!deadInstance) {
    return;
  }

  if (!leppaTree.revived) {
    deadInstance.swayStrength = 0;
    return;
  }

  deadInstance.swayStrength = Math.sin(now * LEPPA_TREE_DANCE_SPEED) * LEPPA_TREE_DANCE_SWAY;
}
