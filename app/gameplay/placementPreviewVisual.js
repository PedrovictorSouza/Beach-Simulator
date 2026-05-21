const VALID_PREVIEW_TINT = Object.freeze([0.55, 1, 0.46]);
const INVALID_PREVIEW_TINT = Object.freeze([1, 0.04, 0.02]);

function normalizePulse(timeSeconds = 0) {
  const time = Number.isFinite(timeSeconds) ? timeSeconds : 0;
  return (Math.sin(time * 5.4) + 1) * 0.5;
}

export function resolveWorkbenchPlacementPreviewVisual({
  valid = true,
  timeSeconds = 0
} = {}) {
  const pulse = normalizePulse(timeSeconds);

  if (!valid) {
    return {
      alpha: 0.44 + pulse * 0.04,
      tint: [...INVALID_PREVIEW_TINT],
      tintStrength: 0.74 + pulse * 0.1
    };
  }

  return {
    alpha: 0.5 + pulse * 0.08,
    tint: [...VALID_PREVIEW_TINT],
    tintStrength: 0.18 + pulse * 0.12
  };
}
