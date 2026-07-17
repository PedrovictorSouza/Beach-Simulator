export const BEACH_ZONES = Object.freeze({
  SEA: "sea",
  SAND: "sand",
  RESTINGA: "restinga"
});

const BEACH_LAND_Z = 82;
const BEACH_WATER_Z = -58;
const BEACH_WET_OVERLAP = 6;
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

  return Object.freeze({
    tileSize,
    chunkSizeInTiles,
    getTileAtWorldPosition,
    visitTilesInRange
  });
}
