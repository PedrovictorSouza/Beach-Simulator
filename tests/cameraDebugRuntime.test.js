import { afterEach, describe, expect, it, vi } from "vitest";

import { createCameraDebugRuntime } from "../app/runtime/camera/cameraDebugRuntime.js";

const previousDocument = globalThis.document;

afterEach(() => {
  globalThis.document = previousDocument;
});

describe("createCameraDebugRuntime", () => {
  it("does not attach listeners or access document while disabled", () => {
    const globalObject = {
      addEventListener: vi.fn()
    };
    const readFrameState = vi.fn();
    const createFrameState = vi.fn();
    const runtime = createCameraDebugRuntime({
      enabled: false,
      mount: { append: vi.fn() },
      readFrameState,
      createFrameState
    });

    runtime.attachGlobalListeners(globalObject);
    runtime.update({ frame: 100 });
    runtime.updateFrameOverlay({ now: 100 });

    expect(globalObject.addEventListener).not.toHaveBeenCalled();
    expect(readFrameState).not.toHaveBeenCalled();
    expect(createFrameState).not.toHaveBeenCalled();
  });

  it("keeps only the four latest global errors", () => {
    const listeners = {};
    const element = { style: {} };
    const mount = { append: vi.fn() };
    globalThis.document = {
      createElement: vi.fn(() => element)
    };
    const runtime = createCameraDebugRuntime({
      enabled: true,
      mount,
      performanceNow: () => 123.6
    });

    runtime.attachGlobalListeners({
      addEventListener: (type, listener) => {
        listeners[type] = listener;
      }
    });
    listeners.error({ message: "one" });
    listeners.error({ message: "two" });
    listeners.error({ message: "three" });
    listeners.error({ message: "four" });
    listeners.unhandledrejection({ reason: new Error("five") });
    runtime.update({ frame: 200 });

    expect(mount.append).toHaveBeenCalledOnce();
    expect(JSON.parse(element.textContent)).toEqual({
      frame: 200,
      errors: [
        { at: 124, message: "two" },
        { at: 124, message: "three" },
        { at: 124, message: "four" },
        { at: 124, message: "five" }
      ]
    });
  });

  it("reuses the overlay element across updates", () => {
    const element = { style: {} };
    const mount = { append: vi.fn() };
    globalThis.document = {
      createElement: vi.fn(() => element)
    };
    const runtime = createCameraDebugRuntime({
      enabled: true,
      mount
    });

    runtime.update({ frame: 100 });
    runtime.update({ frame: 200 });

    expect(globalThis.document.createElement).toHaveBeenCalledOnce();
    expect(mount.append).toHaveBeenCalledOnce();
    expect(JSON.parse(element.textContent)).toMatchObject({
      frame: 200,
      errors: []
    });
  });

  it("builds and renders the camera frame overlay from runtime sources", () => {
    const element = { style: {} };
    const mount = { append: vi.fn() };
    const readFrameState = vi.fn(({ now }) => ({
      paused: false,
      gameplayCameraState: { mode: "follow" },
      cameraPose: { target: [1, 0, 2] },
      systemQuestId: "system-quest",
      uiQuestId: "ui-quest",
      playerPosition: [3, 0, 4],
      shipVisible: true,
      shipPosition: [5, 0, 6],
      echoedNow: now
    }));
    const createFrameState = vi.fn((state) => ({
      frame: Math.round(state.now),
      camera: state.gameplayCameraState,
      player: state.playerPosition,
      echoedNow: state.echoedNow
    }));
    globalThis.document = {
      createElement: vi.fn(() => element)
    };
    const runtime = createCameraDebugRuntime({
      enabled: true,
      mount,
      readFrameState,
      createFrameState
    });
    const frameState = {
      now: 12.6,
      flowState: { gameplayActive: true },
      movementBlocked: true,
      gameplayOpeningMovementLocked: false,
      cameraTransitionActive: true
    };

    runtime.updateFrameOverlay(frameState);

    expect(readFrameState).toHaveBeenCalledWith(frameState);
    expect(createFrameState).toHaveBeenCalledWith({
      ...frameState,
      paused: false,
      gameplayCameraState: { mode: "follow" },
      cameraPose: { target: [1, 0, 2] },
      systemQuestId: "system-quest",
      uiQuestId: "ui-quest",
      playerPosition: [3, 0, 4],
      shipVisible: true,
      shipPosition: [5, 0, 6],
      echoedNow: 12.6
    });
    expect(JSON.parse(element.textContent)).toEqual({
      frame: 13,
      camera: { mode: "follow" },
      player: [3, 0, 4],
      echoedNow: 12.6,
      errors: []
    });
  });
});
