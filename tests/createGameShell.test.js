// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { createGameShell } from "../app/ui/createGameShell.js";

describe("createGameShell", () => {
  it("mounts the start screen inside the gameplay render frame", () => {
    createGameShell({ documentRef: document });

    const gameStage = document.getElementById("game-stage");
    const renderFrame = document.getElementById("render-frame");
    const startOverlay = document.getElementById("start-overlay");

    expect(gameStage?.contains(renderFrame)).toBe(true);
    expect(renderFrame?.contains(startOverlay)).toBe(true);
    expect(startOverlay?.parentElement).toBe(renderFrame);
  });
});
