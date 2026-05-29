const DEFAULT_CELL_SIZE = 1;
const DEFAULT_GRID_ORIGIN = Object.freeze({ x: 0, y: 0, z: 0 });
const CELL_KEY_SEPARATOR = ":";

export const GRID_CELL_DIRECTIONS = Object.freeze({
  NORTH: Object.freeze({ x: 0, y: -1 }),
  SOUTH: Object.freeze({ x: 0, y: 1 }),
  WEST: Object.freeze({ x: -1, y: 0 }),
  EAST: Object.freeze({ x: 1, y: 0 })
});

export const SANDBOTS_WORLD_COORDINATE_MODEL = Object.freeze({
  worldPositionShape: Object.freeze(["x", "y", "z"]),
  gridCellShape: Object.freeze(["x", "y"]),
  groundPlane: Object.freeze({
    columnWorldAxis: "x",
    rowWorldAxis: "z",
    heightWorldAxis: "y"
  }),
  cellKeySeparator: CELL_KEY_SEPARATOR,
  defaultCellSize: DEFAULT_CELL_SIZE
});

function finiteNumberOr(value, fallback = 0) {
  const resolved = Number(value);
  return Number.isFinite(resolved) ? resolved : fallback;
}

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

export function normalizeWorldPosition(position = DEFAULT_GRID_ORIGIN) {
  const source = position || DEFAULT_GRID_ORIGIN;

  if (Array.isArray(source)) {
    return Object.freeze({
      x: finiteNumberOr(source[0]),
      y: finiteNumberOr(source[1]),
      z: finiteNumberOr(source[2])
    });
  }

  return Object.freeze({
    x: finiteNumberOr(source.x),
    y: finiteNumberOr(source.y),
    z: finiteNumberOr(source.z)
  });
}

export function normalizeGridCell(cell = {}) {
  const source = cell || {};
  const x = Number.isFinite(source.x) ? source.x : source.col;
  const y = Number.isFinite(source.y) ? source.y : source.row;

  return Object.freeze({
    x: Math.trunc(finiteNumberOr(x)),
    y: Math.trunc(finiteNumberOr(y))
  });
}

export function getGridCellKey(cell) {
  const normalizedCell = normalizeGridCell(cell);
  return `${normalizedCell.x}${CELL_KEY_SEPARATOR}${normalizedCell.y}`;
}

export function parseGridCellKey(key) {
  const [rawX, rawY, ...extraParts] = String(key || "").split(CELL_KEY_SEPARATOR);
  const x = Number(rawX);
  const y = Number(rawY);

  if (extraParts.length > 0 || !Number.isInteger(x) || !Number.isInteger(y)) {
    return null;
  }

  return Object.freeze({ x, y });
}

export function areGridCellsEqual(a, b) {
  if (!a || !b) {
    return false;
  }

  const cellA = normalizeGridCell(a);
  const cellB = normalizeGridCell(b);
  return cellA.x === cellB.x && cellA.y === cellB.y;
}

export function offsetGridCell(cell, offset = {}) {
  const normalizedCell = normalizeGridCell(cell);
  const normalizedOffset = normalizeGridCell(offset);

  return Object.freeze({
    x: normalizedCell.x + normalizedOffset.x,
    y: normalizedCell.y + normalizedOffset.y
  });
}

export function getGridCellNeighbor(cell, direction, distance = 1) {
  const offset = GRID_CELL_DIRECTIONS[String(direction || "").toUpperCase()];
  const resolvedDistance = Math.trunc(finiteNumberOr(distance, 1));

  if (!offset) {
    throw new TypeError(`Unknown grid cell direction: ${direction}`);
  }

  return offsetGridCell(cell, {
    x: offset.x * resolvedDistance,
    y: offset.y * resolvedDistance
  });
}

export function getCardinalGridCellNeighbors(cell) {
  return Object.freeze([
    getGridCellNeighbor(cell, "north"),
    getGridCellNeighbor(cell, "east"),
    getGridCellNeighbor(cell, "south"),
    getGridCellNeighbor(cell, "west")
  ]);
}

