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
import { createCloudWorld } from "../objects/cloud/cloudWorld.js";
import { createTreasureChestWorld } from "../objects/treasure-chest/treasureChestWorld.js";

const KIOSK_POSITION_X = -48;
const KIOSK_RESTINGA_INSET = 18;
const INITIAL_CLEANUP_COUNT = 5;
const INITIAL_CLEANUP_MIN_HORIZONTAL_PROGRESS = 0.12;
const INITIAL_CLEANUP_MAX_HORIZONTAL_PROGRESS = 0.88;
const INITIAL_CLEANUP_MIN_DEPTH_PROGRESS = 0.42;
const INITIAL_CLEANUP_MAX_DEPTH_PROGRESS = 0.55;
const INITIAL_VALUABLE_REWARD_IN_CENTS = 500;
const INITIAL_VALUABLE_TYPES = Object.freeze([
  SPAWNABLE_OBJECT_TYPES.MONEY,
  SPAWNABLE_OBJECT_TYPES.RING
]);
const INITIAL_CLEANUP_TYPES = Object.freeze([
  SPAWNABLE_OBJECT_TYPES.BANANA,
  SPAWNABLE_OBJECT_TYPES.PAPER,
  SPAWNABLE_OBJECT_TYPES.CAN,
  SPAWNABLE_OBJECT_TYPES.BOTTLE,
  SPAWNABLE_OBJECT_TYPES.SYRINGE
]);
function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function planInitialPopulation() {
  const initialValuableType = pickRandom(INITIAL_VALUABLE_TYPES);
  const types = [initialValuableType];

  while (types.length < INITIAL_CLEANUP_COUNT) {
    types.push(pickRandom(INITIAL_CLEANUP_TYPES));
  }

  return Object.freeze(types.map((type, index) => {
    const definition = getSpawnableObjectDto(type);

    return Object.freeze({
      type,
      source: SPAWN_SOURCES.SPAWN_MANAGER,
      collectionRewardInCents: index === 0 && type === initialValuableType ?
        INITIAL_VALUABLE_REWARD_IN_CENTS :
        0,
      zone: pickRandom(definition.spawnZones),
      placement: Object.freeze({
        xProgress: (
          INITIAL_CLEANUP_MIN_HORIZONTAL_PROGRESS +
          Math.random() * (
            INITIAL_CLEANUP_MAX_HORIZONTAL_PROGRESS -
            INITIAL_CLEANUP_MIN_HORIZONTAL_PROGRESS
          )
        ),
        zProgress: (
          INITIAL_CLEANUP_MIN_DEPTH_PROGRESS +
          Math.random() * (
            INITIAL_CLEANUP_MAX_DEPTH_PROGRESS -
            INITIAL_CLEANUP_MIN_DEPTH_PROGRESS
          )
        )
      })
    });
  }));
}

function getSceneryBounds(sceneObject) {
  const instance = sceneObject.instances[0];
  const cosine = Math.abs(Math.cos(instance.yaw));
  const sine = Math.abs(Math.sin(instance.yaw));
  const width = (
    sceneObject.model.size[0] * cosine + sceneObject.model.size[2] * sine
  ) * instance.scale;
  const depth = (
    sceneObject.model.size[0] * sine + sceneObject.model.size[2] * cosine
  ) * instance.scale;

  return {
    centerX: instance.offset[0],
    centerZ: instance.offset[2],
    width,
    depth,
    reason: sceneObject.sceneryType || sceneObject.worldObject || "scenery"
  };
}

export function reserveScenery(beachGrid, sceneObjects, padding) {
  for (const sceneObject of sceneObjects) {
    const bounds = getSceneryBounds(sceneObject);

    beachGrid.reserveWorldBounds({
      ...bounds,
      padding
    });
  }
}

export function protectScenery(beachGrid, sceneObjects, padding) {
  for (const sceneObject of sceneObjects) {
    beachGrid.protectWorldBounds({
      ...getSceneryBounds(sceneObject),
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
  const beverageStoreAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.BEVERAGE_STORE,
    onStatus
  });
  const wifiSpotAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.WIFI_SPOT,
    onStatus
  });
  const sunShadeAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.SUN_SHADE,
    onStatus
  });
  const trashCansAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.TRASH_CANS,
    onStatus
  });
  const volleyballCourtAsset = await loadSceneryAsset({
    gl,
    type: SCENERY_TYPES.VOLLEYBALL_COURT,
    onStatus
  });
  const beachGrid = createBeachGrid({ tileSize: terrainTileSpan });

  reserveScenery(
    beachGrid,
    kioskSceneObjects,
    0
  );
  protectScenery(beachGrid, kioskSceneObjects, 4);

  const resolveWorldObjectPosition = (request) => {
    const placement = request?.placement;
    const desiredPosition = Array.isArray(placement?.position) ?
      placement.position :
      getBeachSandPosition(placement?.xProgress, placement?.zProgress);
    const tile = beachGrid.claimNearestAvailableTile({
      x: desiredPosition[0],
      z: desiredPosition[1],
      zone: BEACH_ZONES.SAND,
      reason: `world-object:${request.id || request.type}`
    });

    if (!tile) {
      throw new Error("Nao foi encontrada uma celula livre na areia.");
    }

    return [tile.centerX, tile.centerZ];
  };
  const spawnableWorldObjectSceneObjects = await createWorldObjectPlaceholderSceneObjects({
    gl,
    requests: planInitialPopulation(),
    terrainSurfaceY,
    resolvePosition: resolveWorldObjectPosition
  });
  const treasureChestWorld = await createTreasureChestWorld({
    gl,
    terrainSurfaceY
  });
  const worldObjectSceneObjects = [
    ...spawnableWorldObjectSceneObjects,
    treasureChestWorld.sceneObject
  ];
  const npcSceneObjects = createNpcSceneObjects({
    npcAssets,
    npcs,
    terrainSurfaceY
  });
  const cloudWorld = await createCloudWorld({ gl, onStatus });

  return {
    sceneObjects: [
      ...terrainSceneObjects,
      ...kioskSceneObjects,
      ...worldObjectSceneObjects,
      ...npcSceneObjects,
      cloudWorld.sceneObject
    ],
    terrainAssets,
    terrainSceneObjects,
    npcSceneObjects,
    npcSystem,
    spawnManager,
    worldObjectSceneObjects,
    beachGrid,
    beachHouseAsset,
    beachHouseSceneObjects: [],
    beverageStoreAsset,
    wifiSpotAsset,
    sunShadeAsset,
    trashCansAsset,
    volleyballCourtAsset,
    terrainSurfaceY,
    resolveWorldObjectPosition,
    cloudWorld,
    treasureChestWorld,
    npcs
  };
}
