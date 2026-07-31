export const BEACH_ECONOMY_BALANCE = Object.freeze({
  cleanupCollectionRewardInCents: 100,
  buildingAccessCostInCents: 500,
  sunShadePurchaseCostInCents: 500,
  batherLostMoney: Object.freeze({
    chance: 0.01,
    amountInCents: 100
  }),
  reviewBonusInCents: 100,
  beveragePurchasePriceInCents: 100,
  beverageServiceRevenue: Object.freeze({
    intervalSeconds: 5,
    amountInCents: 100
  }),
  wifiServiceRevenue: Object.freeze({
    intervalSeconds: 7,
    amountInCents: 100
  }),
  lifeguardServiceRevenue: Object.freeze({
    intervalSeconds: 3,
    amountInCents: 100
  }),
  toiletServiceRevenue: Object.freeze({
    intervalSeconds: 4,
    amountInCents: 100
  }),
  volleyballServiceRevenue: Object.freeze({
    intervalSeconds: 8,
    amountInCents: 100
  }),
  sunShadeRentalRewardTiers: Object.freeze([
    Object.freeze({ durationSeconds: 5, amountInCents: 100 }),
    Object.freeze({ durationSeconds: 10, amountInCents: 300 }),
    Object.freeze({ durationSeconds: 15, amountInCents: 500 })
  ])
});
