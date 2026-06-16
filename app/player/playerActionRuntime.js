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
