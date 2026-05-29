import {
  cellKey,
  normalizeCell
} from "./gridBuildingSystem.js";

export const FREE_BLOCK_TYPES = Object.freeze({
  BLOCK: "block",
  WALL: "wall"
});

export const FREE_BLOCK_BUILD_SAVE_SCHEMA_VERSION = 1;
export const FREE_BLOCK_WALL_COST = Object.freeze({
  itemId: "wood",
  quantity: 1
});

const DEFAULT_BUILD_BOUNDS = Object.freeze({
  minX: 0,
  maxX: 255,
  minY: 0,
  maxY: 255
});
const DEFAULT_FREE_BLOCK_FORWARD_DISTANCE = 1;
const DEFAULT_FREE_BLOCK_INSTANCE_SCALE = 1;
const DEFAULT_FREE_BLOCK_INSTANCE_GROUND_LIFT = 0;
const DEFAULT_FOUNDATION_BUILD_ZONE_SIZE = 4;

function finiteNumberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeBuildBounds(bounds = {}) {
  if (bounds?.originCell) {
    const originCell = normalizeCell(bounds.originCell);
    const width = Math.max(1, Math.trunc(finiteNumberOr(bounds.width, 1)));
    const height = Math.max(1, Math.trunc(finiteNumberOr(bounds.height, 1)));

    return Object.freeze({
      minX: originCell.x,
      maxX: originCell.x + width - 1,
      minY: originCell.y,
      maxY: originCell.y + height - 1
    });
  }

  const minX = Math.trunc(finiteNumberOr(bounds.minX, DEFAULT_BUILD_BOUNDS.minX));
  const maxX = Math.trunc(finiteNumberOr(bounds.maxX, DEFAULT_BUILD_BOUNDS.maxX));
  const minY = Math.trunc(finiteNumberOr(bounds.minY ?? bounds.minZ, DEFAULT_BUILD_BOUNDS.minY));
  const maxY = Math.trunc(finiteNumberOr(bounds.maxY ?? bounds.maxZ, DEFAULT_BUILD_BOUNDS.maxY));

  return Object.freeze({
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minY: Math.min(minY, maxY),
    maxY: Math.max(minY, maxY)
  });
}

function cloneBounds(bounds) {
  return {
    minX: bounds.minX,
    maxX: bounds.maxX,
    minY: bounds.minY,
    maxY: bounds.maxY
  };
}

function cloneCell(cell) {
  const normalizedCell = normalizeCell(cell);
  return {
    x: normalizedCell.x,
    y: normalizedCell.y
  };
}

function normalizeBlockLayer(cell = {}) {
  return Math.max(0, Math.trunc(finiteNumberOr(cell.layer, 0)));
}

function hasExplicitBlockLayer(cell = {}) {
  return Object.prototype.hasOwnProperty.call(cell || {}, "layer");
}

function cloneBlockCell(cell) {
  const normalizedCell = cloneCell(cell);
  const layer = normalizeBlockLayer(cell);
  return layer > 0 ? { ...normalizedCell, layer } : normalizedCell;
}

function blockCellKey(cell) {
  const normalizedCell = normalizeCell(cell);
  return `${cellKey(normalizedCell)}:${normalizeBlockLayer(cell)}`;
}

function freezeCellList(cells = []) {
  return Object.freeze(cells.map((cell) => Object.freeze(cloneCell(cell))));
}

function isCellInsideBuildArea(cell, bounds) {
  const normalizedCell = normalizeCell(cell);
  return normalizedCell.x >= bounds.minX &&
    normalizedCell.x <= bounds.maxX &&
    normalizedCell.y >= bounds.minY &&
    normalizedCell.y <= bounds.maxY;
}

function createRejectedResult(blockType, reason, extra = {}) {
  return {
    placed: false,
    reason,
    blockType,
    block: null,
    ...extra
  };
}

function createBlock({ buildId, cell, blockType = FREE_BLOCK_TYPES.BLOCK }) {
  const normalizedCell = cloneBlockCell(cell);
  const layer = normalizeBlockLayer(normalizedCell);
  const layerSuffix = layer > 0 ? `:${layer}` : "";
  return Object.freeze({
    id: `${buildId}:${blockType}:${cellKey(normalizedCell)}${layerSuffix}`,
    buildId,
    blockType,
    cell: normalizedCell
  });
}

