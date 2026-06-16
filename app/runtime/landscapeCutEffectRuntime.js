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

  function appendRenderables({
    nextFrame,
    session = {},
    getTallGrassYaw = () => 0,
    getTallGrassInstanceScale = (_model, _patch, scale) => scale
  } = {}) {
    if (!nextFrame?.render) {
      return;
    }

    forEachEffect((effect, pose) => {
      const groundGrassPatch = effect.patch;
      if (!groundGrassPatch || !Array.isArray(groundGrassPatch.position)) {
        return;
      }

      if (pose.alpha <= 0.01) {
        return;
      }

      const offset = [
        groundGrassPatch.position[0],
        groundGrassPatch.position[1] + pose.yOffset,
        groundGrassPatch.position[2]
      ];
      const yaw = getTallGrassYaw(groundGrassPatch);
      const isLeafageGarden =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "garden1";
      const isLeafageNativeTree =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "nativeTree";
      const isTallGrass =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId !== "garden1" &&
        groundGrassPatch.leafageObjectId !== "nativeTree";

      if (
        isLeafageGarden &&
        session.leafageGardenModel &&
        Array.isArray(session.leafageGardenInstances)
      ) {
        session.leafageGardenInstances.push({
          id: `${effect.id}-garden`,
          offset,
          scale: getTallGrassInstanceScale(
            session.leafageGardenModel,
            groundGrassPatch,
            pose.scale
          ) * (session.leafageGardenModelScale || 1),
          alpha: pose.alpha,
          yaw: yaw + (session.leafageGardenModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (
        isLeafageNativeTree &&
        session.leafageNativeTreeModel &&
        Array.isArray(session.leafageNativeTreeInstances)
      ) {
        session.leafageNativeTreeInstances.push({
          id: `${effect.id}-native-tree`,
          offset,
          scale: getTallGrassInstanceScale(
            session.leafageNativeTreeModel,
            groundGrassPatch,
            pose.scale
          ) * (session.leafageNativeTreeModelScale || 1),
          alpha: pose.alpha,
          yaw: yaw + (session.leafageNativeTreeModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (
        isTallGrass &&
        session.tallGrassModel &&
        Array.isArray(session.tallGrassInstances)
      ) {
        session.tallGrassInstances.push({
          id: `${effect.id}-tall-grass`,
          offset,
          scale: getTallGrassInstanceScale(
            session.tallGrassModel,
            groundGrassPatch,
            pose.scale
          ),
          alpha: pose.alpha,
          yaw,
          swayStrength: 0
        });
      } else if (
        session.deadGrassModel &&
        Array.isArray(session.deadGrassInstances)
      ) {
        session.deadGrassInstances.push({
          id: `${effect.id}-dead-grass`,
          offset,
          scale: getTallGrassInstanceScale(
            session.deadGrassModel,
            groundGrassPatch,
            pose.scale
          ),
          alpha: pose.alpha,
          yaw,
          swayStrength: 0
        });
      } else {
        const grassBillboardScaleX = Number(groundGrassPatch.size?.[0]) || 1;
        const grassBillboardScaleY = Number(groundGrassPatch.size?.[1]) || grassBillboardScaleX;
        nextFrame.render.grassBillboards.push({
          texture: groundGrassPatch.state === "alive" ?
            session.greenGrassTexture :
            session.deadGrassTexture,
          position: offset,
          size: [
            grassBillboardScaleX * pose.scale,
            grassBillboardScaleY * pose.scale
          ],
          alpha: pose.alpha
        });
      }
    });
  }

  return {
    appendRenderables,
    queue,
    update,
    forEachEffect
  };
}
