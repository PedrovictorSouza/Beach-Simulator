import { createCharacterFactory } from "../../../characterFactory.js";
import { loadImageAsset, loadTexturedModel } from "../../../rendering/worldAssets.js";
import { loadChopperAssets } from "../../characters/chopper/loadChopperAssets.js";
import { loadSegmentedGltfModel } from "../../characters/shared/loadSegmentedGltfModel.js";

const BROKEN_MODULE_GLTF_PATH = "./Character/Broken-module/unnamed_7.gltf";
const BROKEN_MODULE_BIN_PATH = "./Character/Broken-module/unnamed_7.bin";
const BROKEN_MODULE_TEXTURE_PATH = "./Character/Broken-module/unnamed_7.png";
const BILL_IMAGE_PATH = new URL("../../characters/bill/bill.png", import.meta.url).href;
const PLAYER_MODEL_GLTF_PATH = new URL("../../characters/Broky/Broky.gltf", import.meta.url).href;
const PLAYER_MODEL_BIN_PATH = new URL("../../characters/Broky/Broky.bin", import.meta.url).href;
const PLAYER_MODEL_TEXTURE_PATH = new URL("../../characters/Broky/Broky.png", import.meta.url).href;
const ROBOT_2_MODEL_GLTF_PATH = new URL("../../characters/Robot-2/robot-2.gltf", import.meta.url).href;
const ROBOT_2_MODEL_BIN_PATH = new URL("../../characters/Robot-2/robot-2.bin", import.meta.url).href;
const ROBOT_2_MODEL_TEXTURE_PATH = new URL("../../characters/Robot-2/robot-2.png", import.meta.url).href;
const BEE_MODEL_GLTF_PATH = new URL("../../characters/bee/bee.gltf", import.meta.url).href;
const BEE_MODEL_BIN_PATH = new URL("../../characters/bee/bee.bin", import.meta.url).href;
const BEE_MODEL_TEXTURE_PATH = new URL("../../characters/bee/bee.png", import.meta.url).href;
const CHARMANDER_MODEL_GLTF_PATH = new URL("../../characters/faisca/faisca.gltf", import.meta.url).href;
const CHARMANDER_MODEL_BIN_PATH = new URL("../../characters/faisca/faisca.bin", import.meta.url).href;
const CHARMANDER_MODEL_TEXTURE_PATH = new URL("../../characters/faisca/faisca.png", import.meta.url).href;
const BUILDER_MODEL_GLTF_PATH = new URL("../../characters/Builder/player.gltf", import.meta.url).href;
const BUILDER_MODEL_BIN_PATH = new URL("../../characters/Builder/player.bin", import.meta.url).href;
const BUILDER_MODEL_TEXTURE_PATH = new URL("../../characters/Builder/player.png", import.meta.url).href;

const BROKY_PLAYER_PART_FILTERS = {
  body: {
    excludeNodes: [4, 5, 7, 8, 9, 10, 11, 12, 13, 14],
    excludeNodeNames: [
      "leg-left",
      "leg-right",
      "shoulder-left",
      "shoulder-right",
      "left-arm",
      "right-arm",
      "shin-left",
      "shin-right",
      "foot-left",
      "foot-right"
    ]
  },
  leftLeg: {
    includeNodes: [4, 11, 13],
    includeNodeNames: ["leg-left", "shin-left", "foot-left"]
  },
  rightLeg: {
    includeNodes: [5, 12, 14],
    includeNodeNames: ["leg-right", "shin-right", "foot-right"]
  },
  leftArm: {
    includeNodes: [8, 10],
    includeNodeNames: ["shoulder-left", "left-arm"]
  },
  rightArm: {
    includeNodes: [7, 9],
    includeNodeNames: ["shoulder-right", "right-arm"]
  }
};

export async function loadCharacterAssets({ gl, setStatus }) {
  const [
    chopperAssets,
    robot1Model,
    robot2Model,
    beeModel,
    charmanderModel,
    builderModel,
    gameplayOpeningShipModel,
    playerModelAssets,
    billImage,
    characterFactory
  ] = await Promise.all([
    loadChopperAssets({ gl, setStatus }),
    loadTexturedModel({
      gl,
      gltfPath: "./Character/Robot-1/robot-1.gltf",
      binPath: "./Character/Robot-1/robot-1.bin",
      texturePath: "./Character/Robot-1/robot-1.png",
      normalizedSize: 1.65,
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: ROBOT_2_MODEL_GLTF_PATH,
      binPath: ROBOT_2_MODEL_BIN_PATH,
      texturePath: ROBOT_2_MODEL_TEXTURE_PATH,
      normalizedSize: 1.65,
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: BEE_MODEL_GLTF_PATH,
      binPath: BEE_MODEL_BIN_PATH,
      texturePath: BEE_MODEL_TEXTURE_PATH,
      normalizedSize: 1.65,
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: CHARMANDER_MODEL_GLTF_PATH,
      binPath: CHARMANDER_MODEL_BIN_PATH,
      texturePath: CHARMANDER_MODEL_TEXTURE_PATH,
      normalizedSize: 1.65,
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: BUILDER_MODEL_GLTF_PATH,
      binPath: BUILDER_MODEL_BIN_PATH,
      texturePath: BUILDER_MODEL_TEXTURE_PATH,
      normalizedSize: 1.65,
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: BROKEN_MODULE_GLTF_PATH,
      binPath: BROKEN_MODULE_BIN_PATH,
      texturePath: BROKEN_MODULE_TEXTURE_PATH,
      normalizedSize: 2.05,
      onStatus: setStatus
    }),
    loadSegmentedGltfModel({
      gl,
      gltfPath: PLAYER_MODEL_GLTF_PATH,
      binPath: PLAYER_MODEL_BIN_PATH,
      texturePath: PLAYER_MODEL_TEXTURE_PATH,
      normalizedSize: 1.65,
      parts: BROKY_PLAYER_PART_FILTERS,
      onStatus: setStatus
    }),
    loadImageAsset(BILL_IMAGE_PATH),
    createCharacterFactory({
      spriteSheetUrl: "./Character/player-spritesheet.png",
      idleUrl: "./Character/player-idle.png"
    })
  ]);

  return {
    ...chopperAssets,
    robot1Model,
    robot2Model,
    beeModel,
    charmanderModel,
    builderModel,
    gameplayOpeningShipModel,
    playerModel: playerModelAssets.partModels.body,
    playerPartModels: {
      body: playerModelAssets.partModels.body,
      leftLeg: playerModelAssets.partModels.leftLeg,
      rightLeg: playerModelAssets.partModels.rightLeg,
      leftArm: playerModelAssets.partModels.leftArm,
      rightArm: playerModelAssets.partModels.rightArm
    },
    billImage,
    characterFactory,
    characterPartLibraries: {
      chopper: chopperAssets.chopperParts
    }
  };
}
