export function createCompanionFollowMovementRuntime({
  getPlayerPosition = () => null,
  getPlayerYaw = () => null,
  getFollowDirection = () => [0, 1],
  tryMoveCompanionToPosition = () => false,
  getModelYawToward = () => 0,
  resolveFollowFormationIndex = () => null,
  resolveFollowDistance = ({ defaultDistance } = {}) => defaultDistance,
  arriveDistance = 0
} = {}) {
  function getTargetPosition(followDistance) {
    const playerPosition = getPlayerPosition();
    if (!Array.isArray(playerPosition)) {
      return null;
    }

    const [directionX, directionZ] = getFollowDirection(getPlayerYaw());
    return [
      playerPosition[0] - directionX * followDistance,
      0.04,
      playerPosition[2] - directionZ * followDistance
    ];
  }

  function moveTowardPlayer(companion, {
    deltaTime,
    speed,
    followDistance,
    modelFaceYawOffset = null
  }) {
    if (!companion || !Array.isArray(companion.position)) {
      return false;
    }

    const targetPosition = getTargetPosition(followDistance);
    if (!targetPosition) {
      return false;
    }

    const deltaX = targetPosition[0] - companion.position[0];
    const deltaZ = targetPosition[2] - companion.position[2];
    const distance = Math.hypot(deltaX, deltaZ);

    companion.patrol = null;

    if (distance <= arriveDistance || distance <= 0.001) {
      return true;
    }

    const travel = Math.min(speed * deltaTime, distance);
    const previousPosition = [...companion.position];
    const nextPosition = [
      companion.position[0] + (deltaX / distance) * travel,
      0.04,
      companion.position[2] + (deltaZ / distance) * travel
    ];

    if (!tryMoveCompanionToPosition(companion, nextPosition)) {
      return false;
    }

    if (companion.modelInstance && modelFaceYawOffset !== null) {
      companion.modelInstance.yaw = getModelYawToward(
        previousPosition,
        companion.position,
        modelFaceYawOffset
      );
    }

    return true;
  }

  function moveFormationMemberTowardPlayer(companion, {
    companionId,
    activeMoveId = null,
    deltaTime,
    speed,
    defaultDistance,
    modelFaceYawOffset = null
  }) {
    const formationIndex = resolveFollowFormationIndex(companionId, activeMoveId);
    const followDistance = resolveFollowDistance({
      companionId,
      activeMoveId,
      defaultDistance,
      formationIndex
    });

    return moveTowardPlayer(companion, {
      deltaTime,
      speed,
      followDistance,
      modelFaceYawOffset
    });
  }

  return {
    getTargetPosition,
    moveFormationMemberTowardPlayer,
    moveTowardPlayer
  };
}