export function normalizeGridAreaSize(size = {}) {
  const source = size || {};
  const rawWidth = Number.isFinite(source.width) ? source.width : source.x;
  const rawHeight = Number.isFinite(source.height) ? source.height : source.y ?? source.depth;

  return Object.freeze({
    width: Math.max(1, Math.trunc(finiteNumberOr(rawWidth, 1))),
    height: Math.max(1, Math.trunc(finiteNumberOr(rawHeight, 1)))
  });
}

export function getGridCellRange(startCell, endCell) {
  const start = normalizeGridCell(startCell);
  const end = normalizeGridCell(endCell);
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  const cells = [];

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      cells.push(Object.freeze({ x, y }));
    }
  }

  return Object.freeze(cells);
}

export function getGridCellRect(originCell, { width = 1, height = 1 } = {}) {
  const origin = normalizeGridCell(originCell);
  const size = normalizeGridAreaSize({ width, height });

  return getGridCellRange(origin, {
    x: origin.x + size.width - 1,
    y: origin.y + size.height - 1
  });
}

export function normalizeGridBounds({
  originCell = { x: 0, y: 0 },
  width = 1,
  height = 1
} = {}) {
  const origin = normalizeGridCell(originCell);
  const size = normalizeGridAreaSize({ width, height });
  const maxCell = Object.freeze({
    x: origin.x + size.width - 1,
    y: origin.y + size.height - 1
  });

  return Object.freeze({
    originCell: origin,
    width: size.width,
    height: size.height,
    minCell: origin,
    maxCell
  });
}

export function isGridCellInsideBounds(cell, bounds) {
  const normalizedCell = normalizeGridCell(cell);
  const normalizedBounds = normalizeGridBounds(bounds);

  return normalizedCell.x >= normalizedBounds.minCell.x &&
    normalizedCell.y >= normalizedBounds.minCell.y &&
    normalizedCell.x <= normalizedBounds.maxCell.x &&
    normalizedCell.y <= normalizedBounds.maxCell.y;
}

export function clampGridCellToBounds(cell, bounds) {
  const normalizedCell = normalizeGridCell(cell);
  const normalizedBounds = normalizeGridBounds(bounds);

  return Object.freeze({
    x: Math.min(Math.max(normalizedCell.x, normalizedBounds.minCell.x), normalizedBounds.maxCell.x),
    y: Math.min(Math.max(normalizedCell.y, normalizedBounds.minCell.y), normalizedBounds.maxCell.y)
  });
}

export function doesGridRectFitBounds(originCell, size, bounds) {
  const origin = normalizeGridCell(originCell);
  const areaSize = normalizeGridAreaSize(size);
  const normalizedBounds = normalizeGridBounds(bounds);

  return origin.x >= normalizedBounds.minCell.x &&
    origin.y >= normalizedBounds.minCell.y &&
    origin.x + areaSize.width - 1 <= normalizedBounds.maxCell.x &&
    origin.y + areaSize.height - 1 <= normalizedBounds.maxCell.y;
}

export function createGridPlacementArea({
  id = "grid-placement-area",
  originCell = { x: 0, y: 0 },
  width = 1,
  height = 1,
  allowedCells = null,
  blockedCells = []
} = {}) {
  const bounds = normalizeGridBounds({ originCell, width, height });
  const allowedCellKeys = Array.isArray(allowedCells) ?
    new Set(allowedCells.map((cell) => getGridCellKey(cell))) :
    null;
  const blockedCellKeys = new Set((Array.isArray(blockedCells) ? blockedCells : [])
    .map((cell) => getGridCellKey(cell)));

  function isCellInside(cell) {
    return isGridCellInsideBounds(cell, bounds);
  }

  function isCellBlocked(cell) {
    return blockedCellKeys.has(getGridCellKey(cell));
  }

  function isCellAllowed(cell) {
    const key = getGridCellKey(cell);

    return isCellInside(cell) &&
      !blockedCellKeys.has(key) &&
      (!allowedCellKeys || allowedCellKeys.has(key));
  }

  function canPlaceRect(rectOriginCell, rectSize = { width: 1, height: 1 }) {
    if (!doesGridRectFitBounds(rectOriginCell, rectSize, bounds)) {
      return false;
    }

    return getGridCellRect(rectOriginCell, rectSize).every((cell) => isCellAllowed(cell));
  }

  return Object.freeze({
    id,
    bounds,
    isCellInside,
    isCellBlocked,
    isCellAllowed,
    canPlaceRect,
    getCells() {
      return getGridCellRect(bounds.originCell, bounds);
    }
  });
}

