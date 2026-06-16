import { createUnavailableFoundationBuildZonePlacementResult } from "./foundationBuildZone.js";
import {
  getFreeBlockCellWorldPosition,
  isWorldPositionOnFreeBlockCell
} from "./placementGeometry.js";
import { getFreeBlockPlacementNotice } from "./placementPreviewPrompts.js";

function applyPlacedFreeBlockSideEffects({
  result = null,
  playerPosition = null,
  now = 0,
  effects = {}
} = {}) {
  if (result?.placed) {
    effects.movePlayerAway?.(result.targetCell, playerPosition);
  }
  effects.handlePlacementResult?.(result, now);
}

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

export function tryPlaceFreeBlockFromBuildInput({
  controller = null,
  placement = {},
  effects = {},
  now = 0
} = {}) {
  if (!controller) {
    return { handled: false };
  }

  const {
    buildZoneUnavailable = false,
    blockType = "wall",
    playerPosition = null,
    playerYaw = null,
    inventory = {}
  } = placement;

  const result = buildZoneUnavailable ?
    createUnavailableFoundationBuildZonePlacementResult({
      blockType
    }) :
    controller.placeSelectedBlockAtTarget({
      playerPosition,
      buildZone: placement.getBuildZone?.(),
      allowStacking: Boolean(placement.canStack?.()),
      playerYaw,
      inventory
    });

  applyPlacedFreeBlockSideEffects({
    result,
    playerPosition,
    now,
    effects
  });

  return {
    handled: true,
    result
  };
}

export function applyTimburrBuildBlockImpact({
  action = null,
  controller = null,
  placement = {},
  effects = {},
  now = 0
} = {}) {
  if (!controller) {
    return null;
  }

  const {
    buildZoneUnavailable = false,
    blockType = "wall",
    playerPosition = null,
    inventory = {}
  } = placement;

  const result = buildZoneUnavailable ?
    createUnavailableFoundationBuildZonePlacementResult({
      blockType,
      targetCell: action?.targetCell
    }) :
    controller.placeSelectedBlockAtTarget({
      targetCell: action?.targetCell,
      buildZone: placement.getBuildZone?.(),
      allowStacking: Boolean(placement.canStack?.()),
      inventory
    });

  applyPlacedFreeBlockSideEffects({
    result,
    playerPosition,
    now,
    effects
  });

  return result;
}

export function movePlayerAwayFromPlacedFreeBlock({
  playerCharacter = null,
  targetCell = null,
  playerPosition = null,
  gridSystem = null,
  resolveDisplacementPosition = null,
  isBlocked = () => false,
  syncPlayerModel = null
} = {}) {
  if (!playerCharacter || !Array.isArray(playerPosition) || !targetCell || !gridSystem) {
    return null;
  }

  if (!isWorldPositionOnFreeBlockCell({
    targetCell,
    worldPosition: playerPosition,
    gridSystem
  })) {
    return null;
  }

  const targetPosition = getFreeBlockCellWorldPosition({
    cell: targetCell,
    gridSystem
  });
  const nextPlayerPosition = resolveDisplacementPosition?.({
    targetPosition,
    playerPosition,
    cellSize: gridSystem.cellSize,
    isBlocked
  });

  if (!nextPlayerPosition) {
    return null;
  }

  playerCharacter.setPosition?.(nextPlayerPosition);
  syncPlayerModel?.();
  return nextPlayerPosition;
}
