import { describe, expect, it } from "vitest";
import {
  assignInputBinding,
  createDefaultInputBindings,
  deriveLegacyKeyboardControls,
  GAMEPAD_STICK_PRESETS,
  INPUT_BINDING_TYPES,
  normalizeControlsState,
  normalizeInputBindings
} from "../input/inputActionBindings.js";
import {
  GAME_INPUT_ACTION_IDS,
  GAMEPAD_BUTTONS
} from "../input/gameInputBindings.js";

describe("input action bindings", () => {
  it("creates a multi-binding input contract from action defaults", () => {
    const bindings = createDefaultInputBindings();

    expect(bindings).toMatchObject({
      schemaVersion: 2,
      gamepad: {
        layout: "auto",
        stickPreset: GAMEPAD_STICK_PRESETS.LEFT_MOVE_RIGHT_LOOK
      }
    });
    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([{
      type: INPUT_BINDING_TYPES.KEYBOARD,
      code: "Enter"
    }]);
    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.RUN]).toEqual([
      { type: INPUT_BINDING_TYPES.KEYBOARD, code: "ShiftLeft" },
      { type: INPUT_BINDING_TYPES.KEYBOARD, code: "ShiftRight" }
    ]);
    expect(bindings.gamepad.bindings[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([{
      type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON,
      button: GAMEPAD_BUTTONS.LT
    }]);
  });

  it("normalizes legacy keyboard controls into the new contract", () => {
    const bindings = normalizeInputBindings(null, {
      primaryAction: "KeyF",
      bag: "KeyZ"
    });

    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([{
      type: INPUT_BINDING_TYPES.KEYBOARD,
      code: "KeyF"
    }]);
    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.BAG]).toEqual([{
      type: INPUT_BINDING_TYPES.KEYBOARD,
      code: "KeyZ"
    }]);
    expect(deriveLegacyKeyboardControls(bindings).primaryAction).toBe("KeyF");
  });

  it("removes conflicting keyboard bindings from the old action", () => {
    const bindings = assignInputBinding(createDefaultInputBindings(), {
      actionId: GAME_INPUT_ACTION_IDS.INTERACT,
      binding: {
        type: INPUT_BINDING_TYPES.KEYBOARD,
        code: "Enter"
      }
    });

    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.INTERACT]).toEqual([{
      type: INPUT_BINDING_TYPES.KEYBOARD,
      code: "Enter"
    }]);
    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([]);
  });

  it("supports multiple shortcuts for the same action", () => {
    const bindings = assignInputBinding(createDefaultInputBindings(), {
      actionId: GAME_INPUT_ACTION_IDS.PRIMARY_ACTION,
      append: true,
      binding: {
        type: INPUT_BINDING_TYPES.KEYBOARD,
        code: "KeyF"
      }
    });

    expect(bindings.keyboard[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([
      { type: INPUT_BINDING_TYPES.KEYBOARD, code: "Enter" },
      { type: INPUT_BINDING_TYPES.KEYBOARD, code: "KeyF" }
    ]);
  });

  it("normalizes gamepad bindings and stick swap preferences", () => {
    const controls = normalizeControlsState({
      input: {
        gamepad: {
          layout: "playstation",
          stickPreset: GAMEPAD_STICK_PRESETS.RIGHT_MOVE_LEFT_LOOK,
          bindings: {
            primaryAction: [
              { type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON, button: GAMEPAD_BUTTONS.A },
              { type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON, button: GAMEPAD_BUTTONS.LT }
            ]
          }
        }
      }
    });

    expect(controls.input.gamepad).toMatchObject({
      layout: "playstation",
      stickPreset: GAMEPAD_STICK_PRESETS.RIGHT_MOVE_LEFT_LOOK
    });
    expect(controls.input.gamepad.bindings[GAME_INPUT_ACTION_IDS.PRIMARY_ACTION]).toEqual([
      { type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON, button: GAMEPAD_BUTTONS.A },
      { type: INPUT_BINDING_TYPES.GAMEPAD_BUTTON, button: GAMEPAD_BUTTONS.LT }
    ]);
  });
});
