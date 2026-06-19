import { describe, expect, it } from "vitest";
import {
  OBJECTIVE_COMPLETION_POP_DURATION_MS,
  QUEST_COMPLETION_POP_DURATION_MS,
  buildObjectiveCompletionPopText,
  buildQuestCompletionPopText,
  buildQuestTransitionNotice
} from "../app/bootstrap/questCompletionFeedback.js";

describe("quest completion feedback", () => {
  it("builds the notice from the completed quest and its next quest", () => {
    const quests = new Map([
      ["wake-guide", {
        id: "wake-guide",
        title: "Wake the guide",
        nextQuestId: "gather-first-supplies"
      }],
      ["gather-first-supplies", {
        id: "gather-first-supplies",
        title: "Gather first supplies",
        guidance: "Pick up useful items."
      }]
    ]);

    expect(buildQuestTransitionNotice({
      completedQuestIds: ["wake-guide"],
      getQuest: (questId) => quests.get(questId)
    })).toBe("Task complete: Wake the guide. Next: Gather first supplies. Pick up useful items.");
  });

  it("builds quest and objective completion pop text", () => {
    const getQuest = (questId) => questId === "custom-quest" ? { title: "Custom Quest" } : null;

    expect(QUEST_COMPLETION_POP_DURATION_MS).toBe(2400);
    expect(OBJECTIVE_COMPLETION_POP_DURATION_MS).toBe(1500);
    expect(buildQuestCompletionPopText({
      completedQuestIds: ["wake-guide"],
      getQuest
    })).toBe("You met Chopper!");
    expect(buildQuestCompletionPopText({
      completedQuestIds: ["custom-quest"],
      getQuest
    })).toBe("You completed Custom Quest!");
    expect(buildObjectiveCompletionPopText([
      { id: "rebirth-of-nature", title: "Restore nature" }
    ])).toBe("Restore nature complete +10 Leaf");
  });
});
