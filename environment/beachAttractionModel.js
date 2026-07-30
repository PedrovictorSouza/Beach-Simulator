export const BEACH_ATTRACTION_BALANCE = Object.freeze({
  sunShadeBonusPerUnit: 0.08,
  maximumSunShadeBonus: 0.32,
  minimumMultiplier: 0.55,
  maximumMultiplier: 1.32
});

export function calculateBeachAttraction({
  sunShadeCount = 0,
  conditionPenalty = 0
} = {}) {
  const normalizedSunShadeCount = Math.max(
    0,
    Math.trunc(Number(sunShadeCount) || 0)
  );
  const normalizedConditionPenalty = Math.min(
    1,
    Math.max(0, Number(conditionPenalty) || 0)
  );
  const sunShadeBonus = Math.min(
    BEACH_ATTRACTION_BALANCE.maximumSunShadeBonus,
    normalizedSunShadeCount *
      BEACH_ATTRACTION_BALANCE.sunShadeBonusPerUnit
  );
  const rawMultiplier = 1 + sunShadeBonus - normalizedConditionPenalty;
  const multiplier = Math.min(
    BEACH_ATTRACTION_BALANCE.maximumMultiplier,
    Math.max(BEACH_ATTRACTION_BALANCE.minimumMultiplier, rawMultiplier)
  );

  return Object.freeze({
    sunShadeBonus,
    conditionPenalty: normalizedConditionPenalty,
    multiplier
  });
}
