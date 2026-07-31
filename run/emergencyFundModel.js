export const EMERGENCY_FUND_STATES = Object.freeze({
  DORMANT: "dormant",
  ACTIVE: "active",
  CLAIMED: "claimed"
});

function normalizeMoney(value) {
  return Math.max(0, Math.trunc(Number(value) || 0));
}

function createSnapshot({
  state,
  totalPayoutInCents,
  remainingPayoutInCents,
  claimedPayoutInCents
}) {
  return Object.freeze({
    state,
    active: state === EMERGENCY_FUND_STATES.ACTIVE,
    used: state !== EMERGENCY_FUND_STATES.DORMANT,
    totalPayoutInCents,
    remainingPayoutInCents,
    claimedPayoutInCents
  });
}

export function calculateEmergencyFundOffer({
  day,
  totalDays,
  availableMoneyInCents = 0,
  hasReachableIncome = true,
  minimumConstructionCostInCents = 500,
  maximumPayoutInCents = 700
} = {}) {
  const normalizedDay = Math.max(1, Math.trunc(Number(day) || 1));
  const normalizedTotalDays = Math.max(
    normalizedDay,
    Math.trunc(Number(totalDays) || normalizedDay)
  );
  const availableMoney = normalizeMoney(availableMoneyInCents);
  const minimumConstructionCost = normalizeMoney(
    minimumConstructionCostInCents
  );
  const maximumPayout = normalizeMoney(maximumPayoutInCents);
  const constructionGap = Math.max(
    0,
    minimumConstructionCost - availableMoney
  );
  const eligible = (
    normalizedDay >= 2 &&
    normalizedDay < normalizedTotalDays &&
    hasReachableIncome === false &&
    constructionGap > 0 &&
    maximumPayout > 0
  );

  return Object.freeze({
    eligible,
    constructionGapInCents: constructionGap,
    totalPayoutInCents: eligible ?
      Math.min(constructionGap, maximumPayout) :
      0
  });
}

export function createEmergencyFundModel({
  payoutPerClickInCents = 100,
  minimumConstructionCostInCents = 500,
  maximumPayoutInCents = 700
} = {}) {
  const normalizedPayoutPerClick = Math.max(
    1,
    normalizeMoney(payoutPerClickInCents)
  );
  const normalizedMinimumConstructionCost = normalizeMoney(
    minimumConstructionCostInCents
  );
  const normalizedMaximumPayout = Math.max(
    normalizedPayoutPerClick,
    normalizeMoney(maximumPayoutInCents)
  );
  let state = EMERGENCY_FUND_STATES.DORMANT;
  let totalPayoutInCents = 0;
  let remainingPayoutInCents = 0;
  let claimedPayoutInCents = 0;

  const getSnapshot = () => createSnapshot({
    state,
    totalPayoutInCents,
    remainingPayoutInCents,
    claimedPayoutInCents
  });

  return Object.freeze({
    getSnapshot,
    offer(input = {}) {
      if (state !== EMERGENCY_FUND_STATES.DORMANT) {
        return Object.freeze({
          offered: false,
          plan: null,
          snapshot: getSnapshot()
        });
      }

      const plan = calculateEmergencyFundOffer({
        ...input,
        minimumConstructionCostInCents: normalizedMinimumConstructionCost,
        maximumPayoutInCents: normalizedMaximumPayout
      });

      if (!plan.eligible) {
        return Object.freeze({
          offered: false,
          plan,
          snapshot: getSnapshot()
        });
      }

      totalPayoutInCents = plan.totalPayoutInCents;
      remainingPayoutInCents = totalPayoutInCents;
      state = EMERGENCY_FUND_STATES.ACTIVE;

      return Object.freeze({
        offered: true,
        plan,
        snapshot: getSnapshot()
      });
    },
    claimClick() {
      if (state !== EMERGENCY_FUND_STATES.ACTIVE) {
        return Object.freeze({
          amountInCents: 0,
          snapshot: getSnapshot()
        });
      }

      const amountInCents = Math.min(
        normalizedPayoutPerClick,
        remainingPayoutInCents
      );

      remainingPayoutInCents -= amountInCents;
      claimedPayoutInCents += amountInCents;

      if (remainingPayoutInCents <= 0) {
        state = EMERGENCY_FUND_STATES.CLAIMED;
      }

      return Object.freeze({
        amountInCents,
        snapshot: getSnapshot()
      });
    }
  });
}
