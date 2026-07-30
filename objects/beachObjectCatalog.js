export const BEACH_OBJECT_TYPES = Object.freeze({
  KIOSK: "kiosk",
  BEACH_HOUSE: "beach-house",
  BEVERAGE_STORE: "beverage-store",
  LIFEGUARD_BUILDING: "lifeguard-building",
  WIFI_SPOT: "wifi-spot",
  TOILET_BUILDING: "toilet-building",
  TRASH_CANS: "trash-cans",
  VOLLEYBALL_COURT: "volleyball-court",
  SUN_SHADE: "sun-shade"
});

export const BEACH_OBJECT_CATEGORIES = Object.freeze({
  STATIC: "static",
  BUILDING: "building",
  AMENITY: "amenity"
});

export const BEACH_PLACEMENT_LANES = Object.freeze({
  FIXED: "fixed",
  BUILDING: "building",
  SUN_SHADE: "sun-shade"
});

const SAND_ZONE = "sand";

function createPlacement({
  lane,
  bounds = null,
  widthInTiles = 1,
  depthInTiles = 1
}) {
  return Object.freeze({
    zone: SAND_ZONE,
    lane,
    ...(bounds ? { bounds: Object.freeze({ ...bounds }) } : {}),
    footprint: Object.freeze({
      widthInTiles,
      depthInTiles
    })
  });
}

function createPresentation({ color, benefitIndicator }) {
  return Object.freeze({
    color: Object.freeze([...color]),
    ...(benefitIndicator ? {
      benefitIndicator: Object.freeze({ ...benefitIndicator })
    } : {})
  });
}

function createDefinition({
  type,
  category,
  placement,
  service,
  economy,
  batherInteraction,
  presentation
}) {
  return Object.freeze({
    type,
    category,
    placement,
    ...(service ? { service: Object.freeze(service) } : {}),
    ...(economy ? { economy: Object.freeze(economy) } : {}),
    ...(batherInteraction ? {
      batherInteraction: Object.freeze({ ...batherInteraction })
    } : {}),
    ...(presentation ? { presentation } : {})
  });
}

const BUILDING_PRESENTATIONS = Object.freeze({
  [BEACH_OBJECT_TYPES.BEVERAGE_STORE]: createPresentation({
    benefitIndicator: {
      src: "2d-objects/HUD/money-thumb.png"
    },
    color: [0.92, 0.3, 0.22]
  }),
  [BEACH_OBJECT_TYPES.LIFEGUARD_BUILDING]: createPresentation({
    color: [0.95, 0.76, 0.18]
  }),
  [BEACH_OBJECT_TYPES.WIFI_SPOT]: createPresentation({
    benefitIndicator: {
      src: "2d-objects/HUD/star-HUD.png"
    },
    color: [0.18, 0.56, 0.92]
  }),
  [BEACH_OBJECT_TYPES.TOILET_BUILDING]: createPresentation({
    color: [0.2, 0.78, 0.72]
  }),
  [BEACH_OBJECT_TYPES.TRASH_CANS]: createPresentation({
    color: [0.3, 0.68, 0.3]
  }),
  [BEACH_OBJECT_TYPES.VOLLEYBALL_COURT]: createPresentation({
    color: [0.96, 0.5, 0.18]
  })
});

