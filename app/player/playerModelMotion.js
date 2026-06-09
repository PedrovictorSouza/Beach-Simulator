const DEFAULT_PLAYER_MODEL_CONFIG = Object.freeze({
  modelScale: 0.75,
  modelFaceYawOffset: 0,
  modelTurnSpeed: 14,
  walkLegCycleSpeed: 25,
  walkLegAcceleration: 88,
  walkLegDeceleration: 38,
  walkFootKickStride: 0.28,
  walkFootKickLift: 0.2,
  walkFootPendulumRoll: 0.42,
  walkArmBackOffset: 0.17,
  walkArmLift: 0.045,
  walkArmBackPitch: -0.16,
  walkBodyBob: 0.075,
  jumpFlipDuration: 0.58,
  jumpFlipRotation: Math.PI * 2
});

function defaultMoveValueToward(current, target, maxStep) {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }

  return current + Math.sign(target - current) * maxStep;
}

function getShortestAngleDelta(fromAngle, toAngle) {
  return Math.atan2(Math.sin(toAngle - fromAngle), Math.cos(toAngle - fromAngle));
}

function defaultRotateAngleToward(fromAngle, toAngle, maxStep) {
  const delta = getShortestAngleDelta(fromAngle, toAngle);

  if (Math.abs(delta) <= maxStep) {
    return toAngle;
  }

  return fromAngle + Math.sign(delta) * maxStep;
}

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

