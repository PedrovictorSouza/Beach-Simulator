import { createTaskSystem } from "./createTaskSystem.js";
import { createTaskSystemBridge } from "./taskSystemBridge.js";
import {
  TASK_EFFECT,
  TASK_EVENT,
  TASK_OBJECTIVE_KIND,
  TASK_STATUS
} from "./taskData.js";

const TASK_COMPLETE_MOTION_ID = "task-complete";

const LEGACY_TASK_ID_ALIASES = Object.freeze({
  "gather-first-supplies": "wake-hydro",
  "water-first-dry-patch": "restore-first-patch",
  "water-dry-grass": "restore-dry-grass",
  "inspect-rustling-grass": "meet-grow",
  "grow-a-home-patch": "grow-first-habitat",
  "melt-first-snow": "clear-white-ground",
  "open-colony-computer": "unlock-colony-terminal",
  "chopper-first-habitat-report": "report-base-ready"
});

const LEGACY_UNLOCK_TASK_ALIASES = Object.freeze({
  "basic-movement": "learn-to-move",
  "hydro-route-marker": "wake-guide",
  "water-restoration": "wake-hydro",
  "tutorial-complete": "restore-first-patch",
  "grow-bot-route": "restore-dry-grass",
  leafage: "meet-grow",
  "grow-corner-complete": "grow-first-habitat",
  "snow-construction-rule": "clear-white-ground",
  "builder-bot": "unlock-colony-terminal",
  "first-base-built": "build-first-base",
  "campaign-mvp-complete": "report-base-ready"
});

const LEGACY_UNLOCK_FACT_ALIASES = Object.freeze({
  waterGun: "unlock.hydroTool",
  hydroTool: "unlock.hydroTool",
  leafage: "unlock.growTool",
  growTool: "unlock.growTool"
});

function resolveTaskId(taskId) {
  return LEGACY_TASK_ID_ALIASES[taskId] || taskId;
}

function getRequiredAmount(objective = {}) {
  return Math.max(1, Number(objective.progress?.required || 1));
}

function getFactNumber(facts = {}, factId) {
  return Math.max(0, Number(facts?.[factId] || 0));
}

function normalizeQuestType(type) {
  return String(type || "TASK").replace(/-/g, "_").toUpperCase();
}

function inferCounterQuestType(counterId = "") {
  if (counterId.includes("woodCollected")) {
    return "COLLECT";
  }

  if (counterId.includes("wallsBuilt")) {
    return "BUILD";
  }

  return "RESTORE";
}

function getQuestObjectiveType(objective = {}) {
  const progress = objective.progress || {};

  if (progress.kind === TASK_OBJECTIVE_KIND.EVENT) {
    return normalizeQuestType(progress.eventType);
  }

  if (progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
    return inferCounterQuestType(progress.counterId);
  }

  return normalizeQuestType(progress.kind);
}

function getQuestObjectiveTargetId(objective = {}) {
  const progress = objective.progress || {};
  return progress.targetId || progress.counterId || progress.factId || objective.id;
}

function getQuestObjectiveCurrent({
  facts,
  objective,
  objectiveState
}) {
  const progress = objective.progress || {};

  if (progress.kind === TASK_OBJECTIVE_KIND.FACT) {
    return facts[progress.factId] ? 1 : 0;
  }

  if (progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
    return getFactNumber(facts, progress.counterId);
  }

  return Math.max(0, Number(objectiveState?.current || 0));
}

function createQuestObjective({
  facts,
  objective,
  objectiveState
}) {
  const required = getRequiredAmount(objective);
  const current = Math.min(
    required,
    getQuestObjectiveCurrent({
      facts,
      objective,
      objectiveState
    })
  );

  return {
    id: objective.id,
    type: getQuestObjectiveType(objective),
    targetId: getQuestObjectiveTargetId(objective),
    required,
    current,
    title: objective.title || "",
    description: objective.description || "",
    hiddenFromHud: objective.hudDisplayMode === "title-only",
    requiredObjective: objective.required !== false,
    completed: current >= required,
    legacyFieldTaskId: objective.legacyFieldTaskId || null
  };
}

function createQuestRewards(task = {}) {
  return {
    unlocks: (task.effects || [])
      .filter((effect) => effect.type === TASK_EFFECT.UNLOCK && effect.id)
      .map((effect) => effect.id),
    items: []
  };
}

