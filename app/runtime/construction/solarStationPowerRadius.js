function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDefaultPlacementCollisionSize(placement, fallbackSize = [1, 1]) {
  if (
    Array.isArray(placement?.size) &&
    Number(placement.size[0]) > 0 &&
    Number(placement.size[1]) > 0
  ) {
    return placement.size;
  }

  return fallbackSize;
}

export function buildSolarStationPowerRadiusGroundCells({
  center,
  radius,
  gridConfig = null,
  gridStep = 1.425,
  idPrefix = "solar-station-power-radius",
  markedTileLimit = 1200
} = {}) {
  if (!Array.isArray(center) || !(radius > 0)) {
    return [];
  }

  const centerX = Number(center[0]);
  const centerZ = Number(center[2]);
  if (!Number.isFinite(centerX) || !Number.isFinite(centerZ)) {
    return [];
  }

  const cellSize = Math.max(
    0.25,
    Number(gridConfig?.cellSize) ||
      Number(gridStep) ||
      1.425
  );
  const cells = [];

  const pushCell = (x, z, columnIndex, rowIndex) => {
    if (cells.length >= markedTileLimit) {
      return;
    }

    const dx = x - centerX;
    const dz = z - centerZ;
    if (dx * dx + dz * dz > radius * radius) {
      return;
    }

    cells.push({
      id: `${idPrefix}-${columnIndex}-${rowIndex}`,
      offset: [
        Number(x.toFixed(3)),
        Array.isArray(center) ? Number(center[1] || 0.02) : 0.02,
        Number(z.toFixed(3))
      ],
      surfaceY: Array.isArray(center) ? Number(center[1] || 0.02) : 0.02,
      tileSpan: cellSize,
      highlightTargetState: "powerRadius",
      highlightPulse: false
    });
  };

  if (
    Number.isFinite(Number(gridConfig?.origin?.x)) &&
    Number.isFinite(Number(gridConfig?.origin?.z)) &&
    Number.isInteger(gridConfig?.width) &&
    Number.isInteger(gridConfig?.height)
  ) {
    const originX = Number(gridConfig.origin.x);
    const originZ = Number(gridConfig.origin.z);
    const minCellX = clampNumber(
      Math.floor((centerX - radius - originX) / cellSize),
      0,
      gridConfig.width - 1
    );
    const maxCellX = clampNumber(
      Math.floor((centerX + radius - originX) / cellSize),
      0,
      gridConfig.width - 1
    );
    const minCellZ = clampNumber(
      Math.floor((centerZ - radius - originZ) / cellSize),
      0,
      gridConfig.height - 1
    );
    const maxCellZ = clampNumber(
      Math.floor((centerZ + radius - originZ) / cellSize),
      0,
      gridConfig.height - 1
    );

    for (let row = minCellZ; row <= maxCellZ; row += 1) {
      for (let column = minCellX; column <= maxCellX; column += 1) {
        pushCell(
          originX + column * cellSize + cellSize * 0.5,
          originZ + row * cellSize + cellSize * 0.5,
          column,
          row
        );
      }
    }

    return cells;
  }

  let rowIndex = 0;
  for (
    let z = centerZ - radius;
    z <= centerZ + radius && cells.length < markedTileLimit;
    z += cellSize
  ) {
    let columnIndex = 0;
    for (
      let x = centerX - radius;
      x <= centerX + radius && cells.length < markedTileLimit;
      x += cellSize
    ) {
      pushCell(x, z, columnIndex, rowIndex);
      columnIndex += 1;
    }
    rowIndex += 1;
  }

  return cells;
}

export function getSolarStationPreviewPowerRadius({
  session,
  preview,
  radiusMultiplier = 1,
  gridFootprint,
  getPlacementPreviewFootprintWorldSize
} = {}) {
  const modelScale = Number(
    session?.strawBedModelInstance?.solarStationFinalScale ||
    session?.strawBedModelInstance?.scale
  );

  if (Number.isFinite(modelScale) && modelScale > 0) {
    return modelScale * radiusMultiplier;
  }

  const fallbackSize = getPlacementPreviewFootprintWorldSize(
    preview,
    gridFootprint
  );
  return Math.max(fallbackSize[0], fallbackSize[1]) * radiusMultiplier;
}

export function buildSolarStationPreviewPowerRadiusGroundCells({
  session,
  preview,
  radiusMultiplier = 1,
  gridFootprint,
  markedTileLimit = 1200,
  getPlacementPreviewFootprintWorldSize
} = {}) {
  if (!preview?.snappedPosition) {
    return [];
  }

  return buildSolarStationPowerRadiusGroundCells({
    center: preview.snappedPosition,
    radius: getSolarStationPreviewPowerRadius({
      session,
      preview,
      radiusMultiplier,
      gridFootprint,
      getPlacementPreviewFootprintWorldSize
    }),
    gridConfig: preview.gridConfig,
    gridStep: preview.gridStep,
    idPrefix: "solar-station-preview-power-radius",
    markedTileLimit
  });
}

export function getSolarStationPowerPosition(session, storyState) {
  if (
    !storyState?.flags?.strawBedPlacedInBulbasaurHabitat ||
    !Array.isArray(session?.strawBed?.position)
  ) {
    return null;
  }

  return session.strawBed.position;
}

export function getSolarStationPowerRadius({
  session,
  radiusMultiplier = 1,
  previewFootprint = [1, 1],
  getPlacementCollisionSize = getDefaultPlacementCollisionSize
} = {}) {
  const modelScale = Number(
    session?.strawBedModelInstance?.solarStationFinalScale ||
    session?.strawBedModelInstance?.scale
  );

  if (Number.isFinite(modelScale) && modelScale > 0) {
    return modelScale * radiusMultiplier;
  }

  const fallbackSize = getPlacementCollisionSize(
    session?.strawBed,
    previewFootprint
  );
  return Math.max(fallbackSize[0], fallbackSize[1]) * radiusMultiplier;
}

export function buildPlacedSolarStationPowerRadiusGroundCells({
  session,
  storyState,
  radiusMultiplier = 1,
  previewFootprint = [1, 1],
  markedTileLimit = 1200,
  getPlacementCollisionSize = getDefaultPlacementCollisionSize
} = {}) {
  const powerPosition = getSolarStationPowerPosition(session, storyState);
  if (!powerPosition) {
    return [];
  }

  return buildSolarStationPowerRadiusGroundCells({
    center: powerPosition,
    radius: getSolarStationPowerRadius({
      session,
      radiusMultiplier,
      previewFootprint,
      getPlacementCollisionSize
    }),
    gridConfig: session?.buildGridConfig,
    gridStep: session?.buildGridConfig?.cellSize,
    idPrefix: "solar-station-placed-power-radius",
    markedTileLimit
  });
}

export function isInsideSolarStationPowerRadius({
  session,
  storyState,
  position,
  radiusMultiplier = 1,
  previewFootprint = [1, 1],
  getPlacementCollisionSize = getDefaultPlacementCollisionSize
} = {}) {
  const solarStationPosition = getSolarStationPowerPosition(session, storyState);
  if (!solarStationPosition || !Array.isArray(position)) {
    return false;
  }

  const distance = Math.hypot(
    position[0] - solarStationPosition[0],
    position[2] - solarStationPosition[2]
  );
  return distance <= getSolarStationPowerRadius({
    session,
    radiusMultiplier,
    previewFootprint,
    getPlacementCollisionSize
  });
}
