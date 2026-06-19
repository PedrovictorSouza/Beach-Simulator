import {
  WORKBENCH_INTERACT_DISTANCE,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import { clearInteractionObjectHighlights } from "./interactionObjectHighlight.js";
import { createWorldRuntimeBundle } from "./world/worldRuntimeBundle.js";

const WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX = 72;

export function createGameLoopWorldRuntimeBundle({
  camera,
  controls,
  gameplay,
  hud,
  rendering,
  session,
  worldCanvas,
  runtimes = {},
  callbacks = {},
  createRuntime = createWorldRuntimeBundle
} = {}) {
  const {
    freeBlockBuildSessionRuntime = {}
  } = runtimes;
  const {
    getLandscapeCutEffectRuntime = () => runtimes.landscapeCutEffectRuntime,
    getSnowstormFogRuntime = () => runtimes.snowstormFogRuntime
  } = callbacks;

  return createRuntime({
    camera,
    controls,
    gameplay,
    hud,
    rendering,
    session,
    worldCanvas,
    callbacks: {
      clearInteractionObjectHighlights,
      updateLandscapeCutEffect: (deltaTime) =>
        getLandscapeCutEffectRuntime()?.update?.(deltaTime),
      updateSnowstormFog: ({ deltaTime }) =>
        getSnowstormFogRuntime()?.update?.({ session, deltaTime })
    },
    config: {
      worldCellPlannerPickMaxDistancePx: WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX,
      workbenchPosition: WORKBENCH_POSITION,
      workbenchInteractDistance: WORKBENCH_INTERACT_DISTANCE
    },
    getGridConfig: () => freeBlockBuildSessionRuntime.getGridConfig?.() ?? {}
  });
}
