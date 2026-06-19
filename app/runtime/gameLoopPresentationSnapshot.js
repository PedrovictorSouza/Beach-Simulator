import {
  buildGameplaySolarStationFieldMarkedGroundCells as buildSolarStationFieldMarkedGroundCells,
  GAMEPLAY_CONSTRUCTION_CONFIG as CONSTRUCTION_CONFIG
} from "./construction/constructionGameplayConfig.js";
import { isOpeningLeppaTreeRequestActive } from "./openingLeppaTreeRequest.js";
import { createGameplayPromptPreparationRuntimeBundle } from "./presentation/gameplayPromptPreparationRuntimeBundle.js";
import {
  createGameplayPresentationSnapshotFrameRuntime
} from "./presentation/renderSnapshotRuntimeBundle.js";
import { getLeppaTreeSurroundingGroundCells } from "../../world/islandWorld.js";

export function createGameLoopPresentationSnapshotFrameRuntime({
  controls,
  debug,
  gameplay,
  gameplayRenderSnapshotFrameRuntime,
  input = {},
  runtimes = {},
  session,
  targetResolvers = {},
  createPromptPreparationRuntime = createGameplayPromptPreparationRuntimeBundle,
  createPresentationRuntime = createGameplayPresentationSnapshotFrameRuntime
} = {}) {
  const {
    getCurrentInputModalityState
  } = input;
  const {
    getWorldCellPlannerSelectedGroundCell
  } = targetResolvers;

  const gameplayPromptPreparationFrameRuntime = createPromptPreparationRuntime({
    controls,
    session,
    gameplay,
    input: {
      getCurrentInputModalityState
    },
    runtimes,
    targetResolvers: {
      buildSolarStationFieldMarkedGroundCells,
      getLeppaTreeSurroundingGroundCells,
      getWorldCellPlannerSelectedGroundCell,
      isOpeningLeppaTreeRequestActive
    },
    debug
  });

  return createPresentationRuntime({
    gameplayPromptPreparationFrameRuntime,
    gameplayRenderSnapshotFrameRuntime,
    placementFootprints: {
      solarStation: CONSTRUCTION_CONFIG.gridFootprints.solarStation,
      greenhouse: CONSTRUCTION_CONFIG.gridFootprints.greenhouse,
      campfire: CONSTRUCTION_CONFIG.gridFootprints.trainHouse,
      leafDenKit: CONSTRUCTION_CONFIG.gridFootprints.leafDenKit
    }
  });
}
