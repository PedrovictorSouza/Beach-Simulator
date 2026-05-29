function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNestedValue(record, key) {
  if (!key.includes(".")) {
    return record[key];
  }

  return key
    .split(".")
    .reduce((value, part) => (isRecord(value) ? value[part] : undefined), record);
}

export function getTaskEventCriteriaValue(event = {}, key) {
  if (!key) {
    return undefined;
  }

  const directValue = getNestedValue(event, key);
  if (directValue !== undefined) {
    return directValue;
  }

  return getNestedValue(event.payload || {}, key);
}

export function matchesTaskEventCriteria(event = {}, criteria = null) {
  if (!criteria || !isRecord(criteria)) {
    return true;
  }

  return Object.entries(criteria).every(([key, expected]) => {
    const actual = getTaskEventCriteriaValue(event, key);

    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }

    return actual === expected;
  });
}

export function matchesTaskEventProgress(event = {}, progress = {}) {
  return progress.eventType === event.type &&
    (!progress.targetId || progress.targetId === event.targetId) &&
    matchesTaskEventCriteria(event, progress.criteria || progress.match);
}

export function matchesTaskCounterProgress(event = {}, progress = {}) {
  const counterMatches = progress.counterId === event.targetId ||
    progress.counterId === event.counterId ||
    progress.counterId === event.factId;

  return counterMatches && matchesTaskEventCriteria(event, progress.criteria || progress.match);
}
