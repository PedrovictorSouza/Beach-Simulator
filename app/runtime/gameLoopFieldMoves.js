import { shouldTimburrBuildBlockCastFromBlockedApproach } from "./buildBlockDebugOverlay.js";
import { createGameplayFieldMoveRuntimeBundle } from "./fieldMoveRuntime/fieldMoveRuntimeBundle.js";
import { SANDBOTS_BOT_NAMES } from "../story/sandbotsLexicon.js";

export function createGameLoopFieldMoveRuntimeBundle({
  controls,
  hud,
  session,
  runtimes = {},
  callbacks = {},
  createRuntime = createGameplayFieldMoveRuntimeBundle
} = {}) {
  const {
    bulbasaurWorkbenchGuideRuntime,
    companionAbilityResourcesRuntime,
    companionConstructionBlockerRuntime,
    companionFacingRuntime,
    companionModelSyncRuntime,
    fieldMoveApproachPositionRuntime,
    leafDenConstructionPresentationRuntime
  } = runtimes;
  const {
    getFieldMoveImpactRuntime = () => runtimes.fieldMoveImpactRuntime,
    getFreeBlockBuildRuntime = () => runtimes.freeBlockBuildRuntime
  } = callbacks;

  return createRuntime({
    session,
    controls,
    runtimes: {
      bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime,
      companionConstructionBlockerRuntime,
      companionFacingRuntime,
      companionModelSyncRuntime,
      fieldMoveApproachPositionRuntime,
      get fieldMoveImpactRuntime() {
        return getFieldMoveImpactRuntime();
      },
      get freeBlockBuildRuntime() {
        return getFreeBlockBuildRuntime();
      },
      leafDenConstructionPresentationRuntime
    },
    callbacks: {
      pushNotice: (notice) => hud?.pushNotice?.(notice),
      shouldTimburrBuildBlockCastFromBlockedApproach
    },
    botNames: SANDBOTS_BOT_NAMES
  });
}
