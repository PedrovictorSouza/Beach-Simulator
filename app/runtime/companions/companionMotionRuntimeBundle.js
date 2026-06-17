import { createBulbasaurWorkbenchGuideRuntime } from "./bulbasaurWorkbenchGuideRuntime.js";
import { createCompanionFollowDirectionRuntime } from "./companionFollowDirectionRuntime.js";
import { createCompanionFollowMovementRuntime } from "./companionFollowMovementRuntime.js";
import {
  resolveCompanionFollowDistance
} from "./companionFollowMotion.js";
import { createCompanionGroundPatrolFrameRuntime } from "./companionGroundPatrolFrameRuntime.js";
import { createCompanionIdleMotionRuntime } from "./companionIdleMotionRuntime.js";
import { BULBASAUR_IDLE_PATROL_RADIUS, SQUIRTLE_IDLE_PATROL_RADIUS } from "../robotPatrolConfig.js";
import { PLAYER_SPEED } from "../../session/configurePlayerSpawner.js";
import { WORKBENCH_POSITION } from "../../../gameplayContent.js";

const EMPTY_QUEUE = Object.freeze([]);
const GAMEPLAY_COMPANION_MODEL_FACE_YAW_OFFSET = 0;
const GAMEPLAY_COMPANION_MOTION_CONFIG = Object.freeze({
  arriveDistance: 0.08,
  bulbasaurFollowDistance: 1.46,
  bulbasaurFollowSpeed: PLAYER_SPEED,
  bulbasaurIdlePatrolRadius: BULBASAUR_IDLE_PATROL_RADIUS,
  bulbasaurModelFaceYawOffset: GAMEPLAY_COMPANION_MODEL_FACE_YAW_OFFSET,
  bulbasaurWorkbenchGuideRampApproachMargin: 0.92,
  bulbasaurWorkbenchGuideRampColliderId: "workbench-ramp-collider",
  bulbasaurWorkbenchGuideSideApproachMargin: 1.22,
  bulbasaurWorkbenchGuideSpeed: 2.4,
  bulbasaurWorkbenchGuideStart: Object.freeze([8.55, 0.02, -5.7]),
  bulbasaurWorkbenchGuideWaypointDistance: 0.08,
  botPlayerAttentionDistance: 4.8,
  robotIdlePatrolArriveDistance: 0.08,
  robotIdlePatrolPauseDuration: 0.75,
  robotIdlePatrolSpeed: 0.82,
  squirtleFollowDistance: 1.18,
  squirtleFollowSpeed: PLAYER_SPEED,
  squirtleIdlePatrolRadius: SQUIRTLE_IDLE_PATROL_RADIUS,
  squirtleModelFaceYawOffset: GAMEPLAY_COMPANION_MODEL_FACE_YAW_OFFSET,
  workbenchPosition: WORKBENCH_POSITION
});

export function createGameplayCompanionMotionRuntimeBundle(options = {}) {
  return createCompanionMotionRuntimeBundle({
    ...options,
    config: {
      ...GAMEPLAY_COMPANION_MOTION_CONFIG,
      ...options.config
    }
  });
}

