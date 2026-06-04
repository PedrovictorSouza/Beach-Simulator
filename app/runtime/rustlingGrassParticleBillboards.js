export function getRustlingGrassParticleBillboards(groundGrassPatch, texture, now, uvRect) {
  if (!texture) {
    return [];
  }

  const time = now * 0.001;

  return [0, 1, 2, 3, 4].map((index) => {
    const cycle = (time * 0.58 + index * 0.19) % 1;
    const angle = time * 1.7 + index * 1.38;
    const radius = 0.18 + (index % 3) * 0.08;
    const size = (0.13 + (index % 2) * 0.025) * (1 - cycle * 0.28);

    return {
      texture,
      position: [
        groundGrassPatch.position[0] + Math.cos(angle) * radius,
        groundGrassPatch.position[1] + 0.38 + cycle * 0.58,
        groundGrassPatch.position[2] + Math.sin(angle) * radius
      ],
      size: [size, size],
      uvRect
    };
  });
}
