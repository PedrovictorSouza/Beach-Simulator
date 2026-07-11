import {
  loadPicoModel,
  loadTexturedModel
} from "../rendering/worldAssets.js";

export const TERRAIN_ASSET_PATHS = Object.freeze({
  ground: Object.freeze({
    gltfPath: "./terrain/assets/ground/ground.gltf",
    txtPath: "./terrain/assets/ground/ground.txt"
  }),
  iceground: Object.freeze({
    gltfPath: "./terrain/assets/iceground/iceground.gltf",
    binPath: "./terrain/assets/iceground/iceground.bin",
    texturePath: "./terrain/assets/iceground/iceground.png"
  }),
  groundAlt: Object.freeze({
    gltfPath: "./terrain/assets/ground-2/ground-2.gltf",
    binPath: "./terrain/assets/ground-2/ground-2.bin",
    texturePath: "./terrain/assets/ground-2/ground-2.png"
  })
});

export async function loadTerrainAssets({ gl, onStatus }) {
  const [groundModel, icegroundModel] = await Promise.all([
    loadPicoModel({
      gl,
      gltfPath: TERRAIN_ASSET_PATHS.ground.gltfPath,
      txtPath: TERRAIN_ASSET_PATHS.ground.txtPath,
      onStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: TERRAIN_ASSET_PATHS.iceground.gltfPath,
      binPath: TERRAIN_ASSET_PATHS.iceground.binPath,
      texturePath: TERRAIN_ASSET_PATHS.iceground.texturePath,
      normalizedSize: 3.8,
      onStatus
    })
  ]);

  return {
    groundModel,
    icegroundModel
  };
}
