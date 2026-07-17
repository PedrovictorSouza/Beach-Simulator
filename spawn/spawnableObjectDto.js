import { BEACH_ZONES } from "../terrain/beachGrid.js";

export const SPAWNABLE_OBJECT_TYPES = Object.freeze({
  BATHER: "bather",
  CRAB: "crab",
  JELLYFISH: "jellyfish",
  SHARK: "shark",
  POOP: "poop",
  BANANA: "banana",
  PAPER: "paper",
  CAN: "can",
  BOTTLE: "bottle",
  MONEY: "money",
  RING: "ring",
  VALUABLE: "valuable",
  LOG: "log",
  STONE: "stone",
  SYRINGE: "syringe"
});

export const SPAWNABLE_OBJECT_KINDS = Object.freeze({
  AGENT: "agent",
  STATIC: "static"
});

export const SPAWNABLE_OBJECT_CATEGORIES = Object.freeze({
  VISITOR: "visitor",
  WILDLIFE: "wildlife",
  LITTER: "litter",
  COLLECTIBLE: "collectible",
  OBSTACLE: "obstacle",
  HAZARD: "hazard"
});

export const SPAWN_SOURCES = Object.freeze({
  SPAWN_MANAGER: "spawn-manager",
  NPC_DROP: "npc-drop"
});

export const BEHAVIOR_PROFILES = Object.freeze({
  BATHER: "bather",
  CRAB: "crab",
  JELLYFISH: "jellyfish",
  SHARK: "shark"
});

export const SPAWNABLE_OBJECT_TRAITS = Object.freeze({
  VISITOR: "visitor",
  DIRTY: "dirty",
  PLAYER_REMOVABLE: "player-removable",
  PICKUP: "pickup",
  OBSTACLE: "obstacle",
  PINCHES_BATHERS: "pinches-bathers",
  STINGS_BATHERS: "stings-bathers",
  PREDATOR: "predator",
  HEALTH_HAZARD: "health-hazard"
});

const ALLOWED_KINDS = new Set(Object.values(SPAWNABLE_OBJECT_KINDS));
const ALLOWED_CATEGORIES = new Set(Object.values(SPAWNABLE_OBJECT_CATEGORIES));
const ALLOWED_ZONES = new Set(Object.values(BEACH_ZONES));
const ALLOWED_SOURCES = new Set(Object.values(SPAWN_SOURCES));
const ALLOWED_BEHAVIORS = new Set(Object.values(BEHAVIOR_PROFILES));
const ALLOWED_TRAITS = new Set(Object.values(SPAWNABLE_OBJECT_TRAITS));

