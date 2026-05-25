import { describe, expect, it } from "vitest";
import { createQuestLog } from "../app/ui/createQuestLog.js";
import {
  createTaskHudSummary,
  createTaskHudSummaryHtml
} from "../app/tasks/taskHudSummaryAdapter.js";

describe("taskHudSummaryAdapter", () => {
  it("creates plain text and HTML summaries from a task HUD view", () => {
    const taskHudView = {
      active: true,
      taskId: "restore-dry-grass",
      objectiveId: "restore-five-dry-patches",
      taskTitle: "Restore the Dry Grass Route",
      title: "Restore five dry patches",
      description: "Restore a small route so life can hold outside the crash area.",
      progressText: "2/5",
      source: "main",
      objectives: []
    };

    expect(createTaskHudSummary(taskHudView)).toBe(
      "Restore five dry patches. Restore a small route so life can hold outside the crash area. 2/5"
    );
    expect(createTaskHudSummaryHtml(taskHudView)).toContain(
      '<div class="hud-task-title">Restore five dry patches</div>'
    );
    expect(createTaskHudSummaryHtml(taskHudView)).toContain(
      '<div class="hud-task-subtitle">Restore a small route so life can hold outside the crash area. 2/5</div>'
    );
  });

  it("escapes task HUD summary HTML", () => {
    expect(createTaskHudSummaryHtml({
      active: true,
      title: "<Restore>",
      description: "Use Hydro & Grow",
      progressText: "1/2"
    })).toContain("&lt;Restore&gt;");
    expect(createTaskHudSummaryHtml({
      active: true,
      title: "<Restore>",
      description: "Use Hydro & Grow",
      progressText: "1/2"
    })).toContain("Use Hydro &amp; Grow 1/2");
  });

  it("renders a configured HUD illustration instead of subtitle copy", () => {
    const html = createTaskHudSummaryHtml({
      active: true,
      title: "Scan the first route",
      description: "Use Chopper's marker to confirm the safe path.",
      progressText: "0/1",
      hudIllustration: {
        imageId: "chopper-selfie",
        alt: "Chopper points out the first route after the crash.",
        width: 100,
        height: 100
      }
    });

    expect(html).toContain("hud-task-subtitle--illustrated");
    expect(html).toContain("hud-task-illustration--summary");
    expect(html).toContain("chopper-selfie");
    expect(html).toContain("Chopper points out the first route after the crash.");
    expect(html).toContain("Use Chopper&#39;s marker to confirm the safe path. 0/1");
    expect(html).not.toContain(
      '<div class="hud-task-subtitle">Use Chopper&#39;s marker to confirm the safe path. 0/1</div>'
    );
  });

  it("renders the Hydro Jet tutorial image instead of the first patch subtitle copy", () => {
    const html = createTaskHudSummaryHtml({
      active: true,
      title: "Restore one dry patch",
      description: "Water one dry patch and make the first visible life return.",
      progressText: "0/1",
      hudIllustration: {
        imageId: "hydro-jet-tutorial",
        alt: "Hydro Jet tutorial",
        width: 384,
        height: 216
      }
    });

    expect(html).toContain("hud-task-subtitle--illustrated");
    expect(html).toContain("hydro-jet-tutorial");
    expect(html).toContain("unboarding-hidro.png");
    expect(html).toContain("Hydro Jet tutorial");
    expect(html).toContain("Water one dry patch and make the first visible life return. 0/1");
    expect(html).not.toContain(
      '<div class="hud-task-subtitle">Water one dry patch and make the first visible life return. 0/1</div>'
    );
  });

  it("renders title-only HUD summaries without subtitle copy", () => {
    const taskHudView = {
      active: true,
      title: "Talk to Chopper",
      description: "Follow the marker and hear what still works on the planet.",
      progressText: "0/1",
      hudDisplayMode: "title-only",
      hudIllustration: {
        imageId: "chopper-selfie",
        alt: "Chopper",
        width: 100,
        height: 100
      }
    };

    expect(createTaskHudSummary(taskHudView)).toBe("Talk to Chopper");
    const html = createTaskHudSummaryHtml(taskHudView);
    expect(html).toContain("hud-task-title--with-illustration");
    expect(html).toContain("hud-task-illustration--title");
    expect(html).toContain("chopper-selfie");
    expect(html).toContain("Talk to Chopper");
    expect(html.indexOf("hud-task-illustration--title")).toBeLessThan(
      html.indexOf("hud-task-title__copy")
    );
    expect(html).not.toContain("hud-task-subtitle");
    expect(html).not.toContain("0/1");
  });

  it("returns the free roam summary when no task is active", () => {
    expect(createTaskHudSummary({ active: false })).toBe(
      "Free roam. Keep restoring the island and checking in with helpers."
    );
    expect(createTaskHudSummaryHtml({ active: false })).toContain(
      "Keep restoring the island and checking in with helpers."
    );
  });

  it("lets createQuestLog prefer the Task HUD view for the active summary", () => {
    const questLog = createQuestLog({
      questSystem: {
        getActiveQuest: () => ({
          id: "legacy-quest",
          title: "Legacy quest",
          description: "Legacy copy.",
          objectives: []
        }),
        getTaskHudView: () => ({
          active: true,
          taskTitle: "Wake Hydro Bot",
          title: "Wake Hydro Bot",
          description: "Bring Hydro Bot online.",
          progressText: "0/1"
        })
      }
    });

    expect(questLog.renderActiveSummary()).toBe(
      "Wake Hydro Bot. Bring Hydro Bot online. 0/1"
    );
    expect(questLog.renderActiveSummaryHtml()).toContain("Wake Hydro Bot");
    expect(questLog.renderActiveSummaryHtml()).not.toContain("Legacy quest");
  });

  it("keeps createQuestLog fallback behavior when no Task HUD view exists", () => {
    const questLog = createQuestLog({
      questSystem: {
        getActiveQuest: () => ({
          id: "legacy-quest",
          title: "Legacy quest",
          description: "Legacy copy.",
          objectives: []
        })
      }
    });

    expect(questLog.renderActiveSummary()).toBe("Legacy quest. Legacy copy.");
    expect(questLog.renderActiveSummaryHtml()).toContain("Legacy copy.");
  });
});
