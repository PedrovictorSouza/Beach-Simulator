export function presentBeachConditionSummary(snapshot, translator) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("BeachConditionPresenter precisa de um translator.");
  }

  if (!snapshot) {
    return "";
  }

  const percentage = Math.round(
    Math.max(0, Number(snapshot.attractionPenalty) || 0) * 100
  );

  return [
    translator.t("cleanup.report.condition", {
      condition: translator.t(
        `cleanup.conditions.${snapshot.conditionBand}`
      )
    }),
    translator.t("cleanup.report.litter", {
      produced: translator.formatNumber(snapshot.producedCount),
      captured: translator.formatNumber(snapshot.capturedCount),
      collected: translator.formatNumber(snapshot.collectedCount),
      debt: translator.formatNumber(snapshot.nextDayDebtCount)
    }),
    percentage > 0 ?
      translator.t("cleanup.report.attractionPenalty", {
        percentage: translator.formatNumber(percentage)
      }) :
      translator.t("cleanup.report.noAttractionPenalty")
  ].join("\n");
}
