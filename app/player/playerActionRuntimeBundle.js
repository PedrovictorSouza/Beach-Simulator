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

const DEFAULT_LEAF_DEN_BUSY_NOTICE = "im busy, boss...";
const DEFAULT_MISSING_MATERIAL_NOTICE = "Need Wood";
const DEFAULT_NO_REMOVABLE_PATCH_NOTICE =
  "No removable patch here. Move closer to planted grass or flowers.";
const DEFAULT_TREE_REVIVAL_TARGET_COUNT = 5;

export function createPlayerGameplayActionRuntimeBundle({
  controls = {},
  session = {},
  gameplay = {},
  hud = null,
  runtimes = {},
  callbacks = {},
  soundEventIds = {},
  botNames = {},
  notices = {},
  config = {}
} = {}) {
  const builderName = botNames.builder || "Builder";
  const triggerWaterGunSfxBurst =
    callbacks.triggerWaterGunSfxBurst ||
    ((duration = config.waterGunSprayDuration) => {
      runtimes.waterGunSfxBurstRuntime?.trigger?.(
        callbacks.getNowSeconds?.(),
        duration
      );
    });

  return createPlayerActionRuntimeBundle({
    controls,
    session,
    gameplay,
    runtimes,
    callbacks: {
      ...callbacks,
      markWaterGunFirstUsePrompt:
        callbacks.markWaterGunFirstUsePrompt ||
        (() => {
          const flag = config.waterGunFirstUsePromptFlag;
          if (flag) {
            controls.storyState ??= {};
            controls.storyState.flags ??= {};
            controls.storyState.flags[flag] = true;
          }
        }),
      pushNotice:
        callbacks.pushNotice ||
        ((notice) => hud?.pushNotice?.(notice)),
      setActiveMoveId:
        callbacks.setActiveMoveId ||
        ((moveId) => controls.setActiveMoveId?.(moveId)),
      triggerWaterGunSfxBurst
    },
    soundEventIds,
    notices: {
      ...notices,
      buildLocked:
        notices.buildLocked ||
        `${builderName} has not learned Build yet.`,
      buildUnavailable:
        notices.buildUnavailable ||
        `${builderName} needs to be nearby.`,
      leafDenBusy:
        notices.leafDenBusy ||
        config.leafDenBusyNotice ||
        DEFAULT_LEAF_DEN_BUSY_NOTICE,
      missingMaterial:
        notices.missingMaterial ||
        DEFAULT_MISSING_MATERIAL_NOTICE,
      noRemovablePatch:
        notices.noRemovablePatch ||
        DEFAULT_NO_REMOVABLE_PATCH_NOTICE
    },
    config: {
      ...config,
      treeRevivalTargetCount:
        config.treeRevivalTargetCount ||
        DEFAULT_TREE_REVIVAL_TARGET_COUNT
    }
  });
}

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
