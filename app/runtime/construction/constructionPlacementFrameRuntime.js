import { resolveWorkbenchPlacementPreviewVisual } from "../../gameplay/placementPreviewVisual.js";
import {
  getPlacementPreviewFootprintWorldSize,
  getRotatedPlacementSize,
  getSnappedPlacementPreviewPosition,
  hasFinitePlacementBounds
} from "./placementGeometry.js";

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncPlacementPreviewModelInstance({
  instance = null,
  snappedPosition = [0, 0.02, 0],
  preview = null,
  timeSeconds = 0,
  modelStateKeys = {},
  resetSwayStrength = false
} = {}) {
  if (!instance) {
    return null;
  }

  const previewVisual = resolveWorkbenchPlacementPreviewVisual({
    valid: preview?.valid,
    timeSeconds
  });
  const groundYKey = modelStateKeys.groundY || "placementGroundY";
  const baseScaleKey = modelStateKeys.baseScale || "placementBaseScale";
  const baseYawKey = modelStateKeys.baseYaw || "placementBaseYaw";
  const groundY = instance[groundYKey] ?? Number(instance.offset?.[1] ?? snappedPosition[1] ?? 0.02);
  const baseScale = instance[baseScaleKey] ?? Number(instance.scale || 1);
  const baseYaw = instance[baseYawKey] ?? Number(instance.yaw || 0);
  instance[groundYKey] = groundY;
  instance[baseScaleKey] = baseScale;
  instance[baseYawKey] = baseYaw;
  instance.offset = [
    snappedPosition[0],
    groundY,
    snappedPosition[2]
  ];
  instance.scale = baseScale;
  instance.yaw = baseYaw + Number(preview?.yaw || 0);
  if (resetSwayStrength) {
    instance.swayStrength = 0;
  }
  instance.alpha = previewVisual.alpha;
  instance.tint = previewVisual.tint;
  instance.tintStrength = previewVisual.tintStrength;
  instance.active = true;
  return instance;
}

export function syncPlacementPreviewPositionToPlayer({
  preview = null,
  playerPosition = null,
  getMovementAxes = () => null,
  defaultForwardDistance = 0
} = {}) {
  if (!preview?.active || !Array.isArray(playerPosition)) {
    return null;
  }
  const playerX = Number(playerPosition[0]);
  const playerZ = Number(playerPosition[2]);
  if (!Number.isFinite(playerX) || !Number.isFinite(playerZ)) {
    return null;
  }

  if (!Array.isArray(preview.followPlayerOffset)) {
    const position = Array.isArray(preview.position) ?
      preview.position :
      playerPosition;
    const positionX = Number(position[0]);
    const positionZ = Number(position[2]);
    const offset = [
      (Number.isFinite(positionX) ? positionX : playerX) - playerX,
      0,
      (Number.isFinite(positionZ) ? positionZ : playerZ) - playerZ
    ];
    const offsetLength = Math.hypot(offset[0], offset[2]);

    if (offsetLength < 0.35 && defaultForwardDistance > 0) {
      const movementAxes = getMovementAxes();
      const forwardX = Number(movementAxes?.up?.[0]) || 0;
      const forwardZ = Number(movementAxes?.up?.[2]) || 0;
      const forwardLength = Math.hypot(forwardX, forwardZ) || 1;
      offset[0] = (forwardX / forwardLength) * defaultForwardDistance;
      offset[2] = (forwardZ / forwardLength) * defaultForwardDistance;
    }

    preview.followPlayerOffset = offset;
  }

  const nextPosition = [
    playerX + Number(preview.followPlayerOffset[0] || 0),
    Array.isArray(preview.position) ? Number(preview.position[1] || 0.02) : 0.02,
    playerZ + Number(preview.followPlayerOffset[2] || 0)
  ];

  if (hasFinitePlacementBounds(preview.bounds)) {
    nextPosition[0] = clampNumber(nextPosition[0], preview.bounds.minX, preview.bounds.maxX);
    nextPosition[2] = clampNumber(nextPosition[2], preview.bounds.minZ, preview.bounds.maxZ);
  }

  preview.position = nextPosition;
  return preview;
}