export function createRectangularFreeBlockBuildZone({
  id = "free-block-build-zone",
  originCell = { x: 0, y: 0 },
  width = DEFAULT_FOUNDATION_BUILD_ZONE_SIZE,
  height = DEFAULT_FOUNDATION_BUILD_ZONE_SIZE
} = {}) {
  const normalizedOrigin = cloneCell(originCell);
  const zoneWidth = Math.max(1, Math.trunc(finiteNumberOr(width, DEFAULT_FOUNDATION_BUILD_ZONE_SIZE)));
  const zoneHeight = Math.max(1, Math.trunc(finiteNumberOr(height, DEFAULT_FOUNDATION_BUILD_ZONE_SIZE)));
  const cells = [];
  const borderCells = [];
  const interiorCells = [];

  for (let y = 0; y < zoneHeight; y += 1) {
    for (let x = 0; x < zoneWidth; x += 1) {
      const cell = {
        x: normalizedOrigin.x + x,
        y: normalizedOrigin.y + y
      };
      const border =
        x === 0 ||
        y === 0 ||
        x === zoneWidth - 1 ||
        y === zoneHeight - 1;

      cells.push(cell);
      if (border) {
        borderCells.push(cell);
      } else {
        interiorCells.push(cell);
      }
    }
  }

  return Object.freeze({
    id,
    originCell: Object.freeze(normalizedOrigin),
    width: zoneWidth,
    height: zoneHeight,
    cells: freezeCellList(cells),
    borderCells: freezeCellList(borderCells),
    interiorCells: freezeCellList(interiorCells)
  });
}

function normalizeDirectionVector(direction = {}) {
  const x = Number(Array.isArray(direction) ? direction[0] : direction.x);
  const z = Number(Array.isArray(direction) ? direction[1] ?? direction[2] : direction.z ?? direction.y);
  const magnitude = Math.hypot(x, z);

  if (!Number.isFinite(magnitude) || magnitude <= 0.0001) {
    return { x: 0, z: -1 };
  }

  return {
    x: x / magnitude,
    z: z / magnitude
  };
}

export function resolveFreeBlockTargetCell({
  gridSystem,
  playerPosition,
  playerYaw = null,
  forwardDirection = null,
  forwardDistance = DEFAULT_FREE_BLOCK_FORWARD_DISTANCE
} = {}) {
  if (!gridSystem || typeof gridSystem.worldToCell !== "function") {
    throw new TypeError("gridSystem is required");
  }

  if (!Array.isArray(playerPosition)) {
    return null;
  }

  const direction = forwardDirection ?
    normalizeDirectionVector(forwardDirection) :
    normalizeDirectionVector(
      Number.isFinite(Number(playerYaw)) ?
        [Math.cos(Number(playerYaw)), Math.sin(Number(playerYaw))] :
        null
    );
  const distance = Math.max(0, finiteNumberOr(forwardDistance, DEFAULT_FREE_BLOCK_FORWARD_DISTANCE));

  return gridSystem.worldToCell({
    x: Number(playerPosition[0] || 0) + direction.x * distance,
    y: Number(playerPosition[1] || 0),
    z: Number(playerPosition[2] || 0) + direction.z * distance
  });
}

export function createFreeBlockModelInstance({
  block,
  gridSystem,
  blockType = FREE_BLOCK_TYPES.BLOCK,
  scale = null,
  groundLift = DEFAULT_FREE_BLOCK_INSTANCE_GROUND_LIFT
} = {}) {
  if (!gridSystem || typeof gridSystem.cellToWorld !== "function") {
    throw new TypeError("gridSystem is required");
  }

  const cell = cloneBlockCell(block?.cell || block?.targetCell || block);
  const layer = normalizeBlockLayer(cell);
  const defaultScale = finiteNumberOr(gridSystem.cellSize, DEFAULT_FREE_BLOCK_INSTANCE_SCALE);
  const resolvedScale = scale === null || scale === undefined ?
    defaultScale :
    finiteNumberOr(scale, defaultScale);
  const resolvedGroundLift = finiteNumberOr(groundLift, DEFAULT_FREE_BLOCK_INSTANCE_GROUND_LIFT);
  const worldPosition = gridSystem.cellToWorld(cell, {
    center: true,
    includeVisualOffset: true
  });

  return {
    id: block?.id || `free-block:${blockType}:${cellKey(cell)}`,
    offset: [
      worldPosition.x,
      worldPosition.y + resolvedGroundLift + layer * defaultScale,
      worldPosition.z
    ],
    scale: resolvedScale,
    yaw: 0,
    pitch: 0,
    roll: 0,
    active: true,
    blockType,
    freeBlockCell: cell
  };
}

