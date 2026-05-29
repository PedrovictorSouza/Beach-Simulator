import {
  getGridCellKey,
  getGridCellRect,
  normalizeGridAreaSize,
  normalizeGridCell
} from "./worldCoordinateModel.js";

function normalizeStoreText(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || fallback;
}

function cloneStoreValue(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneStoreValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneStoreValue(nestedValue)])
    ));
  }

  return value;
}

function cloneCell(cell) {
  const normalizedCell = normalizeGridCell(cell);
  return Object.freeze({ x: normalizedCell.x, y: normalizedCell.y });
}

function normalizeFootprint(record = {}) {
  return normalizeGridAreaSize(record.footprint || record.size || { width: 1, height: 1 });
}

function resolveRecordId(record = {}, sequence) {
  return normalizeStoreText(
    record.placedObjectId || record.id,
    `world-object-${sequence}`
  );
}

function resolveWorldObjectId(record = {}, placedObjectId) {
  return normalizeStoreText(
    record.worldObjectId || record.objectId || record.sourceDatabaseId || record.sourceId,
    placedObjectId
  );
}

function resolveSourceDatabaseId(record = {}, worldObjectId) {
  return normalizeStoreText(
    record.sourceDatabaseId || record.sourceId || record.placeableId || record.gridPlaceableId,
    worldObjectId
  );
}

export function normalizeWorldObjectStoreRecord(record = {}, { sequence = 1 } = {}) {
  if (!record || typeof record !== "object") {
    throw new TypeError("world object store record must be an object");
  }

  const placedObjectId = resolveRecordId(record, sequence);
  const worldObjectId = resolveWorldObjectId(record, placedObjectId);
  const sourceDatabaseId = resolveSourceDatabaseId(record, worldObjectId);
  const originCell = cloneCell(record.originCell || record.cell || { x: 0, y: 0 });
  const footprint = normalizeFootprint(record);
  const occupiedCells = Array.isArray(record.occupiedCells) ?
    Object.freeze(record.occupiedCells.map((cell) => cloneCell(cell))) :
    Object.freeze(getGridCellRect(originCell, footprint).map((cell) => cloneCell(cell)));

  return Object.freeze({
    placedObjectId,
    worldObjectId,
    sourceDatabaseId,
    sourceItemId: normalizeStoreText(record.sourceItemId) || null,
    gridPlaceableId: normalizeStoreText(record.gridPlaceableId) || null,
    originCell,
    size: footprint,
    footprint,
    occupiedCells,
    removable: record.removable ?? true,
    runtimeRefs: record.runtimeRefs ? cloneStoreValue(record.runtimeRefs) : Object.freeze({}),
    data: record.data ? cloneStoreValue(record.data) : Object.freeze({})
  });
}

