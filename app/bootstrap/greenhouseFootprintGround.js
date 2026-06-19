import { purifyGroundCell, syncPurifiedGroundVariantInstances } from "../../groundGrid.js";
import { DEFAULT_GRID_PLACEMENT_SAVE_CONFIG } from "./manualSaveSessionState.js";

const GREENHOUSE_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 5, height: 3 });

function normalizeGreenhouseGridFootprint(footprint = GREENHOUSE_PLACEMENT_GRID_FOOTPRINT) {
  return {
    width: Math.max(1, Math.round(Number(footprint?.width) || GREENHOUSE_PLACEMENT_GRID_FOOTPRINT.width)),
    height: Math.max(1, Math.round(Number(footprint?.height) || GREENHOUSE_PLACEMENT_GRID_FOOTPRINT.height))
  };
}

function getRotatedGreenhouseGridFootprint(footprint = GREENHOUSE_PLACEMENT_GRID_FOOTPRINT, yaw = 0) {
  const normalizedFootprint = normalizeGreenhouseGridFootprint(footprint);
  const quarterTurn = Math.abs(Math.round(Number(yaw || 0) / (Math.PI * 0.5))) % 4;

  if (quarterTurn % 2 === 1) {
    return {
      width: normalizedFootprint.height,
      height: normalizedFootprint.width
    };
  }

  return normalizedFootprint;
}

export function buildGreenhouseFootprintGroundPositions(preview) {
  const snappedPosition = Array.isArray(preview?.snappedPosition) ?
    preview.snappedPosition :
    preview?.position;
  if (!Array.isArray(snappedPosition)) {
    return [];
  }

  const gridStep = Math.max(
    0.25,
    Number(preview?.gridStep) ||
      Number(preview?.gridConfig?.cellSize) ||
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize
  );
  const rotatedFootprint = getRotatedGreenhouseGridFootprint(
    GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
    preview?.yaw
  );
  const originX = snappedPosition[0] - ((rotatedFootprint.width - 1) * gridStep * 0.5);
  const originZ = snappedPosition[2] - ((rotatedFootprint.height - 1) * gridStep * 0.5);
  const surfaceY = snappedPosition[1] || 0.02;
  const positions = [];

  for (let row = 0; row < rotatedFootprint.height; row += 1) {
    for (let column = 0; column < rotatedFootprint.width; column += 1) {
      positions.push({
        position: [
          Number((originX + column * gridStep).toFixed(3)),
          surfaceY,
          Number((originZ + row * gridStep).toFixed(3))
        ],
        tileSpan: gridStep
      });
    }
  }

  return positions;
}

function getNearestGreenhouseFootprintTerrainCell(position, {
  groundDeadInstances = [],
  iceGroundInstances = [],
  groundPurifiedInstances = [],
  tileSpan = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize
} = {}) {
  if (!Array.isArray(position)) {
    return null;
  }

  const candidates = [
    ...(Array.isArray(groundDeadInstances) ? groundDeadInstances : []),
    ...(Array.isArray(iceGroundInstances) ? iceGroundInstances : []),
    ...(Array.isArray(groundPurifiedInstances) ? groundPurifiedInstances : [])
  ];
  const tolerance = Math.max(0.18, Number(tileSpan) * 0.42);
  let nearestCell = null;
  let nearestDistance = Infinity;

  for (const groundCell of candidates) {
    if (groundCell?.active === false || !Array.isArray(groundCell?.offset)) {
      continue;
    }

    const distance = Math.hypot(
      Number(position[0]) - Number(groundCell.offset[0]),
      Number(position[2]) - Number(groundCell.offset[2])
    );
    if (distance <= tolerance && distance < nearestDistance) {
      nearestCell = groundCell;
      nearestDistance = distance;
    }
  }

  return nearestCell;
}

export function restoreGreenhouseFootprintGround({
  preview,
  groundDeadInstances = [],
  iceGroundInstances = [],
  groundPurifiedInstances = [],
  restoredGroundCells = null
} = {}) {
  if (!Array.isArray(groundPurifiedInstances)) {
    return 0;
  }

  const deadGround = Array.isArray(groundDeadInstances) ? groundDeadInstances : [];
  const iceGround = Array.isArray(iceGroundInstances) ? iceGroundInstances : [];
  const visitedCells = new Set();
  let restoredCount = 0;
  const footprintPositions = buildGreenhouseFootprintGroundPositions(preview);

  for (const footprintPosition of footprintPositions) {
    const groundCell = getNearestGreenhouseFootprintTerrainCell(footprintPosition.position, {
      groundDeadInstances: deadGround,
      iceGroundInstances: iceGround,
      groundPurifiedInstances,
      tileSpan: footprintPosition.tileSpan
    });

    if (!groundCell || visitedCells.has(groundCell)) {
      continue;
    }

    if (groundPurifiedInstances.includes(groundCell)) {
      visitedCells.add(groundCell);
      continue;
    }

    const restored =
      purifyGroundCell(groundCell, deadGround, groundPurifiedInstances) ||
      purifyGroundCell(groundCell, iceGround, groundPurifiedInstances);

    if (restored) {
      visitedCells.add(groundCell);
      restoredCount += 1;
      if (Array.isArray(restoredGroundCells)) {
        restoredGroundCells.push(groundCell);
      }
    }
  }

  if (restoredCount > 0) {
    syncPurifiedGroundVariantInstances(groundPurifiedInstances);
  }

  return restoredCount;
}
