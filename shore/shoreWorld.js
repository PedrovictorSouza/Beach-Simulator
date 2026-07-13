import { createLowPolyShoreModel } from "../rendering/worldAssets.js";

const SHORE_SURFACE_Y = 0.36;

export function createShoreSceneObject({ gl }) {
  return {
    model: createLowPolyShoreModel(gl),
    instances: [{
      offset: [0, SHORE_SURFACE_Y, 0],
      scale: 1,
      yaw: 0,
      alpha: 0.76
    }],
    brightness: 1.24,
    wave: {
      strength: 0.12,
      scale: 0.28,
      speed: 2.2,
      chop: 0.18,
      direction: [0.86, 0.18]
    }
  };
}
