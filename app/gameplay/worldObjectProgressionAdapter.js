import { listWorldObjects } from "./worldObjectCatalog.js";

function normalizeTaskCollection(tasks) {
  if (Array.isArray(tasks)) {
    return tasks;
  }

  if (tasks && typeof tasks === "object") {
    return Object.values(tasks);
  }

  return [];
}

function freezeProgressionEvent({
  eventId,
  object
}) {
  return Object.freeze({
    eventId,
    objectId: object.id,
    objectLabel: object.label,
    objectKind: object.kind,
    placementMode: object.placementMode,
    activationType: object.activation?.type || null
  });
}

export function listWorldObjectProgressionEvents({
  objects = listWorldObjects()
} = {}) {
  return Object.freeze(objects.flatMap((object) => {
    return (object.emits || []).map((eventId) => {
      return freezeProgressionEvent({ eventId, object });
    });
  }));
}

export function getWorldObjectProgressionEventById(eventId, {
  events = listWorldObjectProgressionEvents()
} = {}) {
  return events.find((event) => event.eventId === eventId) || null;
}

function createTaskProgressionLink(task, event) {
  return Object.freeze({
    taskId: task.id,
    completeFlag: task.completeFlag || null,
    eventId: event.eventId,
    objectId: event.objectId,
    objectLabel: event.objectLabel,
    objectKind: event.objectKind,
    placementMode: event.placementMode,
    activationType: event.activationType
  });
}

export function createWorldObjectTaskProgressionLinks({
  tasks = [],
  events = listWorldObjectProgressionEvents()
} = {}) {
  const eventById = new Map(events.map((event) => [event.eventId, event]));

  return Object.freeze(normalizeTaskCollection(tasks).flatMap((task) => {
    if (!task?.id || !task.completeFlag) {
      return [];
    }

    const event = eventById.get(task.completeFlag);
    return event ? [createTaskProgressionLink(task, event)] : [];
  }));
}

export function getWorldObjectTaskProgressionLinkByTaskId(taskId, {
  links = createWorldObjectTaskProgressionLinks()
} = {}) {
  return links.find((link) => link.taskId === taskId) || null;
}

export function resolveWorldObjectProgressionEventFromFlag(flagId, {
  events = listWorldObjectProgressionEvents()
} = {}) {
  return getWorldObjectProgressionEventById(flagId, { events });
}
