import { getDestroyableLandscapePatchForInteractOptions } from "../runtime/fieldMoveRuntime/destroyableLandscapePatchTarget.js";
import {
  getGardenProgressSnapshot,
  getTreeRevivalSnapshot
} from "../runtime/fieldMoveRuntime/natureProgressSnapshots.js";

const DEFAULT_NO_REMOVABLE_PATCH_NOTICE =
  "No removable patch here. Move closer to planted grass or flowers.";

export function createPlayerActionRuntime({
  session = {},
  controls = {},
  gameplay = {},
  freeBlockBuildRuntime = null,
  callbacks = {},
  soundEventIds = {},
  notices = {}
} = {}) {
  const noRemovablePatchNotice =
    notices.noRemovablePatch || DEFAULT_NO_REMOVABLE_PATCH_NOTICE;

  function getDestroyableLandscapePatch(options = {}) {
    return getDestroyableLandscapePatchForInteractOptions({
      findNearbyDestroyableInstantiatedObject:
        callbacks.findNearbyDestroyableInstantiatedObject,
      playerPosition: options.playerPosition,
      session: {
        groundGrassPatches: options.groundGrassPatches || [],
        groundFlowerPatches: options.groundFlowerPatches || []
      },
      storyState: options.storyState
    });
  }

  function performHarvest(options, autosaveContext = {}) {
    const treeRevivalSnapshot = getTreeRevivalSnapshot({
      session,
      storyState: controls.storyState
    });
    const beforeGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });
    const result = gameplay.performHarvestAction?.(options);
    const afterGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });

    if (result) {
      callbacks.queueTreeRevivalLeafBurst?.(treeRevivalSnapshot);
    }

    if (result && afterGardenProgress !== beforeGardenProgress) {
      const groundCell =
        autosaveContext.groundCell ||
        options?.forcedHarvestTarget?.groundCell ||
        options?.forcedHarvestTarget?.leafageGroundCell ||
        options?.forcedHarvestTarget?.fireGroundCell ||
        null;

      controls.onGardenProgressChanged?.({
        actionType: autosaveContext.actionType || null,
        groundCellId: typeof groundCell?.id === "string" ? groundCell.id : null
      });
    }

    return result;
  }

  function performInteract(options) {
    const cutEffectPatch = getDestroyableLandscapePatch(options);
    const beforeGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });
    const result = gameplay.performInteractAction?.(options);
    const afterGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });

    if (result && cutEffectPatch && afterGardenProgress !== beforeGardenProgress) {
      callbacks.queueLandscapeCutEffect?.(cutEffectPatch);
      controls.onGardenProgressChanged?.({
        actionType: "destroyLandscape",
        groundCellId: typeof cutEffectPatch.cellId === "string" ? cutEffectPatch.cellId : null
      });
    }

    return result;
  }

  function performDestroy(options) {
    callbacks.debugInteractionFlow?.("gameLoop.destroyAction.start", {
      playerPosition: options?.playerPosition
    });
    const nowMs =
      typeof callbacks.getNowMs === "function" ?
        callbacks.getNowMs() :
        Date.now();
    if (freeBlockBuildRuntime?.tryRemoveNearby?.(options?.playerPosition, nowMs)) {
      return true;
    }

    const cutEffectPatch = getDestroyableLandscapePatch(options);
    if (!cutEffectPatch) {
      callbacks.playSoundEvent?.(soundEventIds.UI_CANCEL);
      callbacks.pushNotice?.(noRemovablePatchNotice);
      return false;
    }

    const result = performInteract({
      ...options,
      allowDestroyInstantiatedObject: true
    });
    callbacks.playSoundEvent?.(
      result ? soundEventIds.GAMEPLAY_IMPACT : soundEventIds.UI_CANCEL
    );
    return result;
  }

  return {
    getDestroyableLandscapePatch,
    performDestroy,
    performHarvest,
    performInteract
  };
}

