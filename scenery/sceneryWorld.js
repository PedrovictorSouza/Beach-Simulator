import { loadTexturedModel } from "../rendering/worldAssets.js";

export const SCENERY_TYPES = Object.freeze({
  KIOSK: "kiosk",
  BEACH_HOUSE: "beach-house"
});

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
