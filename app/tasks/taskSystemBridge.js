import { createTaskSystem } from "./createTaskSystem.js";
import {
  createTaskHudView,
  createTaskTerminalEntries
} from "./taskPresentation.js";
import {
  TASK_EFFECT,
  TASK_EVENT,
  TASK_FACT_IDS
} from "./taskData.js";

const LEGACY_EVENT_TYPE_TO_TASK_EVENT = Object.freeze({
  MOVE: TASK_EVENT.MOVE,
  TALK: TASK_EVENT.TALK,
  COLLECT: TASK_EVENT.COLLECT,
  PLACE: TASK_EVENT.PLACE,
  BUILD: TASK_EVENT.BUILD,
  PHOTO: TASK_EVENT.INSPECT,
  UNLOCK: TASK_EVENT.UNLOCK
});

const LEGACY_TARGET_TO_TASK_TARGET = Object.freeze({
  tangrowth: "chopper",
  waterGun: "hydroTool",
  bulbasaur: "grow",
  "revived-grass": TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
  "leaf-helper": "grow",
  "leafy-home-patch": TASK_FACT_IDS.FIRST_HABITAT_PATCH_COUNT,
  "snow-melted": TASK_FACT_IDS.WHITE_GROUND_CLEARED,
  challenges: "unlock-colony-checks",
  wood: TASK_FACT_IDS.FIRST_BASE_WOOD_COLLECTED,
  "foundation-wall": TASK_FACT_IDS.FIRST_BASE_WALLS_BUILT
});

function normalizeLegacyEventType(type) {
  return LEGACY_EVENT_TYPE_TO_TASK_EVENT[type] || type;
}

function normalizeLegacyTargetId(targetId) {
  return LEGACY_TARGET_TO_TASK_TARGET[targetId] || targetId;
}

function getBridgeEffectsForLegacyEvent(event = {}) {
  if (event.type === "BUILD" && event.targetId === "snow-melted") {
    return [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.THERMAL_CABIN_PLACED,
        value: true
      }
    ];
  }

  if (event.type === "UNLOCK" && event.targetId === "challenges") {
    return [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.TERMINAL_INSPECTED,
        value: true
      }
    ];
  }

  return [];
}

export function normalizeLegacyQuestEvent(event = {}) {
  if (!event?.type) {
    return null;
  }

  const normalizedType = normalizeLegacyEventType(event.type);
  const normalizedTargetId = normalizeLegacyTargetId(event.targetId);

  if (event.type === "BUILD" && event.targetId === "revived-grass") {
    return {
      ...event,
      type: TASK_EVENT.RESTORE,
      targetId: normalizedTargetId
    };
  }

  if (event.type === "BUILD" && event.targetId === "snow-melted") {
    return {
      ...event,
      type: TASK_EVENT.RESTORE,
      targetId: normalizedTargetId
    };
  }

  if (event.type === "UNLOCK" && event.targetId === "challenges") {
    return {
      ...event,
      type: TASK_EVENT.TERMINAL_ACTION,
      targetId: normalizedTargetId
    };
  }

  return {
    ...event,
    type: normalizedType,
    targetId: normalizedTargetId
  };
}

export function createTaskSystemBridge({
  taskSystem = createTaskSystem()
} = {}) {
  function recordLegacyQuestEvent(event = {}) {
    const normalizedEvent = normalizeLegacyQuestEvent(event);
    if (!normalizedEvent) {
      return {
        changed: false,
        completedTaskIds: [],
        effects: [],
        activeFocus: taskSystem.getActiveFocus()
      };
    }

    const bridgeEffects = getBridgeEffectsForLegacyEvent(event);
    const effectResult = bridgeEffects.length ?
      taskSystem.applyEffects(bridgeEffects, {
        reason: "legacy-bridge-effects"
      }) :
      { changed: false, completedTaskIds: [], effects: [] };
    const eventResult = taskSystem.applyEvent(normalizedEvent);

    return {
      changed: Boolean(effectResult.changed || eventResult.changed),
      completedTaskIds: [
        ...(effectResult.completedTaskIds || []),
        ...(eventResult.completedTaskIds || [])
      ],
      effects: [
        ...(effectResult.effects || []),
        ...(eventResult.effects || [])
      ],
      activeFocus: eventResult.activeFocus || taskSystem.getActiveFocus(),
      normalizedEvent
    };
  }

  return {
    applyEffects: taskSystem.applyEffects,
    getHudView() {
      return createTaskHudView(taskSystem);
    },
    getState: taskSystem.getState,
    getTaskSystem() {
      return taskSystem;
    },
    getTerminalEntries() {
      return createTaskTerminalEntries(taskSystem);
    },
    normalizeLegacyQuestEvent,
    recordLegacyQuestEvent,
    trackObjective: taskSystem.trackObjective,
    untrackObjective: taskSystem.untrackObjective
  };
}
