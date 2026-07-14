const GROUND_TILE_INSTANCE_SCALE = 1.6;
const TERRAIN_BASE_CAMERA_DISTANCE = 150;
const TERRAIN_WINDOW_BASE_HALF_WIDTH = 152;
const TERRAIN_WINDOW_BASE_HALF_DEPTH = 112;
const TERRAIN_WINDOW_TILE_MARGIN = 3;
const BEACH_LAND_Z = 82;
const BEACH_WATER_Z = -58;
const BEACH_WET_OVERLAP = 6;
const RESTINGA_DEPTH = 58;
const RESTINGA_TREE_INSET = 6;
const RESTINGA_GROUND_TINT = [0.72, 1.18, 0.48];
const RESTINGA_GROUND_TINT_STRENGTH = 0.34;
const PALM_TREE_MODEL_FACE_YAW_OFFSET = 0;
const RESTINGA_PALM_TREE_SPACING = 36;
const RESTINGA_PALM_TREE_LANES = Object.freeze([
  Object.freeze({ xOffset: 0, start: 0.12, spread: 0.18 }),
  Object.freeze({ xOffset: 18, start: 0.58, spread: 0.24 })
]);
const terrainSceneViewKeys = new WeakMap();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readCameraPlanarTarget(camera) {
  const target = camera.getTarget?.() || [0, 0, 0];

  return {
    x: Number(target[0]) || 0,
    z: Number(target[2]) || 0
  };
}

function getTerrainWindowScale(camera) {
  const distance = Number(camera.getDistance?.()) || TERRAIN_BASE_CAMERA_DISTANCE;

  return clamp(distance / TERRAIN_BASE_CAMERA_DISTANCE, 0.86, 1.7);
}

