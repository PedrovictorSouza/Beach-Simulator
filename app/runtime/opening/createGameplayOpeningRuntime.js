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

const DEFAULT_GAMEPLAY_OPENING_HUD_REVEAL_DELAY_MS = 600;

export function createGameplayOpeningRuntime({
  gameplayCameraDirector,
  session,
  controls,
  gameplayUiVisibility = null,
  audio,
  hudRevealDelayMs = DEFAULT_GAMEPLAY_OPENING_HUD_REVEAL_DELAY_MS
}) {
  let hudHidden = false;
  let hudRevealAt = null;
  let cameraFrame = null;

  const skipControl = createCinematicControlState();

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

    gameplayCameraDirector.requestOpening();
    session.gameplayOpeningRequested = false;

    hudHidden = true;
    hudRevealAt = null;
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
    controls.setGameplayCinematicInputActive?.(active);

    if (!active) {
      resetCinematicControlState(skipControl);

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

    return cameraFrame;
  }

  function updateShipAudio(now) {
    for (const shipEvent of consumeGameplayOpeningShipEvents(session.gameplayOpeningShip)) {
      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.FALL_STARTED) {
        audio.updateShipFall?.({
          active: true
        });
      }

      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.IMPACT) {
        audio.updateShipFall?.({
          active: false
        });

        audio.updateShipImpact?.(now * 0.001);
      }

      if (shipEvent.type === GAMEPLAY_OPENING_SHIP_EVENTS.SETTLED) {
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
    }
  }

  function getCameraFrame() {
    return cameraFrame;
  }

  function isHudHidden() {
    return hudHidden;
  }

  return {
    beginFrame,
    updateCamera,
    updateShipAudio,
    updateHudReveal,
    getCameraFrame,
    isHudHidden
  };
}