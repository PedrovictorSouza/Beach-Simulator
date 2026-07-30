import test from "node:test";
import assert from "node:assert/strict";

import { BUILDING_TYPES } from "../buildings/buildingServicesModel.js";
import {
  getLockedBuildingTypes,
  getNewlyUnlockedBuildingTypes,
  getUnlockedBuildingTypes
} from "../buildings/buildingUnlockModel.js";
import { getActiveBuildingSynergies } from "../buildings/buildingSynergyModel.js";
import { createBuildingChoiceModel } from "../ui/buildingChoice.js";
import { createDemandForecast } from "../demand/demandForecastModel.js";
import { createDemandDayLedger } from "../demand/demandDayLedger.js";
import { createTranslator } from "../i18n/index.js";
import { presentDemandForecast } from "../ui/demandForecastPresenter.js";
import { createBeachConditionModel } from "../environment/beachConditionModel.js";
import { calculateBeachAttraction } from "../environment/beachAttractionModel.js";
import { createClosingReservePlan } from "../economy/closingReserveModel.js";
import {
  calculateEmergencyFundOffer,
  createEmergencyFundModel
} from "../run/emergencyFundModel.js";
import { createRunResultStorage } from "../run/runResultStorage.js";
import { createRunScoreModel } from "../run/runScoreModel.js";
import { createNpcSystem, NPC_STATES } from "../npcs/npcSystem.js";

test("desbloqueio gradual mantém uma única progressão por dia", () => {
  assert.deepEqual(getUnlockedBuildingTypes(1), [
    BUILDING_TYPES.BEVERAGE_STORE,
    BUILDING_TYPES.TOILET_BUILDING,
    BUILDING_TYPES.TRASH_CANS
  ]);
  assert.deepEqual(getNewlyUnlockedBuildingTypes(2), [
    BUILDING_TYPES.LIFEGUARD_BUILDING
  ]);
  assert.deepEqual(getNewlyUnlockedBuildingTypes(3), [
    BUILDING_TYPES.VOLLEYBALL_COURT
  ]);
  assert.deepEqual(getNewlyUnlockedBuildingTypes(4), [
    BUILDING_TYPES.WIFI_SPOT
  ]);
  assert.deepEqual(getLockedBuildingTypes(5), []);

  const choice = createBuildingChoiceModel({ random: () => 0 });
  const snapshot = choice.startChoice({
    excludedTypes: getLockedBuildingTypes(1)
  });

  assert.deepEqual(
    snapshot.options.map(({ type }) => type),
    [
      BUILDING_TYPES.BEVERAGE_STORE,
      BUILDING_TYPES.TOILET_BUILDING,
      BUILDING_TYPES.TRASH_CANS
    ]
  );
  assert.equal(snapshot.options.length, 3);
});

test("mapa de demanda ordena calor e problema comprovado", () => {
  const forecast = createDemandForecast({
    heatLevel: "HIGH",
    conditionBand: "dirty",
    previousProblems: [{ source: "missing-toilet", count: 2 }],
    services: { advertisements: [] }
  });

  assert.equal(forecast.priorities.length, 3);
  assert.equal(forecast.priorities[0].motive, "relief");
  assert.equal(
    forecast.forecasts.find(({ motive }) => motive === "refreshment").demandBand,
    "high"
  );
  assert.equal(
    forecast.forecasts.find(({ motive }) => motive === "cleanliness").demandBand,
    "high"
  );
});

test("foco do dia explica um problema com uma ação curta", () => {
  const forecast = createDemandForecast({
    heatLevel: "COMFORTABLE",
    conditionBand: "dirty",
    services: { advertisements: [] }
  });
  const translator = createTranslator({ initialLocale: "en" });
  const notice = presentDemandForecast(forecast, translator, {
    unlockedBuildingTypes: getUnlockedBuildingTypes(1)
  });

  assert.equal(
    notice,
    "TODAY'S FOCUS\nTHE BEACH IS DIRTY\nPICK UP THE TRASH"
  );
  assert.doesNotMatch(notice, /coverage|demand|high|low|toilet|lifeguard/i);
});

test("ledger atribui usos e receita uma única vez ao evento real", () => {
  const forecast = createDemandForecast();
  const ledger = createDemandDayLedger({ forecast });

  assert.equal(ledger.recordServiceCompletion({
    eventId: "use-1",
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    motive: "refreshment"
  }), true);
  assert.equal(ledger.recordServiceCompletion({
    eventId: "use-1",
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    motive: "refreshment"
  }), false);
  assert.equal(ledger.recordRevenue({
    eventId: "money-1",
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    amountInCents: 100
  }), true);
  assert.equal(ledger.recordRevenue({
    eventId: "money-1",
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    amountInCents: 100
  }), false);

  const summary = ledger.closeDay();

  assert.equal(summary.serviceUsage[0].count, 1);
  assert.equal(summary.totalCommercialRevenueInCents, 100);
});