function serializeBlock(block) {
  const serialized = {
    cell: cloneBlockCell(block.cell)
  };
  if (block.blockType && block.blockType !== FREE_BLOCK_TYPES.BLOCK) {
    serialized.blockType = block.blockType;
  }
  return serialized;
}

function normalizeBlockedCellKeys(blockedCells = []) {
  if (!Array.isArray(blockedCells)) {
    return new Set();
  }

  return new Set(blockedCells
    .filter(Boolean)
    .map((cell) => cellKey(normalizeCell(cell))));
}

function normalizeCellKeySet(cells = []) {
  if (!Array.isArray(cells)) {
    return null;
  }

  return normalizeBlockedCellKeys(cells);
}

function getBuildZoneCellsForBlockType(buildZone, blockType) {
  if (!buildZone) {
    return null;
  }

  if (blockType === FREE_BLOCK_TYPES.WALL && Array.isArray(buildZone.borderCells)) {
    return buildZone.borderCells;
  }

  return Array.isArray(buildZone.cells) ? buildZone.cells : null;
}

function getBuildZoneRect(buildZone) {
  if (!buildZone?.originCell) {
    return null;
  }

  const originCell = normalizeCell(buildZone.originCell);
  const width = Math.max(1, Math.trunc(finiteNumberOr(buildZone.width, 1)));
  const height = Math.max(1, Math.trunc(finiteNumberOr(buildZone.height, 1)));

  return {
    minX: originCell.x,
    maxX: originCell.x + width - 1,
    minY: originCell.y,
    maxY: originCell.y + height - 1,
    centerX: originCell.x + width * 0.5,
    centerY: originCell.y + height * 0.5
  };
}

function projectCellToBuildZoneBorder(targetCell, buildZone) {
  const rect = getBuildZoneRect(buildZone);
  if (!rect) {
    return null;
  }

  const normalizedTarget = normalizeCell(targetCell);
  const deltaX = normalizedTarget.x + 0.5 - rect.centerX;
  const deltaY = normalizedTarget.y + 0.5 - rect.centerY;
  const projectedCell = cloneCell(normalizedTarget);

  if (Math.abs(deltaY) >= Math.abs(deltaX)) {
    projectedCell.y = deltaY >= 0 ? rect.maxY : rect.minY;
  } else {
    projectedCell.x = deltaX >= 0 ? rect.maxX : rect.minX;
  }

  return projectedCell;
}

function getCellDistanceSquared(a, b) {
  const cellA = normalizeCell(a);
  const cellB = normalizeCell(b);
  const deltaX = cellA.x - cellB.x;
  const deltaY = cellA.y - cellB.y;
  return deltaX * deltaX + deltaY * deltaY;
}

function getAdjacentPlacedBlockCount(cell, buildState) {
  if (typeof buildState?.getBlockAtCell !== "function") {
    return 0;
  }

  const normalizedCell = normalizeCell(cell);
  const adjacentCells = [
    { x: normalizedCell.x - 1, y: normalizedCell.y },
    { x: normalizedCell.x + 1, y: normalizedCell.y },
    { x: normalizedCell.x, y: normalizedCell.y - 1 },
    { x: normalizedCell.x, y: normalizedCell.y + 1 }
  ];

  return adjacentCells.reduce((count, adjacentCell) => (
    buildState.getBlockAtCell(adjacentCell) ? count + 1 : count
  ), 0);
}

