import { describe, expect, it, vi } from "vitest";

import {
  createFoundationBuildZoneCameraFocusPose,
  createFoundationBuildZoneCameraFocusRuntime
} from "../app/runtime/camera/foundationBuildZoneCameraFocusRuntime.js";

const FOCUS_FLAG = "builderTutorialFoundationCameraFocusZoneSignature";

function createRuntime() {
  return createFoundationBuildZoneCameraFocusRuntime({
    durationMs: 3000,
    focusFlag: FOCUS_FLAG
  });
}

describe("createFoundationBuildZoneCameraFocusRuntime", () => {
  it("starts focus once and keeps the same zone active until expiry", () => {
    const flags = {};
    const startFocus = vi.fn(() => true);
    const runtime = createRuntime();

    expect(runtime.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus
    })).toBe(true);
    expect(runtime.update({
      now: 3999,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus
    })).toBe(true);

    expect(flags[FOCUS_FLAG]).toBe("zone-a");
    expect(startFocus).toHaveBeenCalledTimes(1);
  });

  it("does not restart a zone after its focus window expires", () => {
    const flags = {};
    const startFocus = vi.fn(() => true);
    const runtime = createRuntime();

    runtime.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus
    });

    expect(runtime.update({
      now: 4000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus
    })).toBe(false);
    expect(startFocus).toHaveBeenCalledTimes(1);
  });

  it("clears active focus when the mission or zone becomes unavailable", () => {
    const flags = {};
    const runtime = createRuntime();

    runtime.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus: () => true
    });

    expect(runtime.update({
      now: 1100,
      missionActive: false,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags
    })).toBe(false);
    expect(runtime.update({
      now: 1200,
      missionActive: true,
      zoneAvailable: false,
      zoneSignature: "zone-a",
      flags
    })).toBe(false);
  });

  it("does not consume the one-time flag when focus cannot start", () => {
    const flags = {};
    const runtime = createRuntime();

    expect(runtime.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus: () => false
    })).toBe(false);

    expect(flags).toEqual({});
  });

  it("runs post-start side effects after recording the focus window", () => {
    const calls = [];
    const flags = new Proxy({}, {
      set(target, key, value) {
        calls.push(`flag:${value}`);
        target[key] = value;
        return true;
      }
    });
    const runtime = createRuntime();

    runtime.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus: () => {
        calls.push("start");
        return true;
      },
      onFocusStarted: () => {
        calls.push("after");
      }
    });

    expect(calls).toEqual(["start", "flag:zone-a", "after"]);
    expect(runtime.update({
      now: 1001,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags,
      startFocus: () => false
    })).toBe(true);
  });

  it("keeps state independent between runtime instances", () => {
    const firstFlags = {};
    const secondFlags = {};
    const first = createRuntime();
    const second = createRuntime();

    first.update({
      now: 1000,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags: firstFlags,
      startFocus: () => true
    });

    expect(second.update({
      now: 1100,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: "zone-a",
      flags: secondFlags,
      startFocus: () => true
    })).toBe(true);
  });
});

describe("createFoundationBuildZoneCameraFocusPose", () => {
  it("creates the existing foundation camera focus pose from a zone center", () => {
    expect(createFoundationBuildZoneCameraFocusPose({
      position: [4, 0.03, 5],
      direction: [0, -0.5, -1]
    })).toEqual({
      target: [4, 1.45, 5],
      direction: [0, -0.5, -1],
      zoom: 6.4,
      distance: 15.5
    });
  });

  it("does not create a pose without a valid center position", () => {
    expect(createFoundationBuildZoneCameraFocusPose({ position: null })).toBe(null);
  });
});
