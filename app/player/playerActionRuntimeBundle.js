import { createPlayerActionContext } from "./playerActionContext.js";
import {
  createPlayerActionFrameRuntime,
  createPlayerActionRuntime,
  createPlayerDirectActionRuntime,
  createPlayerHarvestActionRuntime,
  createPlayerHeldWaterGunActionRuntime,
  createPlayerPrimaryActionFallbackRuntime,
  createPlayerPrimaryActionFrameRuntime,
  createPlayerPrimaryActionRuntime,
  createPlayerPrimaryFieldMoveActionRuntime
} from "./playerActionRuntime.js";
import { createPlayerActionTargetContext } from "./playerActionTargetContext.js";

export function createPlayerActionRuntimeBundle({
  controls = {},
  session = {},
  gameplay = {},
  runtimes = {},
  callbacks = {},
  soundEventIds = {},
  notices = {},
  config = {}
} = {}) {
  const playerActionContext = createPlayerActionContext({
    session,
    controls
  });
  const playerActionTargetContext = createPlayerActionTargetContext({
    session,
    controls
  });
  const playerActionRuntime = createPlayerActionRuntime({
    session,
    controls,
    gameplay,
    freeBlockBuildRuntime: runtimes.freeBlockBuildRuntime,
    callbacks: {
      debugInteractionFlow: callbacks.debugInteractionFlow,
      findNearbyDestroyableInstantiatedObject:
        callbacks.findNearbyDestroyableInstantiatedObject,
      getNowMs: callbacks.getNowMs,
      playSoundEvent: callbacks.playSoundEvent,
      pushNotice: callbacks.pushNotice,
      queueLandscapeCutEffect: callbacks.queueLandscapeCutEffect,
      queueTreeRevivalLeafBurst: callbacks.queueTreeRevivalLeafBurst
    },
    soundEventIds,
    notices: {
      noRemovablePatch: notices.noRemovablePatch
    }
  });
  const playerHarvestActionRuntime = createPlayerHarvestActionRuntime({
    controls,
    playerActionContext,
    playerActionRuntime,
    playerCounterPromptRuntime: runtimes.playerCounterPromptRuntime,
    supplyCounterPromptController: runtimes.supplyCounterPromptController,
    companionAbilityResourcesRuntime: runtimes.companionAbilityResourcesRuntime,
    groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
    callbacks: {
      playTreeBirthSfx: callbacks.playTreeBirthSfx,
      queueChangedSupplyPickupFlyItems: callbacks.queueChangedSupplyPickupFlyItems
    },
    config: {
      restoredGrassMissionTargetCount: config.restoredGrassMissionTargetCount,
      treeRevivalTargetCount: config.treeRevivalTargetCount
    }
  });
  const playerDirectActionRuntime = createPlayerDirectActionRuntime({
    controls,
    session,
    playerActionContext,
    playerActionRuntime,
    callbacks: {
      debugInteractionFlow: callbacks.debugInteractionFlow,
      onNpcInteractionStart: callbacks.onNpcInteractionStart,
      playSoundEvent: callbacks.playSoundEvent
    },
    soundEventIds
  });
  const playerHeldWaterGunActionRuntime = createPlayerHeldWaterGunActionRuntime({
    controls,
    session,
    gameplay,
    playerActionTargetContext,
    waterGunRuntime: runtimes.waterGunRuntime,
    companionAbilityResourcesRuntime: runtimes.companionAbilityResourcesRuntime,
    callbacks: {
      triggerWaterGunSfxBurst: callbacks.triggerWaterGunSfxBurst
    }
  });
  const playerPrimaryActionFallbackRuntime = createPlayerPrimaryActionFallbackRuntime({
    groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
    fieldMoveInvalidTargetPromptRuntime: runtimes.fieldMoveInvalidTargetPromptRuntime,
    callbacks: {
      playSoundEvent: callbacks.playSoundEvent
    },
    soundEventIds
  });
  const playerPrimaryFieldMoveActionRuntime = createPlayerPrimaryFieldMoveActionRuntime({
    buildBlockRuntime: runtimes.buildBlockRuntime,
    waterGunRuntime: runtimes.waterGunRuntime,
    leafageRuntime: runtimes.leafageRuntime,
    fireRuntime: runtimes.fireRuntime,
    fieldMoveInvalidTargetPromptRuntime: runtimes.fieldMoveInvalidTargetPromptRuntime,
    companionAbilityResourcesRuntime: runtimes.companionAbilityResourcesRuntime,
    callbacks: {
      getFreeBlockInvalidPlacementNotice: callbacks.getFreeBlockInvalidPlacementNotice,
      markWaterGunFirstUsePrompt: callbacks.markWaterGunFirstUsePrompt,
      playSoundEvent: callbacks.playSoundEvent,
      pushNotice: callbacks.pushNotice,
      setActiveMoveId: callbacks.setActiveMoveId,
      triggerWaterGunSfxBurst: callbacks.triggerWaterGunSfxBurst
    },
    soundEventIds,
    notices: {
      buildLocked: notices.buildLocked,
      buildUnavailable: notices.buildUnavailable,
      missingMaterial: notices.missingMaterial
    }
  });
  const playerPrimaryActionRuntime = createPlayerPrimaryActionRuntime({
    workbenchRotationRuntime: runtimes.workbenchRotationRuntime,
    playerActionRuntime,
    playerActionContext,
    playerPrimaryActionFallbackRuntime,
    playerPrimaryFieldMoveActionRuntime,
    callbacks: {
      isBusyCompanionTarget: callbacks.isBusyCompanionTarget,
      onNpcInteractionStart: callbacks.onNpcInteractionStart,
      pushNotice: callbacks.pushNotice
    },
    notices: {
      leafDenBusy: notices.leafDenBusy
    }
  });
  const playerPrimaryActionFrameRuntime = createPlayerPrimaryActionFrameRuntime({
    controls,
    session,
    gameplay,
    playerActionTargetContext,
    workbenchRotationRuntime: runtimes.workbenchRotationRuntime,
    playerPrimaryActionRuntime,
    groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
    callbacks: {
      findAlreadyResolvedFieldMoveGroundCell: callbacks.findAlreadyResolvedFieldMoveGroundCell,
      findNearbyDestroyableInstantiatedObject:
        callbacks.findNearbyDestroyableInstantiatedObject,
      markWaterGunFirstUsePrompt: callbacks.markWaterGunFirstUsePrompt,
      playSoundEvent: callbacks.playSoundEvent
    },
    soundEventIds
  });
  const playerActionFrameRuntime = createPlayerActionFrameRuntime({
    controls,
    session,
    playerHarvestActionRuntime,
    playerPrimaryActionFrameRuntime,
    playerHeldWaterGunActionRuntime,
    playerDirectActionRuntime,
    constructionPlacementControlRuntime: runtimes.constructionPlacementControlRuntime,
    bulbasaurWorkbenchGuideRuntime: runtimes.bulbasaurWorkbenchGuideRuntime,
    callbacks: {
      resolveGameplayActionPermission: callbacks.resolveGameplayActionPermission
    }
  });

  return {
    playerActionContext,
    playerActionFrameRuntime,
    playerActionRuntime,
    playerActionTargetContext
  };
}
