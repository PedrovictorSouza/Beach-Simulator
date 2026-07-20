export const BUILDING_TYPES = Object.freeze({
  BEVERAGE_STORE: "beverage-store",
  LIFEGUARD_BUILDING: "lifeguard-building",
  WIFI_SPOT: "wifi-spot",
  TOILET_BUILDING: "toilet-building",
  TRASH_CANS: "trash-cans"
});

const BUILDING_TYPE_SET = new Set(Object.values(BUILDING_TYPES));
const TOILET_DIRT_PER_BATHER_SECOND = 0.04;
const TOILET_MAINTENANCE_COST_IN_CENTS = 300;
const LIFEGUARD_SALARY_IN_CENTS = 400;

function createSnapshot({ ownedTypes, toiletCleanliness, lifeguardPaid }) {
  const owned = Object.freeze([...ownedTypes]);
  const hasToiletBuilding = ownedTypes.has(BUILDING_TYPES.TOILET_BUILDING);
  const hasLifeguardBuilding = ownedTypes.has(BUILDING_TYPES.LIFEGUARD_BUILDING);

  return Object.freeze({
    owned,
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
  let toiletCleanliness = 100;
  let lifeguardPaid = true;
  const getSnapshot = () => createSnapshot({
    ownedTypes,
    toiletCleanliness,
    lifeguardPaid
  });

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
    update(deltaSeconds, { batherCount = 0 } = {}) {
      const stepSeconds = Math.max(0, Number(deltaSeconds) || 0);
      const normalizedBatherCount = Math.max(0, Math.floor(Number(batherCount) || 0));

      if (ownedTypes.has(BUILDING_TYPES.TOILET_BUILDING)) {
        toiletCleanliness = Math.max(
          0,
          toiletCleanliness - normalizedBatherCount *
            TOILET_DIRT_PER_BATHER_SECOND * stepSeconds
        );
      }

      return getSnapshot();
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
