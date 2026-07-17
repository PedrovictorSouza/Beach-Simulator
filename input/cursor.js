const DEFAULT_CURSOR_STATE = Object.freeze({
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0,
  pressed: false,
  panning: false,
  inside: false,
  keyboardPan: { x: 0, z: 0 },
  lastPointer: null
});

const CAMERA_KEYS = Object.freeze([
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "a",
  "d",
  "s",
  "w"
]);
const MAX_SELECT_MOVEMENT_PX = 6;

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

  return {
    x: (right ? 1 : 0) - (left ? 1 : 0),
    z: (up ? 1 : 0) - (down ? 1 : 0)
  };
}

function isCameraKey(event) {
  return CAMERA_KEYS.includes(event.key.toLowerCase());
}

export function createCursorInput({
  target,
  windowRef = target?.ownerDocument?.defaultView,
  onChange = () => {},
  onPan = () => {},
  onZoom = () => {},
  onSelect = () => {}
} = {}) {
  if (!target) {
    throw new Error("Cursor precisa de um target DOM.");
  }

  let state = { ...DEFAULT_CURSOR_STATE };
  const keys = new Set();

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

  const onPointerEnter = (event) => emit(event, { inside: true });
  const onPointerLeave = (event) => emit(event, {
    pressed: false,
    panning: false,
    inside: false,
    lastPointer: null
  });

  const onPointerMove = (event) => {
    if (state.panning && state.lastPointer) {
      event.preventDefault();
      const position = readPointerPosition(event, target);
      const deltaX = position.x - state.lastPointer.x;
      const deltaY = position.y - state.lastPointer.y;

      emit(event, { lastPointer: position });
      onPan({
        ...state,
        deltaX,
        deltaY
      });
      return;
    }

    emit(event);
  };

  const onPointerDown = (event) => {
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }

    const isPanButton = event.button === 2 || event.button === 1;
    if (isPanButton) {
      event.preventDefault();
    }

    emit(event, {
      pressed: event.button === 0,
      panning: isPanButton,
      inside: true,
      lastPointer: readPointerPosition(event, target)
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
      movement <= MAX_SELECT_MOVEMENT_PX
    );

    if (target.releasePointerCapture && target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    emit(event, {
      pressed: false,
      panning: false,
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
    emit(event, { inside: true });
    onZoom({
      ...state,
      deltaY: normalizeWheelDelta(event, target)
    });
  };

  const onContextMenu = (event) => {
    event.preventDefault();
  };

  const onKeyDown = (event) => {
    if (!isCameraKey(event)) {
      return;
    }

    event.preventDefault();
    keys.add(event.key.toLowerCase());
    emit(null, { keyboardPan: getKeyboardPan(keys) });
  };

  const onKeyUp = (event) => {
    if (!isCameraKey(event)) {
      return;
    }

    event.preventDefault();
    keys.delete(event.key.toLowerCase());
    emit(null, { keyboardPan: getKeyboardPan(keys) });
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

  return {
    getState() {
      return { ...state };
    },
    getKeyboardPan() {
      return { ...state.keyboardPan };
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
    }
  };
}
