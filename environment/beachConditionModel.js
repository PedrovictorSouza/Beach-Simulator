export const BEACH_CONDITION_BANDS = Object.freeze({
  CLEAN: "clean",
  ATTENTION: "attention",
  DIRTY: "dirty",
  CRITICAL: "critical"
});

export const CLEANUP_POLICIES = Object.freeze({
  FINAL: "final",
  PAY: "pay",
  SAVE: "save"
});

export const BEACH_CONDITION_BALANCE = Object.freeze({
  attentionStartsAt: 1,
  dirtyStartsAt: 4,
  criticalStartsAt: 8,
  cleanupBaseCostInCents: 200,
  cleanupCostPerLitterInCents: 100,
  cleanupMaximumCostInCents: 500,
  paidDebtFraction: 0.25,
  paidDebtMaximum: 2,
  savedDebtFraction: 0.75,
  savedDebtMaximum: 5,
  maximumAttractionPenalty: 0.45
});

function normalizeCount(value) {
  return Math.max(0, Math.trunc(Number(value) || 0));
}

function getConditionBand(visibleLitterCount) {
  if (visibleLitterCount >= BEACH_CONDITION_BALANCE.criticalStartsAt) {
    return BEACH_CONDITION_BANDS.CRITICAL;
  }
  if (visibleLitterCount >= BEACH_CONDITION_BALANCE.dirtyStartsAt) {
    return BEACH_CONDITION_BANDS.DIRTY;
  }
  if (visibleLitterCount >= BEACH_CONDITION_BALANCE.attentionStartsAt) {
    return BEACH_CONDITION_BANDS.ATTENTION;
  }
  return BEACH_CONDITION_BANDS.CLEAN;
}

function getAttractionPenalty(conditionBand) {
  const penaltyByBand = {
    [BEACH_CONDITION_BANDS.CLEAN]: 0,
    [BEACH_CONDITION_BANDS.ATTENTION]: 0.08,
    [BEACH_CONDITION_BANDS.DIRTY]: 0.24,
    [BEACH_CONDITION_BANDS.CRITICAL]:
      BEACH_CONDITION_BALANCE.maximumAttractionPenalty
  };

  return penaltyByBand[conditionBand] || 0;
}

function calculateDebt(visibleLitterCount, policy) {
  const paying = policy === CLEANUP_POLICIES.PAY;
  const fraction = paying ?
    BEACH_CONDITION_BALANCE.paidDebtFraction :
    BEACH_CONDITION_BALANCE.savedDebtFraction;
  const maximum = paying ?
    BEACH_CONDITION_BALANCE.paidDebtMaximum :
    BEACH_CONDITION_BALANCE.savedDebtMaximum;

  return Math.min(maximum, Math.ceil(visibleLitterCount * fraction));
}

function calculateCleanupCost(visibleLitterCount) {
  if (visibleLitterCount <= 0) {
    return 0;
  }

  return Math.min(
    BEACH_CONDITION_BALANCE.cleanupMaximumCostInCents,
    BEACH_CONDITION_BALANCE.cleanupBaseCostInCents +
      visibleLitterCount *
        BEACH_CONDITION_BALANCE.cleanupCostPerLitterInCents
  );
}

function freezeClosingPlan(plan) {
  return Object.freeze({ ...plan });
}

function createSnapshot({
  day,
  visibleLitterCount,
  producedCount,
  capturedCount,
  collectedCount,
  inheritedDebtCount,
  nextDayDebtCount,
  cleanupPolicy
}) {
  const conditionBand = getConditionBand(visibleLitterCount);

  return Object.freeze({
    day,
    visibleLitterCount,
    producedCount,
    capturedCount,
    collectedCount,
    inheritedDebtCount,
    nextDayDebtCount,
    cleanupPolicy,
    conditionBand,
    attractionPenalty: getAttractionPenalty(conditionBand)
  });
}

