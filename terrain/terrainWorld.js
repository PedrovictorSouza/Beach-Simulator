const WORLD_LIMIT = 240;
const GROUND_TILE_INSTANCE_SCALE = 0.375;
const TERRAIN_DRAW_RADIUS = 96;
const BEACH_LAND_Z = 72;
const BEACH_WATER_Z = -76;
const BEACH_WET_OVERLAP = 6;
const RESTINGA_DEPTH = 30;
const RESTINGA_TREE_INSET = 6;
const RESTINGA_GROUND_TINT = [0.9, 1.08, 0.78];
const RESTINGA_GROUND_TINT_STRENGTH = 0.18;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCoastlineJitter(x) {
  return (
    Math.sin(x * 0.055 + 0.4) * 3.6 +
    Math.sin(x * 0.13 + 1.7) * 1.8
  );
}

function getBeachEdgesAtX(x) {
  const coastlineJitter = getCoastlineJitter(x);

  return {
    landEdgeZ: BEACH_LAND_Z + coastlineJitter,
    waterEdgeZ: BEACH_WATER_Z + coastlineJitter - BEACH_WET_OVERLAP
  };
}

function getRestingaBoundsAtX(x) {
  const { landEdgeZ } = getBeachEdgesAtX(x);

  return {
    startZ: landEdgeZ,
    endZ: Math.min(WORLD_LIMIT, landEdgeZ + RESTINGA_DEPTH)
  };
}

function isBeachSandCell(x, z) {
  const { landEdgeZ, waterEdgeZ } = getBeachEdgesAtX(x);

  return z >= waterEdgeZ && z <= landEdgeZ;
}

function isRestingaCell(x, z) {
  const { startZ, endZ } = getRestingaBoundsAtX(x);

  return z > startZ && z <= endZ;
}

export function getRestingaPalmTreeZ(x, laneProgress = 0.5) {
  const { startZ, endZ } = getRestingaBoundsAtX(x);
  const laneStartZ = startZ + RESTINGA_TREE_INSET;
  const laneEndZ = Math.max(laneStartZ, endZ - RESTINGA_TREE_INSET);
  const progress = clamp(Number(laneProgress) || 0, 0, 1);

  return Number((laneStartZ + (laneEndZ - laneStartZ) * progress).toFixed(4));
}

function buildTerrainInstances({ groundModel, camera }) {
  const tileFootprint = Math.max(groundModel.size[0], groundModel.size[2]);
  const tileSpan = tileFootprint * GROUND_TILE_INSTANCE_SCALE;
  const tileCountPerAxis = Math.max(1, Math.ceil((WORLD_LIMIT * 2) / tileSpan));
  const start = -WORLD_LIMIT + tileSpan * 0.5;
  const groundInstances = [];
  const restingaGroundInstances = [];
  const sandgroundInstances = [];

  for (let xIndex = 0; xIndex < tileCountPerAxis; xIndex += 1) {
    for (let zIndex = 0; zIndex < tileCountPerAxis; zIndex += 1) {
      const x = Number((start + xIndex * tileSpan).toFixed(4));
      const z = Number((start + zIndex * tileSpan).toFixed(4));

      if (!camera.isPlanarPointVisible(x, z, TERRAIN_DRAW_RADIUS)) {
        continue;
      }

      const instance = {
        offset: [x, 0, z],
        scale: GROUND_TILE_INSTANCE_SCALE,
        yaw: 0
      };

      if (isBeachSandCell(x, z)) {
        sandgroundInstances.push(instance);
      } else if (isRestingaCell(x, z)) {
        restingaGroundInstances.push({
          ...instance,
          tint: RESTINGA_GROUND_TINT,
          tintStrength: RESTINGA_GROUND_TINT_STRENGTH
        });
      } else {
        groundInstances.push(instance);
      }
    }
  }

  return { groundInstances, restingaGroundInstances, sandgroundInstances };
}

export function createTerrainSceneObjects({ terrainAssets, camera }) {
  const { groundInstances, restingaGroundInstances, sandgroundInstances } = buildTerrainInstances({
    groundModel: terrainAssets.groundModel,
    camera
  });

  return [
    {
      model: terrainAssets.groundModel,
      instances: groundInstances,
      brightness: 0.84
    },
    {
      model: terrainAssets.groundModel,
      instances: restingaGroundInstances,
      brightness: 0.92
    },
    {
      model: terrainAssets.sandgroundModel,
      instances: sandgroundInstances,
      brightness: 0.98
    }
  ];
}
