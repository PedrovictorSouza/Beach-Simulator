import { createCompanionAbilityResourcesRuntime } from "../fieldMoveRuntime/companionAbilityResourcesRuntime.js";
import { createRepairBoxMotionRuntime } from "../repairBoxMotionRuntime.js";
import { createBeeFieldRuntime } from "./beeFieldRuntime.js";
import { createCompanionModelSyncRuntime } from "./companionModelSyncRuntime.js";
import { createCompanionRepairBoxModelRuntime } from "./companionRepairBoxModelRuntime.js";
import { createCompanionRenderFrameRuntime } from "./companionPresentationFrame.js";
import { createSquirtleReassemblyRuntime } from "./squirtleReassemblyRuntime.js";

const NOOP = () => {};

export function createCompanionPresentationRuntimeBundle({
  camera = null,
  controls = {},
  rendering = {},
  session = {},
  runtimes = {},
  callbacks = {},
  math = {},
  config = {}
} = {}) {
  const repairBoxMotionRuntime = createRepairBoxMotionRuntime({
    floatHeight: config.repairBoxFloatHeight,
    bobHeight: config.repairBoxBobHeight,
    bobSpeed: config.repairBoxBobSpeed,
    spinSpeed: config.repairBoxSpinSpeed
  });

  const companionRepairBoxModelRuntime = createCompanionRepairBoxModelRuntime({
    motion: repairBoxMotionRuntime,
    getRepairBoxPosition: callbacks.getEncounterRepairBoxPosition,
    clamp01: math.clamp01,
    easeOutCubic: math.easeOutCubic,
    isRevealBoxBotVisible: callbacks.isRevealBoxBotVisible,
    config: {
      modelPitchOffset: config.repairBoxModelPitchOffset,
      openPitch: config.repairBoxOpenPitch,
      openRoll: config.repairBoxOpenRoll,
      openLift: config.repairBoxOpenLift,
      openBackstep: config.repairBoxOpenBackstep,
      revealBoxDuration: config.repairBoxRevealBoxDuration,
      revealBoxOpenStartProgress: config.repairBoxRevealBoxOpenStartProgress,
      revealBoxShakeEndProgress: config.repairBoxRevealBoxShakeEndProgress,
      revealBoxSpinAcceleration: config.repairBoxRevealBoxSpinAcceleration,
      repairBoxRustleLift: config.repairBoxRustleLift,
      repairBoxRustleRoll: config.repairBoxRustleRoll,
      repairBoxRustlePitch: config.repairBoxRustlePitch,
      repairBoxRustleYaw: config.repairBoxRustleYaw,
      investigationOffset: config.repairBoxInvestigationOffset,
      activeTint: config.repairBoxActiveTint,
      activeTintStrength: config.repairBoxActiveTintStrength,
      inactiveAlpha: config.repairBoxInactiveAlpha
    }
  });

  const companionModelSyncRuntime = createCompanionModelSyncRuntime({
    session,
    repairBoxModelRuntime: companionRepairBoxModelRuntime,
    syncInteractablePosition:
      runtimes.worldSceneSyncRuntime?.syncInteractablePosition || NOOP,
    config: {
      robotModelScale: config.robotModelScale,
      bulbasaurModelScale: config.bulbasaurModelScale,
      charmanderModelScale: config.charmanderModelScale,
      timburrModelScale: config.timburrModelScale
    }
  });

  const squirtleReassemblyRuntime = createSquirtleReassemblyRuntime({
    session,
    clamp01: math.clamp01,
    easeOutCubic: math.easeOutCubic,
    lerp: math.lerp,
    partScale: config.squirtleReassemblyPartScale,
    syncSquirtleModelInstance: () => companionModelSyncRuntime.syncSquirtle()
  });

  const beeFieldRuntime = createBeeFieldRuntime({
    session,
    controls,
    repairBoxRuntime: companionRepairBoxModelRuntime,
    syncInteractablePosition:
      runtimes.worldSceneSyncRuntime?.syncInteractablePosition || NOOP,
    config: {
      activeTint: config.repairBoxActiveTint,
      activeTintStrength: config.repairBoxActiveTintStrength
    }
  });

  const companionAbilityResourcesRuntime = createCompanionAbilityResourcesRuntime({
    session,
    controls,
    clamp01: math.clamp01,
    moveValueToward: math.moveValueToward,
    onSquirtleRechargeComplete: callbacks.onSquirtleRechargeComplete
  });

  const companionRenderFrameRuntime = createCompanionRenderFrameRuntime({
    session,
    getPlayerSkills: () => controls.playerSkills,
    getStoryState: () => controls.storyState,
    rendering,
    camera,
    isActTwoTutorialStarted: callbacks.isActTwoTutorialStarted,
    syncSquirtleModelInstance: () => companionModelSyncRuntime.syncSquirtle(),
    getSquirtleWorldPosition:
      runtimes.fieldMoveActorPositionRuntime?.getSquirtleWorldPosition,
    getCharmanderWorldPosition:
      runtimes.fieldMoveActorPositionRuntime?.getCharmanderWorldPosition,
    getSquirtleMouthPosition:
      runtimes.fieldMoveActorPositionRuntime?.getSquirtleMouthPosition,
    getCharmanderMouthPosition:
      runtimes.fieldMoveActorPositionRuntime?.getCharmanderMouthPosition,
    getBulbasaurGrowEmitterPosition:
      runtimes.fieldMoveActorPositionRuntime?.getBulbasaurGrowEmitterPosition,
    getSquirtleWaterStaminaState: () =>
      companionAbilityResourcesRuntime.getSquirtleWaterStaminaState(),
    getCharmanderCarbonEnergyState: () =>
      companionAbilityResourcesRuntime.getCharmanderCarbonEnergyState(),
    isSquirtleWaterCharging: () =>
      companionAbilityResourcesRuntime.isSquirtleWaterCharging(),
    interactionRadiusGizmoConfig: config.interactionRadiusGizmoConfig
  });

  return {
    beeFieldRuntime,
    companionAbilityResourcesRuntime,
    companionModelSyncRuntime,
    companionRenderFrameRuntime,
    companionRepairBoxModelRuntime,
    repairBoxMotionRuntime,
    squirtleReassemblyRuntime
  };
}