function getTerrainTileRange({ groundModel, camera }) {
  const tileFootprint = Math.max(groundModel.size[0], groundModel.size[2]);
  const tileSpan = tileFootprint * GROUND_TILE_INSTANCE_SCALE;
  const target = readCameraPlanarTarget(camera);
  const windowScale = getTerrainWindowScale(camera);
  const halfWidth = TERRAIN_WINDOW_BASE_HALF_WIDTH * windowScale;
  const halfDepth = TERRAIN_WINDOW_BASE_HALF_DEPTH * windowScale;
  const startXIndex = Math.floor((target.x - halfWidth) / tileSpan) - TERRAIN_WINDOW_TILE_MARGIN;
  const endXIndex = Math.ceil((target.x + halfWidth) / tileSpan) + TERRAIN_WINDOW_TILE_MARGIN;
  const startZIndex = Math.floor((target.z - halfDepth) / tileSpan) - TERRAIN_WINDOW_TILE_MARGIN;
  const endZIndex = Math.ceil((target.z + halfDepth) / tileSpan) + TERRAIN_WINDOW_TILE_MARGIN;

  return {
    tileSpan,
    startXIndex,
    endXIndex,
    startZIndex,
    endZIndex,
    key: [
      startXIndex,
      endXIndex,
      startZIndex,
      endZIndex,
      tileSpan.toFixed(4)
    ].join(":")
  };
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

export function getBeachSandZNearRestinga(x, inset = 16) {
  const { landEdgeZ, waterEdgeZ } = getBeachEdgesAtX(x);

  return Number(clamp(landEdgeZ - Math.max(0, inset), waterEdgeZ, landEdgeZ).toFixed(4));
}

function getRestingaBoundsAtX(x) {
  const { landEdgeZ } = getBeachEdgesAtX(x);

  return {
    startZ: landEdgeZ,
    endZ: landEdgeZ + RESTINGA_DEPTH
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

function getRestingaPalmTreeZ(x, laneProgress = 0.5) {
  const { startZ, endZ } = getRestingaBoundsAtX(x);
  const laneStartZ = startZ + RESTINGA_TREE_INSET;
  const laneEndZ = Math.max(laneStartZ, endZ - RESTINGA_TREE_INSET);
  const progress = clamp(Number(laneProgress) || 0, 0, 1);

  return Number((laneStartZ + (laneEndZ - laneStartZ) * progress).toFixed(4));
}

function getDeterministicUnit(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;

  return value - Math.floor(value);
}

function buildRestingaPalmTreeInstances({ tileRange, terrainSurfaceY }) {
  const minX = tileRange.startXIndex * tileRange.tileSpan;
  const maxX = tileRange.endXIndex * tileRange.tileSpan;
  const startColumn = Math.floor(minX / RESTINGA_PALM_TREE_SPACING) - 1;
  const endColumn = Math.ceil(maxX / RESTINGA_PALM_TREE_SPACING) + 1;
  const instances = [];

  for (let column = startColumn; column <= endColumn; column += 1) {
    for (let laneIndex = 0; laneIndex < RESTINGA_PALM_TREE_LANES.length; laneIndex += 1) {
      const lane = RESTINGA_PALM_TREE_LANES[laneIndex];
      const seed = column * 11 + laneIndex * 101;
      const xJitter = (getDeterministicUnit(seed) - 0.5) * 9;
      const x = Number((column * RESTINGA_PALM_TREE_SPACING + lane.xOffset + xJitter).toFixed(4));
      const laneProgress = lane.start + getDeterministicUnit(seed + 1) * lane.spread;

      instances.push({
        id: `palm-tree-${column}-${laneIndex}`,
        offset: [x, terrainSurfaceY, getRestingaPalmTreeZ(x, laneProgress)],
        scale: 6.8 + getDeterministicUnit(seed + 2) * 1.6,
        yaw: PALM_TREE_MODEL_FACE_YAW_OFFSET + (getDeterministicUnit(seed + 3) - 0.5) * 0.9
      });
    }
  }

  return instances;
}

function buildTerrainInstances({ tileRange }) {
  const {
    tileSpan,
    startXIndex,
    endXIndex,
    startZIndex,
    endZIndex
  } = tileRange;
  const groundInstances = [];
  const restingaGroundInstances = [];
  const sandgroundInstances = [];

  for (let xIndex = startXIndex; xIndex <= endXIndex; xIndex += 1) {
    for (let zIndex = startZIndex; zIndex <= endZIndex; zIndex += 1) {
      const x = Number((xIndex * tileSpan).toFixed(4));
      const z = Number((zIndex * tileSpan).toFixed(4));

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

export function getTerrainSurfaceY(groundModel) {
  return groundModel.size[1] * GROUND_TILE_INSTANCE_SCALE;
}

export function createTerrainSceneObjects({ terrainAssets, camera }) {
  const terrainSceneObjects = [
    {
      terrainLayer: "ground",
      model: terrainAssets.groundModel,
      instances: [],
      brightness: 0.84
    },
    {
      terrainLayer: "restinga",
      model: terrainAssets.groundModel,
      instances: [],
      brightness: 1.02
    },
    {
      terrainLayer: "sand",
      model: terrainAssets.sandgroundModel,
      instances: [],
      brightness: 0.98
    },
    {
      terrainObject: "palm-tree",
      model: terrainAssets.palmTreeModel,
      instances: [],
      brightness: 1.05
    }
  ];

  updateTerrainSceneObjects({
    sceneObjects: terrainSceneObjects,
    groundModel: terrainAssets.groundModel,
    camera
  });

  return terrainSceneObjects;
}

export function updateTerrainSceneObjects({ sceneObjects, groundModel, camera }) {
  const tileRange = getTerrainTileRange({ groundModel, camera });

  if (terrainSceneViewKeys.get(sceneObjects) === tileRange.key) {
    return;
  }

  const {
    groundInstances,
    restingaGroundInstances,
    sandgroundInstances
  } = buildTerrainInstances({ tileRange });
  const palmTreeInstances = buildRestingaPalmTreeInstances({
    tileRange,
    terrainSurfaceY: getTerrainSurfaceY(groundModel)
  });

  for (const sceneObject of sceneObjects) {
    if (sceneObject.terrainLayer === "ground") {
      sceneObject.instances = groundInstances;
    } else if (sceneObject.terrainLayer === "restinga") {
      sceneObject.instances = restingaGroundInstances;
    } else if (sceneObject.terrainLayer === "sand") {
      sceneObject.instances = sandgroundInstances;
    } else if (sceneObject.terrainObject === "palm-tree") {
      sceneObject.instances = palmTreeInstances;
    }
  }

  terrainSceneViewKeys.set(sceneObjects, tileRange.key);
}
