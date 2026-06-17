import { createCameraDebugFrameState } from "./cameraDebugFrameState.js";

export function isCameraDebugEnabled(globalObject = globalThis) {
  try {
    return new URLSearchParams(globalObject.location?.search || "")
      .get("cameraDebug") === "1";
  } catch {
    return false;
  }
}

export function createCameraDebugRuntime({
  enabled = false,
  mount,
  performanceNow = () => performance.now(),
  readFrameState = () => ({}),
  createFrameState = createCameraDebugFrameState
} = {}) {
  let element = null;
  const errors = [];

  function pushError(message) {
    errors.push({
      at: Math.round(performanceNow()),
      message
    });

    if (errors.length > 4) {
      errors.shift();
    }
  }

  function attachGlobalListeners(globalObject = globalThis) {
    if (!enabled || typeof globalObject?.addEventListener !== "function") {
      return;
    }

    globalObject.addEventListener("error", (event) => {
      pushError(event?.message || "Unknown window error");
    });
    globalObject.addEventListener("unhandledrejection", (event) => {
      pushError(String(event?.reason?.message || event?.reason || "Unhandled rejection"));
    });
  }

  function update(debugState) {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    if (!element) {
      element = document.createElement("pre");
      element.style.cssText = [
        "position:absolute",
        "right:12px",
        "top:12px",
        "z-index:9999",
        "margin:0",
        "padding:10px",
        "max-width:360px",
        "background:rgba(0,0,0,0.78)",
        "color:#7dff9a",
        "font:12px/1.35 monospace",
        "pointer-events:none",
        "white-space:pre-wrap"
      ].join(";");
      mount.append(element);
    }

    element.textContent = JSON.stringify({
      ...debugState,
      errors
    }, null, 2);
  }

  function updateFrameOverlay(frameState = {}) {
    if (!enabled) {
      return;
    }

    update(createFrameState({
      ...frameState,
      ...readFrameState(frameState)
    }));
  }

  return {
    pushError,
    attachGlobalListeners,
    update,
    updateFrameOverlay
  };
}
