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
    reactionMultipliers: DEFAULT_REACTIONS,
    messinessMultiplier: 1,
    beveragePurchaseChance: 0.75,
    boredomRateMultiplier: 1
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.CONNECTED,
    reactionMultipliers: Object.freeze({
      ...DEFAULT_REACTIONS,
      [BATHER_REACTION_TYPES.WIFI]: 0.75
    }),
    messinessMultiplier: 0.75,
    beveragePurchaseChance: 0.65,
    boredomRateMultiplier: 0.9
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.EASYGOING,
    reactionMultipliers: Object.freeze({
      [BATHER_REACTION_TYPES.ENTERTAINMENT]: 1.25,
      [BATHER_REACTION_TYPES.HEAT]: 1.25,
      [BATHER_REACTION_TYPES.TOILET]: 1.25,
      [BATHER_REACTION_TYPES.WIFI]: 1.25
    }),
    messinessMultiplier: 1.35,
    beveragePurchaseChance: 0.82,
    boredomRateMultiplier: 0.72
  }),
  Object.freeze({
    id: BATHER_PROFILE_IDS.SUN_SENSITIVE,
    reactionMultipliers: Object.freeze({
      ...DEFAULT_REACTIONS,
      [BATHER_REACTION_TYPES.HEAT]: 0.7
    }),
    messinessMultiplier: 1.05,
    beveragePurchaseChance: 0.92,
    boredomRateMultiplier: 1.15
  })
]);

const MOOD_MOTIVES = Object.freeze([
  "connectivity",
  "relief",
  "entertainment"
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getMoodBand(score) {
  if (score >= 75) {
    return "happy";
  }

  if (score >= 50) {
    return "okay";
  }

  if (score >= 25) {
    return "uneasy";
  }

  return "upset";
}

export function createBatherMoodSnapshot(bather) {
  const motiveNeeds = bather?.motiveNeeds || {};
  const motiveEntries = MOOD_MOTIVES
    .map((motive) => ({
      motive,
      need: clamp(Number(motiveNeeds[motive]) || 0, 0, 100)
    }));
  const heatNeed = clamp(
    (Number(bather?.heatExposureSeconds) || 0) / 30 * 100,
    0,
    100
  );
  const entries = [
    ...motiveEntries,
    { motive: "heat", need: heatNeed }
  ];
  const averageNeed = entries.reduce((total, entry) => total + entry.need, 0) /
    entries.length;
  const complaintPenalty = bather?.complaint ? 18 : 0;
  const departurePenalty = bather?.departing ? 28 : 0;
  const score = Math.round(clamp(
    100 - averageNeed - complaintPenalty - departurePenalty,
    0,
    100
  ));
  const strongestNeed = entries.reduce((current, entry) => (
    entry.need > current.need ? entry : current
  ), entries[0]);

  return Object.freeze({
    score,
    band: getMoodBand(score),
    strongestNeed: Object.freeze({
      motive: strongestNeed.motive,
      value: Math.round(strongestNeed.need)
    }),
    complaint: Boolean(bather?.complaint),
    departing: Boolean(bather?.departing)
  });
}

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
