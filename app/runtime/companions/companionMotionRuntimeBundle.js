import { createBulbasaurWorkbenchGuideRuntime } from "./bulbasaurWorkbenchGuideRuntime.js";
import { createCompanionFollowDirectionRuntime } from "./companionFollowDirectionRuntime.js";
import { createCompanionFollowMovementRuntime } from "./companionFollowMovementRuntime.js";
import {
  resolveCompanionFollowDistance
} from "./companionFollowMotion.js";
import { createCompanionGroundPatrolFrameRuntime } from "./companionGroundPatrolFrameRuntime.js";
import { createCompanionIdleMotionRuntime } from "./companionIdleMotionRuntime.js";

const EMPTY_QUEUE = Object.freeze([]);

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
