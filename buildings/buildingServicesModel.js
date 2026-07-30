import {
  BEACH_OBJECT_DEFINITIONS,
  BEACH_OBJECT_TYPES,
  getBeachObjectDefinition
} from "../objects/beachObjectCatalog.js";

export const BUILDING_TYPES = Object.freeze({
  BEVERAGE_STORE: BEACH_OBJECT_TYPES.BEVERAGE_STORE,
  LIFEGUARD_BUILDING: BEACH_OBJECT_TYPES.LIFEGUARD_BUILDING,
  WIFI_SPOT: BEACH_OBJECT_TYPES.WIFI_SPOT,
  TOILET_BUILDING: BEACH_OBJECT_TYPES.TOILET_BUILDING,
  TRASH_CANS: BEACH_OBJECT_TYPES.TRASH_CANS,
  VOLLEYBALL_COURT: BEACH_OBJECT_TYPES.VOLLEYBALL_COURT
});

export const BUILDING_SERVICE_MOTIVES = Object.freeze({
  CLEANLINESS: "cleanliness",
  CONNECTIVITY: "connectivity",
  ENTERTAINMENT: "entertainment",
  REFRESHMENT: "refreshment",
  RELIEF: "relief",
  SAFETY: "safety"
});

export const BEACH_AMENITY_TYPES = Object.freeze({
  SUN_SHADE: BEACH_OBJECT_TYPES.SUN_SHADE
});

export const BEVERAGE_PURCHASE_PRICE_IN_CENTS = getBeachObjectDefinition(
  BUILDING_TYPES.BEVERAGE_STORE
).economy.batherPurchasePriceInCents;
export const BEVERAGE_PURCHASE_DURATION_SECONDS = 5;
export const SUN_SHADE_RENTAL_REWARD_TIERS = Object.freeze([
  ...getBeachObjectDefinition(BEACH_AMENITY_TYPES.SUN_SHADE)
    .service.revenue.rewardTiers
]);

export function getSunShadeRentalRewardInCents(durationSeconds) {
  const duration = Math.max(0, Number(durationSeconds) || 0);
  const tier = SUN_SHADE_RENTAL_REWARD_TIERS.reduce((selected, candidate) => (
    duration >= candidate.durationSeconds ? candidate : selected
  ), null);

  return tier?.amountInCents || 0;
}

const SERVICE_ADVERTISEMENT_DEFINITIONS = Object.freeze(
  Object.values(BUILDING_TYPES).map((buildingType) => {
    const advertisement = getBeachObjectDefinition(buildingType).service.advertisement;

    return Object.freeze({
      buildingType,
      motive: advertisement.motive,
      utility: advertisement.utility
    });
  })
);

const BUILDING_TYPE_SET = new Set(Object.values(BUILDING_TYPES));
const TOILET_DIRT_PER_BATHER_SECOND = getBeachObjectDefinition(
  BUILDING_TYPES.TOILET_BUILDING
).batherInteraction.dirtPerBatherSecond;
const TOILET_MAINTENANCE_COST_IN_CENTS = getBeachObjectDefinition(
  BUILDING_TYPES.TOILET_BUILDING
).economy.endOfDayMaintenanceCostInCents;
const LIFEGUARD_SALARY_IN_CENTS = getBeachObjectDefinition(
  BUILDING_TYPES.LIFEGUARD_BUILDING
).economy.endOfDayMaintenanceCostInCents;
const FIRST_PUBLIC_SUPPORT_GRANT_IN_CENTS = 500;
const PUBLIC_SERVICE_SUPPORT_DEFINITIONS = Object.freeze(
  Object.values(BUILDING_TYPES)
    .map((buildingType) => ({
      buildingType,
      amountInCents: BEACH_OBJECT_DEFINITIONS[buildingType].economy
        ?.publicSupportInCents || 0
    }))
    .filter(({ amountInCents }) => amountInCents > 0)
    .map((definition) => Object.freeze(definition))
);
const SERVICE_REVENUE_DEFINITIONS = Object.freeze(
  Object.values(BUILDING_TYPES)
    .map((buildingType) => ({
      buildingType,
      revenue: BEACH_OBJECT_DEFINITIONS[buildingType].service?.revenue
    }))
    .filter(({ buildingType, revenue }) => (
      revenue && buildingType !== BEACH_AMENITY_TYPES.SUN_SHADE
    ))
    .map(({ buildingType, revenue }) => Object.freeze({
      buildingType,
      intervalSeconds: revenue.intervalSeconds,
      amountInCents: revenue.amountInCents
    }))
);

