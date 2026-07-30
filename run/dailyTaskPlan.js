export function createDailyCleanupTask(day) {
  const normalizedDay = Math.trunc(Number(day));

  if (!Number.isSafeInteger(normalizedDay) || normalizedDay <= 0) {
    throw new Error("DailyTaskPlan precisa de um dia inteiro positivo.");
  }

  return Object.freeze({
    id: `clean-up-after-visitor-day-${normalizedDay}`,
    messageId: "tasks.cleanAfterVisitor",
    progress: 0,
    target: 1
  });
}

export function createHeatWaveTask() {
  return Object.freeze({
    id: "cool-down-heat-wave",
    messageId: "tasks.coolDownPeople",
    messageParams: { count: 3 },
    progress: 0,
    target: 3,
    priority: 3,
    urgency: 2
  });
}
