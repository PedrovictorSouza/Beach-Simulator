import test from "node:test";
import assert from "node:assert/strict";

import {
  BEACH_AMENITY_TYPES,
  BUILDING_TYPES,
  createBuildingServicesModel,
  getSunShadeRentalRewardInCents
} from "../buildings/buildingServicesModel.js";
import {
  getLockedBuildingTypes,
  getNewlyUnlockedBuildingTypes,
  getUnlockedBuildingTypes
} from "../buildings/buildingUnlockModel.js";
import { getActiveBuildingSynergies } from "../buildings/buildingSynergyModel.js";
import {
  createBuildingChoiceModel,
  formatBuildingChoiceCost
} from "../ui/buildingChoice.js";
import {
  getBuildingPreviewYawOffset
} from "../ui/buildingPreviewTurntable.js";
import { getSceneryDefinition } from "../scenery/sceneryWorld.js";
import { createDemandForecast } from "../demand/demandForecastModel.js";
import { createDemandDayLedger } from "../demand/demandDayLedger.js";
import { createTranslator } from "../i18n/index.js";
import { presentDemandForecast } from "../ui/demandForecastPresenter.js";
import { createBeachConditionModel } from "../environment/beachConditionModel.js";
import { calculateBeachAttraction } from "../environment/beachAttractionModel.js";
import { BEACH_ECONOMY_BALANCE } from "../economy/beachEconomyBalance.js";
import {
  calculateEmergencyFundOffer,
  createEmergencyFundModel
} from "../run/emergencyFundModel.js";
import { createRunResultStorage } from "../run/runResultStorage.js";
import { createRunScoreModel } from "../run/runScoreModel.js";
import { createNpcSystem, NPC_STATES } from "../npcs/npcSystem.js";

test("toda construção do sorteio possui uma miniatura 3D", () => {
  for (const buildingType of Object.values(BUILDING_TYPES)) {
    const definition = getSceneryDefinition(buildingType);

    assert.match(definition.gltfPath, /\.gltf(?:$|\?)/);
    assert.match(definition.binPath, /\.bin(?:$|\?)/);
    assert.match(definition.texturePath, /\.png(?:$|\?)/);
  }

  assert.match(
    getSceneryDefinition(BUILDING_TYPES.TOILET_BUILDING).gltfPath,
    /Toilet\/toillet\.gltf$/
  );
});

test("turntable de construção completa voltas em passos PSX", () => {
  assert.equal(getBuildingPreviewYawOffset(0), 0);
  assert.ok(getBuildingPreviewYawOffset(75) > 0);
  assert.equal(getBuildingPreviewYawOffset(24 * 75), 0);
});

test("cards mostram dinheiro para receita e estrela para benefício", () => {
  const choice = createBuildingChoiceModel({ random: () => 0 });
  const moneyTypes = [
    BUILDING_TYPES.BEVERAGE_STORE,
    BUILDING_TYPES.LIFEGUARD_BUILDING,
    BUILDING_TYPES.WIFI_SPOT,
    BUILDING_TYPES.TOILET_BUILDING,
    BUILDING_TYPES.VOLLEYBALL_COURT
  ];
  const optionByType = new Map();

  for (const preferredTypes of [
    moneyTypes.slice(0, 3),
    [
      ...moneyTypes.slice(3),
      BUILDING_TYPES.TRASH_CANS
    ]
  ]) {
    const snapshot = choice.startChoice({
      preferredTypes,
      preferredOptionCount: 3
    });

    for (const option of snapshot.options) {
      optionByType.set(option.type, option);
    }
  }

  for (const type of moneyTypes) {
    assert.equal(optionByType.get(type).benefitIndicator.kind, "money");
    assert.match(
      optionByType.get(type).benefitIndicator.src,
      /money-thumb\.png$/
    );
  }

  assert.equal(
    optionByType.get(BUILDING_TYPES.TRASH_CANS).benefitIndicator.kind,
    "rating"
  );
  assert.match(
    optionByType.get(BUILDING_TYPES.TRASH_CANS).benefitIndicator.src,
    /star-HUD\.png$/
  );
});