export function createBeachConditionModel({
  initialDay = 1,
  initialVisibleLitterCount = 0
} = {}) {
  let day = Math.max(1, Math.trunc(Number(initialDay) || 1));
  let visibleLitterCount = normalizeCount(initialVisibleLitterCount);
  let producedCount = 0;
  let capturedCount = 0;
  let collectedCount = 0;
  let inheritedDebtCount = 0;
  let nextDayDebtCount = 0;
  let cleanupPolicy = null;
  const producedEventIds = new Set();
  const collectedObjectIds = new Set();

  const getSnapshot = () => createSnapshot({
    day,
    visibleLitterCount,
    producedCount,
    capturedCount,
    collectedCount,
    inheritedDebtCount,
    nextDayDebtCount,
    cleanupPolicy
  });

  return Object.freeze({
    getSnapshot,
    recordExistingLitter({ objectId } = {}) {
      const normalizedObjectId = String(objectId || "").trim();

      if (!normalizedObjectId || producedEventIds.has(`existing:${normalizedObjectId}`)) {
        return false;
      }

      producedEventIds.add(`existing:${normalizedObjectId}`);
      visibleLitterCount += 1;
      return true;
    },
    recordProducedLitter({ eventId, captured = false } = {}) {
      const normalizedEventId = String(eventId || "").trim();

      if (!normalizedEventId || producedEventIds.has(normalizedEventId)) {
        return false;
      }

      producedEventIds.add(normalizedEventId);
      producedCount += 1;

      if (captured) {
        capturedCount += 1;
      } else {
        visibleLitterCount += 1;
      }

      return true;
    },
    recordCollectedLitter({ objectId } = {}) {
      const normalizedObjectId = String(objectId || "").trim();

      if (
        !normalizedObjectId ||
        collectedObjectIds.has(normalizedObjectId) ||
        visibleLitterCount <= 0
      ) {
        return false;
      }

      collectedObjectIds.add(normalizedObjectId);
      visibleLitterCount -= 1;
      collectedCount += 1;
      return true;
    },
    previewClosing() {
      const cleanupCostInCents = calculateCleanupCost(visibleLitterCount);

      return freezeClosingPlan({
        visibleLitterCount,
        conditionBand: getConditionBand(visibleLitterCount),
        cleanupCostInCents,
        pay: Object.freeze({
          nextDayDebtCount: calculateDebt(
            visibleLitterCount,
            CLEANUP_POLICIES.PAY
          )
        }),
        save: Object.freeze({
          nextDayDebtCount: calculateDebt(
            visibleLitterCount,
            CLEANUP_POLICIES.SAVE
          )
        })
      });
    },
    closeDay({ policy, canPay = false, hasNextDay = true } = {}) {
      if (cleanupPolicy) {
        throw new Error("Condicao da praia ja foi fechada neste dia.");
      }

      if (!hasNextDay) {
        cleanupPolicy = CLEANUP_POLICIES.FINAL;
        nextDayDebtCount = 0;

        return Object.freeze({
          appliedPolicy: cleanupPolicy,
          chargedInCents: 0,
          nextDayDebtCount,
          snapshot: getSnapshot()
        });
      }

      const requestedPolicy = policy === CLEANUP_POLICIES.PAY ?
        CLEANUP_POLICIES.PAY :
        CLEANUP_POLICIES.SAVE;
      cleanupPolicy = requestedPolicy === CLEANUP_POLICIES.PAY && canPay ?
        CLEANUP_POLICIES.PAY :
        CLEANUP_POLICIES.SAVE;
      nextDayDebtCount = calculateDebt(visibleLitterCount, cleanupPolicy);

      return Object.freeze({
        appliedPolicy: cleanupPolicy,
        chargedInCents: cleanupPolicy === CLEANUP_POLICIES.PAY ?
          calculateCleanupCost(visibleLitterCount) :
          0,
        nextDayDebtCount,
        snapshot: getSnapshot()
      });
    },
    startNextDay() {
      if (!cleanupPolicy) {
        throw new Error("Condicao da praia precisa fechar antes do proximo dia.");
      }

      day += 1;
      inheritedDebtCount = nextDayDebtCount;
      visibleLitterCount = inheritedDebtCount;
      producedCount = 0;
      capturedCount = 0;
      collectedCount = 0;
      nextDayDebtCount = 0;
      cleanupPolicy = null;
      producedEventIds.clear();
      collectedObjectIds.clear();
      return getSnapshot();
    }
  });
}