export function createPlayerHarvestActionRuntime({
  controls = {},
  playerActionContext = {},
  playerActionRuntime = {},
  playerCounterPromptRuntime = {},
  supplyCounterPromptController = {},
  companionAbilityResourcesRuntime = {},
  groundActionFeedbackRuntime = {},
  callbacks = {},
  config = {}
} = {}) {
  const restoredGrassMissionTargetCount = Number(
    config.restoredGrassMissionTargetCount || 0
  );
  const treeRevivalTargetCount = Number(config.treeRevivalTargetCount || 0);

  function getActionType(options = {}) {
    if (options.useWaterGun) {
      return "waterGun";
    }
    if (options.useFire) {
      return "fire";
    }
    if (options.useLeafage) {
      return "leafage";
    }
    return "harvest";
  }

  function perform({
    playerPosition,
    options = {},
    now = 0,
    waterGunEquipped = false,
    leafageEquipped = false,
    fireEquipped = false
  } = {}) {
    const previousWateredTreeCount = Number(
      controls.storyState?.flags?.wateredTreeCount || 0
    );
    const previousRestoredGrassCount = Number(
      controls.storyState?.flags?.restoredGrassCount || 0
    );
    const previousSupplyCounts = supplyCounterPromptController.snapshot?.(
      controls.inventory
    );
    const result = playerActionRuntime.performHarvest?.(
      playerActionContext.getHarvestOptions?.({
        playerPosition,
        waterGunEquipped,
        leafageEquipped,
        fireEquipped,
        options
      }),
      { actionType: getActionType(options) }
    );

    const nextWateredTreeCount = Number(
      controls.storyState?.flags?.wateredTreeCount || 0
    );
    const nextRestoredGrassCount = Number(
      controls.storyState?.flags?.restoredGrassCount || 0
    );
    if (
      result &&
      options.useWaterGun &&
      nextRestoredGrassCount > previousRestoredGrassCount
    ) {
      playerCounterPromptRuntime.triggerQuestCounter?.({
        count: nextRestoredGrassCount,
        total: restoredGrassMissionTargetCount,
        label: "dry grass",
        now
      });
    } else if (
      result &&
      options.useWaterGun &&
      nextWateredTreeCount > previousWateredTreeCount
    ) {
      callbacks.playTreeBirthSfx?.();
      playerCounterPromptRuntime.triggerQuestCounter?.({
        count: nextWateredTreeCount,
        total: treeRevivalTargetCount,
        label: "trees",
        now
      });
    } else if (result) {
      callbacks.queueChangedSupplyPickupFlyItems?.(
        previousSupplyCounts,
        controls.inventory
      );
      supplyCounterPromptController.triggerChanged?.(
        previousSupplyCounts,
        controls.inventory,
        now
      );
    }

    if (result && options.useWaterGun) {
      companionAbilityResourcesRuntime.recordSquirtleWaterGunUse?.();
    }

    if (result && options.useFire && options.forcedHarvestTarget?.fireGroundCell) {
      groundActionFeedbackRuntime.triggerFeedback?.(
        options.forcedHarvestTarget.fireGroundCell,
        "fire",
        now
      );
    }

    return result;
  }

  return {
    perform
  };
}

export function createPlayerDirectActionRuntime({
  controls = {},
  session = {},
  playerActionContext = {},
  playerActionRuntime = {},
  callbacks = {},
  soundEventIds = {}
} = {}) {
  function getPlayerPosition() {
    return session.playerCharacter?.getPosition?.();
  }

  function update({ canProcessGameplayAction = false } = {}) {
    const canProcessDestroyAction = canProcessGameplayAction;
    const destroyActionRequested = controls.consumeDestroyActionRequest?.();

    callbacks.debugInteractionFlow?.("gameLoop.destroyAction.input", {
      canProcessDestroyAction,
      destroyActionRequested,
      playerPosition: getPlayerPosition()
    });

    if (canProcessDestroyAction && destroyActionRequested) {
      playerActionRuntime.performDestroy?.(
        playerActionContext.getDestroyOptions?.(getPlayerPosition())
      );
    }

    const interactRequested = controls.consumeInteractRequest?.();
    if (interactRequested && canProcessGameplayAction) {
      callbacks.playSoundEvent?.(soundEventIds.UI_CONFIRM);
      playerActionRuntime.performInteract?.(
        playerActionContext.getInteractOptions?.(
          getPlayerPosition(),
          { onNpcInteractionStart: callbacks.onNpcInteractionStart }
        )
      );
    }
  }

  return {
    update
  };
}

