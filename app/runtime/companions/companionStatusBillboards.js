import {
  CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET,
  CHARMANDER_CARBON_BAR_HEIGHT,
  CHARMANDER_CARBON_BAR_WIDTH,
  CHARMANDER_CARBON_BAR_Y_OFFSET,
  SQUIRTLE_WATER_STAMINA_BAR_HEIGHT,
  SQUIRTLE_WATER_STAMINA_BAR_WIDTH
} from "../fieldMoveRuntime/fieldMoveTuning.js";

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function getBillboardRight(right = null) {
  return Array.isArray(right) ? right : [1, 0, 0];
}

function offsetTowardCamera(position, amount, cameraDirection = null) {
  if (!Array.isArray(cameraDirection)) {
    return position;
  }

  return [
    position[0] + cameraDirection[0] * amount,
    position[1] + cameraDirection[1] * amount,
    position[2] + cameraDirection[2] * amount
  ];
}

export function getSquirtleStaminaBillboards({
  position = null,
  fillTexture = null,
  uvRect = [0, 0, 1, 1],
  stamina = null,
  billboardRight = null
} = {}) {
  if (!Array.isArray(position) || !fillTexture) {
    return [];
  }

  const ratio = clamp01(Number(stamina?.visualCurrent || 0) / Number(stamina?.max || 0));
  const barPosition = [
    position[0],
    (position[1] || 0) + 1.25,
    position[2]
  ];
  const billboards = [];

  if (ratio > 0.02) {
    const fillWidth = SQUIRTLE_WATER_STAMINA_BAR_WIDTH * ratio;
    const quadRight = getBillboardRight(billboardRight);
    const fillCenterOffset = -(SQUIRTLE_WATER_STAMINA_BAR_WIDTH * 0.5) + (fillWidth * 0.5);
    const fillUvRect = [
      uvRect[0],
      uvRect[1],
      uvRect[0] + ((uvRect[2] - uvRect[0]) * ratio),
      uvRect[3]
    ];

    billboards.push({
      texture: fillTexture,
      position: [
        barPosition[0] + (quadRight[0] * fillCenterOffset),
        barPosition[1] + ((quadRight[1] || 0) * fillCenterOffset),
        barPosition[2] + (quadRight[2] * fillCenterOffset)
      ],
      size: [fillWidth, SQUIRTLE_WATER_STAMINA_BAR_HEIGHT],
      uvRect: fillUvRect,
      alpha: 0.95
    });
  }

  return billboards;
}

export function getCharmanderCarbonBillboards({
  position = null,
  fillTexture = null,
  backTexture = null,
  uvRect = [0, 0, 1, 1],
  energy = null,
  billboardRight = null,
  cameraDirection = null
} = {}) {
  if (!Array.isArray(position) || !fillTexture) {
    return [];
  }

  const ratio = clamp01(Number(energy?.visualCurrent || 0));
  const barPosition = [
    position[0],
    (position[1] || 0) + CHARMANDER_CARBON_BAR_Y_OFFSET,
    position[2]
  ];
  const billboards = [];

  if (backTexture) {
    billboards.push({
      texture: backTexture,
      position: barPosition,
      size: [CHARMANDER_CARBON_BAR_WIDTH, CHARMANDER_CARBON_BAR_HEIGHT],
      uvRect,
      alpha: 0.88
    });
  }

  if (ratio > 0.02) {
    const fillWidth = CHARMANDER_CARBON_BAR_WIDTH * ratio;
    const quadRight = getBillboardRight(billboardRight);
    const fillCenterOffset = -(CHARMANDER_CARBON_BAR_WIDTH * 0.5) + (fillWidth * 0.5);
    const fillUvRect = [
      uvRect[0],
      uvRect[1],
      uvRect[0] + ((uvRect[2] - uvRect[0]) * ratio),
      uvRect[3]
    ];

    billboards.push({
      texture: fillTexture,
      position: offsetTowardCamera([
        barPosition[0] + (quadRight[0] * fillCenterOffset),
        barPosition[1] + ((quadRight[1] || 0) * fillCenterOffset),
        barPosition[2] + (quadRight[2] * fillCenterOffset)
      ], CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET, cameraDirection),
      size: [fillWidth, CHARMANDER_CARBON_BAR_HEIGHT],
      uvRect: fillUvRect,
      alpha: 0.96
    });
  }

  return billboards;
}
