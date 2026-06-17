import { createRustlingGrassEventRuntime } from "./rustlingGrassEventRuntime.js";
import { createWorldCellPlannerInteractionRuntime } from "./worldCellPlannerInteractionRuntime.js";
import { createWorldSceneSyncRuntime } from "./worldSceneSyncRuntime.js";

export function createWorldRuntimeBundle({
  camera = null,
  controls = {},
  gameplay = {},
  hud = {},
  rendering = {},
  session = {},
  worldCanvas = null,
  callbacks = {},
  config = {},
  getGridConfig = () => ({})
} = {}) {
  const worldCellPlannerInteractionRuntime = createWorldCellPlannerInteractionRuntime({
    camera,
    getGridConfig,
    hud,
    maxDistancePx: config.worldCellPlannerPickMaxDistancePx,
    rendering,
    session,
    worldCanvas
  });

  const rustlingGrassEventRuntime = createRustlingGrassEventRuntime({
    getStoryState: () => controls.storyState
  });

  const worldSceneSyncRuntime = createWorldSceneSyncRuntime({
    session,
    controls,
    camera,
    hud,
    gameplay,
    config: {
      workbenchPosition: config.workbenchPosition,
      workbenchInteractDistance: config.workbenchInteractDistance
    },
    ambient: {
      updateLandscapeCutEffect: callbacks.updateLandscapeCutEffect,
      updateSnowstormFog: callbacks.updateSnowstormFog
    },
    sources: {
      clearInteractionObjectHighlights: callbacks.clearInteractionObjectHighlights
    }
  });

  return {
    rustlingGrassEventRuntime,
    worldCellPlannerInteractionRuntime,
    worldSceneSyncRuntime
  };
}
