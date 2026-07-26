const DEFAULT_CURSOR_STATE = Object.freeze({
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0,
  pressed: false,
  panning: false,
  rotating: false,
  inside: false,
  keyboardPan: { x: 0, z: 0 },
  edgePan: { x: 0, z: 0 },
  keyboardRotation: 0,
  spacePressed: false,
  dragged: false,
  invertedPan: false,
  lastPointer: null
});

const CAMERA_KEYS = Object.freeze([
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "a",
  "d",
  "e",
  "q",
  "s",
  "w"
]);
const MAX_SELECT_MOVEMENT_PX = 6;
const MAX_WHEEL_DELTA = 120;
const EDGE_SCROLL_MIN_PX = 16;
const EDGE_SCROLL_MAX_PX = 48;
const EDGE_SCROLL_VIEWPORT_RATIO = 0.06;
const KEYBOARD_HORIZONTAL_SPEED_MULTIPLIER = 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDirection(direction) {
  const length = Math.hypot(direction.x, direction.z);

  if (length <= 1) {
    return direction;
  }

  return {
    x: direction.x / length,
    z: direction.z / length
  };
}

function normalizeWheelDelta(event, target) {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * target.clientHeight;
  }

  return event.deltaY;
}

function readPointerPosition(event, target) {
  const rect = target.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    screenX: event.clientX,
    screenY: event.clientY
  };
}

function getKeyboardPan(keys) {
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const up = keys.has("arrowup") || keys.has("w");
  const down = keys.has("arrowdown") || keys.has("s");

  return normalizeDirection({
    x: (right ? 1 : 0) - (left ? 1 : 0),
    z: (up ? 1 : 0) - (down ? 1 : 0)
  });
}

function getKeyboardRotation(keys) {
  return (keys.has("e") ? 1 : 0) - (keys.has("q") ? 1 : 0);
}

function getEdgePan(position, target) {
  const width = Math.max(1, target.clientWidth);
  const height = Math.max(1, target.clientHeight);
  const edgeSize = clamp(
    Math.min(width, height) * EDGE_SCROLL_VIEWPORT_RATIO,
    EDGE_SCROLL_MIN_PX,
    EDGE_SCROLL_MAX_PX
  );
  const horizontal = position.x < edgeSize ?
    -(1 - position.x / edgeSize) :
    position.x > width - edgeSize ?
      1 - (width - position.x) / edgeSize :
      0;
  const vertical = position.y < edgeSize ?
    1 - position.y / edgeSize :
    position.y > height - edgeSize ?
      -(1 - (height - position.y) / edgeSize) :
      0;

  return normalizeDirection({ x: horizontal, z: vertical });
}

function isInteractiveElement(element) {
  const tagName = element?.tagName?.toLowerCase();

  return Boolean(
    element?.isContentEditable ||
    element?.closest?.("button, input, select, textarea, [contenteditable='true']") ||
    tagName === "button" ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea"
  );
}

function isCameraKey(event) {
  return CAMERA_KEYS.includes(event.key.toLowerCase());
}

function isSpaceKey(event) {
  return event.code === "Space" || event.key === " ";
}

