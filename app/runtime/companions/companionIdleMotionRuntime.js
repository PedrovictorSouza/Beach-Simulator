import { resolveBotAttentionFacing } from "../botAttentionFacing.js";

export function createCompanionIdleMotionRuntime({
  getPlayerPosition = () => null,
  getModelYawToward = () => 0,
  attentionDistance = 4.8,
  patrolSpeed = 0,
  patrolPauseDuration = 0,
  patrolArriveDistance = 0
} = {}) {
  function createPatrolState(origin, radius) {
    return {
      origin: [...origin],
      waypointIndex: 0,
      pauseTimer: patrolPauseDuration,
      points: [
        [origin[0] - radius * 0.72, origin[1], origin[2] - radius * 0.34],
        [origin[0] + radius * 0.66, origin[1], origin[2] - radius * 0.48],
        [origin[0] + radius * 0.58, origin[1], origin[2] + radius * 0.42],
        [origin[0] - radius * 0.64, origin[1], origin[2] + radius * 0.52]
      ]
    };
  }

  function updatePatrol(robot, {
    deltaTime,
    radius,
    modelFaceYawOffset
  }) {
    if (!robot?.modelInstance || !Array.isArray(robot.position)) {
      return;
    }

    if (
      !robot.patrol ||
      Math.hypot(
        robot.position[0] - robot.patrol.origin[0],
        robot.position[2] - robot.patrol.origin[2]
      ) > radius * 1.8
    ) {
      robot.patrol = createPatrolState(robot.position, radius);
    }

    if (robot.patrol.pauseTimer > 0) {
      robot.patrol.pauseTimer = Math.max(0, robot.patrol.pauseTimer - deltaTime);
      return;
    }

    const targetPosition = robot.patrol.points[robot.patrol.waypointIndex];
    const deltaX = targetPosition[0] - robot.position[0];
    const deltaZ = targetPosition[2] - robot.position[2];
    const distance = Math.hypot(deltaX, deltaZ);

    if (distance <= patrolArriveDistance) {
      robot.patrol.waypointIndex = (robot.patrol.waypointIndex + 1) % robot.patrol.points.length;
      robot.patrol.pauseTimer = patrolPauseDuration;
      return;
    }

    const step = Math.min(distance, patrolSpeed * deltaTime);
    robot.position = [
      robot.position[0] + (deltaX / distance) * step,
      targetPosition[1],
      robot.position[2] + (deltaZ / distance) * step
    ];
    robot.modelInstance.yaw = getModelYawToward(
      robot.position,
      targetPosition,
      modelFaceYawOffset
    );
  }

  function faceTowardPlayer(robot, { modelFaceYawOffset = 0 } = {}) {
    const attentionFacing = resolveBotAttentionFacing({
      botPosition: robot?.position,
      playerPosition: getPlayerPosition(),
      attentionDistance,
      modelFaceYawOffset
    });

    if (!attentionFacing || !robot?.modelInstance) {
      return false;
    }

    robot.modelInstance.yaw = attentionFacing.yaw;
    return true;
  }

  return {
    faceTowardPlayer,
    updatePatrol
  };
}
