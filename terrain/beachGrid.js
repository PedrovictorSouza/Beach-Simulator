export const BEACH_ZONES = Object.freeze({
  SEA: "sea",
  SAND: "sand",
  RESTINGA: "restinga"
});

const BEACH_LAND_Z = 82;
const BEACH_WATER_Z = -58;
const BEACH_WET_OVERLAP = 6;
const BUILDING_ALLOWED_X_MIN = -24;
const BUILDING_ALLOWED_X_MAX = 24;
const BUILDING_ALLOWED_Z_MIN = 9;
const BUILDING_ALLOWED_Z_MAX = 11;
const BUILDING_RESERVED_X_MIN = -10;
const BUILDING_RESERVED_X_MAX = -6;
const SUN_SHADE_ALLOWED_X_MIN = -24;
const SUN_SHADE_ALLOWED_X_MAX = 24;
const SUN_SHADE_ALLOWED_Z_MIN = 4;
const SUN_SHADE_ALLOWED_Z_MAX = 6;
const DEFAULT_CHUNK_SIZE_IN_TILES = 8;

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} precisa ser um numero finito.`);
  }
}

function getCoastlineJitter(x) {
  return (
    Math.sin(x * 0.055 + 0.4) * 3.6 +
    Math.sin(x * 0.13 + 1.7) * 1.8
  );
}

export function getBeachEdgesAtX(x) {
  assertFiniteNumber(x, "x");

  const coastlineJitter = getCoastlineJitter(x);

  return Object.freeze({
    landEdgeZ: BEACH_LAND_Z + coastlineJitter,
    waterEdgeZ: BEACH_WATER_Z + coastlineJitter - BEACH_WET_OVERLAP
  });
}

export function getBeachZoneAt(x, z) {
  assertFiniteNumber(z, "z");

  const { landEdgeZ, waterEdgeZ } = getBeachEdgesAtX(x);

  if (z < waterEdgeZ) {
    return BEACH_ZONES.SEA;
  }

  if (z <= landEdgeZ) {
    return BEACH_ZONES.SAND;
  }

  return BEACH_ZONES.RESTINGA;
}

export function createBeachGrid({
  tileSize,
  chunkSizeInTiles = DEFAULT_CHUNK_SIZE_IN_TILES
}) {
  assertFiniteNumber(tileSize, "tileSize");

  if (tileSize <= 0) {
    throw new Error("tileSize precisa ser maior que zero.");
  }

  if (!Number.isSafeInteger(chunkSizeInTiles) || chunkSizeInTiles <= 0) {
    throw new Error("chunkSizeInTiles precisa ser um inteiro positivo.");
  }

  const occupiedTiles = new Map();
  const getTileKey = (xIndex, zIndex) => `${xIndex}:${zIndex}`;

  function isBuildableTile({ xIndex, zIndex }) {
    const centerX = Number((xIndex * tileSize).toFixed(4));
    const centerZ = Number((zIndex * tileSize).toFixed(4));
    const insideSelectedArea = (
      xIndex >= BUILDING_ALLOWED_X_MIN &&
      xIndex <= BUILDING_ALLOWED_X_MAX &&
      zIndex >= BUILDING_ALLOWED_Z_MIN &&
      zIndex <= BUILDING_ALLOWED_Z_MAX &&
      !(
        xIndex >= BUILDING_RESERVED_X_MIN &&
        xIndex <= BUILDING_RESERVED_X_MAX
      )
    );

    return insideSelectedArea && getBeachZoneAt(centerX, centerZ) === BEACH_ZONES.SAND;
  }

  function isSunShadeTile({ xIndex, zIndex }) {
    const centerX = Number((xIndex * tileSize).toFixed(4));
    const centerZ = Number((zIndex * tileSize).toFixed(4));

    return (
      xIndex >= SUN_SHADE_ALLOWED_X_MIN &&
      xIndex <= SUN_SHADE_ALLOWED_X_MAX &&
      zIndex >= SUN_SHADE_ALLOWED_Z_MIN &&
      zIndex <= SUN_SHADE_ALLOWED_Z_MAX &&
      getBeachZoneAt(centerX, centerZ) === BEACH_ZONES.SAND
    );
  }

  function getTileAtWorldPosition(x, z) {
    assertFiniteNumber(x, "x");
    assertFiniteNumber(z, "z");

    const xIndex = Math.floor((x + tileSize * 0.5) / tileSize);
    const zIndex = Math.floor((z + tileSize * 0.5) / tileSize);
    const centerX = xIndex * tileSize;
    const centerZ = zIndex * tileSize;

    return Object.freeze({
      xIndex,
      zIndex,
      centerX,
      centerZ,
      chunkX: Math.floor(xIndex / chunkSizeInTiles),
      chunkZ: Math.floor(zIndex / chunkSizeInTiles),
      zone: getBeachZoneAt(centerX, centerZ)
    });
  }

  function visitTilesInRange({
    startXIndex,
    endXIndex,
    startZIndex,
    endZIndex
  }, visitor) {
    if (typeof visitor !== "function") {
      throw new Error("visitor precisa ser uma funcao.");
    }

    const startChunkX = Math.floor(startXIndex / chunkSizeInTiles);
    const endChunkX = Math.floor(endXIndex / chunkSizeInTiles);
    const startChunkZ = Math.floor(startZIndex / chunkSizeInTiles);
    const endChunkZ = Math.floor(endZIndex / chunkSizeInTiles);

    for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
      const chunkStartX = Math.max(startXIndex, chunkX * chunkSizeInTiles);
      const chunkEndX = Math.min(endXIndex, (chunkX + 1) * chunkSizeInTiles - 1);

      for (let chunkZ = startChunkZ; chunkZ <= endChunkZ; chunkZ += 1) {
        const chunkStartZ = Math.max(startZIndex, chunkZ * chunkSizeInTiles);
        const chunkEndZ = Math.min(endZIndex, (chunkZ + 1) * chunkSizeInTiles - 1);

        for (let xIndex = chunkStartX; xIndex <= chunkEndX; xIndex += 1) {
          for (let zIndex = chunkStartZ; zIndex <= chunkEndZ; zIndex += 1) {
            const centerX = Number((xIndex * tileSize).toFixed(4));
            const centerZ = Number((zIndex * tileSize).toFixed(4));

            visitor({
              xIndex,
              zIndex,
              centerX,
              centerZ,
              chunkX,
              chunkZ,
              zone: getBeachZoneAt(centerX, centerZ)
            });
          }
        }
      }
    }
  }

  function reserveWorldBounds({
    centerX,
    centerZ,
    width,
    depth,
    padding = 0,
    reason = "reserved-area"
  }) {
    [centerX, centerZ, width, depth, padding].forEach((value) => (
      assertFiniteNumber(value, "reserva do grid")
    ));

    if (width <= 0 || depth <= 0 || padding < 0) {
      throw new Error("Reserva do grid precisa de dimensoes positivas.");
    }

    const halfWidth = width * 0.5 + padding + tileSize * 0.5;
    const halfDepth = depth * 0.5 + padding + tileSize * 0.5;
    const startXIndex = Math.ceil((centerX - halfWidth) / tileSize);
    const endXIndex = Math.floor((centerX + halfWidth) / tileSize);
    const startZIndex = Math.ceil((centerZ - halfDepth) / tileSize);
    const endZIndex = Math.floor((centerZ + halfDepth) / tileSize);

    for (let xIndex = startXIndex; xIndex <= endXIndex; xIndex += 1) {
      for (let zIndex = startZIndex; zIndex <= endZIndex; zIndex += 1) {
        occupiedTiles.set(getTileKey(xIndex, zIndex), reason);
      }
    }
  }

  function claimNearestAvailableTile({
    x,
    z,
    zone,
    maxRadiusInTiles = 64,
    reason = "claimed-tile"
  }) {
    assertFiniteNumber(x, "x");
    assertFiniteNumber(z, "z");

    if (!Object.values(BEACH_ZONES).includes(zone)) {
      throw new Error("Celula reivindicada precisa de uma zona valida.");
    }

    if (!Number.isSafeInteger(maxRadiusInTiles) || maxRadiusInTiles < 0) {
      throw new Error("Raio de busca do grid precisa ser um inteiro positivo.");
    }

    const origin = getTileAtWorldPosition(x, z);

    for (let radius = 0; radius <= maxRadiusInTiles; radius += 1) {
      for (let xOffset = -radius; xOffset <= radius; xOffset += 1) {
        for (let zOffset = -radius; zOffset <= radius; zOffset += 1) {
          if (Math.max(Math.abs(xOffset), Math.abs(zOffset)) !== radius) {
            continue;
          }

          const xIndex = origin.xIndex + xOffset;
          const zIndex = origin.zIndex + zOffset;
          const key = getTileKey(xIndex, zIndex);
          const centerX = Number((xIndex * tileSize).toFixed(4));
          const centerZ = Number((zIndex * tileSize).toFixed(4));

          if (occupiedTiles.has(key) || getBeachZoneAt(centerX, centerZ) !== zone) {
            continue;
          }

          occupiedTiles.set(key, reason);
          return Object.freeze({ xIndex, zIndex, centerX, centerZ, zone });
        }
      }
    }

    return null;
  }

  function isTileAvailable({ xIndex, zIndex, zone = BEACH_ZONES.SAND }) {
    if (!Number.isSafeInteger(xIndex) || !Number.isSafeInteger(zIndex)) {
      return false;
    }

    const centerX = Number((xIndex * tileSize).toFixed(4));
    const centerZ = Number((zIndex * tileSize).toFixed(4));

    return (
      !occupiedTiles.has(getTileKey(xIndex, zIndex)) &&
      getBeachZoneAt(centerX, centerZ) === zone
    );
  }

  function getTileDiagnostics({ xIndex, zIndex }) {
    if (!Number.isSafeInteger(xIndex) || !Number.isSafeInteger(zIndex)) {
      return null;
    }

    const centerX = Number((xIndex * tileSize).toFixed(4));
    const centerZ = Number((zIndex * tileSize).toFixed(4));
    const key = getTileKey(xIndex, zIndex);

    return Object.freeze({
      xIndex,
      zIndex,
      centerX,
      centerZ,
      zone: getBeachZoneAt(centerX, centerZ),
      buildableSand: isBuildableTile({ xIndex, zIndex }),
      sunShadePlacement: isSunShadeTile({ xIndex, zIndex }),
      occupied: occupiedTiles.has(key),
      occupancyReason: occupiedTiles.get(key) || null
    });
  }

  function isAreaAvailable({
    centerX,
    centerZ,
    width,
    depth,
    zone = BEACH_ZONES.SAND,
    buildableSandOnly = false
  }) {
    [centerX, centerZ, width, depth].forEach((value) => (
      assertFiniteNumber(value, "area do grid")
    ));

    if (width <= 0 || depth <= 0) {
      return false;
    }

    const halfWidth = width * 0.5 + tileSize * 0.5;
    const halfDepth = depth * 0.5 + tileSize * 0.5;
    const startXIndex = Math.ceil((centerX - halfWidth) / tileSize);
    const endXIndex = Math.floor((centerX + halfWidth) / tileSize);
    const startZIndex = Math.ceil((centerZ - halfDepth) / tileSize);
    const endZIndex = Math.floor((centerZ + halfDepth) / tileSize);

    for (let xIndex = startXIndex; xIndex <= endXIndex; xIndex += 1) {
      for (let zIndex = startZIndex; zIndex <= endZIndex; zIndex += 1) {
        if (
          !isTileAvailable({ xIndex, zIndex, zone }) ||
          (buildableSandOnly && !isBuildableTile({ xIndex, zIndex }))
        ) {
          return false;
        }
      }
    }

    return true;
  }

  function releaseWorldPosition(x, z) {
    const tile = getTileAtWorldPosition(x, z);

    occupiedTiles.delete(getTileKey(tile.xIndex, tile.zIndex));
  }

  return Object.freeze({
    tileSize,
    chunkSizeInTiles,
    getTileAtWorldPosition,
    getTileDiagnostics,
    isBuildableTile,
    isSunShadeTile,
    visitTilesInRange,
    reserveWorldBounds,
    claimNearestAvailableTile,
    isTileAvailable,
    isAreaAvailable,
    releaseWorldPosition
  });
}
