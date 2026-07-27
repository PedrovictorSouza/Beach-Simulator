export const BATHER_TOLERANCE_LIMITS = Object.freeze({
  min: 2,
  max: 5
});

function normalizeIssue(issue) {
  const source = String(issue?.source || "").trim();
  const amount = Math.max(1, Math.floor(Number(issue?.amount) || 1));

  if (!source) {
    throw new Error("Problema de tolerancia precisa de uma fonte.");
  }

  return { source, amount };
}

function clampLimit(value) {
  return Math.min(
    BATHER_TOLERANCE_LIMITS.max,
    Math.max(BATHER_TOLERANCE_LIMITS.min, Math.floor(Number(value) || 0))
  );
}

export function createBatherToleranceModel({ random = Math.random } = {}) {
  if (typeof random !== "function") {
    throw new Error("BatherToleranceModel precisa de uma funcao random.");
  }

  return Object.freeze({
    createState() {
      const range = BATHER_TOLERANCE_LIMITS.max - BATHER_TOLERANCE_LIMITS.min + 1;
      const toleranceLimit = BATHER_TOLERANCE_LIMITS.min + Math.floor(
        Math.min(0.999999, Math.max(0, Number(random()) || 0)) * range
      );

      return Object.freeze({
        toleranceLimit,
        toleranceUsed: 0,
        issues: Object.freeze([])
      });
    },
    occupy(state, issue) {
      const normalizedIssue = normalizeIssue(issue);
      const toleranceLimit = clampLimit(state?.toleranceLimit);
      const toleranceUsed = Math.min(
        toleranceLimit,
        Math.max(0, Math.floor(Number(state?.toleranceUsed) || 0)) + normalizedIssue.amount
      );
      const issues = [
        ...(Array.isArray(state?.issues) ? state.issues : []),
        Object.freeze(normalizedIssue)
      ];

      return Object.freeze({
        toleranceLimit,
        toleranceUsed,
        issues: Object.freeze(issues)
      });
    },
    hasIssue(state, source) {
      const normalizedSource = String(source || "").trim();

      return Array.isArray(state?.issues) && state.issues.some((issue) => (
        issue.source === normalizedSource
      ));
    },
    isExhausted(state) {
      return Math.max(0, Number(state?.toleranceUsed) || 0) >=
        clampLimit(state?.toleranceLimit);
    }
  });
}
