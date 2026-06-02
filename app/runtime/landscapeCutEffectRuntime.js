export function createLandscapeCutEffectRuntime({
  clamp01,
  easeOutCubic,
  lerp,
  getNowMs = () => (
    typeof performance !== "undefined" && typeof performance.now === "function" ?
      performance.now() :
      Date.now()
  ),
  config
}) {
  let effects = [];

  function clonePatch(patch) {
    if (!patch || !Array.isArray(patch.position)) {
      return null;
    }

    return {
      ...patch,
      position: [...patch.position],
      size: Array.isArray(patch.size) ? [...patch.size] : [1.18, 0.96]
    };
  }

  function queue(patch) {
    const effectPatch = clonePatch(patch);
    if (!effectPatch) {
      return;
    }

    effects.push({
      id: `landscape-cut-${effectPatch.id || effectPatch.cellId || effects.length}-${getNowMs().toFixed(1)}`,
      patch: effectPatch,
      elapsed: 0,
      duration: config.duration
    });
  }

  function update(deltaTime) {
    if (!effects.length) {
      return;
    }

    effects = effects.filter((effect) => {
      effect.elapsed = Math.min(
        Number(effect.duration || config.duration),
        Number(effect.elapsed || 0) + deltaTime
      );
      return effect.elapsed < Number(effect.duration || config.duration);
    });
  }

  function getPose(effect) {
    const duration = Number(effect?.duration || config.duration);
    const progress = clamp01(Number(effect?.elapsed || 0) / Math.max(0.001, duration));

    if (progress < config.lerpPortion) {
      const lerpProgress = easeOutCubic(progress / config.lerpPortion);
      return {
        alpha: 1,
        scale: lerp(1, 0.72, lerpProgress),
        yOffset: lerp(0, config.lift * 0.45, lerpProgress)
      };
    }

    const popProgress = easeOutCubic(
      (progress - config.lerpPortion) /
      Math.max(0.001, 1 - config.lerpPortion)
    );

    return {
      alpha: 1 - popProgress,
      scale: lerp(0.72, config.popScale, popProgress),
      yOffset: lerp(
        config.lift * 0.45,
        config.lift,
        popProgress
      )
    };
  }

  function forEachEffect(callback) {
    if (typeof callback !== "function") {
      return;
    }

    for (const effect of effects) {
      callback(effect, getPose(effect));
    }
  }

  return {
    queue,
    update,
    forEachEffect
  };
}
