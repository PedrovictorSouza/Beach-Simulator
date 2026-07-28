const DEFAULT_TARGET_MOTION_DURATION_SECONDS = 0.45;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isValidPoint(point) {
  return Array.isArray(point) &&
    point.length === 3 &&
    point.every(Number.isFinite);
}

function isValidDistance(distance) {
  return distance === null || distance === undefined || Number.isFinite(distance);
}

function isValidYaw(yaw) {
  return yaw === null || yaw === undefined || Number.isFinite(yaw);
}

function isValidPitch(pitch) {
  return pitch === null || pitch === undefined || Number.isFinite(pitch);
}

function getShortestAngleDelta(from, to) {
  const fullTurn = Math.PI * 2;
  return ((to - from + Math.PI) % fullTurn + fullTurn) % fullTurn - Math.PI;
}

function interpolatePoint(from, to, progress) {
  return from.map((value, index) => value + (to[index] - value) * progress);
}

function easeOutCubic(value) {
  const progress = clamp(value, 0, 1);

  return 1 - (1 - progress) ** 3;
}

export function createCameraTargetMotionNode({
  camera,
  durationSeconds = DEFAULT_TARGET_MOTION_DURATION_SECONDS,
  easing = easeOutCubic
} = {}) {
  if (
    !camera ||
    typeof camera.getTarget !== "function" ||
    typeof camera.setTarget !== "function"
  ) {
    throw new Error("CameraTargetMotionNode precisa de uma camera compativel.");
  }

  if (typeof easing !== "function") {
    throw new Error("CameraTargetMotionNode precisa de uma easing.");
  }

  let transition = null;
  let restoreState = null;

  function startTransition(target, distance, yaw, pitch, duration) {
    const from = camera.getTarget();
    const fromDistance = typeof camera.getDistance === "function" ?
      camera.getDistance() :
      null;
    const fromYaw = typeof camera.getYaw === "function" ? camera.getYaw() : null;
    const fromPitch = typeof camera.getPitch === "function" ? camera.getPitch() : null;

    if (distance !== null && distance !== undefined && (
      typeof camera.getDistance !== "function" ||
      typeof camera.setDistance !== "function"
    )) {
      throw new Error("CameraTargetMotionNode precisa de distancia compativel.");
    }
    if (yaw !== null && yaw !== undefined && (
      typeof camera.getYaw !== "function" ||
      typeof camera.setYaw !== "function"
    )) {
      throw new Error("CameraTargetMotionNode precisa de yaw compativel.");
    }
    if (pitch !== null && pitch !== undefined && (
      typeof camera.getPitch !== "function" ||
      typeof camera.setPitch !== "function"
    )) {
      throw new Error("CameraTargetMotionNode precisa de pitch compativel.");
    }

    if (duration === 0) {
      transition = null;
      camera.setTarget(target);
      if (distance !== null && distance !== undefined) {
        camera.setDistance(distance);
      }
      if (yaw !== null && yaw !== undefined) {
        camera.setYaw(yaw);
      }
      if (pitch !== null && pitch !== undefined) {
        camera.setPitch(pitch);
      }
      return false;
    }

    transition = {
      from,
      to: [...target],
      fromDistance,
      toDistance: distance,
      fromYaw,
      toYaw: yaw,
      yawDelta: yaw === null || yaw === undefined || fromYaw === null ?
        null :
        getShortestAngleDelta(fromYaw, yaw),
      fromPitch,
      toPitch: pitch,
      duration,
      elapsed: 0
    };
    camera.stopMotion?.();
    return true;
  }

  return Object.freeze({
    focus(target, {
      duration = durationSeconds,
      distance = null,
      yaw = null,
      pitch = null
    } = {}) {
      if (!isValidPoint(target)) {
        throw new Error("Camera focus precisa de um ponto [x, y, z].");
      }
      if (!isValidDistance(distance)) {
        throw new Error("Camera focus precisa de uma distancia valida.");
      }
      if (!isValidYaw(yaw)) {
        throw new Error("Camera focus precisa de um yaw valido.");
      }
      if (!isValidPitch(pitch)) {
        throw new Error("Camera focus precisa de um pitch valido.");
      }

      const normalizedDuration = Math.max(0, Number(duration) || 0);
      restoreState = {
        target: camera.getTarget(),
        distance: typeof camera.getDistance === "function" ?
          camera.getDistance() :
          null,
        yaw: typeof camera.getYaw === "function" ? camera.getYaw() : null,
        pitch: typeof camera.getPitch === "function" ? camera.getPitch() : null
      };

      return startTransition(target, distance, yaw, pitch, normalizedDuration);
    },
    restore({ duration = durationSeconds } = {}) {
      if (!restoreState) {
        return false;
      }

      const previousState = restoreState;
      restoreState = null;
      const normalizedDuration = Math.max(0, Number(duration) || 0);

      return startTransition(
        previousState.target,
        previousState.distance,
        previousState.yaw,
        previousState.pitch,
        normalizedDuration
      );
    },
    update(deltaSeconds) {
      if (!transition) {
        return false;
      }

      transition.elapsed = Math.min(
        transition.duration,
        transition.elapsed + Math.max(0, Number(deltaSeconds) || 0)
      );
      const linearProgress = transition.elapsed / transition.duration;
      const progress = clamp(Number(easing(linearProgress)) || 0, 0, 1);

      camera.setTarget(interpolatePoint(transition.from, transition.to, progress));
      if (transition.toDistance !== null && transition.toDistance !== undefined) {
        camera.setDistance(
          transition.fromDistance +
          (transition.toDistance - transition.fromDistance) * progress
        );
      }
      if (transition.yawDelta !== null) {
        camera.setYaw(transition.fromYaw + transition.yawDelta * progress);
      }
      if (transition.toPitch !== null && transition.toPitch !== undefined) {
        camera.setPitch(
          transition.fromPitch +
          (transition.toPitch - transition.fromPitch) * progress
        );
      }

      if (linearProgress >= 1) {
        transition = null;
      }

      return true;
    },
    cancel() {
      const wasActive = Boolean(transition);

      transition = null;
      return wasActive;
    },
    isActive() {
      return Boolean(transition);
    }
  });
}
