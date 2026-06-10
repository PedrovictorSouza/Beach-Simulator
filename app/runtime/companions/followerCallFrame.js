import { SANDBOTS_BOT_NAMES } from "../../story/sandbotsLexicon.js";
import { SOUND_EVENT_IDS } from "../soundEventRuntime.js";

export function processFollowerCallFrame({
  controls,
  session,
  pushNotice,
  playSoundEvent
}) {
  if (!controls.consumeFollowerCallRequest?.()) {
    return;
  }

  playSoundEvent(SOUND_EVENT_IDS.BOT_SIGNAL);
  const flags = controls.storyState.flags;
  const leafDenHelpCall =
    flags.leafDenKitPlaced &&
    !flags.leafDenConstructionStarted;

  if (leafDenHelpCall) {
    const called = [];
    if (flags.timburrRevealed) {
      flags.timburrFollowing = true;
      called.push(SANDBOTS_BOT_NAMES.builder);
    }
    if (flags.charmanderRevealed) {
      flags.charmanderFollowing = true;
      called.push(SANDBOTS_BOT_NAMES.thermal);
    }
    pushNotice(called.length ?
      `${called.join(" and ")} are following you.` :
      "No bots are ready to help with construction yet.");
  } else if (
    flags.charmanderRevealed &&
    !flags.charmanderCampfireLit &&
    session.campfire
  ) {
    flags.charmanderFollowing = true;
    pushNotice(`${SANDBOTS_BOT_NAMES.thermal} is following you.`);
  } else if (
    flags.charmanderCelebrationSuggested &&
    !flags.charmanderCelebrationComplete &&
    flags.charmanderRevealed
  ) {
    flags.charmanderFollowing = true;
    pushNotice(`${SANDBOTS_BOT_NAMES.thermal} is following you.`);
  }
}