function getUnlockedIds(facts = {}) {
  return Object.entries(facts)
    .filter(([factId, value]) => factId.startsWith("unlock.") && value === true)
    .map(([factId]) => factId.slice("unlock.".length));
}

export function createMissionSystemAdapter({
  taskSystem = null,
  taskSystemBridge = null,
  initialTaskState = null,
  onChange = () => {},
  onTaskCompleteMotionRequested = () => {}
} = {}) {
  const resolvedTaskSystem = taskSystem || createTaskSystem({
    initialState: initialTaskState
  });
  const resolvedTaskSystemBridge = taskSystemBridge || createTaskSystemBridge({
    taskSystem: resolvedTaskSystem
  });

  function getTaskState() {
    return resolvedTaskSystem.getState();
  }

  function getQuest(taskId) {
    const resolvedTaskId = resolveTaskId(taskId);
    const task = resolvedTaskSystem.getTask(resolvedTaskId);

    if (!task) {
      return null;
    }

    const state = getTaskState();
    const taskProgress = state.taskProgress[task.id] || {};
    const facts = state.facts || {};

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      guidance: task.description,
      giverId: task.ownerId,
      status: taskProgress.status || TASK_STATUS.LOCKED,
      objectives: (task.objectives || []).map((objective) => createQuestObjective({
        facts,
        objective,
        objectiveState: taskProgress.objectives?.[objective.id] || null
      })),
      rewards: createQuestRewards(task),
      nextQuestId: task.nextTaskId || null,
      taskId: task.id
    };
  }

  function getActiveQuest() {
    return getQuest(resolvedTaskSystem.getActiveTask()?.id);
  }

  function getQuestLog() {
    return (resolvedTaskSystem.getTerminalTaskTree?.() || [])
      .map((entry) => getQuest(entry.id))
      .filter(Boolean);
  }

  function getState() {
    const taskState = getTaskState();
    const facts = taskState.facts || {};

    return {
      ...taskState,
      activeQuestId: taskState.activeTaskId,
      completedQuestIds: [...(taskState.completedTaskIds || [])],
      unlocked: getUnlockedIds(facts),
      quests: Object.fromEntries(getQuestLog().map((quest) => [quest.id, quest]))
    };
  }

  function notify(reason, payload = {}) {
    onChange({
      reason,
      payload,
      activeQuest: getActiveQuest(),
      questLog: getQuestLog(),
      activeTask: resolvedTaskSystem.getActiveTask(),
      taskState: getTaskState()
    });
  }

  function notifyTaskCompletion({
    event,
    result,
    reason = "quest-progress-completed"
  }) {
    const completedQuestIds = result.completedTaskIds || [];

    for (const questId of completedQuestIds) {
      const quest = getQuest(questId);
      onTaskCompleteMotionRequested({
        motionId: TASK_COMPLETE_MOTION_ID,
        questId,
        quest,
        event
      });
    }

    notify(reason, {
      event,
      completedQuestIds,
      completedTaskIds: completedQuestIds,
      effects: result.effects || [],
      normalizedEvent: result.normalizedEvent || null
    });
  }

  function emit(event = {}) {
    const taskResult = resolvedTaskSystemBridge.recordLegacyQuestEvent(event);
    const completedQuestIds = taskResult.completedTaskIds || [];

    if (taskResult.changed) {
      notifyTaskCompletion({
        event,
        result: taskResult,
        reason: completedQuestIds.length ? "quest-progress-completed" : "quest-progress"
      });
    }

    return {
      changed: Boolean(taskResult.changed),
      completedQuestIds,
      taskResult
    };
  }

  function completeMission(taskId, {
    event = {
      type: TASK_EVENT.STORY_BEAT_COMPLETE,
      targetId: taskId
    }
  } = {}) {
    const resolvedTaskId = resolveTaskId(taskId);
    const activeTask = resolvedTaskSystem.getActiveTask();
    const task = resolvedTaskSystem.getTask(resolvedTaskId);

    if (!task || activeTask?.id !== task.id) {
      return {
        changed: false,
        completedQuestIds: [],
        taskResult: {
          changed: false,
          completedTaskIds: [],
          effects: [],
          activeFocus: resolvedTaskSystem.getActiveFocus()
        }
      };
    }

    const nextState = getTaskState();
    const taskProgress = nextState.taskProgress[task.id];

    for (const objective of task.objectives || []) {
      if (objective.required === false) {
        continue;
      }

      const objectiveState = taskProgress.objectives?.[objective.id];
      if (!objectiveState) {
        continue;
      }

      objectiveState.current = getRequiredAmount(objective);
      objectiveState.completed = true;
    }

    resolvedTaskSystem.restoreState(nextState);
    const taskResult = resolvedTaskSystem.applyEffects([], {
      notify: false,
      reason: "mission-completed"
    });
    const completedQuestIds = taskResult.completedTaskIds || [];

    if (taskResult.changed) {
      notifyTaskCompletion({
        event,
        result: taskResult
      });
    }

    return {
      changed: Boolean(taskResult.changed),
      completedQuestIds,
      taskResult
    };
  }

  function applyEffects(effects = [], options = {}) {
    const taskResult = resolvedTaskSystem.applyEffects(effects, {
      notify: false,
      reason: options.reason || "mission-effects"
    });
    const completedQuestIds = taskResult.completedTaskIds || [];

    if (taskResult.changed) {
      notifyTaskCompletion({
        event: options.event || null,
        result: taskResult,
        reason: completedQuestIds.length ? "quest-progress-completed" : "quest-progress"
      });
    }

    return {
      changed: Boolean(taskResult.changed),
      completedQuestIds,
      taskResult
    };
  }

  function activateQuest(taskId) {
    const resolvedTaskId = resolveTaskId(taskId);
    const task = resolvedTaskSystem.getTask(resolvedTaskId);

    if (!task) {
      return false;
    }

    const nextState = getTaskState();
    const nextTaskProgress = nextState.taskProgress[task.id];

    if (!nextTaskProgress || nextTaskProgress.status === TASK_STATUS.COMPLETED) {
      return false;
    }

    const activeTaskId = nextState.activeTaskId;
    if (activeTaskId && nextState.taskProgress[activeTaskId]?.status === TASK_STATUS.ACTIVE) {
      nextState.taskProgress[activeTaskId].status = TASK_STATUS.AVAILABLE;
    }

    nextState.activeTaskId = task.id;
    nextTaskProgress.status = TASK_STATUS.ACTIVE;
    resolvedTaskSystem.restoreState(nextState);
    notify("quest-activated", {
      activeQuestId: task.id,
      activeTaskId: task.id
    });
    return true;
  }

  function hasUnlocked(unlockId) {
    const state = getTaskState();
    const facts = state.facts || {};
    const directFactId = `unlock.${unlockId}`;
    const aliasFactId = LEGACY_UNLOCK_FACT_ALIASES[unlockId];
    const aliasTaskId = LEGACY_UNLOCK_TASK_ALIASES[unlockId];

    return Boolean(
      facts[directFactId] ||
      (aliasFactId && facts[aliasFactId]) ||
      (aliasTaskId && state.completedTaskIds.includes(aliasTaskId))
    );
  }

  function reset() {
    resolvedTaskSystem.reset();
    notify("reset");
    return true;
  }

  function restoreTaskState(taskState = null) {
    return resolvedTaskSystem.restoreState(taskState);
  }

  function restoreState(nextState = null) {
    const taskState = nextState?.taskState || nextState?.questState || nextState;
    const restoredTaskState = restoreTaskState(taskState);

    notify("restore");
    return {
      questState: getState(),
      taskState: restoredTaskState
    };
  }

  return {
    activateQuest,
    applyEffects,
    completeMission,
    emit,
    getActiveQuest,
    getActiveTask: resolvedTaskSystem.getActiveTask,
    getQuest,
    getQuestLog,
    getState,
    getTaskBridge() {
      return resolvedTaskSystemBridge;
    },
    getTaskFact(factId) {
      return getTaskState().facts?.[factId];
    },
    getTaskHudView() {
      return resolvedTaskSystemBridge.getHudView();
    },
    getTaskState,
    getTaskTerminalEntries() {
      return resolvedTaskSystemBridge.getTerminalEntries();
    },
    hasTaskFact(factId) {
      return Boolean(getTaskState().facts?.[factId]);
    },
    hasUnlocked,
    reset,
    restoreState,
    restoreTaskState
  };
}
