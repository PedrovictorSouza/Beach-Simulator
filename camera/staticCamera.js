const WORLD_UP = [0, 1, 0];

const DEFAULT_STATIC_CAMERA_CONFIG = Object.freeze({
  target: [0, 6, 50],
  direction: [0.74, 1.22, 0.74],
  distance: 164,
  minDistance: 54,
  maxDistance: 215,
  zoomSpeed: 0.16,
  panSpeed: 46,
  dragPanSpeed: 1,
  zoomFocusStrength: 0.38,
  targetBounds: {
    minX: -92,
    maxX: 92,
    minZ: -116,
    maxZ: 96
  },
  fov: (42 * Math.PI) / 180,
  near: 0.1,
  far: 420
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeVec3(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function subtractVec3(left, right) {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2]
  ];
}

function crossVec3(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function scaleVec3(vector, scale) {
  return [
    vector[0] * scale,
    vector[1] * scale,
    vector[2] * scale
  ];
}

function addVec3(left, right) {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2]
  ];
}

function createIdentityMat4() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

function createPerspectiveMat4(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy * 0.5);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;

  return out;
}

function createLookAtMat4(eye, target, up) {
  const zAxis = normalizeVec3(subtractVec3(eye, target));
  const xAxis = normalizeVec3(crossVec3(up, zAxis));
  const yAxis = crossVec3(zAxis, xAxis);
  const out = createIdentityMat4();

  out[0] = xAxis[0];
  out[1] = yAxis[0];
  out[2] = zAxis[0];
  out[4] = xAxis[1];
  out[5] = yAxis[1];
  out[6] = zAxis[1];
  out[8] = xAxis[2];
  out[9] = yAxis[2];
  out[10] = zAxis[2];
  out[12] = -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]);
  out[13] = -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]);
  out[14] = -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]);

  return out;
}

function multiplyMat4(left, right) {
  const out = new Float32Array(16);
  const a00 = left[0], a01 = left[1], a02 = left[2], a03 = left[3];
  const a10 = left[4], a11 = left[5], a12 = left[6], a13 = left[7];
  const a20 = left[8], a21 = left[9], a22 = left[10], a23 = left[11];
  const a30 = left[12], a31 = left[13], a32 = left[14], a33 = left[15];
  const b00 = right[0], b01 = right[1], b02 = right[2], b03 = right[3];
  const b10 = right[4], b11 = right[5], b12 = right[6], b13 = right[7];
  const b20 = right[8], b21 = right[9], b22 = right[10], b23 = right[11];
  const b30 = right[12], b31 = right[13], b32 = right[14], b33 = right[15];

  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

  return out;
}

