import {
  createChopperAttentionCueRuntime,
  resolveChopperAttentionCue
} from "./chopperAttentionCueRuntime.js";
import {
  createCompanionLostHintRuntime,
  resolveWaterGunCompanionLostHint
} from "./companionLostHintRuntime.js";

export function createCompanionWorldSpeechCueRuntime({
  chopperCueSchedule = {},
  companionLostHintSchedule = {},
  getFlags = () => ({}),
  getPlayerSkills = () => ({}),
  getBulbasaurPosition = () => null,
  getSquirtlePosition = () => null,
  isPlayerNearWorldPosition = () => false,
  config = {}
} = {}) {
  const chopperAttentionCueRuntime =
    createChopperAttentionCueRuntime(chopperCueSchedule);
  const companionLostHintRuntime =
    createCompanionLostHintRuntime(companionLostHintSchedule);

  function getChopperAttentionCue({
    activeTask,
    activeSystemQuest,
    chopperPosition,
    now
  }) {
    const cue = resolveChopperAttentionCue({
      activeTaskId: activeTask?.id,
      activeSystemQuestId: activeSystemQuest?.id,
      chopperPosition,
      isPlayerNearWorldPosition,
      interactDistance: config.chopperInteractDistance,
      text: config.chopperCueText
    });

    return chopperAttentionCueRuntime.get(cue, now);
  }

  function getCompanionLostHint({
    activeQuest,
    activeMoveId,
    now
  }) {
    const flags = getFlags() || {};
    const playerSkills = getPlayerSkills() || {};
    const hint = resolveWaterGunCompanionLostHint({
      activeQuestId: activeQuest?.id,
      activeMoveId,
      flags,
      playerHasWaterGun: playerSkills.waterGun,
      bulbasaurPosition: getBulbasaurPosition(),
      squirtlePosition: getSquirtlePosition(),
      restoreTargetCount: config.restoreTargetCount,
      squirtleHintText: config.squirtleHintText,
      bulbasaurHintText: config.bulbasaurHintText
    });

    return companionLostHintRuntime.get(hint, now);
  }

  return {
    consumeChopperAttentionCueSoundCycle:
      chopperAttentionCueRuntime.consumeSoundCycle,
    getChopperAttentionCue,
    getCompanionLostHint,
    resetChopperAttentionCueSchedule: chopperAttentionCueRuntime.resetSchedule,
    resetCompanionLostHint: companionLostHintRuntime.reset
  };
}
