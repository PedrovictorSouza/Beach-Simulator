export function projectWorldPositionToViewport({
  position,
  camera,
  worldCanvas
} = {}) {
  if (
    !Array.isArray(position) ||
    typeof camera?.project !== "function" ||
    !worldCanvas
  ) {
    return null;
  }

  const canvasWidth = worldCanvas.width || 0;
  const canvasHeight = worldCanvas.height || 0;

  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return null;
  }

  camera.getViewProjection?.(canvasWidth, canvasHeight);
  const projected = camera.project(
    [position[0], (position[1] || 0) + 0.5, position[2]],
    canvasWidth,
    canvasHeight
  );

  if (!projected || projected.depth > 1) {
    return null;
  }

  const rect = worldCanvas.getBoundingClientRect?.();

  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { x: projected.x, y: projected.y };
  }

  return {
    x: rect.left + projected.x * (rect.width / canvasWidth),
    y: rect.top + projected.y * (rect.height / canvasHeight)
  };
}

export function getCanvasCenterViewportOrigin({
  worldCanvas,
  globalObject = globalThis
} = {}) {
  const rect = worldCanvas?.getBoundingClientRect?.();

  if (rect && rect.width > 0 && rect.height > 0) {
    return {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.5
    };
  }

  const windowRef = worldCanvas?.ownerDocument?.defaultView || globalObject.window;

  return {
    x: Number(windowRef?.innerWidth || 0) * 0.5,
    y: Number(windowRef?.innerHeight || 0) * 0.5
  };
}

export function isViewportOriginUsable({
  origin,
  worldCanvas,
  globalObject = globalThis
} = {}) {
  if (
    !origin ||
    !Number.isFinite(origin.x) ||
    !Number.isFinite(origin.y)
  ) {
    return false;
  }

  const windowRef = worldCanvas?.ownerDocument?.defaultView || globalObject.window;
  const viewportWidth = Number(windowRef?.innerWidth || 0);
  const viewportHeight = Number(windowRef?.innerHeight || 0);

  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return true;
  }

  const margin = 64;

  return (
    origin.x >= -margin &&
    origin.y >= -margin &&
    origin.x <= viewportWidth + margin &&
    origin.y <= viewportHeight + margin
  );
}

export function resolveSupplyPickupViewportOrigin({
  sourcePosition,
  getPlayerPosition = () => null,
  camera,
  worldCanvas,
  globalObject = globalThis
} = {}) {
  const sourceOrigin = projectWorldPositionToViewport({
    position: sourcePosition,
    camera,
    worldCanvas
  });

  if (isViewportOriginUsable({ origin: sourceOrigin, worldCanvas, globalObject })) {
    return sourceOrigin;
  }

  const playerOrigin = projectWorldPositionToViewport({
    position: getPlayerPosition?.(),
    camera,
    worldCanvas
  });

  if (isViewportOriginUsable({ origin: playerOrigin, worldCanvas, globalObject })) {
    return playerOrigin;
  }

  return getCanvasCenterViewportOrigin({ worldCanvas, globalObject });
}
