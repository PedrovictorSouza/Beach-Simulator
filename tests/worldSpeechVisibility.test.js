import { describe, expect, it, vi } from "vitest";

import { resolveWorldSpeechVisibility } from "../app/runtime/presentation/worldSpeechVisibility.js";

describe("world speech visibility", () => {
  it("shows only the first visible world speech candidate by current priority", () => {
    expect(resolveWorldSpeechVisibility({
      shouldShowTangrowthSpeech: false,
      shouldShowTangrowthLogChairSpeech: true,
      shouldShowTangrowthPokemonCenterSpeech: true,
      shouldShowBulbasaurMissionSpeech: true
    })).toEqual(expect.objectContaining({
      shouldShowTangrowthSpeech: false,
      shouldShowTangrowthLogChairSpeech: true,
      shouldShowTangrowthPokemonCenterSpeech: false,
      shouldShowBulbasaurMissionSpeech: false
    }));
  });

  it("keeps all world speech flags false when no candidate is visible", () => {
    expect(resolveWorldSpeechVisibility()).toEqual({
      shouldShowTangrowthSpeech: false,
      shouldShowTangrowthLogChairSpeech: false,
      shouldShowTangrowthCampfireSpeech: false,
      shouldShowTangrowthPokemonCenterSpeech: false,
      shouldShowTangrowthHouseSpeech: false,
      shouldShowTangrowthCelebrationSpeech: false,
      shouldShowChopperBulbasaurRepairBoxSpeech: false,
      shouldShowBulbasaurMissionSpeech: false,
      shouldShowBulbasaurWorkbenchGuideSpeech: false,
      shouldShowBulbasaurRequestReadySpeech: false,
      shouldShowCharmanderFollowSpeech: false,
      shouldShowBulbasaurStrawBedSpeech: false,
      shouldShowBulbasaurStrawBedCompleteSpeech: false,
      shouldShowCharmanderCelebrationSpeech: false
    });
  });

  it("evaluates lower-priority candidates lazily after an earlier speech wins", () => {
    const lowerPriorityCandidate = vi.fn(() => true);

    expect(resolveWorldSpeechVisibility({
      shouldShowTangrowthSpeech: true,
      shouldShowChopperBulbasaurRepairBoxSpeech: lowerPriorityCandidate
    })).toEqual(expect.objectContaining({
      shouldShowTangrowthSpeech: true,
      shouldShowChopperBulbasaurRepairBoxSpeech: false
    }));
    expect(lowerPriorityCandidate).not.toHaveBeenCalled();
  });
});
