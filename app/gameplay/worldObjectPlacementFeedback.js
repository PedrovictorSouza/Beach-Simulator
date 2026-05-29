export const WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON = Object.freeze({
  VALID: "valid",
  MISSING_GRID_CELL: "missing-grid-cell",
  OUTSIDE_WORLD_BOUNDS: "outside-world-bounds",
  OCCUPIED_FOOTPRINT: "occupied-footprint",
  MISSING_WORLD_POSITION: "missing-world-position",
  MISSING_SOURCE_ITEM: "missing-source-item",
  MISSING_GRID_PLACEABLE: "missing-grid-placeable",
  INACTIVE_PREVIEW: "inactive-preview",
  PREVIEW_NOT_READY: "preview-not-ready",
  COMMIT_REJECTED: "commit-rejected",
  UNKNOWN: "unknown"
});

const FEEDBACK_BY_REASON = Object.freeze({
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.VALID]: Object.freeze({
    result: "valid",
    severity: "ready",
    visualState: "valid",
    channels: Object.freeze(["worldPrompt", "groundHighlight", "placementPreview"]),
    message: "Place object",
    worldPrompt: "Place object",
    placementLabel: "Valid site"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_GRID_CELL]: Object.freeze({
    result: "no-target",
    severity: "nudge",
    visualState: "pending",
    channels: Object.freeze(["worldPrompt", "placementPreview"]),
    message: "Aim at buildable ground.",
    worldPrompt: "Find buildable ground",
    placementLabel: "No target"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.OUTSIDE_WORLD_BOUNDS]: Object.freeze({
    result: "blocked",
    severity: "warning",
    visualState: "invalid",
    channels: Object.freeze(["worldPrompt", "groundHighlight", "placementPreview"]),
    message: "Outside build area.",
    worldPrompt: "Move inside the build area",
    placementLabel: "Outside area"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.OCCUPIED_FOOTPRINT]: Object.freeze({
    result: "blocked",
    severity: "warning",
    visualState: "invalid",
    channels: Object.freeze(["worldPrompt", "groundHighlight", "placementPreview"]),
    message: "Blocked. Choose a clear spot.",
    worldPrompt: "Choose a clear spot",
    placementLabel: "Blocked"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_WORLD_POSITION]: Object.freeze({
    result: "blocked",
    severity: "error",
    visualState: "invalid",
    channels: Object.freeze(["notice"]),
    message: "No fixed site is configured.",
    worldPrompt: "No fixed site",
    placementLabel: "Missing site"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_SOURCE_ITEM]: Object.freeze({
    result: "blocked",
    severity: "warning",
    visualState: "invalid",
    channels: Object.freeze(["notice", "worldPrompt"]),
    message: "Missing kit.",
    worldPrompt: "Missing kit",
    placementLabel: "Missing kit"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_GRID_PLACEABLE]: Object.freeze({
    result: "blocked",
    severity: "error",
    visualState: "invalid",
    channels: Object.freeze(["notice"]),
    message: "Build plan is not ready.",
    worldPrompt: "No build plan",
    placementLabel: "Missing plan"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.INACTIVE_PREVIEW]: Object.freeze({
    result: "no-target",
    severity: "nudge",
    visualState: "pending",
    channels: Object.freeze(["notice", "worldPrompt"]),
    message: "Select a build kit first.",
    worldPrompt: "Select a build kit",
    placementLabel: "No active preview"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.PREVIEW_NOT_READY]: Object.freeze({
    result: "no-target",
    severity: "nudge",
    visualState: "pending",
    channels: Object.freeze(["worldPrompt", "placementPreview"]),
    message: "Move the preview to valid ground.",
    worldPrompt: "Move preview",
    placementLabel: "Not ready"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.COMMIT_REJECTED]: Object.freeze({
    result: "blocked",
    severity: "warning",
    visualState: "invalid",
    channels: Object.freeze(["notice", "worldPrompt", "groundHighlight"]),
    message: "Still blocked. Try another spot.",
    worldPrompt: "Still blocked",
    placementLabel: "Blocked"
  }),
  [WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.UNKNOWN]: Object.freeze({
    result: "blocked",
    severity: "warning",
    visualState: "invalid",
    channels: Object.freeze(["notice", "worldPrompt"]),
    message: "Cannot place here.",
    worldPrompt: "Cannot place here",
    placementLabel: "Invalid site"
  })
});

function normalizeReason(source) {
  if (typeof source === "string") {
    return source;
  }

  if (source?.valid === true || source?.state === "valid" || source?.confirmed === true) {
    return WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.VALID;
  }

  return source?.reason ||
    source?.preview?.reason ||
    (source?.readyForConfirm === false ? WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.PREVIEW_NOT_READY : "") ||
    WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.UNKNOWN;
}

function freezeFeedback(reason, feedback) {
  return Object.freeze({
    id: `placement-feedback:${reason}`,
    reason,
    result: feedback.result,
    severity: feedback.severity,
    visualState: feedback.visualState,
    channels: Object.freeze([...feedback.channels]),
    message: feedback.message,
    worldPrompt: feedback.worldPrompt,
    placementLabel: feedback.placementLabel,
    prompt: feedback.worldPrompt,
    repeatable: feedback.result !== "valid",
    cooldownMs: feedback.result === "valid" ? 0 : 650
  });
}

export function resolveWorldObjectPlacementFeedback(source = {}) {
  const rawReason = normalizeReason(source);
  const reason = FEEDBACK_BY_REASON[rawReason] ? rawReason : WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.UNKNOWN;

  return freezeFeedback(reason, FEEDBACK_BY_REASON[reason]);
}

export function listWorldObjectPlacementFeedbackReasons() {
  return Object.freeze(Object.keys(FEEDBACK_BY_REASON));
}
