export function findNearbyFreeBlockTarget({
  playerPosition = null,
  freeBlockInstances = [],
  maxDistance = 1.35
} = {}) {
  if (!Array.isArray(playerPosition) || !Array.isArray(freeBlockInstances)) {
    return null;
  }

  let nearest = null;
  let nearestDistance = Infinity;
  for (const instance of freeBlockInstances) {
    if (instance?.active === false || !Array.isArray(instance?.offset) || !instance.freeBlockCell) {
      continue;
    }

    const distance = Math.hypot(
      Number(playerPosition[0] || 0) - Number(instance.offset[0] || 0),
      Number(playerPosition[2] || 0) - Number(instance.offset[2] || 0)
    );
    const layer = Math.max(0, Math.trunc(Number(instance.freeBlockCell?.layer || 0)));
    const nearestLayer = Math.max(0, Math.trunc(Number(nearest?.freeBlockCell?.layer || 0)));
    if (
      distance < maxDistance &&
      (
        distance < nearestDistance ||
        (Math.abs(distance - nearestDistance) < 0.001 && layer > nearestLayer)
      )
    ) {
      nearest = instance;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function getNextFreeBlockWoodDropId(woodDrops = []) {
  let nextId = 1;
  for (const drop of woodDrops || []) {
    const match = String(drop?.id || "").match(/^wood-(\d+)$/u);
    if (match) {
      nextId = Math.max(nextId, Number(match[1]) + 1);
    }
  }
  return nextId;
}

export function spawnFreeBlockRemovalDrops({
  result = null,
  target = null,
  woodDrops = [],
  dropSize = [0.78, 0.78],
  pickupRadius = 0.64,
  spread = 0.22
} = {}) {
  const materialCost = result?.materialCost;
  const quantity = Math.max(0, Math.trunc(Number(materialCost?.quantity || 0)));
  if (
    !quantity ||
    materialCost?.itemId !== "wood" ||
    !Array.isArray(target?.offset) ||
    !Array.isArray(woodDrops)
  ) {
    return 0;
  }

  let nextId = getNextFreeBlockWoodDropId(woodDrops);
  for (let index = 0; index < quantity; index += 1) {
    const angle = quantity > 1 ? (index / quantity) * Math.PI * 2 : 0;
    const dropSpread = quantity > 1 ? spread : 0;
    woodDrops.push({
      id: `wood-${nextId++}`,
      itemId: materialCost.itemId,
      position: [
        Number(target.offset[0] || 0) + Math.cos(angle) * dropSpread,
        0.02,
        Number(target.offset[2] || 0) + Math.sin(angle) * dropSpread
      ],
      size: [...dropSize],
      uvRect: [0, 0, 1, 1],
      pickupRadius,
      collected: false
    });
  }

  return quantity;
}