export function createStaticCamera(config = {}) {
  const targetBounds = config.targetBounds || DEFAULT_STATIC_CAMERA_CONFIG.targetBounds;
  const state = {
    target: [...(config.target || DEFAULT_STATIC_CAMERA_CONFIG.target)],
    direction: normalizeVec3(config.direction || DEFAULT_STATIC_CAMERA_CONFIG.direction),
    distance: Number(config.distance || DEFAULT_STATIC_CAMERA_CONFIG.distance),
    minDistance: Number(config.minDistance || DEFAULT_STATIC_CAMERA_CONFIG.minDistance),
    maxDistance: Number(config.maxDistance || DEFAULT_STATIC_CAMERA_CONFIG.maxDistance),
    zoomSpeed: Number(config.zoomSpeed || DEFAULT_STATIC_CAMERA_CONFIG.zoomSpeed),
    panSpeed: Number(config.panSpeed || DEFAULT_STATIC_CAMERA_CONFIG.panSpeed),
    dragPanSpeed: Number(config.dragPanSpeed || DEFAULT_STATIC_CAMERA_CONFIG.dragPanSpeed),
    zoomFocusStrength: Number(config.zoomFocusStrength || DEFAULT_STATIC_CAMERA_CONFIG.zoomFocusStrength),
    targetBounds: {
      minX: Number(targetBounds.minX),
      maxX: Number(targetBounds.maxX),
      minZ: Number(targetBounds.minZ),
      maxZ: Number(targetBounds.maxZ)
    },
    fov: Number(config.fov || DEFAULT_STATIC_CAMERA_CONFIG.fov),
    near: Number(config.near || DEFAULT_STATIC_CAMERA_CONFIG.near),
    far: Number(config.far || DEFAULT_STATIC_CAMERA_CONFIG.far)
  };

  function getEye() {
    return [
      state.target[0] + state.direction[0] * state.distance,
      state.target[1] + state.direction[1] * state.distance,
      state.target[2] + state.direction[2] * state.distance
    ];
  }

  function getGroundBasis() {
    const right = normalizeVec3(crossVec3(WORLD_UP, state.direction));
    const forward = normalizeVec3(crossVec3(WORLD_UP, right));

    return { right, forward };
  }

  function clampTarget() {
    state.target[0] = clamp(state.target[0], state.targetBounds.minX, state.targetBounds.maxX);
    state.target[2] = clamp(state.target[2], state.targetBounds.minZ, state.targetBounds.maxZ);
  }

  function moveTarget(delta) {
    state.target = addVec3(state.target, delta);
    clampTarget();
  }

  function getUnitsPerPixel(viewport = {}) {
    const height = Math.max(1, Number(viewport.height) || 1);
    const visibleHeight = Math.tan(state.fov * 0.5) * state.distance * 2;

    return visibleHeight / height;
  }

  return {
    getTarget() {
      return [...state.target];
    },
    getCurvatureOrigin() {
      return [state.target[0], 0, state.target[2]];
    },
    getDistance() {
      return state.distance;
    },
    zoomBy(deltaY, focus = null) {
      const previousDistance = state.distance;
      state.distance = clamp(
        state.distance + deltaY * state.zoomSpeed,
        state.minDistance,
        state.maxDistance
      );

      const changed = state.distance !== previousDistance;
      if (changed && focus) {
        const width = Math.max(1, Number(focus.width) || 1);
        const height = Math.max(1, Number(focus.height) || 1);
        const normalizedX = ((Number(focus.x) || 0) / width) * 2 - 1;
        const normalizedY = ((Number(focus.y) || 0) / height) * 2 - 1;
        const zoomAmount = previousDistance - state.distance;
        const { right, forward } = getGroundBasis();
        const rightShift = scaleVec3(right, normalizedX * zoomAmount * state.zoomFocusStrength);
        const forwardShift = scaleVec3(forward, -normalizedY * zoomAmount * state.zoomFocusStrength);

        moveTarget(addVec3(rightShift, forwardShift));
      }

      return changed;
    },
    panByScreenDelta(deltaX, deltaY, viewport = {}) {
      const { right, forward } = getGroundBasis();
      const unitsPerPixel = getUnitsPerPixel(viewport) * state.dragPanSpeed;
      const rightShift = scaleVec3(right, -deltaX * unitsPerPixel);
      const forwardShift = scaleVec3(forward, -deltaY * unitsPerPixel);

      moveTarget(addVec3(rightShift, forwardShift));
    },
    panByDirection(direction, deltaSeconds) {
      const x = Number(direction?.x) || 0;
      const z = Number(direction?.z) || 0;

      if (x === 0 && z === 0) {
        return false;
      }

      const { right, forward } = getGroundBasis();
      const distanceScale = clamp(state.distance / DEFAULT_STATIC_CAMERA_CONFIG.distance, 0.55, 1.6);
      const amount = state.panSpeed * Math.max(0, deltaSeconds) * distanceScale;
      const rightShift = scaleVec3(right, x * amount);
      const forwardShift = scaleVec3(forward, z * amount);

      moveTarget(addVec3(rightShift, forwardShift));
      return true;
    },
    getViewProjection(width, height) {
      const aspect = width / height;
      const projection = createPerspectiveMat4(state.fov, aspect, state.near, state.far);
      const view = createLookAtMat4(getEye(), state.target, WORLD_UP);

      return multiplyMat4(projection, view);
    },
    isPlanarPointVisible(x, z, radius) {
      return Math.hypot(x - state.target[0], z - state.target[2]) <= radius;
    }
  };
}
