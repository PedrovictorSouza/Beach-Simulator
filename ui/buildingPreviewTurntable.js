import { createStaticCamera } from "../camera/staticCamera.js";
import {
  createScenerySceneObjects,
  loadSceneryAsset
} from "../scenery/sceneryWorld.js";
import { createWorldRenderer } from "../rendering/worldRenderer.js";

const PREVIEW_WIDTH = 144;
const PREVIEW_HEIGHT = 96;
const PREVIEW_FOV = (36 * Math.PI) / 180;
const PREVIEW_CAMERA_DIRECTION = [0.62, 0.34, 1];
const PREVIEW_MODEL_SCALE = 0.8;
const PREVIEW_PADDING = 1.45 / PREVIEW_MODEL_SCALE;
const TURNTABLE_STEP_COUNT = 24;
const TURNTABLE_STEP_DURATION_MS = 75;
const FULL_TURN_RADIANS = Math.PI * 2;

function getPositiveDimension(value) {
  return Math.max(0.001, Number(value) || 0);
}

export function getBuildingPreviewYawOffset(elapsedMilliseconds) {
  const elapsed = Math.max(0, Number(elapsedMilliseconds) || 0);
  const step = Math.floor(elapsed / TURNTABLE_STEP_DURATION_MS) %
    TURNTABLE_STEP_COUNT;

  return (step / TURNTABLE_STEP_COUNT) * FULL_TURN_RADIANS;
}

function createPreviewCamera(model) {
  const width = getPositiveDimension(model?.size?.[0]);
  const height = getPositiveDimension(model?.size?.[1]);
  const depth = getPositiveDimension(model?.size?.[2]);
  const horizontalSpan = Math.hypot(width, depth);
  const aspect = PREVIEW_WIDTH / PREVIEW_HEIGHT;
  const halfFovTangent = Math.tan(PREVIEW_FOV * 0.5);
  const verticalFitDistance = height / (2 * halfFovTangent);
  const horizontalFitDistance = horizontalSpan / (
    2 * halfFovTangent * aspect
  );
  const distance = Math.max(
    verticalFitDistance,
    horizontalFitDistance
  ) * PREVIEW_PADDING;

  return createStaticCamera({
    target: [0, height * 0.48, 0],
    direction: PREVIEW_CAMERA_DIRECTION,
    distance,
    minDistance: 0.01,
    maxDistance: Math.max(1, distance * 2),
    fov: PREVIEW_FOV,
    near: 0.01,
    far: Math.max(100, distance * 8)
  });
}

function setPreviewState(record, state) {
  record.canvas.dataset.previewState = state;
}

