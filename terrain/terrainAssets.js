import {
  loadPicoModel,
  loadTexturedModel
} from "../rendering/worldAssets.js";

export const TERRAIN_ASSET_PATHS = Object.freeze({
  ground: Object.freeze({
    gltfPath: "./terrain/assets/ground/ground.gltf",
    txtPath: "./terrain/assets/ground/ground.txt"
  }),
  sandground: Object.freeze({
    gltfPath: "./terrain/assets/sandground/sandground.gltf",
    binPath: "./terrain/assets/sandground/sandground.bin",
    texturePath: "./terrain/assets/sandground/sandground.png"
  }),
  groundAlt: Object.freeze({
    gltfPath: "./terrain/assets/ground-2/ground-2.gltf",
    binPath: "./terrain/assets/ground-2/ground-2.bin",
    texturePath: "./terrain/assets/ground-2/ground-2.png"
  }),
  palmTree: Object.freeze({
    gltfPath: "./Trees/PalmTree/plamTree.gltf",
    txtPath: "./Trees/PalmTree/plamTree.txt"
  })
});

export async function loadTerrainAssets({ gl, onStatus }) {
  const [groundModel, sandgroundModel, palmTreeModel] = await Promise.all([
    loadPicoModel({
      gl,
      gltfPath: TERRAIN_ASSET_PATHS.ground.gltfPath,
      txtPath: TERRAIN_ASSET_PATHS.ground.txtPath,
      onStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: TERRAIN_ASSET_PATHS.sandground.gltfPath,
      binPath: TERRAIN_ASSET_PATHS.sandground.binPath,
      texturePath: TERRAIN_ASSET_PATHS.sandground.texturePath,
      normalizedSize: 3.8,
      onStatus
    }),
    loadPicoModel({
      gl,
      gltfPath: TERRAIN_ASSET_PATHS.palmTree.gltfPath,
      txtPath: TERRAIN_ASSET_PATHS.palmTree.txtPath,
      onStatus
    })
  ]);

  return {
    groundModel,
    sandgroundModel,
    palmTreeModel
  };
}
