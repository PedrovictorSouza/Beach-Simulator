export function createTreeRevivalLeafBurstRuntime({
  clamp01,
  easeOutCubic,
  lerp,
  random = Math.random,
  config
}) {
  let bursts = [];

  function queue(position, sourceId = "tree") {
    if (!Array.isArray(position)) {
      return;
    }

    const burstId = `tree-revival-leaves-${sourceId}-${bursts.length}`;
    const leaves = [];

    for (let index = 0; index < config.count; index += 1) {
      const angle =
        (index / config.count) * Math.PI * 2 +
        (random() - 0.5) * 0.72;
      const distance = 0.16 + random() * 0.78;
      const speed = config.drift * (0.55 + random() * 0.75);
      const size = lerp(config.sizeMin, config.sizeMax, random());

      leaves.push({
        age: 0,
        duration: config.duration * (0.72 + random() * 0.42),
        position: [
          position[0] + Math.cos(angle) * distance,
          position[1] + config.baseHeight + random() * config.heightRange,
          position[2] + Math.sin(angle) * distance
        ],
        velocity: [
          Math.cos(angle) * speed,
          0.34 + random() * 0.46,
          Math.sin(angle) * speed
        ],
        size,
        phase: random() * Math.PI * 2,
        spin: (random() < 0.5 ? -1 : 1) * (3.2 + random() * 5.6),
        flipSpeed: 7.2 + random() * 7.6,
        driftPhase: random() * Math.PI * 2
      });
    }

    bursts.push({
      id: burstId,
      leaves
    });
  }

  function update(deltaTime) {
    if (!bursts.length) {
      return;
    }

    bursts = bursts.filter((burst) => {
      burst.leaves = burst.leaves.filter((leaf) => {
        leaf.age += deltaTime;
        leaf.velocity[1] -= config.gravity * deltaTime;
        leaf.position[0] += leaf.velocity[0] * deltaTime;
        leaf.position[1] += leaf.velocity[1] * deltaTime;
        leaf.position[2] += leaf.velocity[2] * deltaTime;
        leaf.position[0] += Math.sin(leaf.age * 6.1 + leaf.driftPhase) * 0.08 * deltaTime;
        leaf.position[2] += Math.cos(leaf.age * 5.4 + leaf.driftPhase) * 0.08 * deltaTime;

        return leaf.age < leaf.duration;
      });

      return burst.leaves.length > 0;
    });
  }

  function appendBillboards({ billboards, texture, uvRect } = {}) {
    if (!texture || !Array.isArray(billboards) || !bursts.length) {
      return;
    }

    for (const burst of bursts) {
      for (const leaf of burst.leaves) {
        const progress = clamp01(leaf.age / Math.max(0.001, leaf.duration));
        const fadeProgress = clamp01((progress - 0.48) / 0.52);
        const alpha = 1 - easeOutCubic(fadeProgress);
        const flip = Math.abs(Math.cos(leaf.age * leaf.flipSpeed + leaf.phase));
        const width = leaf.size * lerp(0.18, 1, flip);
        const height = leaf.size * lerp(0.86, 1.18, 1 - flip);

        billboards.push({
          texture,
          position: leaf.position,
          size: [width, height],
          uvRect,
          alpha,
          rotation: leaf.phase + leaf.spin * leaf.age
        });
      }
    }
  }

  return {
    queue,
    update,
    appendBillboards
  };
}