function findNearestUsableBuildZoneCell({
  targetCell,
  buildZone,
  blockType,
  buildState,
  options = {}
}) {
  const allowedCells = getBuildZoneCellsForBlockType(buildZone, blockType);
  if (!Array.isArray(allowedCells) || !allowedCells.length) {
    return null;
  }

  let nearestCell = null;
  let nearestDistanceSquared = Infinity;
  let nearestAdjacentPlacedBlockCount = -1;

  for (const allowedCell of allowedCells) {
    const normalizedCell = normalizeCell(allowedCell);
    const placementResult = buildState?.canPlaceBlock?.(normalizedCell, {
      ...options,
      buildZone,
      blockType
    });

    if (placementResult && placementResult.placed !== true) {
      continue;
    }

    const distanceSquared = getCellDistanceSquared(targetCell, normalizedCell);
    const adjacentPlacedBlockCount = getAdjacentPlacedBlockCount(normalizedCell, buildState);
    if (
      distanceSquared < nearestDistanceSquared ||
      (
        distanceSquared === nearestDistanceSquared &&
        adjacentPlacedBlockCount > nearestAdjacentPlacedBlockCount
      )
    ) {
      nearestCell = cloneCell(normalizedCell);
      nearestDistanceSquared = distanceSquared;
      nearestAdjacentPlacedBlockCount = adjacentPlacedBlockCount;
    }
  }

  return nearestCell;
}

function snapResolvedTargetCellToBuildZone({
  targetCell,
  buildZone,
  blockType,
  buildState,
  options = {}
}) {
  if (!targetCell || !buildZone) {
    return targetCell;
  }

  const zoneCellKeys = normalizeCellKeySet(buildZone.cells);
  const allowedCellKeys = normalizeCellKeySet(getBuildZoneCellsForBlockType(buildZone, blockType));
  const normalizedTarget = normalizeCell(targetCell);
  const targetKey = cellKey(normalizedTarget);

  if (
    !zoneCellKeys ||
    !allowedCellKeys ||
    !zoneCellKeys.has(targetKey)
  ) {
    return normalizedTarget;
  }

  if (allowedCellKeys.has(targetKey)) {
    const placementResult = buildState?.canPlaceBlock?.(normalizedTarget, {
      ...options,
      buildZone,
      blockType
    });
    if (!placementResult || placementResult.placed === true) {
      return normalizedTarget;
    }

    return findNearestUsableBuildZoneCell({
      targetCell: normalizedTarget,
      buildZone,
      blockType,
      buildState,
      options
    }) || normalizedTarget;
  }

  const projectedCell = projectCellToBuildZoneBorder(normalizedTarget, buildZone);
  if (projectedCell && allowedCellKeys.has(cellKey(projectedCell))) {
    const placementResult = buildState?.canPlaceBlock?.(projectedCell, {
      ...options,
      buildZone,
      blockType
    });
    if (!placementResult || placementResult.placed === true) {
      return cloneCell(projectedCell);
    }
  }

  return findNearestUsableBuildZoneCell({
    targetCell: normalizedTarget,
    buildZone,
    blockType,
    buildState,
    options
  }) || projectedCell || normalizedTarget;
}

function getInventoryCount(inventory, itemId) {
  return Math.max(0, Number(inventory?.[itemId] || 0));
}

function hasMaterialCost(inventory, cost) {
  if (!cost?.itemId || !Number.isFinite(Number(cost.quantity))) {
    return true;
  }

  return getInventoryCount(inventory, cost.itemId) >= Number(cost.quantity);
}

function consumeMaterialCost(inventory, cost) {
  if (!cost?.itemId || !Number.isFinite(Number(cost.quantity))) {
    return false;
  }

  if (!hasMaterialCost(inventory, cost)) {
    return false;
  }

  inventory[cost.itemId] = getInventoryCount(inventory, cost.itemId) - Number(cost.quantity);
  return true;
}

function refundMaterialCost(inventory, cost) {
  if (!cost?.itemId || !Number.isFinite(Number(cost.quantity))) {
    return false;
  }

  inventory[cost.itemId] = getInventoryCount(inventory, cost.itemId) + Number(cost.quantity);
  return true;
}

function createMissingMaterialResult(blockType, targetCell, cost, inventory) {
  return {
    handled: true,
    valid: false,
    placed: false,
    reason: "missing-material",
    blockType,
    block: null,
    targetCell,
    missingItemId: cost.itemId,
    requiredQuantity: Number(cost.quantity),
    availableQuantity: getInventoryCount(inventory, cost.itemId)
  };
}

