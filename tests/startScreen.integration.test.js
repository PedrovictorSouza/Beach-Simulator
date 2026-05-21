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
    root = document.createElement("section");
    uiLayer = document.createElement("div");
    document.body.append(root, uiLayer);
    onStart = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the title screen first and starts on space after the exit transition", async () => {
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

    const event = {
      code: "Space",
      key: " ",
      preventDefault: vi.fn(),
    };

    const handled = startScreen.handleKeydown(event);
    await Promise.resolve();
    await Promise.resolve();

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(prepareExitTransition).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
    expect(root.hidden).toBe(false);
    expect(root.classList.contains("overlay-transition--exit")).toBe(true);
    expect(uiLayer.dataset.mode).toBe("start");

    root.dispatchEvent(new Event("transitionend"));
    await Promise.resolve();
    await Promise.resolve();

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(startScreen.isActive()).toBe(false);
    expect(root.hidden).toBe(true);
    expect(uiLayer.dataset.mode).toBe("game");
  });

  it("opens save slots before starting when a save state exists", async () => {
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
      code: "ArrowDown",
      key: "ArrowDown",
      preventDefault: vi.fn()
    });

    expect(root.textContent).toContain("> New Game");

    startScreen.handleKeydown({
      code: "Escape",
      key: "Escape",
      preventDefault: vi.fn()
    });

    expect(root.textContent).toContain("Start Game");
    expect(root.textContent).not.toContain("Continue");

    startScreen.handleKeydown({
      code: "Enter",
      key: "Enter",
      preventDefault: vi.fn()
    });
    startScreen.handleKeydown({
      code: "ArrowDown",
      key: "ArrowDown",
      preventDefault: vi.fn()
    });
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
      action: "newGame",
      slotId: "slot-2"
    }));
    expect(startScreen.isActive()).toBe(false);
  });
});
