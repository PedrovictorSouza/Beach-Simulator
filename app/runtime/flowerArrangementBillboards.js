const FLOWER_ARRANGEMENT_OFFSETS = Object.freeze([
  [-0.34, -0.24, 0.82],
  [-0.16, 0.08, 0.66],
  [-0.06, -0.34, 0.58],
  [0.12, -0.08, 0.9],
  [0.24, 0.22, 0.72],
  [0.38, -0.18, 0.64],
  [0.02, 0.3, 0.78]
]);
const FLOWER_PLAYER_REACT_RADIUS = 1.26;
const FLOWER_PLAYER_REACT_OFFSET = 0.34;
const FLOWER_PLAYER_REACT_SCALE = 0.34;
const FLOWER_AMBIENT_WOBBLE = 0.055;

function getStableHash(seed) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getFlowerArrangementBillboards({
  groundFlowerPatch,
  texture,
  playerPosition,
  revivalScale,
  now,
  target = []
}) {
  const billboards = Array.isArray(target) ? target : [];

  if (!groundFlowerPatch?.position || !texture) {
    return billboards;
  }

  const [patchX, patchY, patchZ] = groundFlowerPatch.position;
  const seedHash = Number.isFinite(groundFlowerPatch.flowerArrangementSeedHash) ?
    groundFlowerPatch.flowerArrangementSeedHash :
    getStableHash(`${groundFlowerPatch.cellId || ""}:${groundFlowerPatch.id || ""}`);
  groundFlowerPatch.flowerArrangementSeedHash = seedHash;
  if (
    !Array.isArray(groundFlowerPatch.flowerArrangementJitters) ||
    groundFlowerPatch.flowerArrangementJitters.length !== FLOWER_ARRANGEMENT_OFFSETS.length
  ) {
    groundFlowerPatch.flowerArrangementJitters = FLOWER_ARRANGEMENT_OFFSETS.map((_, index) => {
      const jitterHash = getStableHash(`${seedHash}:${index}`);
      return {
        jitterX: (((jitterHash % 11) - 5) / 5) * 0.045,
        jitterZ: ((((jitterHash >> 4) % 11) - 5) / 5) * 0.045,
        phase: (seedHash % 97) * 0.09 + index * 1.47
      };
    });
  }

  const playerDeltaX = Array.isArray(playerPosition) ? patchX - playerPosition[0] : 0;
  const playerDeltaZ = Array.isArray(playerPosition) ? patchZ - playerPosition[2] : 0;
  const playerDistance = Array.isArray(playerPosition) ?
    Math.hypot(playerDeltaX, playerDeltaZ) :
    Infinity;
  const playerDirectionX = playerDistance > 0.001 ? playerDeltaX / playerDistance : 0;
  const playerDirectionZ = playerDistance > 0.001 ? playerDeltaZ / playerDistance : 1;
  const playerReact = Math.max(
    0,
    1 - playerDistance / FLOWER_PLAYER_REACT_RADIUS
  );
  const playerReactStrength = playerReact * playerReact;
  const baseSizeX = Number(groundFlowerPatch.size?.[0]) || 1;
  const baseSizeY = Number(groundFlowerPatch.size?.[1]) || baseSizeX;

  for (let index = 0; index < FLOWER_ARRANGEMENT_OFFSETS.length; index += 1) {
    const [offsetX, offsetZ, scale] = FLOWER_ARRANGEMENT_OFFSETS[index];
    const jitter = groundFlowerPatch.flowerArrangementJitters[index];
    const wobble = Math.sin(now * 0.0042 + jitter.phase) * FLOWER_AMBIENT_WOBBLE;
    const scatter = FLOWER_PLAYER_REACT_OFFSET * playerReactStrength * (0.68 + scale * 0.28);
    const lift = Math.sin(playerReactStrength * Math.PI) * 0.08;
    const arrangementScale = scale * revivalScale * (1 + FLOWER_PLAYER_REACT_SCALE * playerReactStrength);

    billboards.push({
      texture,
      position: [
        patchX + offsetX + jitter.jitterX + playerDirectionX * scatter,
        patchY + lift + index * 0.002,
        patchZ + offsetZ + jitter.jitterZ + playerDirectionZ * scatter
      ],
      size: [baseSizeX * arrangementScale, baseSizeY * arrangementScale],
      rotation: wobble + playerReactStrength * 0.26 * (index % 2 === 0 ? 1 : -1)
    });
  }

  return billboards;
}