export function updateRectangularConstructionPlacementPreview({
  preview = null,
  instance = null,
  timeSeconds = 0,
  fallbackFootprint = [1, 1],
  gridFootprint = { width: 1, height: 1 },
  getBlockers = () => [],
  validatePlacement = () => ({ valid: true, reason: null }),
  syncPlacementPreview = () => {},
  modelStateKeys = {},
  shouldHideInactiveInstance = () => Boolean(instance),
  resetSwayStrength = false
} = {}) {
  if (!preview?.active) {
    if (instance && shouldHideInactiveInstance()) {
      instance.active = false;
    }
    return null;
  }

  syncPlacementPreview(preview);

  const snappedPosition = getSnappedPlacementPreviewPosition(preview);
  const previewCollisionSize = getPlacementPreviewFootprintWorldSize(
    preview,
    gridFootprint
  );
  const blockers = getBlockers();
  const validation = validatePlacement({
    position: snappedPosition,
    size: previewCollisionSize,
    blockers
  });

  preview.snappedPosition = snappedPosition;
  preview.effectiveSize = getRotatedPlacementSize(
    Array.isArray(preview.size) ?
      preview.size :
      fallbackFootprint,
    preview.yaw
  );
  preview.valid = validation.valid;
  preview.invalidReason = validation.valid ? null : validation.reason;
  preview.readyForConfirm = true;

  syncPlacementPreviewModelInstance({
    instance,
    snappedPosition,
    preview,
    timeSeconds,
    modelStateKeys,
    resetSwayStrength
  });

  return preview;
}

export function updateLeafDenKitConstructionPlacementPreview({
  preview = null,
  instance = null,
  timeSeconds = 0,
  fallbackFootprint = [1, 1],
  gridFootprint = { width: 1, height: 1 },
  getBlockers = () => [],
  validatePlacement = () => ({ valid: true, reason: null }),
  syncPlacementPreview = () => {},
  isInsidePowerRadius = () => true,
  evaluateSiteChoice = () => null,
  getSolarStationPowerPosition = () => null,
  workbenchPosition = null,
  getSolarStationPowerRadius = () => 0
} = {}) {
  if (!preview?.active) {
    return null;
  }

  syncPlacementPreview(preview);

  const snappedPosition = getSnappedPlacementPreviewPosition(preview);
  const previewCollisionSize = getPlacementPreviewFootprintWorldSize(
    preview,
    gridFootprint
  );
  const blockers = getBlockers();
  const validation = validatePlacement({
    position: snappedPosition,
    size: previewCollisionSize,
    blockers
  });
  const insidePowerRadius = validation.valid ?
    isInsidePowerRadius(snappedPosition) :
    false;

  preview.snappedPosition = snappedPosition;
  preview.effectiveSize = getRotatedPlacementSize(
    Array.isArray(preview.size) ?
      preview.size :
      fallbackFootprint,
    preview.yaw
  );
  preview.valid = validation.valid && insidePowerRadius;
  preview.invalidReason = preview.valid ?
    null :
    validation.valid ? "outside-solar-station-radius" : validation.reason;
  preview.siteChoice = evaluateSiteChoice({
    position: snappedPosition,
    footprint: previewCollisionSize,
    blockers,
    groundState: validation.valid || validation.reason !== "invalid-terrain" ? "stable" : "dry",
    requiresPower: true,
    solarStationPosition: getSolarStationPowerPosition(),
    workbenchPosition,
    thresholds: {
      solarStationRadius: getSolarStationPowerRadius()
    }
  });
  preview.readyForConfirm = true;

  syncPlacementPreviewModelInstance({
    instance,
    snappedPosition,
    preview,
    timeSeconds,
    modelStateKeys: {
      groundY: "leafDenGroundY",
      baseScale: "leafDenBaseScale",
      baseYaw: "leafDenBaseYaw"
    }
  });

  return preview;
}

export function resolveActiveConstructionPlacementPreviews({
  session = {},
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null
} = {}) {
  return {
    solarStationPlacementPreview: session.strawBedPlacementPreview?.active ?
      solarStationPlacementPreview :
      null,
    greenhousePlacementPreview: session.greenhousePlacementPreview?.active ?
      greenhousePlacementPreview :
      null,
    campfirePlacementPreview: session.campfirePlacementPreview?.active ?
      campfirePlacementPreview :
      null,
    leafDenKitPlacementPreview: session.leafDenKitPlacementPreview?.active ?
      leafDenKitPlacementPreview :
      null
  };
}

