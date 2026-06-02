export function getSavePointStarBillboards({
  logChair,
  texture,
  uvRect,
  now,
  clamp01,
  config
}) {
  if (!Array.isArray(logChair?.position) || !texture) {
    return [];
  }

  const time = now * 0.001;
  const [saveX, saveY, saveZ] = logChair.position;

  return Array.from({ length: config.count }, (_, index) => {
    const cycle =
      (time / config.duration + index / config.count) % 1;
    const angle = time * (0.84 + (index % 3) * 0.11) + index * 2.39996;
    const radius = config.radius * (0.34 + cycle * 0.66);
    const fadeIn = clamp01(cycle / 0.16);
    const fadeOut = clamp01((1 - cycle) / 0.28);
    const pulse = 0.78 + Math.sin(time * 7.2 + index * 1.37) * 0.16;
    const size = (0.12 + (index % 3) * 0.024) * pulse * (1 + cycle * 0.18);

    return {
      texture,
      position: [
        saveX + Math.cos(angle) * radius,
        saveY + 0.24 + cycle * config.height,
        saveZ + Math.sin(angle) * radius
      ],
      size: [size, size],
      uvRect,
      alpha: fadeIn * fadeOut,
      rotation: angle * 0.22 + time * 0.45
    };
  });
}
