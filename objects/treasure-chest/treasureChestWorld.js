import { getBeachEdgesAtX } from "../../terrain/beachGrid.js";
import { loadWorldSpriteModel } from "../worldObjectWorld.js";

export const TREASURE_CHEST_OBJECT_TYPE = "treasure-chest";

const TREASURE_CHEST_PLACEHOLDER_URL = new URL(
  "./treasure-chest-placeholder.svg",
  import.meta.url
).href;
const TREASURE_CHEST_MODEL_FACE_YAW_OFFSET = 0;
const TREASURE_CHEST_TARGET_X = 18;
const TREASURE_CHEST_SEA_TRAVEL_DISTANCE = 46;
const TREASURE_CHEST_SHORE_INSET = 8;
const TREASURE_CHEST_WATERLINE_Y_OFFSET = -3.25;
const TREASURE_CHEST_ARRIVAL_SECONDS = 3.2;
const TREASURE_CHEST_DEPARTURE_SECONDS = 2.2;
const TREASURE_CHEST_BASE_SCALE = 1.55;
const TREASURE_CHEST_PULSE_SECONDS = 0.16;
const TREASURE_CHEST_PULSE_SCALE = 1.18;

function smoothStep(progress) {
  const clamped = Math.min(1, Math.max(0, progress));

  return clamped * clamped * (3 - 2 * clamped);
}

function interpolate(start, end, progress) {
  return start + (end - start) * smoothStep(progress);
}

export async function createTreasureChestWorld({
  gl,
  terrainSurfaceY
} = {}) {
  if (!Number.isFinite(terrainSurfaceY)) {
    throw new Error("Tesouro precisa da altura do terreno.");
  }

  const model = await loadWorldSpriteModel({
    gl,
    url: TREASURE_CHEST_PLACEHOLDER_URL,
    maxSpriteSize: 24
  });
  const { waterEdgeZ } = getBeachEdgesAtX(TREASURE_CHEST_TARGET_X);
  const targetZ = waterEdgeZ + TREASURE_CHEST_SHORE_INSET;
  const startZ = waterEdgeZ - TREASURE_CHEST_SEA_TRAVEL_DISTANCE;
  const height = terrainSurfaceY + TREASURE_CHEST_WATERLINE_Y_OFFSET;
  const sceneObject = {
    worldObject: TREASURE_CHEST_OBJECT_TYPE,
    spawnableType: TREASURE_CHEST_OBJECT_TYPE,
    screenSpaceSprite: true,
    placeholder: true,
    model,
    instances: [],
    brightness: 1.12
  };
  let phase = "hidden";
  let elapsedSeconds = 0;
  let pulseSeconds = 0;
  let objectId = "";

  const replaceInstance = ({ z, scale = TREASURE_CHEST_BASE_SCALE }) => {
    if (!objectId || sceneObject.instances.length === 0) {
      return;
    }

    sceneObject.instances[0] = Object.freeze({
      ...sceneObject.instances[0],
      offset: Object.freeze([TREASURE_CHEST_TARGET_X, height, z]),
      scale
    });
  };
  const getSnapshot = () => Object.freeze({
    phase,
    objectId,
    visible: sceneObject.instances.length > 0,
    ready: phase === "ready",
    placeholder: true
  });

  return Object.freeze({
    sceneObject,
    getSnapshot,
    activate({ id = "treasure-chest-emergency" } = {}) {
      if (phase !== "hidden") {
        return getSnapshot();
      }

      objectId = String(id || "treasure-chest-emergency");
      phase = "arriving";
      elapsedSeconds = 0;
      pulseSeconds = 0;
      sceneObject.instances = [Object.freeze({
        id: objectId,
        spawnableType: TREASURE_CHEST_OBJECT_TYPE,
        offset: Object.freeze([TREASURE_CHEST_TARGET_X, height, startZ]),
        baseScale: TREASURE_CHEST_BASE_SCALE,
        scale: TREASURE_CHEST_BASE_SCALE,
        yaw: TREASURE_CHEST_MODEL_FACE_YAW_OFFSET
      })];
      return getSnapshot();
    },
    pulse() {
      if (phase !== "ready") {
        return false;
      }

      pulseSeconds = TREASURE_CHEST_PULSE_SECONDS;
      replaceInstance({
        z: targetZ,
        scale: TREASURE_CHEST_BASE_SCALE * TREASURE_CHEST_PULSE_SCALE
      });
      return true;
    },
    startDeparture() {
      if (phase !== "ready") {
        return getSnapshot();
      }

      phase = "departing";
      elapsedSeconds = 0;
      pulseSeconds = 0;
      return getSnapshot();
    },
    update(deltaSeconds) {
      const delta = Math.max(0, Number(deltaSeconds) || 0);

      if (phase === "arriving") {
        elapsedSeconds += delta;
        const progress = Math.min(
          1,
          elapsedSeconds / TREASURE_CHEST_ARRIVAL_SECONDS
        );

        replaceInstance({
          z: interpolate(startZ, targetZ, progress)
        });
        if (progress >= 1) {
          phase = "ready";
          elapsedSeconds = 0;
        }
      } else if (phase === "departing") {
        elapsedSeconds += delta;
        const progress = Math.min(
          1,
          elapsedSeconds / TREASURE_CHEST_DEPARTURE_SECONDS
        );

        replaceInstance({
          z: interpolate(targetZ, startZ, progress)
        });
        if (progress >= 1) {
          sceneObject.instances = [];
          phase = "gone";
        }
      } else if (phase === "ready" && pulseSeconds > 0) {
        pulseSeconds = Math.max(0, pulseSeconds - delta);
        if (pulseSeconds <= 0) {
          replaceInstance({ z: targetZ });
        }
      }

      return getSnapshot();
    },
    isTreasureObjectId(id) {
      return Boolean(objectId) && id === objectId;
    }
  });
}
