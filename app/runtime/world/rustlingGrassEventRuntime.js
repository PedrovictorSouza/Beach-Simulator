export function createRustlingGrassEventRuntime({
  getStoryState
} = {}) {
  function update({ deltaTime = 0, canAdvance = false } = {}) {
    const flags = getStoryState?.()?.flags;

    if (
      !canAdvance ||
      !flags?.pendingRustlingGrassCellId ||
      flags.rustlingGrassCellId ||
      flags.bulbasaurRevealed
    ) {
      return {
        advanced: false,
        activeCellId: flags?.rustlingGrassCellId || null
      };
    }

    const nextDelay = Math.max(0, Number(flags.rustlingGrassDelay || 0) - deltaTime);
    flags.rustlingGrassDelay = nextDelay;

    if (nextDelay > 0) {
      return {
        advanced: false,
        activeCellId: null
      };
    }

    flags.rustlingGrassCellId = flags.pendingRustlingGrassCellId;
    delete flags.pendingRustlingGrassCellId;
    delete flags.rustlingGrassDelay;

    return {
      advanced: true,
      activeCellId: flags.rustlingGrassCellId
    };
  }

  return {
    update
  };
}
