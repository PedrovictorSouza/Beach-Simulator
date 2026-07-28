import { SPAWNABLE_OBJECT_TYPES } from "../spawn/spawnableObjectDto.js";
import {
  createWorldTextureFactory,
  loadImageAsset
} from "../rendering/worldAssets.js";

const SPRITE_URL_BY_TYPE = Object.freeze({
  [SPAWNABLE_OBJECT_TYPES.BANANA]: new URL(
    "../2d-objects/banana.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.BOTTLE]: new URL(
    "../2d-objects/bottle.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.CAN]: new URL(
    "../2d-objects/can.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.MONEY]: new URL(
    "../2d-objects/money.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.PAPER]: new URL(
    "../2d-objects/paper.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.RING]: new URL(
    "../2d-objects/ring.png",
    import.meta.url
  ).href,
  [SPAWNABLE_OBJECT_TYPES.SYRINGE]: new URL(
    "../2d-objects/seringe.png",
    import.meta.url
  ).href
});

const SPRITE_SCALE_BY_TYPE = Object.freeze({
  [SPAWNABLE_OBJECT_TYPES.BANANA]: 1.35,
  [SPAWNABLE_OBJECT_TYPES.PAPER]: 1.05,
  [SPAWNABLE_OBJECT_TYPES.CAN]: 1.25,
  [SPAWNABLE_OBJECT_TYPES.BOTTLE]: 1.4,
  [SPAWNABLE_OBJECT_TYPES.MONEY]: 1.2,
  [SPAWNABLE_OBJECT_TYPES.RING]: 1.3,
  [SPAWNABLE_OBJECT_TYPES.SYRINGE]: 1.3
});
const WHITE_TINT = Object.freeze([1, 1, 1]);
const SCREEN_SPRITE_MAX_SIZE = 16;

function createScreenSpriteModel(image, texture) {
  const longestSide = Math.max(image.width, image.height);
  const widthRatio = image.width / longestSide;
  const heightRatio = image.height / longestSide;

  return Object.freeze({
    offset: Object.freeze([0, 0, 0]),
    scale: 1,
    size: Object.freeze([widthRatio * 2, 0.02, heightRatio * 2]),
    spriteSize: Object.freeze([
      Math.max(1, Math.round(widthRatio * SCREEN_SPRITE_MAX_SIZE)),
      Math.max(1, Math.round(heightRatio * SCREEN_SPRITE_MAX_SIZE))
    ]),
    texture,
    primitives: Object.freeze([])
  });
}

function createWorldObjectInstance({
  id,
  request,
  terrainSurfaceY,
  position,
  yaw
}) {
  const scale = SPRITE_SCALE_BY_TYPE[request.type];

  if (!scale) {
    throw new Error(`Sprite desconhecido para ${request.type}.`);
  }

  return Object.freeze({
    id,
    spawnableType: request.type,
    request,
    offset: Object.freeze([position[0], terrainSurfaceY + 0.08, position[1]]),
    baseScale: scale,
    scale,
    yaw,
    tint: WHITE_TINT,
    tintStrength: 0
  });
}

export async function createWorldObjectPlaceholderSceneObjects({
  gl,
  requests,
  terrainSurfaceY,
  resolvePosition
}) {
  if (typeof resolvePosition !== "function") {
    throw new Error("Objetos da praia precisam de um resolvedor de posicao.");
  }

  const textureFactory = createWorldTextureFactory(gl);
  const spriteEntries = await Promise.all(
    Object.entries(SPRITE_URL_BY_TYPE).map(async ([type, url]) => {
      const image = await loadImageAsset(url);

      return [
        type,
        createScreenSpriteModel(image, textureFactory.fromImage(image))
      ];
    })
  );

  const modelByType = Object.fromEntries(spriteEntries);

  return Object.keys(SPRITE_URL_BY_TYPE).map((type) => ({
    worldObject: "spawn-object",
    spawnableType: type,
    screenSpaceSprite: true,
    model: modelByType[type],
    instances: requests
      .filter((request) => request.type === type)
      .map((request, index) => createWorldObjectInstance({
        id: `initial-${request.type}-${index}`,
        request,
        terrainSurfaceY,
        position: resolvePosition(request),
        yaw: request.placement.xProgress * Math.PI * 2
      })),
    brightness: 1.08
  }));
}

export function addWorldObjectPlaceholderSceneInstance({
  sceneObjects,
  request,
  terrainSurfaceY,
  resolvePosition
}) {
  const placeholderSceneObject = sceneObjects.find(
    (sceneObject) => sceneObject.spawnableType === request?.type
  );
  const requestedPosition = request?.placement?.position;
  const position = typeof resolvePosition === "function" ?
    resolvePosition(request) :
    requestedPosition;

  if (!placeholderSceneObject) {
    throw new Error("Lote de objetos clicaveis nao foi inicializado.");
  }

  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !position.every(Number.isFinite)
  ) {
    throw new Error("Objeto dinamico precisa de position [x, z] valida.");
  }

  const instance = createWorldObjectInstance({
    id: request.id,
    request,
    terrainSurfaceY,
    position,
    yaw: Number(request.placement.yaw) || 0
  });

  placeholderSceneObject.instances.push(instance);
  return instance;
}

export function setHoveredWorldObjectSceneInstance({ sceneObjects, objectId }) {
  let changed = false;

  for (const sceneObject of sceneObjects) {
    sceneObject.instances = sceneObject.instances.map((instance) => {
      const baseScale = instance.baseScale || instance.scale;
      const nextScale = instance.id === objectId ? baseScale * 1.2 : baseScale;

      if (instance.scale === nextScale) {
        return instance;
      }

      changed = true;
      return Object.freeze({
        ...instance,
        baseScale,
        scale: nextScale
      });
    });
  }

  return changed;
}

export function removeWorldObjectSceneInstance({ sceneObjects, objectId }) {
  for (const sceneObject of sceneObjects) {
    const instanceIndex = sceneObject.instances.findIndex(
      (instance) => instance.id === objectId
    );

    if (instanceIndex >= 0) {
      const [removedInstance] = sceneObject.instances.splice(instanceIndex, 1);

      return removedInstance;
    }
  }

  return null;
}
