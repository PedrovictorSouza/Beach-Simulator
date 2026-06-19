import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES
} from "../story/sandbotsLexicon.js";

const LEAFAGE_TALL_GRASS_ARTWORK_URL = new URL("../../Trees/tall-grass/tall-grass.png", import.meta.url).href;
const LEAFAGE_GARDEN_1_ARTWORK_URL = new URL("../../Trees/Garden-1/garden-1.png", import.meta.url).href;
const LEAFAGE_NATIVE_TREE_ARTWORK_URL = new URL("../../Trees/tree-3/Tree-3.png", import.meta.url).href;
const LEAFAGE_FLOWER_ARTWORK_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23284f24'/%3E%3Crect x='44' y='48' width='8' height='30' fill='%2338b764'/%3E%3Crect x='32' y='38' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='50' y='38' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='41' y='28' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='41' y='50' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='42' y='42' width='12' height='12' fill='%23ff7eb6'/%3E%3Crect x='28' y='64' width='14' height='8' fill='%2346d75b'/%3E%3Crect x='54' y='62' width='16' height='8' fill='%2346d75b'/%3E%3C/svg%3E";

export const LEAFAGE_OBJECT_OPTIONS = Object.freeze([
  {
    id: "tallGrass",
    label: "Tall Grass",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow Tall Grass with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_TALL_GRASS_ARTWORK_URL
  },
  {
    id: "garden1",
    label: "Garden-1",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow Garden-1 with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_GARDEN_1_ARTWORK_URL
  },
  {
    id: "flower",
    label: "Flower",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow a revived Flower with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_FLOWER_ARTWORK_URL
  },
  {
    id: "nativeTree",
    label: "Native tree",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow a Native tree with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_NATIVE_TREE_ARTWORK_URL
  }
]);
