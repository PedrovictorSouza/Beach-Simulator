const FREE_BLOCK_PREVIEW_PULSE_SPEED = 8;
const FREE_BLOCK_PREVIEW_VALID_ALPHA_BASE = 0.58;
const FREE_BLOCK_PREVIEW_VALID_ALPHA_PULSE = 0.12;
const FREE_BLOCK_PREVIEW_INVALID_ALPHA_BASE = 0.42;
const FREE_BLOCK_PREVIEW_INVALID_ALPHA_PULSE = 0.08;
const FREE_BLOCK_PREVIEW_VALID_TINT = [0.36, 1.35, 0.46];
const FREE_BLOCK_PREVIEW_INVALID_TINT = [1.8, 0.32, 0.28];
const FREE_BLOCK_PREVIEW_VALID_TINT_STRENGTH_BASE = 0.34;
const FREE_BLOCK_PREVIEW_VALID_TINT_STRENGTH_PULSE = 0.12;
const FREE_BLOCK_PREVIEW_INVALID_TINT_STRENGTH_BASE = 0.5;
const FREE_BLOCK_PREVIEW_INVALID_TINT_STRENGTH_PULSE = 0.16;

export function syncFreeBlockPreviewInstance({
  instance = null,
  active = false,
  playerPosition = null,
  target = null,
  cellSize = 1,
  nowSeconds = 0
} = {}) {
  if (!instance) {
    return null;
  }

  if (!active || !Array.isArray(playerPosition)) {
    instance.active = false;
    return null;
  }

  if (!target?.targetCell || !Array.isArray(target.targetPosition)) {
    instance.active = false;
    return null;
  }

  const pulse = (Math.sin(nowSeconds * FREE_BLOCK_PREVIEW_PULSE_SPEED) + 1) * 0.5;
  const valid = target.valid !== false;

  instance.active = true;
  instance.offset = [
    target.targetPosition[0],
    target.targetPosition[1],
    target.targetPosition[2]
  ];
  instance.scale = cellSize;
  instance.yaw = 0;
  instance.pitch = 0;
  instance.roll = 0;
  instance.alpha = valid ?
    FREE_BLOCK_PREVIEW_VALID_ALPHA_BASE + pulse * FREE_BLOCK_PREVIEW_VALID_ALPHA_PULSE :
    FREE_BLOCK_PREVIEW_INVALID_ALPHA_BASE + pulse * FREE_BLOCK_PREVIEW_INVALID_ALPHA_PULSE;
  instance.tint = valid ?
    [...FREE_BLOCK_PREVIEW_VALID_TINT] :
    [...FREE_BLOCK_PREVIEW_INVALID_TINT];
  instance.tintStrength = valid ?
    FREE_BLOCK_PREVIEW_VALID_TINT_STRENGTH_BASE + pulse * FREE_BLOCK_PREVIEW_VALID_TINT_STRENGTH_PULSE :
    FREE_BLOCK_PREVIEW_INVALID_TINT_STRENGTH_BASE + pulse * FREE_BLOCK_PREVIEW_INVALID_TINT_STRENGTH_PULSE;
  instance.freeBlockCell = target.targetCell;
  instance.freeBlockPreviewValid = valid;
  instance.freeBlockPreviewReason = target.reason || null;
  return target;
}

export function buildFreeBlockPreviewDebug({
  rawTargetCell = null,
  targetCell = null,
  playerPosition = null,
  targetPosition = null,
  validation = {},
  previewValidity = {},
  blockingColliderIds = [],
  rawTargetBlock = null,
  targetBlock = null,
  wood = 0,
  gridSystem = null
} = {}) {
  const playerCell = Array.isArray(playerPosition) && gridSystem?.worldToCell ?
    gridSystem.worldToCell({
      x: Number(playerPosition[0] || 0),
      y: Number(playerPosition[1] || 0),
      z: Number(playerPosition[2] || 0)
    }) :
    null;

  return {
    rawTargetCell,
    targetCell,
    playerCell,
    targetPosition,
    valid: previewValidity.valid,
    reason: previewValidity.reason,
    validationReason: validation.reason || null,
    blockedByConstruction: previewValidity.blockedByConstruction,
    blockingColliderIds,
    rawTargetBlockType: rawTargetBlock?.blockType || null,
    targetBlockType: targetBlock?.blockType || null,
    wood
  };
}
