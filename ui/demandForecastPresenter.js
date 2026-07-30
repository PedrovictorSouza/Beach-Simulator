export function presentDemandForecast(
  forecast,
  translator,
  { unlockedBuildingTypes = [] } = {}
) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("DemandForecastPresenter precisa de um translator.");
  }

  const priorities = Array.isArray(forecast?.priorities) ?
    forecast.priorities :
    [];

  if (priorities.length === 0) {
    return "";
  }

  const unlockedTypeSet = new Set(
    Array.isArray(unlockedBuildingTypes) ? unlockedBuildingTypes : []
  );
  const priority = priorities.find(({ recommendedBuildingType }) => (
    unlockedTypeSet.size === 0 ||
    unlockedTypeSet.has(recommendedBuildingType)
  )) || priorities[0];
  const reasonId = priority.reasons?.[0]?.id || "";
  const isDirtyBeach = reasonId === "demand.reasons.dirtyBeach";
  const isHotDay = reasonId === "demand.reasons.highHeat";
  const headlineId = isDirtyBeach ?
    "demand.focus.dirtyBeach" :
    isHotDay ?
      "demand.focus.hotDay" :
      `demand.focus.needs.${priority.motive}`;
  const actionId = isDirtyBeach ?
    "demand.focus.actions.pickUpTrash" :
    `demand.focus.actions.${priority.coverage}.${priority.motive}`;

  return [
    translator.t("demand.title"),
    translator.t(headlineId),
    translator.t(actionId)
  ].join("\n");
}