export function createBuildingPreviewTurntable({
  documentRef,
  windowRef = documentRef?.defaultView
} = {}) {
  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("BuildingPreviewTurntable precisa de um document.");
  }

  const renderCanvas = documentRef.createElement("canvas");
  const records = new Set();
  const assetPromises = new Map();
  const requestFrame = typeof windowRef?.requestAnimationFrame === "function" ?
    windowRef.requestAnimationFrame.bind(windowRef) :
    (callback) => setTimeout(() => callback(Date.now()), 16);
  const cancelFrame = typeof windowRef?.cancelAnimationFrame === "function" ?
    windowRef.cancelAnimationFrame.bind(windowRef) :
    clearTimeout;
  let renderer = null;
  let frameRequest = null;
  let disposed = false;

  function getNow() {
    return Number(windowRef?.performance?.now?.()) || Date.now();
  }

  function prefersReducedMotion() {
    return Boolean(
      windowRef?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    );
  }

  function getRenderer() {
    if (renderer) {
      return renderer;
    }

    renderer = createWorldRenderer({
      canvas: renderCanvas,
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      pixelSnap: [PREVIEW_WIDTH / 2, PREVIEW_HEIGHT / 2],
      oceanEnabled: false,
      preserveDrawingBuffer: true
    });
    renderer.resize();
    return renderer;
  }

  function loadAsset(type) {
    if (!assetPromises.has(type)) {
      const previewRenderer = getRenderer();

      assetPromises.set(type, loadSceneryAsset({
        gl: previewRenderer.getContext(),
        type
      }));
    }

    return assetPromises.get(type);
  }

  function renderRecord(record, yawOffset = 0, timeMilliseconds = getNow()) {
    if (record.destroyed || !record.sceneObjects || !record.camera) {
      return;
    }

    const previewRenderer = getRenderer();
    const instance = record.sceneObjects[0]?.instances?.[0];

    if (!instance) {
      return;
    }

    instance.yaw = record.baseYaw + record.camera.getYaw() + yawOffset;
    previewRenderer.renderFrame({
      viewProjection: record.camera.getViewProjection(
        PREVIEW_WIDTH,
        PREVIEW_HEIGHT
      ),
      sceneObjects: record.sceneObjects,
      cameraTarget: record.camera.getTarget(),
      timeSeconds: timeMilliseconds / 1000
    });
    record.context.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    record.context.drawImage(
      renderCanvas,
      0,
      0,
      PREVIEW_WIDTH,
      PREVIEW_HEIGHT
    );
  }

  function hasActiveRecord() {
    return [...records].some((record) => (
      !record.destroyed &&
      record.ready &&
      record.active &&
      !prefersReducedMotion()
    ));
  }

  function renderAnimationFrame(timeMilliseconds) {
    frameRequest = null;

    for (const record of records) {
      if (
        record.destroyed ||
        !record.ready ||
        !record.active ||
        prefersReducedMotion()
      ) {
        continue;
      }

      renderRecord(
        record,
        getBuildingPreviewYawOffset(timeMilliseconds - record.rotationStartedAt),
        timeMilliseconds
      );
    }

    if (hasActiveRecord()) {
      frameRequest = requestFrame(renderAnimationFrame);
    }
  }

  function scheduleAnimation() {
    if (frameRequest !== null || !hasActiveRecord()) {
      return;
    }

    frameRequest = requestFrame(renderAnimationFrame);
  }

  function updateActiveState(record) {
    const active = record.pointerActive;

    if (active === record.active) {
      return;
    }

    record.active = active;
    record.canvas.dataset.previewSpinning = active ? "true" : "false";

    if (active && !prefersReducedMotion()) {
      record.rotationStartedAt = getNow();
      scheduleAnimation();
      return;
    }

    if (record.ready) {
      renderRecord(record, 0);
    }
  }

  function attach({ canvas, interactionElement, type }) {
    if (disposed) {
      throw new Error("BuildingPreviewTurntable ja foi descartado.");
    }

    if (!canvas || typeof canvas.getContext !== "function") {
      throw new Error("Preview de construcao precisa de um canvas.");
    }

    if (!interactionElement) {
      throw new Error("Preview de construcao precisa de uma area interativa.");
    }

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D indisponivel para preview de construcao.");
    }

    canvas.width = PREVIEW_WIDTH;
    canvas.height = PREVIEW_HEIGHT;
    context.imageSmoothingEnabled = false;

    const record = {
      canvas,
      context,
      interactionElement,
      type,
      sceneObjects: null,
      camera: null,
      baseYaw: 0,
      pointerActive: false,
      active: false,
      ready: false,
      destroyed: false,
      rotationStartedAt: 0,
      listeners: []
    };

    const listen = (eventName, listener) => {
      interactionElement.addEventListener(eventName, listener);
      record.listeners.push([eventName, listener]);
    };

    listen("pointerenter", () => {
      record.pointerActive = true;
      updateActiveState(record);
    });
    listen("pointerleave", () => {
      record.pointerActive = false;
      updateActiveState(record);
    });

    records.add(record);
    setPreviewState(record, "loading");

    void loadAsset(type)
      .then((asset) => {
        if (record.destroyed) {
          return;
        }

        record.sceneObjects = createScenerySceneObjects({
          sceneryAsset: asset,
          position: [0, 0, 0]
        });
        record.camera = createPreviewCamera(asset.model);
        record.baseYaw = record.sceneObjects[0].instances[0].yaw;
        record.ready = true;
        setPreviewState(record, "ready");
        renderRecord(record, 0);
        scheduleAnimation();
      })
      .catch((error) => {
        if (record.destroyed) {
          return;
        }

        setPreviewState(record, "error");
        console.warn(`Preview 3D indisponivel para ${type}.`, error);
      });

    return Object.freeze({
      release() {
        if (record.destroyed) {
          return;
        }

        record.destroyed = true;
        for (const [eventName, listener] of record.listeners) {
          interactionElement.removeEventListener(eventName, listener);
        }
        records.delete(record);
      }
    });
  }

  return Object.freeze({
    attach,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      if (frameRequest !== null) {
        cancelFrame(frameRequest);
        frameRequest = null;
      }
      for (const record of [...records]) {
        record.destroyed = true;
        for (const [eventName, listener] of record.listeners) {
          record.interactionElement.removeEventListener(eventName, listener);
        }
      }
      records.clear();
      renderer?.dispose();
      renderer = null;
    }
  });
}
