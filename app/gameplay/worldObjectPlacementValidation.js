import {
  doesGridRectFitBounds,
  getGridCellRect,
  normalizeGridCell
} from "./worldCoordinateModel.js";
import {
  getWorldObjectPlacementRules,
  normalizeWorldObjectMetadata
} from "./worldObjectRegistry.js";

function freezeFailure(failure) {
  return Object.freeze(failure);
}

function resolveObjectMetadata(object) {
  if (object?.metadata) {
    return object.metadata;
  }

  return normalizeWorldObjectMetadata(object);
}

function resolveOriginCell(context = {}) {
  const source = context.originCell || context.targetCell || context.cell;
  return source ? normalizeGridCell(source) : null;
}

function resolveWorldPosition(metadata, context = {}) {
  return metadata.position || context.worldPosition || context.position || null;
}

function hasObjectOrContextValue(metadata, context, key) {
  return Boolean(metadata[key] || context[key]);
}

function isInsideBounds(originCell, footprint, context = {}) {
  const bounds = context.bounds || context.placementArea?.bounds || null;
  return bounds ? doesGridRectFitBounds(originCell, footprint, bounds) : true;
}

function canUseFootprint(originCell, footprint, context = {}) {
  if (context.occupancyStore && typeof context.occupancyStore.canPlace === "function") {
    return Boolean(context.occupancyStore.canPlace(originCell, footprint));
  }

  if (context.placementArea && typeof context.placementArea.canPlaceRect === "function") {
    return Boolean(context.placementArea.canPlaceRect(originCell, footprint));
  }

  return true;
}

function validateRequirements(metadata, placementRules, context, originCell) {
  const failures = [];

  for (const requirement of placementRules.requires) {
    if (requirement === "grid-cell" && !originCell) {
      failures.push(freezeFailure({
        code: "missing-grid-cell",
        source: "requirement",
        requirement
      }));
    }

    if (requirement === "world-position" && !resolveWorldPosition(metadata, context)) {
      failures.push(freezeFailure({
        code: "missing-world-position",
        source: "requirement",
        requirement
      }));
    }

    if (requirement === "source-item" && !hasObjectOrContextValue(metadata, context, "sourceItemId")) {
      failures.push(freezeFailure({
        code: "missing-source-item",
        source: "requirement",
        requirement
      }));
    }

    if (requirement === "grid-placeable" && !hasObjectOrContextValue(metadata, context, "gridPlaceableId")) {
      failures.push(freezeFailure({
        code: "missing-grid-placeable",
        source: "requirement",
        requirement
      }));
    }
  }

  return failures;
}

function validateBlockers(placementRules, context, originCell) {
  if (!originCell) {
    return [];
  }

  const failures = [];
  for (const blocker of placementRules.blockers) {
    if (blocker === "world-bounds" && !isInsideBounds(originCell, placementRules.footprint, context)) {
      failures.push(freezeFailure({
        code: "outside-world-bounds",
        source: "blocker",
        blocker
      }));
    }

    if (blocker === "occupied-footprint" && !canUseFootprint(originCell, placementRules.footprint, context)) {
      failures.push(freezeFailure({
        code: "occupied-footprint",
        source: "blocker",
        blocker
      }));
    }
  }

  return failures;
}

export function validateWorldObjectPlacement(object, context = {}) {
  const metadata = resolveObjectMetadata(object);
  const placementRules = getWorldObjectPlacementRules(metadata);
  const originCell = resolveOriginCell(context);
  const failures = Object.freeze([
    ...validateRequirements(metadata, placementRules, context, originCell),
    ...validateBlockers(placementRules, context, originCell)
  ]);
  const footprintCells = Object.freeze(originCell ? getGridCellRect(originCell, placementRules.footprint) : []);
  const valid = failures.length === 0;

  return Object.freeze({
    valid,
    reason: valid ? "valid" : failures[0].code,
    objectId: metadata.id,
    placementRuleType: placementRules.type,
    originCell,
    footprint: placementRules.footprint,
    footprintCells,
    failures
  });
}