export function getFreeBlockBuildZoneProgress({
  buildState = null,
  buildZone = null,
  blockType = FREE_BLOCK_TYPES.WALL
} = {}) {
  const requiredCells = Array.isArray(buildZone?.borderCells) ? buildZone.borderCells : [];
  const completedCells = [];
  const missingCells = [];

  for (const cell of requiredCells) {
    const block = buildState?.getBlockAtCell?.(cell);
    if (block?.blockType === blockType) {
      completedCells.push(cloneCell(cell));
    } else {
      missingCells.push(cloneCell(cell));
    }
  }

  return Object.freeze({
    buildZoneId: buildZone?.id || null,
    blockType,
    requiredCount: requiredCells.length,
    completedCount: completedCells.length,
    complete: requiredCells.length > 0 && completedCells.length === requiredCells.length,
    completedCells: freezeCellList(completedCells),
    missingCells: freezeCellList(missingCells)
  });
}

export function createFreeBlockBuildState({
  buildId = "freeBuild",
  bounds = DEFAULT_BUILD_BOUNDS,
  occupancyStore = null
} = {}) {
  const buildBounds = normalizeBuildBounds(bounds);
  const blocks = new Map();

  function getCompletionState() {
    return {
      blockCount: blocks.size
    };
  }

  function getBlockAtCell(cell) {
    if (hasExplicitBlockLayer(cell)) {
      return blocks.get(blockCellKey(cell)) || null;
    }

    return blocks.get(blockCellKey({ ...normalizeCell(cell), layer: 0 })) || null;
  }

  function getTopBlockAtCell(cell) {
    const normalizedCell = normalizeCell(cell);
    let topBlock = null;
    let topLayer = -1;

    for (const block of blocks.values()) {
      const blockCell = normalizeCell(block.cell);
      if (blockCell.x !== normalizedCell.x || blockCell.y !== normalizedCell.y) {
        continue;
      }

      const layer = normalizeBlockLayer(block.cell);
      if (layer > topLayer) {
        topLayer = layer;
        topBlock = block;
      }
    }

    return topBlock;
  }

  function resolvePlacementCell(cell, options = {}) {
    const normalizedCell = cloneBlockCell(cell);
    if (hasExplicitBlockLayer(cell) || !options.allowStacking) {
      return normalizedCell;
    }

    const topBlock = getTopBlockAtCell(normalizedCell);
    if (!topBlock) {
      return normalizedCell;
    }

    return {
      ...cloneCell(normalizedCell),
      layer: normalizeBlockLayer(topBlock.cell) + 1
    };
  }

  function canPlaceBlock(cell, options = {}) {
    const normalizedCell = resolvePlacementCell(cell, options);
    const key = blockCellKey(normalizedCell);
    const groundKey = cellKey(normalizedCell);
    const blockType = options.blockType || FREE_BLOCK_TYPES.BLOCK;
    const buildZoneCellKeys = normalizeCellKeySet(
      options.allowedCells || getBuildZoneCellsForBlockType(options.buildZone, blockType)
    );
    const layer = normalizeBlockLayer(normalizedCell);

    if (!isCellInsideBuildArea(normalizedCell, buildBounds)) {
      return createRejectedResult(blockType, "outside-build-area");
    }

    if (buildZoneCellKeys && !buildZoneCellKeys.has(groundKey)) {
      return createRejectedResult(blockType, "outside-build-zone");
    }

    if (layer > 0 && !options.allowStacking && !hasExplicitBlockLayer(cell)) {
      return createRejectedResult(blockType, "duplicate-block");
    }

    if (blocks.has(key)) {
      return createRejectedResult(blockType, "duplicate-block");
    }

    if (layer <= 0 && normalizeBlockedCellKeys(options.blockedCells).has(groundKey)) {
      return createRejectedResult(blockType, options.blockedReason || "blocked-cell");
    }

    if (layer <= 0 && occupancyStore?.getObjectAt?.(normalizedCell)) {
      return createRejectedResult(blockType, "blocked-cell");
    }

    return {
      placed: true,
      reason: null,
      blockType,
      block: null,
      targetCell: normalizedCell
    };
  }

  function placeBlock(cell, options = {}) {
    const normalizedCell = resolvePlacementCell(cell, options);
    const blockType = options.blockType || FREE_BLOCK_TYPES.BLOCK;
    const canPlace = canPlaceBlock(normalizedCell, {
      ...options,
      blockType
    });

    if (!canPlace.placed) {
      return canPlace;
    }

    const block = createBlock({ buildId, cell: normalizedCell, blockType });
    blocks.set(blockCellKey(normalizedCell), block);
    return {
      placed: true,
      reason: null,
      blockType,
      block
    };
  }

  function removeBlock(cell) {
    const normalizedCell = hasExplicitBlockLayer(cell) ?
      cloneBlockCell(cell) :
      cloneBlockCell(getTopBlockAtCell(cell)?.cell || cell);
    const key = blockCellKey(normalizedCell);
    const block = blocks.get(key) || null;

    if (!block) {
      return {
        removed: false,
        reason: "missing-block",
        blockType: FREE_BLOCK_TYPES.BLOCK,
        block: null
      };
    }

    blocks.delete(key);
    return {
      removed: true,
      reason: null,
      blockType: block.blockType || FREE_BLOCK_TYPES.BLOCK,
      block
    };
  }

  function clearBlocks() {
    blocks.clear();
  }

  function serializeFreeBlocks() {
    const serializedBlocks = [...blocks.values()].map(serializeBlock);
    return {
      schemaVersion: FREE_BLOCK_BUILD_SAVE_SCHEMA_VERSION,
      buildId,
      bounds: cloneBounds(buildBounds),
      blocks: serializedBlocks,
      floorBlocks: serializedBlocks
    };
  }

  function restoreFreeBlocks(snapshot = {}) {
    clearBlocks();
    const rejected = [];
    let blockCount = 0;
    const sourceBlocks = Array.isArray(snapshot.blocks) ? snapshot.blocks : snapshot.floorBlocks || [];

    for (const sourceBlock of sourceBlocks) {
      const sourceCell = sourceBlock.cell || sourceBlock;
      const restoredCell = cloneBlockCell({
        ...sourceCell,
        layer: sourceBlock.layer ?? sourceCell.layer
      });
      const result = placeBlock(restoredCell, {
        blockType: sourceBlock.blockType || FREE_BLOCK_TYPES.BLOCK
      });
      if (result.placed) {
        blockCount += 1;
      } else {
        rejected.push({ blockType: FREE_BLOCK_TYPES.BLOCK, source: sourceBlock, result });
      }
    }

    return {
      restored: { blockCount },
      rejected,
      completionState: getCompletionState()
    };
  }

  return Object.freeze({
    buildId,
    bounds: cloneBounds(buildBounds),
    canPlaceBlock,
    placeBlock,
    removeBlock,
    getBlockAtCell,
    getTopBlockAtCell,
    getCompletionState,
    serializeFreeBlocks,
    restoreFreeBlocks,
    listBlocks() {
      return [...blocks.values()];
    }
  });
}