export function createInMemoryWorldObjectStore({ initialRecords = [] } = {}) {
  if (!Array.isArray(initialRecords)) {
    throw new TypeError("initial world object records must be an array");
  }

  const recordsById = new Map();
  const cellIndex = new Map();
  let nextSequence = 1;

  function normalizeForStore(record) {
    return normalizeWorldObjectStoreRecord(record, {
      sequence: nextSequence
    });
  }

  function getRecordCellKeys(record) {
    return record.occupiedCells.map((cell) => getGridCellKey(cell));
  }

  function getAreaCells(area = {}) {
    const originCell = cloneCell(area.originCell || area.cell || { x: 0, y: 0 });
    const footprint = normalizeGridAreaSize(area.footprint || area.size || { width: 1, height: 1 });
    return getGridCellRect(originCell, footprint);
  }

  function hasOccupiedCellConflict(record, ignoredPlacedObjectId = null) {
    return getRecordCellKeys(record).some((cellKey) => {
      const occupiedBy = cellIndex.get(cellKey);
      return Boolean(occupiedBy && occupiedBy !== ignoredPlacedObjectId);
    });
  }

  function indexRecord(record) {
    for (const cellKey of getRecordCellKeys(record)) {
      cellIndex.set(cellKey, record.placedObjectId);
    }
  }

  function unindexRecord(record) {
    for (const cellKey of getRecordCellKeys(record)) {
      if (cellIndex.get(cellKey) === record.placedObjectId) {
        cellIndex.delete(cellKey);
      }
    }
  }

  function add(record = {}) {
    const normalizedRecord = normalizeForStore(record);

    if (recordsById.has(normalizedRecord.placedObjectId) || hasOccupiedCellConflict(normalizedRecord)) {
      return null;
    }

    recordsById.set(normalizedRecord.placedObjectId, normalizedRecord);
    indexRecord(normalizedRecord);
    nextSequence += 1;
    return normalizedRecord;
  }

  function removeObject(placedObjectId, { force = false } = {}) {
    const normalizedId = normalizeStoreText(placedObjectId);
    const record = recordsById.get(normalizedId);

    if (!record || (!force && record.removable === false)) {
      return null;
    }

    unindexRecord(record);
    recordsById.delete(normalizedId);
    return record;
  }

  function removeObjectAt(cell, options) {
    const record = store.getObjectAt(cell);
    return record ? removeObject(record.placedObjectId, options) : null;
  }

  function createUpdateSource(previousRecord, patch = {}) {
    const nextFootprint = patch.footprint || patch.size || previousRecord.footprint;
    const updateSource = {
      ...previousRecord,
      ...patch,
      placedObjectId: previousRecord.placedObjectId,
      originCell: patch.originCell || patch.cell || previousRecord.originCell,
      size: nextFootprint,
      footprint: nextFootprint
    };

    if (!Array.isArray(patch.occupiedCells)) {
      delete updateSource.occupiedCells;
    }

    return updateSource;
  }

  function updateObject(placedObjectId, patch = {}) {
    const normalizedId = normalizeStoreText(placedObjectId);
    const previousRecord = recordsById.get(normalizedId);

    if (!previousRecord || !patch || typeof patch !== "object") {
      return null;
    }

    const updatedRecord = normalizeWorldObjectStoreRecord(createUpdateSource(previousRecord, patch), {
      sequence: nextSequence
    });

    if (hasOccupiedCellConflict(updatedRecord, previousRecord.placedObjectId)) {
      return null;
    }

    unindexRecord(previousRecord);
    recordsById.set(updatedRecord.placedObjectId, updatedRecord);
    indexRecord(updatedRecord);
    return updatedRecord;
  }

  function listObjectsAtCells(cells = []) {
    const placedObjectIds = new Set();

    for (const cell of Array.isArray(cells) ? cells : []) {
      const placedObjectId = cellIndex.get(getGridCellKey(cell));

      if (placedObjectId) {
        placedObjectIds.add(placedObjectId);
      }
    }

    return Object.freeze([...placedObjectIds]
      .map((placedObjectId) => recordsById.get(placedObjectId))
      .filter(Boolean));
  }

  function listObjectsInArea(area = {}) {
    return listObjectsAtCells(getAreaCells(area));
  }

  const store = Object.freeze({
    add,
    addPlacedObject: add,
    remove: removeObject,
    removeObject,
    removeObjectAt,
    removePlacedObjectAt: removeObjectAt,
    update: updateObject,
    updateObject,
    has(placedObjectId) {
      return recordsById.has(normalizeStoreText(placedObjectId));
    },
    get(placedObjectId) {
      return recordsById.get(normalizeStoreText(placedObjectId)) || null;
    },
    getObjectAt(cell) {
      const placedObjectId = cellIndex.get(getGridCellKey(cell));
      return placedObjectId ? recordsById.get(placedObjectId) || null : null;
    },
    hasObjectAt(cell) {
      return cellIndex.has(getGridCellKey(cell));
    },
    listObjectsAtCells,
    listObjectsInArea,
    hasObjectsInArea(area) {
      return listObjectsInArea(area).length > 0;
    },
    require(placedObjectId) {
      const normalizedId = normalizeStoreText(placedObjectId);
      const record = recordsById.get(normalizedId);

      if (!record) {
        throw new Error(`Unknown placed world object id: ${normalizedId || "(empty)"}`);
      }

      return record;
    },
    list() {
      return Object.freeze([...recordsById.values()]);
    },
    ids() {
      return Object.freeze([...recordsById.keys()]);
    },
    get size() {
      return recordsById.size;
    }
  });

  for (const record of initialRecords) {
    if (!add(record)) {
      throw new Error(`Duplicate placed world object id: ${record?.placedObjectId || record?.id || "(empty)"}`);
    }
  }

  return store;
}
