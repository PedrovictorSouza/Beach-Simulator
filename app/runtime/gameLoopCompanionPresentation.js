import { isRevealBoxBotVisible } from "./botRevealMotion.js";
import {
  createGameplayCompanionPresentationRuntimeBundle
} from "./companions/companionPresentationRuntimeBundle.js";
import { getEncounterRepairBoxPosition } from "./encounterRepairBoxPosition.js";

export function createGameLoopCompanionPresentationRuntimeBundle({
  actTwoTutorial,
  camera,
  controls,
  rendering,
  session,
  runtimes = {},
  callbacks = {},
  math = {},
  createRuntime = createGameplayCompanionPresentationRuntimeBundle
} = {}) {
  const {
    fieldMoveActorPositionRuntime,
    worldSceneSyncRuntime
  } = runtimes;
  const {
    onSquirtleRechargeComplete
  } = callbacks;
  const {
    clamp01,
    easeOutCubic,
    lerp,
    moveValueToward
  } = math;

  return createRuntime({
    camera,
    controls,
    rendering,
    session,
    runtimes: {
      fieldMoveActorPositionRuntime,
      worldSceneSyncRuntime
    },
    callbacks: {
      getEncounterRepairBoxPosition,
      isActTwoTutorialStarted: () => actTwoTutorial.hasStarted(),
      isRevealBoxBotVisible,
      onSquirtleRechargeComplete
    },
    math: {
      clamp01,
      easeOutCubic,
      lerp,
      moveValueToward
    }
  });
}
