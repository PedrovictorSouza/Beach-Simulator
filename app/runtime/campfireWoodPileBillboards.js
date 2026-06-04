import { CAMPFIRE_WOOD_PILE_SIZE } from "./gameplayPresentationTuning.js";

const CAMPFIRE_WOOD_PILE_OFFSETS = Object.freeze([
  [-0.36, 0.02, -0.16, -0.48],
  [0.34, 0.025, -0.12, 0.48],
  [-0.18, 0.03, 0.22, 0.08],
  [0.18, 0.035, 0.2, -0.16],
  [0, 0.045, -0.01, 0.82]
]);

export function getCampfireWoodPileBillboards({
  campfire,
  texture,
  uvRect
} = {}) {
  if (!campfire?.position || !texture) {
    return [];
  }

  return CAMPFIRE_WOOD_PILE_OFFSETS.map(([offsetX, offsetY, offsetZ, rotation]) => ({
    texture,
    position: [
      campfire.position[0] + offsetX,
      campfire.position[1] + offsetY,
      campfire.position[2] + offsetZ
    ],
    size: CAMPFIRE_WOOD_PILE_SIZE,
    uvRect,
    rotation
  }));
}