function createSnapshot({ ownedTypes, toiletCleanliness, lifeguardPaid }) {
  const owned = Object.freeze([...ownedTypes]);
  const hasToiletBuilding = ownedTypes.has(BUILDING_TYPES.TOILET_BUILDING);
  const hasLifeguardBuilding = ownedTypes.has(BUILDING_TYPES.LIFEGUARD_BUILDING);
  const advertisements = Object.freeze(SERVICE_ADVERTISEMENT_DEFINITIONS
    .filter(({ buildingType }) => ownedTypes.has(buildingType))
    .map((definition) => Object.freeze({
      ...definition,
      available: definition.buildingType === BUILDING_TYPES.TOILET_BUILDING
        ? toiletCleanliness > 0
        : definition.buildingType === BUILDING_TYPES.LIFEGUARD_BUILDING
          ? lifeguardPaid
          : true
    })));

  return Object.freeze({
    owned,
    advertisements,
    hasBeverageStore: ownedTypes.has(BUILDING_TYPES.BEVERAGE_STORE),
    hasLifeguardBuilding,
    hasWifiSpot: ownedTypes.has(BUILDING_TYPES.WIFI_SPOT),
    hasToiletBuilding,
    hasTrashCans: ownedTypes.has(BUILDING_TYPES.TRASH_CANS),
    toiletCleanliness,
    toiletOperational: hasToiletBuilding && toiletCleanliness > 0,
    lifeguardOperational: hasLifeguardBuilding && lifeguardPaid,
    sharkWarningActive: hasLifeguardBuilding && lifeguardPaid
  });
}

