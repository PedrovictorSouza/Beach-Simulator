import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES,
  SANDBOTS_WORLD_TERMS
} from "./sandbotsLexicon.js";

export const MECHANIC_PROMISE_PAYOFF_IDS = Object.freeze({
  BUILDER_CALLSIGN: "builder-callsign",
  HYDRO_JET: "hydro-jet",
  BIO_GROW: "bio-grow",
  WORKBENCH: "workbench",
  COLONY_TERMINAL: "colony-terminal",
  SOLAR_STATION: "solar-station",
  HOUSE_KIT: "house-kit"
});

const REQUIRED_PROMISE_PAYOFF_FIELDS = Object.freeze([
  "id",
  "label",
  "macroRole",
  "requires",
  "opens",
  "worldObject",
  "playerAction",
  "immediateFeedback",
  "systemConsequence",
  "narrativeMeaning",
  "futureDependency"
]);

function freezeEntry(entry) {
  return Object.freeze({ ...entry });
}

export const MECHANIC_PROMISE_PAYOFF_MATRIX = Object.freeze([
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.BUILDER_CALLSIGN,
    label: "Builder callsign",
    macroRole: "identity",
    requires: [],
    opens: [MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET],
    worldObject: "Name-entry keyboard and Colony Terminal registry",
    playerAction: "Enter and confirm a callsign during onboarding.",
    immediateFeedback: `${SANDBOTS_BOT_NAMES.scout} acknowledges the callsign and the ${SANDBOTS_WORLD_TERMS.terminal} logs it.`,
    systemConsequence: "The saved player profile stores the callsign and triggers autosave.",
    narrativeMeaning: "The Builder frame is a named colony actor, not a disposable profile slot.",
    futureDependency: "House Kit issue and House placement feedback reuse the callsign."
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET,
    label: SANDBOTS_ITEM_NAMES.hydroTool,
    macroRole: "water-restoration",
    requires: [MECHANIC_PROMISE_PAYOFF_IDS.BUILDER_CALLSIGN],
    opens: [MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW],
    worldObject: `${SANDBOTS_BOT_NAMES.hydro} and dry ground`,
    playerAction: "Mark dry ground or thirsty plants with the field action.",
    immediateFeedback: `${SANDBOTS_BOT_NAMES.hydro} moves, water appears, and the tile state changes.`,
    systemConsequence: "Dry terrain becomes restored ground and Hydro-related quests progress.",
    narrativeMeaning: "Water circulation is returning one visible patch at a time.",
    futureDependency: `${SANDBOTS_ITEM_NAMES.growTool} depends on restored ground created by ${SANDBOTS_ITEM_NAMES.hydroTool}.`
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW,
    label: SANDBOTS_ITEM_NAMES.growTool,
    macroRole: "soil-growth",
    requires: [MECHANIC_PROMISE_PAYOFF_IDS.HYDRO_JET],
    opens: [
      MECHANIC_PROMISE_PAYOFF_IDS.WORKBENCH,
      MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL
    ],
    worldObject: `${SANDBOTS_BOT_NAMES.grow} and restored ground`,
    playerAction: "Use Bio-Grow on restored ground.",
    immediateFeedback: "A plant object appears or a colony-zone patch reacts.",
    systemConsequence: "Green corners, colony checks, and Grow Bot requests progress.",
    narrativeMeaning: "Soil recovery becomes living colony-zone support.",
    futureDependency: "Plant recovery supports colony viability, bot requests, and later shelter context."
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.WORKBENCH,
    label: "Workbench",
    macroRole: "fabrication",
    requires: [MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW],
    opens: [MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION],
    worldObject: "Workbench station",
    playerAction: "Prepare or place available construction protocols.",
    immediateFeedback: "Workbench UI shows protocol status, material readiness, and action labels.",
    systemConsequence: "Physical kits enter the bag or start placement preview.",
    narrativeMeaning: "The colony fabricates practical hardware instead of buying items.",
    futureDependency: "Prepared kits become Solar Station, House Kit, and other placeable structures."
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL,
    label: SANDBOTS_WORLD_TERMS.terminal,
    macroRole: "authorization",
    requires: [MECHANIC_PROMISE_PAYOFF_IDS.BIO_GROW],
    opens: [MECHANIC_PROMISE_PAYOFF_IDS.HOUSE_KIT],
    worldObject: SANDBOTS_WORLD_TERMS.terminal,
    playerAction: "Log viability reports and issue authorized protocols.",
    immediateFeedback: "Terminal cards, action labels, notices, and story beats confirm protocol state.",
    systemConsequence: "Colony checks unlock and House Kit authorization becomes available.",
    narrativeMeaning: "Progress is planetary viability, not money or shopping.",
    futureDependency: "Terminal authorization gates shelter expansion and future colony protocols."
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION,
    label: SANDBOTS_ITEM_NAMES.solarStation,
    macroRole: "power-zone",
    requires: [MECHANIC_PROMISE_PAYOFF_IDS.WORKBENCH],
    opens: [MECHANIC_PROMISE_PAYOFF_IDS.HOUSE_KIT],
    worldObject: SANDBOTS_ITEM_NAMES.solarStation,
    playerAction: "Place the Solar Station on valid open terrain.",
    immediateFeedback: "The station appears and blue cells show where shelters can be built.",
    systemConsequence: "House Kit placement becomes valid inside the support radius.",
    narrativeMeaning: "Power defines where the first human-ready shelter can safely exist.",
    futureDependency: "House placement and shelter progression depend on the powered support zone."
  }),
  freezeEntry({
    id: MECHANIC_PROMISE_PAYOFF_IDS.HOUSE_KIT,
    label: "House Kit",
    macroRole: "shelter",
    requires: [
      MECHANIC_PROMISE_PAYOFF_IDS.COLONY_TERMINAL,
      MECHANIC_PROMISE_PAYOFF_IDS.SOLAR_STATION
    ],
    opens: [],
    worldObject: "House Kit preview and placed House",
    playerAction: "Place the House Kit inside a powered support zone.",
    immediateFeedback: "The preview validates cells, the placed House appears, and the callsign is registered.",
    systemConsequence: "The kit is consumed, House state is saved, and shelter tasks progress.",
    narrativeMeaning: "The first shelter proves the restored planet can support human habitation.",
    futureDependency: "House furniture, marking ownership, and later colony comfort beats depend on it."
  })
]);

