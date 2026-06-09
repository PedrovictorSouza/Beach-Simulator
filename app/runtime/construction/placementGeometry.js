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
