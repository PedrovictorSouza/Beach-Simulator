import { loadTerrainAssets } from "../terrain/terrainAssets.js";
import {
  createTerrainSceneObjects,
  getBeachSandPosition,
  getBeachSandZNearRestinga,
  getTerrainSurfaceY,
  getTerrainTileSpan
} from "../terrain/terrainWorld.js";
import { BEACH_ZONES, createBeachGrid } from "../terrain/beachGrid.js";
import { createNpcSceneObjects, loadNpcAssets } from "../npcs/npcWorld.js";
import { createNpcSystem } from "../npcs/npcSystem.js";
import { createSpawnManager } from "../spawn/spawnManager.js";
import {
  getSpawnableObjectDto,
  SPAWNABLE_OBJECT_TYPES,
  SPAWN_SOURCES
} from "../spawn/spawnableObjectDto.js";
import {
  createScenerySceneObjects,
  loadSceneryAsset,
  SCENERY_TYPES
} from "../scenery/sceneryWorld.js";
import { createWorldObjectPlaceholderSceneObjects } from "../objects/worldObjectWorld.js";

const KIOSK_POSITION_X = -48;
const KIOSK_RESTINGA_INSET = 18;
const BEACH_HOUSE_POSITION_X = 12;
const BEACH_HOUSE_RESTINGA_INSET = 36;
const BEACH_HOUSE_RESTINGA_TILE_OFFSET = 2;
const INITIAL_OBJECT_COUNT = 5;
const INITIAL_CLEANUP_TYPES = Object.freeze([
  SPAWNABLE_OBJECT_TYPES.BANANA,
  SPAWNABLE_OBJECT_TYPES.PAPER,
  SPAWNABLE_OBJECT_TYPES.CAN,
  SPAWNABLE_OBJECT_TYPES.BOTTLE,
  SPAWNABLE_OBJECT_TYPES.SYRINGE
]);
const INITIAL_COLLECTIBLE_TYPES = Object.freeze([
  SPAWNABLE_OBJECT_TYPES.MONEY,
  SPAWNABLE_OBJECT_TYPES.RING
]);

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function planInitialPopulation() {
  const types = [pickRandom(INITIAL_COLLECTIBLE_TYPES)];

  while (types.length < INITIAL_OBJECT_COUNT) {
    types.push(pickRandom(INITIAL_CLEANUP_TYPES));
  }

  return Object.freeze(types.map((type) => {
    const definition = getSpawnableObjectDto(type);

    return Object.freeze({
      type,
      source: SPAWN_SOURCES.SPAWN_MANAGER,
      zone: pickRandom(definition.spawnZones),
      placement: Object.freeze({
        xProgress: Math.random(),
        zProgress: Math.random()
      })
    });
  }));
}

function reserveScenery(beachGrid, sceneObjects, padding) {
  for (const sceneObject of sceneObjects) {
    const instance = sceneObject.instances[0];
    const cosine = Math.abs(Math.cos(instance.yaw));
    const sine = Math.abs(Math.sin(instance.yaw));
    const width = (
      sceneObject.model.size[0] * cosine + sceneObject.model.size[2] * sine
    ) * instance.scale;
    const depth = (
      sceneObject.model.size[0] * sine + sceneObject.model.size[2] * cosine
    ) * instance.scale;

    beachGrid.reserveWorldBounds({
      centerX: instance.offset[0],
      centerZ: instance.offset[2],
      width,
      depth,
      padding
    });
  }
}

export async function loadBeachWorld({ gl, camera, onStatus }) {
  const terrainAssets = await loadTerrainAssets({ gl, onStatus });
  const terrainSceneObjects = createTerrainSceneObjects({ terrainAssets, camera });
  const npcAssets = await loadNpcAssets({ gl, onStatus });
  const npcSystem = createNpcSystem();
  const spawnManager = createSpawnManager();
  const npcs = npcSystem.getSnapshot();
  const terrainSurfaceY = getTerrainSurfaceY(terrainAssets.groundModel);
  const terrainTileSpan = getTerrainTileSpan(terrainAssets.groundModel);
  const kioskAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.KIOSK,
    onStatus
  });
  const kioskSceneObjects = createScenerySceneObjects({
    sceneryAsset: kioskAsset,
    position: [
      KIOSK_POSITION_X,
      terrainSurfaceY,
      getBeachSandZNearRestinga(KIOSK_POSITION_X, KIOSK_RESTINGA_INSET)
    ]
  });
  const beachHouseAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.BEACH_HOUSE,
    onStatus
  });
  const beachHouseSceneObjects = createScenerySceneObjects({
    sceneryAsset: beachHouseAsset,
    position: [
      BEACH_HOUSE_POSITION_X,
      terrainSurfaceY,
      getBeachSandZNearRestinga(
        BEACH_HOUSE_POSITION_X,
        BEACH_HOUSE_RESTINGA_INSET -
          terrainTileSpan * BEACH_HOUSE_RESTINGA_TILE_OFFSET
      )
    ]
  });
  const beachGrid = createBeachGrid({ tileSize: terrainTileSpan });

  reserveScenery(
    beachGrid,
    [...kioskSceneObjects, ...beachHouseSceneObjects],
    terrainTileSpan
  );

  const resolveWorldObjectPosition = (request) => {
    const placement = request?.placement;
    const desiredPosition = Array.isArray(placement?.position) ?
      placement.position :
      getBeachSandPosition(placement?.xProgress, placement?.zProgress);
    const tile = beachGrid.claimNearestAvailableTile({
      x: desiredPosition[0],
      z: desiredPosition[1],
      zone: BEACH_ZONES.SAND
    });

    if (!tile) {
      throw new Error("Nao foi encontrada uma celula livre na areia.");
    }

    return [tile.centerX, tile.centerZ];
  };
  const worldObjectSceneObjects = await createWorldObjectPlaceholderSceneObjects({
    gl,
    requests: planInitialPopulation(),
    terrainSurfaceY,
    resolvePosition: resolveWorldObjectPosition
  });
  const npcSceneObjects = createNpcSceneObjects({
    npcAssets,
    npcs,
    terrainSurfaceY
  });

  return {
    sceneObjects: [
      ...terrainSceneObjects,
      ...kioskSceneObjects,
      ...worldObjectSceneObjects,
      ...npcSceneObjects
    ],
    terrainAssets,
    terrainSceneObjects,
    npcSceneObjects,
    npcSystem,
    spawnManager,
    worldObjectSceneObjects,
    beachGrid,
    beachHouseSceneObjects,
    terrainSurfaceY,
    resolveWorldObjectPosition,
    npcs
  };
}
