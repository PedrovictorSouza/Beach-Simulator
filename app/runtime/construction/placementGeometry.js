export function getPlacementRect(position, size = [1, 1]) {
  const width = Math.max(0.01, Number(size?.[0]) || 1);
  const depth = Math.max(0.01, Number(size?.[1]) || 1);

  return {
    minX: position[0] - width * 0.5,
    maxX: position[0] + width * 0.5,
    minZ: position[2] - depth * 0.5,
    maxZ: position[2] + depth * 0.5
  };
}

export function doPlacementRectsOverlap(a, b, gutter = 0.12) {
  return !(
    a.maxX - gutter <= b.minX + gutter ||
    a.minX + gutter >= b.maxX - gutter ||
    a.maxZ - gutter <= b.minZ + gutter ||
    a.minZ + gutter >= b.maxZ - gutter
  );
}

export function getPlacementCollisionSize(placement, fallbackSize = [1, 1]) {
  if (
    Array.isArray(placement?.size) &&
    Number(placement.size[0]) > 0 &&
    Number(placement.size[1]) > 0
  ) {
    return placement.size;
  }

  return fallbackSize;
}

export function normalizePlacementYaw(yaw = 0) {
  const tau = Math.PI * 2;
  return ((Number(yaw || 0) % tau) + tau) % tau;
}

export function getRotatedPlacementSize(
  size = [1, 1],
  yaw = 0,
  { placementRotationStep = Math.PI * 0.5 } = {}
) {
  const width = Math.max(0.01, Number(size?.[0]) || 1);
  const depth = Math.max(0.01, Number(size?.[1]) || 1);
  const quarterTurn = Math.round(normalizePlacementYaw(yaw) / placementRotationStep) % 4;
  return quarterTurn % 2 === 1 ? [depth, width] : [width, depth];
}

function normalizeGridFootprint(footprint = { width: 1, height: 1 }) {
  return {
    width: Math.max(1, Math.round(Number(footprint?.width) || 1)),
    height: Math.max(1, Math.round(Number(footprint?.height) || 1))
  };
}

export function getRotatedGridFootprint(
  footprint = { width: 1, height: 1 },
  yaw = 0
) {
  const normalizedFootprint = normalizeGridFootprint(footprint);
  const quarterTurn = Math.abs(Math.round(Number(yaw || 0) / (Math.PI * 0.5))) % 4;

  if (quarterTurn % 2 === 1) {
    return {
      width: normalizedFootprint.height,
      height: normalizedFootprint.width
    };
  }

  return normalizedFootprint;
}

export function hasFinitePlacementBounds(bounds) {
  return Boolean(
    bounds &&
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minZ) &&
    Number.isFinite(bounds.maxZ)
  );
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getFoundationBuildZoneSignature(buildZone = null) {
  if (!buildZone?.originCell) {
    return "missing";
  }

  return [
    buildZone.originCell.x,
    buildZone.originCell.y,
    buildZone.width,
    buildZone.height
  ].join(":");
}

export function buildFoundationBuildZoneCandidateOrigins({
  defaultOriginCell = { x: 0, y: 0 },
  searchRadius = 0
} = {}) {
  const origins = [];
  const radiusLimit = Math.max(0, Math.trunc(Number(searchRadius) || 0));

  for (let radius = 0; radius <= radiusLimit; radius += 1) {
    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        if (Math.max(Math.abs(x), Math.abs(y)) !== radius) {
          continue;
        }

        origins.push({
          x: defaultOriginCell.x + x,
          y: defaultOriginCell.y + y
        });
      }
    }
  }

  return origins;
}

export function normalizeFoundationBuildZoneOriginCell(
  originCell = null,
  fallbackOriginCell = { x: 0, y: 0 }
) {
  const fallbackX = Math.trunc(Number(fallbackOriginCell?.x));
  const fallbackY = Math.trunc(Number(fallbackOriginCell?.y ?? fallbackOriginCell?.z));
  const x = Math.trunc(Number(originCell?.x));
  const y = Math.trunc(Number(originCell?.y ?? originCell?.z));

  return {
    x: Number.isFinite(x) ? x : Number.isFinite(fallbackX) ? fallbackX : 0,
    y: Number.isFinite(y) ? y : Number.isFinite(fallbackY) ? fallbackY : 0
  };
}

