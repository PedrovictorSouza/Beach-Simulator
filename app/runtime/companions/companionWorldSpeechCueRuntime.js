import {
  createChopperAttentionCueRuntime,
  resolveChopperAttentionCue
} from "./chopperAttentionCueRuntime.js";
import {
  createCompanionLostHintRuntime,
  resolveWaterGunCompanionLostHint
} from "./companionLostHintRuntime.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES
} from "../../story/sandbotsLexicon.js";

const COMPANION_LOST_HINT_INITIAL_DELAY_MS = 5200;
const COMPANION_LOST_HINT_REPEAT_MS = 13000;
const COMPANION_LOST_HINT_DURATION_MS = 3400;
const CHOPPER_ATTENTION_CUE_INITIAL_DELAY_MS = 4200;
const CHOPPER_ATTENTION_CUE_REPEAT_MS = 11000;
const CHOPPER_ATTENTION_CUE_DURATION_MS = 2400;
const CHOPPER_ATTENTION_CUE_TEXT = "Hey!";
const SQUIRTLE_WATER_GUN_HINT_TEXT =
  `Press LT to use ${SANDBOTS_ITEM_NAMES.hydroTool}.`;
const BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT =
  `Press Left to change to ${SANDBOTS_BOT_NAMES.hydro}.`;

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

export function createGameplayCompanionWorldSpeechCueRuntime({
  controls = {},
  session = {},
  fieldMoveActorPositionRuntime = {},
  worldSceneSyncRuntime = {},
  config = {}
} = {}) {
  return createCompanionWorldSpeechCueRuntime({
    chopperCueSchedule: {
      initialDelayMs: CHOPPER_ATTENTION_CUE_INITIAL_DELAY_MS,
      repeatMs: CHOPPER_ATTENTION_CUE_REPEAT_MS,
      durationMs: CHOPPER_ATTENTION_CUE_DURATION_MS
    },
    companionLostHintSchedule: {
      initialDelayMs: COMPANION_LOST_HINT_INITIAL_DELAY_MS,
      repeatMs: COMPANION_LOST_HINT_REPEAT_MS,
      durationMs: COMPANION_LOST_HINT_DURATION_MS
    },
    getFlags: () => controls.storyState?.flags || {},
    getPlayerSkills: () => controls.playerSkills || {},
    getBulbasaurPosition: () => session.bulbasaurEncounter?.position,
    getSquirtlePosition: () =>
      fieldMoveActorPositionRuntime.getSquirtleWorldPosition?.(),
    isPlayerNearWorldPosition: (...args) =>
      Boolean(worldSceneSyncRuntime.isPlayerNearWorldPosition?.(...args)),
    config: {
      chopperInteractDistance: config.chopperInteractDistance,
      chopperCueText: CHOPPER_ATTENTION_CUE_TEXT,
      restoreTargetCount: config.restoreTargetCount,
      squirtleHintText: SQUIRTLE_WATER_GUN_HINT_TEXT,
      bulbasaurHintText: BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT
    }
  });
}
