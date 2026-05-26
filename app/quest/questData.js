import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES
} from "../story/sandbotsLexicon.js";

export const QUEST_EVENT = Object.freeze({
  MOVE: "MOVE",
  TALK: "TALK",
  COLLECT: "COLLECT",
  PLACE: "PLACE",
  BUILD: "BUILD",
  PHOTO: "PHOTO",
  UNLOCK: "UNLOCK"
});

export const QUEST_STATUS = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  ACTIVE: "active",
  COMPLETED: "completed"
});

export const SMALL_ISLAND_QUESTS = Object.freeze([
  {
    id: "learn-to-move",
    title: "Take Your First Steps",
    description: "Step away from the crash site and take in the damaged planet.",
    guidance: "Use WASD or the left stick. Any movement confirms control and brings up Chopper's marker.",
    giverId: "chopper",
    status: QUEST_STATUS.ACTIVE,
    objectives: [
      { type: QUEST_EVENT.MOVE, targetId: "player", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["basic-movement"],
      items: []
    },
    nextQuestId: "wake-guide"
  },
  {
    id: "wake-guide",
    title: "Talk to Chopper",
    description: `Chopper saw the crash and picked up a weak signal from ${SANDBOTS_BOT_NAMES.hydro}.`,
    guidance: "Follow Chopper's marker, stand close, then press E to talk.",
    giverId: "chopper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.TALK, targetId: "tangrowth", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["hydro-route-marker"],
      items: []
    },
    nextQuestId: "gather-first-supplies"
  },
  {
    id: "gather-first-supplies",
    title: `Wake up ${SANDBOTS_BOT_NAMES.hydro}`,
    description: `${SANDBOTS_BOT_NAMES.hydro} is dormant near the starter grove. Talk to the bot and bring the water system online.`,
    guidance: `Follow the marker to ${SANDBOTS_BOT_NAMES.hydro}, then interact when the prompt appears.`,
    giverId: "chopper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      {
        type: QUEST_EVENT.UNLOCK,
        targetId: "waterGun",
        required: 1,
        current: 0,
        acceptsRememberedProgress: true
      }
    ],
    errandQuest: {
      taskType: "activation",
      hudText: `Wake up ${SANDBOTS_BOT_NAMES.hydro}`,
      instructionText: `Reach ${SANDBOTS_BOT_NAMES.hydro} and interact to bring ${SANDBOTS_ITEM_NAMES.hydroTool} online.`,
      hook: {
        short: `${SANDBOTS_BOT_NAMES.hydro}'s water core is still answering.`,
        setup: "Chopper picked up a weak wake pulse near the starter grove."
      },
      visibleReward: {
        type: "base-function",
        description: `${SANDBOTS_BOT_NAMES.hydro} comes online and unlocks ${SANDBOTS_ITEM_NAMES.hydroTool} for the first restoration route.`,
        pokedeskEntryId: "thermalGeneratorDiagnostic",
        pokedeskEntryLabel: "Hydro Wake Diagnostic"
      },
      approachChoices: [
        {
          label: "Follow Chopper's marker",
          tradeoff: "Fastest route to the dormant water core."
        },
        {
          label: "Check the crash edge first",
          tradeoff: "A slower route, but it keeps nearby supplies in view."
        }
      ],
      microEvents: [
        {
          progressAt: 1,
          feedback: `Instructions. wake pulse confirmed. ${SANDBOTS_BOT_NAMES.hydro}'s water core is responding.`
        },
        {
          progressAt: 1,
          feedback: "Chopper: good. The island can be watered one patch at a time now. Grim, but measurable."
        }
      ],
      fastResolution: {
        type: "radio-completion",
        description: `Chopper confirms ${SANDBOTS_BOT_NAMES.hydro}'s wake sequence by radio, so the task resolves immediately when the tool comes online.`
      },
      nextHook: "If water can move again, the dry tall grass may show where the colony can safely expand."
    },
    rewards: {
      unlocks: ["water-restoration"],
      items: []
    },
    nextQuestId: "water-first-dry-patch"
  },
  {
    id: "water-first-dry-patch",
    title: "Restore One Dry Patch",
    description: `Use ${SANDBOTS_ITEM_NAMES.hydroTool} on one dry patch to prove the planet can recover.`,
    guidance: `Stand near highlighted dry ground and press Enter to send ${SANDBOTS_BOT_NAMES.hydro}.`,
    giverId: "hydro",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.BUILD, targetId: "revived-grass", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["tutorial-complete"],
      items: []
    },
    nextQuestId: "water-dry-grass"
  },
  {
    id: "water-dry-grass",
    title: "Restore Five Dry Patches",
    description: `Revive enough dry ground for ${SANDBOTS_BOT_NAMES.grow} to trust the route.`,
    guidance: `Keep using ${SANDBOTS_ITEM_NAMES.hydroTool} on highlighted dry patches.`,
    giverId: "leaf-helper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.BUILD, targetId: "revived-grass", required: 5, current: 0 }
    ],
    rewards: {
      unlocks: ["grow-bot-route"],
      items: []
    },
    nextQuestId: "inspect-rustling-grass"
  },
  {
    id: "inspect-rustling-grass",
    title: `Talk to ${SANDBOTS_BOT_NAMES.grow}`,
    description: `${SANDBOTS_BOT_NAMES.grow} is awake and waiting near the restored edge.`,
    guidance: `Stand close to ${SANDBOTS_BOT_NAMES.grow}, then press E to talk and learn ${SANDBOTS_ITEM_NAMES.growTool}.`,
    giverId: "leaf-helper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.TALK, targetId: "leaf-helper", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["leafage"],
      items: []
    },
    nextQuestId: "grow-a-home-patch"
  },
  {
    id: "grow-a-home-patch",
    title: `Grow Four Plants`,
    description: `${SANDBOTS_BOT_NAMES.grow} can thicken restored ground into a cozy living patch.`,
    guidance: `Switch to ${SANDBOTS_ITEM_NAMES.growTool}, choose restored ground, then press Enter four times.`,
    giverId: "leaf-helper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.PLACE, targetId: "leafy-home-patch", required: 4, current: 0 }
    ],
    rewards: {
      unlocks: ["grow-corner-complete"],
      items: []
    },
    nextQuestId: "melt-first-snow"
  },
  {
    id: "melt-first-snow",
    title: "Melt White Ground",
    description: `${SANDBOTS_BOT_NAMES.thermal} can clear white snow. Snow blocks construction zones until it is melted.`,
    guidance: `Use ${SANDBOTS_ITEM_NAMES.thermalTool} on one highlighted white patch.`,
    giverId: "thermal",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.BUILD, targetId: "snow-melted", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["snow-construction-rule"],
      items: []
    },
    nextQuestId: "open-colony-computer"
  },
  {
    id: "open-colony-computer",
    title: "Turn On the Colony Computer",
    description: "The colony computer can call Builder Bot and authorize the first base zone.",
    guidance: "Follow the marker to the colony computer and turn it on.",
    giverId: "chopper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.UNLOCK, targetId: "challenges", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["builder-bot"],
      items: []
    },
    nextQuestId: "build-first-base"
  },
  {
    id: "build-first-base",
    title: "Build the First Base",
    description: `${SANDBOTS_BOT_NAMES.builder} can turn gathered wood into a larger 7x7 base outline.`,
    guidance: "Collect six wood to learn the routine, keep gathering Wood as needed, then build all highlighted border walls.",
    giverId: "builder",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      {
        type: QUEST_EVENT.COLLECT,
        targetId: "wood",
        required: 6,
        current: 0,
        acceptsRememberedProgress: true
      },
      { type: QUEST_EVENT.BUILD, targetId: "foundation-wall", required: 24, current: 0 }
    ],
    rewards: {
      unlocks: ["first-base-built"],
      items: []
    },
    nextQuestId: "chopper-first-habitat-report"
  },
  {
    id: "chopper-first-habitat-report",
    title: "Tell Chopper the Base Is Ready",
    description: "The first base outline is standing. Chopper has one last check-in.",
    guidance: "Return to Chopper for a short final report.",
    giverId: "chopper",
    status: QUEST_STATUS.LOCKED,
    objectives: [
      { type: QUEST_EVENT.TALK, targetId: "chopper-first-habitat-report", required: 1, current: 0 }
    ],
    rewards: {
      unlocks: ["campaign-mvp-complete"],
      items: []
    },
    nextQuestId: null
  }
]);
