// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import {
  CHOPPER_MET_COMPLETION_POP_TEXT,
  FIRST_MISSION_COMPLETION_POP_TEXT,
  HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT,
  getMilestoneCompletionPopText
} from "../app/ui/firstMissionCompletionPop.js";
import { createWorldSpeechController } from "../app/ui/worldSpeechController.js";

describe("createWorldSpeechController", () => {
  it("shows and positions a world speech bubble", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });
    const camera = {
      project() {
        return {
          x: 128,
          y: 72,
          depth: 0.4
        };
      }
    };

    controller.show({
      text: "Hohohoh! I've found quite the haul today!",
      worldPosition: [12.4, 0.02, -8.4]
    });
    controller.update(camera, 426, 240);

    const bubble = mount.querySelector(".act-two-tutorial__speech-bubble");
    const speech = mount.querySelector(".act-two-tutorial__speech");

    expect(bubble?.textContent).toBe("Hohohoh! I've found quite the haul today!");
    expect(speech?.style.left).toBe("128px");
    expect(speech?.style.top).toBe("72px");
    expect(speech?.style.opacity).toBe("1");
  });

  it("projects speech from the curved visual position", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });
    const project = vi.fn(() => ({
      x: 128,
      y: 72,
      depth: 0.4
    }));
    const camera = {
      getPose() {
        return {
          target: [10, 1, -6]
        };
      },
      project
    };

    controller.show({
      text: "Look over here.",
      worldPosition: [20, 3, -6]
    });
    controller.update(camera, 426, 240);

    expect(project).toHaveBeenCalledTimes(1);
    const [projectedPosition, width, height] = project.mock.calls[0];
    expect(projectedPosition[0]).toBe(20);
    expect(projectedPosition[1]).toBeCloseTo(5.245);
    expect(projectedPosition[2]).toBe(-6);
    expect(width).toBe(426);
    expect(height).toBe(240);
  });

  it("hides the speech layer when requested", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });

    controller.show({
      text: "Hello",
      worldPosition: [0, 0, 0]
    });
    controller.hide();

    const layer = mount.querySelector("[data-world-speech-layer='true']");
    expect(layer?.hidden).toBe(true);
    expect(controller.isVisible()).toBe(false);
  });

  it("renders field move switch prompts as positioned card markup", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });

    controller.showPrompt({
      text: '<span data-field-move-switch-card="true"><strong>Water</strong></span>',
      worldPosition: [1, 0, 2]
    });

    const prompt = mount.querySelector('[data-world-speech-variant="player-prompt"]');

    expect(prompt?.dataset.worldPromptKind).toBe("field-move-switch");
    expect(prompt?.style.transform).toContain("translate(104px");
    expect(prompt?.style.transform).toContain("0.625");
    expect(prompt?.querySelector("[data-field-move-switch-card='true'] strong")?.textContent).toBe("Water");

    controller.hidePrompt();

    expect(prompt?.hidden).toBe(true);
    expect(prompt?.dataset.worldPromptKind).toBe("text");
    expect(prompt?.textContent).toBe("");
  });

  it("renders counter prompts with scalable letter pop markup", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });
    const promptText = "Carbon x28 - Thermal fuel";

    controller.showPrompt({
      text: promptText,
      promptKind: "counter",
      worldPosition: [1, 0, 2]
    });

    const prompt = mount.querySelector('[data-world-speech-variant="player-prompt"]');
    const bubble = prompt?.querySelector(".act-two-tutorial__speech-bubble");
    const letterPop = bubble?.querySelector(".world-prompt-letter-pop");
    const letters = [...(bubble?.querySelectorAll(".world-prompt-letter-pop__char") || [])];
    const words = [...(bubble?.querySelectorAll(".world-prompt-letter-pop__word") || [])];
    const styleText = document.getElementById("world-prompt-letter-pop-style")?.textContent || "";

    expect(prompt?.dataset.worldPromptKind).toBe("counter");
    expect(letterPop?.getAttribute("aria-label")).toBe(promptText);
    expect(bubble?.textContent).toBe(promptText);
    expect(letters).toHaveLength(Array.from(promptText.replace(/\s+/g, "")).length);
    expect(words).toHaveLength(5);
    expect(letters[0].style.getPropertyValue("--letter-index")).toBe("0");
    expect(styleText).toContain("font-size: 68px");
    expect(styleText).toContain("max-width: min(760px, calc(100vw - 64px))");
    expect(styleText).toContain("text-align: center");
  });

  it("keeps text prompts visible during their exit motion", () => {
    vi.useFakeTimers();
    try {
      const mount = document.createElement("div");
      const controller = createWorldSpeechController({ mount });

      controller.showPrompt({
        text: "Wood x33",
        worldPosition: [1, 0, 2]
      });

      const prompt = mount.querySelector('[data-world-speech-variant="player-prompt"]');
      const layer = mount.querySelector("[data-world-speech-layer='true']");

      expect(prompt?.dataset.promptMotion).toBe("enter");
      expect(prompt?.hidden).toBe(false);

      controller.hidePrompt();

      expect(prompt?.dataset.promptMotion).toBe("exit");
      expect(prompt?.hidden).toBe(false);
      expect(layer?.hidden).toBe(false);

      vi.advanceTimersByTime(260);

      expect(prompt?.hidden).toBe(true);
      expect(prompt?.dataset.worldPromptKind).toBe("text");
      expect(prompt?.textContent).toBe("");
      expect(layer?.hidden).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps NPC communication bubbles behind the HUD layer", () => {
    const mount = document.createElement("div");
    createWorldSpeechController({ mount });

    const layer = mount.querySelector("[data-world-speech-layer='true']");

    expect(Number(layer?.style.zIndex)).toBeLessThan(2);
  });

  it("uses the large task-pop size for the restored tall grass message", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });

    controller.showTaskPop({
      text: "HYDRO BOT IS ONLINE!",
      worldPosition: [0, 0, 0]
    });

    const taskPop = mount.querySelector("[data-world-speech-variant='task-pop']");
    expect(taskPop?.dataset.taskPopSize).toBe("large");
  });

  it("renders milestone completion pops letter by letter", () => {
    const mount = document.createElement("div");
    const controller = createWorldSpeechController({ mount });

    controller.showTaskPop({
      text: FIRST_MISSION_COMPLETION_POP_TEXT,
      worldPosition: [0, 0, 0]
    });

    const taskPop = mount.querySelector("[data-world-speech-variant='task-pop']");
    const letters = taskPop?.querySelectorAll(".milestone-completion-pop__letter");
    const style = document.getElementById("milestone-completion-pop-style");

    expect(taskPop?.dataset.taskPopKind).toBe("milestone");
    expect(letters).toHaveLength(Array.from(FIRST_MISSION_COMPLETION_POP_TEXT).length);
    expect(style?.textContent).toContain("border: 2px solid #000000");

    controller.showTaskPop({
      text: CHOPPER_MET_COMPLETION_POP_TEXT,
      worldPosition: [0, 0, 0]
    });

    const chopperLetters = taskPop?.querySelectorAll(".milestone-completion-pop__letter");
    expect(taskPop?.dataset.taskPopKind).toBe("milestone");
    expect(chopperLetters).toHaveLength(Array.from(CHOPPER_MET_COMPLETION_POP_TEXT).length);

    controller.showTaskPop({
      text: HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT,
      worldPosition: [0, 0, 0]
    });

    const hydroLetters = taskPop?.querySelectorAll(".milestone-completion-pop__letter");
    expect(taskPop?.dataset.taskPopKind).toBe("milestone");
    expect(hydroLetters).toHaveLength(Array.from(HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT).length);
    expect(getMilestoneCompletionPopText("gather-first-supplies")).toBe(
      HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT
    );

    controller.showTaskPop({
      text: "HYDRO BOT IS ONLINE!",
      worldPosition: [0, 0, 0]
    });

    expect(taskPop?.dataset.taskPopKind).toBeUndefined();
    expect(taskPop?.querySelector(".first-mission-completion-pop")).toBeNull();
  });
});
