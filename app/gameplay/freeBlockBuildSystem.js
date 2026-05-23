import {
  cellKey,
  normalizeCell
} from "./gridBuildingSystem.js";

export const FREE_BLOCK_TYPES = Object.freeze({
  FLOOR: "floor"
});

export const FREE_BLOCK_BUILD_SAVE_SCHEMA_VERSION = 1;

const DEFAULT_BUILD_BOUNDS = Object.freeze({
  minX: 0,
  maxX: 255,
  minY: 0,
  maxY: 255
});
const DEFAULT_FREE_BLOCK_FORWARD_DISTANCE = 1;
const DEFAULT_FREE_BLOCK_INSTANCE_SCALE = 1;
const DEFAULT_FREE_BLOCK_INSTANCE_GROUND_LIFT = 0;

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

function isCellInsideBuildArea(cell, bounds) {
  const normalizedCell = normalizeCell(cell);
  return normalizedCell.x >= bounds.minX &&
    normalizedCell.x <= bounds.maxX &&
    normalizedCell.y >= bounds.minY &&
    normalizedCell.y <= bounds.maxY;
}

function createRejectedResult(blockType, reason) {
  return {
    placed: false,
    reason,
    blockType,
    block: null
  };
}

function createFloorBlock({ buildId, cell }) {
  const normalizedCell = cloneCell(cell);
  return Object.freeze({
    id: `${buildId}:floor:${cellKey(normalizedCell)}`,
    buildId,
    blockType: FREE_BLOCK_TYPES.FLOOR,
    cell: normalizedCell
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
  blockType = FREE_BLOCK_TYPES.FLOOR,
  scale = null,
  groundLift = DEFAULT_FREE_BLOCK_INSTANCE_GROUND_LIFT
} = {}) {
  if (!gridSystem || typeof gridSystem.cellToWorld !== "function") {
    throw new TypeError("gridSystem is required");
  }

  const cell = normalizeCell(block?.cell || block?.targetCell || block);
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
      worldPosition.y + resolvedGroundLift,
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

function serializeFloorBlock(block) {
  return {
    cell: cloneCell(block.cell)
  };
}

export function createFreeBlockBuildState({
  buildId = "freeBuild",
  bounds = DEFAULT_BUILD_BOUNDS,
  occupancyStore = null
} = {}) {
  const buildBounds = normalizeBuildBounds(bounds);
  const floorBlocks = new Map();

  function getCompletionState() {
    return {
      floorCount: floorBlocks.size
    };
  }

  function getBlockAtCell(cell) {
    return floorBlocks.get(cellKey(normalizeCell(cell))) || null;
  }

  function canPlaceFloorBlock(cell) {
    const normalizedCell = cloneCell(cell);
    const key = cellKey(normalizedCell);

    if (!isCellInsideBuildArea(normalizedCell, buildBounds)) {
      return createRejectedResult(FREE_BLOCK_TYPES.FLOOR, "outside-build-area");
    }

    if (floorBlocks.has(key)) {
      return createRejectedResult(FREE_BLOCK_TYPES.FLOOR, "duplicate-floor");
    }

    if (occupancyStore?.getObjectAt?.(normalizedCell)) {
      return createRejectedResult(FREE_BLOCK_TYPES.FLOOR, "blocked-cell");
    }

    return {
      placed: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block: null
    };
  }

  function placeFloorBlock(cell) {
    const normalizedCell = cloneCell(cell);
    const canPlace = canPlaceFloorBlock(normalizedCell);

    if (!canPlace.placed) {
      return canPlace;
    }

    const block = createFloorBlock({ buildId, cell: normalizedCell });
    floorBlocks.set(cellKey(normalizedCell), block);
    return {
      placed: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block
    };
  }

  function removeFloorBlock(cell) {
    const normalizedCell = cloneCell(cell);
    const key = cellKey(normalizedCell);
    const block = floorBlocks.get(key) || null;

    if (!block) {
      return {
        removed: false,
        reason: "missing-floor",
        blockType: FREE_BLOCK_TYPES.FLOOR,
        block: null
      };
    }

    floorBlocks.delete(key);
    return {
      removed: true,
      reason: null,
      blockType: FREE_BLOCK_TYPES.FLOOR,
      block
    };
  }

  function clearBlocks() {
    floorBlocks.clear();
  }

  function serializeFreeBlocks() {
    return {
      schemaVersion: FREE_BLOCK_BUILD_SAVE_SCHEMA_VERSION,
      buildId,
      bounds: cloneBounds(buildBounds),
      floorBlocks: [...floorBlocks.values()].map(serializeFloorBlock)
    };
  }

  function restoreFreeBlocks(snapshot = {}) {
    clearBlocks();
    const rejected = [];
    let floorCount = 0;

    for (const floorBlock of snapshot.floorBlocks || []) {
      const result = placeFloorBlock(floorBlock.cell || floorBlock);
      if (result.placed) {
        floorCount += 1;
      } else {
        rejected.push({ blockType: FREE_BLOCK_TYPES.FLOOR, source: floorBlock, result });
      }
    }

    return {
      restored: { floorCount },
      rejected,
      completionState: getCompletionState()
    };
  }

  return Object.freeze({
    buildId,
    bounds: cloneBounds(buildBounds),
    canPlaceFloorBlock,
    placeFloorBlock,
    removeFloorBlock,
    getBlockAtCell,
    getCompletionState,
    serializeFreeBlocks,
    restoreFreeBlocks,
    listFloorBlocks() {
      return [...floorBlocks.values()];
    }
  });
}

function createDefaultFloorPlacementDefinition({
  buildState,
  blockInstanceStore,
  createInstance
}) {
  return {
    blockType: FREE_BLOCK_TYPES.FLOOR,
    canPlace(context = {}) {
      const targetCell = normalizeCell(context.targetCell);
      const result = buildState.canPlaceFloorBlock(targetCell);
      return {
        handled: true,
        valid: Boolean(result.placed),
        reason: result.reason,
        blockType: FREE_BLOCK_TYPES.FLOOR,
        targetCell,
        completionState: buildState.getCompletionState()
      };
    },
    place(context = {}) {
      const targetCell = normalizeCell(context.targetCell);
      const result = buildState.placeFloorBlock(targetCell);

      if (!result.placed) {
        return {
          ...result,
          targetCell,
          handled: true,
          instance: null,
          completionState: buildState.getCompletionState()
        };
      }

      const instance = createInstance({
        block: result.block,
        gridSystem: context.gridSystem,
        blockType: FREE_BLOCK_TYPES.FLOOR
      });
      blockInstanceStore.push(instance);

      return {
        ...result,
        targetCell,
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
  initialBlockType = FREE_BLOCK_TYPES.FLOOR,
  blockDefinitions = [],
  createInstance = createFreeBlockModelInstance
} = {}) {
  if (!gridSystem || typeof gridSystem.worldToCell !== "function") {
    throw new TypeError("gridSystem is required");
  }

  if (!buildState || typeof buildState.placeFloorBlock !== "function") {
    throw new TypeError("buildState is required");
  }

  if (!Array.isArray(blockInstanceStore)) {
    throw new TypeError("blockInstanceStore must be an array");
  }

  const definitions = new Map();
  let selectedBlockType = initialBlockType || FREE_BLOCK_TYPES.FLOOR;

  function registerBlockDefinition(definition) {
    if (!definition?.blockType || typeof definition.place !== "function") {
      throw new TypeError("block definition requires blockType and place");
    }

    definitions.set(definition.blockType, definition);
    return definition;
  }

  registerBlockDefinition(createDefaultFloorPlacementDefinition({
    buildState,
    blockInstanceStore,
    createInstance
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

  function resolveTargetCell({
    targetCell = null,
    playerPosition = null,
    playerYaw = null,
    forwardDirection = null,
    forwardDistance = DEFAULT_FREE_BLOCK_FORWARD_DISTANCE
  } = {}) {
    return targetCell ?
      normalizeCell(targetCell) :
      resolveFreeBlockTargetCell({
        gridSystem,
        playerPosition,
        playerYaw,
        forwardDirection,
        forwardDistance
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
        blockType: FREE_BLOCK_TYPES.FLOOR,
        block: null,
        targetCell: null,
        completionState: buildState.getCompletionState()
      };
    }

    const result = buildState.removeFloorBlock(targetCell);
    if (result.removed) {
      const removedKey = cellKey(targetCell);
      for (let index = blockInstanceStore.length - 1; index >= 0; index -= 1) {
        const instance = blockInstanceStore[index];
        if (cellKey(instance?.freeBlockCell) === removedKey) {
          blockInstanceStore.splice(index, 1);
        }
      }
    }

    return {
      ...result,
      handled: true,
      targetCell,
      completionState: buildState.getCompletionState()
    };
  }

  function syncInstancesFromState() {
    blockInstanceStore.splice(0, blockInstanceStore.length);
    for (const block of buildState.listFloorBlocks()) {
      blockInstanceStore.push(createInstance({
        block,
        gridSystem,
        blockType: FREE_BLOCK_TYPES.FLOOR
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
    validateSelectedBlockTarget,
    resolveSelectedBlockTarget,
    placeSelectedBlockAtTarget,
    removeBlockAtTarget,
    syncInstancesFromState,
    getCompletionState: buildState.getCompletionState,
    serializeFreeBlocks: buildState.serializeFreeBlocks
  });
}
