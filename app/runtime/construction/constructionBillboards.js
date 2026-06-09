const LEAF_DEN_CONSTRUCTION_STAR_COUNT = 12;
const CONSTRUCTION_CLOUD_BURST_STAR_COUNT = 10;
const LEAF_DEN_CONSTRUCTION_BAR_WIDTH = 2.5;
const LEAF_DEN_CONSTRUCTION_BAR_HEIGHT = 0.2;
const LEAF_DEN_CONSTRUCTION_BAR_Y = 2.55;

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

export function getLeafDenConstructionBillboards({
  active = false,
  leafDen = null,
  progress = 0,
  barBackTexture = null,
  barFillTexture = null,
  starTexture = null,
  uvRect,
  nowSeconds = 0
} = {}) {
  if (!active || !Array.isArray(leafDen?.position)) {
    return [];
  }

  const position = leafDen.position;
  const billboards = [];
  const barY = position[1] + LEAF_DEN_CONSTRUCTION_BAR_Y;

  if (barBackTexture) {
    billboards.push({
      texture: barBackTexture,
      position: [position[0], barY, position[2]],
      size: [LEAF_DEN_CONSTRUCTION_BAR_WIDTH, LEAF_DEN_CONSTRUCTION_BAR_HEIGHT],
      uvRect
    });
  }

  if (barFillTexture && progress > 0) {
    const fillWidth = Math.max(0.08, LEAF_DEN_CONSTRUCTION_BAR_WIDTH * 0.9 * progress);
    billboards.push({
      texture: barFillTexture,
      position: [
        position[0] - LEAF_DEN_CONSTRUCTION_BAR_WIDTH * 0.45 + fillWidth * 0.5,
        barY + 0.01,
        position[2] - 0.015
      ],
      size: [fillWidth, LEAF_DEN_CONSTRUCTION_BAR_HEIGHT * 0.68],
      uvRect
    });
  }

  if (!starTexture) {
    return billboards;
  }

  for (let index = 0; index < LEAF_DEN_CONSTRUCTION_STAR_COUNT; index += 1) {
    const angle = index * 2.141 + nowSeconds * (1.8 + (index % 3) * 0.24);
    const pop = 0.5 + 0.5 * Math.sin(nowSeconds * 7.2 + index);
    const radius = 0.8 + (index % 4) * 0.2;
    billboards.push({
      texture: starTexture,
      position: [
        position[0] + Math.cos(angle) * radius,
        position[1] + 0.72 + pop * 0.95,
        position[2] + Math.sin(angle * 1.16) * (radius * 0.72)
      ],
      size: [0.2 + pop * 0.18, 0.2 + pop * 0.18],
      uvRect,
      rotation: angle
    });
  }

  return billboards;
}

export function getConstructionCloudBurstBillboards({
  bursts = [],
  starTexture = null,
  uvRect,
  nowSeconds = 0
} = {}) {
  if (!starTexture || bursts.length <= 0) {
    return [];
  }

  const billboards = [];
  for (const burst of bursts) {
    const position = burst.position;
    const effectAlpha = Math.sin(Math.PI * clamp01(burst.progress));

    for (let index = 0; index < CONSTRUCTION_CLOUD_BURST_STAR_COUNT; index += 1) {
      const angle = index * 2.141 + nowSeconds * (2.6 + (index % 3) * 0.28);
      const pop = 0.5 + 0.5 * Math.sin(nowSeconds * 8.6 + index);
      const radius = (0.54 + (index % 4) * 0.17) * (0.7 + effectAlpha * 0.5);
      billboards.push({
        texture: starTexture,
        position: [
          position[0] + Math.cos(angle) * radius,
          position[1] + 0.54 + pop * 0.88,
          position[2] + Math.sin(angle * 1.16) * (radius * 0.72)
        ],
        size: [
          (0.14 + pop * 0.2) * Math.max(0.12, effectAlpha),
          (0.14 + pop * 0.2) * Math.max(0.12, effectAlpha)
        ],
        uvRect,
        rotation: angle
      });
    }
  }

  return billboards;
}
