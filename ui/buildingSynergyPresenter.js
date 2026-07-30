export function presentBuildingSynergies(synergyIds, translator) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("BuildingSynergyPresenter precisa de translator.");
  }

  const ids = Array.isArray(synergyIds) ? synergyIds : [];

  if (ids.length === 0) {
    return "";
  }

  return [
    translator.t("buildingSynergies.title"),
    ...ids.map((id) => translator.t(`buildingSynergies.${id}`))
  ].join("\n");
}
