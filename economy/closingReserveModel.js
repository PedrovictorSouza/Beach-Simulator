function normalizeCents(value) {
  return Math.max(0, Math.trunc(Number(value) || 0));
}

export function createClosingReservePlan({
  servicePlan = {},
  cleanupPlan = {},
  availableMoneyInCents = 0
} = {}) {
  const serviceCostsInCents = normalizeCents(
    servicePlan.grossServiceCostsInCents
  );
  const cleanupCostsInCents = normalizeCents(
    cleanupPlan.cleanupCostInCents
  );
  const publicSupportInCents = normalizeCents(
    servicePlan.publicSupportInCents
  );
  const available = normalizeCents(availableMoneyInCents);
  const grossServiceCostsInCents = serviceCostsInCents + cleanupCostsInCents;
  const amountToReserveInCents = Math.max(
    0,
    grossServiceCostsInCents - publicSupportInCents
  );

  return Object.freeze({
    serviceCostsInCents,
    cleanupCostsInCents,
    grossServiceCostsInCents,
    publicSupportInCents,
    amountToReserveInCents,
    freeToInvestInCents: Math.max(0, available - amountToReserveInCents),
    reserveShortfallInCents: Math.max(0, amountToReserveInCents - available)
  });
}
