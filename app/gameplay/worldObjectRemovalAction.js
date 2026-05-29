import {
  getGridCellRect,
  normalizeGridCell
} from "./worldCoordinateModel.js";

export const WORLD_OBJECT_REMOVAL_REASON = Object.freeze({
  REMOVED: "removed",
  MISSING_TARGET_CELL: "missing-target-cell",
  MISSING_OBJECT: "missing-object",
  LOCKED_OBJECT: "locked-object",
  COMMIT_REJECTED: "commit-rejected"
});

function cloneCell(cell) {
  return cell ? Object.freeze({ x: cell.x, y: cell.y }) : null;
}

function cloneFootprint(footprint) {
  return footprint ? Object.freeze({ width: footprint.width, height: footprint.height }) : null;
}

function resolveStore(context = {}) {
  return context.placementStore || context.occupancyStore || context.worldStore || null;
}

function resolveTargetCell(context = {}) {
  const source = context.targetCell ||
    context.cell ||
    context.originCell ||
    context.record?.originCell ||
    context.removalTarget?.originCell;

  return source ? cloneCell(normalizeGridCell(source)) : null;
}

function resolveRecord(context = {}, targetCell = null) {
  if (context.record) {
    return context.record;
  }

  if (context.removalTarget?.record) {
    return context.removalTarget.record;
  }

  const store = resolveStore(context);
  if (!targetCell || !store) {
    return null;
  }

  if (typeof store.getObjectAt === "function") {
    return store.getObjectAt(targetCell);
  }

  if (typeof store.getPlacedObjectAt === "function") {
    return store.getPlacedObjectAt(targetCell);
  }

  return null;
}

function isRecordRemovable(record = {}) {
  return Boolean(record && record.removable !== false && record.locked !== true);
}

function resolveObjectId(record = {}) {
  return record.worldObjectId ||
    record.objectId ||
    record.sourceDatabaseId ||
    record.sourceId ||
    record.placeableId ||
    record.placedObjectId ||
    record.id ||
    "world-object";
}

function resolvePlacedObjectId(record = {}, objectId = "world-object") {
  return record.placedObjectId || record.id || objectId;
}

function resolveFootprint(record = {}) {
  return cloneFootprint(record.footprint || record.size || { width: 1, height: 1 });
}

function resolveOccupiedCells(record = {}, originCell = null, footprint = null) {
  if (Array.isArray(record.occupiedCells)) {
    return Object.freeze(record.occupiedCells.map((cell) => cloneCell(cell)).filter(Boolean));
  }

  if (originCell && footprint) {
    return Object.freeze(getGridCellRect(originCell, footprint).map((cell) => cloneCell(cell)));
  }

  return Object.freeze([]);
}

export function createWorldObjectRemovalRecord(record, context = {}) {
  if (!record) {
    return null;
  }

  const objectId = resolveObjectId(record);
  const placedObjectId = resolvePlacedObjectId(record, objectId);
  const targetCell = resolveTargetCell({ ...context, record });
  const originCell = cloneCell(record.originCell || targetCell);
  const footprint = resolveFootprint(record);
  const occupiedCells = resolveOccupiedCells(record, originCell, footprint);

  return Object.freeze({
    placedObjectId,
    worldObjectId: objectId,
    sourceDatabaseId: record.sourceDatabaseId || record.sourceId || objectId,
    targetCell,
    originCell,
    size: footprint,
    footprint,
    occupiedCells,
    removable: isRecordRemovable(record),
    removedBy: "world-object-removal-action"
  });
}

function createFailureResult(reason, targetCell, record = null, removalRecord = null) {
  return Object.freeze({
    removed: false,
    committed: false,
    reason,
    targetCell,
    record,
    removalRecord,
    committedRecord: null,
    effects: Object.freeze([])
  });
}

function resolveCommitAdapter(context = {}) {
  if (typeof context.commitRemoval === "function") {
    return (removalRecord, targetCell, record) => context.commitRemoval(removalRecord, targetCell, record);
  }

  if (typeof context.removePlacement === "function") {
    return (removalRecord, targetCell, record) => context.removePlacement(removalRecord, targetCell, record);
  }

  const store = resolveStore(context);
  if (store && typeof store.removePlacedObjectAt === "function") {
    return (_removalRecord, targetCell) => store.removePlacedObjectAt(targetCell);
  }

  if (store && typeof store.removeObjectAt === "function") {
    return (_removalRecord, targetCell) => store.removeObjectAt(targetCell);
  }

  if (store && typeof store.removeObject === "function") {
    return (removalRecord) => store.removeObject(removalRecord.placedObjectId);
  }

  return null;
}

function normalizeCommittedRecord(commitResult, removalRecord) {
  if (commitResult === true) {
    return removalRecord;
  }

  return commitResult || null;
}

function buildRemovalEffects(removalRecord) {
  return Object.freeze([
    Object.freeze({
      type: "remove-world-object",
      objectId: removalRecord.worldObjectId,
      placedObjectId: removalRecord.placedObjectId,
      targetCell: cloneCell(removalRecord.targetCell),
      originCell: cloneCell(removalRecord.originCell)
    }),
    Object.freeze({
      type: "release-footprint",
      placedObjectId: removalRecord.placedObjectId,
      cells: Object.freeze(removalRecord.occupiedCells.map((cell) => cloneCell(cell)))
    })
  ]);
}

export function confirmWorldObjectRemoval(context = {}) {
  const targetCell = resolveTargetCell(context);
  if (!targetCell) {
    return createFailureResult(WORLD_OBJECT_REMOVAL_REASON.MISSING_TARGET_CELL, null);
  }

  const record = resolveRecord(context, targetCell);
  if (!record) {
    return createFailureResult(WORLD_OBJECT_REMOVAL_REASON.MISSING_OBJECT, targetCell);
  }

  const removalRecord = createWorldObjectRemovalRecord(record, {
    ...context,
    targetCell
  });
  if (!removalRecord.removable) {
    return createFailureResult(WORLD_OBJECT_REMOVAL_REASON.LOCKED_OBJECT, targetCell, record, removalRecord);
  }

  const commitAdapter = resolveCommitAdapter(context);
  const committedRecord = commitAdapter ?
    normalizeCommittedRecord(commitAdapter(removalRecord, targetCell, record), removalRecord) :
    null;

  if (commitAdapter && !committedRecord) {
    return createFailureResult(WORLD_OBJECT_REMOVAL_REASON.COMMIT_REJECTED, targetCell, record, removalRecord);
  }

  return Object.freeze({
    removed: true,
    committed: Boolean(committedRecord),
    reason: WORLD_OBJECT_REMOVAL_REASON.REMOVED,
    targetCell,
    record,
    removalRecord,
    committedRecord,
    effects: buildRemovalEffects(removalRecord)
  });
}
