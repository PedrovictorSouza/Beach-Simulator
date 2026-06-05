export function snapshotAvailableWoodDrops(woodDrops = []) {
  const snapshots = new Map();

  for (const woodDrop of woodDrops) {
    if (!woodDrop || woodDrop.collected) {
      continue;
    }

    snapshots.set(woodDrop, {
      position: [...woodDrop.position],
      size: [...woodDrop.size],
      uvRect: woodDrop.uvRect || [0, 0, 1, 1]
    });
  }

  return snapshots;
}

export function snapshotCollectibleSources(collectibles = [], predicate = () => true) {
  const snapshots = new Map();

  for (const collectible of collectibles || []) {
    if (!collectible || !predicate(collectible)) {
      continue;
    }

    snapshots.set(collectible, {
      active: collectible.active !== false,
      collected: Boolean(collectible.collected),
      cooldown: Number(collectible.cooldown || 0),
      position: Array.isArray(collectible.position) ? [...collectible.position] : null,
      yield: Math.max(1, Number(collectible.yield || 1))
    });
  }

  return snapshots;
}

export function getNewlyCollectedDropPositions(dropSnapshots) {
  const positions = [];

  for (const [drop, snapshot] of dropSnapshots) {
    if (!snapshot.collected && drop.collected && Array.isArray(snapshot.position)) {
      positions.push(snapshot.position);
    }
  }

  return positions;
}

export function getNewlyCollectedResourcePositions(resourceSnapshots) {
  const positions = [];

  for (const [resourceNode, snapshot] of resourceSnapshots) {
    if (
      snapshot.active &&
      resourceNode.active === false &&
      Number(resourceNode.cooldown || 0) > snapshot.cooldown &&
      Array.isArray(snapshot.position)
    ) {
      for (let copyIndex = 0; copyIndex < snapshot.yield; copyIndex += 1) {
        positions.push(snapshot.position);
      }
    }
  }

  return positions;
}
