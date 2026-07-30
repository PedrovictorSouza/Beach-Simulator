import { BUILDING_TYPES } from "./buildingServicesModel.js";

export const BUILDING_UNLOCK_DAY_BY_TYPE = Object.freeze({
  [BUILDING_TYPES.BEVERAGE_STORE]: 1,
  [BUILDING_TYPES.TRASH_CANS]: 1,
  [BUILDING_TYPES.TOILET_BUILDING]: 1,
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: 2,
  [BUILDING_TYPES.VOLLEYBALL_COURT]: 3,
  [BUILDING_TYPES.WIFI_SPOT]: 4
});

const BUILDING_TYPE_SET = new Set(Object.values(BUILDING_TYPES));

function normalizeDay(day) {
  return Math.max(1, Math.trunc(Number(day) || 1));
}

export function getBuildingUnlockDay(type) {
  if (!BUILDING_TYPE_SET.has(type)) {
    throw new Error(`Tipo de construcao desconhecido: ${type}`);
  }

  return BUILDING_UNLOCK_DAY_BY_TYPE[type];
}

export function getUnlockedBuildingTypes(day) {
  const normalizedDay = normalizeDay(day);

  return Object.freeze(
    Object.values(BUILDING_TYPES).filter(
      (type) => getBuildingUnlockDay(type) <= normalizedDay
    )
  );
}

export function getLockedBuildingTypes(day) {
  const unlockedTypeSet = new Set(getUnlockedBuildingTypes(day));

  return Object.freeze(
    Object.values(BUILDING_TYPES).filter((type) => !unlockedTypeSet.has(type))
  );
}

export function getNewlyUnlockedBuildingTypes(day) {
  const normalizedDay = normalizeDay(day);

  return Object.freeze(
    Object.values(BUILDING_TYPES).filter(
      (type) => getBuildingUnlockDay(type) === normalizedDay
    )
  );
}
