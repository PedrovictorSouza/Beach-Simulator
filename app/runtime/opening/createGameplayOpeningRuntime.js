import {
  createCinematicControlState,
  resetCinematicControlState,
  setCinematicSkipHoldActive,
  updateCinematicControlState
} from "../../scene/cinematicControlPolicy.js";

import {
  consumeGameplayOpeningShipEvents,
  GAMEPLAY_OPENING_SHIP_EVENTS
} from "../../session/gameplayOpeningShip.js";
import { DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS } from "../gameplayOpeningEstablishingShots.js";

const DEFAULT_GAMEPLAY_OPENING_HUD_REVEAL_DELAY_MS = 600;

export const GAMEPLAY_OPENING_PHASES = Object.freeze({
  ESTABLISHING_SHOTS: "establishingShots",
  SHIP_FALL: "shipFall",
  IMPACT: "impact",
  SETTLED: "settled",
  HUD_REVEAL: "hudReveal",
  DONE: "done"
});

function getEstablishingShotsDuration(shots) {
  return shots.reduce(
    (duration, shot) => Math.max(duration, Number(shot?.end) || 0),
    0
  );
}

export function createGameplayOpeningRuntime({
  gameplayCameraDirector,
  session,
  controls,
  gameplayUiVisibility = null,
  audio,
  establishingShots = DEFAULT_GAMEPLAY_OPENING_ESTABLISHING_SHOTS,
  hudRevealDelayMs = DEFAULT_GAMEPLAY_OPENING_HUD_REVEAL_DELAY_MS
}) {
  let hudHidden = false;
  let hudRevealAt = null;
  let cameraFrame = null;
  let cameraLocked = false;
  let phase = GAMEPLAY_OPENING_PHASES.DONE;

  const skipControl = createCinematicControlState();
  const establishingShotsDuration = getEstablishingShotsDuration(establishingShots);

  function getPlayerPosition() {
    return session.playerCharacter?.getPosition?.() || null;
  }

  function spawnPlayer(spawnPosition) {
    session.spawnActTwoPlayer?.({
      configureCamera: false,
      position: spawnPosition
    });

    return getPlayerPosition();
  }

  function movePlayer(playerPosition) {
    session.playerCharacter?.setPosition?.(playerPosition);
  }

  function createOpeningCameraPayload({
    now,
    gameplayActive = true,
    canFollow = true
  }) {
    return {
      now,
      gameplayActive,
      playerPosition: getPlayerPosition(),
      canFollow,
      spawnPlayer,
      movePlayer,
      ship: session.gameplayOpeningShip
    };
  }

  function consumeOpeningRequest() {
    if (!session.gameplayOpeningRequested) {
      return false;
    }

    gameplayCameraDirector.requestOpening({
      sequenceDelay: establishingShotsDuration
    });
    session.gameplayOpeningRequested = false;

    hudHidden = true;
    hudRevealAt = null;
    phase = GAMEPLAY_OPENING_PHASES.ESTABLISHING_SHOTS;
    gameplayUiVisibility?.hideSections?.(["hud", "inventory"]);

    return true;
  }

  function beginFrame({
    now,
    deltaTime,
    gameplayActive
  }) {
    consumeOpeningRequest();

    const active = gameplayCameraDirector.beginFrame({
      now,
      gameplayActive
    });

    cameraFrame = null;
    cameraLocked = active;
    controls.setGameplayCinematicInputActive?.(active);

    if (!active) {
      resetCinematicControlState(skipControl);
      phase = hudHidden ?
        GAMEPLAY_OPENING_PHASES.HUD_REVEAL :
        GAMEPLAY_OPENING_PHASES.DONE;

      return {
        active: false,
        cameraFrame,
        hudHidden
      };
    }

    setCinematicSkipHoldActive(
      skipControl,
      Boolean(controls.isCinematicSkipActionActive?.()),
      now * 0.001
    );

    const skipControlFrame = updateCinematicControlState(skipControl, deltaTime);

    if (skipControlFrame.skipCompleted) {
      cameraFrame = gameplayCameraDirector.skipOpening(
        createOpeningCameraPayload({
          now,
          gameplayActive: true,
          canFollow: true
        })
      );

      controls.clearPendingActions?.();
      controls.clearMovementInput?.();
      resetCinematicControlState(skipControl);
      syncPhaseFromCameraFrame();
    }

    return {
      active,
      cameraFrame,
      hudHidden
    };
  }

  function updateCamera({
    now,
    gameplayActive = true,
    canFollow = true
  }) {
    if (cameraFrame?.skipped) {
      return cameraFrame;
    }

    cameraFrame = gameplayCameraDirector.update(
      createOpeningCameraPayload({
        now,
        gameplayActive,
        canFollow
      })
    );

    syncPhaseFromCameraFrame();
    return cameraFrame;
  }

  function syncPhaseFromCameraFrame() {
    if (cameraFrame?.released) {
      phase = GAMEPLAY_OPENING_PHASES.HUD_REVEAL;
      return;
    }

    if (cameraFrame?.phase?.startsWith?.("establishing-")) {
      phase = GAMEPLAY_OPENING_PHASES.ESTABLISHING_SHOTS;
      return;
    }

    if (cameraFrame?.phase === "ship-landed") {
      phase = GAMEPLAY_OPENING_PHASES.IMPACT;
      return;
    }

    if (cameraFrame?.phase === "player-exit") {
      phase = GAMEPLAY_OPENING_PHASES.SETTLED;
      return;
    }

    if (cameraFrame?.openingActive) {
      phase = GAMEPLAY_OPENING_PHASES.SHIP_FALL;
    }
  }

  function updateShipAudio(now) {
    for (const shipEvent of consumeGameplayOpeningShipEvents(session.gameplayOpeningShip)) {
      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.FALL_STARTED) {
        phase = GAMEPLAY_OPENING_PHASES.SHIP_FALL;
        audio.updateShipFall?.({
          active: true
        });
      }

      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.IMPACT) {
        phase = GAMEPLAY_OPENING_PHASES.IMPACT;
        audio.updateShipFall?.({
          active: false
        });

        audio.updateShipImpact?.(now * 0.001);
      }

      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.SETTLED) {
        phase = GAMEPLAY_OPENING_PHASES.SETTLED;
        audio.updateShipFall?.({
          active: false
        });
      }
    }
  }

  function updateHudReveal({
    now,
    gameplayActive
  }) {
    if (cameraFrame?.released && hudHidden && hudRevealAt === null) {
      hudRevealAt = now + hudRevealDelayMs;
    }

    if (
      hudHidden &&
      hudRevealAt !== null &&
      now >= hudRevealAt &&
      gameplayActive
    ) {
      gameplayUiVisibility?.showSections?.(["hud", "inventory"]);
      hudHidden = false;
      hudRevealAt = null;
      phase = GAMEPLAY_OPENING_PHASES.DONE;
    }
  }

  function getCameraFrame() {
    return cameraFrame;
  }

  function isHudHidden() {
    return hudHidden;
  }

  function isActive() {
    return cameraLocked || hudHidden;
  }

  function isCameraLocked() {
    return cameraLocked;
  }

  function isMovementLocked() {
    return cameraLocked;
  }

  function getPhase() {
    return phase;
  }

  return {
    beginFrame,
    updateCamera,
    updateShipAudio,
    updateHudReveal,
    getCameraFrame,
    getPhase,
    isActive,
    isCameraLocked,
    isMovementLocked,
    isHudHidden
  };
}