export function createPlayerPrimaryActionFallbackRuntime({
  groundActionFeedbackRuntime = {},
  fieldMoveInvalidTargetPromptRuntime = {},
  callbacks = {},
  soundEventIds = {}
} = {}) {
  function playCancel() {
    callbacks.playSoundEvent?.(soundEventIds.UI_CANCEL);
  }

  function tryBlockedFeedback({
    alreadyResolvedGroundCell = null,
    invalidFireUse = false,
    invalidLeafageUse = false,
    now,
    placementBlocked = false,
    repeatedFieldMove = false
  } = {}) {
    if (repeatedFieldMove) {
      playCancel();
      groundActionFeedbackRuntime.triggerInvalid?.(alreadyResolvedGroundCell, now);
      return true;
    }

    if (invalidLeafageUse) {
      playCancel();
      fieldMoveInvalidTargetPromptRuntime.triggerLeafage?.(now);
      return true;
    }

    if (invalidFireUse) {
      playCancel();
      fieldMoveInvalidTargetPromptRuntime.triggerFire?.(now);
      return true;
    }

    if (placementBlocked) {
      playCancel();
      return true;
    }

    return false;
  }

  function tryPlacementOrBagHarvest({
    isBagHarvest = false,
    isPlacement = false,
    performHarvestAction,
    playerPosition,
    primaryActionTarget = null
  } = {}) {
    if (isPlacement) {
      performHarvestAction?.(playerPosition, {
        allowLeafage: false
      });
      return true;
    }

    if (isBagHarvest) {
      performHarvestAction?.(playerPosition, {
        allowLeafage: false,
        allowFire: false,
        allowPlacement: false,
        forcedHarvestTarget: primaryActionTarget
      });
      return true;
    }

    return false;
  }

  function tryDefaultHarvestFallback({
    dialogueActive = false,
    gamepadPrimaryMoveRequested = false,
    performHarvestAction,
    playerPosition,
    primaryActionWantsFieldMove = false
  } = {}) {
    if (dialogueActive || primaryActionWantsFieldMove) {
      return false;
    }

    performHarvestAction?.(playerPosition, {
      allowLeafage: false,
      allowFire: false,
      allowPlacement: !gamepadPrimaryMoveRequested
    });
    return true;
  }

  return {
    tryBlockedFeedback,
    tryDefaultHarvestFallback,
    tryPlacementOrBagHarvest
  };
}

export function createPlayerPrimaryActionRuntime({
  workbenchRotationRuntime = {},
  playerActionRuntime = {},
  playerActionContext = {},
  playerPrimaryActionFallbackRuntime = {},
  playerPrimaryFieldMoveActionRuntime = {},
  callbacks = {},
  notices = {}
} = {}) {
  function update({
    buildBlockEquipped = false,
    dialogueActive = false,
    fireEquipped = false,
    gamepadPrimaryMoveRequested = false,
    lastBuildBlockInvalidReason = null,
    leafageAutoGrowTarget = null,
    leafageAutoWaterGunTarget = null,
    leafageEquipped = false,
    leafagePrimaryMoveRequested = false,
    now,
    performHarvestAction,
    playerPosition,
    primaryActionAlreadyResolvedGroundCell = null,
    primaryActionBagDestroyTarget = null,
    primaryActionConfirmsRotation = false,
    primaryActionIntent = {},
    primaryActionInvalidFireUse = false,
    primaryActionInvalidLeafageUse = false,
    primaryActionIsBagHarvest = false,
    primaryActionIsMove = false,
    primaryActionIsPlacement = false,
    primaryActionPlacementBlocked = false,
    primaryActionRepeatedFieldMove = false,
    primaryActionRotationTarget = null,
    primaryActionTarget = null,
    primaryActionWantsFieldMove = false,
    primaryInteractTarget = null,
    waterGunEquipped = false
  } = {}) {
    if (primaryActionConfirmsRotation) {
      workbenchRotationRuntime.confirmSelectedTargetWithFeedback?.();
    } else if (primaryActionRotationTarget) {
      workbenchRotationRuntime.selectTargetWithFeedback?.(primaryActionRotationTarget);
    } else if (primaryActionBagDestroyTarget?.target) {
      playerActionRuntime.performDestroy?.(
        playerActionContext.getDestroyOptions?.(playerPosition)
      );
    } else if (playerPrimaryFieldMoveActionRuntime.tryAutoTargetAction?.({
      leafageAutoWaterGunTarget,
      leafageAutoGrowTarget,
      performHarvestAction,
      playerPosition
    })) {
      return;
    } else if (playerPrimaryActionFallbackRuntime.tryBlockedFeedback?.({
      alreadyResolvedGroundCell: primaryActionAlreadyResolvedGroundCell,
      invalidFireUse: primaryActionInvalidFireUse,
      invalidLeafageUse: primaryActionInvalidLeafageUse,
      now,
      placementBlocked: primaryActionPlacementBlocked,
      repeatedFieldMove: primaryActionRepeatedFieldMove
    })) {
      return;
    } else if (playerPrimaryActionFallbackRuntime.tryPlacementOrBagHarvest?.({
      isBagHarvest: primaryActionIsBagHarvest,
      isPlacement: primaryActionIsPlacement,
      performHarvestAction,
      playerPosition,
      primaryActionTarget
    })) {
      return;
    } else if (primaryActionIsMove && !dialogueActive) {
      playerPrimaryFieldMoveActionRuntime.update?.({
        buildBlockEquipped,
        fireEquipped,
        lastBuildBlockInvalidReason,
        leafageEquipped,
        leafagePrimaryMoveRequested,
        performHarvestAction,
        playerPosition,
        primaryActionIntent,
        primaryActionTarget,
        primaryActionWantsFieldMove,
        waterGunEquipped
      });
    } else if (callbacks.isBusyCompanionTarget?.(primaryInteractTarget?.target)) {
      callbacks.pushNotice?.(notices.leafDenBusy);
    } else if (primaryInteractTarget?.target) {
      playerActionRuntime.performInteract?.(
        playerActionContext.getInteractOptions?.(
          playerPosition,
          { onNpcInteractionStart: callbacks.onNpcInteractionStart }
        )
      );
    } else {
      playerPrimaryActionFallbackRuntime.tryDefaultHarvestFallback?.({
        dialogueActive,
        gamepadPrimaryMoveRequested,
        performHarvestAction,
        playerPosition,
        primaryActionWantsFieldMove
      });
    }
  }

  return {
    update
  };
}

