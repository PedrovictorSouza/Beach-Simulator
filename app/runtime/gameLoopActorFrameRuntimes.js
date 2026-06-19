import {
  createGameLoopCompanionFrameRuntimeBundle
} from "./gameLoopCompanionFrame.js";
import { createGameLoopPlayerFrameRuntimeBundle } from "./gameLoopPlayerFrame.js";

export function createGameLoopActorFrameRuntimeBundle({
  audio,
  camera,
  cameraOrbit,
  cameraZoomPresetController,
  controls,
  gameFlowValues,
  gameplay,
  gameplayDialogue,
  hud,
  isGameFlow,
  rendering,
  session,
  callbacks = {},
  math = {},
  runtimes = {},
  createCompanionFrameRuntime =
    createGameLoopCompanionFrameRuntimeBundle,
  createPlayerFrameRuntime = createGameLoopPlayerFrameRuntimeBundle
} = {}) {
  const {
    playSoundEvent,
    pushSupplyResourceCollectFeedback,
    queueSupplyPickupFlyItems
  } = callbacks;
  const {
    moveValueToward,
    rotateAngleToward
  } = math;
  const playerFrameRuntimeBundle = createPlayerFrameRuntime({
    audio,
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls,
    gameplay,
    hud,
    session,
    runtimes: {
      companionFollowDirectionRuntime: runtimes.companionFollowDirectionRuntime,
      gearPickupParticleRuntime: runtimes.gearPickupParticleRuntime,
      movementQuestRuntime: runtimes.movementQuestRuntime,
      runBreadcrumbPromptRuntime: runtimes.runBreadcrumbPromptRuntime,
      supplyCounterPromptController: runtimes.supplyCounterPromptController,
      woodCollectPopRuntime: runtimes.woodCollectPopRuntime
    },
    callbacks: {
      playSoundEvent,
      pushSupplyResourceCollectFeedback,
      queueSupplyPickupFlyItems
    },
    math: {
      moveValueToward,
      rotateAngleToward
    }
  });

  const companionFrameRuntimeBundle = createCompanionFrameRuntime({
    session,
    controls,
    rendering,
    audio,
    gameFlowValues,
    isGameFlow,
    runtimes: {
      beeFieldRuntime: runtimes.beeFieldRuntime,
      buildBlockRuntime: runtimes.buildBlockRuntime,
      bulbasaurWorkbenchGuideRuntime: runtimes.bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime:
        runtimes.companionAbilityResourcesRuntime,
      companionFollowMovementRuntime: runtimes.companionFollowMovementRuntime,
      companionGroundPatrolFrameRuntime:
        runtimes.companionGroundPatrolFrameRuntime,
      companionIdleMotionRuntime: runtimes.companionIdleMotionRuntime,
      companionModelSyncRuntime: runtimes.companionModelSyncRuntime,
      companionRepairBoxModelRuntime: runtimes.companionRepairBoxModelRuntime,
      constructionHelperMotionRuntime: runtimes.constructionHelperMotionRuntime,
      fireRuntime: runtimes.fireRuntime,
      gameplayDialogue,
      leafageRuntime: runtimes.leafageRuntime,
      leafDenConstructionPresentationRuntime:
        runtimes.leafDenConstructionPresentationRuntime,
      repairBoxRevealOpeningRuntime: runtimes.repairBoxRevealOpeningRuntime,
      squirtleReassemblyRuntime: runtimes.squirtleReassemblyRuntime,
      waterGunRuntime: runtimes.waterGunRuntime,
      waterGunSfxBurstRuntime: runtimes.waterGunSfxBurstRuntime
    }
  });

  return {
    ...playerFrameRuntimeBundle,
    ...companionFrameRuntimeBundle
  };
}
