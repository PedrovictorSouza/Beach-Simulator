import { describe, expect, it } from "vitest";
import { createTaskHudChecklistHtml } from "../app/tasks/taskHudChecklistAdapter.js";
import { createQuestLog } from "../app/ui/createQuestLog.js";
import { GAMEPAD_LAYOUT, INPUT_DEVICE } from "../input/inputModality.js";

describe("taskHudChecklistAdapter", () => {
  it("renders visible task objectives as HUD checklist items", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "restore-five-dry-patches",
          title: "Restore five dry patches",
          completed: false,
          progressText: "2/5"
        },
        {
          id: "revive-leppa-tree",
          title: "Revive the dead tree",
          completed: true,
          progressText: "Complete"
        }
      ]
    });

    expect(html).toContain('data-objective-type="TASK"');
    expect(html).toContain('data-task-objective-id="restore-five-dry-patches"');
    expect(html).toContain('data-done="false"');
    expect(html).toContain("Restore five dry patches 2/5");
    expect(html).toContain('data-task-objective-id="revive-leppa-tree"');
    expect(html).toContain('data-done="true"');
    expect(html).toContain("Revive the dead tree Complete");
  });

  it("renders a keyboard-only movement hint for the first task by default", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "move-after-crash",
          title: "Move away from the crash site",
          completed: false,
          progressText: "0/1"
        }
      ]
    });

    expect(html).toContain("hud-control-hint");
    expect(html).toContain("Use W/A/S/D to move away.");
    expect(html).not.toContain("Left stick");
  });

  it("renders a gamepad-only movement hint when gamepad input is current", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "move-after-crash",
          title: "Move away from the crash site",
          completed: false,
          progressText: "0/1"
        }
      ]
    }, {
      inputModalityState: {
        device: INPUT_DEVICE.GAMEPAD,
        gamepadLayout: GAMEPAD_LAYOUT.GENERIC
      }
    });

    expect(html).toContain("Use the left stick to move away.");
    expect(html).not.toContain("Use W/A/S/D to move away.");
  });

  it("renders configured HUD illustrations in place of objective text with fallback copy", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "scan-route",
          title: "Scan the first route",
          completed: false,
          progressText: "0/1",
          hudIllustration: {
            imageId: "chopper-selfie",
            alt: "Chopper points out the first route after the crash.",
            width: 100,
            height: 100
          }
        }
      ]
    });

    expect(html).toContain("hud-task-illustration--checklist");
    expect(html).toContain("chopper-selfie");
    expect(html).toContain('alt="Chopper points out the first route after the crash."');
    expect(html).toContain('<span class="hud-task-illustration__fallback" hidden>Scan the first route 0/1</span>');
    expect(html).not.toContain(`
        Scan the first route 0/1
    `);
  });

  it("can keep configured HUD illustrations out of the checklist", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "restore-one-dry-patch",
          title: "Restore one dry patch",
          completed: false,
          progressText: "0/1",
          hudIllustration: {
            imageId: "hydro-jet-tutorial",
            alt: "Hydro Jet tutorial",
            width: 384,
            height: 216,
            showInChecklist: false
          }
        }
      ]
    });

    expect(html).toContain("Restore one dry patch 0/1");
    expect(html).not.toContain("hud-task-illustration--checklist");
    expect(html).not.toContain("hydro-jet-tutorial");
  });

  it("can render title-only HUD objectives without progress copy", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "talk-to-chopper",
          title: "Talk to Chopper",
          completed: false,
          progressText: "0/1",
          hudDisplayMode: "title-only"
        }
      ]
    });

    expect(html).toContain("Talk to Chopper");
    expect(html).not.toContain("Talk to Chopper 0/1");
  });

  it("renders the grow plants objective as a grass icon with progress beside it", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "grow-four-plants",
          title: "Grow four living plants",
          completed: false,
          progressText: "3/4"
        }
      ]
    });

    expect(html).toContain("grass.png");
    expect(html).toContain("hud-checklist__icon-progress");
    expect(html).toContain("hud-checklist__objective-count");
    expect(html).toContain(">3/4</span>");
    expect(html).toContain('aria-label="Grow four living plants 3/4"');
    expect(html).not.toContain(`
        Grow four living plants 3/4
    `);
  });

  it("renders the Thermal cabin objective as a cabin image", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "place-thermal-cabin",
          title: "Place Thermal Bot's cabin",
          completed: false,
          progressText: ""
        }
      ]
    });

    expect(html).toContain("thermal-cabin.png");
    expect(html).toContain("hud-checklist__objective-icon--cabin");
    expect(html).toContain('aria-label="Place Thermal Bot&#39;s cabin"');
    expect(html).not.toContain(`
        Place Thermal Bot's cabin
    `);
  });

  it("hides the white ground clearing objective from the HUD checklist", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "place-thermal-cabin",
          title: "Place Thermal Bot's cabin",
          completed: false,
          progressText: ""
        },
        {
          id: "clear-one-white-ground",
          title: "Clear one white ground patch",
          completed: false,
          progressText: "0/1"
        }
      ]
    });

    expect(html).toContain('data-task-objective-id="place-thermal-cabin"');
    expect(html).not.toContain("clear-one-white-ground");
    expect(html).not.toContain("Clear one white ground patch 0/1");
  });

  it("escapes task objective checklist HTML", () => {
    const html = createTaskHudChecklistHtml({
      active: true,
      objectives: [
        {
          id: "bad-objective",
          title: "<Restore & Grow>",
          completed: false,
          progressText: "1/2"
        }
      ]
    });

    expect(html).toContain("&lt;Restore &amp; Grow&gt; 1/2");
    expect(html).not.toContain("<Restore & Grow>");
  });

  it("returns empty HTML when the task HUD view is inactive", () => {
    expect(createTaskHudChecklistHtml({ active: false, objectives: [] })).toBe("");
    expect(createTaskHudChecklistHtml(null)).toBe("");
  });

  it("lets createQuestLog prefer Task HUD objectives while keeping tracked task rows", () => {
    const questLog = createQuestLog({
      questSystem: {
        getActiveQuest: () => ({
          id: "legacy-quest",
          title: "Legacy quest",
          objectives: [
            {
              type: "MOVE",
              targetId: "player",
              required: 1,
              current: 0
            }
          ]
        }),
        getTaskHudView: () => ({
          active: true,
          objectives: [
            {
              id: "wake-hydro-bot",
              title: "Wake Hydro Bot",
              completed: false,
              progressText: "0/1"
            }
          ]
        })
      }
    });
    const storyState = {
      flags: {
        trackedTaskIds: ["making-habitats"],
        habitatRestored: true
      }
    };
    const html = questLog.renderChecklistHtml(storyState);

    expect(html).toContain('data-task-objective-id="wake-hydro-bot"');
    expect(html).toContain("Wake Hydro Bot 0/1");
    expect(html).not.toContain("Move: Player");
    expect(html).toContain("Making colony zones");
  });
});
