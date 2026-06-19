import {
  createGameplayCompanionMotionRuntimeBundle
} from "./companions/companionMotionRuntimeBundle.js";

export function createGameLoopCompanionMotionRuntimeBundle({
  controls,
  session,
  runtimes = {},
  callbacks = {},
  createRuntime = createGameplayCompanionMotionRuntimeBundle
} = {}) {
  const {
    companionConstructionBlockerRuntime,
    companionFacingRuntime,
    companionModelSyncRuntime
  } = runtimes;
  const {
    getWaterGunRuntime = () => runtimes.waterGunRuntime
  } = callbacks;

  return createRuntime({
    controls,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      companionFacingRuntime
    },
    callbacks: {
      getSquirtleWaterGunQueue: () => getWaterGunRuntime()?.getQueue?.() ?? [],
      syncSquirtleModelInstance: () => companionModelSyncRuntime?.syncSquirtle?.(),
      syncBulbasaurModelInstance: () => companionModelSyncRuntime?.syncBulbasaur?.()
    }
  });
}
