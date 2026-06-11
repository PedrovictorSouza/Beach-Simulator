const DEFAULT_CONFIG = Object.freeze({
  start: [0, 0.02, 0],
  speed: 1,
  waypointDistance: 0.08,
  rampColliderId: "workbench-ramp-collider",
  rampApproachMargin: 0,
  sideApproachMargin: 0,
  modelFaceYawOffset: 0
});

function defaultGetYawToward() {
  return 0;
}

export function createBulbasaurWorkbenchGuideRuntime({
  session = {},
  controls = {},
  workbenchPosition = [0, 0.02, 0],
  getYawToward = defaultGetYawToward,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function getRampCollider() {
    return (session.elevatedTerrainColliders || [])
      .find((collider) => collider?.id === settings.rampColliderId) || null;
  }

  function getPath() {
    const rampCollider = getRampCollider();

    if (!rampCollider?.position || !rampCollider?.size) {
      return [[...workbenchPosition]];
    }

    const padding = rampCollider.padding ?? 0;
    const halfX = (rampCollider.size[0] || 0) * 0.5 + padding;
    const halfZ = (rampCollider.size[2] || 0) * 0.5 + padding;
    const groundY = workbenchPosition[1];
    const approachX =
      rampCollider.position[0] - halfX - settings.sideApproachMargin;
    const approachZ =
      rampCollider.position[2] - halfZ - settings.rampApproachMargin;

    return [
      [approachX, groundY, approachZ],
      [rampCollider.position[0], groundY, approachZ]
    ];
  }

  function isActive() {
    const flags = controls.storyState?.flags || {};
    return Boolean(
      flags.bulbasaurWorkbenchGuideAvailable &&
      !flags.workbenchDiyRecipesReceived &&
      session.bulbasaurEncounter
    );
  }

  function advance(deltaTime, encounter) {
    if (!encounter) {
      return;
    }

    const path = getPath();
    const waypointIndex = Math.min(
      Math.max(0, encounter.workbenchGuideWaypointIndex || 0),
      path.length - 1
    );
    const currentPosition =
      encounter.position ||
      encounter.landingPosition ||
      settings.start;
    const targetPosition = path[waypointIndex];
    const deltaX = targetPosition[0] - currentPosition[0];
    const deltaZ = targetPosition[2] - currentPosition[2];
    const distance = Math.hypot(deltaX, deltaZ);
    const step = settings.speed * deltaTime;

    encounter.visible = true;
    encounter.jumpTimer = 0;
    encounter.originPosition = null;
    encounter.landingPosition = null;

    if (distance <= step || distance <= settings.waypointDistance) {
      encounter.position = [...targetPosition];
      if (waypointIndex < path.length - 1) {
        encounter.workbenchGuideWaypointIndex = waypointIndex + 1;
      }
    } else {
      const progress = step / distance;
      encounter.position = [
        currentPosition[0] + deltaX * progress,
        currentPosition[1] + (targetPosition[1] - currentPosition[1]) * progress,
        currentPosition[2] + deltaZ * progress
      ];
      encounter.workbenchGuideWaypointIndex = waypointIndex;
    }

    if (encounter.modelInstance && distance > 0.001) {
      encounter.modelInstance.yaw = getYawToward(
        currentPosition,
        targetPosition,
        settings.modelFaceYawOffset
      );
    }
  }

  return {
    advance,
    getPath,
    isActive
  };
}
