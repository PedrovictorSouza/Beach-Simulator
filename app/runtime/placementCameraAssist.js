const DEFAULT_PLACEMENT_CAMERA_PRESET = Object.freeze({
  zoom: 6.4,
  distance: 18,
  projectionMode: "orthographic"
});

function applyPreset(camera, preset = {}) {
  if (!camera || !preset) {
    return false;
  }

  if (typeof preset.zoom === "number") {
    camera.setZoom?.(preset.zoom);
  }

  if (typeof preset.distance === "number") {
    camera.setDistance?.(preset.distance);
  }

  if (typeof preset.projectionMode === "string") {
    camera.setProjectionMode?.(preset.projectionMode);
  }

  return typeof preset.zoom === "number" ||
    typeof preset.distance === "number" ||
    typeof preset.projectionMode === "string";
}

export function createPlacementCameraAssist({
  camera,
  getGameplayPreset = null,
  placementPreset = DEFAULT_PLACEMENT_CAMERA_PRESET
} = {}) {
  let active = false;
  let restorePreset = null;

  return Object.freeze({
    update({ placementActive = false } = {}) {
      const nextActive = Boolean(placementActive);

      if (nextActive === active) {
        return {
          changed: false,
          active
        };
      }

      active = nextActive;
      if (active) {
        const gameplayPreset = typeof getGameplayPreset === "function" ? getGameplayPreset() : null;
        restorePreset = {
          ...(gameplayPreset || {}),
          projectionMode: camera?.getProjectionMode?.() || "perspective"
        };
      }

      const applied = active ?
        applyPreset(camera, placementPreset) :
        applyPreset(camera, restorePreset);
      if (!active) {
        restorePreset = null;
      }

      return {
        changed: true,
        active,
        applied
      };
    },
    isActive() {
      return active;
    }
  });
}