export function createPlayerModelRuntime({
  moveValueToward = defaultMoveValueToward,
  rotateAngleToward = defaultRotateAngleToward,
  playJumpSound = () => {},
  config = DEFAULT_PLAYER_MODEL_CONFIG
} = {}) {
  function getConfiguredModelYawFromMovement(deltaX, deltaZ) {
    return getPlayerModelYawFromMovement({
      deltaX,
      deltaZ,
      modelFaceYawOffset: config.modelFaceYawOffset
    });
  }

  function getConfiguredWalkLegArcOffset(yaw, phase, blend) {
    return getPlayerWalkLegArcOffset({
      yaw,
      phase,
      blend,
      footKickStride: config.walkFootKickStride,
      footKickLift: config.walkFootKickLift
    });
  }

  function updateWalkCycle(session, deltaTime, isWalking) {
    const nextCycle = advancePlayerWalkCycle({
      currentSpeed: session.playerWalkLegSpeed,
      currentPhase: session.playerWalkLegPhase,
      deltaTime,
      isWalking,
      cycleSpeed: config.walkLegCycleSpeed,
      acceleration: config.walkLegAcceleration,
      deceleration: config.walkLegDeceleration,
      moveValueToward
    });

    session.playerWalkLegSpeed = nextCycle.speed;
    session.playerWalkLegPhase = nextCycle.phase;
    return nextCycle.blend;
  }

  function getConfiguredWalkBodyLift(phase, blend) {
    return getPlayerWalkBodyLift({
      phase,
      blend,
      bodyBob: config.walkBodyBob
    });
  }

  function startJumpFlip(session) {
    if (!session) {
      return;
    }

    session.playerJumpFlipElapsed = 0;
    playJumpSound();
  }

  function updateJumpFlipRoll(session, deltaTime) {
    const nextJumpFlip = advancePlayerJumpFlipRoll({
      elapsed: Number(session.playerJumpFlipElapsed),
      deltaTime,
      duration: config.jumpFlipDuration,
      rotation: config.jumpFlipRotation
    });

    session.playerJumpFlipElapsed = nextJumpFlip.elapsed;
    return nextJumpFlip.roll;
  }

  function getConfiguredWalkFootRoll(phase, blend) {
    return getPlayerWalkFootRoll({
      phase,
      blend,
      footPendulumRoll: config.walkFootPendulumRoll
    });
  }

  function getConfiguredWalkArmBackOffset(yaw, blend) {
    return getPlayerWalkArmBackOffset({
      yaw,
      blend,
      armBackOffset: config.walkArmBackOffset,
      armLift: config.walkArmLift
    });
  }

  function syncLegInstance(instance, basePosition, baseInstance, offset, roll = 0) {
    if (!instance) {
      return;
    }

    instance.offset = [
      basePosition[0] + offset[0],
      basePosition[1] + offset[1],
      basePosition[2] + offset[2]
    ];
    instance.scale = baseInstance.scale;
    instance.yaw = baseInstance.yaw || 0;
    instance.pitch = baseInstance.pitch || 0;
    instance.roll = (baseInstance.roll || 0) + roll;
    instance.active = baseInstance.active;
  }

  function syncLegModelInstances(session, basePosition, walkBlend) {
    const legInstances = session.playerLegModelInstances;

    if (!legInstances?.left || !legInstances?.right) {
      return;
    }

    const visualYaw = (session.playerModelInstance.yaw || 0) - config.modelFaceYawOffset;
    const phase = Number(session.playerWalkLegPhase) || 0;

    syncLegInstance(
      legInstances.left,
      basePosition,
      session.playerModelInstance,
      getConfiguredWalkLegArcOffset(visualYaw, phase, walkBlend),
      getConfiguredWalkFootRoll(phase, walkBlend)
    );
    syncLegInstance(
      legInstances.right,
      basePosition,
      session.playerModelInstance,
      getConfiguredWalkLegArcOffset(visualYaw, phase + Math.PI, walkBlend),
      getConfiguredWalkFootRoll(phase + Math.PI, walkBlend)
    );
  }

  function syncArmInstance(instance, baseInstance, offset, pitch = 0) {
    if (!instance) {
      return;
    }

    const basePosition = baseInstance.offset || [0, 0, 0];
    instance.offset = [
      basePosition[0] + offset[0],
      basePosition[1] + offset[1],
      basePosition[2] + offset[2]
    ];
    instance.scale = baseInstance.scale;
    instance.yaw = baseInstance.yaw || 0;
    instance.pitch = (baseInstance.pitch || 0) + pitch;
    instance.roll = baseInstance.roll || 0;
    instance.active = baseInstance.active;
  }

  function syncArmModelInstances(session, walkBlend) {
    const armInstances = session.playerArmModelInstances;

    if (!armInstances?.left || !armInstances?.right) {
      return;
    }

    const visualYaw = (session.playerModelInstance.yaw || 0) - config.modelFaceYawOffset;
    const offset = getConfiguredWalkArmBackOffset(visualYaw, walkBlend);
    const pitch = config.walkArmBackPitch * walkBlend;

    syncArmInstance(armInstances.left, session.playerModelInstance, offset, pitch);
    syncArmInstance(armInstances.right, session.playerModelInstance, offset, pitch);
  }

  function sync(session, deltaTime, movementDelta = null) {
    if (!session?.playerModelInstance || !session.playerCharacter) {
      return;
    }

    const playerPosition = session.playerCharacter.getPosition();
    const movementDistance = movementDelta ?
      Math.hypot(movementDelta[0], movementDelta[1]) :
      0;
    const isWalking = movementDistance > 0.0005;
    const walkBlend = updateWalkCycle(session, deltaTime, isWalking);
    const bodyLift = getConfiguredWalkBodyLift(
      Number(session.playerWalkLegPhase) || 0,
      walkBlend
    );

    session.playerModelInstance.offset = [
      playerPosition[0],
      playerPosition[1] + bodyLift,
      playerPosition[2]
    ];
    session.playerModelInstance.scale = config.modelScale;
    session.playerModelInstance.pitch = 0;
    session.playerModelInstance.roll = updateJumpFlipRoll(session, deltaTime);

    if (isWalking) {
      const [deltaX, deltaZ] = movementDelta;
      const targetYaw = getConfiguredModelYawFromMovement(deltaX, deltaZ);
      session.playerModelInstance.yaw = rotateAngleToward(
        session.playerModelInstance.yaw || 0,
        targetYaw,
        config.modelTurnSpeed * deltaTime
      );
    }

    session.playerModelInstance.active = true;
    syncLegModelInstances(session, playerPosition, walkBlend);
    syncArmModelInstances(session, walkBlend);
  }

  return {
    startJumpFlip,
    sync
  };
}
