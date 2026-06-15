function defaultScheduleMicrotask(callback) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  Promise.resolve().then(callback);
}

export function createNpcConversationFocusRuntime({
  controls = {},
  dialogueCamera = null,
  gameplayDialogue = {},
  getSquirtle = () => null,
  getSquirtleModelYawToward = () => 0,
  getYawToward = () => 0,
  scheduleMicrotask = defaultScheduleMicrotask
} = {}) {
  function faceTargetTowardPlayer({
    targetId,
    playerPosition,
    npcActors = [],
    interactables = []
  } = {}) {
    const npcActor = npcActors.find((actor) => actor.id === targetId);
    if (npcActor?.character?.faceToward) {
      const npcPosition = npcActor.character.getPosition();
      npcActor.character.faceToward(playerPosition);
      npcActor.faceYaw = getYawToward(npcPosition, playerPosition);
      return;
    }

    const interactable = interactables.find((entry) => entry.id === targetId);
    const squirtle = getSquirtle();
    if (
      interactable?.id === "squirtle" &&
      squirtle?.modelInstance &&
      playerPosition
    ) {
      squirtle.modelInstance.yaw = getSquirtleModelYawToward(
        squirtle.position,
        playerPosition
      );
    }
  }

  function focusWhenDialogueOpens({
    targetId,
    playerPosition,
    npcActors,
    interactables,
    targetPosition
  } = {}) {
    scheduleMicrotask(() => {
      if (
        !gameplayDialogue.isActive?.() ||
        controls.isScriptedInteractionActive?.()
      ) {
        return;
      }

      dialogueCamera?.focusNpcConversation({
        targetId,
        playerPosition,
        npcActors,
        interactables,
        targetPosition
      });
    });
  }

  function handleInteractionStart(payload = {}) {
    faceTargetTowardPlayer(payload);
    if (controls.isScriptedInteractionActive?.()) {
      return;
    }
    focusWhenDialogueOpens(payload);
  }

  return {
    faceTargetTowardPlayer,
    focusWhenDialogueOpens,
    handleInteractionStart
  };
}
