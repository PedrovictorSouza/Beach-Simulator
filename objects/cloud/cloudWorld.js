import { loadTexturedModel } from "../../rendering/worldAssets.js";

const CLOUD_GLTF_URL = new URL("./cloud.gltf", import.meta.url).href;
const CLOUD_BIN_URL = new URL("./cloud.bin", import.meta.url).href;
const CLOUD_TEXTURE_URL = new URL("./cloud.png", import.meta.url).href;
const CLOUD_MODEL_FACE_YAW_OFFSET = 0;
const CLOUD_INSTANCE_COUNT = 10;
const CLOUD_DEFAULT_VISIBLE_COUNT = 7;
const CLOUD_OPACITY = 0.3;
const CLOUD_NORMALIZED_SIZE = 18;
const CLOUD_DRIFT_SPEED = 0.9;
const CLOUD_WRAP_MIN_X = -145;
const CLOUD_WRAP_MAX_X = 145;
const CLOUD_CENTER_MIN_X = -30;
const CLOUD_CENTER_MAX_X = 30;
const CLOUD_LEFT_MIN_X = -112;
const CLOUD_LEFT_MAX_X = -42;
const CLOUD_RIGHT_MIN_X = 42;
const CLOUD_RIGHT_MAX_X = 112;
const CLOUD_MIN_Y = 24;
const CLOUD_MAX_Y = 38;
const CLOUD_SEA_MIN_Z = -115;
const CLOUD_SEA_MAX_Z = -68;
const CLOUD_SAND_MIN_Z = -40;
const CLOUD_SAND_MAX_Z = 55;
const CLOUD_RESTINGA_MIN_Z = 82;
const CLOUD_RESTINGA_MAX_Z = 112;
const CLOUD_MIN_SCALE = 0.72;
const CLOUD_MAX_SCALE = 1.2;
const CENTER_INSTANCE_INDEXES = new Set([4, 8]);
const CLOUD_ZONE_BY_INSTANCE_INDEX = Object.freeze([
  "sea",
  "restinga",
  "sea",
  "restinga",
  "sand",
  "sea",
  "restinga",
  "sea",
  "sand",
  "restinga"
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(random, min, max) {
  return min + random() * (max - min);
}

function getCloudZ(random, zone) {
  if (zone === "sea") {
    return randomBetween(random, CLOUD_SEA_MIN_Z, CLOUD_SEA_MAX_Z);
  }

  if (zone === "restinga") {
    return randomBetween(random, CLOUD_RESTINGA_MIN_Z, CLOUD_RESTINGA_MAX_Z);
  }

  return randomBetween(random, CLOUD_SAND_MIN_Z, CLOUD_SAND_MAX_Z);
}

function createCloudInstances(random) {
  const instances = [];
  let sideIndex = 0;

  for (let index = 0; index < CLOUD_INSTANCE_COUNT; index += 1) {
    const isCenterInstance = CENTER_INSTANCE_INDEXES.has(index);
    const useLeftSide = sideIndex % 2 === 0;
    const x = isCenterInstance ?
      randomBetween(random, CLOUD_CENTER_MIN_X, CLOUD_CENTER_MAX_X) :
      useLeftSide ?
        randomBetween(random, CLOUD_LEFT_MIN_X, CLOUD_LEFT_MAX_X) :
        randomBetween(random, CLOUD_RIGHT_MIN_X, CLOUD_RIGHT_MAX_X);

    if (!isCenterInstance) {
      sideIndex += 1;
    }

    instances.push({
      id: `cloud-${index}`,
      offset: [
        x,
        randomBetween(random, CLOUD_MIN_Y, CLOUD_MAX_Y),
        getCloudZ(random, CLOUD_ZONE_BY_INSTANCE_INDEX[index])
      ],
      scale: randomBetween(random, CLOUD_MIN_SCALE, CLOUD_MAX_SCALE),
      yaw: CLOUD_MODEL_FACE_YAW_OFFSET,
      alpha: CLOUD_OPACITY
    });
  }

  return instances;
}

export async function createCloudWorld({
  gl,
  onStatus,
  random = Math.random
}) {
  if (typeof random !== "function") {
    throw new Error("CloudWorld precisa de uma funcao random.");
  }

  const model = await loadTexturedModel({
    gl,
    gltfPath: CLOUD_GLTF_URL,
    binPath: CLOUD_BIN_URL,
    texturePath: CLOUD_TEXTURE_URL,
    normalizedSize: CLOUD_NORMALIZED_SIZE,
    onStatus
  });
  const cloudInstances = createCloudInstances(random);
  const sceneObject = {
    worldObject: "cloud",
    renderAfterOcean: true,
    model,
    instances: cloudInstances.slice(0, CLOUD_DEFAULT_VISIBLE_COUNT),
    brightness: 1.06
  };
  let visibleCount = CLOUD_DEFAULT_VISIBLE_COUNT;

  return Object.freeze({
    sceneObject,
    update({ deltaSeconds = 0, nextVisibleCount = visibleCount } = {}) {
      const stepSeconds = Math.max(0, Number(deltaSeconds) || 0);

      for (const instance of cloudInstances) {
        instance.offset[0] += CLOUD_DRIFT_SPEED * stepSeconds;
        if (instance.offset[0] > CLOUD_WRAP_MAX_X) {
          instance.offset[0] = CLOUD_WRAP_MIN_X;
        }
      }

      const requestedCount = Number(nextVisibleCount);
      const clampedCount = clamp(
        Number.isFinite(requestedCount) ? Math.round(requestedCount) : visibleCount,
        0,
        CLOUD_INSTANCE_COUNT
      );

      if (clampedCount !== visibleCount) {
        visibleCount = clampedCount;
        sceneObject.instances = cloudInstances.slice(0, visibleCount);
      }
    }
  });
}