export function createConstructionPlacementFrameRuntime({
  controls,
  getMovementAxes = () => null,
  getPlayerPosition = () => session?.playerCharacter?.getPosition?.() || null,
  session,
  placementContracts = [],
  workbenchRotationRuntime,
  callbacks = {}
} = {}) {
  const {
    rotateActivePlacementPreview = () => null,
    rotateNearbyWorkbenchConstruction = () => {},
    hasActivePlacementPreview = () => false,
    hasPendingWorkbenchPlacementIntent = () => false,
    clearWorkbenchConstructionRotationSelection = () => {},
    cancelActivePlacementPreviews = () => {},
    cancelPendingWorkbenchPlacementIntentWithNotice = () => {},
    isBuildBlockFieldMoveEquipped = () => false,
    startTimburrBuildBlockAction = () => null,
    playCancelSound = () => {},
    pushNotice = () => {},
    getFreeBlockInvalidPlacementNotice = () => "",
    updateSolarStationPlacementPreview = () => null,
    updateGreenhousePlacementPreview = () => null,
    updateCampfirePlacementPreview = () => null,
    updateLeafDenKitPlacementPreview = () => null,
    updateSolarStationSpawnEffect = () => {},
    syncSolarStationWorkbenchRotationVisual = () => {},
    syncFreeBlockBuildPreview = () => null,
    updateBuildBlockDebugOverlay = () => {}
  } = callbacks;

  function updatePlacementControlsAndPreviews({
    now = 0,
    deltaTime = 0,
    movementBlocked = false
  } = {}) {
    const nowSeconds = now * 0.001;
    const placementRotationRequest = controls?.consumePlacementRotationRequest?.() || 0;
    if (placementRotationRequest) {
      const rotatedPreview = rotateActivePlacementPreview(placementRotationRequest);
      if (!rotatedPreview) {
        rotateNearbyWorkbenchConstruction(placementRotationRequest);
      }
    }

    const shouldConsumePlacementCancel = Boolean(
      workbenchRotationRuntime?.getSelection?.() ||
      hasActivePlacementPreview(session, placementContracts) ||
      hasPendingWorkbenchPlacementIntent(session)
    );
    let placementCancelRequested = false;
    if (shouldConsumePlacementCancel) {
      placementCancelRequested = typeof controls?.consumePlacementCancelRequest === "function" ?
        controls.consumePlacementCancelRequest() :
        controls?.consumeJumpRequest?.() || false;
    }

    if (
      placementCancelRequested &&
      workbenchRotationRuntime?.getSelection?.()
    ) {
      clearWorkbenchConstructionRotationSelection();
    } else if (
      placementCancelRequested &&
      hasActivePlacementPreview(session, placementContracts)
    ) {
      cancelActivePlacementPreviews();
    } else if (placementCancelRequested) {
      cancelPendingWorkbenchPlacementIntentWithNotice();
    }

    if (!shouldConsumePlacementCancel && (movementBlocked || !session?.playerCharacter)) {
      controls?.consumeFreeBlockBuildRequest?.();
      controls?.consumeJumpRequest?.();
    }

    if (
      !shouldConsumePlacementCancel &&
      !movementBlocked &&
      session?.playerCharacter &&
      controls?.consumeFreeBlockBuildRequest?.()
    ) {
      if (isBuildBlockFieldMoveEquipped()) {
        const buildRequestResult = startTimburrBuildBlockAction({
          playerPosition: session.playerCharacter.getPosition()
        });
        if (buildRequestResult === "invalid") {
          playCancelSound();
          pushNotice(getFreeBlockInvalidPlacementNotice(
            session.lastTimburrBuildBlockInvalidReason
          ));
        } else if (buildRequestResult === "missing-material") {
          playCancelSound();
          pushNotice("Need Wood");
        }
      } else {
        playCancelSound();
      }
    }

    const solarStationPlacementPreview = updateSolarStationPlacementPreview(nowSeconds);
    const greenhousePlacementPreview = updateGreenhousePlacementPreview(nowSeconds);
    const campfirePlacementPreview = updateCampfirePlacementPreview(nowSeconds);
    const leafDenKitPlacementPreview = updateLeafDenKitPlacementPreview(nowSeconds);
    updateSolarStationSpawnEffect(session?.strawBedModelInstance, deltaTime);
    syncSolarStationWorkbenchRotationVisual(nowSeconds);

    return {
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    };
  }

  function updateFreeBlockPreview({
    now = 0,
    buildBlockEquipped = false,
    cinematicActive = false,
    gameplayOpeningMovementLocked = false,
    foundationBuildZoneCameraFocusActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    skillLearnActive = false,
    scriptedInteractionActive = false,
    dialogueActive = false
  } = {}) {
    const freeBlockPreviewTarget = syncFreeBlockBuildPreview({
      active: Boolean(
        buildBlockEquipped &&
        session?.playerCharacter &&
        !cinematicActive &&
        !gameplayOpeningMovementLocked &&
        !foundationBuildZoneCameraFocusActive &&
        !tutorialActive &&
        !pokedexModalOpen &&
        !skillLearnActive &&
        !scriptedInteractionActive &&
        !dialogueActive
      ),
      playerPosition: session?.playerCharacter?.getPosition?.(),
      nowSeconds: now * 0.001
    });
    updateBuildBlockDebugOverlay(freeBlockPreviewTarget?.debug || null);

    return { freeBlockPreviewTarget };
  }

  function syncPlacementPreviewToPlayer(preview, defaultForwardDistance = 0) {
    return syncPlacementPreviewPositionToPlayer({
      preview,
      playerPosition: getPlayerPosition(),
      getMovementAxes,
      defaultForwardDistance
    });
  }

  return {
    syncPlacementPreviewPositionToPlayer: syncPlacementPreviewToPlayer,
    updatePlacementControlsAndPreviews,
    updateFreeBlockPreview
  };
}
