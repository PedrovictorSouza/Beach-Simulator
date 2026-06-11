const NOOP = () => {};

export function createCompanionGroundPatrolFrameRuntime({
  session = {},
  controls = {},
  followMovement = null,
  idleMotion = null,
  getSquirtleWaterGunQueue = () => [],
  isBulbasaurWorkbenchGuideActive = () => false,
  resolveFollowFormationIndex = () => 0,
  resolveFollowDistance = ({ defaultDistance } = {}) => defaultDistance,
  syncSquirtleModelInstance = NOOP,
  syncBulbasaurModelInstance = NOOP,
  config = {}
} = {}) {
  function updateSquirtle(deltaTime, { active, activeMoveId = null } = {}) {
    const squirtle = session.actTwoSquirtle;
    const canMove = Boolean(
      active &&
      squirtle?.recovered &&
      squirtle.assemblyState === "assembled" &&
      !session.squirtleWaterGunAction &&
      getSquirtleWaterGunQueue().length === 0
    );

    if (!canMove) {
      if (squirtle) {
        squirtle.patrol = null;
      }
      syncSquirtleModelInstance();
      return;
    }

    if (controls.storyState?.flags?.squirtleFollowing) {
      const formationIndex = resolveFollowFormationIndex("squirtle", activeMoveId);
      followMovement?.moveTowardPlayer?.(squirtle, {
        deltaTime,
        speed: config.squirtleFollowSpeed,
        followDistance: resolveFollowDistance({
          companionId: "squirtle",
          activeMoveId,
          defaultDistance: config.squirtleFollowDistance,
          formationIndex
        }),
        modelFaceYawOffset: config.squirtleModelFaceYawOffset
      });
      syncSquirtleModelInstance();
      return;
    }

    if (!idleMotion?.faceTowardPlayer?.(squirtle, {
      modelFaceYawOffset: config.squirtleModelFaceYawOffset
    })) {
      idleMotion?.updatePatrol?.(squirtle, {
        deltaTime,
        radius: config.squirtleIdlePatrolRadius,
        modelFaceYawOffset: config.squirtleModelFaceYawOffset
      });
    }
    syncSquirtleModelInstance();
  }

  function updateBulbasaur(deltaTime, { active, activeMoveId = null } = {}) {
    const encounter = session.bulbasaurEncounter;
    const jumpActive = Boolean(
      encounter?.jumpTimer > 0 &&
      encounter.originPosition &&
      encounter.landingPosition
    );
    const canPatrol = Boolean(
      active &&
      encounter?.visible &&
      Array.isArray(encounter.position) &&
      !session.bulbasaurLeafageAction &&
      !encounter.revealBoxOpening?.active &&
      !isBulbasaurWorkbenchGuideActive() &&
      !jumpActive
    );

    if (!canPatrol) {
      if (encounter) {
        encounter.patrol = null;
      }
      syncBulbasaurModelInstance();
      return;
    }

    if (controls.storyState?.flags?.bulbasaurFollowing) {
      const formationIndex = resolveFollowFormationIndex("bulbasaur", activeMoveId);
      followMovement?.moveTowardPlayer?.(encounter, {
        deltaTime,
        speed: config.bulbasaurFollowSpeed,
        followDistance: resolveFollowDistance({
          companionId: "bulbasaur",
          activeMoveId,
          defaultDistance: config.bulbasaurFollowDistance,
          formationIndex
        }),
        modelFaceYawOffset: config.bulbasaurModelFaceYawOffset
      });
      syncBulbasaurModelInstance();
      return;
    }

    if (!idleMotion?.faceTowardPlayer?.(encounter, {
      modelFaceYawOffset: config.bulbasaurModelFaceYawOffset
    })) {
      idleMotion?.updatePatrol?.(encounter, {
        deltaTime,
        radius: config.bulbasaurIdlePatrolRadius,
        modelFaceYawOffset: config.bulbasaurModelFaceYawOffset
      });
    }
    syncBulbasaurModelInstance();
  }

  return {
    updateBulbasaur,
    updateSquirtle
  };
}