function createDefaultBlockPlacementDefinition({
  buildState,
  blockInstanceStore,
  createInstance,
  blockType = FREE_BLOCK_TYPES.BLOCK,
  materialCost = null
}) {
  return {
    blockType,
    materialCost,
    canPlace(context = {}) {
      const targetCell = cloneBlockCell(context.targetCell);
      const result = buildState.canPlaceBlock(targetCell, {
        ...context,
        blockType
      });
      const resolvedTargetCell = result.targetCell || targetCell;
      if (result.placed && materialCost && !hasMaterialCost(context.inventory, materialCost)) {
        return {
          ...createMissingMaterialResult(blockType, resolvedTargetCell, materialCost, context.inventory),
          completionState: buildState.getCompletionState()
        };
      }
      return {
        handled: true,
        valid: Boolean(result.placed),
        reason: result.reason,
        blockType,
        targetCell: resolvedTargetCell,
        completionState: buildState.getCompletionState()
      };
    },
    place(context = {}) {
      const targetCell = cloneBlockCell(context.targetCell);
      const canPlace = buildState.canPlaceBlock(targetCell, {
        ...context,
        blockType
      });
      const resolvedTargetCell = canPlace.targetCell || targetCell;
      if (!canPlace.placed) {
        return {
          ...canPlace,
          targetCell: resolvedTargetCell,
          handled: true,
          instance: null,
          completionState: buildState.getCompletionState()
        };
      }

      if (materialCost && !consumeMaterialCost(context.inventory, materialCost)) {
        return {
          ...createMissingMaterialResult(blockType, resolvedTargetCell, materialCost, context.inventory),
          instance: null,
          completionState: buildState.getCompletionState()
        };
      }

      const result = buildState.placeBlock(resolvedTargetCell, {
        ...context,
        blockType
      });

      if (!result.placed) {
        if (materialCost) {
          refundMaterialCost(context.inventory, materialCost);
        }
        return {
          ...result,
          targetCell: resolvedTargetCell,
          handled: true,
          instance: null,
          completionState: buildState.getCompletionState()
        };
      }

      const instance = createInstance({
        block: result.block,
        gridSystem: context.gridSystem,
        blockType
      });
      blockInstanceStore.push(instance);

      return {
        ...result,
        targetCell: result.block?.cell || resolvedTargetCell,
        handled: true,
        instance,
        completionState: buildState.getCompletionState()
      };
    }
  };
}

