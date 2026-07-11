const WORLD_LIMIT = 144;
const GROUND_TILE_INSTANCE_SCALE = 0.375;
const TERRAIN_DRAW_RADIUS = 96;

function hashCell(x, z) {
  const value = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function isIceTerrainCell(x, z) {
  const distanceFromCenter = Math.hypot(x, z);

  if (distanceFromCenter < 34) {
    return false;
  }

  return hashCell(x, z) < 0.72;
}

function buildTerrainInstances({ groundModel, camera }) {
  const tileFootprint = Math.max(groundModel.size[0], groundModel.size[2]);
  const tileSpan = tileFootprint * GROUND_TILE_INSTANCE_SCALE;
  const tileCountPerAxis = Math.max(1, Math.ceil((WORLD_LIMIT * 2) / tileSpan));
  const start = -WORLD_LIMIT + tileSpan * 0.5;
  const groundInstances = [];
  const icegroundInstances = [];

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

      if (isIceTerrainCell(x, z)) {
        icegroundInstances.push(instance);
      } else {
        groundInstances.push(instance);
      }
    }
  }

  return { groundInstances, icegroundInstances };
}

export function createTerrainSceneObjects({ terrainAssets, camera }) {
  const { groundInstances, icegroundInstances } = buildTerrainInstances({
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
      model: terrainAssets.icegroundModel,
      instances: icegroundInstances,
      brightness: 0.98
    }
  ];
}
