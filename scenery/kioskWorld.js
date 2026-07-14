import { loadTexturedModel } from "../rendering/worldAssets.js";

const KIOSK_MODEL_FACE_YAW_OFFSET = (Math.PI * 3) / 2;
const KIOSK_NORMALIZED_SIZE = 20;

export async function loadKioskAssets({ gl, onStatus }) {
  const kioskModel = await loadTexturedModel({
    gl,
    gltfPath: "./kiosk/house_2.gltf",
    binPath: "./kiosk/house_2.bin",
    texturePath: "./kiosk/house_2.png",
    normalizedSize: KIOSK_NORMALIZED_SIZE,
    onStatus
  });

  return { kioskModel };
}

export function createKioskSceneObjects({ kioskAssets, position }) {
  return [
    {
      worldObject: "scenery",
      sceneryType: "kiosk",
      model: kioskAssets.kioskModel,
      instances: [
        {
          id: "kiosk-main",
          offset: position,
          scale: 1,
          yaw: KIOSK_MODEL_FACE_YAW_OFFSET
        }
      ],
      brightness: 1.05
    }
  ];
}
