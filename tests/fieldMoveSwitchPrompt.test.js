import { describe, expect, it } from "vitest";
import {
  FIELD_MOVE_SWITCH_PROMPT_DURATION_MS,
  buildFieldMoveSwitchPromptHtml
} from "../app/bootstrap/fieldMoveSwitchPrompt.js";

const playerSkillDefs = {
  waterGun: { id: "waterGun" },
  leafage: { id: "leafage" },
  fire: { id: "fire" },
  buildBlock: { id: "buildBlock" }
};

describe("field move switch prompt", () => {
  it("builds carousel html for unlocked field moves", () => {
    const html = buildFieldMoveSwitchPromptHtml({
      skillId: "leafage",
      previousSkillId: "waterGun",
      playerSkillDefs,
      unlockedFieldMoveIds: ["waterGun", "leafage", "fire"]
    });

    expect(FIELD_MOVE_SWITCH_PROMPT_DURATION_MS).toBe(1500);
    expect(html).toContain('data-field-move-switch-card="true"');
    expect(html).toContain('data-selected-move-id="leafage"');
    expect(html).toContain('data-companion-id="bulbasaur"');
    expect(html).toContain('data-selected="true"');
    expect(html).toContain("fieldMoveCarouselCardIn");
    expect(html).toContain("fieldMoveCarouselSelectedPulse");
  });

  it("returns no html when there are no unlocked field moves", () => {
    expect(buildFieldMoveSwitchPromptHtml({
      skillId: "leafage",
      playerSkillDefs,
      unlockedFieldMoveIds: []
    })).toBe("");
  });
});
