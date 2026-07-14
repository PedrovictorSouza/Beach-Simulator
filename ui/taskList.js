const TASK_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function createTaskListModel(initialTasks = []) {
  const tasks = new Map();
  let nextOrder = 0;

  const upsert = (task) => {
    const taskId = task?.id === undefined ? "" : String(task.id);
    const existing = tasks.get(taskId);

    if (!taskId || (!existing && !task?.label)) {
      throw new Error("Task precisa de id e label.");
    }

    tasks.set(taskId, {
      ...existing,
      ...task,
      id: taskId,
      label: String(task.label ?? existing.label),
      priority: task.priority === undefined ?
        existing?.priority ?? 0 :
        normalizeNumber(task.priority),
      urgency: task.urgency === undefined ?
        existing?.urgency ?? 0 :
        normalizeNumber(task.urgency),
      status: task.status || existing?.status || TASK_STATUS.ACTIVE,
      dependencies: task.dependencies === undefined ?
        existing?.dependencies ?? [] :
        Array.isArray(task.dependencies) ? task.dependencies.map(String) : [],
      order: existing?.order ?? nextOrder++
    });
  };

  initialTasks.forEach(upsert);

  return Object.freeze({
    upsert,
    remove(taskId) {
      tasks.delete(String(taskId));
    },
    getSnapshot() {
      const completedIds = new Set(
        [...tasks.values()]
          .filter((task) => task.status === TASK_STATUS.COMPLETED)
          .map((task) => task.id)
      );

      return [...tasks.values()]
        .filter((task) => task.status === TASK_STATUS.ACTIVE)
        .filter((task) => task.dependencies.every((id) => completedIds.has(id)))
        .map((task) => ({
          id: task.id,
          label: task.label,
          priority: task.priority,
          urgency: task.urgency,
          score: task.priority + task.urgency,
          order: task.order
        }))
        .sort((left, right) => right.score - left.score || left.order - right.order)
        .map(({ order, ...task }) => task);
    }
  });
}

export function createTaskListView({ root }) {
  if (!root) {
    throw new Error("TaskListView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const listElement = documentRef.createElement("ol");
  const emptyElement = documentRef.createElement("p");

  element.className = "task-list";
  element.setAttribute("aria-label", "Tasks");
  titleElement.className = "task-list__title";
  titleElement.textContent = "Tasks";
  listElement.className = "task-list__items";
  listElement.setAttribute("aria-live", "polite");
  emptyElement.className = "task-list__empty";
  emptyElement.textContent = "No tasks";
  element.append(titleElement, listElement, emptyElement);
  root.append(element);

  return Object.freeze({
    render(tasks) {
      const nextTasks = Array.isArray(tasks) ? tasks : [];
      const taskElements = nextTasks.map((task) => {
        const itemElement = documentRef.createElement("li");

        itemElement.className = "task-list__item";
        itemElement.dataset.taskId = task.id;
        itemElement.textContent = task.label;
        return itemElement;
      });

      listElement.replaceChildren(...taskElements);
      listElement.hidden = nextTasks.length === 0;
      emptyElement.hidden = nextTasks.length > 0;
    }
  });
}
