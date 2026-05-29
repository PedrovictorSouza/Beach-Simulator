export const GAMEPLAY_OPENING_SHIP_EVENTS = Object.freeze({
  FALL_STARTED: "gameplay-opening-ship:fall-started",
  IMPACT: "gameplay-opening-ship:impact",
  SETTLED: "gameplay-opening-ship:settled"
});

const SHIP_MODEL_SCALE = 3;
const SHIP_COLLIDER_RADIUS = 2.8;

const LANDED_MODEL_POSE = Object.freeze({
  yaw: -0.52,
  pitch: 0.05,
  roll: -0.68
});

const AIRBORNE_MODEL_POSE = Object.freeze({
  yaw: -0.58,
  pitch: 0.34,
  roll: -0.52
});

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function lerpVector(from, to, amount) {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount
  ];
}

function createEventState() {
  return {
    fallStarted: false,
    impact: false,
    settled: false
  };
}

function hideShip(ship) {
  ship.visible = false;
  ship.phase = "waiting";
  ship.position = null;
  ship.size = null;
  ship.dust = [];
  ship.flash = null;
  ship.smoke = [];
  ship.destructionProgress = 0;
  ship.events = [];

  if (ship.modelInstance) {
    ship.modelInstance.active = false;
  }
}

function syncModelInstance(ship) {
  const modelInstance = ship?.modelInstance || null;

  if (!modelInstance) {
    return null;
  }

  const visible = Boolean(ship.visible && Array.isArray(ship.position));
  modelInstance.active = visible;

  if (!visible) {
    modelInstance.offset = [0, -999, 0];
    return modelInstance;
  }

  const pose = ship.position[1] > 0.45 ? AIRBORNE_MODEL_POSE : LANDED_MODEL_POSE;

  modelInstance.offset = [...ship.position];
  modelInstance.scale = SHIP_MODEL_SCALE;
  modelInstance.yaw = pose.yaw;
  modelInstance.pitch = pose.pitch;
  modelInstance.roll = pose.roll;

  return modelInstance;
}
export function createGameplayOpeningShipState({ model = null } = {}) {
  return {
    visible: false,
    phase: "waiting",
    position: null,
    size: null,
    dust: [],
    flash: null,
    smoke: [],
    destructionProgress: 0,
    events: [],
    eventState: createEventState(),
    model,
    modelInstance: {
      offset: [0, -999, 0],
      scale: SHIP_MODEL_SCALE,
      yaw: LANDED_MODEL_POSE.yaw,
      pitch: LANDED_MODEL_POSE.pitch,
      roll: LANDED_MODEL_POSE.roll,
      active: false
    }
  };
}

export function updateGameplayOpeningShipFall(ship, {
  elapsed,
  shipStartTime,
  shipLandTime,
  shipStartPosition,
  shipLandPosition,
  shipSize
}) {
  if (!ship) {
    return;
  }

  if (elapsed < shipStartTime) {
    hideShip(ship);
    return;
  }

  const fallDuration = Math.max(0.001, shipLandTime - shipStartTime);
  const fallProgress = clamp01((elapsed - shipStartTime) / fallDuration);
  const impactAge = elapsed - shipLandTime;

  const position = lerpVector(
    shipStartPosition,
    shipLandPosition,
    Math.pow(fallProgress, 2.35)
  );

  const landed = fallProgress >= 1;

  ship.visible = true;
  ship.phase = landed ? "landed" : "falling";
  ship.position = landed ? [...shipLandPosition] : position;
  ship.size = Array.isArray(shipSize) ? [...shipSize] : null;
  ship.destructionProgress = 0;

  // Diagnóstico: desliga efeitos e eventos.
  ship.dust = [];
  ship.flash = null;
  ship.smoke = [];
  ship.events = [];

  if (landed && impactAge >= 0.28) {
    ship.phase = "landed";
  }
}

export function updateGameplayOpeningShipPersistentSmoke(ship, { now, smokeUntil } = {}) {
  if (!ship) {
    return;
  }

  ship.smoke = [];
  ship.flash = null;
}

export function clearGameplayOpeningShipImpactEffects(ship) {
  if (!ship) {
    return;
  }

  ship.dust = [];
  ship.flash = null;
}

export function consumeGameplayOpeningShipEvents(ship) {
  if (!ship || !Array.isArray(ship.events)) {
    return [];
  }

  ship.events.length = 0;
  return [];
}

export function getGameplayOpeningShipDynamicBarrier(ship) {
  // Diagnóstico: desliga collider da nave.
  return null;
}

export function getGameplayOpeningShipSceneObjects(sceneObjects = [], ship) {
  const modelInstance = syncModelInstance(ship);

  if (!ship?.model || !modelInstance || modelInstance.active === false) {
    return sceneObjects;
  }

  return [
    ...sceneObjects,
    {
      model: ship.model,
      brightness: ship.phase === "landed" ? 0.92 : 1,
      instances: [modelInstance]
    }
  ];
}

export function appendGameplayOpeningShipBillboards({
  billboards
}) {
  // Diagnóstico: não injeta fumaça, poeira, flash nem fallback texture.
  return billboards;
}