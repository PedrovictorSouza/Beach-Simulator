import { updatePlayerDustParticles as updateDefaultPlayerDustParticles } from "../session/playerDustParticles.js";

const PLAYER_MOVED_EPSILON = 0.0005;

export function createPlayerMovementFrameRuntime({
  session,
  movementPolicy,
  model,
  followDirection,
  movementQuest,
  runBreadcrumbPrompt,
  dust,
  callbacks = {}
} = {}) {
  const {
    resolvePlayerMovementPermission = () => false
  } = movementPolicy || {};
  const {
    updatePlayerDustParticles = updateDefaultPlayerDustParticles
  } = dust || {};
  const {
    isMovementQuestActive = () => false,
    isRunActive = () => false,
    reportMovement = () => {},
    onPlayerMoved = () => {}
  } = callbacks;

  function update({
    deltaTime = 0,
    now = 0,
    flowState = {},
    gameplayOpeningMovementLocked = false,
    gameplayOpeningCameraLocked = false,
    foundationBuildZoneCameraFocusActive = false,
    tutorialActive = false
  } = {}) {
    const playerCharacter = session?.playerCharacter;
    const canUpdatePlayerMovement = resolvePlayerMovementPermission({
      hasPlayerCharacter: Boolean(playerCharacter),
      foundationBuildZoneCameraFocusActive,
      flowState
    });
    let playerMovedThisFrame = false;
    let movedDistance = 0;

    if (canUpdatePlayerMovement) {
      const previousPlayerPosition = playerCharacter.getPosition();
      playerCharacter.update(deltaTime);
      if (playerCharacter.consumeJumpStarted?.()) {
        model?.startJumpFlip?.(session);
      }
      const nextPlayerPosition = playerCharacter.getPosition();
      const movementDelta = [
        nextPlayerPosition[0] - previousPlayerPosition[0],
        nextPlayerPosition[2] - previousPlayerPosition[2]
      ];
      movedDistance = Math.hypot(movementDelta[0], movementDelta[1]);
      playerMovedThisFrame = movedDistance > PLAYER_MOVED_EPSILON;

      if (
        playerMovedThisFrame &&
        !gameplayOpeningMovementLocked &&
        !tutorialActive &&
        isMovementQuestActive() &&
        !isRunActive()
      ) {
        runBreadcrumbPrompt?.trigger?.(now);
      }

      followDirection?.update?.(movementDelta[0], movementDelta[1]);
      model?.sync?.(session, deltaTime, movementDelta);

      if (playerMovedThisFrame) {
        onPlayerMoved({
          now,
          movedDistance,
          playerMovedThisFrame,
          previousPlayerPosition,
          nextPlayerPosition,
          movementDelta,
          gameplayOpeningMovementLocked,
          gameplayOpeningCameraLocked,
          foundationBuildZoneCameraFocusActive,
          tutorialActive
        });
      }

      movementQuest?.update?.({
        active: isMovementQuestActive,
        movedDistance,
        reportMovement
      });
    } else {
      model?.sync?.(session, deltaTime);
    }

    updatePlayerDustParticles(session?.playerDust, {
      deltaTime,
      playerPosition: playerCharacter?.getPosition?.() || null,
      active: canUpdatePlayerMovement
    });

    return {
      playerMovedThisFrame,
      canUpdatePlayerMovement,
      movedDistance
    };
  }

  return {
    update
  };
}
