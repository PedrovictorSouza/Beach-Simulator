import { createLowPolyOceanModel } from "../rendering/worldAssets.js";

export function createOceanSceneObject({ gl }) {
  return {
    model: createLowPolyOceanModel(gl),
    instances: [{
      offset: [0, -0.52, 0],
      scale: 1,
      yaw: 0,
      alpha: 0.78
    }],
    brightness: 1.16,
    wave: {
      strength: 0.34,
      scale: 0.16,
      speed: 1.35,
      chop: 0.08,
      direction: [0.72, 0.36]
    }
  };
}
