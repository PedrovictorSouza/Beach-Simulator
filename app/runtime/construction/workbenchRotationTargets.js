const DEFAULT_FOOTPRINTS = Object.freeze({
  houseBuilt: Object.freeze([1, 1]),
  houseKit: Object.freeze([1, 1]),
  solarStation: Object.freeze([1, 1]),
  trainHouse: Object.freeze([1, 1])
});

export function getRotatableWorkbenchPlacementCandidates({
  flags = {},
  footprints = DEFAULT_FOOTPRINTS,
  session = {},
  thermalCabinLabel = "Thermal Cabin"
} = {}) {
  const candidates = [];

  if (session.strawBed?.position && flags.strawBedPlacedInBulbasaurHabitat) {
    candidates.push({
      kind: "solarStation",
      label: "Solar Station",
      placement: session.strawBed,
      fallbackSize: footprints.solarStation,
      rotateSize: false
    });
  }

  if (session.campfire?.position && flags.campfireSpatOut) {
    candidates.push({
      kind: "trainHouse",
      label: thermalCabinLabel,
      placement: session.campfire,
      fallbackSize: footprints.trainHouse,
      rotateSize: true
    });
  }

  if (session.leafDen?.position && (flags.leafDenKitPlaced || flags.leafDenBuilt)) {
    const houseSize = flags.leafDenBuilt ?
      footprints.houseBuilt :
      footprints.houseKit;
    candidates.push({
      kind: "house",
      label: "House",
      placement: session.leafDen,
      fallbackSize: houseSize,
      sizeOverride: houseSize,
      rotateSize: true
    });
  }

  for (const playerHouse of session.playerHouses || []) {
    if (!Array.isArray(playerHouse?.position)) {
      continue;
    }

    candidates.push({
      kind: `playerHouse:${playerHouse.id}`,
      label: "House",
      placement: playerHouse,
      fallbackSize: footprints.houseBuilt,
      sizeOverride: footprints.houseBuilt,
      rotateSize: true
    });
  }

  return candidates;
}

export function getWorkbenchRotationTargetSize(target, {
  getPlacementCollisionSize = (placement, fallbackSize = [1, 1]) => placement?.size || fallbackSize
} = {}) {
  if (Array.isArray(target?.sizeOverride)) {
    return [...target.sizeOverride];
  }

  return getPlacementCollisionSize(target?.placement, target?.fallbackSize || [1, 1]);
}

export function getWorkbenchRotationTargetDistance(playerPosition, target, {
  getTargetSize = getWorkbenchRotationTargetSize
} = {}) {
  const position = target?.placement?.position;
  if (!Array.isArray(playerPosition) || !Array.isArray(position)) {
    return Number.POSITIVE_INFINITY;
  }

  const size = getTargetSize(target);
  const halfX = Math.max(0.01, Number(size[0]) || 1) * 0.5;
  const halfZ = Math.max(0.01, Number(size[1]) || 1) * 0.5;
  const dx = Math.max(0, Math.abs(playerPosition[0] - position[0]) - halfX);
  const dz = Math.max(0, Math.abs(playerPosition[2] - position[2]) - halfZ);
  return Math.hypot(dx, dz);
}

export function getWorkbenchRotationTriggerDistance({
  buildGridConfig = null,
  rotateDistance,
  triggerTileMargin
} = {}) {
  const cellSize = Number(buildGridConfig?.cellSize);
  const tileMargin = Number.isFinite(cellSize) && cellSize > 0 ?
    cellSize :
    triggerTileMargin;
  return rotateDistance + tileMargin;
}

export function getNearestRotatableWorkbenchPlacement({
  candidates = [],
  getTargetDistance = getWorkbenchRotationTargetDistance,
  playerPosition,
  triggerDistance = Number.POSITIVE_INFINITY
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  return candidates.reduce((nearest, candidate) => {
    const position = candidate.placement?.position;
    if (!Array.isArray(position)) {
      return nearest;
    }

    const distance = getTargetDistance(playerPosition, candidate);
    if (!Number.isFinite(distance) || distance > triggerDistance) {
      return nearest;
    }
    if (!nearest || distance < nearest.distance) {
      return { ...candidate, distance };
    }
    return nearest;
  }, null);
}
