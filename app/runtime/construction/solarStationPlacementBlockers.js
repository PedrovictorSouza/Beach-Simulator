function getTerrainColliderPlacementRect(collider, getPlacementRect) {
  if (!collider?.blocksPlayer || !Array.isArray(collider.position)) {
    return null;
  }

  const padding = Number(collider.padding || 0);
  const width = Math.max(0.01, Number(collider.size?.[0]) || 1) + padding * 2;
  const depth = Math.max(0.01, Number(collider.size?.[2]) || 1) + padding * 2;
  return getPlacementRect(collider.position, [width, depth]);
}

function doesPlacementOverlapTerrainCollider({
  placementRect,
  collider,
  getPlacementRect,
  doPlacementRectsOverlap
}) {
  const colliderRect = getTerrainColliderPlacementRect(collider, getPlacementRect);
  return colliderRect ? doPlacementRectsOverlap(placementRect, colliderRect, 0) : false;
}

export function getSolarStationPlacementBlockers({
  session,
  storyState,
  footprints,
  createPlayerConstructionPlacementBlockers = () => [],
  getWorldObjectPlacementBlockers = () => [],
  getPlacementCollisionSize,
  challengeBoulderFallbackSize = [1.82, 1.42]
} = {}) {
  const blockers = [];
  const flags = storyState?.flags || {};

  blockers.push(...createPlayerConstructionPlacementBlockers({
    session,
    storyState,
    footprints
  }));
  blockers.push(...getWorldObjectPlacementBlockers(session));

  if (session?.logChair?.position && flags.logChairPlaced) {
    blockers.push({
      position: session.logChair.position,
      size: getPlacementCollisionSize(session.logChair)
    });
  }

  if (session?.dittoFlag?.position && flags.dittoFlagPlacedOnHouse) {
    blockers.push({
      position: session.dittoFlag.position,
      size: getPlacementCollisionSize(session.dittoFlag)
    });
  }

  if (session?.challengeBoulder?.position && flags.boulderChallengeAvailable) {
    blockers.push({
      position: session.challengeBoulder.position,
      size: getPlacementCollisionSize(session.challengeBoulder, challengeBoulderFallbackSize)
    });
  }

  if (flags.leafDenInteriorEntered) {
    for (const furniture of session?.leafDenFurniture || []) {
      if (!Array.isArray(furniture?.position)) {
        continue;
      }

      blockers.push({
        position: furniture.position,
        size: getPlacementCollisionSize(furniture)
      });
    }
  }

  return blockers;
}

export function isSolarStationPlacementBlocked({
  session,
  storyState,
  placementRect,
  getSolarStationPlacementBlockers = () => [],
  getPlacementRect,
  doPlacementRectsOverlap
} = {}) {
  const hasObjectCollision = getSolarStationPlacementBlockers(session, storyState)
    .some((blocker) => {
      return doPlacementRectsOverlap(
        placementRect,
        getPlacementRect(blocker.position, blocker.size)
      );
    });

  if (hasObjectCollision) {
    return true;
  }

  return (session?.elevatedTerrainColliders || [])
    .some((collider) => {
      return doesPlacementOverlapTerrainCollider({
        placementRect,
        collider,
        getPlacementRect,
        doPlacementRectsOverlap
      });
    });
}

export function createSolarStationPlacementBlockerRuntime({
  session = null,
  getStoryState = () => ({}),
  footprints,
  createPlayerConstructionPlacementBlockers = () => [],
  getWorldObjectPlacementBlockers = () => [],
  getPlacementCollisionSize,
  getPlacementRect,
  doPlacementRectsOverlap
} = {}) {
  function getBlockers() {
    return getSolarStationPlacementBlockers({
      session,
      storyState: getStoryState(),
      footprints,
      createPlayerConstructionPlacementBlockers,
      getWorldObjectPlacementBlockers: () => getWorldObjectPlacementBlockers(),
      getPlacementCollisionSize
    });
  }

  function isBlocked(placementRect) {
    return isSolarStationPlacementBlocked({
      session,
      storyState: getStoryState(),
      placementRect,
      getSolarStationPlacementBlockers: () => getBlockers(),
      getPlacementRect,
      doPlacementRectsOverlap
    });
  }

  return {
    getBlockers,
    isBlocked
  };
}
