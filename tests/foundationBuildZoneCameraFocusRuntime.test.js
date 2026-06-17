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
  function createFrameRuntime({
    shouldShow = vi.fn(() => true),
    activeBuildZone = { id: "zone-a" },
    buildZoneUnavailable = false,
    centerPosition = [4, 0.03, 5],
    orbitDirection = [0, -0.5, -1],
    cameraDirection = [1, -0.25, 0],
    createFocusPose = vi.fn(({ position, direction }) => ({
      target: [position[0], 1.45, position[2]],
      direction,
      zoom: 6.4,
      distance: 15.5
    }))
  } = {}) {
    const activeQuest = { id: "active-quest" };
    const activeSystemQuest = { id: "active-system-quest" };
    const storyState = { flags: {} };
    const foundationBuildZoneRuntime = {
      shouldShow,
      getActiveBuildZone: vi.fn(() => activeBuildZone),
      isBuildZoneUnavailable: vi.fn(() => buildZoneUnavailable),
      getBuildZoneCenterPosition: vi.fn(() => centerPosition)
    };
    const gameplay = {
      getActiveQuest: vi.fn(() => activeQuest),
      getActiveSystemQuest: vi.fn(() => activeSystemQuest)
    };
    const controls = {
      storyState,
      clearPendingActions: vi.fn(),
      clearMovementInput: vi.fn()
    };
    const camera = {
      getPose: vi.fn(() => ({ direction: cameraDirection })),
      startPoseTransition: vi.fn()
    };
    const cameraOrbit = {
      getDirection: vi.fn(() => orbitDirection),
      sync: vi.fn()
    };
    const getZoneSignature = vi.fn(() => "zone-a");
    const runtime = createFoundationBuildZoneCameraFocusRuntime({
      durationMs: 3000,
      focusFlag: FOCUS_FLAG,
      foundationBuildZoneRuntime,
      gameplay,
      controls,
      camera,
      cameraOrbit,
      getZoneSignature,
      createFocusPose
    });

    return {
      activeQuest,
      activeSystemQuest,
      camera,
      cameraOrbit,
      controls,
      createFocusPose,
      foundationBuildZoneRuntime,
      gameplay,
      getZoneSignature,
      runtime
    };
  }

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

  it("updates the frame-level foundation build zone focus through runtime dependencies", () => {
    const {
      activeQuest,
      activeSystemQuest,
      camera,
      cameraOrbit,
      controls,
      createFocusPose,
      foundationBuildZoneRuntime,
      gameplay,
      getZoneSignature,
      runtime
    } = createFrameRuntime();

    expect(runtime.updateFrame({ now: 1000 })).toBe(true);

    expect(gameplay.getActiveQuest).toHaveBeenCalledWith(controls.storyState);
    expect(gameplay.getActiveSystemQuest).toHaveBeenCalled();
    expect(foundationBuildZoneRuntime.shouldShow)
      .toHaveBeenCalledWith(activeQuest, activeSystemQuest);
    expect(foundationBuildZoneRuntime.getActiveBuildZone).toHaveBeenCalled();
    expect(foundationBuildZoneRuntime.isBuildZoneUnavailable).toHaveBeenCalled();
    expect(getZoneSignature).toHaveBeenCalledWith({ id: "zone-a" });
    expect(createFocusPose).toHaveBeenCalledWith({
      position: [4, 0.03, 5],
      direction: [0, -0.5, -1]
    });
    expect(camera.startPoseTransition).toHaveBeenCalledWith({
      target: [4, 1.45, 5],
      direction: [0, -0.5, -1],
      zoom: 6.4,
      distance: 15.5
    }, { duration: 0.45 });
    expect(cameraOrbit.sync).toHaveBeenCalledWith([0, -0.5, -1]);
    expect(controls.clearPendingActions).toHaveBeenCalled();
    expect(controls.clearMovementInput).toHaveBeenCalled();
    expect(controls.storyState.flags[FOCUS_FLAG]).toBe("zone-a");
  });

  it("does not inspect build zones when the foundation build mission is inactive", () => {
    const { camera, foundationBuildZoneRuntime, runtime } = createFrameRuntime({
      shouldShow: vi.fn(() => false)
    });

    expect(runtime.updateFrame({ now: 1000 })).toBe(false);

    expect(foundationBuildZoneRuntime.getActiveBuildZone).not.toHaveBeenCalled();
    expect(camera.startPoseTransition).not.toHaveBeenCalled();
  });

  it("does not start a camera transition when the active build zone is unavailable", () => {
    const { camera, controls, runtime } = createFrameRuntime({
      buildZoneUnavailable: true
    });

    expect(runtime.updateFrame({ now: 1000 })).toBe(false);

    expect(camera.startPoseTransition).not.toHaveBeenCalled();
    expect(controls.clearPendingActions).not.toHaveBeenCalled();
    expect(controls.clearMovementInput).not.toHaveBeenCalled();
  });

  it("falls back to the camera pose direction when the orbit direction is unavailable", () => {
    const { camera, cameraOrbit, createFocusPose, runtime } = createFrameRuntime({
      orbitDirection: null,
      cameraDirection: [1, -0.25, 0]
    });

    expect(runtime.updateFrame({ now: 1000 })).toBe(true);

    expect(createFocusPose).toHaveBeenCalledWith({
      position: [4, 0.03, 5],
      direction: [1, -0.25, 0]
    });
    expect(cameraOrbit.sync).toHaveBeenCalledWith([1, -0.25, 0]);
    expect(camera.getPose).toHaveBeenCalled();
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