export function createBuildingServicesModel() {
  const ownedTypes = new Set();
  const revenueObservers = new Set();
  const serviceUsageSecondsByKey = new Map();
  let toiletCleanliness = 100;
  let lifeguardPaid = true;
  let revenueSequence = 0;
  let publicSupportGrantClaimed = false;
  const getSnapshot = () => createSnapshot({
    ownedTypes,
    toiletCleanliness,
    lifeguardPaid
  });
  const notifyRevenue = (event) => {
    for (const observer of revenueObservers) {
      observer(event);
    }
  };

  return Object.freeze({
    getSnapshot,
    addBuilding(type) {
      if (!BUILDING_TYPE_SET.has(type)) {
        throw new Error(`Tipo de construcao desconhecido: ${type}`);
      }

      ownedTypes.add(type);
      return getSnapshot();
    },
    hasBuilding(type) {
      return ownedTypes.has(type);
    },
    update(
      deltaSeconds,
      {
        batherCount = 0,
        bathers = [],
        serviceUsers = []
      } = {}
    ) {
      const stepSeconds = Math.max(0, Number(deltaSeconds) || 0);
      const activeBathers = Array.isArray(bathers) ? bathers : [];
      const activeServiceUsers = Array.isArray(serviceUsers) ? serviceUsers : [];
      const normalizedBatherCount = activeBathers.length > 0 ?
        activeBathers.length :
        Math.max(0, Math.floor(Number(batherCount) || 0));

      if (ownedTypes.has(BUILDING_TYPES.TOILET_BUILDING)) {
        toiletCleanliness = Math.max(
          0,
          toiletCleanliness - normalizedBatherCount *
            TOILET_DIRT_PER_BATHER_SECOND * stepSeconds
        );
      }

      const activeUsageKeys = new Set();

      for (const definition of SERVICE_REVENUE_DEFINITIONS) {
        if (!ownedTypes.has(definition.buildingType)) {
          continue;
        }

        for (const bather of activeServiceUsers.filter((candidate) => (
          candidate?.activityBuildingType === definition.buildingType
        ))) {
          const batherId = String(bather?.id || "").trim();

          if (!batherId) {
            continue;
          }

          const usageKey = `${definition.buildingType}:${batherId}`;
          activeUsageKeys.add(usageKey);
          let usageSeconds = (serviceUsageSecondsByKey.get(usageKey) || 0) +
            stepSeconds;

          while (usageSeconds >= definition.intervalSeconds) {
            usageSeconds -= definition.intervalSeconds;
            revenueSequence += 1;
            notifyRevenue(Object.freeze({
              sequence: revenueSequence,
              buildingType: definition.buildingType,
              batherId,
              amountInCents: definition.amountInCents
            }));
          }

          serviceUsageSecondsByKey.set(usageKey, usageSeconds);
        }
      }

      for (const usageKey of serviceUsageSecondsByKey.keys()) {
        if (!activeUsageKeys.has(usageKey)) {
          serviceUsageSecondsByKey.delete(usageKey);
        }
      }

      return getSnapshot();
    },
    recordServiceCompletion({
      buildingType,
      batherId,
      durationSeconds
    } = {}) {
      if (buildingType !== BEACH_AMENITY_TYPES.SUN_SHADE || !batherId) {
        return null;
      }

      const amountInCents = getSunShadeRentalRewardInCents(durationSeconds);

      if (amountInCents <= 0) {
        return null;
      }

      revenueSequence += 1;
      const event = Object.freeze({
        sequence: revenueSequence,
        buildingType,
        batherId: String(batherId),
        durationSeconds: Math.max(0, Number(durationSeconds) || 0),
        amountInCents
      });
      notifyRevenue(event);
      return event;
    },
    subscribeToRevenue(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer de receita de building precisa ser uma funcao.");
      }

      revenueObservers.add(observer);
      let subscribed = true;

      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        revenueObservers.delete(observer);
      };
    },
    closeDay({ availableMoneyInCents = 0 } = {}) {
      const initialAvailable = Math.max(
        0,
        Math.floor(Number(availableMoneyInCents) || 0)
      );
      const publicServiceCount = PUBLIC_SERVICE_SUPPORT_DEFINITIONS
        .filter(({ buildingType }) => ownedTypes.has(buildingType))
        .length;
      const firstGrant = publicServiceCount > 0 && !publicSupportGrantClaimed ?
        FIRST_PUBLIC_SUPPORT_GRANT_IN_CENTS : 0;
      const recurringSupport = PUBLIC_SERVICE_SUPPORT_DEFINITIONS
        .filter(({ buildingType }) => ownedTypes.has(buildingType))
        .reduce((total, { amountInCents }) => total + amountInCents, 0);
      const publicSupportInCents = firstGrant > 0 ? firstGrant : recurringSupport;

      if (firstGrant > 0) {
        publicSupportGrantClaimed = true;
      }

      let available = initialAvailable + publicSupportInCents;
      const charges = [];

      if (ownedTypes.has(BUILDING_TYPES.TOILET_BUILDING)) {
        const paid = available >= TOILET_MAINTENANCE_COST_IN_CENTS;

        if (paid) {
          available -= TOILET_MAINTENANCE_COST_IN_CENTS;
          toiletCleanliness = 100;
        } else {
          toiletCleanliness = 0;
        }
        charges.push(Object.freeze({
          type: BUILDING_TYPES.TOILET_BUILDING,
          amountInCents: TOILET_MAINTENANCE_COST_IN_CENTS,
          paid
        }));
      }

      if (ownedTypes.has(BUILDING_TYPES.LIFEGUARD_BUILDING)) {
        lifeguardPaid = available >= LIFEGUARD_SALARY_IN_CENTS;
        if (lifeguardPaid) {
          available -= LIFEGUARD_SALARY_IN_CENTS;
        }
        charges.push(Object.freeze({
          type: BUILDING_TYPES.LIFEGUARD_BUILDING,
          amountInCents: LIFEGUARD_SALARY_IN_CENTS,
          paid: lifeguardPaid
        }));
      }

      return Object.freeze({
        charges: Object.freeze(charges),
        publicSupportInCents,
        totalPaidInCents: initialAvailable + publicSupportInCents - available,
        services: getSnapshot()
      });
    }
  });
}
