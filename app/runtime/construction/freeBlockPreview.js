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

export function resolveFreeBlockBuildTarget({
  controller = null,
  gridSystem = null,
  playerPosition = null,
  playerYaw = null,
  buildZone = null,
  allowStacking = false,
  inventory = {},
  buildZoneUnavailable = false,
  resolveRawTargetCell = null,
  resolveUnavailableValidation = null,
  resolveTargetPosition = null,
  getConstructionColliders = null,
  isPositionInsideCollider = null,
  buildState = null,
  resolvePreviewValidity = null
} = {}) {
  const rawTargetCell = resolveRawTargetCell?.({
    gridSystem,
    playerPosition,
    playerYaw
  }) || null;
  const target = controller?.resolveSelectedBlockTarget?.({
    playerPosition,
    playerYaw,
    buildZone,
    allowStacking
  });

  if (!target?.targetCell) {
    return null;
  }

  const validation = buildZoneUnavailable ?
    resolveUnavailableValidation?.({ targetCell: target.targetCell }) :
    controller?.validateSelectedBlockTarget?.({
      targetCell: target.targetCell,
      buildZone,
      allowStacking,
      inventory
    }) || {
      valid: true,
      reason: null
    };
  const resolvedTargetCell = validation.targetCell || target.targetCell;
  const targetPosition = resolveTargetPosition?.(resolvedTargetCell, gridSystem) || null;
  const blockingColliderIds = (getConstructionColliders?.() || [])
    .filter((collider) => isPositionInsideCollider?.(targetPosition, collider))
    .map((collider) => collider.id || collider.kind || "unknown");
  const rawTargetBlock = rawTargetCell ? buildState?.getBlockAtCell?.(rawTargetCell) : null;
  const targetBlock = buildState?.getBlockAtCell?.(resolvedTargetCell) || null;
  const previewValidity = resolvePreviewValidity?.({
    validation,
    blockingColliderIds
  }) || {
    valid: validation.valid !== false,
    reason: validation.reason || null
  };
  const { valid, reason } = previewValidity;

  return {
    targetCell: resolvedTargetCell,
    targetPosition,
    valid,
    reason,
    debug: buildFreeBlockPreviewDebug({
      rawTargetCell,
      targetCell: resolvedTargetCell,
      playerPosition,
      targetPosition,
      validation,
      previewValidity,
      blockingColliderIds,
      rawTargetBlock,
      targetBlock,
      wood: inventory?.wood ?? 0,
      gridSystem
    })
  };
}

export function getFreeBlockPreviewTarget({
  action = null,
  playerPosition = null,
  resolveTarget = null
} = {}) {
  if (
    action &&
    !action.impactApplied &&
    action.targetCell &&
    Array.isArray(action.targetPosition)
  ) {
    return {
      targetCell: action.targetCell,
      targetPosition: action.targetPosition,
      valid: true,
      reason: null
    };
  }

  return resolveTarget?.(playerPosition) || null;
}

export function syncFreeBlockBuildPreview({
  instance = null,
  active = false,
  playerPosition = null,
  nowSeconds = 0,
  getTarget = null,
  createGridSystem = null
} = {}) {
  if (!instance) {
    return null;
  }

  if (!active || !Array.isArray(playerPosition)) {
    return syncFreeBlockPreviewInstance({
      instance,
      active,
      playerPosition
    });
  }

  const target = getTarget?.(playerPosition);
  if (!target?.targetCell || !Array.isArray(target.targetPosition)) {
    return syncFreeBlockPreviewInstance({
      instance,
      active,
      playerPosition,
      target
    });
  }

  const gridSystem = createGridSystem?.();
  return syncFreeBlockPreviewInstance({
    instance,
    active,
    playerPosition,
    target,
    cellSize: gridSystem?.cellSize,
    nowSeconds
  });
}