function normalizeEnumList(values, allowedValues, fieldName) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${fieldName} precisa ter pelo menos um valor.`);
  }

  const normalizedValues = [...new Set(values)];

  if (normalizedValues.some((value) => !allowedValues.has(value))) {
    throw new Error(`${fieldName} contem um valor desconhecido.`);
  }

  return Object.freeze(normalizedValues);
}

export function createSpawnableObjectDto({
  type,
  kind,
  category,
  spawnZones,
  spawnSources,
  behaviorProfile = null,
  traits
}) {
  const normalizedType = String(type || "").trim();

  if (!normalizedType) {
    throw new Error("SpawnableObjectDto precisa de type.");
  }

  if (!ALLOWED_KINDS.has(kind)) {
    throw new Error("SpawnableObjectDto recebeu kind desconhecido.");
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error("SpawnableObjectDto recebeu category desconhecida.");
  }

  if (kind === SPAWNABLE_OBJECT_KINDS.AGENT) {
    if (!ALLOWED_BEHAVIORS.has(behaviorProfile)) {
      throw new Error("Objetos agent precisam de behaviorProfile conhecido.");
    }
  } else if (behaviorProfile !== null) {
    throw new Error("Objetos static nao podem declarar behaviorProfile.");
  }

  return Object.freeze({
    type: normalizedType,
    kind,
    category,
    spawnZones: normalizeEnumList(spawnZones, ALLOWED_ZONES, "spawnZones"),
    spawnSources: normalizeEnumList(spawnSources, ALLOWED_SOURCES, "spawnSources"),
    behaviorProfile,
    traits: normalizeEnumList(traits, ALLOWED_TRAITS, "traits")
  });
}

const define = (definition) => createSpawnableObjectDto(definition);
const MANAGER_SOURCE = Object.freeze([SPAWN_SOURCES.SPAWN_MANAGER]);
const MANAGER_OR_NPC_SOURCE = Object.freeze([
  SPAWN_SOURCES.SPAWN_MANAGER,
  SPAWN_SOURCES.NPC_DROP
]);
const SAND_ZONE = Object.freeze([BEACH_ZONES.SAND]);
const SEA_ZONE = Object.freeze([BEACH_ZONES.SEA]);

export const SPAWNABLE_OBJECT_CATALOG = Object.freeze({
  [SPAWNABLE_OBJECT_TYPES.BATHER]: define({
    type: SPAWNABLE_OBJECT_TYPES.BATHER,
    kind: SPAWNABLE_OBJECT_KINDS.AGENT,
    category: SPAWNABLE_OBJECT_CATEGORIES.VISITOR,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    behaviorProfile: BEHAVIOR_PROFILES.BATHER,
    traits: [SPAWNABLE_OBJECT_TRAITS.VISITOR]
  }),
  [SPAWNABLE_OBJECT_TYPES.CRAB]: define({
    type: SPAWNABLE_OBJECT_TYPES.CRAB,
    kind: SPAWNABLE_OBJECT_KINDS.AGENT,
    category: SPAWNABLE_OBJECT_CATEGORIES.WILDLIFE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    behaviorProfile: BEHAVIOR_PROFILES.CRAB,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE,
      SPAWNABLE_OBJECT_TRAITS.PINCHES_BATHERS
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.JELLYFISH]: define({
    type: SPAWNABLE_OBJECT_TYPES.JELLYFISH,
    kind: SPAWNABLE_OBJECT_KINDS.AGENT,
    category: SPAWNABLE_OBJECT_CATEGORIES.WILDLIFE,
    spawnZones: SEA_ZONE,
    spawnSources: MANAGER_SOURCE,
    behaviorProfile: BEHAVIOR_PROFILES.JELLYFISH,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE,
      SPAWNABLE_OBJECT_TRAITS.STINGS_BATHERS
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.SHARK]: define({
    type: SPAWNABLE_OBJECT_TYPES.SHARK,
    kind: SPAWNABLE_OBJECT_KINDS.AGENT,
    category: SPAWNABLE_OBJECT_CATEGORIES.WILDLIFE,
    spawnZones: SEA_ZONE,
    spawnSources: MANAGER_SOURCE,
    behaviorProfile: BEHAVIOR_PROFILES.SHARK,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE,
      SPAWNABLE_OBJECT_TRAITS.PREDATOR
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.POOP]: define({
    type: SPAWNABLE_OBJECT_TYPES.POOP,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.LITTER,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.BANANA]: define({
    type: SPAWNABLE_OBJECT_TYPES.BANANA,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.LITTER,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_OR_NPC_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.PAPER]: define({
    type: SPAWNABLE_OBJECT_TYPES.PAPER,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.LITTER,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_OR_NPC_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.CAN]: define({
    type: SPAWNABLE_OBJECT_TYPES.CAN,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.LITTER,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_OR_NPC_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.BOTTLE]: define({
    type: SPAWNABLE_OBJECT_TYPES.BOTTLE,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.LITTER,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_OR_NPC_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.MONEY]: define({
    type: SPAWNABLE_OBJECT_TYPES.MONEY,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.COLLECTIBLE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [SPAWNABLE_OBJECT_TRAITS.PICKUP]
  }),
  [SPAWNABLE_OBJECT_TYPES.RING]: define({
    type: SPAWNABLE_OBJECT_TYPES.RING,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.COLLECTIBLE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [SPAWNABLE_OBJECT_TRAITS.PICKUP]
  }),
  [SPAWNABLE_OBJECT_TYPES.VALUABLE]: define({
    type: SPAWNABLE_OBJECT_TYPES.VALUABLE,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.COLLECTIBLE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [SPAWNABLE_OBJECT_TRAITS.PICKUP]
  }),
  [SPAWNABLE_OBJECT_TYPES.LOG]: define({
    type: SPAWNABLE_OBJECT_TYPES.LOG,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.OBSTACLE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.OBSTACLE,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.STONE]: define({
    type: SPAWNABLE_OBJECT_TYPES.STONE,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.OBSTACLE,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.OBSTACLE,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE
    ]
  }),
  [SPAWNABLE_OBJECT_TYPES.SYRINGE]: define({
    type: SPAWNABLE_OBJECT_TYPES.SYRINGE,
    kind: SPAWNABLE_OBJECT_KINDS.STATIC,
    category: SPAWNABLE_OBJECT_CATEGORIES.HAZARD,
    spawnZones: SAND_ZONE,
    spawnSources: MANAGER_SOURCE,
    traits: [
      SPAWNABLE_OBJECT_TRAITS.DIRTY,
      SPAWNABLE_OBJECT_TRAITS.OBSTACLE,
      SPAWNABLE_OBJECT_TRAITS.PLAYER_REMOVABLE,
      SPAWNABLE_OBJECT_TRAITS.HEALTH_HAZARD
    ]
  })
});

export function getSpawnableObjectDto(type) {
  const dto = SPAWNABLE_OBJECT_CATALOG[type];

  if (!dto) {
    throw new Error(`Objeto spawnable desconhecido: ${type}.`);
  }

  return dto;
}
