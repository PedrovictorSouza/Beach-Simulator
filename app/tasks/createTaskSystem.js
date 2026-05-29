import {
  SMALL_ISLAND_TASKS,
  TASK_EFFECT,
  TASK_OBJECTIVE_KIND,
  TASK_STATUS
} from "./taskData.js";
import {
  matchesTaskCounterProgress,
  matchesTaskEventProgress
} from "./taskCriteria.js";

const TASK_SYSTEM_STATE_VERSION = 1;

function cloneObjectiveProgress(objective) {
  return {
    current: 0,
    completed: false,
    visible: objective.status !== "locked"
  };
}

function createTaskProgressFromData(task) {
  return {
    status: task.status || TASK_STATUS.LOCKED,
    objectives: Object.fromEntries(
      task.objectives.map((objective) => [objective.id, cloneObjectiveProgress(objective)])
    )
  };
}

function createInitialState(tasks) {
  const activeTask = tasks.find((task) => task.status === TASK_STATUS.ACTIVE) || tasks[0] || null;
  const taskProgress = Object.fromEntries(
    tasks.map((task) => [task.id, createTaskProgressFromData(task)])
  );

  if (activeTask && taskProgress[activeTask.id]) {
    taskProgress[activeTask.id].status = TASK_STATUS.ACTIVE;
  }

  return {
    version: TASK_SYSTEM_STATE_VERSION,
    activeTaskId: activeTask?.id || null,
    trackedObjectiveIds: [],
    completedTaskIds: [],
    facts: {},
    taskProgress
  };
}

function cloneState(state) {
  return {
    version: TASK_SYSTEM_STATE_VERSION,
    activeTaskId: state?.activeTaskId || null,
    trackedObjectiveIds: Array.isArray(state?.trackedObjectiveIds) ?
      [...state.trackedObjectiveIds] :
      [],
    completedTaskIds: Array.isArray(state?.completedTaskIds) ?
      [...state.completedTaskIds] :
      [],
    facts: {
      ...(state?.facts || {})
    },
    taskProgress: Object.fromEntries(
      Object.entries(state?.taskProgress || {}).map(([taskId, progress]) => [
        taskId,
        {
          status: progress?.status || TASK_STATUS.LOCKED,
          objectives: Object.fromEntries(
            Object.entries(progress?.objectives || {}).map(([objectiveId, objective]) => [
              objectiveId,
              {
                current: Math.max(0, Number(objective?.current || 0)),
                completed: Boolean(objective?.completed),
                visible: objective?.visible !== false
              }
            ])
          )
        }
      ])
    )
  };
}

function mergeInitialState(tasks, initialState) {
  if (initialState?.version !== TASK_SYSTEM_STATE_VERSION) {
    return createInitialState(tasks);
  }

  const base = createInitialState(tasks);
  const next = cloneState(initialState);

  next.taskProgress = Object.fromEntries(
    tasks.map((task) => {
      const baseProgress = base.taskProgress[task.id];
      const savedProgress = next.taskProgress[task.id] || {};

      return [
        task.id,
        {
          status: savedProgress.status || baseProgress.status,
          objectives: Object.fromEntries(
            task.objectives.map((objective) => {
              const baseObjective = baseProgress.objectives[objective.id];
              const savedObjective = savedProgress.objectives?.[objective.id] || {};

              return [
                objective.id,
                {
                  current: Math.max(0, Number(savedObjective.current || baseObjective.current || 0)),
                  completed: Boolean(savedObjective.completed || baseObjective.completed),
                  visible: savedObjective.visible ?? baseObjective.visible
                }
              ];
            })
          )
        }
      ];
    })
  );

  if (!next.activeTaskId || !next.taskProgress[next.activeTaskId]) {
    next.activeTaskId = base.activeTaskId;
  }

  next.completedTaskIds = next.completedTaskIds.filter((taskId) => next.taskProgress[taskId]);
  return next;
}

function createTaskLookup(tasks) {
  return new Map(tasks.map((task) => [task.id, task]));
}

function createObjectiveLookup(tasks) {
  const lookup = new Map();

  for (const task of tasks) {
    for (const objective of task.objectives) {
      lookup.set(objective.id, {
        task,
        objective
      });
    }
  }

  return lookup;
}

function eventMatchesObjective(event, objective) {
  const progress = objective.progress || {};

  if (progress.kind !== TASK_OBJECTIVE_KIND.EVENT) {
    return false;
  }

  return matchesTaskEventProgress(event, progress);
}