function isHeldWaterGunFlowBlocked(flowState = {}) {
  const {
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    skillLearnActive = false,
    scriptedInteractionActive = false,
    dialogueActive = false
  } = flowState;

  return Boolean(
    cinematicActive ||
    tutorialActive ||
    pokedexModalOpen ||
    skillLearnActive ||
    scriptedInteractionActive ||
    dialogueActive
  );
}

function isHeldWaterGunInstantTarget(target) {
  return Boolean(
    target?.leppaTree?.action === "water" ||
    target?.leppaTree?.action === "headbutt" ||
    target?.palm
  );
}

export function createPlayerHeldWaterGunActionRuntime({
  controls = {},
  session = {},
  gameplay = {},
  playerActionTargetContext = {},
  waterGunRuntime = {},
  companionAbilityResourcesRuntime = {},
  callbacks = {}
} = {}) {
  function update({
    flowState = {},
    performHarvestAction,
    waterGunEquipped = false
  } = {}) {
    if (
      !controls.isPrimaryActionActive?.() ||
      !waterGunEquipped ||
      !session.playerCharacter ||
      isHeldWaterGunFlowBlocked(flowState)
    ) {
      return;
    }

    const playerPosition = session.playerCharacter.getPosition();
    const waterGunTarget = gameplay.findNearbyActionTarget(
      playerActionTargetContext.getNearbyActionTargetOptions({
        playerPosition,
        canPurifyGround: true,
        canUseLeafage: false,
        allowPlacement: false,
        includeIceGroundInstances: false
      })
    );

    if (waterGunTarget?.groundCell) {
      const squirtleWaterGunResult = waterGunRuntime.startAction({
        groundCell: waterGunTarget.groundCell,
        playerPosition
      });

      if (squirtleWaterGunResult === "unavailable") {
        callbacks.triggerWaterGunSfxBurst?.();
        performHarvestAction?.(playerPosition, {
          useWaterGun: true,
          forcedHarvestTarget: waterGunTarget
        });
      }
    } else if (isHeldWaterGunInstantTarget(waterGunTarget)) {
      if (companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction()) {
        callbacks.triggerWaterGunSfxBurst?.();
        performHarvestAction?.(playerPosition, {
          forcedHarvestTarget: waterGunTarget,
          useWaterGun: true
        });
      }
    }
  }

  return {
    update
  };
}

