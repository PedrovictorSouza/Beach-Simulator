export function createGearPickupParticleRuntime({
  clamp01,
  count,
  duration,
  baseHeight,
  lift,
  radius,
  size
}) {
  const effects = [];

  function trigger(sourcePositions = []) {
    for (const sourcePosition of sourcePositions) {
      if (!Array.isArray(sourcePosition)) {
        continue;
      }

      for (let index = 0; index < count; index += 1) {
        const spread = index / count;
        const angle = spread * Math.PI * 2;
        const speed = 0.62 + (index % 4) * 0.08;
        const particleSize = size * (0.82 + (index % 3) * 0.12);

        effects.push({
          origin: [...sourcePosition],
          age: 0,
          duration,
          angle,
          speed,
          size: particleSize,
          rotation: angle * 0.5,
          spin: (index % 2 === 0 ? 1 : -1) * (3.4 + spread * 2.2),
          phase: spread * Math.PI
        });
      }
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
      const arc = Math.sin(progress * Math.PI);
      const particleRadius = radius * effect.speed * progress;
      const alpha = clamp01(progress / 0.14) * clamp01((1 - progress) / 0.38);
      const pulse = 1 + arc * 0.55;

      return {
        texture,
        position: [
          effect.origin[0] + Math.cos(effect.angle) * particleRadius,
          effect.origin[1] + baseHeight + arc * lift,
          effect.origin[2] + Math.sin(effect.angle) * particleRadius
        ],
        size: [effect.size * pulse, effect.size * pulse],
        uvRect: fallbackUvRect,
        alpha,
        rotation: effect.rotation + effect.spin * effect.age + effect.phase
      };
    });
  }

  return {
    getBillboards,
    trigger,
    update
  };
}
