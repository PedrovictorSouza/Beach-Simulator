export function getBulbasaurInteractionRadiusGizmoBillboards({
  encounter,
  texture,
  uvRect,
  now,
  config
}) {
  if (!encounter?.visible || !Array.isArray(encounter.position) || !texture) {
    return [];
  }

  const [centerX, centerY, centerZ] = encounter.position;
  const time = now * 0.001;

  return Array.from({ length: config.dotCount }, (_, index) => {
    const angle = (index / config.dotCount) * Math.PI * 2;
    const pulse = 0.82 + Math.sin(time * 4 + index * 0.71) * 0.18;
    const size = config.dotSize * pulse;

    return {
      texture,
      position: [
        centerX + Math.cos(angle) * config.interactDistance,
        centerY + 0.14,
        centerZ + Math.sin(angle) * config.interactDistance
      ],
      size: [size, size],
      uvRect,
      alpha: 0.74,
      rotation: angle + time * 0.25
    };
  });
}
