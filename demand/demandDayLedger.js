import { getDemandCoverage } from "./demandForecastModel.js";

const MOTIVE_BY_PROBLEM_SOURCE = Object.freeze({
  "heat-without-beverage": "refreshment",
  "missing-entertainment": "entertainment",
  "missing-wifi": "connectivity",
  "missing-toilet": "relief",
  "visible-litter": "cleanliness"
});

function freezeEntries(map, valueKey) {
  return Object.freeze([...map.entries()].map(([key, value]) => (
    Object.freeze({ key, [valueKey]: value })
  )));
}

function normalizeProblems(problems) {
  return (Array.isArray(problems) ? problems : [])
    .map((problem) => ({
      source: String(problem?.source || "").trim(),
      count: Math.max(0, Math.trunc(Number(problem?.count) || 0))
    }))
    .filter(({ source, count }) => source && count > 0);
}

export function createDemandDayLedger({ forecast } = {}) {
  if (!forecast || !Array.isArray(forecast.forecasts)) {
    throw new Error("DemandDayLedger precisa de uma previsao do dia.");
  }

  const completedEventIds = new Set();
  const revenueEventIds = new Set();
  const usesByBuildingType = new Map();
  const revenueByBuildingType = new Map();
  let closedSummary = null;

  const assertOpen = () => {
    if (closedSummary) {
      throw new Error("DemandDayLedger ja foi fechado.");
    }
  };

  return Object.freeze({
    recordServiceCompletion({
      eventId,
      buildingType,
      motive = ""
    } = {}) {
      assertOpen();
      const normalizedEventId = String(eventId || "").trim();
      const normalizedBuildingType = String(buildingType || "").trim();

      if (!normalizedEventId || !normalizedBuildingType) {
        return false;
      }

      if (completedEventIds.has(normalizedEventId)) {
        return false;
      }

      completedEventIds.add(normalizedEventId);
      const existing = usesByBuildingType.get(normalizedBuildingType) || {
        count: 0,
        motive: String(motive || "").trim()
      };

      usesByBuildingType.set(normalizedBuildingType, {
        count: existing.count + 1,
        motive: existing.motive || String(motive || "").trim()
      });
      return true;
    },
    recordRevenue({
      eventId,
      buildingType,
      amountInCents
    } = {}) {
      assertOpen();
      const normalizedEventId = String(eventId || "").trim();
      const normalizedBuildingType = String(buildingType || "").trim();
      const normalizedAmount = Math.max(
        0,
        Math.trunc(Number(amountInCents) || 0)
      );

      if (
        !normalizedEventId ||
        !normalizedBuildingType ||
        normalizedAmount <= 0 ||
        revenueEventIds.has(normalizedEventId)
      ) {
        return false;
      }

      revenueEventIds.add(normalizedEventId);
      revenueByBuildingType.set(
        normalizedBuildingType,
        (revenueByBuildingType.get(normalizedBuildingType) || 0) +
          normalizedAmount
      );
      return true;
    },
    closeDay({ finalServices = {}, problems = [] } = {}) {
      if (closedSummary) {
        return closedSummary;
      }

      const normalizedProblems = normalizeProblems(problems);
      const missedDemandByMotive = new Map();

      for (const problem of normalizedProblems) {
        const motive = MOTIVE_BY_PROBLEM_SOURCE[problem.source];

        if (!motive) {
          continue;
        }

        missedDemandByMotive.set(
          motive,
          (missedDemandByMotive.get(motive) || 0) + problem.count
        );
      }

      const serviceUsage = [...usesByBuildingType.entries()]
        .map(([buildingType, usage]) => Object.freeze({
          buildingType,
          motive: usage.motive,
          count: usage.count
        }))
        .sort((left, right) => right.count - left.count ||
          left.buildingType.localeCompare(right.buildingType));
      const commercialRevenue = [...revenueByBuildingType.entries()]
        .map(([buildingType, amountInCents]) => Object.freeze({
          buildingType,
          amountInCents
        }))
        .sort((left, right) => right.amountInCents - left.amountInCents ||
          left.buildingType.localeCompare(right.buildingType));
      const missedDemand = freezeEntries(
        missedDemandByMotive,
        "count"
      ).map(({ key, count }) => Object.freeze({ motive: key, count }));

      closedSummary = Object.freeze({
        serviceUsage: Object.freeze(serviceUsage),
        commercialRevenue: Object.freeze(commercialRevenue),
        totalCommercialRevenueInCents: commercialRevenue.reduce(
          (total, entry) => total + entry.amountInCents,
          0
        ),
        missedDemand: Object.freeze(missedDemand),
        mainMissedDemand: [...missedDemand]
          .sort((left, right) => right.count - left.count)[0] || null,
        priorityCoverage: Object.freeze(forecast.priorities.map((priority) => (
          Object.freeze({
            motive: priority.motive,
            demandBand: priority.demandBand,
            initialCoverage: priority.coverage,
            finalCoverage: getDemandCoverage({
              motive: priority.motive,
              services: finalServices
            })
          })
        )))
      });

      return closedSummary;
    }
  });
}
