const WORLD_SPEECH_VISIBILITY_KEYS = Object.freeze([
  "shouldShowTangrowthSpeech",
  "shouldShowTangrowthLogChairSpeech",
  "shouldShowTangrowthCampfireSpeech",
  "shouldShowTangrowthPokemonCenterSpeech",
  "shouldShowTangrowthHouseSpeech",
  "shouldShowTangrowthCelebrationSpeech",
  "shouldShowChopperBulbasaurRepairBoxSpeech",
  "shouldShowBulbasaurMissionSpeech",
  "shouldShowBulbasaurWorkbenchGuideSpeech",
  "shouldShowBulbasaurRequestReadySpeech",
  "shouldShowCharmanderFollowSpeech",
  "shouldShowBulbasaurStrawBedSpeech",
  "shouldShowBulbasaurStrawBedCompleteSpeech",
  "shouldShowCharmanderCelebrationSpeech"
]);

function readWorldSpeechCandidate(candidates, key) {
  const candidate = candidates?.[key];
  return typeof candidate === "function" ? candidate() : candidate;
}

export function resolveWorldSpeechVisibility(candidates = {}) {
  const visibility = Object.fromEntries(
    WORLD_SPEECH_VISIBILITY_KEYS.map((key) => [key, false])
  );

  for (const key of WORLD_SPEECH_VISIBILITY_KEYS) {
    if (readWorldSpeechCandidate(candidates, key)) {
      visibility[key] = true;
      break;
    }
  }

  return visibility;
}
