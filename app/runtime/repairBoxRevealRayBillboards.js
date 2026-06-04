export function getRepairBoxRevealRayBillboards({
  target,
  texture,
  now,
  uvRect,
  clamp01,
  config
}) {
  if (!texture || !target?.position) {
    return [];
  }

  const progress = clamp01(Number(target.progress || 0));
  const charge = Math.sin(clamp01(progress / config.chargeProgressMax) * Math.PI * 0.5);
  const time = now * 0.001;

  return Array.from({ length: config.count }, (_, index) => {
    const lane = index / config.count;
    const cycle = (time * (0.72 + charge * 1.2) + lane) % 1;
    const angle = lane * Math.PI * 2 + time * (0.7 + charge * 2.2);
    const radius = 0.14 + cycle * (0.62 + charge * 0.34);
    const lift = 0.14 + cycle * (1.32 + charge * 0.54);
    const size =
      config.baseSize *
      (0.8 + charge * 1.15) *
      (1 - cycle * 0.34);

    return {
      texture,
      position: [
        target.position[0] + Math.cos(angle) * radius,
        target.position[1] + lift,
        target.position[2] + Math.sin(angle) * radius
      ],
      size: [size * 0.72, size * 1.9],
      uvRect,
      alpha: 0.38 + charge * 0.5,
      rotation: angle + Math.PI * 0.5
    };
  });
}
