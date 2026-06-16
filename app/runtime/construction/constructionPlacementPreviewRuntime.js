import {
  updateLeafDenKitConstructionPlacementPreview,
  updateRectangularConstructionPlacementPreview,
  updateSolarStationConstructionPlacementPreview
} from "./constructionPlacementFrameRuntime.js";

export function createConstructionPlacementPreviewRuntime({
  session = {},
  controls = {},
  solarStationPlacementBlockerRuntime = null,
  solarStationPowerRadiusRuntime = null,
  validatePlacement = () => ({ valid: true, reason: null }),
  evaluateSiteChoice = () => null,
  config = {},
  callbacks = {}
} = {}) {
  const syncPlacementPreview = callbacks.syncPlacementPreviewPositionToPlayer || (() => null);

  function updateSolarStation(timeSeconds = 0) {
    return updateSolarStationConstructionPlacementPreview({
      preview: session.strawBedPlacementPreview,
      instance: session.strawBedModelInstance,
      timeSeconds,
      gridFootprint: config.solarStationGridFootprint,
      syncPlacementPreview: (preview) =>
        syncPlacementPreview(preview, config.solarStationFollowDistance),
      isPlacementBlocked: (previewRect) =>
        solarStationPlacementBlockerRuntime?.isBlocked?.(previewRect),
      shouldHideInactiveInstance: () =>
        !controls.storyState?.flags?.strawBedPlacedInBulbasaurHabitat
    });
  }

  function updateLeafDenKit(timeSeconds = 0) {
    return updateLeafDenKitConstructionPlacementPreview({
      preview: session.leafDenKitPlacementPreview,
      instance: session.leafDenPlacementPreviewModelInstance,
      timeSeconds,
      fallbackFootprint: config.leafDenKitFallbackFootprint,
      gridFootprint: config.leafDenKitGridFootprint,
      getBlockers: () => solarStationPlacementBlockerRuntime?.getBlockers?.() || [],
      validatePlacement,
      syncPlacementPreview,
      isInsidePowerRadius: (position) =>
        Boolean(solarStationPowerRadiusRuntime?.isInsidePowerRadius?.(position)),
      evaluateSiteChoice,
      getSolarStationPowerPosition: () =>
        solarStationPowerRadiusRuntime?.getPowerPosition?.() || null,
      workbenchPosition: config.workbenchPosition,
      getSolarStationPowerRadius: () =>
        solarStationPowerRadiusRuntime?.getPowerRadius?.() || 0
    });
  }

  function updateCampfire(timeSeconds = 0) {
    return updateRectangularConstructionPlacementPreview({
      preview: session.campfirePlacementPreview,
      instance: session.campfireTrainHouseModelInstance,
      timeSeconds,
      fallbackFootprint: config.trainHouseFallbackFootprint,
      gridFootprint: config.trainHouseGridFootprint,
      getBlockers: () => solarStationPlacementBlockerRuntime?.getBlockers?.() || [],
      validatePlacement,
      syncPlacementPreview,
      modelStateKeys: {
        groundY: "trainHouseGroundY",
        baseScale: "trainHouseBaseScale",
        baseYaw: "trainHouseBaseYaw"
      },
      shouldHideInactiveInstance: () => !controls.storyState?.flags?.campfireSpatOut,
      resetSwayStrength: true
    });
  }

  function updateGreenhouse(timeSeconds = 0) {
    return updateRectangularConstructionPlacementPreview({
      preview: session.greenhousePlacementPreview,
      instance: session.greenhouseModelInstance,
      timeSeconds,
      fallbackFootprint: config.greenhouseFallbackFootprint,
      gridFootprint: config.greenhouseGridFootprint,
      getBlockers: () => solarStationPlacementBlockerRuntime?.getBlockers?.() || [],
      validatePlacement,
      syncPlacementPreview,
      modelStateKeys: {
        groundY: "greenhouseGroundY",
        baseScale: "greenhouseBaseScale",
        baseYaw: "greenhouseBaseYaw"
      }
    });
  }

  return {
    updateCampfire,
    updateGreenhouse,
    updateLeafDenKit,
    updateSolarStation
  };
}