export function createCursorInput({
  target,
  windowRef = target?.ownerDocument?.defaultView,
  onChange = () => {},
  onPan = () => {},
  onRotate = () => {},
  onZoom = () => {},
  onSelect = () => {},
  onPrimaryPress = () => false
} = {}) {
  if (!target) {
    throw new Error("Cursor precisa de um target DOM.");
  }

  let state = { ...DEFAULT_CURSOR_STATE };
  const keys = new Set();
  const documentRef = target.ownerDocument;

  const emit = (event, patch = {}) => {
    const pointerPosition = typeof event?.clientX === "number" ?
      readPointerPosition(event, target) :
      {};

    state = {
      ...state,
      ...pointerPosition,
      ...patch
    };
    onChange({ ...state });
  };

  const onPointerEnter = (event) => {
    const position = readPointerPosition(event, target);

    emit(event, {
      inside: true,
      edgePan: getEdgePan(position, target)
    });
  };
  const onPointerLeave = (event) => {
    if (
      (state.pressed || state.panning || state.rotating) &&
      target.hasPointerCapture?.(event.pointerId)
    ) {
      return;
    }

    emit(event, {
      pressed: false,
      panning: false,
      rotating: false,
      inside: false,
      edgePan: { x: 0, z: 0 },
      dragged: false,
      invertedPan: false,
      lastPointer: null
    });
  };

  const onPointerMove = (event) => {
    if ((state.panning || state.rotating) && state.lastPointer) {
      event.preventDefault();
      const position = readPointerPosition(event, target);
      const deltaX = position.x - state.lastPointer.x;
      const deltaY = position.y - state.lastPointer.y;

      emit(event, {
        lastPointer: position,
        edgePan: { x: 0, z: 0 }
      });
      const movement = { ...state, deltaX, deltaY };

      if (state.panning) {
        onPan(movement);
      } else {
        onRotate(movement);
      }
      return;
    }

    if (state.pressed && state.lastPointer) {
      const position = readPointerPosition(event, target);
      const deltaX = position.x - state.lastPointer.x;
      const deltaY = position.y - state.lastPointer.y;

      if (Math.hypot(deltaX, deltaY) > MAX_SELECT_MOVEMENT_PX) {
        event.preventDefault();
        emit(event, {
          pressed: false,
          panning: true,
          dragged: true,
          invertedPan: true,
          edgePan: { x: 0, z: 0 },
          lastPointer: position
        });
        onPan({ ...state, deltaX, deltaY });
        return;
      }
    }

    const position = readPointerPosition(event, target);
    emit(event, { edgePan: getEdgePan(position, target) });
  };

  const onPointerDown = (event) => {
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }

    const isPanButton = event.button === 2;
    const isRotateButton = event.button === 1;
    const pointerPosition = readPointerPosition(event, target);
    const primaryPressCanSelect = event.button === 0 && !state.spacePressed && onPrimaryPress({
      ...state,
      ...pointerPosition,
      pointerType: event.pointerType || "mouse"
    });
    if (isPanButton || isRotateButton) {
      event.preventDefault();
    }

    emit(event, {
      pressed: event.button === 0 && primaryPressCanSelect,
      panning: isPanButton || (event.button === 0 && (
        state.spacePressed || !primaryPressCanSelect
      )),
      rotating: isRotateButton,
      inside: true,
      edgePan: { x: 0, z: 0 },
      dragged: false,
      invertedPan: event.button === 0,
      lastPointer: pointerPosition
    });
  };

  const finishPointer = (event, { cancelled = false } = {}) => {
    const pointerPosition = readPointerPosition(event, target);
    const movement = state.lastPointer ? Math.hypot(
      pointerPosition.x - state.lastPointer.x,
      pointerPosition.y - state.lastPointer.y
    ) : Infinity;
    const shouldSelect = (
      !cancelled &&
      event.button === 0 &&
      state.pressed &&
      !state.dragged &&
      movement <= MAX_SELECT_MOVEMENT_PX
    );

    if (target.releasePointerCapture && target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    emit(event, {
      pressed: false,
      panning: false,
      rotating: false,
      edgePan: getEdgePan(pointerPosition, target),
      dragged: false,
      invertedPan: false,
      lastPointer: null
    });

    if (shouldSelect) {
      onSelect({
        ...state,
        ...pointerPosition,
        pointerType: event.pointerType || "mouse"
      });
    }
  };

  const onPointerUp = (event) => finishPointer(event);
  const onPointerCancel = (event) => finishPointer(event, { cancelled: true });

  const onWheel = (event) => {
    event.preventDefault();
    const position = readPointerPosition(event, target);
    emit(event, {
      inside: true,
      edgePan: getEdgePan(position, target)
    });
    onZoom({
      ...state,
      deltaY: clamp(
        normalizeWheelDelta(event, target),
        -MAX_WHEEL_DELTA,
        MAX_WHEEL_DELTA
      )
    });
  };

  const onContextMenu = (event) => {
    event.preventDefault();
  };

  const onKeyDown = (event) => {
    if ((!isCameraKey(event) && !isSpaceKey(event)) || isInteractiveElement(event.target)) {
      return;
    }

    event.preventDefault();
    const key = isSpaceKey(event) ? "space" : event.key.toLowerCase();
    keys.add(key);
    emit(null, {
      keyboardPan: getKeyboardPan(keys),
      keyboardRotation: getKeyboardRotation(keys),
      spacePressed: keys.has("space")
    });
  };

  const onKeyUp = (event) => {
    if ((!isCameraKey(event) && !isSpaceKey(event)) || isInteractiveElement(event.target)) {
      return;
    }

    event.preventDefault();
    const key = isSpaceKey(event) ? "space" : event.key.toLowerCase();
    keys.delete(key);
    emit(null, {
      keyboardPan: getKeyboardPan(keys),
      keyboardRotation: getKeyboardRotation(keys),
      spacePressed: keys.has("space")
    });
  };
  const clearTransientInput = () => {
    keys.clear();
    emit(null, {
      keyboardPan: { x: 0, z: 0 },
      edgePan: { x: 0, z: 0 },
      keyboardRotation: 0,
      spacePressed: false,
      pressed: false,
      panning: false,
      rotating: false,
      inside: false,
      dragged: false,
      invertedPan: false,
      lastPointer: null
    });
  };
  const onVisibilityChange = () => {
    if (documentRef?.hidden) {
      clearTransientInput();
    }
  };

  target.addEventListener("pointerenter", onPointerEnter);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerleave", onPointerLeave);
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);
  target.addEventListener("wheel", onWheel, { passive: false });
  target.addEventListener("contextmenu", onContextMenu);
  windowRef?.addEventListener("keydown", onKeyDown);
  windowRef?.addEventListener("keyup", onKeyUp);
  windowRef?.addEventListener("blur", clearTransientInput);
  documentRef?.addEventListener("visibilitychange", onVisibilityChange);

  return {
    getState() {
      return { ...state };
    },
    getKeyboardPan() {
      return { ...state.keyboardPan };
    },
    getNavigationIntent() {
      const edgePan = state.inside && !state.panning && !state.rotating ?
        state.edgePan :
        { x: 0, z: 0 };
      const pan = normalizeDirection({
        x: state.keyboardPan.x + edgePan.x,
        z: state.keyboardPan.z + edgePan.z
      });

      return {
        pan,
        panSpeed: {
          x: state.keyboardPan.x === 0 ? 1 : KEYBOARD_HORIZONTAL_SPEED_MULTIPLIER,
          z: 1
        },
        rotation: state.keyboardRotation
      };
    },
    destroy() {
      target.removeEventListener("pointerenter", onPointerEnter);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerCancel);
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("contextmenu", onContextMenu);
      windowRef?.removeEventListener("keydown", onKeyDown);
      windowRef?.removeEventListener("keyup", onKeyUp);
      windowRef?.removeEventListener("blur", clearTransientInput);
      documentRef?.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}
