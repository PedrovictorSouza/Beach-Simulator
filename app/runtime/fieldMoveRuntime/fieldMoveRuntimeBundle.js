import { canUseCharmanderFireWithCarbon } from "../../../world/gameplayInteractions.js";
import { createBuildBlockRuntime } from "./buildBlockRuntime.js";
import { createFireRuntime } from "./fireRuntime.js";
import { createLeafageRuntime } from "./leafageRuntime.js";
import { createWaterGunRuntime } from "./waterGunRuntime.js";

export function createFieldMoveRuntimeBundle({
  session = {},
  controls = {},
  runtimes = {},
  callbacks = {},
  botNames = {},
  modelFaceYawOffsets = {},
  notices = {}
} = {}) {
  const canUseFireWithCarbon =
    callbacks.canUseFireWithCarbon || canUseCharmanderFireWithCarbon;

  function hasFireCarbon() {
    if (!canUseFireWithCarbon({
      storyState: controls.storyState,
      inventory: controls.inventory
    })) {
      callbacks.pushNotice?.(
        `${botNames.thermal || "Thermal Bot"} needs Carbon to use Thermal Torch.`
      );
      return false;
    }

    return true;
  }

  const waterGunRuntime = createWaterGunRuntime({
    session,
    resources: runtimes.companionAbilityResourcesRuntime,
    getSquirtle: () => session.actTwoSquirtle,
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      runtimes.fieldMoveApproachPositionRuntime
        ?.getSquirtleWaterGunApproachPosition?.(
          targetPosition,
          playerPosition
        ),
    getModelYawToward: runtimes.companionFacingRuntime?.getSquirtleModelYawToward,
    tryMoveCompanionToPosition: runtimes.companionConstructionBlockerRuntime?.tryMove,
    isPositionBlocked: runtimes.companionConstructionBlockerRuntime?.isBlocked,
    syncSquirtle: () => runtimes.companionModelSyncRuntime?.syncSquirtle?.(),
    applyImpact: (action) =>
      runtimes.fieldMoveImpactRuntime?.applySquirtleWaterGunImpact?.(action),
    onBlocked: () =>
      runtimes.companionConstructionBlockerRuntime?.cancelBlockedAction?.(
        botNames.hydro
      )
  });
  const fireRuntime = createFireRuntime({
    session,
    getCharmander: () => session.charmanderEncounter,
    isBusy: runtimes.leafDenConstructionPresentationRuntime?.isActive,
    onBusy: () => callbacks.pushNotice?.(notices.leafDenBusy),
    hasFireCarbon,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      runtimes.fieldMoveApproachPositionRuntime
        ?.getCharmanderFireApproachPosition?.(
          targetPosition,
          playerPosition
        ),
    getModelYawToward: (fromPosition, toPosition) =>
      runtimes.companionFacingRuntime?.getRobotModelYawToward?.(
        fromPosition,
        toPosition,
        modelFaceYawOffsets.charmander
      ),
    tryMoveCompanionToPosition: runtimes.companionConstructionBlockerRuntime?.tryMove,
    isPositionBlocked: runtimes.companionConstructionBlockerRuntime?.isBlocked,
    syncCharmander: () => runtimes.companionModelSyncRuntime?.syncCharmander?.(),
    applyImpact: (action) =>
      runtimes.fieldMoveImpactRuntime?.applyCharmanderFireImpact?.(action),
    onBlocked: () =>
      runtimes.companionConstructionBlockerRuntime?.cancelBlockedAction?.(
        botNames.thermal
      )
  });
  const leafageRuntime = createLeafageRuntime({
    session,
    getBulbasaur: () => session.bulbasaurEncounter,
    isBusy: () => runtimes.bulbasaurWorkbenchGuideRuntime?.isActive?.(),
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      runtimes.fieldMoveApproachPositionRuntime
        ?.getBulbasaurLeafageApproachPosition?.(
          targetPosition,
          playerPosition
        ),
    getModelYawToward: (fromPosition, toPosition) =>
      runtimes.companionFacingRuntime?.getRobotModelYawToward?.(
        fromPosition,
        toPosition,
        modelFaceYawOffsets.bulbasaur
      ),
    tryMoveCompanionToPosition: runtimes.companionConstructionBlockerRuntime?.tryMove,
    isPositionBlocked: runtimes.companionConstructionBlockerRuntime?.isBlocked,
    syncBulbasaur: () => runtimes.companionModelSyncRuntime?.syncBulbasaur?.(),
    applyImpact: (action) =>
      runtimes.fieldMoveImpactRuntime?.applyBulbasaurLeafageImpact?.(action),
    onBlocked: () =>
      runtimes.companionConstructionBlockerRuntime?.cancelBlockedAction?.(
        botNames.grow
      )
  });
  const buildBlockRuntime = createBuildBlockRuntime({
    session,
    controls,
    getTimburr: () => session.timburrEncounter,
    resolveTarget: (...args) => runtimes.freeBlockBuildRuntime?.resolveBuildTarget?.(...args),
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      runtimes.fieldMoveApproachPositionRuntime
        ?.getTimburrBuildBlockApproachPosition?.(
          targetPosition,
          playerPosition
        ),
    getApproachBlockers: runtimes.companionConstructionBlockerRuntime?.getBlockers,
    shouldCastFromBlockedApproach:
      callbacks.shouldTimburrBuildBlockCastFromBlockedApproach,
    tryMoveCompanionToPosition: runtimes.companionConstructionBlockerRuntime?.tryMove,
    getModelYawToward: runtimes.companionFacingRuntime?.getRobotModelYawToward,
    applyImpact: (...args) => runtimes.freeBlockBuildRuntime?.applyTimburrImpact?.(...args),
    onBlocked: () =>
      runtimes.companionConstructionBlockerRuntime?.cancelBlockedAction?.(
        botNames.builder
      ),
    config: {
      modelFaceYawOffset: modelFaceYawOffsets.timburr
    }
  });

  return {
    buildBlockRuntime,
    fireRuntime,
    leafageRuntime,
    waterGunRuntime
  };
}