function eventMatchesCounter(event, objective) {
  const progress = objective.progress || {};

  if (progress.kind !== TASK_OBJECTIVE_KIND.COUNTER) {
    return false;
  }

  return matchesTaskCounterProgress(event, progress);
}

function getObjectiveState(state, taskId, objectiveId) {
  return state.taskProgress[taskId]?.objectives?.[objectiveId] || null;
}

function getFactNumber(facts, factId) {
  return Math.max(0, Number(facts?.[factId] || 0));
}

function isObjectiveComplete(state, task, objective) {
  const objectiveState = getObjectiveState(state, task.id, objective.id);
  const progress = objective.progress || {};

  if (!objectiveState) {
    return false;
  }

  if (objectiveState.completed) {
    return true;
  }

  if (progress.kind === TASK_OBJECTIVE_KIND.FACT) {
    return Boolean(state.facts[progress.factId]);
  }

  if (progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
    return getFactNumber(state.facts, progress.counterId) >= Number(progress.required || 1);
  }

  return false;
}

function getObjectiveCurrent(state, task, objective) {
  const objectiveState = getObjectiveState(state, task.id, objective.id);
  const progress = objective.progress || {};

  if (progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
    return getFactNumber(state.facts, progress.counterId);
  }

  if (progress.kind === TASK_OBJECTIVE_KIND.FACT) {
    return state.facts[progress.factId] ? 1 : 0;
  }

  return Math.max(0, Number(objectiveState?.current || 0));
}

function getObjectiveRequiredAmount(objective) {
  return Math.max(1, Number(objective.progress?.required || 1));
}

function formatObjectiveProgress(state, task, objective) {
  const progress = objective.progress || {};

  if (progress.kind === TASK_OBJECTIVE_KIND.FACT) {
    return isObjectiveComplete(state, task, objective) ? "Complete" : "";
  }

  const required = getObjectiveRequiredAmount(objective);
  const current = Math.min(required, getObjectiveCurrent(state, task, objective));
  return `${current}/${required}`;
}

function isTaskComplete(state, task) {
  const requirementGroups = Array.isArray(task.requirements) ?
    task.requirements
      .map((group) => (Array.isArray(group) ? group : [group]))
      .map((group) => group.filter((objectiveId) => typeof objectiveId === "string" && objectiveId.length > 0))
      .filter((group) => group.length > 0) :
    null;

  if (requirementGroups?.length) {
    return requirementGroups.every((group) => (
      group.some((objectiveId) => {
        const objective = task.objectives.find((entry) => entry.id === objectiveId);
        return objective ? isObjectiveComplete(state, task, objective) : false;
      })
    ));
  }

  return task.objectives
    .filter((objective) => objective.required)
    .every((objective) => isObjectiveComplete(state, task, objective));
}

function buildVisibleObjective(state, task, objective) {
  return {
    id: objective.id,
    taskId: task.id,
    title: objective.title,
    description: objective.description,
    required: Boolean(objective.required),
    completed: isObjectiveComplete(state, task, objective),
    progressText: formatObjectiveProgress(state, task, objective),
    hudDisplayMode: objective.hudDisplayMode || null,
    hudIllustration: objective.hudIllustration || null,
    legacyFieldTaskId: objective.legacyFieldTaskId || null
  };
}

function buildFocus(state, task, objective, source) {
  const visibleObjective = buildVisibleObjective(state, task, objective);

  return {
    taskId: task.id,
    objectiveId: objective.id,
    title: visibleObjective.title,
    description: visibleObjective.description,
    progressText: visibleObjective.progressText,
    hudDisplayMode: visibleObjective.hudDisplayMode || null,
    hudIllustration: visibleObjective.hudIllustration || null,
    required: visibleObjective.required,
    source
  };
}

