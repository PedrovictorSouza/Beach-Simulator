export function resolveWaterGunCompanionLostHint({
  activeQuestId,
  activeMoveId = null,
  flags = {},
  playerHasWaterGun = false,
  bulbasaurPosition = null,
  squirtlePosition = null,
  restoreTargetCount,
  squirtleHintText,
  bulbasaurHintText
} = {}) {
  const restoredGrassCount = Number(flags.restoredGrassCount || 0);
  const activeDryGrassQuest = activeQuestId === "water-dry-grass";
  const activeBulbasaurDryGrassRequest =
    flags.bulbasaurDryGrassMissionAccepted &&
    !flags.bulbasaurDryGrassMissionComplete &&
    restoredGrassCount < restoreTargetCount;
  const needsWaterGun =
    playerHasWaterGun &&
    (
      activeDryGrassQuest ||
      activeBulbasaurDryGrassRequest
    );

  if (!needsWaterGun) {
    return null;
  }

  if (activeMoveId === "leafage" && Array.isArray(bulbasaurPosition)) {
    return {
      key: "bulbasaur-switch-to-squirtle",
      text: bulbasaurHintText,
      worldPosition: bulbasaurPosition
    };
  }

  if (!Array.isArray(squirtlePosition)) {
    return null;
  }

  return {
    key: "squirtle-use-water-gun",
    text: squirtleHintText,
    worldPosition: squirtlePosition
  };
}

export function createCompanionLostHintRuntime({
  initialDelayMs,
  repeatMs,
  durationMs
}) {
  let hintKey = null;
  let nextAt = 0;
  let activeUntil = 0;
  let activeHint = null;

  function reset() {
    hintKey = null;
    nextAt = 0;
    activeUntil = 0;
    activeHint = null;
  }

  function get(hint, now) {
    if (!hint) {
      reset();
      return null;
    }

    if (hint.key !== hintKey) {
      hintKey = hint.key;
      nextAt = now + initialDelayMs;
      activeUntil = 0;
      activeHint = null;
      return null;
    }

    if (activeHint && now < activeUntil) {
      return {
        ...activeHint,
        worldPosition: hint.worldPosition
      };
    }

    if (now < nextAt) {
      return null;
    }

    activeHint = hint;
    activeUntil = now + durationMs;
    nextAt = now + repeatMs;
    return hint;
  }

  return {
    get,
    reset
  };
}
