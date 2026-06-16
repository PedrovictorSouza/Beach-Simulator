import { getFreeBlockPlacementNotice } from "./placementPreviewPrompts.js";

export function applyFreeBlockPlacementResult({
  result = null,
  feedbackGroundCell = null,
  now = 0,
  wallBlockType = "wall",
  actions = {}
} = {}) {
  if (!result) {
    return {
      handled: false,
      placed: false,
      feedbackAbilityId: null,
      foundationWallBuilt: false,
      notice: null
    };
  }

  const placed = Boolean(result.placed);
  const feedbackAbilityId = placed ? "build" : "invalid";
  if (feedbackGroundCell) {
    actions.triggerFeedback?.(feedbackGroundCell, feedbackAbilityId, now);
  }

  let foundationWallBuilt = false;
  if (placed) {
    actions.markFirstFreeBlockPlaced?.();
    if (result.blockType === wallBlockType) {
      foundationWallBuilt = true;
      actions.onFoundationWallBuilt?.({
        targetCell: result.targetCell,
        block: result.block
      });
      actions.syncFoundationCompletionEffects?.(now);
    }
    actions.syncFreeBlockBuildSnapshot?.();
    actions.playPlacedSound?.();
  } else {
    actions.playInvalidSound?.();
  }

  const notice = getFreeBlockPlacementNotice(result, { wallBlockType });
  actions.pushNotice?.(notice);

  return {
    handled: true,
    placed,
    feedbackAbilityId,
    foundationWallBuilt,
    notice
  };
}
