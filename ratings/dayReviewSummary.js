export function summarizeReviewProblems(reviews = [], { limit = Infinity } = {}) {
  const problemCounts = new Map();

  for (const review of Array.isArray(reviews) ? reviews : []) {
    for (const issue of review?.toleranceIssues || []) {
      const source = String(issue?.source || "").trim();

      if (!source) {
        continue;
      }

      problemCounts.set(
        source,
        (problemCounts.get(source) || 0) +
          Math.max(1, Math.floor(Number(issue?.amount) || 1))
      );
    }
  }

  const normalizedLimit = Number.isFinite(Number(limit)) ?
    Math.max(0, Math.trunc(Number(limit))) :
    Infinity;

  return Object.freeze([...problemCounts.entries()]
    .sort((left, right) => right[1] - left[1] ||
      left[0].localeCompare(right[0]))
    .slice(0, normalizedLimit)
    .map(([source, count]) => Object.freeze({ source, count })));
}

export function findMainReviewProblem(reviews = []) {
  return summarizeReviewProblems(reviews, { limit: 1 })[0]?.source || "";
}