export function isFoundationBuildZoneOriginInsideGrid({
  originCell,
  width,
  height,
  gridConfig
} = {}) {
  if (!originCell || !gridConfig) {
    return false;
  }

  return originCell.x >= 0 &&
    originCell.y >= 0 &&
    originCell.x + width <= gridConfig.width &&
    originCell.y + height <= gridConfig.height;
}

export function getFoundationBuildZoneCellKeys(buildZone = null) {
  return new Set((buildZone?.cells || []).map((cell) => `${cell.x}:${cell.y}`));
}

export function getFoundationBuildZoneWorldRect(buildZone = null, gridConfig = null) {
  if (!buildZone?.originCell || !gridConfig?.origin) {
    return null;
  }

  const cellSize = Number(gridConfig.cellSize || 1);
  const minX = gridConfig.origin.x + buildZone.originCell.x * cellSize;
  const minZ = gridConfig.origin.z + buildZone.originCell.y * cellSize;

  return {
    minX,
    maxX: minX + buildZone.width * cellSize,
    minZ,
    maxZ: minZ + buildZone.height * cellSize
  };
}

export function createFoundationBuildZoneBlockerRect({
  id = "blocker",
  kind = "object",
  position = null,
  size = null,
  radius = null
} = {}) {
  if (!Array.isArray(position)) {
    return null;
  }

  const x = Number(position[0]);
  const z = Number(position[2]);
  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return null;
  }

  const width = Number(radius) > 0 ?
    Number(radius) * 2 :
    Math.max(0.1, Number(size?.[0]) || 1);
  const depth = Number(radius) > 0 ?
    Number(radius) * 2 :
    Math.max(0.1, Number(size?.[1] ?? size?.[2]) || width);

  return {
    id,
    kind,
    minX: x - width * 0.5,
    maxX: x + width * 0.5,
    minZ: z - depth * 0.5,
    maxZ: z + depth * 0.5
  };
}

export function doFoundationBuildZoneRectsOverlap(left, right, padding = 0.08) {
  if (!left || !right) {
    return false;
  }

  return left.minX < right.maxX + padding &&
    left.maxX > right.minX - padding &&
    left.minZ < right.maxZ + padding &&
    left.maxZ > right.minZ - padding;
}

export function buildSolarStationFieldMarkedGroundCells(
  placementTarget,
  { markedTileLimit = 1200 } = {}
) {
  const bounds = placementTarget?.bounds;

  if (placementTarget?.showField === false || !hasFinitePlacementBounds(bounds)) {
    return [];
  }

  const gridStep = Math.max(0.25, Number(placementTarget?.gridStep) || 1.425);
  const cells = [];
  let rowIndex = 0;

  for (
    let z = bounds.minZ;
    z <= bounds.maxZ + gridStep * 0.25 && cells.length < markedTileLimit;
    z += gridStep
  ) {
    let columnIndex = 0;

    for (
      let x = bounds.minX;
      x <= bounds.maxX + gridStep * 0.25 && cells.length < markedTileLimit;
      x += gridStep
    ) {
      cells.push({
        id: `solar-station-field-${columnIndex}-${rowIndex}`,
        offset: [
          Number(x.toFixed(3)),
          0.02,
          Number(z.toFixed(3))
        ],
        surfaceY: 0.02,
        tileSpan: gridStep
      });
      columnIndex += 1;
    }

    rowIndex += 1;
  }

  return cells;
}

