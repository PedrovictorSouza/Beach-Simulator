import {
  BUILDING_SERVICE_MOTIVES,
  BUILDING_TYPES
} from "../buildings/buildingServicesModel.js";

export const DEMAND_BANDS = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
});

export const DEMAND_COVERAGE = Object.freeze({
  MISSING: "missing",
  AVAILABLE: "available",
  DEGRADED: "degraded"
});

const MOTIVE_ORDER = Object.freeze([
  BUILDING_SERVICE_MOTIVES.REFRESHMENT,
  BUILDING_SERVICE_MOTIVES.SAFETY,
  BUILDING_SERVICE_MOTIVES.CONNECTIVITY,
  BUILDING_SERVICE_MOTIVES.RELIEF,
  BUILDING_SERVICE_MOTIVES.CLEANLINESS,
  BUILDING_SERVICE_MOTIVES.ENTERTAINMENT
]);
const BUILDING_TYPE_BY_MOTIVE = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.REFRESHMENT]: BUILDING_TYPES.BEVERAGE_STORE,
  [BUILDING_SERVICE_MOTIVES.SAFETY]: BUILDING_TYPES.LIFEGUARD_BUILDING,
  [BUILDING_SERVICE_MOTIVES.CONNECTIVITY]: BUILDING_TYPES.WIFI_SPOT,
  [BUILDING_SERVICE_MOTIVES.RELIEF]: BUILDING_TYPES.TOILET_BUILDING,
  [BUILDING_SERVICE_MOTIVES.CLEANLINESS]: BUILDING_TYPES.TRASH_CANS,
  [BUILDING_SERVICE_MOTIVES.ENTERTAINMENT]: BUILDING_TYPES.VOLLEYBALL_COURT
});
const MOTIVE_BY_PROBLEM_SOURCE = Object.freeze({
  "heat-without-beverage": BUILDING_SERVICE_MOTIVES.REFRESHMENT,
  "missing-entertainment": BUILDING_SERVICE_MOTIVES.ENTERTAINMENT,
  "missing-wifi": BUILDING_SERVICE_MOTIVES.CONNECTIVITY,
  "missing-toilet": BUILDING_SERVICE_MOTIVES.RELIEF,
  "visible-litter": BUILDING_SERVICE_MOTIVES.CLEANLINESS
});
const BASE_DEMAND_SCORE = 1;
const PREVIOUS_PROBLEM_MODIFIER = 2;
const HIGH_HEAT_MODIFIER = 2;

function getDemandBand(score) {
  if (score >= 3) {
    return DEMAND_BANDS.HIGH;
  }

  if (score >= 2) {
    return DEMAND_BANDS.MEDIUM;
  }

  return DEMAND_BANDS.LOW;
}

function getCoverage(motive, advertisements) {
  const matching = advertisements.filter(
    (advertisement) => advertisement?.motive === motive
  );

  if (matching.length === 0) {
    return DEMAND_COVERAGE.MISSING;
  }

  return matching.some(({ available }) => available !== false) ?
    DEMAND_COVERAGE.AVAILABLE :
    DEMAND_COVERAGE.DEGRADED;
}

export function getDemandCoverage({ motive, services = {} } = {}) {
  const advertisements = Array.isArray(services?.advertisements) ?
    services.advertisements :
    [];

  return getCoverage(motive, advertisements);
}

function getPriorityGroup({ persistentProblem, demandBand, coverage }) {
  if (persistentProblem) {
    return 0;
  }

  if (demandBand === DEMAND_BANDS.HIGH) {
    if (coverage === DEMAND_COVERAGE.MISSING) {
      return 1;
    }
    if (coverage === DEMAND_COVERAGE.DEGRADED) {
      return 2;
    }
    return 3;
  }

  return 4;
}

function normalizeProblems(previousProblems) {
  return (Array.isArray(previousProblems) ? previousProblems : [])
    .map((problem) => ({
      source: String(problem?.source || "").trim(),
      count: Math.max(0, Math.trunc(Number(problem?.count) || 0))
    }))
    .filter(({ source, count }) => source && count > 0);
}

export function createDemandForecast({
  day = 1,
  heatLevel = "COMFORTABLE",
  conditionBand = "clean",
  previousProblems = [],
  services = {}
} = {}) {
  const normalizedDay = Math.max(1, Math.trunc(Number(day) || 1));
  const advertisements = Array.isArray(services?.advertisements) ?
    services.advertisements :
    [];
  const problems = normalizeProblems(previousProblems);
  const problemCountByMotive = new Map();

  for (const problem of problems) {
    const motive = MOTIVE_BY_PROBLEM_SOURCE[problem.source];

    if (!motive) {
      continue;
    }

    problemCountByMotive.set(
      motive,
      (problemCountByMotive.get(motive) || 0) + problem.count
    );
  }

  const forecasts = MOTIVE_ORDER.map((motive, stableIndex) => {
    const reasons = [];
    const persistentProblemCount = problemCountByMotive.get(motive) || 0;
    let demandScore = BASE_DEMAND_SCORE;

    if (motive === BUILDING_SERVICE_MOTIVES.REFRESHMENT && heatLevel === "HIGH") {
      demandScore += HIGH_HEAT_MODIFIER;
      reasons.push(Object.freeze({
        id: "demand.reasons.highHeat",
        params: Object.freeze({})
      }));
    }

    if (
      motive === BUILDING_SERVICE_MOTIVES.CLEANLINESS &&
      (conditionBand === "dirty" || conditionBand === "critical")
    ) {
      demandScore += 2;
      reasons.push(Object.freeze({
        id: "demand.reasons.dirtyBeach",
        params: Object.freeze({})
      }));
    }

    if (persistentProblemCount > 0) {
      demandScore += PREVIOUS_PROBLEM_MODIFIER;
      reasons.push(Object.freeze({
        id: "demand.reasons.previousProblem",
        params: Object.freeze({ count: persistentProblemCount })
      }));
    }

    const coverage = getDemandCoverage({
      motive,
      services: { advertisements }
    });

    if (coverage === DEMAND_COVERAGE.MISSING) {
      reasons.push(Object.freeze({
        id: "demand.reasons.missingCoverage",
        params: Object.freeze({})
      }));
    } else if (coverage === DEMAND_COVERAGE.DEGRADED) {
      reasons.push(Object.freeze({
        id: "demand.reasons.degradedCoverage",
        params: Object.freeze({})
      }));
    } else if (reasons.length === 0) {
      reasons.push(Object.freeze({
        id: "demand.reasons.covered",
        params: Object.freeze({})
      }));
    }

    if (reasons.length === 0) {
      reasons.push(Object.freeze({
        id: "demand.reasons.baseline",
        params: Object.freeze({})
      }));
    }

    const demandBand = getDemandBand(demandScore);

    return Object.freeze({
      motive,
      demandScore,
      demandBand,
      coverage,
      recommendedBuildingType: BUILDING_TYPE_BY_MOTIVE[motive],
      persistentProblem: persistentProblemCount > 0,
      persistentProblemCount,
      priorityGroup: getPriorityGroup({
        persistentProblem: persistentProblemCount > 0,
        demandBand,
        coverage
      }),
      reasons: Object.freeze(reasons),
      stableIndex
    });
  });
  const ordered = [...forecasts].sort((left, right) => (
    left.priorityGroup - right.priorityGroup ||
    right.demandScore - left.demandScore ||
    left.stableIndex - right.stableIndex
  ));

  return Object.freeze({
    day: normalizedDay,
    forecasts: Object.freeze(forecasts),
    priorities: Object.freeze(ordered.slice(0, 3))
  });
}
