// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createGameShell } from "../app/ui/createGameShell.js";

describe("createGameShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mounts the start screen inside the gameplay render frame", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    createGameShell({ documentRef: document });

    const gameStage = document.getElementById("game-stage");
    const renderFrame = document.getElementById("render-frame");
    const startOverlay = document.getElementById("start-overlay");
    const universeBackground = gameStage?.querySelector(".gameplay-universe-background");

    expect(gameStage?.contains(renderFrame)).toBe(true);
    expect(universeBackground).toBeInstanceOf(HTMLCanvasElement);
    expect(gameStage?.firstElementChild).toBe(universeBackground);
    expect(renderFrame?.contains(startOverlay)).toBe(true);
    expect(startOverlay?.parentElement).toBe(renderFrame);
  });
});
