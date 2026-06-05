export function getPlayerModelYawFromMovement({
  deltaX,
  deltaZ,
  modelFaceYawOffset = 0
} = {}) {
  return Math.atan2(deltaZ, deltaX) + modelFaceYawOffset;
}

export function getPlayerWalkLegArcOffset({
  yaw,
  phase,
  blend,
  footKickStride,
  footKickLift
} = {}) {
  const swing = Math.sin(phase);
  const forwardKick = Math.max(0, swing);
  const stride = swing * footKickStride * blend;
  const lift = Math.pow(forwardKick, 0.55) * footKickLift * blend;

  return [
    Math.cos(yaw) * stride,
    lift,
    Math.sin(yaw) * stride
  ];
}

export function advancePlayerWalkCycle({
  currentSpeed = 0,
  currentPhase = 0,
  deltaTime = 0,
  isWalking = false,
  cycleSpeed,
  acceleration,
  deceleration,
  moveValueToward
} = {}) {
  const targetSpeed = isWalking ? cycleSpeed : 0;
  const speedChange = isWalking ? acceleration : deceleration;
  const nextSpeed = moveValueToward(
    Number(currentSpeed) || 0,
    targetSpeed,
    speedChange * deltaTime
  );
  let nextPhase = Number(currentPhase) || 0;

  if (isWalking || nextSpeed > 0.001) {
    nextPhase += nextSpeed * deltaTime;
  }

  return {
    speed: nextSpeed,
    phase: nextPhase,
    blend: Math.min(1, nextSpeed / cycleSpeed)
  };
}

export function getPlayerWalkBodyLift({
  phase,
  blend,
  bodyBob
} = {}) {
  const bounce = Math.abs(Math.cos(phase));
  return Math.pow(bounce, 0.7) * bodyBob * blend;
}

export function advancePlayerJumpFlipRoll({
  elapsed,
  deltaTime = 0,
  duration,
  rotation
} = {}) {
  if (!Number.isFinite(elapsed) || elapsed >= duration) {
    return {
      elapsed: duration,
      roll: 0
    };
  }

  const nextElapsed = Math.min(duration, elapsed + deltaTime);
  const progress = nextElapsed / duration;

  return {
    elapsed: nextElapsed,
    roll: -rotation * progress
  };
}

export function getPlayerWalkFootRoll({
  phase,
  blend,
  footPendulumRoll
} = {}) {
  return -Math.sin(phase) * footPendulumRoll * blend;
}

export function getPlayerWalkArmBackOffset({
  yaw,
  blend,
  armBackOffset,
  armLift
} = {}) {
  const back = armBackOffset * blend;

  return [
    -Math.cos(yaw) * back,
    armLift * blend,
    -Math.sin(yaw) * back
  ];
}
