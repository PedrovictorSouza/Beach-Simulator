import { getMilestoneCompletionPopText } from "../ui/firstMissionCompletionPop.js";
import { SANDBOTS_ITEM_NAMES } from "../story/sandbotsLexicon.js";

export const QUEST_COMPLETION_POP_DURATION_MS = 2400;
export const OBJECTIVE_COMPLETION_POP_DURATION_MS = 1500;

const OBJECTIVE_COMPLETION_REWARD_TEXT_BY_ID = Object.freeze({
  "rebirth-of-nature": "+10 Leaf"
});
const QUEST_COMPLETION_POP_MESSAGES = Object.freeze({
  "learn-to-move": "You can move!",
  "wake-guide": "You met Chopper!",
  "gather-first-supplies": "Hydro Bot is online!",
  "water-first-dry-patch": "First patch restored!",
  "water-dry-grass": "You restored the tall grass!",
  "inspect-rustling-grass": `${SANDBOTS_ITEM_NAMES.growTool} online!`,
  "grow-a-home-patch": "You grew a home patch!",
  "melt-first-snow": "Snow cleared!",
  "open-colony-computer": "Colony computer online!",
  "build-first-base": "Base foundation built!",
  "chopper-first-habitat-report": "You reported back!"
});

export function buildQuestTransitionNotice({
  completedQuestIds = [],
  activeQuest = null,
  getQuest = () => null
} = {}) {
  const completedQuest = getQuest(completedQuestIds.at(-1));
  const nextQuest = completedQuest?.nextQuestId ?
    getQuest(completedQuest.nextQuestId) :
    activeQuest;
  const completedCopy = completedQuest ? `Task complete: ${completedQuest.title}.` : "Task complete.";
  const nextCopy = nextQuest ?
    `Next: ${nextQuest.title}. ${nextQuest.guidance || nextQuest.description}` :
    "Free roam: keep restoring the island and checking in with helpers.";
  return `${completedCopy} ${nextCopy}`;
}

export function buildQuestCompletionPopText({
  completedQuestIds = [],
  getQuest = () => null
} = {}) {
  const completedQuestId = completedQuestIds.at(-1);
  const completedQuest = completedQuestId ? getQuest(completedQuestId) : null;
  const milestonePopText = getMilestoneCompletionPopText(completedQuestId);

  if (milestonePopText) {
    return milestonePopText;
  }

  return QUEST_COMPLETION_POP_MESSAGES[completedQuestId] ||
    `You completed ${completedQuest?.title || "the task"}!`;
}

export function buildObjectiveCompletionPopText(completedObjectives = []) {
  const completedObjective = completedObjectives.at(-1);
  const title = completedObjective?.title || "Objective";
  const rewardText = OBJECTIVE_COMPLETION_REWARD_TEXT_BY_ID[completedObjective?.id];
  return `${title} complete${rewardText ? ` ${rewardText}` : ""}`;
}
