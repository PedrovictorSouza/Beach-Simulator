import { updateGroundCellHighlightFrame } from "./groundCellHighlightFrame.js";
import { updateStatusPopupsFrame } from "./statusPopupsFrame.js";
import { updateWorldPromptSnapshotFrame } from "./worldPromptSnapshotFrame.js";
import { updateWorldSpeechSnapshotFrame } from "./worldSpeechSnapshotFrame.js";

function getPlayerPosition(session = {}) {
  return session.playerCharacter?.getPosition?.() || [0, 0, 0];
}

export function updateWorldSpacePresentationSnapshotFrame(nextFrame, {
  now = 0,
  activeQuest = null,
  activeMoveId = null,
  session = {},
  controls = {},
  gameplay = {},
  inputModalityState = null,
  presentationState = {},
  promptSources = {},
  groundCellHighlightState = {},
  frameBlockers = {},
  getCompanionLostHint = () => null,
  consumeChopperAttentionCueSoundCycle = () => false,
  playChopperVoice = () => {}
} = {}) {
  const playerPosition = getPlayerPosition(session);

  updateWorldSpeechSnapshotFrame(nextFrame, {
    ...presentationState,
    now,
    activeQuest,
    activeMoveId,
    bulbasaurPosition: session.bulbasaurEncounter?.position || null,
    charmanderPosition: session.charmanderEncounter?.position || null,
    tangrowthOpeningLine: gameplay.tangrowthOpeningLine,
    charmanderFollowing: controls.storyState?.flags?.charmanderFollowing,
    getCompanionLostHint,
    consumeChopperAttentionCueSoundCycle,
    playChopperVoice
  });

  updateWorldPromptSnapshotFrame(nextFrame, {
    ...promptSources,
    ...presentationState,
    inputModalityState,
    playerPosition
  });

  updateGroundCellHighlightFrame(nextFrame, groundCellHighlightState);

  updateStatusPopupsFrame(nextFrame, {
    ...frameBlockers,
    nearbyDryGrassHintTarget: presentationState.nearbyDryGrassHintTarget,
    questCompletionPop: gameplay.getQuestCompletionPop?.(),
    hasPlayerCharacter: Boolean(session.playerCharacter),
    getPlayerPosition: () => session.playerCharacter.getPosition()
  });
}
