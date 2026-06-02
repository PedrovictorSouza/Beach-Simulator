export function createWoodCollectPopRuntime({
  clamp01,
  duration,
  lift,
  scale
}) {
  const effects = [];

  function trigger(woodDropSnapshots) {
    for (const [woodDrop, snapshot] of woodDropSnapshots) {
      if (!woodDrop.collected) {
        continue;
      }

      effects.push({
        ...snapshot,
        age: 0,
        duration
      });
    }
  }

  function update(deltaTime) {
    for (let index = effects.length - 1; index >= 0; index -= 1) {
      const effect = effects[index];
      effect.age += deltaTime;

      if (effect.age >= effect.duration) {
        effects.splice(index, 1);
      }
    }
  }

  function getBillboards(texture, fallbackUvRect) {
    if (!texture || effects.length === 0) {
      return [];
    }

    return effects.map((effect) => {
      const progress = clamp01(effect.age / effect.duration);
      const popScale = 1 + Math.sin(progress * Math.PI) * (scale - 1);
      const fade = clamp01((1 - progress) / 0.42);
      const popLift = Math.sin(progress * Math.PI) * lift;

      return {
        texture,
        position: [
          effect.position[0],
          effect.position[1] + popLift,
          effect.position[2]
        ],
        size: [
          effect.size[0] * popScale,
          effect.size[1] * popScale
        ],
        uvRect: effect.uvRect || fallbackUvRect,
        alpha: fade
      };
    });
  }

  return {
    getBillboards,
    trigger,
    update
  };
}
