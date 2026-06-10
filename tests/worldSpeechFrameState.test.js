import { describe, expect, it, vi } from "vitest";

import { resolveWorldSpeechFrameState } from "../app/runtime/presentation/worldSpeechFrameState.js";

function createStoryState(flags = {}) {
  return {
    flags: {
      tangrowthLogChairRequestAvailable: false,
      logChairReceived: false,
      pokemonCenterGuideStarted: false,
      ruinedPokemonCenterInspected: false,
      tangrowthHouseTalkAvailable: false,
      tangrowthHouseTalkComplete: false,
      charmanderCelebrationSuggested: false,
      charmanderCelebrationComplete: false,
      bulbasaurRevealed: false,
      bulbasaurDryGrassMissionAccepted: false,
      bulbasaurDryGrassMissionComplete: false,
      restoredGrassCount: 0,
      bulbasaurDryGrassRequestTurnedIn: false,
      bulbasaurWorkbenchGuideAvailable: false,
      workbenchDiyRecipesReceived: false,
      charmanderRevealed: false,
      charmanderCampfireLit: false,
      bulbasaurStrawBedChallengeComplete: false,
      strawBedRecipeUnlocked: false,
      strawBedPlacedInBulbasaurHabitat: false,
      bulbasaurStrawBedRequestComplete: false,
      charmanderCelebrationRequestAvailable: false,
      ...flags
    }
  };
}

describe("world speech frame state", () => {
  it("keeps current speech priority when multiple candidates are visible", () => {
    const frameState = resolveWorldSpeechFrameState({
      canShowWorldSpaceUi: true,
      activeQuest: { id: "meetTangrowth" },
      tangrowthPosition: [1, 0, 2],
      storyState: createStoryState({
        bulbasaurRevealed: true
      }),
      session: {
        bulbasaurEncounter: {
          visible: true,
          position: [3, 0, 4]
        }
      }
    });

    expect(frameState).toEqual(expect.objectContaining({
      shouldShowTangrowthSpeech: true,
      shouldShowBulbasaurMissionSpeech: false
    }));
  });

  it("shows the Chopper repair-box speech only while the player is away from the target", () => {
    const isPlayerNearWorldPosition = vi.fn(() => false);

    expect(resolveWorldSpeechFrameState({
      canShowWorldSpaceUi: true,
      tangrowthPosition: [1, 0, 2],
      storyState: createStoryState(),
      session: {
        playerCharacter: {},
        bulbasaurEncounter: null,
        charmanderEncounter: null
      },
      chopperBulbasaurRepairBoxInvestigationTarget: {
        lookAtPosition: [5, 0, 6]
      },
      repairBoxPromptDistance: 2,
      isPlayerNearWorldPosition
    })).toEqual(expect.objectContaining({
      shouldShowChopperBulbasaurRepairBoxSpeech: true
    }));
    expect(isPlayerNearWorldPosition).toHaveBeenCalledWith([5, 0, 6], 2);

    expect(resolveWorldSpeechFrameState({
      canShowWorldSpaceUi: true,
      tangrowthPosition: [1, 0, 2],
      storyState: createStoryState(),
      session: {
        playerCharacter: {},
        bulbasaurEncounter: null,
        charmanderEncounter: null
      },
      chopperBulbasaurRepairBoxInvestigationTarget: {
        lookAtPosition: [5, 0, 6]
      },
      repairBoxPromptDistance: 2,
      isPlayerNearWorldPosition: () => true
    })).toEqual(expect.objectContaining({
      shouldShowChopperBulbasaurRepairBoxSpeech: false
    }));
  });

  it("resolves Bulbasaur request-ready and Charmander follow speech gates", () => {
    expect(resolveWorldSpeechFrameState({
      canShowWorldSpaceUi: true,
      storyState: createStoryState({
        bulbasaurRevealed: true,
        bulbasaurDryGrassMissionAccepted: true,
        restoredGrassCount: 10
      }),
      session: {
        bulbasaurEncounter: {
          visible: true,
          position: [3, 0, 4]
        }
      },
      restoredGrassMissionTargetCount: 10
    })).toEqual(expect.objectContaining({
      shouldShowBulbasaurRequestReadySpeech: true
    }));

    expect(resolveWorldSpeechFrameState({
      canShowWorldSpaceUi: true,
      storyState: createStoryState({
        charmanderRevealed: true,
        charmanderCampfireLit: false,
        bulbasaurStrawBedChallengeComplete: true,
        strawBedRecipeUnlocked: false
      }),
      session: {
        bulbasaurEncounter: {
          visible: true,
          position: [3, 0, 4]
        },
        charmanderEncounter: {
          visible: true,
          position: [5, 0, 6]
        }
      }
    })).toEqual(expect.objectContaining({
      shouldShowBulbasaurStrawBedSpeech: true,
      shouldShowCharmanderFollowSpeech: false
    }));
  });
});
