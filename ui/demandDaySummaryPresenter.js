export function presentDemandDaySummary(summary, translator) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("DemandDaySummaryPresenter precisa de um translator.");
  }

  if (!summary) {
    return "";
  }

  const lines = [];
  const mostUsed = summary.serviceUsage?.[0];

  if (mostUsed) {
    lines.push(translator.t("demand.summary.mostUsed", {
      building: translator.t(`buildings.${mostUsed.buildingType}.label`),
      count: translator.formatNumber(mostUsed.count)
    }));
  }

  if (summary.totalCommercialRevenueInCents > 0) {
    lines.push(translator.t("demand.summary.commercialRevenue", {
      amount: translator.formatCurrency(
        summary.totalCommercialRevenueInCents / 100
      )
    }));
  }

  if (summary.mainMissedDemand) {
    lines.push(translator.t("demand.summary.missed", {
      motive: translator.t(
        `demand.motives.${summary.mainMissedDemand.motive}`
      ),
      count: translator.formatNumber(summary.mainMissedDemand.count)
    }));
  }

  return lines.join("\n");
}
