export const BUILDING_TYPES = Object.freeze({
  BEVERAGE_STORE: "beverage-store",
  BEACH_HOUSE: "beach-house",
  LIFEGUARD_BUILDING: "lifeguard-building",
  WIFI_SPOT: "wifi-spot",
  TOILET_BUILDING: "toilet-building",
  TRASH_CANS: "trash-cans",
  VOLLEYBALL_COURT: "volleyball-court"
});

export const BUILDING_SERVICE_MOTIVES = Object.freeze({
  CLEANLINESS: "cleanliness",
  CONNECTIVITY: "connectivity",
  ENTERTAINMENT: "entertainment",
  REFRESHMENT: "refreshment",
  RELIEF: "relief",
  SAFETY: "safety"
});

const SERVICE_ADVERTISEMENT_DEFINITIONS = Object.freeze([
  Object.freeze({
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    motive: BUILDING_SERVICE_MOTIVES.REFRESHMENT,
    utility: 70
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.LIFEGUARD_BUILDING,
    motive: BUILDING_SERVICE_MOTIVES.SAFETY,
    utility: 65
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.WIFI_SPOT,
    motive: BUILDING_SERVICE_MOTIVES.CONNECTIVITY,
    utility: 55
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.TOILET_BUILDING,
    motive: BUILDING_SERVICE_MOTIVES.RELIEF,
    utility: 90
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.TRASH_CANS,
    motive: BUILDING_SERVICE_MOTIVES.CLEANLINESS,
    utility: 50
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.VOLLEYBALL_COURT,
    motive: BUILDING_SERVICE_MOTIVES.ENTERTAINMENT,
    utility: 75
  })
]);

const BUILDING_TYPE_SET = new Set(Object.values(BUILDING_TYPES));
const TOILET_DIRT_PER_BATHER_SECOND = 0.04;
const TOILET_MAINTENANCE_COST_IN_CENTS = 300;
const LIFEGUARD_SALARY_IN_CENTS = 400;
const SERVICE_REVENUE_DEFINITIONS = Object.freeze([
  Object.freeze({
    buildingType: BUILDING_TYPES.BEVERAGE_STORE,
    intervalSeconds: 30,
    amountInCents: 100
  }),
  Object.freeze({
    buildingType: BUILDING_TYPES.WIFI_SPOT,
    intervalSeconds: 30,
    amountInCents: 100
  })
]);

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
    update(deltaSeconds, { batherCount = 0, bathers = [] } = {}) {
      const stepSeconds = Math.max(0, Number(deltaSeconds) || 0);
      const activeBathers = Array.isArray(bathers) ? bathers : [];
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

        for (const bather of activeBathers) {
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
      let available = initialAvailable;
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
        totalPaidInCents: initialAvailable - available,
        services: getSnapshot()
      });
    }
  });
}
