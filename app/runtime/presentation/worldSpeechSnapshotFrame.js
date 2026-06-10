import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackWorldSpeech
} from "../../gameplay/colonyFeedbackContracts.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_WORLD_TERMS
} from "../../story/sandbotsLexicon.js";

const CHOPPER_BULBASAUR_REPAIR_BOX_SPEECH = "What is this?";

export function updateWorldSpeechSnapshotFrame(nextFrame, {
  now,
  activeQuest,
  activeMoveId,
  tangrowthPosition,
  bulbasaurPosition,
  charmanderPosition,
  tangrowthOpeningLine,
  charmanderFollowing = false,
  chopperAttentionCue,
  getCompanionLostHint = () => null,
  consumeChopperAttentionCueSoundCycle = () => false,
  playChopperVoice = () => {},
  shouldShowTangrowthSpeech,
  shouldShowTangrowthLogChairSpeech,
  shouldShowTangrowthPokemonCenterSpeech,
  shouldShowTangrowthHouseSpeech,
  shouldShowTangrowthCelebrationSpeech,
  shouldShowChopperBulbasaurRepairBoxSpeech,
  shouldShowBulbasaurMissionSpeech,
  shouldShowBulbasaurWorkbenchGuideSpeech,
  shouldShowBulbasaurRequestReadySpeech,
  shouldShowBulbasaurStrawBedSpeech,
  shouldShowBulbasaurStrawBedCompleteSpeech,
  shouldShowCharmanderFollowSpeech,
  shouldShowCharmanderCelebrationSpeech
}) {
  if (shouldShowTangrowthSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = tangrowthOpeningLine;
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowTangrowthLogChairSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "I saved a field plan for you.";
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowTangrowthPokemonCenterSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = `This way. The old ${SANDBOTS_WORLD_TERMS.terminal} is ahead.`;
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowTangrowthHouseSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "Human shelter plans are ready.";
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowTangrowthCelebrationSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = `Bring ${SANDBOTS_BOT_NAMES.thermal} here.`;
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowChopperBulbasaurRepairBoxSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = CHOPPER_BULBASAUR_REPAIR_BOX_SPEECH;
    nextFrame.worldSpeech.worldPosition = tangrowthPosition;
  }

  if (shouldShowBulbasaurMissionSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "Talk to me, Broky.";
    nextFrame.worldSpeech.worldPosition = bulbasaurPosition;
  }

  if (shouldShowBulbasaurWorkbenchGuideSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "Workbench ping found. Follow me.";
    nextFrame.worldSpeech.worldPosition = bulbasaurPosition;
  }

  if (shouldShowBulbasaurRequestReadySpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "Dry patch restored. Soil response logged.";
    nextFrame.worldSpeech.worldPosition = bulbasaurPosition;
  }

  if (shouldShowBulbasaurStrawBedSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "I can share Solar Station plans.";
    nextFrame.worldSpeech.worldPosition = bulbasaurPosition;
  }

  if (shouldShowBulbasaurStrawBedCompleteSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = getColonyFeedbackWorldSpeech(COLONY_FEEDBACK_IDS.SOLAR_STATION_PLACED);
    nextFrame.worldSpeech.worldPosition = bulbasaurPosition;
  }

  if (shouldShowCharmanderFollowSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = charmanderFollowing ?
      "Route locked. Lead me to the heat station." :
      "Signal me when the heat station is ready.";
    nextFrame.worldSpeech.worldPosition = charmanderPosition;
  }

  if (shouldShowCharmanderCelebrationSpeech) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = "Heat station stable. That counts as a celebration.";
    nextFrame.worldSpeech.worldPosition = charmanderPosition;
  }

  const companionLostHint =
    !nextFrame.worldSpeech.visible ?
      getCompanionLostHint({
        activeQuest,
        activeMoveId,
        now
      }) :
      null;

  if (companionLostHint) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = companionLostHint.text;
    nextFrame.worldSpeech.worldPosition = companionLostHint.worldPosition;
  }

  if (!nextFrame.worldSpeech.visible && chopperAttentionCue) {
    nextFrame.worldSpeech.visible = true;
    nextFrame.worldSpeech.text = chopperAttentionCue.text;
    nextFrame.worldSpeech.worldPosition = chopperAttentionCue.worldPosition;

    if (consumeChopperAttentionCueSoundCycle(chopperAttentionCue.cycleId)) {
      playChopperVoice();
    }
  }
}