export function createCompanionMotionRuntimeBundle({
  controls = {},
  session = {},
  runtimes = {},
  callbacks = {},
  config = {}
} = {}) {
  let bulbasaurWorkbenchGuideRuntime = null;

  const getSquirtleWaterGunQueue =
    callbacks.getSquirtleWaterGunQueue ||
    (() => runtimes.waterGunRuntime?.getQueue?.() || EMPTY_QUEUE);
  const syncSquirtleModelInstance =
    callbacks.syncSquirtleModelInstance ||
    (() => runtimes.companionModelSyncRuntime?.syncSquirtle?.());
  const syncBulbasaurModelInstance =
    callbacks.syncBulbasaurModelInstance ||
    (() => runtimes.companionModelSyncRuntime?.syncBulbasaur?.());
  const getModelYawToward =
    runtimes.companionFacingRuntime?.getRobotModelYawToward || (() => 0);

  const companionFollowDirectionRuntime = createCompanionFollowDirectionRuntime({
    getFlags: () => controls.storyState?.flags || {},
    getCompanions: () => ({
      squirtle: session.actTwoSquirtle,
      bulbasaur: session.bulbasaurEncounter,
      charmander: session.charmanderEncounter,
      timburr: session.timburrEncounter
    }),
    getActions: () => ({
      squirtleWaterGun: session.squirtleWaterGunAction,
      bulbasaurLeafage: session.bulbasaurLeafageAction,
      charmanderFire: session.charmanderFireAction,
      timburrBuildBlock: session.timburrBuildBlockAction
    }),
    getBlockers: () => ({
      squirtleWaterGunQueueActive: getSquirtleWaterGunQueue().length > 0,
      bulbasaurWorkbenchGuideActive: bulbasaurWorkbenchGuideRuntime.isActive()
    })
  });

  const companionFollowMovementRuntime = createCompanionFollowMovementRuntime({
    getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
    getPlayerYaw: () => session.playerModelInstance?.yaw,
    getFollowDirection: (yaw) => companionFollowDirectionRuntime.get(yaw),
    tryMoveCompanionToPosition:
      runtimes.companionConstructionBlockerRuntime?.tryMove || (() => false),
    getModelYawToward,
    resolveFollowFormationIndex: companionFollowDirectionRuntime.resolveFormationIndex,
    resolveFollowDistance: resolveCompanionFollowDistance,
    arriveDistance: config.arriveDistance
  });

  const companionIdleMotionRuntime = createCompanionIdleMotionRuntime({
    getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
    getModelYawToward,
    attentionDistance: config.botPlayerAttentionDistance,
    patrolSpeed: config.robotIdlePatrolSpeed,
    patrolPauseDuration: config.robotIdlePatrolPauseDuration,
    patrolArriveDistance: config.robotIdlePatrolArriveDistance
  });

  bulbasaurWorkbenchGuideRuntime = createBulbasaurWorkbenchGuideRuntime({
    session,
    controls,
    workbenchPosition: config.workbenchPosition,
    getYawToward: getModelYawToward,
    config: {
      start: config.bulbasaurWorkbenchGuideStart,
      speed: config.bulbasaurWorkbenchGuideSpeed,
      waypointDistance: config.bulbasaurWorkbenchGuideWaypointDistance,
      rampColliderId: config.bulbasaurWorkbenchGuideRampColliderId,
      rampApproachMargin: config.bulbasaurWorkbenchGuideRampApproachMargin,
      sideApproachMargin: config.bulbasaurWorkbenchGuideSideApproachMargin,
      modelFaceYawOffset: config.bulbasaurModelFaceYawOffset
    }
  });

  const companionGroundPatrolFrameRuntime = createCompanionGroundPatrolFrameRuntime({
    session,
    controls,
    followMovement: companionFollowMovementRuntime,
    idleMotion: companionIdleMotionRuntime,
    getSquirtleWaterGunQueue,
    isBulbasaurWorkbenchGuideActive: () => bulbasaurWorkbenchGuideRuntime.isActive(),
    resolveFollowFormationIndex: companionFollowDirectionRuntime.resolveFormationIndex,
    resolveFollowDistance: resolveCompanionFollowDistance,
    syncSquirtleModelInstance,
    syncBulbasaurModelInstance,
    config: {
      squirtleFollowSpeed: config.squirtleFollowSpeed,
      squirtleFollowDistance: config.squirtleFollowDistance,
      squirtleModelFaceYawOffset: config.squirtleModelFaceYawOffset,
      squirtleIdlePatrolRadius: config.squirtleIdlePatrolRadius,
      bulbasaurFollowSpeed: config.bulbasaurFollowSpeed,
      bulbasaurFollowDistance: config.bulbasaurFollowDistance,
      bulbasaurModelFaceYawOffset: config.bulbasaurModelFaceYawOffset,
      bulbasaurIdlePatrolRadius: config.bulbasaurIdlePatrolRadius
    }
  });

  return {
    bulbasaurWorkbenchGuideRuntime,
    companionFollowDirectionRuntime,
    companionFollowMovementRuntime,
    companionGroundPatrolFrameRuntime,
    companionIdleMotionRuntime
  };
}