export function createTaskSystem({
  tasks = SMALL_ISLAND_TASKS,
  initialState = null,
  onChange = () => {}
} = {}) {
  const taskList = [...tasks];
  const taskById = createTaskLookup(taskList);
  const objectiveById = createObjectiveLookup(taskList);
  let state = mergeInitialState(taskList, initialState);

  function getTask(taskId) {
    return taskById.get(taskId) || null;
  }

  function getActiveTask() {
    return getTask(state.activeTaskId);
  }

  function getTaskProgress(taskId) {
    return state.taskProgress[taskId] || null;
  }

  function setTaskStatus(taskId, status) {
    const progress = getTaskProgress(taskId);

    if (!progress || progress.status === status) {
      return false;
    }

    progress.status = status;
    return true;
  }

  function applyFactObjectiveState() {
    let changed = false;

    for (const task of taskList) {
      for (const objective of task.objectives) {
        const progress = objective.progress || {};
        const objectiveState = getObjectiveState(state, task.id, objective.id);

        if (!objectiveState) {
          continue;
        }

        if (
          progress.kind === TASK_OBJECTIVE_KIND.FACT &&
          Boolean(state.facts[progress.factId]) &&
          !objectiveState.completed
        ) {
          objectiveState.completed = true;
          objectiveState.current = 1;
          changed = true;
        }

        if (progress.kind === TASK_OBJECTIVE_KIND.COUNTER) {
          const current = getFactNumber(state.facts, progress.counterId);
          const required = getObjectiveRequiredAmount(objective);
          if (objectiveState.current !== current) {
            objectiveState.current = current;
            changed = true;
          }
          if (current >= required && !objectiveState.completed) {
            objectiveState.completed = true;
            changed = true;
          }
        }
      }
    }

    return changed;
  }

  function applyTaskEffects(task) {
    return applyEffects(task.effects || [], {
      notify: false,
      reason: "task-effects"
    }).effects;
  }

  function activateNextTask(task) {
    if (!task.nextTaskId) {
      state.activeTaskId = null;
      return false;
    }

    const nextTask = getTask(task.nextTaskId);
    if (!nextTask) {
      state.activeTaskId = null;
      return false;
    }

    state.activeTaskId = nextTask.id;
    setTaskStatus(nextTask.id, TASK_STATUS.ACTIVE);
    return true;
  }

  function resolveCompletedTasks() {
    const completedTaskIds = [];
    const effects = [];
    let changed = false;
    let guard = 0;

    while (guard < taskList.length) {
      guard += 1;
      const activeTask = getActiveTask();

      if (!activeTask || !isTaskComplete(state, activeTask)) {
        break;
      }

      const progress = getTaskProgress(activeTask.id);
      if (!progress || progress.status === TASK_STATUS.COMPLETED) {
        break;
      }

      progress.status = TASK_STATUS.COMPLETED;
      if (!state.completedTaskIds.includes(activeTask.id)) {
        state.completedTaskIds.push(activeTask.id);
      }
      completedTaskIds.push(activeTask.id);
      effects.push(...applyTaskEffects(activeTask));
      activateNextTask(activeTask);
      changed = true;
    }

    return {
      changed,
      completedTaskIds,
      effects
    };
  }

  function notify(reason, payload = {}) {
    onChange({
      reason,
      payload,
      state: getState(),
      activeTask: getActiveTask(),
      activeFocus: getActiveFocus()
    });
  }

  function applyEvent(event = {}) {
    if (!event?.type) {
      return {
        changed: false,
        completedTaskIds: [],
        effects: [],
        activeFocus: getActiveFocus()
      };
    }

    const amount = Math.max(1, Number(event.amount || 1));
    const activeTask = getActiveTask();
    let changed = false;

    if (activeTask) {
      for (const objective of activeTask.objectives) {
        const objectiveState = getObjectiveState(state, activeTask.id, objective.id);

        if (!objectiveState || objectiveState.completed) {
          continue;
        }

        if (eventMatchesObjective(event, objective)) {
          objectiveState.current = Math.min(
            getObjectiveRequiredAmount(objective),
            Math.max(0, Number(objectiveState.current || 0)) + amount
          );
          if (objectiveState.current >= getObjectiveRequiredAmount(objective)) {
            objectiveState.completed = true;
          }
          changed = true;
        }

        if (eventMatchesCounter(event, objective)) {
          const counterId = objective.progress.counterId;
          state.facts[counterId] = getFactNumber(state.facts, counterId) + amount;
          changed = true;
        }
      }
    }

    changed = applyFactObjectiveState() || changed;
    const completion = resolveCompletedTasks();
    changed = completion.changed || changed;

    const result = {
      changed,
      completedTaskIds: completion.completedTaskIds,
      effects: completion.effects,
      activeFocus: getActiveFocus()
    };

    if (changed) {
      notify(
        completion.completedTaskIds.length ? "task-completed" : "task-progress",
        {
          event,
          completedTaskIds: completion.completedTaskIds,
          effects: completion.effects
        }
      );
    }

    return result;
  }

  function applyEffect(effect = {}) {
    if (!effect?.type) {
      return {
        changed: false,
        effect: null
      };
    }

    if (effect.type === TASK_EFFECT.SET_FACT) {
      const nextValue = Object.prototype.hasOwnProperty.call(effect, "value") ?
        effect.value :
        true;
      if (state.facts[effect.id] === nextValue) {
        return { changed: false, effect };
      }
      state.facts[effect.id] = nextValue;
      return { changed: true, effect };
    }

    if (effect.type === TASK_EFFECT.INCREMENT_FACT) {
      const amount = Math.max(1, Number(effect.amount || 1));
      state.facts[effect.id] = getFactNumber(state.facts, effect.id) + amount;
      return { changed: true, effect };
    }

    if (effect.type === TASK_EFFECT.UNLOCK) {
      const factId = `unlock.${effect.id}`;
      if (state.facts[factId] === true) {
        return { changed: false, effect };
      }
      state.facts[factId] = true;
      return { changed: true, effect };
    }

    return {
      changed: false,
      effect
    };
  }

  function applyEffects(effects = [], { notify: shouldNotify = true, reason = "effects" } = {}) {
    const appliedEffects = [];
    let changed = false;

    for (const effect of effects || []) {
      const result = applyEffect(effect);
      if (result.effect) {
        appliedEffects.push(result.effect);
      }
      changed = result.changed || changed;
    }

    changed = applyFactObjectiveState() || changed;
    const completion = resolveCompletedTasks();
    changed = completion.changed || changed;

    const result = {
      changed,
      completedTaskIds: completion.completedTaskIds,
      effects: [...appliedEffects, ...completion.effects],
      activeFocus: getActiveFocus()
    };

    if (changed && shouldNotify) {
      notify(reason, result);
    }

    return result;
  }

  function getState() {
    return cloneState(state);
  }

  function getFacts() {
    return { ...state.facts };
  }

  function getVisibleObjectives(taskId) {
    const task = getTask(taskId);
    if (!task) {
      return [];
    }

    return task.objectives
      .filter((objective) => getObjectiveState(state, task.id, objective.id)?.visible !== false)
      .map((objective) => buildVisibleObjective(state, task, objective));
  }

  function getActiveFocus() {
    const activeTask = getActiveTask();

    if (activeTask) {
      const requiredObjective = activeTask.objectives.find((objective) => (
        objective.required && !isObjectiveComplete(state, activeTask, objective)
      ));

      if (requiredObjective) {
        return buildFocus(state, activeTask, requiredObjective, "main");
      }
    }

    for (const objectiveId of state.trackedObjectiveIds) {
      const entry = objectiveById.get(objectiveId);

      if (entry && !isObjectiveComplete(state, entry.task, entry.objective)) {
        return buildFocus(state, entry.task, entry.objective, "tracked");
      }
    }

    if (activeTask) {
      const optionalObjective = activeTask.objectives.find((objective) => (
        !objective.required && !isObjectiveComplete(state, activeTask, objective)
      ));

      if (optionalObjective) {
        return buildFocus(state, activeTask, optionalObjective, "optional");
      }
    }

    return null;
  }

  function getTerminalTaskTree() {
    return taskList.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      kind: task.kind,
      status: getTaskProgress(task.id)?.status || TASK_STATUS.LOCKED,
      active: state.activeTaskId === task.id,
      completed: state.completedTaskIds.includes(task.id),
      objectives: getVisibleObjectives(task.id).map((objective) => ({
        ...objective,
        tracked: state.trackedObjectiveIds.includes(objective.id)
      }))
    }));
  }

  function trackObjective(objectiveId) {
    if (!objectiveById.has(objectiveId) || state.trackedObjectiveIds.includes(objectiveId)) {
      return false;
    }

    state.trackedObjectiveIds.push(objectiveId);
    notify("objective-tracked", { objectiveId });
    return true;
  }

  function untrackObjective(objectiveId) {
    if (!state.trackedObjectiveIds.includes(objectiveId)) {
      return false;
    }

    state.trackedObjectiveIds = state.trackedObjectiveIds.filter((id) => id !== objectiveId);
    notify("objective-untracked", { objectiveId });
    return true;
  }

  function reset() {
    state = createInitialState(taskList);
    notify("reset");
  }

  function restoreState(nextState = null) {
    state = mergeInitialState(taskList, nextState);
    applyFactObjectiveState();
    notify("restore");
    return getState();
  }

  applyFactObjectiveState();

  return {
    applyEvent,
    applyEffects,
    getActiveFocus,
    getActiveTask,
    getFacts,
    getState,
    getTask,
    getTerminalTaskTree,
    getVisibleObjectives,
    reset,
    restoreState,
    trackObjective,
    untrackObjective
  };
}
