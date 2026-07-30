function getFeedback(translator, group, source) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("BatherNeedPresenter precisa de um translator.");
  }

  const key = source && translator.t(`feedback.${group}.${source}`) !==
    `feedback.${group}.${source}` ? source : "fallback";

  return translator.t(`feedback.${group}.${key}`);
}

export function presentBatherNeedFeedback(source, translator) {
  return getFeedback(translator, "batherNeeds", source);
}

export function presentBeachProblemFeedback(source, translator) {
  return getFeedback(translator, "beachProblems", source);
}