test("banhista passeia na praia antes de visitar a loja de bebidas", () => {
  const npcSystem = createNpcSystem({ random: () => 0 });
  const beverageDecisions = [];
  const updateOptions = {
    buildingServices: {
      hasBeverageStore: true,
      advertisements: [{
        buildingType: BUILDING_TYPES.BEVERAGE_STORE,
        motive: "refreshment",
        available: true
      }]
    },
    heat: { level: "HIGH", heat: 100 },
    beverageStorePosition: [0, 10]
  };

  npcSystem.subscribeToBeverageDecisions((event) => {
    beverageDecisions.push(event);
  });
  npcSystem.addBather({ position: [0, 0] });
  npcSystem.update(0.05, updateOptions);

  assert.equal(beverageDecisions.length, 0);
  assert.equal(
    npcSystem.getSnapshot()[0].movementPurpose,
    "beach-waypoint"
  );

  let relaxedOnBeach = false;

  for (let step = 0; step < 400 && beverageDecisions.length === 0; step += 1) {
    npcSystem.update(0.05, updateOptions);
    relaxedOnBeach ||= npcSystem.getSnapshot()[0]?.state === NPC_STATES.RELAXING;
  }

  assert.equal(relaxedOnBeach, true);
  assert.equal(beverageDecisions.length, 1);
});

test("condição da praia carrega dívida limitada e afeta atração", () => {
  const condition = createBeachConditionModel({
    initialVisibleLitterCount: 8
  });
  const saved = condition.closeDay({ policy: "save" });

  assert.equal(saved.nextDayDebtCount, 5);
  assert.equal(saved.snapshot.conditionBand, "critical");
  assert.equal(saved.snapshot.attractionPenalty, 0.45);
  assert.equal(condition.startNextDay().visibleLitterCount, 5);

  const attraction = calculateBeachAttraction({
    sunShadeCount: 20,
    conditionPenalty: 0.45
  });

  assert.equal(attraction.sunShadeBonus, 0.32);
  assert.ok(Math.abs(attraction.multiplier - 0.87) < Number.EPSILON * 2);
});

test("reserva combina manutenção, limpeza e apoio público", () => {
  assert.deepEqual(createClosingReservePlan({
    servicePlan: {
      grossServiceCostsInCents: 700,
      publicSupportInCents: 500
    },
    cleanupPlan: { cleanupCostInCents: 400 },
    availableMoneyInCents: 500
  }), {
    serviceCostsInCents: 700,
    cleanupCostsInCents: 400,
    grossServiceCostsInCents: 1100,
    publicSupportInCents: 500,
    amountToReserveInCents: 600,
    freeToInvestInCents: 0,
    reserveShortfallInCents: 100
  });
});

test("sinergias refletem somente construções e serviços ativos", () => {
  const synergies = getActiveBuildingSynergies({
    services: {
      owned: [
        BUILDING_TYPES.BEVERAGE_STORE,
        BUILDING_TYPES.TRASH_CANS,
        BUILDING_TYPES.VOLLEYBALL_COURT,
        BUILDING_TYPES.LIFEGUARD_BUILDING,
        BUILDING_TYPES.TOILET_BUILDING
      ],
      lifeguardOperational: true,
      toiletOperational: false
    },
    sunShadeCount: 1
  });

  assert.deepEqual(synergies, [
    "drinksAndBins",
    "shadeAndDrinks",
    "safeVolleyball"
  ]);
});

test("nota acumulada é ponderada e dia vazio não vira zero", () => {
  const score = createRunScoreModel({
    runId: "run-test",
    totalDays: 3
  });

  score.recordDay({ day: 1, reviews: [{ rating: 5 }, { rating: 3 }] });
  const emptyDay = score.recordDay({ day: 2, reviews: [] });

  assert.equal(emptyDay.cumulativeAverageRating, 4);
  score.recordDay({ day: 3, reviews: [{ rating: 1 }] });
  const finalResult = score.finalize({
    completedAt: "2026-07-30T12:00:00.000Z"
  }).finalResult;

  assert.equal(finalResult.finalRating, 3);
  assert.equal(finalResult.totalReviews, 3);
  assert.equal(Object.isFrozen(finalResult), true);
});

test("histórico local valida, limita e não duplica runs", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const results = createRunResultStorage({ storage, maxResults: 2 });
  const makeResult = (runId, completedAt) => ({
    version: 1,
    runId,
    finalRating: 4,
    totalReviews: 1,
    dayRatings: [{ day: 1, averageRating: 4, reviewCount: 1 }],
    completedAt
  });

  results.save(makeResult("a", "2026-07-28T12:00:00.000Z"));
  results.save(makeResult("b", "2026-07-29T12:00:00.000Z"));
  results.save(makeResult("c", "2026-07-30T12:00:00.000Z"));
  assert.deepEqual(results.getResults().map(({ runId }) => runId), ["c", "b"]);
  assert.equal(results.save(
    makeResult("c", "2026-07-30T12:00:00.000Z")
  ).saved, false);

  values.set("beach-simulator.run-results.v1", "{invalid");
  assert.deepEqual(results.getResults(), []);
});

test("tesouro só recupera uma vez, em dias úteis, até sete cliques", () => {
  assert.equal(calculateEmergencyFundOffer({
    day: 1,
    totalDays: 5,
    reserveShortfallInCents: 700,
    freeToInvestInCents: 0,
    hasReachableIncome: false
  }).eligible, false);

  const fund = createEmergencyFundModel();
  const offered = fund.offer({
    day: 2,
    totalDays: 5,
    reserveShortfallInCents: 400,
    freeToInvestInCents: 0,
    hasReachableIncome: false
  });

  assert.equal(offered.plan.totalPayoutInCents, 700);
  const claims = Array.from({ length: 8 }, () => fund.claimClick().amountInCents);
  assert.deepEqual(claims, [100, 100, 100, 100, 100, 100, 100, 0]);
  assert.equal(fund.offer({
    day: 3,
    totalDays: 5,
    reserveShortfallInCents: 700,
    hasReachableIncome: false
  }).offered, false);
});
