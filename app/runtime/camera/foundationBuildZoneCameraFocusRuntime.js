const FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_DURATION_MS = 3000;
const FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_ZOOM = 6.4;
const FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_DISTANCE = 15.5;
const FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_HEIGHT = 1.45;
const FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_FLAG = "builderTutorialFoundationCameraFocusZoneSignature";

export function createFoundationBuildZoneCameraFocusPose({
  position = null,
  direction = null
} = {}) {
  if (!Array.isArray(position)) {
    return null;
  }

  return {
    target: [
      position[0],
      FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_HEIGHT,
      position[2]
    ],
    direction,
    zoom: FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_ZOOM,
    distance: FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_DISTANCE
  };
}

export function createFoundationBuildZoneCameraFocusRuntime({
  durationMs = FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_DURATION_MS,
  focusFlag = FOUNDATION_BUILD_ZONE_CAMERA_FOCUS_FLAG,
  foundationBuildZoneRuntime = null,
  gameplay = null,
  controls = null,
  camera = null,
  cameraOrbit = null,
  getZoneSignature = () => null,
  createFocusPose = createFoundationBuildZoneCameraFocusPose,
  transitionDuration = 0.45
} = {}) {
  let focus = null;

  function isFoundationBuildMissionActive() {
    return Boolean(foundationBuildZoneRuntime?.shouldShow?.(
      gameplay?.getActiveQuest?.(controls?.storyState) || null,
      gameplay?.getActiveSystemQuest?.() || null
    ));
  }

  function update({
    now,
    missionActive,
    zoneAvailable,
    zoneSignature,
    flags = {},
    startFocus,
    onFocusStarted
  } = {}) {
    if (!missionActive || !zoneAvailable) {
      focus = null;
      return false;
    }

    const focusActive = focus?.zoneSignature === zoneSignature &&
      focus.until > now;

    if (focusActive) {
      return true;
    }

    if (flags[focusFlag] === zoneSignature) {
      focus = null;
      return false;
    }

    if (!startFocus?.()) {
      return false;
    }

    flags[focusFlag] = zoneSignature;
    focus = {
      zoneSignature,
      until: now + durationMs
    };
    onFocusStarted?.();
    return true;
  }

  function updateFrame({ now } = {}) {
    const missionActive = isFoundationBuildMissionActive();
    if (!missionActive) {
      return update({
        now,
        missionActive: false
      });
    }

    const buildZone = foundationBuildZoneRuntime?.getActiveBuildZone?.() || null;
    const zoneAvailable = Boolean(
      buildZone && !foundationBuildZoneRuntime?.isBuildZoneUnavailable?.()
    );
    if (!zoneAvailable) {
      return update({
        now,
        missionActive: true,
        zoneAvailable: false
      });
    }

    return update({
      now,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: getZoneSignature(buildZone),
      flags: controls?.storyState?.flags || {},
      startFocus: () => {
        const pose = createFocusPose({
          position: foundationBuildZoneRuntime?.getBuildZoneCenterPosition?.(buildZone),
          direction: cameraOrbit?.getDirection?.() || camera?.getPose?.()?.direction
        });
        if (!pose) {
          return false;
        }

        camera?.startPoseTransition?.(pose, { duration: transitionDuration });
        if (pose.direction) {
          cameraOrbit?.sync?.(pose.direction);
        }
        return true;
      },
      onFocusStarted: () => {
        controls?.clearPendingActions?.();
        controls?.clearMovementInput?.();
      }
    });
  }

  return {
    update,
    updateFrame
  };
}