export function createFreeBlockBuildController({
  gridSystem,
  buildState,
  blockInstanceStore = [],
  initialBlockType = FREE_BLOCK_TYPES.BLOCK,
  blockDefinitions = [],
  createInstance = createFreeBlockModelInstance
} = {}) {
  if (!gridSystem || typeof gridSystem.worldToCell !== "function") {
    throw new TypeError("gridSystem is required");
  }

  if (!buildState || typeof buildState.placeBlock !== "function") {
    throw new TypeError("buildState is required");
  }

  if (!Array.isArray(blockInstanceStore)) {
    throw new TypeError("blockInstanceStore must be an array");
  }

  const definitions = new Map();
  let selectedBlockType = initialBlockType || FREE_BLOCK_TYPES.BLOCK;

  function registerBlockDefinition(definition) {
    if (!definition?.blockType || typeof definition.place !== "function") {
      throw new TypeError("block definition requires blockType and place");
    }

    definitions.set(definition.blockType, definition);
    return definition;
  }

  registerBlockDefinition(createDefaultBlockPlacementDefinition({
    buildState,
    blockInstanceStore,
    createInstance
  }));
  registerBlockDefinition(createDefaultBlockPlacementDefinition({
    buildState,
    blockInstanceStore,
    createInstance,
    blockType: FREE_BLOCK_TYPES.WALL,
    materialCost: FREE_BLOCK_WALL_COST
  }));

  for (const definition of blockDefinitions) {
    registerBlockDefinition(definition);
  }

  function setSelectedBlockType(blockType) {
    if (!definitions.has(blockType)) {
      return false;
    }

    selectedBlockType = blockType;
    return true;
  }

  function getSelectedBlockMaterialCost() {
    const materialCost = definitions.get(selectedBlockType)?.materialCost;
    if (!materialCost?.itemId || !Number.isFinite(Number(materialCost.quantity))) {
      return null;
    }

    return {
      itemId: materialCost.itemId,
      quantity: Math.max(0, Number(materialCost.quantity))
    };
  }

  function resolveTargetCell(options = {}) {
    const {
      targetCell = null,
      playerPosition = null,
      playerYaw = null,
      forwardDirection = null,
      forwardDistance = DEFAULT_FREE_BLOCK_FORWARD_DISTANCE
    } = options;

    if (targetCell) {
      return cloneBlockCell(targetCell);
    }

    const resolvedTargetCell = resolveFreeBlockTargetCell({
      gridSystem,
      playerPosition,
      playerYaw,
      forwardDirection,
      forwardDistance
    });

    return snapResolvedTargetCellToBuildZone({
      targetCell: resolvedTargetCell,
      buildZone: options.buildZone,
      blockType: selectedBlockType,
      buildState,
      options
    });
  }

  function placeSelectedBlockAtTarget(options = {}) {
    const definition = definitions.get(selectedBlockType);
    if (!definition) {
      return {
        handled: false,
        placed: false,
        reason: "unknown-block-type",
        blockType: selectedBlockType,
        block: null,
        targetCell: null,
        instance: null,
        completionState: buildState.getCompletionState()
      };
    }

    const resolvedTargetCell = resolveTargetCell(options);
    if (!resolvedTargetCell) {
      return {
        handled: true,
        placed: false,
        reason: "missing-target-cell",
        blockType: selectedBlockType,
        block: null,
        targetCell: null,
        instance: null,
        completionState: buildState.getCompletionState()
      };
    }

    return definition.place({
      gridSystem,
      buildState,
      targetCell: resolvedTargetCell,
      ...options,
      selectedBlockType
    });
  }

  function validateSelectedBlockTarget(options = {}) {
    const definition = definitions.get(selectedBlockType);
    if (!definition) {
      return {
        handled: false,
        valid: false,
        reason: "unknown-block-type",
        blockType: selectedBlockType,
        targetCell: null,
        completionState: buildState.getCompletionState()
      };
    }

    const resolvedTargetCell = resolveTargetCell(options);
    if (!resolvedTargetCell) {
      return {
        handled: true,
        valid: false,
        reason: "missing-target-cell",
        blockType: selectedBlockType,
        targetCell: null,
        completionState: buildState.getCompletionState()
      };
    }

    if (typeof definition.canPlace === "function") {
      return definition.canPlace({
        gridSystem,
        buildState,
        targetCell: resolvedTargetCell,
        ...options,
        selectedBlockType
      });
    }

    return {
      handled: true,
      valid: true,
      reason: null,
      blockType: selectedBlockType,
      targetCell: resolvedTargetCell,
      completionState: buildState.getCompletionState()
    };
  }

  function resolveSelectedBlockTarget(options = {}) {
    const targetCell = resolveTargetCell(options);

    return {
      handled: true,
      blockType: selectedBlockType,
      targetCell
    };
  }

  function removeBlockAtTarget(options = {}) {
    const targetCell = resolveTargetCell(options);
    if (!targetCell) {
      return {
        handled: true,
        removed: false,
        reason: "missing-target-cell",
        blockType: FREE_BLOCK_TYPES.BLOCK,
        block: null,
        targetCell: null,
        completionState: buildState.getCompletionState()
      };
    }

    const result = buildState.removeBlock(targetCell);
    const definition = result.removed ? definitions.get(result.blockType) : null;
    const materialCost = definition?.materialCost ?
      {
        itemId: definition.materialCost.itemId,
        quantity: Math.max(0, Number(definition.materialCost.quantity || 0))
      } :
      null;
    if (result.removed) {
      if (materialCost && options.refundMaterial !== false) {
        refundMaterialCost(options.inventory, definition.materialCost);
      }
      const removedKey = blockCellKey(result.block?.cell || targetCell);
      for (let index = blockInstanceStore.length - 1; index >= 0; index -= 1) {
        const instance = blockInstanceStore[index];
        if (blockCellKey(instance?.freeBlockCell) === removedKey) {
          blockInstanceStore.splice(index, 1);
        }
      }
    }

    return {
      ...result,
      handled: true,
      materialCost,
      targetCell: result.block?.cell || targetCell,
      completionState: buildState.getCompletionState()
    };
  }

  function syncInstancesFromState() {
    blockInstanceStore.splice(0, blockInstanceStore.length);
    for (const block of buildState.listBlocks()) {
      blockInstanceStore.push(createInstance({
        block,
        gridSystem,
        blockType: block.blockType || FREE_BLOCK_TYPES.BLOCK
      }));
    }
    return blockInstanceStore;
  }

  return Object.freeze({
    registerBlockDefinition,
    setSelectedBlockType,
    getSelectedBlockType() {
      return selectedBlockType;
    },
    getSelectedBlockMaterialCost,
    validateSelectedBlockTarget,
    resolveSelectedBlockTarget,
    placeSelectedBlockAtTarget,
    removeBlockAtTarget,
    syncInstancesFromState,
    getCompletionState: buildState.getCompletionState,
    serializeFreeBlocks: buildState.serializeFreeBlocks
  });
}
