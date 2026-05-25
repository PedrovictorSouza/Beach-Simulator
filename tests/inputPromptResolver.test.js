import { describe, expect, it } from "vitest";
import { GAMEPAD_LAYOUT, INPUT_DEVICE } from "../input/inputModality.js";
import {
  resolveInitialHudGuide,
  resolveInputPrompt,
  resolveMovementPrompt,
  resolvePlacementPreviewPrompt,
  resolvePlacementReadyPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../app/ui/inputPromptResolver.js";

describe("input prompt resolver", () => {
  it("returns keyboard and mouse prompts by default", () => {
    expect(resolveInputPrompt(UI_PROMPT_ACTION.PLACE)).toBe("X / Enter Place");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.CANCEL)).toBe("Space Cancel");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.FIELD_TOOL)).toBe("Enter");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.RUN)).toBe("Shift Run");
    expect(resolvePlacementPreviewPrompt("Move House Kit preview")).toBe(
      "Move House Kit preview  X / Enter Place  Space Cancel"
    );
  });

  it("uses custom keyboard controls when resolving keyboard prompts", () => {
    const modalityState = {
      keyboardControls: {
        bag: "KeyZ",
        primaryAction: "KeyF",
        jump: "KeyC",
        run: "KeyV"
      }
    };

    expect(resolveInputPrompt(UI_PROMPT_ACTION.PLACE, modalityState)).toBe("Z / F Place");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.CANCEL, modalityState)).toBe("C Cancel");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.FIELD_TOOL, modalityState)).toBe("F");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.RUN, modalityState)).toBe("V Run");
  });

  it("returns Xbox style prompts for gamepad mode", () => {
    const modalityState = {
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.XBOX
    };

    expect(resolvePlacementReadyPrompt("House Kit ready", modalityState)).toBe(
      "House Kit ready  X Place"
    );
    expect(resolvePlacementPreviewPrompt("Move House Kit preview", modalityState)).toBe(
      "Move House Kit preview  X Place  B Cancel  LB/RB Rotate"
    );
    expect(resolveInputPrompt(UI_PROMPT_ACTION.RUN, modalityState)).toBe("B Run");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.FIELD_TOOL, modalityState)).toBe("LT");
    expect(resolveWorkbenchRotationPrompt(modalityState)).toBe("X Confirm  LB/RB Rotate  B Cancel");
  });

  it("swaps X/Y labels for Nintendo style gamepads", () => {
    const modalityState = {
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.NINTENDO
    };

    expect(resolveInputPrompt(UI_PROMPT_ACTION.PLACE, modalityState)).toBe("Y Place");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.OPEN_BAG, modalityState)).toBe("Y Bag");
    expect(resolveInputPrompt(UI_PROMPT_ACTION.INTERACT, modalityState)).toBe("A Interact");
    expect(resolvePlacementPreviewPrompt("Move Solar Station preview", modalityState)).toBe(
      "Move Solar Station preview  Y Place  B Cancel  L/R Rotate"
    );
  });

  it("returns a modality-aware initial HUD guide", () => {
    expect(resolveMovementPrompt()).toBe("Use W/A/S/D to move away.");
    expect(resolveMovementPrompt({
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.GENERIC
    })).toBe("Use the left stick to move away.");

    expect(resolveMovementPrompt({
      keyboardControls: {
        moveUp: "ArrowUp",
        moveLeft: "ArrowLeft",
        moveDown: "ArrowDown",
        moveRight: "ArrowRight"
      }
    })).toBe("Use Up/Left/Down/Right to move away.");

    expect(resolveInitialHudGuide()).toBe(
      "Use WASD to reach Chopper. He will point out the first repair."
    );
    expect(resolveInitialHudGuide({
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.GENERIC
    })).toBe(
      "Use the left stick to reach Chopper. He will point out the first repair."
    );
  });
});