export const BEACH_OBJECT_DEFINITIONS = Object.freeze({
  [BEACH_OBJECT_TYPES.KIOSK]: createDefinition({
    type: BEACH_OBJECT_TYPES.KIOSK,
    category: BEACH_OBJECT_CATEGORIES.STATIC,
    placement: createPlacement({ lane: BEACH_PLACEMENT_LANES.FIXED })
  }),
  [BEACH_OBJECT_TYPES.BEACH_HOUSE]: createDefinition({
    type: BEACH_OBJECT_TYPES.BEACH_HOUSE,
    category: BEACH_OBJECT_CATEGORIES.STATIC,
    placement: createPlacement({ lane: BEACH_PLACEMENT_LANES.FIXED })
  }),
  [BEACH_OBJECT_TYPES.BEVERAGE_STORE]: createDefinition({
    type: BEACH_OBJECT_TYPES.BEVERAGE_STORE,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "refreshment",
        utility: 70
      },
      revenue: {
        intervalSeconds: 30,
        amountInCents: 100
      }
    },
    batherInteraction: {
      tags: Object.freeze(["drink", "cooling"]),
      heatDemand: 0.8,
      litterRiskBonus: 0.2
    },
    economy: {
      batherPurchasePriceInCents: 100
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.BEVERAGE_STORE]
  }),
  [BEACH_OBJECT_TYPES.LIFEGUARD_BUILDING]: createDefinition({
    type: BEACH_OBJECT_TYPES.LIFEGUARD_BUILDING,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "safety",
        utility: 65
      }
    },
    economy: {
      endOfDayMaintenanceCostInCents: 400,
      publicSupportInCents: 400
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.LIFEGUARD_BUILDING]
  }),
  [BEACH_OBJECT_TYPES.WIFI_SPOT]: createDefinition({
    type: BEACH_OBJECT_TYPES.WIFI_SPOT,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "connectivity",
        utility: 55
      },
      revenue: {
        intervalSeconds: 30,
        amountInCents: 100
      }
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.WIFI_SPOT]
  }),
  [BEACH_OBJECT_TYPES.TOILET_BUILDING]: createDefinition({
    type: BEACH_OBJECT_TYPES.TOILET_BUILDING,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "relief",
        utility: 90
      }
    },
    economy: {
      endOfDayMaintenanceCostInCents: 300,
      publicSupportInCents: 300
    },
    batherInteraction: {
      dirtPerBatherSecond: 0.04
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.TOILET_BUILDING]
  }),
  [BEACH_OBJECT_TYPES.TRASH_CANS]: createDefinition({
    type: BEACH_OBJECT_TYPES.TRASH_CANS,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "cleanliness",
        utility: 50
      }
    },
    economy: {
      publicSupportInCents: 100
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.TRASH_CANS]
  }),
  [BEACH_OBJECT_TYPES.VOLLEYBALL_COURT]: createDefinition({
    type: BEACH_OBJECT_TYPES.VOLLEYBALL_COURT,
    category: BEACH_OBJECT_CATEGORIES.BUILDING,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.BUILDING,
      bounds: { xMin: -24, xMax: 24, zMin: 9, zMax: 11 }
    }),
    service: {
      advertisement: {
        motive: "entertainment",
        utility: 75
      }
    },
    economy: {
      publicSupportInCents: 200
    },
    presentation: BUILDING_PRESENTATIONS[BEACH_OBJECT_TYPES.VOLLEYBALL_COURT]
  }),
  [BEACH_OBJECT_TYPES.SUN_SHADE]: createDefinition({
    type: BEACH_OBJECT_TYPES.SUN_SHADE,
    category: BEACH_OBJECT_CATEGORIES.AMENITY,
    placement: createPlacement({
      lane: BEACH_PLACEMENT_LANES.SUN_SHADE,
      bounds: { xMin: -24, xMax: 24, zMin: 4, zMax: 6 }
    }),
    service: {
      revenue: {
        rewardTiers: Object.freeze([
          Object.freeze({ durationSeconds: 5, amountInCents: 100 }),
          Object.freeze({ durationSeconds: 10, amountInCents: 300 }),
          Object.freeze({ durationSeconds: 15, amountInCents: 500 })
        ])
      }
    },
    economy: {
      purchaseCostInCents: 500,
      firstPurchaseFree: true
    },
    batherInteraction: {
      tags: Object.freeze(["shade", "rest"])
    }
  })
});

export function getBeachObjectDefinition(type) {
  const normalizedType = String(type || "").trim();
  const definition = BEACH_OBJECT_DEFINITIONS[normalizedType];

  if (!definition) {
    throw new Error(`Objeto da praia desconhecido: ${normalizedType}.`);
  }

  return definition;
}

export function getBeachObjectDefinitionsByCategory(category) {
  return Object.freeze(Object.values(BEACH_OBJECT_DEFINITIONS).filter(
    (definition) => definition.category === category
  ));
}