export function createPlayerPrimaryFieldMoveActionRuntime({
  buildBlockRuntime = {},
  waterGunRuntime = {},
  leafageRuntime = {},
  fireRuntime = {},
  fieldMoveInvalidTargetPromptRuntime = {},
  companionAbilityResourcesRuntime = {},
  callbacks = {},
  soundEventIds = {},
  notices = {}
} = {}) {
  function playCancel() {
    callbacks.playSoundEvent?.(soundEventIds.UI_CANCEL);
  }

  function handleBuildBlockResult(result, lastBuildBlockInvalidReason) {
    if (result === "locked") {
      playCancel();
      callbacks.pushNotice?.(notices.buildLocked);
    } else if (result === "unavailable") {
      playCancel();
      callbacks.pushNotice?.(notices.buildUnavailable);
    } else if (result === "invalid") {
      playCancel();
      callbacks.pushNotice?.(
        callbacks.getFreeBlockInvalidPlacementNotice?.(lastBuildBlockInvalidReason)
      );
    } else if (result === "missing-material") {
      playCancel();
      callbacks.pushNotice?.(notices.missingMaterial);
    } else if (result === "busy") {
      playCancel();
    }
  }

  function tryAutoTargetAction({
    leafageAutoWaterGunTarget = null,
    leafageAutoGrowTarget = null,
    performHarvestAction,
    playerPosition
  } = {}) {
    if (leafageAutoWaterGunTarget?.groundCell) {
      fieldMoveInvalidTargetPromptRuntime.resetLeafage?.();
      callbacks.setActiveMoveId?.("waterGun");
      callbacks.markWaterGunFirstUsePrompt?.();
      const squirtleWaterGunResult = waterGunRuntime.startAction?.({
        groundCell: leafageAutoWaterGunTarget.groundCell,
        playerPosition
      });

      if (squirtleWaterGunResult === "unavailable") {
        callbacks.triggerWaterGunSfxBurst?.();
        performHarvestAction?.(playerPosition, {
          useWaterGun: true,
          forcedHarvestTarget: leafageAutoWaterGunTarget
        });
      }
      return true;
    }

    if (leafageAutoGrowTarget?.leafageGroundCell) {
      fieldMoveInvalidTargetPromptRuntime.resetLeafage?.();
      callbacks.setActiveMoveId?.("leafage");
      const bulbasaurLeafageResult = leafageRuntime.startAction?.({
        groundCell: leafageAutoGrowTarget.leafageGroundCell,
        playerPosition
      });

      if (bulbasaurLeafageResult === "unavailable") {
        performHarvestAction?.(playerPosition, {
          useLeafage: true,
          forcedHarvestTarget: leafageAutoGrowTarget
        });
      }
      return true;
    }

    return false;
  }

  function update({
    buildBlockEquipped = false,
    fireEquipped = false,
    lastBuildBlockInvalidReason = null,
    leafageEquipped = false,
    leafagePrimaryMoveRequested = false,
    performHarvestAction,
    playerPosition,
    primaryActionIntent = {},
    primaryActionTarget = null,
    primaryActionWantsFieldMove = false,
    waterGunEquipped = false
  } = {}) {
    if (buildBlockEquipped && primaryActionWantsFieldMove) {
      const timburrBuildBlockResult = buildBlockRuntime.startAction?.({
        playerPosition
      });
      handleBuildBlockResult(timburrBuildBlockResult, lastBuildBlockInvalidReason);
    } else if (waterGunEquipped && primaryActionTarget?.groundCell) {
      const squirtleWaterGunResult = waterGunRuntime.startAction?.({
        groundCell: primaryActionTarget.groundCell,
        playerPosition
      });

      if (squirtleWaterGunResult === "unavailable") {
        callbacks.triggerWaterGunSfxBurst?.();
        performHarvestAction?.(playerPosition, {
          useWaterGun: true,
          forcedHarvestTarget: primaryActionTarget
        });
      }
    } else if (primaryActionIntent.isWaterGunTreeTarget) {
      if (companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction?.()) {
        callbacks.triggerWaterGunSfxBurst?.();
        performHarvestAction?.(playerPosition, {
          useWaterGun: true,
          forcedHarvestTarget: primaryActionTarget
        });
      }
    } else if (
      leafageEquipped &&
      leafagePrimaryMoveRequested &&
      primaryActionTarget?.leafageGroundCell
    ) {
      fieldMoveInvalidTargetPromptRuntime.resetLeafage?.();
      const bulbasaurLeafageResult = leafageRuntime.startAction?.({
        groundCell: primaryActionTarget.leafageGroundCell,
        playerPosition
      });

      if (bulbasaurLeafageResult === "unavailable") {
        performHarvestAction?.(playerPosition, {
          useLeafage: true,
          forcedHarvestTarget: primaryActionTarget
        });
      }
    } else if (fireEquipped && primaryActionTarget?.fireGroundCell) {
      fieldMoveInvalidTargetPromptRuntime.resetFire?.();
      const charmanderFireResult = fireRuntime.startAction?.({
        groundCell: primaryActionTarget.fireGroundCell,
        playerPosition
      });

      if (charmanderFireResult === "unavailable") {
        performHarvestAction?.(playerPosition, {
          useFire: true,
          forcedHarvestTarget: primaryActionTarget
        });
      }
    }
  }

  return {
    tryAutoTargetAction,
    update
  };
}
