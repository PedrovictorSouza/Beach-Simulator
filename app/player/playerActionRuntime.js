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
