import { BUILDING_TYPES } from "./buildingServicesModel.js";

export const BUILDING_SYNERGY_IDS = Object.freeze({
  DRINKS_AND_BINS: "drinksAndBins",
  SHADE_AND_DRINKS: "shadeAndDrinks",
  SAFE_VOLLEYBALL: "safeVolleyball",
  MAINTAINED_TOILET: "maintainedToilet"
});

export function getActiveBuildingSynergies({
  services = {},
  sunShadeCount = 0
} = {}) {
  const owned = new Set(Array.isArray(services.owned) ? services.owned : []);
  const active = [];

  if (
    owned.has(BUILDING_TYPES.BEVERAGE_STORE) &&
    owned.has(BUILDING_TYPES.TRASH_CANS)
  ) {
    active.push(BUILDING_SYNERGY_IDS.DRINKS_AND_BINS);
  }
  if (
    owned.has(BUILDING_TYPES.BEVERAGE_STORE) &&
    Math.max(0, Math.trunc(Number(sunShadeCount) || 0)) > 0
  ) {
    active.push(BUILDING_SYNERGY_IDS.SHADE_AND_DRINKS);
  }
  if (
    owned.has(BUILDING_TYPES.VOLLEYBALL_COURT) &&
    services.lifeguardOperational
  ) {
    active.push(BUILDING_SYNERGY_IDS.SAFE_VOLLEYBALL);
  }
  if (
    owned.has(BUILDING_TYPES.TOILET_BUILDING) &&
    services.toiletOperational
  ) {
    active.push(BUILDING_SYNERGY_IDS.MAINTAINED_TOILET);
  }

  return Object.freeze(active);
}