test("preço do card usa formato arcade curto", () => {
  assert.equal(formatBuildingChoiceCost(500), "$5");
  assert.equal(formatBuildingChoiceCost(0), "$0");
  assert.doesNotMatch(formatBuildingChoiceCost(500), /US|R\$/);
});

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
  const beveragePurchases = [];
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
  npcSystem.subscribeToBeveragePurchases((event) => {
    beveragePurchases.push(event);
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

  for (let step = 0; step < 400 && beveragePurchases.length === 0; step += 1) {
    npcSystem.update(0.05, updateOptions);
  }

  assert.equal(beveragePurchases.length, 1);
  assert.equal(npcSystem.getSnapshot()[0].state, NPC_STATES.WALKING_TO_ACTIVITY);
  assert.equal(npcSystem.getSnapshot()[0].movementPurpose, "beach-waypoint");
});

test("banhista não abandona a praia nos primeiros segundos por falta de serviços", () => {
  const npcSystem = createNpcSystem({ random: () => 0 });

  npcSystem.addBather({ position: [0, 0] });

  for (let step = 0; step < 800; step += 1) {
    npcSystem.update(0.05, {
      heat: { level: "HIGH", heat: 100 }
    });
  }

  const bather = npcSystem.getSnapshot()[0];

  assert.ok(bather);
  assert.equal(bather.departing, false);
  assert.ok(bather.walkDistance > 0 || bather.state === NPC_STATES.RELAXING);
});

test("guarda-sol paga pela duração completa da estadia", () => {
  assert.equal(getSunShadeRentalRewardInCents(4.99), 0);
  assert.equal(getSunShadeRentalRewardInCents(5), 100);
  assert.equal(getSunShadeRentalRewardInCents(9.99), 100);
  assert.equal(getSunShadeRentalRewardInCents(10), 300);
  assert.equal(getSunShadeRentalRewardInCents(14.99), 300);
  assert.equal(getSunShadeRentalRewardInCents(15), 500);
  assert.equal(getSunShadeRentalRewardInCents(30), 500);
});

test("toda receita de visitante usa dólares inteiros", () => {
  const visitorRevenueValues = [
    BEACH_ECONOMY_BALANCE.beveragePurchasePriceInCents,
    BEACH_ECONOMY_BALANCE.beverageServiceRevenue.amountInCents,
    BEACH_ECONOMY_BALANCE.wifiServiceRevenue.amountInCents,
    BEACH_ECONOMY_BALANCE.lifeguardServiceRevenue.amountInCents,
    BEACH_ECONOMY_BALANCE.toiletServiceRevenue.amountInCents,
    BEACH_ECONOMY_BALANCE.volleyballServiceRevenue.amountInCents,
    ...BEACH_ECONOMY_BALANCE.sunShadeRentalRewardTiers.map(
      ({ amountInCents }) => amountInCents
    )
  ];

  assert.equal(
    visitorRevenueValues.every((amountInCents) => amountInCents % 100 === 0),
    true
  );
});

