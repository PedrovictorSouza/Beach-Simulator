import {
  createCompanionConstructionBlockerRuntime,
  createPlayerConstructionPlacementBlockers as defaultCreatePlayerConstructionPlacementBlockers
} from "../../gameplay/placementBlockers.js";
import { createSolarStationPlacementBlockerRuntime } from "./solarStationPlacementBlockers.js";
import { createWorldObjectPlacementBlockerRuntime } from "./worldObjectPlacementBlockers.js";

const DEFAULT_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE = 0.68;
const DEFAULT_DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE = 1.15;
const DEFAULT_TREE_PLACEMENT_BLOCKER_MIN_SIZE = 0.9;
const DEFAULT_DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE = 1.35;
const DEFAULT_LEPPA_TREE_PLACEMENT_BLOCKER_SIZE = [2.35, 2.35];
const DEFAULT_LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE = 1.425;

export function createConstructionBlockerRuntimeBundle({
  controls = {},
  hud = null,
  session = null,
  treeFootprint = () => 0,
  callbacks = {},
  config = {},
  geometry = {}
} = {}) {
  const createPlayerConstructionPlacementBlockers =
    callbacks.createPlayerConstructionPlacementBlockers ||
    defaultCreatePlayerConstructionPlacementBlockers;

  const companionConstructionBlockerRuntime = createCompanionConstructionBlockerRuntime({
    getColliders: callbacks.getTerrainColliders,
    playBlockedSound: callbacks.playBlockedSound,
    pushNotice: (message) => hud?.pushNotice?.(message)
  });
  const worldObjectPlacementBlockerRuntime = createWorldObjectPlacementBlockerRuntime({
    session,
    treeFootprint,
    treeFootprintScale:
      config.treeFootprintScale ?? DEFAULT_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    deadTreeFootprintScale:
      config.deadTreeFootprintScale ?? DEFAULT_DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    treeMinSize:
      config.treeMinSize ?? DEFAULT_TREE_PLACEMENT_BLOCKER_MIN_SIZE,
    deadTreeMinSize:
      config.deadTreeMinSize ?? DEFAULT_DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE,
    leppaTreeBlockerSize:
      config.leppaTreeBlockerSize ?? DEFAULT_LEPPA_TREE_PLACEMENT_BLOCKER_SIZE,
    leppaTreeDefaultCellSize:
      config.leppaTreeDefaultCellSize ?? DEFAULT_LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE
  });
  const solarStationPlacementBlockerRuntime = createSolarStationPlacementBlockerRuntime({
    session,
    getStoryState: () => controls.storyState,
    footprints: config.footprints,
    createPlayerConstructionPlacementBlockers,
    getWorldObjectPlacementBlockers: worldObjectPlacementBlockerRuntime.getBlockers,
    getPlacementCollisionSize: geometry.getPlacementCollisionSize,
    getPlacementRect: geometry.getPlacementRect,
    doPlacementRectsOverlap: geometry.doPlacementRectsOverlap
  });

  return {
    companionConstructionBlockerRuntime,
    solarStationPlacementBlockerRuntime,
    worldObjectPlacementBlockerRuntime
  };
}
