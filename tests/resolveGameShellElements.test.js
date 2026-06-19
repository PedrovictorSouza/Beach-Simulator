// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveGameShellElements } from "../app/ui/gameShell/resolveGameShellElements.js";
import { createGameShell } from "../app/ui/gameShell/index.js";

describe("resolveGameShellElements", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("resolves required shell nodes after the game shell is mounted", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    createGameShell({ documentRef: document });

    const dom = resolveGameShellElements(document);

    expect(dom.worldCanvas).toBe(document.getElementById("viewport"));
    expect(dom.spriteCanvas).toBe(document.getElementById("sprite-layer"));
    expect(dom.status).toBe(document.getElementById("status"));
    expect(dom.mount).toBe(document.getElementById("game-stage"));
    expect(dom.renderFrame).toBe(document.getElementById("render-frame"));
    expect(dom.uiLayer).toBe(document.getElementById("ui-layer"));
  });

  it("fails clearly when a required shell node is missing", () => {
    expect(() => resolveGameShellElements(document)).toThrow(
      "Missing required game shell element: viewport"
    );
  });
});
