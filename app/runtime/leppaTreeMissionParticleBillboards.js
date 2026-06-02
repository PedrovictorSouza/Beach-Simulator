export function getLeppaTreeMissionParticleBillboards({
  active,
  leppaTree,
  texture,
  uvRect,
  now,
  clamp01,
  config
}) {
  if (!active || !Array.isArray(leppaTree?.position) || !texture) {
    return [];
  }

  const time = now * 0.001;
  const [treeX, treeY, treeZ] = leppaTree.position;

  return Array.from({ length: config.count }, (_, index) => {
    const cycle = (time * 0.38 + index * 0.137) % 1;
    const angle = time * (0.68 + (index % 3) * 0.08) + index * 2.399;
    const radius =
      config.radius *
      (0.54 + (index % 4) * 0.12 + Math.sin(time * 1.7 + index) * 0.035);
    const fadeIn = clamp01(cycle / 0.22);
    const fadeOut = clamp01((1 - cycle) / 0.28);
    const pulse = 0.82 + Math.sin(time * 5.2 + index * 1.31) * 0.18;
    const size = (0.15 + (index % 3) * 0.024) * pulse * (1 - cycle * 0.18);

    return {
      texture,
      position: [
        treeX + Math.cos(angle) * radius,
        treeY + config.baseHeight + cycle * config.height,
        treeZ + Math.sin(angle) * radius
      ],
      size: [size, size],
      uvRect,
      alpha: fadeIn * fadeOut,
      rotation: angle * 0.18
    };
  });
}
