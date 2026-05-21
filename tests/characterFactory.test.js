// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCharacterFactory } from "../characterFactory.js";

const originalImage = globalThis.Image;
const originalGetContext = HTMLCanvasElement.prototype.getContext;

function installCharacterAssetMocks() {
  globalThis.Image = class FakeImage {
    constructor() {
      this.width = 1;
      this.height = 1;
      this.decoding = "async";
      this.onload = null;
      this.onerror = null;
    }

    set src(_value) {
      queueMicrotask(() => this.onload?.());
    }
  };

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4)
    })),
    putImageData: vi.fn()
  }));
}

function createIdleController() {
  return {
    getIntent() {
      return {
        movement: [0, 0, 0],
        moving: false,
        facing: "down",
        jumping: false
      };
    }
  };
}

async function createTestCharacter(options = {}) {
  const factory = await createCharacterFactory({
    spriteSheetUrl: "/fake-walk.png",
    idleUrl: "/fake-idle.png"
  });

  return factory.createCharacter({
    position: [0, 0, 0],
    controller: createIdleController(),
    ...options
  });
}

describe("createCharacterFactory vertical grounding", () => {
  beforeEach(() => {
    installCharacterAssetMocks();
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.restoreAllMocks();
  });

  it("drops a stale elevated ground position when there is no landing surface below", async () => {
    const character = await createTestCharacter({
      collisionTest: () => false
    });

    character.setPosition([0, 2, 0]);
    character.update(0.1);

    expect(character.getPosition()[1]).toBeLessThan(2);
  });

  it("keeps the player grounded on the current elevated landing surface while idle", async () => {
    const character = await createTestCharacter({
      collisionTest: () => ({
        blocked: false,
        landingY: 2
      })
    });

    character.setPosition([0, 2, 0]);
    character.update(0.1);

    expect(character.getPosition()[1]).toBe(2);
  });
});
