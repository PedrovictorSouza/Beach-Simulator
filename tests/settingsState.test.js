import { describe, expect, it } from "vitest";
import {
  SETTINGS_STORAGE_KEY,
  SETTINGS_GROUP_IDS,
  SETTINGS_SCHEMA,
  createDefaultSettingsState,
  loadSettingsState,
  saveSettingsState
} from "../app/settings/settingsState.js";

describe("settingsState", () => {
  it("defines expandable settings groups for camera, volume, language and accessibility", () => {
    expect(SETTINGS_GROUP_IDS).toEqual({
      CAMERA: "camera",
      VOLUME: "volume",
      LANGUAGE: "language",
      ACCESSIBILITY: "accessibility",
      CONTROLS: "controls"
    });
    expect(SETTINGS_SCHEMA.map((group) => group.id)).toEqual([
      "camera",
      "volume",
      "language",
      "accessibility"
    ]);
  });

  it("creates default settings state from the schema", () => {
    const state = createDefaultSettingsState();

    expect(state).toMatchObject({
      camera: {
        followStrength: 0.72,
        invertLookX: false,
        invertLookY: false
      },
      volume: {
        master: 0.8,
        music: 0.68,
        ambience: 0.42,
        sfx: 0.82
      },
      language: {
        locale: "en"
      },
      accessibility: {
        reduceMotion: false,
        highContrastHud: false,
        crtFilter: true,
        holdToConfirm: false
      },
      controls: {
        keyboard: {
          moveUp: "KeyW",
          moveLeft: "KeyA",
          moveDown: "KeyS",
          moveRight: "KeyD",
          primaryAction: "Enter",
          placeFreeBlock: "",
          interact: "KeyE",
          jump: "Space",
          run: "ShiftLeft",
          cameraZoomCycle: "KeyR",
          pause: "KeyP",
          pokedex: "Tab",
          bag: "KeyX",
          destroyAction: "KeyY",
          followerCall: "ArrowUp",
          previousMove: "ArrowLeft",
          nextMove: "ArrowRight"
        }
      }
    });
    expect(state.controls.schemaVersion).toBe(2);
    expect(state.controls.input.keyboard.primaryAction).toEqual([{
      type: "keyboard",
      code: "Enter"
    }]);
    expect(state.controls.input.gamepad).toMatchObject({
      layout: "auto",
      stickPreset: "leftMoveRightLook"
    });
    expect(state.controls.input.gamepad.bindings.primaryAction).toEqual([{
      type: "gamepadButton",
      button: 6
    }]);
  });

  it("returns a fresh mutable state object on every call", () => {
    const firstState = createDefaultSettingsState();
    const secondState = createDefaultSettingsState();

    firstState.volume.master = 0.1;

    expect(secondState.volume.master).toBe(0.8);
  });

  it("loads persisted settings onto the current schema defaults", () => {
    const storage = {
      getItem: (key) => key === SETTINGS_STORAGE_KEY ?
        JSON.stringify({
          volume: { master: 0.25 },
          accessibility: { reduceMotion: true },
          controls: { keyboard: { bag: "KeyZ" } },
          staleGroup: { old: true }
        }) :
        null
    };

    const state = loadSettingsState(storage);

    expect(state).toMatchObject({
      camera: {
        followStrength: 0.72,
        invertLookX: false,
        invertLookY: false
      },
      volume: {
        master: 0.25,
        music: 0.68,
        ambience: 0.42,
        sfx: 0.82
      },
      language: {
        locale: "en"
      },
      accessibility: {
        reduceMotion: true,
        highContrastHud: false,
        crtFilter: true,
        holdToConfirm: false
      },
      controls: {
        keyboard: {
          moveUp: "KeyW",
          moveLeft: "KeyA",
          moveDown: "KeyS",
          moveRight: "KeyD",
          primaryAction: "Enter",
          placeFreeBlock: "",
          interact: "KeyE",
          jump: "Space",
          run: "ShiftLeft",
          cameraZoomCycle: "KeyR",
          pause: "KeyP",
          pokedex: "Tab",
          bag: "KeyZ",
          destroyAction: "KeyY",
          followerCall: "ArrowUp",
          previousMove: "ArrowLeft",
          nextMove: "ArrowRight"
        }
      }
    });
    expect(state.controls.schemaVersion).toBe(2);
    expect(state.controls.input.keyboard.bag).toEqual([{
      type: "keyboard",
      code: "KeyZ"
    }]);
  });

  it("saves settings state to storage", () => {
    const writes = [];
    const storage = {
      setItem(key, value) {
        writes.push([key, JSON.parse(value)]);
      }
    };

    expect(saveSettingsState(storage, {
      volume: { master: 0.5 }
    })).toBe(true);
    expect(writes).toEqual([
      [
        SETTINGS_STORAGE_KEY,
        {
          version: 1,
          settings: {
            volume: { master: 0.5 }
          }
        }
      ]
    ]);
  });
});