export function buildPlacementPreviewFootprintCells(preview, {
  idPrefix,
  footprint,
  targetState
} = {}) {
  if (!preview?.snappedPosition) {
    return [];
  }

  const gridStep = Math.max(
    0.25,
    Number(preview.gridStep) ||
      Number(preview.gridConfig?.cellSize) ||
      1.425
  );
  const rotatedFootprint = getRotatedGridFootprint(footprint, preview.yaw);
  const originX = preview.snappedPosition[0] - ((rotatedFootprint.width - 1) * gridStep * 0.5);
  const originZ = preview.snappedPosition[2] - ((rotatedFootprint.height - 1) * gridStep * 0.5);
  const surfaceY = preview.snappedPosition[1] || 0.02;
  const cells = [];

  for (let row = 0; row < rotatedFootprint.height; row += 1) {
    for (let column = 0; column < rotatedFootprint.width; column += 1) {
      cells.push({
        id: `${idPrefix}-${column}-${row}`,
        offset: [
          Number((originX + column * gridStep).toFixed(3)),
          surfaceY,
          Number((originZ + row * gridStep).toFixed(3))
        ],
        surfaceY,
        tileSpan: gridStep,
        highlightTargetState: targetState
      });
    }
  }

  return cells;
}

export function getPlacementPreviewFootprintWorldSize(preview, footprint) {
  const gridStep = Math.max(
    0.25,
    Number(preview?.gridStep) ||
      Number(preview?.gridConfig?.cellSize) ||
      1.425
  );
  const rotatedFootprint = getRotatedGridFootprint(footprint, preview?.yaw);

  return [
    rotatedFootprint.width * gridStep,
    rotatedFootprint.height * gridStep
  ];
}

export function getSnappedPlacementPreviewPosition(preview) {
  const bounds = preview?.bounds;
  const position = Array.isArray(preview?.position) ?
    preview.position :
    [0, 0.02, 0];
  const gridConfig = preview?.gridConfig;

  if (
    Number.isFinite(Number(gridConfig?.cellSize)) &&
    gridConfig.cellSize > 0 &&
    Number.isFinite(Number(gridConfig?.origin?.x)) &&
    Number.isFinite(Number(gridConfig?.origin?.z)) &&
    Number.isInteger(gridConfig.width) &&
    Number.isInteger(gridConfig.height)
  ) {
    const cellSize = Number(gridConfig.cellSize);
    const originX = Number(gridConfig.origin.x);
    const originZ = Number(gridConfig.origin.z);
    const centerOffset = cellSize * 0.5;
    const minCellX = hasFinitePlacementBounds(bounds) ?
      Math.ceil((bounds.minX - originX - centerOffset) / cellSize) :
      0;
    const maxCellX = hasFinitePlacementBounds(bounds) ?
      Math.floor((bounds.maxX - originX - centerOffset) / cellSize) :
      gridConfig.width - 1;
    const minCellZ = hasFinitePlacementBounds(bounds) ?
      Math.ceil((bounds.minZ - originZ - centerOffset) / cellSize) :
      0;
    const maxCellZ = hasFinitePlacementBounds(bounds) ?
      Math.floor((bounds.maxZ - originZ - centerOffset) / cellSize) :
      gridConfig.height - 1;

    if (minCellX <= maxCellX && minCellZ <= maxCellZ) {
      const rawCellX = Math.floor((position[0] - originX) / cellSize);
      const rawCellZ = Math.floor((position[2] - originZ) / cellSize);
      const cellX = clampNumber(rawCellX, Math.max(0, minCellX), Math.min(gridConfig.width - 1, maxCellX));
      const cellZ = clampNumber(rawCellZ, Math.max(0, minCellZ), Math.min(gridConfig.height - 1, maxCellZ));

      return [
        Number((originX + cellX * cellSize + centerOffset).toFixed(4)),
        0.02,
        Number((originZ + cellZ * cellSize + centerOffset).toFixed(4))
      ];
    }
  }

  const gridStep = Math.max(0.25, Number(preview?.gridStep) || 1.425);

  if (!hasFinitePlacementBounds(bounds)) {
    return [position[0], 0.02, position[2]];
  }

  const snapAxis = (value, min, max) => {
    const snapped = min + Math.round((value - min) / gridStep) * gridStep;
    return clampNumber(snapped, min, max);
  };

  return [
    snapAxis(position[0], bounds.minX, bounds.maxX),
    0.02,
    snapAxis(position[2], bounds.minZ, bounds.maxZ)
  ];
}
