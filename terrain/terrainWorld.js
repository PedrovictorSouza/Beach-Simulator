const WORLD_LIMIT = 144;
const GROUND_TILE_INSTANCE_SCALE = 0.375;
const TERRAIN_DRAW_RADIUS = 96;
const BERM_LAND_Z = 54;
const BERM_WATER_Z = 20;
const BERM_DRY_DEPTH = 30;
const BERM_WET_OVERLAP = 6;

function getBermCoastlineJitter(x) {
  return (
    Math.sin(x * 0.055 + 0.4) * 3.6 +
    Math.sin(x * 0.13 + 1.7) * 1.8
  );
}

function isSandBermCell(x, z) {
  const coastlineJitter = getBermCoastlineJitter(x);
  const bermLandEdge = BERM_LAND_Z + coastlineJitter + BERM_DRY_DEPTH;
  const bermWaterEdge = BERM_WATER_Z + coastlineJitter - BERM_WET_OVERLAP;

  return z >= bermWaterEdge && z <= bermLandEdge;
}

function buildTerrainInstances({ groundModel, camera }) {
  const tileFootprint = Math.max(groundModel.size[0], groundModel.size[2]);
  const tileSpan = tileFootprint * GROUND_TILE_INSTANCE_SCALE;
  const tileCountPerAxis = Math.max(1, Math.ceil((WORLD_LIMIT * 2) / tileSpan));
  const start = -WORLD_LIMIT + tileSpan * 0.5;
  const groundInstances = [];
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

      if (isSandBermCell(x, z)) {
        sandgroundInstances.push(instance);
      } else {
        groundInstances.push(instance);
      }
    }
  }

  return { groundInstances, sandgroundInstances };
}

export function createTerrainSceneObjects({ terrainAssets, camera }) {
  const { groundInstances, sandgroundInstances } = buildTerrainInstances({
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
      model: terrainAssets.sandgroundModel,
      instances: sandgroundInstances,
      brightness: 0.98
    }
  ];
}
