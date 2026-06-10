import { resolveWorldSpeechVisibility } from "./worldSpeechVisibility.js";

function hasEncounterPosition(encounter) {
  return Boolean(encounter?.visible) && Boolean(encounter?.position);
}

export function resolveWorldSpeechFrameState({
  canShowWorldSpaceUi = false,
  activeQuest = null,
  tangrowthPosition = null,
  storyState = {},
  session = {},
  chopperBulbasaurRepairBoxInvestigationTarget = null,
  repairBoxPromptDistance = Infinity,
  isPlayerNearWorldPosition = () => false,
  openingLeppaTreeRequestActive = false,
  firstTaughtActionFreedomWindowActive = false,
  restoredGrassMissionTargetCount = 0
} = {}) {
  const flags = storyState?.flags || {};
  const bulbasaurVisible = hasEncounterPosition(session.bulbasaurEncounter);
  const charmanderVisible = hasEncounterPosition(session.charmanderEncounter);

  return resolveWorldSpeechVisibility({
    shouldShowTangrowthSpeech: () =>
      canShowWorldSpaceUi &&
      activeQuest?.id === "meetTangrowth" &&
      tangrowthPosition,
    shouldShowTangrowthLogChairSpeech: () =>
      canShowWorldSpaceUi &&
      flags.tangrowthLogChairRequestAvailable &&
      !flags.logChairReceived &&
      tangrowthPosition,
    shouldShowTangrowthCampfireSpeech: false,
    shouldShowTangrowthPokemonCenterSpeech: () =>
      canShowWorldSpaceUi &&
      flags.pokemonCenterGuideStarted &&
      !flags.ruinedPokemonCenterInspected &&
      tangrowthPosition,
    shouldShowTangrowthHouseSpeech: () =>
      canShowWorldSpaceUi &&
      flags.tangrowthHouseTalkAvailable &&
      !flags.tangrowthHouseTalkComplete &&
      tangrowthPosition,
    shouldShowTangrowthCelebrationSpeech: () =>
      canShowWorldSpaceUi &&
      flags.charmanderCelebrationSuggested &&
      !flags.charmanderCelebrationComplete &&
      tangrowthPosition,
    shouldShowChopperBulbasaurRepairBoxSpeech: () =>
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      chopperBulbasaurRepairBoxInvestigationTarget &&
      tangrowthPosition &&
      !isPlayerNearWorldPosition(
        chopperBulbasaurRepairBoxInvestigationTarget.lookAtPosition,
        repairBoxPromptDistance
      ),
    shouldShowBulbasaurMissionSpeech: () =>
      canShowWorldSpaceUi &&
      bulbasaurVisible &&
      flags.bulbasaurRevealed &&
      !openingLeppaTreeRequestActive &&
      !flags.bulbasaurDryGrassMissionAccepted,
    shouldShowBulbasaurWorkbenchGuideSpeech: () =>
      canShowWorldSpaceUi &&
      bulbasaurVisible &&
      flags.bulbasaurWorkbenchGuideAvailable &&
      !flags.workbenchDiyRecipesReceived,
    shouldShowBulbasaurRequestReadySpeech: () =>
      canShowWorldSpaceUi &&
      bulbasaurVisible &&
      flags.bulbasaurRevealed &&
      flags.bulbasaurDryGrassMissionAccepted &&
      !flags.bulbasaurDryGrassRequestTurnedIn &&
      !firstTaughtActionFreedomWindowActive &&
      (
        flags.bulbasaurDryGrassMissionComplete ||
        (flags.restoredGrassCount || 0) >= restoredGrassMissionTargetCount
      ),
    shouldShowCharmanderFollowSpeech: () =>
      !(
        bulbasaurVisible &&
        (
          (
            flags.bulbasaurStrawBedChallengeComplete &&
            !flags.strawBedRecipeUnlocked
          ) ||
          (
            flags.strawBedPlacedInBulbasaurHabitat &&
            !flags.bulbasaurStrawBedRequestComplete
          )
        )
      ) &&
      canShowWorldSpaceUi &&
      charmanderVisible &&
      flags.charmanderRevealed &&
      !flags.charmanderCampfireLit,
    shouldShowBulbasaurStrawBedSpeech: () =>
      canShowWorldSpaceUi &&
      bulbasaurVisible &&
      flags.bulbasaurStrawBedChallengeComplete &&
      !flags.strawBedRecipeUnlocked,
    shouldShowBulbasaurStrawBedCompleteSpeech: () =>
      canShowWorldSpaceUi &&
      bulbasaurVisible &&
      flags.strawBedPlacedInBulbasaurHabitat &&
      !flags.bulbasaurStrawBedRequestComplete,
    shouldShowCharmanderCelebrationSpeech: () =>
      canShowWorldSpaceUi &&
      charmanderVisible &&
      flags.charmanderCelebrationRequestAvailable &&
      !flags.charmanderCelebrationSuggested &&
      !flags.charmanderCelebrationComplete
  });
}
