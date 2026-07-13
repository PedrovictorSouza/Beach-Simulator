const DEFAULT_CURSOR_STATE = Object.freeze({
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0,
  pressed: false,
  inside: false
});

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

export function createCursorInput({ target, onChange = () => {}, onZoom = () => {} } = {}) {
  if (!target) {
    throw new Error("Cursor precisa de um target DOM.");
  }

  let state = { ...DEFAULT_CURSOR_STATE };

  const emit = (event, patch = {}) => {
    state = {
      ...state,
      ...readPointerPosition(event, target),
      ...patch
    };
    onChange({ ...state });
  };

  const onPointerEnter = (event) => emit(event, { inside: true });
  const onPointerMove = (event) => emit(event);
  const onPointerLeave = (event) => emit(event, { pressed: false, inside: false });

  const onPointerDown = (event) => {
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }

    emit(event, { pressed: true, inside: true });
  };

  const onPointerUp = (event) => {
    if (target.releasePointerCapture && target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    emit(event, { pressed: false });
  };

  const onWheel = (event) => {
    event.preventDefault();
    emit(event, { inside: true });
    onZoom({
      ...state,
      deltaY: normalizeWheelDelta(event, target)
    });
  };

  target.addEventListener("pointerenter", onPointerEnter);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerleave", onPointerLeave);
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerUp);
  target.addEventListener("wheel", onWheel, { passive: false });

  return {
    getState() {
      return { ...state };
    },
    destroy() {
      target.removeEventListener("pointerenter", onPointerEnter);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
      target.removeEventListener("wheel", onWheel);
    }
  };
}
