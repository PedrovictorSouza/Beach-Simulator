const DEFAULT_PLACEMENT_CAMERA_PRESET = Object.freeze({
  zoom: 6.05,
  distance: 10.1
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

  return typeof preset.zoom === "number" || typeof preset.distance === "number";
}

export function createPlacementCameraAssist({
  camera,
  getGameplayPreset = null,
  placementPreset = DEFAULT_PLACEMENT_CAMERA_PRESET
} = {}) {
  let active = false;

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
      const applied = active ?
        applyPreset(camera, placementPreset) :
        applyPreset(camera, typeof getGameplayPreset === "function" ? getGameplayPreset() : null);

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
