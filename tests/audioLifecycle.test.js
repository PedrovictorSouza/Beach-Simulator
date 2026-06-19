import { describe, expect, it, vi } from "vitest";
import { registerAudioLifecycleStop } from "../app/bootstrap/audioLifecycle.js";
import { createMusicRuntime } from "../app/runtime/musicRuntime.js";

describe("audio lifecycle", () => {
  it("stops audio when the page is hidden or exits", () => {
    const listeners = new Map();
    const windowRef = {
      addEventListener: vi.fn((eventName, handler) => {
        listeners.set(eventName, handler);
      }),
      removeEventListener: vi.fn()
    };
    const documentRef = {
      hidden: false,
      addEventListener: vi.fn((eventName, handler) => {
        listeners.set(eventName, handler);
      }),
      removeEventListener: vi.fn()
    };
    const stopAudio = vi.fn();

    const detach = registerAudioLifecycleStop({
      windowRef,
      documentRef,
      stopAudio
    });

    listeners.get("pagehide")();
    expect(stopAudio).toHaveBeenCalledTimes(1);

    documentRef.hidden = false;
    listeners.get("visibilitychange")();
    expect(stopAudio).toHaveBeenCalledTimes(1);

    documentRef.hidden = true;
    listeners.get("visibilitychange")();
    expect(stopAudio).toHaveBeenCalledTimes(2);

    detach();
    expect(windowRef.removeEventListener).toHaveBeenCalledWith("pagehide", expect.any(Function));
    expect(windowRef.removeEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    expect(documentRef.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
  });

  it("does not auto-resume background music after a lifecycle stop", () => {
    const audio = {
      loop: false,
      volume: 0,
      currentTime: 0,
      pause: vi.fn(),
      play: vi.fn(() => Promise.resolve())
    };
    const audioFactory = vi.fn(() => audio);
    const music = createMusicRuntime({
      audioFactory,
      initialVolume: 0.5,
      random: () => 0
    });

    expect(music.playRandomSoundtrack({ restart: true }).played).toBe(true);
    expect(audio.play).toHaveBeenCalledTimes(1);

    music.stop(null, { disableResume: true });
    music.update(1, { nowSeconds: 10 });

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.play).toHaveBeenCalledTimes(1);
  });
});
