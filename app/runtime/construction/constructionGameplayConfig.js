const LEAF_DEN_KIT_PREVIEW_FOOTPRINT = [1.95, 1.45];

export const GAMEPLAY_CONSTRUCTION_CONFIG = Object.freeze({
  previewFootprints: {
    greenhouse: [2.85, 1.7],
    solarStation: [2.2, 2.2],
    trainHouse: [1.7, 1.45],
    houseKit: LEAF_DEN_KIT_PREVIEW_FOOTPRINT
  },
  gridFootprints: {
    greenhouse: Object.freeze({ width: 5, height: 3 }),
    solarStation: Object.freeze({ width: 4, height: 4 }),
    trainHouse: Object.freeze({ width: 3, height: 3 }),
    leafDenKit: Object.freeze({ width: 3, height: 3 })
  },
  leafDenBuiltRotationFootprint: [
    LEAF_DEN_KIT_PREVIEW_FOOTPRINT[0] * 2,
    LEAF_DEN_KIT_PREVIEW_FOOTPRINT[1] * 2
  ],
  placementRotationStep: Math.PI * 0.5,
  leafDenKitSolarStationRadiusMultiplier: 3,
  solarStationFollowDistance: 2.85,
  solarStationFieldMarkedTileLimit: 81,
  solarStationPowerRadiusMarkedTileLimit: 1200
});
