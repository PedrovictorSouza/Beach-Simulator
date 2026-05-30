import {
  DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS,
  getGameplayOpeningEstablishingPhase,
  getGameplayOpeningEstablishingShot
} from "./gameplayOpeningEstablishingShots.js";

import {
  ACT_TWO_GAMEPLAY_OPENING_CAMERA_HOLD,
  ACT_TWO_GAMEPLAY_OPENING_CAMERA_POSE,
  ACT_TWO_GAMEPLAY_OPENING_IMPACT_SHAKE_DURATION,
  ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_END_POSITION,
  ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_START,
  ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_START_POSITION,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_LAND,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_LAND_POSITION,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_SIZE,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_SMOKE_DURATION,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_START,
  ACT_TWO_GAMEPLAY_OPENING_SHIP_START_POSITION,
  ACT_TWO_PLAYER_CAMERA_DIRECTION,
  ACT_TWO_PLAYER_CAMERA_DISTANCE,
  ACT_TWO_PLAYER_CAMERA_ZOOM
} from "../../actTwoSceneConfig.js";
import {
  clearGameplayOpeningShipImpactEffects,
  updateGameplayOpeningShipFall,
  updateGameplayOpeningShipPersistentSmoke
} from "../session/gameplayOpeningShip.js";
import { MOTION_IMPACT_PRESET_IDS } from "../motion/motionImpactPresets.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInCubic(value) {
  const t = clamp01(value);
  return t * t * t;
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

function lerpVector(from, to, amount) {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount
  ];
}

function getShakenOpeningPose(openingPose, elapsed, shipLandTime, shakeDuration) {
  const shakeProgress = clamp01((elapsed - shipLandTime) / shakeDuration);

  if (shakeProgress <= 0 || shakeProgress >= 1) {
    return openingPose;
  }

  const strength = (1 - shakeProgress) * 0.36;
  const shakeX = Math.sin(elapsed * 85) * strength;
  const shakeY = Math.cos(elapsed * 71) * strength * 0.38;

  return {
    ...openingPose,
    target: [
      openingPose.target[0] + shakeX,
      openingPose.target[1] + shakeY,
      openingPose.target[2] - shakeX * 0.42
    ]
  };
}

function getOpeningCameraPose({
  elapsed,
  sequenceElapsed = elapsed,
  openingPose,
  establishingShots,
  shipLandTime,
  impactShakeDuration
}) {
  const establishingShot = getGameplayOpeningEstablishingShot(
    elapsed,
    establishingShots
  );

  if (establishingShot?.pose) {
    return establishingShot.pose;
  }

  return getShakenOpeningPose(
    openingPose,
    sequenceElapsed,
    shipLandTime,
    impactShakeDuration
  );
}


