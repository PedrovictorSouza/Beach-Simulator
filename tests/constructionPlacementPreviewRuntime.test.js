import { describe, expect, it, vi } from "vitest";

import { createConstructionPlacementPreviewRuntime } from "../app/runtime/construction/constructionPlacementPreviewRuntime.js";

function createRuntime({
  storyFlags = {},
  solarBlocked = false,
  leafDenInsidePowerRadius = true
} = {}) {
  const session = {
    strawBedPlacementPreview: {
      active: true,
      position: [1, 0.02, 2],
      gridStep: 1,
      yaw: 0
    },
    strawBedModelInstance: {
      offset: [0, 0.02, 0],
      yaw: 0
    },
    greenhousePlacementPreview: {
      active: true,
      position: [3, 0.02, 4],
      gridStep: 1,
      yaw: 0,
      size: [2, 1]
    },
    greenhouseModelInstance: {
      offset: [0, 0.02, 0],
      yaw: 0
    },
    campfirePlacementPreview: {
      active: true,
      position: [5, 0.02, 6],
      gridStep: 1,
      yaw: 0,
      size: [2, 1]
    },
    campfireTrainHouseModelInstance: {
      offset: [0, 0.02, 0],
      yaw: 0
    },
    leafDenKitPlacementPreview: {
      active: true,
      position: [7, 0.02, 8],
      gridStep: 1,
      yaw: 0,
      size: [2, 2]
    },
    leafDenPlacementPreviewModelInstance: {
      offset: [0, 0.02, 0],
      yaw: 0
    }
  };
  const syncPlacementPreviewPositionToPlayer = vi.fn((preview) => preview);
  const validatePlacement = vi.fn(() => ({ valid: true, reason: null }));
  const evaluateSiteChoice = vi.fn(() => ({ id: "site-choice" }));
  const solarStationPlacementBlockerRuntime = {
    isBlocked: vi.fn(() => solarBlocked),
    getBlockers: vi.fn(() => [])
  };
  const solarStationPowerRadiusRuntime = {
    isInsidePowerRadius: vi.fn(() => leafDenInsidePowerRadius),
    getPowerPosition: vi.fn(() => [1, 0, 2]),
    getPowerRadius: vi.fn(() => 4)
  };
  const runtime = createConstructionPlacementPreviewRuntime({
    session,
    controls: {
      storyState: {
        flags: storyFlags
      }
    },
    solarStationPlacementBlockerRuntime,
    solarStationPowerRadiusRuntime,
    validatePlacement,
    evaluateSiteChoice,
    config: {
      solarStationGridFootprint: { width: 1, height: 1 },
      solarStationFollowDistance: 1.5,
      leafDenKitFallbackFootprint: [2, 2],
      leafDenKitGridFootprint: { width: 2, height: 2 },
      trainHouseFallbackFootprint: [2, 1],
      trainHouseGridFootprint: { width: 2, height: 1 },
      greenhouseFallbackFootprint: [2, 1],
      greenhouseGridFootprint: { width: 2, height: 1 },
      workbenchPosition: [0, 0, 0]
    },
    callbacks: {
      syncPlacementPreviewPositionToPlayer
    }
  });

  return {
    evaluateSiteChoice,
    runtime,
    session,
    solarStationPlacementBlockerRuntime,
    solarStationPowerRadiusRuntime,
    syncPlacementPreviewPositionToPlayer,
    validatePlacement
  };
}

describe("createConstructionPlacementPreviewRuntime", () => {
  it("updates Solar Station preview through placement blockers and follow distance", () => {
    const {
      runtime,
      session,
      solarStationPlacementBlockerRuntime,
      syncPlacementPreviewPositionToPlayer
    } = createRuntime();

    expect(runtime.updateSolarStation(2)).toBe(session.strawBedPlacementPreview);
    expect(syncPlacementPreviewPositionToPlayer).toHaveBeenCalledWith(
      session.strawBedPlacementPreview,
      1.5
    );
    expect(solarStationPlacementBlockerRuntime.isBlocked).toHaveBeenCalledTimes(1);
    expect(session.strawBedPlacementPreview.valid).toBe(true);
    expect(session.strawBedModelInstance.active).toBe(true);
  });

  it("keeps inactive Solar Station model visible after habitat placement flag", () => {
    const { runtime, session } = createRuntime({
      storyFlags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    });
    session.strawBedPlacementPreview.active = false;
    session.strawBedModelInstance.active = true;

    expect(runtime.updateSolarStation(2)).toBeNull();
    expect(session.strawBedModelInstance.active).toBe(true);
  });

  it("updates Leaf Den Kit preview with solar radius and site choice sources", () => {
    const {
      evaluateSiteChoice,
      runtime,
      session,
      solarStationPowerRadiusRuntime,
      validatePlacement
    } = createRuntime();

    expect(runtime.updateLeafDenKit(3)).toBe(session.leafDenKitPlacementPreview);
    expect(validatePlacement).toHaveBeenCalledTimes(1);
    expect(solarStationPowerRadiusRuntime.isInsidePowerRadius).toHaveBeenCalledWith([7, 0.02, 8]);
    expect(evaluateSiteChoice).toHaveBeenCalledWith(expect.objectContaining({
      requiresPower: true,
      solarStationPosition: [1, 0, 2],
      workbenchPosition: [0, 0, 0]
    }));
    expect(session.leafDenKitPlacementPreview.valid).toBe(true);
  });

  it("updates rectangular Campfire and Greenhouse previews with model state keys", () => {
    const { runtime, session, validatePlacement } = createRuntime();

    expect(runtime.updateCampfire(4)).toBe(session.campfirePlacementPreview);
    expect(runtime.updateGreenhouse(5)).toBe(session.greenhousePlacementPreview);

    expect(validatePlacement).toHaveBeenCalledTimes(2);
    expect(session.campfireTrainHouseModelInstance).toMatchObject({
      trainHouseGroundY: 0.02,
      trainHouseBaseScale: 1,
      trainHouseBaseYaw: 0,
      swayStrength: 0,
      active: true
    });
    expect(session.greenhouseModelInstance).toMatchObject({
      greenhouseGroundY: 0.02,
      greenhouseBaseScale: 1,
      greenhouseBaseYaw: 0,
      active: true
    });
  });
});
