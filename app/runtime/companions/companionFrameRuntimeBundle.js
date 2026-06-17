import { createCompanionEncounterRuntime } from "./companionEncounterRuntime.js";
import { createCompanionFrameRuntime } from "./companionFrameRuntime.js";

export function createCompanionFrameRuntimeBundle({
  audio = {},
  controls = {},
  createEncounterRuntime = createCompanionEncounterRuntime,
  createFrameRuntime = createCompanionFrameRuntime,
  rendering = {},
  session = {},
  callbacks = {},
  config = {},
  runtimes = {}
} = {}) {
  const {
    beeFieldRuntime = {},
    buildBlockRuntime = {},
    bulbasaurWorkbenchGuideRuntime = null,
    companionAbilityResourcesRuntime = {},
    companionFollowMovementRuntime = null,
    companionGroundPatrolFrameRuntime = {},
    companionIdleMotionRuntime = null,
    companionModelSyncRuntime = {},
    companionRepairBoxModelRuntime = {},
    constructionHelperMotionRuntime = null,
    fireRuntime = {},
    gameplayDialogue = {},
    leafageRuntime = {},
    leafDenConstructionPresentationRuntime = {},
    repairBoxRevealOpeningRuntime = null,
    squirtleReassemblyRuntime = {},
    waterGunRuntime = {},
    waterGunSfxBurstRuntime = {}
  } = runtimes;
  const {
    isGameplayActive = () => false
  } = callbacks;
  const {
    bulbasaurModelFaceYawOffset,
    charmanderFollowDistance,
    charmanderFollowSpeed,
    charmanderModelFaceYawOffset,
    guidePosition = null,
    timburrFollowDistance,
    timburrFollowSpeed,
    timburrModelFaceYawOffset
  } = config;

  const companionEncounterRuntime = createEncounterRuntime({
    session,
    controls,
    repairBoxRevealOpeningRuntime,
    bulbasaurWorkbenchGuideRuntime,
    companionModelSyncRuntime,
    companionIdleMotionRuntime,
    constructionHelperMotionRuntime,
    companionFollowMovementRuntime,
    callbacks: {
      isLeafDenConstructionActive: leafDenConstructionPresentationRuntime.isActive
    },
    config: {
      bulbasaurModelFaceYawOffset,
      charmanderModelFaceYawOffset,
      timburrModelFaceYawOffset,
      charmanderFollowSpeed,
      charmanderFollowDistance,
      timburrFollowSpeed,
      timburrFollowDistance
    }
  });

  const companionFrameRuntime = createFrameRuntime({
    session,
    controls,
    rendering,
    audio,
    guidePosition,
    callbacks: {
      isDialogueActive: () => gameplayDialogue.isActive?.() || false,
      isGameplayActive,
      getRepairBoxInvestigationTarget: () => companionRepairBoxModelRuntime.getInvestigationTarget?.({
        encounter: session.bulbasaurEncounter,
        flags: controls.storyState?.flags,
        groundGrassPatches: session.groundGrassPatches
      }) || null,
      isWaterGunSfxBurstActive: (nowSeconds) =>
        waterGunSfxBurstRuntime.isActive?.(nowSeconds) || false,
      updateBulbasaurRepairBoxRustle: (deltaTime) =>
        companionRepairBoxModelRuntime.updateRepairBoxRustle?.(
          session.bulbasaurEncounter,
          deltaTime
        ),
      updateBulbasaurEncounter: (...args) => companionEncounterRuntime.updateBulbasaur(...args),
      updateCharmanderEncounter: (...args) => companionEncounterRuntime.updateCharmander(...args),
      updateCharmanderFireAction: (deltaTime) => fireRuntime.updateAction?.(deltaTime),
      updateTimburrEncounter: (...args) => companionEncounterRuntime.updateTimburr(...args),
      updateTimburrBuildBlockAction: (deltaTime, now) =>
        buildBlockRuntime.updateAction?.(deltaTime, now),
      syncCompanionRepairModules: () => companionModelSyncRuntime.syncRepairModules?.(),
      syncBeeFieldRepairBox: () => beeFieldRuntime.syncRepairBox?.(),
      syncBeeFieldBees: (deltaTime) => beeFieldRuntime.syncBees?.(deltaTime),
      updateSquirtleReassembly: (deltaTime) => squirtleReassemblyRuntime.update?.(deltaTime),
      updateSquirtleWaterStamina: (deltaTime) =>
        companionAbilityResourcesRuntime.updateSquirtleWaterStamina?.(deltaTime),
      updateCharmanderCarbonEnergy: (deltaTime) =>
        companionAbilityResourcesRuntime.updateCharmanderCarbonEnergy?.(deltaTime),
      updateSquirtleWaterGunAction: (deltaTime) => waterGunRuntime.updateAction?.(deltaTime),
      updateBulbasaurLeafageAction: (deltaTime) => leafageRuntime.updateAction?.(deltaTime),
      updateSquirtleIdlePatrol: (deltaTime, frameState) =>
        companionGroundPatrolFrameRuntime.updateSquirtle?.(deltaTime, frameState),
      updateBulbasaurIdlePatrol: (deltaTime, frameState) =>
        companionGroundPatrolFrameRuntime.updateBulbasaur?.(deltaTime, frameState)
    }
  });

  return {
    companionEncounterRuntime,
    companionFrameRuntime
  };
}