export function createGameplayCameraDirector({
  camera,
  cameraOrbit,
  openingDuration = ACT_TWO_GAMEPLAY_OPENING_CAMERA_HOLD,
  openingPose = ACT_TWO_GAMEPLAY_OPENING_CAMERA_POSE,
  establishingShots = DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS,
  shipStartTime = ACT_TWO_GAMEPLAY_OPENING_SHIP_START,
  shipLandTime = ACT_TWO_GAMEPLAY_OPENING_SHIP_LAND,
  shipStartPosition = ACT_TWO_GAMEPLAY_OPENING_SHIP_START_POSITION,
  shipLandPosition = ACT_TWO_GAMEPLAY_OPENING_SHIP_LAND_POSITION,
  shipSize = ACT_TWO_GAMEPLAY_OPENING_SHIP_SIZE,
  playerExitStartTime = ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_START,
  playerExitStartPosition = ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_START_POSITION,
  playerExitEndPosition = ACT_TWO_GAMEPLAY_OPENING_PLAYER_EXIT_END_POSITION,
  impactShakeDuration = ACT_TWO_GAMEPLAY_OPENING_IMPACT_SHAKE_DURATION,
  smokeDuration = ACT_TWO_GAMEPLAY_OPENING_SHIP_SMOKE_DURATION,
  onCrashImpactMotionRequested = () => {}
}) {
  let openingShot = null;
  let openingPlayed = false;
  let smokeUntil = null;
  let crashImpactMotionRequested = false;

  function requestOpening({ sequenceDelay = 0 } = {}) {
    if (openingPlayed) {
      return false;
    }

    openingShot = {
      playerSpawned: false,
      startedAt: null,
      sequenceDelay: Math.max(0, Number(sequenceDelay) || 0)
    };
    smokeUntil = null;
    crashImpactMotionRequested = false;
    return true;
  }

  function getElapsed(now) {
    if (!openingShot || typeof openingShot.startedAt !== "number") {
      return null;
    }

    return (now - openingShot.startedAt) / 1000;
  }

  function isOpeningActive(now) {
    const elapsed = getElapsed(now);
    return elapsed !== null && elapsed < openingDuration + getSequenceDelay();
  }

  function getSequenceDelay() {
    return Math.max(0, Number(openingShot?.sequenceDelay) || 0);
  }

  function getSequenceElapsed(elapsed) {
    return Math.max(0, elapsed - getSequenceDelay());
  }

  function beginFrame({ now, gameplayActive }) {
    if (!gameplayActive) {
      openingShot = null;
      return false;
    }

    if (openingShot && openingShot.startedAt === null) {
      openingShot.startedAt = now;
    }

    return isOpeningActive(now);
  }

  function requestCrashImpactMotion(ship) {
    if (crashImpactMotionRequested || !ship?.eventState?.impact) {
      return;
    }

    crashImpactMotionRequested = true;
    onCrashImpactMotionRequested({
      motionId: MOTION_IMPACT_PRESET_IDS.CRASH_IMPACT,
      position: Array.isArray(ship.position) ? [...ship.position] : null
    });
  }

  function updateShip(ship, elapsed, { requestMotion = true } = {}) {
    updateGameplayOpeningShipFall(ship, {
      elapsed,
      shipStartTime,
      shipLandTime,
      shipStartPosition,
      shipLandPosition,
      shipSize
    });
    if (requestMotion) {
      requestCrashImpactMotion(ship);
    }
  }

  function updatePersistentSmoke(ship, now) {
    updateGameplayOpeningShipPersistentSmoke(ship, {
      now,
      smokeUntil
    });
  }

  function getPlayerExitPosition(elapsed) {
    const exitDuration = Math.max(0.001, openingDuration - playerExitStartTime);
    const exitProgress = clamp01((elapsed - playerExitStartTime) / exitDuration);

    return lerpVector(
      playerExitStartPosition,
      playerExitEndPosition,
      easeOutCubic(exitProgress)
    );
  }

  function ensureOpeningPlayer(playerPosition, spawnPlayer) {
    if (Array.isArray(playerPosition)) {
      return playerPosition;
    }

    if (!openingShot || openingShot.playerSpawned) {
      return null;
    }

    openingShot.playerSpawned = true;
    const spawnedPosition = spawnPlayer?.([...playerExitStartPosition]) || null;
    return Array.isArray(spawnedPosition) ? spawnedPosition : null;
  }

  function releaseToFollow(playerPosition, canFollow) {
    camera.setPose({
      direction: ACT_TWO_PLAYER_CAMERA_DIRECTION,
      zoom: ACT_TWO_PLAYER_CAMERA_ZOOM,
      distance: ACT_TWO_PLAYER_CAMERA_DISTANCE
    });
    cameraOrbit.sync(ACT_TWO_PLAYER_CAMERA_DIRECTION);

    if (canFollow) {
      camera.follow(playerPosition);
    }
  }

  function completeOpening({
    now,
    playerPosition,
    canFollow = true,
    spawnPlayer = null,
    movePlayer = null,
    ship = null,
    spawnPosition = playerExitStartPosition,
    phase = "released",
    skipped = false
  }) {
    updateShip(ship, openingDuration, {
      requestMotion: !skipped
    });
    smokeUntil = now + smokeDuration * 1000;

    let currentPlayerPosition = Array.isArray(playerPosition) ? playerPosition : null;
    if (!currentPlayerPosition && openingShot && !openingShot.playerSpawned) {
      openingShot.playerSpawned = true;
      currentPlayerPosition = spawnPlayer?.([...spawnPosition]) || null;
    }

    openingShot = null;
    openingPlayed = true;

    if (Array.isArray(currentPlayerPosition)) {
      movePlayer?.([...playerExitEndPosition]);
      releaseToFollow(playerExitEndPosition, canFollow);
    }

    return {
      openingActive: false,
      released: true,
      skipped,
      phase
    };
  }

  function skipOpening({
    now,
    gameplayActive,
    playerPosition,
    canFollow = true,
    spawnPlayer = null,
    movePlayer = null,
    ship = null
  }) {
    if (!openingShot || !gameplayActive || !isOpeningActive(now)) {
      return {
        openingActive: false,
        released: false,
        skipped: false,
        phase: openingPlayed ? "played" : "idle"
      };
    }

    return completeOpening({
      now,
      playerPosition,
      canFollow,
      spawnPlayer,
      movePlayer,
      ship,
      spawnPosition: playerExitEndPosition,
      phase: "skipped",
      skipped: true
    });
  }

  function update({
    now,
    gameplayActive,
    playerPosition,
    canFollow = true,
    spawnPlayer = null,
    movePlayer = null,
    ship = null
  }) {
    const hasPlayer = Array.isArray(playerPosition);
    const openingActive = beginFrame({
      now,
      gameplayActive
    });
    const elapsed = getElapsed(now);
    const sequenceDelay = getSequenceDelay();
    const sequenceElapsed = getSequenceElapsed(elapsed);

   if (openingActive) {
    camera.setPose(getOpeningCameraPose({
      elapsed,
      sequenceElapsed,
      openingPose,
      establishingShots,
      shipLandTime,
      impactShakeDuration
    }));

    updateShip(ship, sequenceElapsed);

    if (sequenceElapsed >= playerExitStartTime) {
      const currentPlayerPosition = ensureOpeningPlayer(playerPosition, spawnPlayer);
      const nextPlayerPosition = getPlayerExitPosition(sequenceElapsed);

      if (currentPlayerPosition) {
        movePlayer?.(nextPlayerPosition);
      }
    }

    const establishingPhase = getGameplayOpeningEstablishingPhase(
      elapsed,
      establishingShots
    );

    return {
      openingActive: true,
      released: false,
      phase: elapsed < sequenceDelay && establishingPhase !== "establishing" ?
        establishingPhase :
        sequenceElapsed < shipLandTime ?
          "ship-fall" :
          sequenceElapsed < playerExitStartTime ?
            "ship-landed" :
            "player-exit"
    };
  }
    if (openingShot && gameplayActive) {
      return completeOpening({
        now,
        playerPosition,
        canFollow,
        spawnPlayer,
        movePlayer,
        ship
      });
    }

    if (openingPlayed) {
      updatePersistentSmoke(ship, now);
    }

    clearGameplayOpeningShipImpactEffects(ship);

    if (gameplayActive && hasPlayer && canFollow) {
      camera.follow(playerPosition);
    }

    return {
      openingActive: false,
      released: false,
      phase: openingPlayed ? "played" : "idle"
    };
  }

  return {
    beginFrame,
    getState(now) {
      const elapsed = getElapsed(now);
      const sequenceDelay = getSequenceDelay();
      const sequenceElapsed = getSequenceElapsed(elapsed);
      return {
        openingActive: isOpeningActive(now),
        openingPlayed,
        openingElapsed: elapsed,
        openingPhase: !openingShot ?
          (openingPlayed ? "played" : "idle") :
          elapsed < sequenceDelay ?
            getGameplayOpeningEstablishingPhase(elapsed, establishingShots) :
          sequenceElapsed < shipStartTime ?
            "chopper" :
            sequenceElapsed < shipLandTime ?
              "ship-fall" :
              sequenceElapsed < playerExitStartTime ?
                "ship-landed" :
            isOpeningActive(now) ?
              "player-exit" :
              "release"
      };
    },
    requestOpening,
    skipOpening,
    update
  };
}
