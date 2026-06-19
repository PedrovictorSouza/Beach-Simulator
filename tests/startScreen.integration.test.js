// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStartScreen } from "../startScreen.js";

describe("createStartScreen integration", () => {
  let root;
  let uiLayer;
  let onStart;

  beforeEach(() => {
    document.body.innerHTML = "";
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback) => {
        callback(performance.now());
        return 1;
      }
    });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      transitionDuration: "260ms",
      transitionDelay: "0s",
      animationName: "none",
      animationDuration: "0s",
      animationDelay: "0s"
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    root = document.createElement("section");
    uiLayer = document.createElement("div");
    document.body.append(root, uiLayer);
    onStart = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the title screen first, opens empty slots, asks language, and starts with locale", async () => {
    const prepareExitTransition = vi.fn(() => Promise.resolve());
    const startScreen = createStartScreen({
      root,
      uiLayer,
      prepareExitTransition,
      onStart
    });

    expect(startScreen.isActive()).toBe(true);
    expect(uiLayer.dataset.mode).toBe("start");
    expect(root.querySelector(".start-card__title-image")?.getAttribute("alt")).toBe("Small Island");
    expect(root.querySelector(".start-card__start-prompt")?.textContent.trim()).toBe("START");
    const background = root.querySelector(".start-screen-universe");
    expect(background).toBeInstanceOf(HTMLCanvasElement);
    expect(root.querySelector(".start-shell")?.firstElementChild).toBe(background);

    const event = {
      code: "Space",
      key: " ",
      preventDefault: vi.fn(),
    };

    const handled = startScreen.handleKeydown(event);

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(prepareExitTransition).not.toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
    expect(root.textContent).toContain("> New Game Slot 1");
    expect(root.textContent).toContain("New Game Slot 2");

    startScreen.handleKeydown({
      code: "Space",
      key: " ",
      preventDefault: vi.fn()
    });

    expect(prepareExitTransition).not.toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
    expect(root.textContent).toContain("Language");
    expect(root.textContent).toContain("> English");
    expect(root.textContent).toContain("Português");

    startScreen.handleKeydown({
      code: "ArrowDown",
      key: "ArrowDown",
      preventDefault: vi.fn()
    });

    expect(root.textContent).toContain("> Português");
    expect(root.textContent).toContain("Idioma");
    expect(root.textContent).toContain("Voltar");

    startScreen.handleKeydown({
      code: "Enter",
      key: "Enter",
      preventDefault: vi.fn()
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(prepareExitTransition).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
    expect(root.hidden).toBe(false);
    expect(root.classList.contains("overlay-transition--exit")).toBe(true);
    expect(uiLayer.dataset.mode).toBe("start");

    root.dispatchEvent(new Event("transitionend"));
    await Promise.resolve();
    await Promise.resolve();

    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
      action: "newGame",
      slotId: "slot-1",
      locale: "pt-BR"
    }));
    expect(startScreen.isActive()).toBe(false);
    expect(root.hidden).toBe(true);
    expect(root.querySelector(".start-screen-universe")).toBeNull();
    expect(uiLayer.dataset.mode).toBe("game");
  });

  it("continues a saved game directly without asking for language", async () => {
    const prepareExitTransition = vi.fn(() => Promise.resolve());
    const startScreen = createStartScreen({
      root,
      uiLayer,
      prepareExitTransition,
      saveSlots: [
        {
          id: "continue",
          action: "continue",
          slotId: "slot-1",
          label: "Continue",
          detail: "Saved Game"
        },
        {
          id: "new-game-slot-2",
          action: "newGame",
          slotId: "slot-2",
          label: "New Game",
          detail: "Empty Slot 1"
        },
        {
          id: "new-game-slot-3",
          action: "newGame",
          slotId: "slot-3",
          label: "New Game",
          detail: "Empty Slot 2"
        }
      ],
      onStart
    });

    startScreen.handleKeydown({
      code: "Enter",
      key: "Enter",
      preventDefault: vi.fn()
    });

    expect(prepareExitTransition).not.toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
    expect(root.textContent).toContain("Continue");
    expect(root.textContent).toContain("> Continue");

    startScreen.handleKeydown({
      code: "Enter",
      key: "Enter",
      preventDefault: vi.fn()
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(prepareExitTransition).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();

    root.dispatchEvent(new Event("transitionend"));
    await Promise.resolve();
    await Promise.resolve();

    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
      action: "continue",
      slotId: "slot-1"
    }));
    expect(onStart.mock.calls[0][0]).not.toHaveProperty("locale");
    expect(startScreen.isActive()).toBe(false);
  });
});