test("calor aumenta a procura e cada guarda-sol recebe um banhista", () => {
  const coldNpcSystem = createNpcSystem({ random: () => 0.5 });
  const hotNpcSystem = createNpcSystem({ random: () => 0.5 });
  const coldDecisions = [];
  const hotDecisions = [];

  coldNpcSystem.subscribeToServiceDecisions((event) => {
    if (event.buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
      coldDecisions.push(event);
    }
  });
  hotNpcSystem.subscribeToServiceDecisions((event) => {
    if (event.buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
      hotDecisions.push(event);
    }
  });
  coldNpcSystem.addBather({ position: [0, 0] });
  hotNpcSystem.addBather({ position: [0, 0] });

  for (let step = 0; step < 1400; step += 1) {
    coldNpcSystem.update(0.05, {
      heat: { level: "COMFORTABLE", heat: 0 },
      sunShadePositions: [[42, 4]]
    });
    hotNpcSystem.update(0.05, {
      heat: { level: "COMFORTABLE", heat: 100 },
      sunShadePositions: [[42, 4]]
    });
  }

  assert.equal(coldDecisions.length, 0);
  assert.ok(hotDecisions.length > 0);

  const occupancyNpcSystem = createNpcSystem({ random: () => 0 });
  const completions = [];
  let simultaneousUseObserved = false;

  occupancyNpcSystem.subscribeToServiceCompletions((event) => {
    if (event.buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
      completions.push(event);
    }
  });
  occupancyNpcSystem.addBather({ position: [0, 0] });
  occupancyNpcSystem.addBather({ position: [0, 0] });

  for (let step = 0; step < 1600 && completions.length < 2; step += 1) {
    occupancyNpcSystem.update(0.05, {
      heat: { level: "COMFORTABLE", heat: 100 },
      sunShadePositions: [[-36, 12], [-35, 12]]
    });
    const sunShadeUsers = occupancyNpcSystem.getSnapshot().filter((bather) => (
      bather.activityBuildingType === BEACH_AMENITY_TYPES.SUN_SHADE
    ));
    const occupiedPositions = sunShadeUsers.map(
      (bather) => bather.interaction?.sunShadePositionKey
    );

    assert.equal(
      occupiedPositions.every(Boolean),
      true
    );
    assert.equal(
      new Set(occupiedPositions).size,
      occupiedPositions.length
    );
    simultaneousUseObserved ||= sunShadeUsers.length === 2;
  }

  assert.equal(simultaneousUseObserved, true);
  assert.equal(completions.length, 2);
  assert.deepEqual(
    completions.map(({ durationSeconds }) => durationSeconds),
    [15, 15]
  );
});

test("primeiro guarda-sol fecha o ciclo inicial com um aluguel garantido de $5", () => {
  const npcSystem = createNpcSystem({ random: () => 0.99 });
  const buildingServices = createBuildingServicesModel();
  const decisions = [];
  const completions = [];
  const revenues = [];

  npcSystem.subscribeToServiceDecisions((event) => decisions.push(event));
  npcSystem.subscribeToServiceCompletions((event) => {
    completions.push(event);
    buildingServices.recordServiceCompletion(event);
  });
  buildingServices.subscribeToRevenue((event) => revenues.push(event));
  npcSystem.addBather({ position: [0, 0] });

  for (let step = 0; step < 2400; step += 1) {
    npcSystem.update(0.05, {
      heat: { level: "HIGH", heat: 100 },
      guaranteeFirstSunShadeRental: true
    });
  }

  assert.equal(npcSystem.getSnapshot().length, 1);

  for (let step = 0; step < 1600 && completions.length === 0; step += 1) {
    npcSystem.update(0.05, {
      heat: { level: "COMFORTABLE", heat: 0 },
      sunShadePositions: [[12, 8]],
      guaranteeFirstSunShadeRental: true
    });
  }

  assert.equal(decisions.length, 1);
  assert.equal(decisions[0].buildingType, BEACH_AMENITY_TYPES.SUN_SHADE);
  assert.equal(decisions[0].guaranteed, true);
  assert.equal(completions.length, 1);
  assert.equal(completions[0].durationSeconds, 15);
  assert.equal(completions[0].guaranteed, true);
  assert.equal(revenues.length, 1);
  assert.equal(revenues[0].amountInCents, 500);
  assert.equal(npcSystem.getSnapshot()[0].state, NPC_STATES.WALKING_TO_ACTIVITY);
  assert.equal(npcSystem.getSnapshot()[0].movementPurpose, "beach-waypoint");
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

test("tesouro usa o saldo real e só recupera uma vez em dias úteis", () => {
  assert.equal(calculateEmergencyFundOffer({
    day: 1,
    totalDays: 5,
    availableMoneyInCents: 0,
    hasReachableIncome: false
  }).eligible, false);

  const fund = createEmergencyFundModel();
  const offered = fund.offer({
    day: 2,
    totalDays: 5,
    availableMoneyInCents: 0,
    hasReachableIncome: false
  });

  assert.equal(offered.plan.totalPayoutInCents, 500);
  const claims = Array.from({ length: 6 }, () => fund.claimClick().amountInCents);
  assert.deepEqual(claims, [100, 100, 100, 100, 100, 0]);
  assert.equal(fund.offer({
    day: 3,
    totalDays: 5,
    availableMoneyInCents: 0,
    hasReachableIncome: false
  }).offered, false);
});
