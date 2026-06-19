// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createGameShell } from "../app/ui/gameShell/index.js";

describe("createGameShell", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("mounts the start screen inside the gameplay render frame", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const shell = createGameShell({ documentRef: document });

    const gameStage = document.getElementById("game-stage");
    const renderFrame = document.getElementById("render-frame");
    const startOverlay = document.getElementById("start-overlay");
    const inputModalityPanel = document.getElementById("input-modality-panel");
    const universeBackground = gameStage?.querySelector(".gameplay-universe-background");
    const pokedexEntry = document.querySelector(".pokedex-entry");
    const pokedexAvatar = pokedexEntry?.querySelector(".pokedex-entry__avatar");
    const pokedexAvatarImage = pokedexEntry?.querySelector(".pokedex-entry__avatar-image");
    const pokedexDetails = pokedexEntry?.querySelector(".pokedex-entry__details");
    const pokedexSpecies = pokedexEntry?.querySelector('[data-pokedex-field="species"]');
    const pokedexClose = document.getElementById("pokedex-overlay-close");
    const pokedexCloseImage = pokedexClose?.querySelector(".pokedex-entry__close-image");

    expect(gameStage?.contains(renderFrame)).toBe(true);
    expect(universeBackground).toBeInstanceOf(HTMLCanvasElement);
    expect(gameStage?.firstElementChild).toBe(universeBackground);
    expect(renderFrame?.contains(startOverlay)).toBe(true);
    expect(startOverlay?.parentElement).toBe(renderFrame);
    expect(inputModalityPanel?.textContent).toBe("INPUT KEYBOARD");
    expect(inputModalityPanel?.parentElement?.id).toBe("ui-layer");
    expect(pokedexEntry?.firstElementChild).toBe(pokedexAvatar);
    expect(pokedexAvatar?.nextElementSibling).toBe(pokedexDetails);
    expect(pokedexSpecies?.parentElement).toBe(pokedexAvatar);
    expect(pokedexSpecies?.previousElementSibling).toBe(pokedexAvatarImage);
    expect(pokedexClose?.dataset.pokedexAction).toBe("close");
    expect(pokedexCloseImage?.getAttribute("src")).toContain("close-btn-micro.png");
    expect(shell.mount).toBe(gameStage);
    expect(shell.renderFrame).toBe(renderFrame);
    expect(shell.status).toBe(document.getElementById("status"));
    expect(document.querySelector("main")?.contains(gameStage)).toBe(true);
  });

  it("does not duplicate the shell when called more than once", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const firstShell = createGameShell({ documentRef: document });
    const secondShell = createGameShell({ documentRef: document });

    expect(firstShell.mount).toBe(secondShell.mount);
    expect(document.querySelectorAll("#game-stage")).toHaveLength(1);
    expect(document.querySelectorAll("#render-frame")).toHaveLength(1);
    expect(document.querySelectorAll(".gameplay-universe-background")).toHaveLength(1);
  });
});
