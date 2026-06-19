import { getEncounterRepairBoxPosition } from "./encounterRepairBoxPosition.js";
import {
  createGameplayNaturePresentationRuntimeBundle
} from "./presentation/naturePresentationRuntimeBundle.js";

export function createGameLoopNaturePresentationRuntimeBundle({
  camera,
  controls,
  rendering,
  session,
  math = {},
  createRuntime = createGameplayNaturePresentationRuntimeBundle
} = {}) {
  const {
    clamp01,
    easeOutCubic,
    lerp
  } = math;

  return createRuntime({
    camera,
    controls,
    rendering,
    session,
    callbacks: {
      getEncounterRepairBoxPosition
    },
    math: {
      clamp01,
      easeOutCubic,
      lerp
    }
  });
}