export function listMechanicPromisePayoffs() {
  return MECHANIC_PROMISE_PAYOFF_MATRIX;
}

export function getMechanicPromisePayoffById(id) {
  return MECHANIC_PROMISE_PAYOFF_MATRIX.find((entry) => entry.id === id) || null;
}

export function validateMechanicPromisePayoffMatrix({
  matrix = MECHANIC_PROMISE_PAYOFF_MATRIX,
  requiredIds = Object.values(MECHANIC_PROMISE_PAYOFF_IDS)
} = {}) {
  const errors = [];
  const seenIds = new Set();
  const entryIndexesById = new Map();

  matrix.forEach((entry, index) => {
    const id = entry?.id || null;
    if (!id) {
      errors.push({ type: "missing-id", index });
    } else if (seenIds.has(id)) {
      errors.push({ type: "duplicate-id", id, index });
    } else {
      seenIds.add(id);
      entryIndexesById.set(id, index);
    }

    REQUIRED_PROMISE_PAYOFF_FIELDS.forEach((field) => {
      if (Array.isArray(entry?.[field])) {
        return;
      }
      if (!String(entry?.[field] || "").trim()) {
        errors.push({ type: "missing-field", id, index, field });
      }
    });

    ["requires", "opens"].forEach((field) => {
      if (!Array.isArray(entry?.[field])) {
        errors.push({ type: "invalid-link-list", id, index, field });
      }
    });
  });

  requiredIds.forEach((id) => {
    if (!seenIds.has(id)) {
      errors.push({ type: "missing-required-mechanic", id });
    }
  });

  matrix.forEach((entry, index) => {
    const id = entry?.id || null;
    if (!id) return;

    (Array.isArray(entry.requires) ? entry.requires : []).forEach((requiredId) => {
      const requiredIndex = entryIndexesById.get(requiredId);
      if (requiredIndex === undefined) {
        errors.push({ type: "missing-required-link", id, index, requiredId });
      } else if (requiredIndex >= index) {
        errors.push({ type: "future-required-link", id, index, requiredId });
      }
    });

    (Array.isArray(entry.opens) ? entry.opens : []).forEach((openedId) => {
      const openedIndex = entryIndexesById.get(openedId);
      if (openedIndex === undefined) {
        errors.push({ type: "missing-opened-link", id, index, openedId });
      } else if (openedIndex <= index) {
        errors.push({ type: "past-opened-link", id, index, openedId });
      }
    });
  });

  return Object.freeze(errors.map((error) => Object.freeze(error)));
}