function getGridCellDebugState(cell, area = null) {
  if (!area) {
    return "normal";
  }

  if (!area.isCellInside(cell)) {
    return "outside";
  }

  if (area.isCellBlocked(cell)) {
    return "blocked";
  }

  return area.isCellAllowed(cell) ? "valid" : "restricted";
}

export function createGridDebugVisualization({
  grid,
  bounds = null,
  placementArea = null,
  originCell = null,
  width = null,
  height = null,
  includeLabels = true
} = {}) {
  const sourceBounds = bounds ||
    placementArea?.bounds ||
    (grid ? {
      originCell: { x: 0, y: 0 },
      width: grid.width,
      height: grid.height
    } : null) ||
    {
      originCell: originCell || { x: 0, y: 0 },
      width: width || 1,
      height: height || 1
    };
  const debugBounds = normalizeGridBounds(sourceBounds);
  const cells = getGridCellRect(debugBounds.originCell, debugBounds);
  const cellSize = Number(grid?.cellSize || 1);
  const toWorld = typeof grid?.cellToWorld === "function" ?
    (cell) => grid.cellToWorld(cell, { center: true, includeVisualOffset: true }) :
    null;

  return Object.freeze({
    kind: "grid-debug-visualization",
    bounds: debugBounds,
    cellCount: cells.length,
    cells: Object.freeze(cells.map((cell) => {
      const key = getGridCellKey(cell);
      return Object.freeze({
        key,
        cell,
        label: includeLabels ? key : "",
        state: getGridCellDebugState(cell, placementArea),
        centerWorldPosition: toWorld ? toWorld(cell) : null,
        cellSize
      });
    }))
  });
}

export function createGridCoordinateModel({
  cellSize = DEFAULT_CELL_SIZE,
  origin = DEFAULT_GRID_ORIGIN,
  visualOffsetY = 0
} = {}) {
  const resolvedCellSize = Number(cellSize);
  assertFiniteNumber(resolvedCellSize, "cellSize");
  if (resolvedCellSize <= 0) {
    throw new TypeError("cellSize must be greater than zero");
  }

  const gridOrigin = normalizeWorldPosition(origin);
  assertFiniteNumber(gridOrigin.x, "origin.x");
  assertFiniteNumber(gridOrigin.y, "origin.y");
  assertFiniteNumber(gridOrigin.z, "origin.z");
  assertFiniteNumber(Number(visualOffsetY), "visualOffsetY");

  function worldToCell(worldPosition) {
    const position = normalizeWorldPosition(worldPosition);
    return Object.freeze({
      x: Math.floor((position.x - gridOrigin.x) / resolvedCellSize),
      y: Math.floor((position.z - gridOrigin.z) / resolvedCellSize)
    });
  }

  function cellToWorld(cell, { center = false, includeVisualOffset = false } = {}) {
    const normalizedCell = normalizeGridCell(cell);
    const offset = center ? resolvedCellSize * 0.5 : 0;

    return Object.freeze({
      x: gridOrigin.x + normalizedCell.x * resolvedCellSize + offset,
      y: gridOrigin.y + (includeVisualOffset ? Number(visualOffsetY) : 0),
      z: gridOrigin.z + normalizedCell.y * resolvedCellSize + offset
    });
  }

  return Object.freeze({
    cellSize: resolvedCellSize,
    origin: gridOrigin,
    visualOffsetY: Number(visualOffsetY),
    worldToCell,
    cellToWorld,
    normalizeCell: normalizeGridCell,
    cellKey: getGridCellKey,
    parseCellKey: parseGridCellKey,
    cellsEqual: areGridCellsEqual,
    offsetCell: offsetGridCell,
    getCellNeighbor: getGridCellNeighbor,
    getCellNeighbors: getCardinalGridCellNeighbors,
    getCellRange: getGridCellRange,
    getCellRect: getGridCellRect,
    normalizeBounds: normalizeGridBounds,
    isCellInsideBounds: isGridCellInsideBounds,
    clampCellToBounds: clampGridCellToBounds,
    doesRectFitBounds: doesGridRectFitBounds,
    createPlacementArea: createGridPlacementArea,
    createDebugVisualization: createGridDebugVisualization
  });
}
