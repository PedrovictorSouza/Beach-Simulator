import { createCompanionAbilityResourcesRuntime } from "../fieldMoveRuntime/companionAbilityResourcesRuntime.js";
import { createRepairBoxMotionRuntime } from "../repairBoxMotionRuntime.js";
import { createBeeFieldRuntime } from "./beeFieldRuntime.js";
import { createCompanionModelSyncRuntime } from "./companionModelSyncRuntime.js";
import { createCompanionRepairBoxModelRuntime } from "./companionRepairBoxModelRuntime.js";
import { createCompanionRenderFrameRuntime } from "./companionPresentationFrame.js";
import { createSquirtleReassemblyRuntime } from "./squirtleReassemblyRuntime.js";
import { BULBASAUR_TALK_INTERACT_DISTANCE } from "../../../world/islandWorld.js";

const NOOP = () => {};
const GAMEPLAY_BULBASAUR_INTERACTION_GIZMO_DOT_COUNT = 36;
const GAMEPLAY_BULBASAUR_INTERACTION_GIZMO_DOT_SIZE = 0.16;
const GAMEPLAY_ROBOT_MODEL_SCALE = 0.5;
const GAMEPLAY_COMPANION_PRESENTATION_CONFIG = Object.freeze({
  bulbasaurModelScale: GAMEPLAY_ROBOT_MODEL_SCALE * 1.3,
  charmanderModelScale: 0.75,
  interactionRadiusGizmoConfig: Object.freeze({
    dotCount: GAMEPLAY_BULBASAUR_INTERACTION_GIZMO_DOT_COUNT,
    dotSize: GAMEPLAY_BULBASAUR_INTERACTION_GIZMO_DOT_SIZE,
    interactDistance: BULBASAUR_TALK_INTERACT_DISTANCE
  }),
  repairBoxActiveTint: Object.freeze([0.38, 1.72, 0.42]),
  repairBoxActiveTintStrength: 0.68,
  repairBoxBobHeight: 0.06,
  repairBoxBobSpeed: 2.2,
  repairBoxFloatHeight: 0.74,
  repairBoxInactiveAlpha: 0.5,
  repairBoxInvestigationOffset: Object.freeze([-1.12, 0, -0.86]),
  repairBoxModelPitchOffset: 0,
  repairBoxOpenBackstep: 0.28,
  repairBoxOpenLift: 0.18,
  repairBoxOpenPitch: Math.PI * 0.58,
  repairBoxOpenRoll: Math.PI * 0.08,
  repairBoxRevealBoxDuration: 4.35,
  repairBoxRevealBoxOpenStartProgress: 0.62,
  repairBoxRevealBoxShakeEndProgress: 0.56,
  repairBoxRevealBoxSpinAcceleration: Math.PI * 8.2,
  repairBoxRustleLift: 0.08,
  repairBoxRustlePitch: 0.08,
  repairBoxRustleRoll: 0.11,
  repairBoxRustleYaw: 0.12,
  repairBoxSpinSpeed: Math.PI * 0.826,
  robotModelScale: GAMEPLAY_ROBOT_MODEL_SCALE,
  squirtleReassemblyPartScale: 0.5,
  timburrModelScale: 0.58
});

export function createGameplayCompanionPresentationRuntimeBundle(options = {}) {
  return createCompanionPresentationRuntimeBundle({
    ...options,
    config: {
      ...GAMEPLAY_COMPANION_PRESENTATION_CONFIG,
      ...options.config
    }
  });
}

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
