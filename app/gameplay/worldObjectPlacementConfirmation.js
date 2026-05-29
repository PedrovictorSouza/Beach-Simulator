import { createWorldObjectPlacementPreviewDescriptor } from "./worldObjectPlacementPreview.js";

export const WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON = Object.freeze({
  CONFIRMED: "confirmed",
  INACTIVE_PREVIEW: "inactive-preview",
  PREVIEW_NOT_READY: "preview-not-ready",
  COMMIT_REJECTED: "commit-rejected"
});

function cloneCell(cell) {
  return cell ? Object.freeze({ x: cell.x, y: cell.y }) : null;
}

function cloneFootprint(footprint) {
  return footprint ? Object.freeze({ width: footprint.width, height: footprint.height }) : null;
}

function getObjectValue(object, key) {
  return object?.metadata?.[key] ?? object?.[key] ?? null;
}

function resolvePlacementRecordId(objectId, originCell, context = {}) {
  if (context.placedObjectId) {
    return String(context.placedObjectId);
  }

  return `${objectId}@${originCell.x}:${originCell.y}`;
}

function createFailureResult(reason, preview) {
  return Object.freeze({
    confirmed: false,
    committed: false,
    reason,
    preview,
    placementRecord: null,
    committedRecord: null,
    effects: Object.freeze([])
  });
}

export function createWorldObjectPlacementRecord(object, preview, context = {}) {
  if (!preview?.readyForConfirm || !preview.originCell) {
    return null;
  }

  const objectId = preview.objectId;
  const originCell = cloneCell(preview.originCell);
  const footprint = cloneFootprint(preview.footprint);
  const sourceItemId = context.sourceItemId || getObjectValue(object, "sourceItemId");
  const gridPlaceableId = context.gridPlaceableId || getObjectValue(object, "gridPlaceableId");
  const sourceDatabaseId = context.sourceDatabaseId || gridPlaceableId || objectId;

  return Object.freeze({
    placedObjectId: resolvePlacementRecordId(objectId, originCell, context),
    worldObjectId: objectId,
    sourceDatabaseId,
    sourceItemId,
    gridPlaceableId,
    originCell,
    size: footprint,
    footprint,
    occupiedCells: Object.freeze(preview.cells.map((entry) => cloneCell(entry.cell))),
    placementRuleType: preview.placementRuleType,
    createdBy: "world-object-placement-confirmation"
  });
}

function resolveCommitAdapter(context = {}) {
  if (typeof context.commitPlacement === "function") {
    return context.commitPlacement;
  }

  const store = context.placementStore || context.occupancyStore || context.worldStore || null;
  if (store && typeof store.addPlacedObject === "function") {
    return (record) => store.addPlacedObject(record);
  }

  if (store && typeof store.placeObject === "function") {
    return (record) => store.placeObject(record);
  }

  return null;
}

function buildConfirmationEffects(record) {
  const effects = [
    Object.freeze({
      type: "place-world-object",
      objectId: record.worldObjectId,
      placedObjectId: record.placedObjectId,
      originCell: cloneCell(record.originCell),
      footprint: cloneFootprint(record.footprint)
    })
  ];

  if (record.sourceItemId) {
    effects.push(Object.freeze({
      type: "consume-item",
      itemId: record.sourceItemId,
      quantity: 1
    }));
  }

  return Object.freeze(effects);
}

export function confirmWorldObjectPlacement(object, context = {}) {
  const preview = context.preview || createWorldObjectPlacementPreviewDescriptor(object, context);

  if (!preview.active) {
    return createFailureResult(WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.INACTIVE_PREVIEW, preview);
  }

  if (!preview.readyForConfirm) {
    return createFailureResult(preview.reason || WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.PREVIEW_NOT_READY, preview);
  }

  const placementRecord = createWorldObjectPlacementRecord(object, preview, context);
  const commitAdapter = resolveCommitAdapter(context);
  const committedRecord = commitAdapter ? commitAdapter(placementRecord) : null;

  if (commitAdapter && !committedRecord) {
    return Object.freeze({
      confirmed: false,
      committed: false,
      reason: WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.COMMIT_REJECTED,
      preview,
      placementRecord,
      committedRecord: null,
      effects: Object.freeze([])
    });
  }

  return Object.freeze({
    confirmed: true,
    committed: Boolean(committedRecord),
    reason: WORLD_OBJECT_PLACEMENT_CONFIRMATION_REASON.CONFIRMED,
    preview,
    placementRecord,
    committedRecord: committedRecord || null,
    effects: buildConfirmationEffects(placementRecord)
  });
}
