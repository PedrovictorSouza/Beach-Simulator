export const BATHER_PROFILE_IDS = Object.freeze({
  BALANCED: "balanced",
  CONNECTED: "connected",
  EASYGOING: "easygoing",
  SUN_SENSITIVE: "sun-sensitive"
});

export const BATHER_REACTION_TYPES = Object.freeze({
  ENTERTAINMENT: "entertainment",
  HEAT: "heat",
  TOILET: "toilet",
  WIFI: "wifi"
});

const DEFAULT_REACTIONS = Object.freeze({
  [BATHER_REACTION_TYPES.ENTERTAINMENT]: 1,
  [BATHER_REACTION_TYPES.HEAT]: 1,
  [BATHER_REACTION_TYPES.TOILET]: 1,
  [BATHER_REACTION_TYPES.WIFI]: 1
});

const PROFILE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: BATHER_PROFILE_IDS.BALANCED,
    label: "Balanced",
    reactionMultipliers: DEFAULT_REACTIONS
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.CONNECTED,
    label: "Connected",
    reactionMultipliers: Object.freeze({
      ...DEFAULT_REACTIONS,
      [BATHER_REACTION_TYPES.WIFI]: 0.75
    })
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.EASYGOING,
    label: "Easygoing",
    reactionMultipliers: Object.freeze({
      [BATHER_REACTION_TYPES.ENTERTAINMENT]: 1.25,
      [BATHER_REACTION_TYPES.HEAT]: 1.25,
      [BATHER_REACTION_TYPES.TOILET]: 1.25,
      [BATHER_REACTION_TYPES.WIFI]: 1.25
    })
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.SUN_SENSITIVE,
    label: "Sun Sensitive",
    reactionMultipliers: Object.freeze({
      ...DEFAULT_REACTIONS,
      [BATHER_REACTION_TYPES.HEAT]: 0.7
    })
  })
]);

export function createBatherProfileModel({ random = Math.random } = {}) {
  if (typeof random !== "function") {
    throw new Error("BatherProfileModel precisa de uma funcao random.");
  }

  return Object.freeze({
    createProfile() {
      const sample = Math.max(0, Math.min(0.999999, Number(random()) || 0));
      return PROFILE_DEFINITIONS[Math.floor(sample * PROFILE_DEFINITIONS.length)];
    }
  });
}
