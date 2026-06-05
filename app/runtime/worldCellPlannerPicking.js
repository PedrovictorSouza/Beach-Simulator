export function getWorldCellPlannerGroundCells({
  groundDeadInstances,
  groundPurifiedInstances,
  iceGroundInstances
} = {}) {
  const cells = [];
  const seenCellIds = new Set();
  const collections = [
    groundDeadInstances,
    groundPurifiedInstances,
    iceGroundInstances
  ];

  for (const collection of collections) {
    if (!Array.isArray(collection)) {
      continue;
    }

    for (const groundCell of collection) {
      if (
        !groundCell?.id ||
        seenCellIds.has(groundCell.id) ||
        !Array.isArray(groundCell.offset)
      ) {
        continue;
      }

      seenCellIds.add(groundCell.id);
      cells.push(groundCell);
    }
  }

  return cells;
}

export function projectWorldCellPlannerGroundCell({
  groundCell,
  camera,
  worldCanvas
} = {}) {
  if (!groundCell?.offset || typeof camera?.project !== "function" || !worldCanvas) {
    return null;
  }

  const canvasWidth = worldCanvas.width || 0;
  const canvasHeight = worldCanvas.height || 0;

  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return null;
  }

  const surfaceY = Number(groundCell.surfaceY ?? 0);
  const projected = camera.project(
    [groundCell.offset[0], surfaceY + 0.08, groundCell.offset[2]],
    canvasWidth,
    canvasHeight
  );

  if (!projected || projected.depth > 1) {
    return null;
  }

  const rect = worldCanvas.getBoundingClientRect?.();

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return {
      x: projected.x,
      y: projected.y
    };
  }

  return {
    x: rect.left + projected.x * (rect.width / canvasWidth),
    y: rect.top + projected.y * (rect.height / canvasHeight)
  };
}

export function createWorldCellPlannerSelection({
  groundCell,
  getGridCell = () => null,
  isColdGroundCell = () => false
} = {}) {
  const surfaceY = Number(groundCell?.surfaceY ?? 0);
  const offset = groundCell?.offset || [0, 0, 0];
  const groundKind = groundCell?.groundKind ||
    (isColdGroundCell(groundCell) ? "cold" : "dead");

  return {
    cellId: groundCell?.id || "unknown",
    gridCell: getGridCell(groundCell),
    worldPosition: [
      Number(Number(offset[0] || 0).toFixed(3)),
      Number(surfaceY.toFixed(3)),
      Number(Number(offset[2] || 0).toFixed(3))
    ],
    tileSpan: Number(groundCell?.tileSpan || 0),
    groundKind
  };
}

export function resolveWorldCellPlannerPick({
  request,
  groundCells = [],
  projectGroundCell = () => null,
  createSelection = () => null,
  maxDistancePx
} = {}) {
  const clientX = Number(request?.clientX);
  const clientY = Number(request?.clientY);

  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    return null;
  }

  let closestGroundCell = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const groundCell of groundCells) {
    const projected = projectGroundCell(groundCell);
    if (!projected) {
      continue;
    }

    const distance = Math.hypot(projected.x - clientX, projected.y - clientY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestGroundCell = groundCell;
    }
  }

  if (!closestGroundCell || closestDistance > maxDistancePx) {
    return null;
  }

  return {
    groundCell: closestGroundCell,
    selection: createSelection(closestGroundCell)
  };
}
