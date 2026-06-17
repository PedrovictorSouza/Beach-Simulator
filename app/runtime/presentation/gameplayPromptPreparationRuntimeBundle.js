import {
  getBoulderShadedTaskGroundCells as getBoulderShadedTaskGroundCellsDefault,
  getFreeRoamRestorationGroundCells as getFreeRoamRestorationGroundCellsDefault,
  getGrowFirstHabitatTaskGroundCells as getGrowFirstHabitatTaskGroundCellsDefault
} from "../fieldMoveRuntime/fieldMoveGroundTargets.js";
import { createGameplayPromptPreparationFrameRuntime } from "./gameplayPromptTargetFrameState.js";

export function createGameplayPromptPreparationRuntimeBundle({
  controls = {},
  createRuntime = createGameplayPromptPreparationFrameRuntime,
  debug = null,
  gameplay = {},
  input = {},
  runtimes = {},
  session = {},
  targetResolvers = {}
} = {}) {
  const {
    getCurrentInputModalityState = () => null
  } = input;
  const {
    foundationBuildZoneRuntime = {},
    groundActionFeedbackRuntime = {},
    playerCounterPromptRuntime = {},
    solarStationPowerRadiusRuntime = {},
    waterGunRuntime = {},
    workbenchRotationRuntime = {}
  } = runtimes;
  const {
    buildSolarStationFieldMarkedGroundCells = () => [],
    getBoulderShadedTaskGroundCells = getBoulderShadedTaskGroundCellsDefault,
    getFreeRoamRestorationGroundCells = getFreeRoamRestorationGroundCellsDefault,
    getGrowFirstHabitatTaskGroundCells = getGrowFirstHabitatTaskGroundCellsDefault,
    getLeppaTreeSurroundingGroundCells = () => [],
    getWorldCellPlannerSelectedGroundCell = () => null,
    isOpeningLeppaTreeRequestActive = () => false
  } = targetResolvers;

  return createRuntime({
    controls,
    session,
    gameplay,
    getCurrentInputModalityState,
    getPlayerCounterPromptText: (frameNow) =>
      playerCounterPromptRuntime.get?.(frameNow) ?? "",
    getSelectedRotatableWorkbenchPlacement: (...args) =>
      workbenchRotationRuntime.getSelectedTargetFromSources?.(...args) ?? null,
    getNearestRotatableWorkbenchPlacement: (...args) =>
      workbenchRotationRuntime.getNearestTarget?.(...args) ?? null,
    debug,
    getPendingSquirtleWaterGunGroundCells: () =>
      waterGunRuntime.getPendingGroundCells?.() ?? [],
    getFreeRoamRestorationGroundCells: (options) => getFreeRoamRestorationGroundCells({
      ...options,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      iceGroundInstances: session.iceGroundInstances
    }),
    getLeppaTreeSurroundingGroundCells,
    isOpeningLeppaTreeRequestActive,
    buildSolarStationFieldMarkedGroundCells,
    getBoulderShadedTaskGroundCells: (storyState) => getBoulderShadedTaskGroundCells({
      storyState,
      challengeBoulder: session.challengeBoulder,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances
    }),
    getGrowFirstHabitatTaskGroundCells: (options) => getGrowFirstHabitatTaskGroundCells({
      ...options,
      referencePosition:
        session.bulbasaurEncounter?.position ||
        session.bulbasaurEncounter?.repairPosition ||
        session.playerCharacter?.getPosition?.() ||
        null,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances
    }),
    buildFoundationBuildZoneGroundCells: (...args) =>
      foundationBuildZoneRuntime.buildGroundCells?.(...args) ?? [],
    getWorldCellPlannerSelectedGroundCell,
    getWorkbenchRotationGroundCell: (...args) =>
      workbenchRotationRuntime.getGroundCell?.(...args) ?? null,
    buildSolarStationPreviewPowerRadiusGroundCells: (_session, preview) =>
      solarStationPowerRadiusRuntime.buildPreviewPowerRadiusGroundCells?.(preview) ?? [],
    buildPlacedSolarStationPowerRadiusGroundCells: () =>
      solarStationPowerRadiusRuntime.buildPlacedPowerRadiusGroundCells?.() ?? [],
    getGroundActionFeedbackFrame: (frameNow) =>
      groundActionFeedbackRuntime.getFeedbackFrame?.({ session, now: frameNow }) ?? null,
    getFieldToolTargetPulseFrame: (groundCell, frameNow) =>
      groundActionFeedbackRuntime.getPulseFrame?.(groundCell, frameNow) ?? null
  });
}
