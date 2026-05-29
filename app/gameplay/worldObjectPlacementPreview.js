import { validateWorldObjectPlacement } from "./worldObjectPlacementValidation.js";

const PREVIEW_VISUALS = Object.freeze({
  pending: Object.freeze({
    alpha: 0.36,
    tint: Object.freeze([1, 0.84, 0.43]),
    tintStrength: 0.34,
    outline: "#ffd66d"
  }),
  valid: Object.freeze({
    alpha: 0.64,
    tint: Object.freeze([0.55, 1, 0.46]),
    tintStrength: 0.22,
    outline: "#7effa5"
  }),
  invalid: Object.freeze({
    alpha: 0.42,
    tint: Object.freeze([1, 0.04, 0.02]),
    tintStrength: 0.82,
    outline: "#ff5a36"
  })
});

function cloneCell(cell) {
  return cell ? Object.freeze({ x: cell.x, y: cell.y }) : null;
}

function cloneFootprint(footprint) {
  return footprint ? Object.freeze({ width: footprint.width, height: footprint.height }) : null;
}

function cloneVisual(visual) {
  return Object.freeze({
    ...visual,
    tint: Object.freeze([...visual.tint])
  });
}

function resolvePreviewState(validation) {
  if (validation.valid) {
    return "valid";
  }

  return validation.reason === "missing-grid-cell" ? "pending" : "invalid";
}

function resolveCellState(cell, placementArea, valid) {
  if (placementArea && typeof placementArea.isCellInside === "function" && !placementArea.isCellInside(cell)) {
    return "outside";
  }

  if (placementArea && typeof placementArea.isCellBlocked === "function" && placementArea.isCellBlocked(cell)) {
    return "blocked";
  }

  if (placementArea && typeof placementArea.isCellAllowed === "function" && !placementArea.isCellAllowed(cell)) {
    return "restricted";
  }

  return valid ? "valid" : "available";
}

function buildPreviewCells(validation, placementArea = null) {
  return Object.freeze(validation.footprintCells.map((cell) => Object.freeze({
    cell: cloneCell(cell),
    state: resolveCellState(cell, placementArea, validation.valid)
  })));
}

function resolveWorldPosition(validation, context = {}) {
  if (!validation.originCell) {
    return null;
  }

  const grid = context.gridSystem || context.grid || null;
  if (grid && typeof grid.cellToWorld === "function") {
    return Object.freeze(grid.cellToWorld(validation.originCell, {
      includeVisualOffset: true
    }));
  }

  return context.worldPosition ? Object.freeze({ ...context.worldPosition }) : null;
}

export function createWorldObjectPlacementPreviewDescriptor(object, context = {}) {
  const validation = validateWorldObjectPlacement(object, context);
  const state = resolvePreviewState(validation);
  const visual = PREVIEW_VISUALS[state];
  const active = context.active ?? true;
  const readyForConfirm = Boolean(active && validation.valid && validation.originCell);
  const cells = buildPreviewCells(validation, context.placementArea || null);

  return Object.freeze({
    kind: "world-object-placement-preview",
    active,
    readyForConfirm,
    state,
    reason: validation.valid ? null : validation.reason,
    objectId: validation.objectId,
    placementRuleType: validation.placementRuleType,
    originCell: cloneCell(validation.originCell),
    worldPosition: resolveWorldPosition(validation, context),
    footprint: cloneFootprint(validation.footprint),
    cells,
    outline: Object.freeze({
      state,
      originCell: cloneCell(validation.originCell),
      footprint: cloneFootprint(validation.footprint),
      cellCount: cells.length
    }),
    visual: cloneVisual(visual),
    validation
  });
}
