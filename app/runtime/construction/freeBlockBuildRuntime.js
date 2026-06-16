import { resolveFreeBlockTargetCell } from "../../gameplay/freeBlockBuildSystem.js";
import { createGridSystem } from "../../gameplay/gridBuildingSystem.js";
import { createUnavailableFoundationBuildZoneValidation } from "./foundationBuildZone.js";
import {
  applyFreeBlockPlacementResult,
  applyTimburrBuildBlockImpact,
  movePlayerAwayFromPlacedFreeBlock,
  tryPlaceFreeBlockFromBuildInput
} from "./freeBlockPlacementResult.js";
import {
  getFreeBlockPreviewTarget,
  resolveFreeBlockBuildTarget,
  syncFreeBlockBuildPreview
} from "./freeBlockPreview.js";
import { tryRemoveNearbyFreeBlock } from "./freeBlockRemoval.js";
import {
  getFreeBlockCellWorldPosition as getFreeBlockCellWorldPositionWithGrid
} from "./placementGeometry.js";

export function createFreeBlockBuildRuntime({
  session = null,
  controls = null,
  freeBlockBuildSessionRuntime = null,
  foundationBuildZoneRuntime = null,
  companionConstructionBlockerRuntime = null,
  playerModelRuntime = null,
  groundActionFeedbackRuntime = null,
  config = {},
  callbacks = {}
} = {}) {
  const targetSession = session || {};
  const targetControls = controls || {};
  const wallBlockType = config.wallBlockType || "wall";

  function getGridConfig() {
    return freeBlockBuildSessionRuntime?.getGridConfig?.() || null;
  }

  function createRuntimeGridSystem() {
    return createGridSystem(getGridConfig());
  }

  function getController() {
    return freeBlockBuildSessionRuntime?.getController?.() || null;
  }

  function getCellWorldPosition(cell, gridSystem = createRuntimeGridSystem()) {
    return getFreeBlockCellWorldPositionWithGrid({
      cell,
      gridSystem
    });
  }

  function buildFeedbackGroundCell(result) {
    return freeBlockBuildSessionRuntime?.buildFeedbackGroundCell?.({ result }) || null;
  }

  function syncSnapshot() {
    return freeBlockBuildSessionRuntime?.syncSnapshot?.() || null;
  }

  function movePlayerAway(targetCell, playerPosition = null) {
    return movePlayerAwayFromPlacedFreeBlock({
      playerCharacter: targetSession.playerCharacter,
      targetCell,
      playerPosition,
      gridSystem: createRuntimeGridSystem(),
      resolveDisplacementPosition: callbacks.resolveDisplacementPosition,
      isBlocked: companionConstructionBlockerRuntime?.isBlocked,
      syncPlayerModel: () => playerModelRuntime?.sync?.(targetSession, 0)
    });
  }

  function handlePlacementResult(result, now) {
    return applyFreeBlockPlacementResult({
      result,
      feedbackGroundCell: buildFeedbackGroundCell(result),
      now,
      wallBlockType,
      actions: {
        triggerFeedback: (...args) => groundActionFeedbackRuntime?.triggerFeedback?.(...args),
        markFirstFreeBlockPlaced: () => {
          if (targetControls.storyState?.flags) {
            targetControls.storyState.flags.firstFreeBlockPlaced = true;
          }
        },
        onFoundationWallBuilt: (event) => targetControls.onFoundationWallBuilt?.(event),
        syncFoundationCompletionEffects: foundationBuildZoneRuntime?.syncCompletionEffects,
        syncFreeBlockBuildSnapshot: syncSnapshot,
        playPlacedSound: callbacks.playPlacedSound,
        playInvalidSound: callbacks.playInvalidSound,
        pushNotice: callbacks.pushNotice
      }
    });
  }

  function buildPlacement(playerPosition = targetSession.playerCharacter?.getPosition?.()) {
    return {
      buildZoneUnavailable: Boolean(foundationBuildZoneRuntime?.isBuildZoneUnavailable?.()),
      blockType: wallBlockType,
      playerPosition,
      playerYaw: targetSession.playerModelInstance?.yaw,
      inventory: targetControls.inventory,
      getBuildZone: foundationBuildZoneRuntime?.getActiveBuildZone,
      canStack: foundationBuildZoneRuntime?.canStack
    };
  }

  function tryPlaceFromBuildInput(now) {
    return tryPlaceFreeBlockFromBuildInput({
      controller: getController(),
      placement: buildPlacement(),
      effects: {
        movePlayerAway,
        handlePlacementResult
      },
      now
    });
  }

  function resolveBuildTarget(playerPosition = null) {
    const gridSystem = createRuntimeGridSystem();
    const playerYaw = targetSession.playerModelInstance?.yaw;
    return resolveFreeBlockBuildTarget({
      controller: getController(),
      gridSystem,
      playerPosition,
      playerYaw,
      buildZone: foundationBuildZoneRuntime?.getActiveBuildZone?.(),
      allowStacking: Boolean(foundationBuildZoneRuntime?.canStack?.()),
      inventory: targetControls.inventory,
      buildZoneUnavailable: Boolean(foundationBuildZoneRuntime?.isBuildZoneUnavailable?.()),
      resolveRawTargetCell: () => resolveFreeBlockTargetCell({
        gridSystem,
        playerPosition,
        playerYaw
      }),
      resolveUnavailableValidation: ({ targetCell }) =>
        createUnavailableFoundationBuildZoneValidation({ targetCell }),
      resolveTargetPosition: getCellWorldPosition,
      getConstructionColliders: callbacks.getTerrainColliders,
      isPositionInsideCollider: callbacks.isPositionInsideCollider,
      buildState: targetSession.freeBlockBuildState,
      resolvePreviewValidity: callbacks.resolvePreviewValidity
    });
  }

  function getPreviewTarget(playerPosition = null) {
    return getFreeBlockPreviewTarget({
      action: targetSession.timburrBuildBlockAction,
      playerPosition,
      resolveTarget: resolveBuildTarget
    });
  }

  function syncPreview({ active, playerPosition, nowSeconds = 0 } = {}) {
    return syncFreeBlockBuildPreview({
      instance: targetSession.freeBlockPreviewInstance,
      active,
      playerPosition,
      nowSeconds,
      getTarget: getPreviewTarget,
      createGridSystem: createRuntimeGridSystem
    });
  }

  function applyTimburrImpact(action, now) {
    const playerPosition = targetSession.playerCharacter?.getPosition?.();
    return applyTimburrBuildBlockImpact({
      action,
      controller: getController(),
      placement: buildPlacement(playerPosition),
      effects: {
        movePlayerAway,
        handlePlacementResult
      },
      now
    });
  }

  function tryRemoveNearby(playerPosition, now) {
    return tryRemoveNearbyFreeBlock({
      playerPosition,
      freeBlockInstances: targetSession.freeBlockInstances,
      inventory: targetControls.inventory,
      getController,
      getWoodDrops: () => {
        targetSession.woodDrops ||= [];
        return targetSession.woodDrops;
      },
      buildFeedbackGroundCell,
      now,
      dropSize: config.dropSize,
      pickupRadius: config.pickupRadius,
      spread: config.spread,
      actions: {
        syncSnapshot,
        triggerFeedback: (...args) => groundActionFeedbackRuntime?.triggerFeedback?.(...args),
        playImpactSound: callbacks.playImpactSound,
        pushNotice: callbacks.pushNotice
      }
    });
  }

  return {
    applyTimburrImpact,
    buildFeedbackGroundCell,
    getCellWorldPosition,
    getController,
    getGridConfig,
    getPreviewTarget,
    movePlayerAway,
    resolveBuildTarget,
    syncPreview,
    syncSnapshot,
    handlePlacementResult,
    tryPlaceFromBuildInput,
    tryRemoveNearby
  };
}
