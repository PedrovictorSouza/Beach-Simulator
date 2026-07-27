export function createDailyCleanupTask(day) {
  const normalizedDay = Math.trunc(Number(day));

  if (!Number.isSafeInteger(normalizedDay) || normalizedDay <= 0) {
    throw new Error("DailyTaskPlan precisa de um dia inteiro positivo.");
  }

  return Object.freeze({
    id: `clean-up-after-visitor-day-${normalizedDay}`,
    label: "Clean up after a visitor",
    progress: 0,
    target: 1
  });
}
