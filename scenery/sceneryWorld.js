import {
  createWorldTextureFactory,
  loadTexturedModel
} from "../rendering/worldAssets.js";

export const SCENERY_TYPES = Object.freeze({
  KIOSK: "kiosk",
  BEACH_HOUSE: "beach-house",
  BEVERAGE_STORE: "beverage-store"
});

const BEVERAGE_STORE_MODEL_FACE_YAW_OFFSET = (Math.PI * 3) / 2;

const SCENERY_DEFINITIONS = Object.freeze({
  [SCENERY_TYPES.KIOSK]: Object.freeze({
    gltfPath: "./kiosk/house_2.gltf",
    binPath: "./kiosk/house_2.bin",
    texturePath: "./kiosk/house_2.png",
    normalizedSize: 20,
    modelFaceYawOffset: (Math.PI * 3) / 2,
    brightness: 1.05
  }),
  [SCENERY_TYPES.BEACH_HOUSE]: Object.freeze({
    gltfPath: "./beach-house/beach-house.gltf",
    binPath: "./beach-house/beach-house.bin",
    texturePath: "./beach-house/beach-house.png",
    normalizedSize: 34,
    modelFaceYawOffset: (Math.PI * 3) / 2,
    brightness: 1.05
  }),
  [SCENERY_TYPES.BEVERAGE_STORE]: Object.freeze({
    gltfPath: "./beberage/Beberage.gltf",
    binPath: "./beberage/Beberage.bin",
    texturePath: "./beberage/Beberage.png",
    normalizedSize: 16,
    modelFaceYawOffset: BEVERAGE_STORE_MODEL_FACE_YAW_OFFSET,
    brightness: 1.05
  })
});

function getSceneryDefinition(type) {
  const definition = SCENERY_DEFINITIONS[type];

  if (!definition) {
    throw new Error(`Tipo de cenario desconhecido: ${type}.`);
  }

  return definition;
}

export async function loadSceneryAsset({ gl, type, onStatus }) {
  const definition = getSceneryDefinition(type);
  const model = await loadTexturedModel({
    gl,
    gltfPath: definition.gltfPath,
    binPath: definition.binPath,
    texturePath: definition.texturePath,
    normalizedSize: definition.normalizedSize,
    onStatus
  });

  return { type, model };
}

export function createScenerySceneObjects({ sceneryAsset, position }) {
  const definition = getSceneryDefinition(sceneryAsset.type);

  return [
    {
      worldObject: "scenery",
      sceneryType: sceneryAsset.type,
      model: sceneryAsset.model,
      instances: [
        {
          id: `${sceneryAsset.type}-main`,
          offset: position,
          scale: 1,
          yaw: definition.modelFaceYawOffset
        }
      ],
      brightness: definition.brightness
    }
  ];
}

export function createSceneryPlaceholderSceneObjects({
  gl,
  sceneryType,
  model,
  position,
  tint,
  normalizedSize = 18
}) {
  const normalizedType = String(sceneryType || "").trim();
  const modelSpan = Math.max(...(model?.size || []));

  if (!normalizedType) {
    throw new Error("Placeholder de cenario precisa de sceneryType.");
  }

  if (!Number.isFinite(modelSpan) || modelSpan <= 0) {
    throw new Error("Placeholder de cenario precisa de um modelo valido.");
  }

  if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) {
    throw new Error("Placeholder de cenario precisa de position [x, y, z].");
  }

  if (!Array.isArray(tint) || tint.length !== 3 || !tint.every(Number.isFinite)) {
    throw new Error("Placeholder de cenario precisa de tint RGB.");
  }

  if (!Number.isFinite(normalizedSize) || normalizedSize <= 0) {
    throw new Error("Placeholder de cenario precisa de normalizedSize positivo.");
  }

  return [
    {
      worldObject: "scenery",
      sceneryType: normalizedType,
      placeholder: true,
      model: {
        ...model,
        texture: createWorldTextureFactory(gl).fromColor(tint)
      },
      instances: [
        {
          id: `${normalizedType}-main`,
          offset: [...position],
          scale: normalizedSize / modelSpan,
          yaw: 0
        }
      ],
      brightness: 1.15
    }
  ];
}
