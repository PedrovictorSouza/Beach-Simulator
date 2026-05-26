export const TASK_KIND = Object.freeze({
  MAIN: "main",
  COLONY: "colony",
  OPTIONAL: "optional"
});

export const TASK_STATUS = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  ACTIVE: "active",
  COMPLETED: "completed"
});

export const TASK_OBJECTIVE_KIND = Object.freeze({
  FACT: "fact",
  COUNTER: "counter",
  EVENT: "event",
  INVENTORY: "inventory",
  CUSTOM: "custom"
});

export const TASK_EVENT = Object.freeze({
  MOVE: "move",
  TALK: "talk",
  COLLECT: "collect",
  PLACE: "place",
  BUILD: "build",
  RESTORE: "restore",
  UNLOCK: "unlock",
  INSPECT: "inspect",
  TERMINAL_ACTION: "terminal-action",
  STORY_BEAT_COMPLETE: "story-beat-complete"
});

export const TASK_EFFECT = Object.freeze({
  SET_FACT: "set-fact",
  INCREMENT_FACT: "increment-fact",
  UNLOCK: "unlock",
  NOTICE: "notice",
  TRACK_TASK: "track-task",
  OPEN_TERMINAL: "open-terminal",
  OPEN_POKEDEX: "open-pokedex",
  AUTOSAVE: "autosave"
});

export const TASK_FACT_IDS = Object.freeze({
  PLAYER_MOVED_AFTER_CRASH: "player.movedAfterCrash",
  CHOPPER_FIRST_CONTACT: "bot.chopper.firstContact",
  HYDRO_AWAKE: "bot.hydro.awake",
  HYDRO_TOOL_UNLOCKED: "ability.hydroTool.unlocked",
  FIRST_DRY_PATCH_RESTORED: "world.dryPatch.firstRestored",
  DRY_GRASS_RESTORED_COUNT: "world.dryGrass.restoredCount",
  LEPPA_TREE_REVIVED: "world.leppaTree.revived",
  PULSE_BERRY_GIFT_COMPLETE: "request.pulseBerry.giftComplete",
  GROW_MET: "bot.grow.met",
  GROW_TOOL_UNLOCKED: "ability.growTool.unlocked",
  FIRST_HABITAT_PATCH_COUNT: "world.firstHabitat.patchCount",
  THERMAL_CABIN_PLACED: "build.thermalCabin.placed",
  WHITE_GROUND_CLEARED: "world.whiteGround.clearedCount",
  COLONY_TERMINAL_UNLOCKED: "colony.terminal.unlocked",
  TERMINAL_INSPECTED: "colony.terminal.inspected",
  FIRST_BASE_WOOD_COLLECTED: "build.firstBase.woodCollected",
  FIRST_BASE_WALLS_BUILT: "build.firstBase.wallsBuilt",
  FIRST_BASE_READY: "build.firstBase.ready",
  CHOPPER_BASE_REPORT_COMPLETE: "chapter.mvp.chopperBaseReportComplete",
  MVP_CHAPTER_COMPLETE: "chapter.mvp.completed"
});

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function factObjective({
  id,
  title,
  description,
  factId,
  required = true,
  legacyFieldTaskId = null,
  hudDisplayMode = null,
  hudIllustration = null
}) {
  return {
    id,
    title,
    description,
    required,
    progress: {
      kind: TASK_OBJECTIVE_KIND.FACT,
      factId
    },
    ...(hudDisplayMode ? { hudDisplayMode } : {}),
    ...(hudIllustration ? { hudIllustration } : {}),
    ...(legacyFieldTaskId ? { legacyFieldTaskId } : {})
  };
}

function counterObjective({
  id,
  title,
  description,
  counterId,
  target,
  required = true,
  legacyFieldTaskId = null,
  hudDisplayMode = null,
  hudIllustration = null
}) {
  return {
    id,
    title,
    description,
    required,
    progress: {
      kind: TASK_OBJECTIVE_KIND.COUNTER,
      counterId,
      required: target
    },
    ...(hudDisplayMode ? { hudDisplayMode } : {}),
    ...(hudIllustration ? { hudIllustration } : {}),
    ...(legacyFieldTaskId ? { legacyFieldTaskId } : {})
  };
}

function eventObjective({
  id,
  title,
  description,
  eventType,
  targetId,
  target = 1,
  required = true,
  legacyFieldTaskId = null,
  hudDisplayMode = null,
  hudIllustration = null
}) {
  return {
    id,
    title,
    description,
    required,
    progress: {
      kind: TASK_OBJECTIVE_KIND.EVENT,
      eventType,
      targetId,
      required: target
    },
    ...(hudDisplayMode ? { hudDisplayMode } : {}),
    ...(hudIllustration ? { hudIllustration } : {}),
    ...(legacyFieldTaskId ? { legacyFieldTaskId } : {})
  };
}

function createTask({
  id,
  title,
  description,
  status = TASK_STATUS.LOCKED,
  priority,
  ownerId,
  objectives,
  effects = [],
  nextTaskId = null
}) {
  return {
    id,
    title,
    description,
    kind: TASK_KIND.MAIN,
    status,
    priority,
    chapterId: "mvp-restoration",
    ownerId,
    objectives,
    effects,
    nextTaskId
  };
}

export const SMALL_ISLAND_TASKS = deepFreeze([
  createTask({
    id: "learn-to-move",
    title: "Take Your First Steps",
    description: "Move after the crash and confirm that you can explore the inhospitable planet.",
    status: TASK_STATUS.ACTIVE,
    priority: 100,
    ownerId: "player",
    objectives: [
      eventObjective({
        id: "move-after-crash",
        title: "Move away from the crash site",
        description: "Take the first step so the planet can start responding to you.",
        eventType: TASK_EVENT.MOVE,
        targetId: "player"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.PLAYER_MOVED_AFTER_CRASH,
        value: true
      }
    ],
    nextTaskId: "wake-guide"
  }),
  createTask({
    id: "wake-guide",
    title: "Talk to Chopper",
    description: "Find Chopper after the crash and establish the first route toward restoration.",
    priority: 95,
    ownerId: "chopper",
    objectives: [
      eventObjective({
        id: "talk-to-chopper",
        title: "Talk to Chopper",
        description: "Follow the marker and hear what still works on the planet.",
        eventType: TASK_EVENT.TALK,
        targetId: "chopper",
        hudDisplayMode: "title-only",
        hudIllustration: {
          imageId: "chopper-selfie",
          alt: "Chopper",
          width: 100,
          height: 100
        }
      }),
      factObjective({
        id: "set-up-log-chair",
        title: "Set up Chopper's log chair",
        description: "Optional: place the log chair and create the first safe save point.",
        factId: "save.logChair.used",
        required: false,
        legacyFieldTaskId: "tangrowth-log-chair"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.CHOPPER_FIRST_CONTACT,
        value: true
      },
      {
        type: TASK_EFFECT.NOTICE,
        message: "Chopper marked a weak Hydro Bot signal."
      }
    ],
    nextTaskId: "wake-hydro"
  }),
  createTask({
    id: "wake-hydro",
    title: "Wake Hydro Bot",
    description: "Bring Hydro Bot online so the first restoration tool becomes available.",
    priority: 90,
    ownerId: "hydro",
    objectives: [
      eventObjective({
        id: "wake-hydro-bot",
        title: "Wake Hydro Bot",
        description: "Reach the dormant water core and restore basic water control.",
        eventType: TASK_EVENT.UNLOCK,
        targetId: "hydroTool"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.HYDRO_AWAKE,
        value: true
      },
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.HYDRO_TOOL_UNLOCKED,
        value: true
      },
      {
        type: TASK_EFFECT.UNLOCK,
        id: "hydroTool"
      },
      {
        type: TASK_EFFECT.NOTICE,
        message: "Hydro Bot is online."
      }
    ],
    nextTaskId: "restore-first-patch"
  }),
  createTask({
    id: "restore-first-patch",
    title: "Restore the First Patch",
    description: "Use Hydro Bot to prove that life can return to the soil.",
    priority: 85,
    ownerId: "hydro",
    objectives: [
      counterObjective({
        id: "restore-one-dry-patch",
        title: "Restore one dry patch",
        description: "Water one dry patch and make the first visible life return.",
        counterId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
        target: 1,
        hudIllustration: {
          imageId: "hydro-jet-tutorial",
          alt: "Hydro Jet tutorial",
          width: 384,
          height: 216,
          showInChecklist: false
        }
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.FIRST_DRY_PATCH_RESTORED,
        value: true
      }
    ],
    nextTaskId: "restore-dry-grass"
  }),
  createTask({
    id: "restore-dry-grass",
    title: "Restore the Dry Grass Route",
    description: "Restore enough life for the first living route and optional colony requests.",
    priority: 80,
    ownerId: "hydro",
    objectives: [
      counterObjective({
        id: "restore-five-dry-patches",
        title: "Restore five dry patches",
        description: "Restore a small route so life can hold outside the crash area.",
        counterId: TASK_FACT_IDS.DRY_GRASS_RESTORED_COUNT,
        target: 5,
        legacyFieldTaskId: "water-dry-tall-grass"
      }),
      factObjective({
        id: "revive-leppa-tree",
        title: "Revive the dead tree",
        description: "Optional: restore the tree near the old bus and recover a Pulse Berry.",
        factId: TASK_FACT_IDS.LEPPA_TREE_REVIVED,
        required: false,
        legacyFieldTaskId: "revive-leppa-tree"
      }),
      factObjective({
        id: "share-pulse-berry",
        title: "Share the Pulse Berry",
        description: "Optional: show the recovered fruit to a helper bot.",
        factId: TASK_FACT_IDS.PULSE_BERRY_GIFT_COMPLETE,
        required: false,
        legacyFieldTaskId: "give-leppa-berry"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.NOTICE,
        message: "The first route can support life again."
      }
    ],
    nextTaskId: "meet-grow"
  }),
  createTask({
    id: "meet-grow",
    title: "Meet Grow Bot",
    description: "Find Grow Bot and turn restoration into a living colony zone.",
    priority: 75,
    ownerId: "grow",
    objectives: [
      eventObjective({
        id: "talk-to-grow",
        title: "Talk to Grow Bot",
        description: "Complete Grow Bot's request and learn how to shape living ground.",
        eventType: TASK_EVENT.TALK,
        targetId: "grow",
        legacyFieldTaskId: "bulbasaur-leafage-reward"
      }),
      factObjective({
        id: "accept-grow-request",
        title: "Accept Grow Bot's request",
        description: "Optional: track Grow Bot's first restoration request.",
        factId: "request.grow.accepted",
        required: false,
        legacyFieldTaskId: "bulbasaur-dry-grass-request"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.GROW_MET,
        value: true
      },
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.GROW_TOOL_UNLOCKED,
        value: true
      },
      {
        type: TASK_EFFECT.UNLOCK,
        id: "growTool"
      }
    ],
    nextTaskId: "grow-first-habitat"
  }),
  createTask({
    id: "grow-first-habitat",
    title: "Grow the First Habitat Patch",
    description: "Use Grow Bot's ability to create the first colony-ready living patch.",
    priority: 70,
    ownerId: "grow",
    objectives: [
      counterObjective({
        id: "grow-four-plants",
        title: "Grow four living plants",
        description: "Create enough living ground to prove the first habitat pattern.",
        counterId: TASK_FACT_IDS.FIRST_HABITAT_PATCH_COUNT,
        target: 4
      }),
      factObjective({
        id: "make-colony-zones",
        title: "Experiment with colony zones",
        description: "Optional: arrange plants, rocks, trees and furniture into viable colony zones.",
        factId: "colony.zones.firstViable",
        required: false,
        legacyFieldTaskId: "making-habitats"
      }),
      factObjective({
        id: "grow-green-corner",
        title: "Grow a green corner",
        description: "Optional: use Grow Bot to start a small playable green corner.",
        factId: "colony.greenCorner.created",
        required: false,
        legacyFieldTaskId: "bulbasaur-green-corner-play-seed"
      })
    ],
    nextTaskId: "clear-white-ground"
  }),
  createTask({
    id: "clear-white-ground",
    title: "Clear White Ground",
    description: "Use Thermal support to clear blocked ground and prepare for construction.",
    priority: 65,
    ownerId: "thermal",
    objectives: [
      factObjective({
        id: "place-thermal-cabin",
        title: "Place Thermal Bot's cabin",
        description: "Create and place Thermal Bot's cabin so the heat system has a home.",
        factId: TASK_FACT_IDS.THERMAL_CABIN_PLACED,
        legacyFieldTaskId: "spit-out-campfire"
      }),
      counterObjective({
        id: "clear-one-white-ground",
        title: "Clear one white ground patch",
        description: "Clear the first blocked patch and open a construction rule.",
        counterId: TASK_FACT_IDS.WHITE_GROUND_CLEARED,
        target: 1
      }),
      factObjective({
        id: "build-thermal-cabin-at-workbench",
        title: "Build the Thermal Cabin",
        description: "Optional: make the Thermal Cabin through the Workbench route.",
        factId: "build.thermalCabin.crafted",
        required: false,
        legacyFieldTaskId: "workbench-campfire"
      }),
      factObjective({
        id: "help-thermal-settle",
        title: "Help Thermal Bot settle",
        description: "Optional: lead Thermal Bot to its cabin.",
        factId: "bot.thermal.homeComplete",
        required: false,
        legacyFieldTaskId: "charmander-tall-grass"
      })
    ],
    nextTaskId: "unlock-colony-terminal"
  }),
  createTask({
    id: "unlock-colony-terminal",
    title: "Turn On the Colony Terminal",
    description: "Make the terminal the center of colony progress.",
    priority: 60,
    ownerId: "terminal",
    objectives: [
      factObjective({
        id: "inspect-terminal-ruins",
        title: "Inspect the ruined terminal",
        description: "Find the old colony terminal and bring its checks online.",
        factId: TASK_FACT_IDS.TERMINAL_INSPECTED,
        legacyFieldTaskId: "ruined-pokemon-center"
      }),
      eventObjective({
        id: "unlock-colony-checks",
        title: "Unlock colony checks",
        description: "Turn the terminal into the hub for colony progress.",
        eventType: TASK_EVENT.TERMINAL_ACTION,
        targetId: "unlock-colony-checks"
      }),
      factObjective({
        id: "review-new-terminal-checks",
        title: "Review new colony checks",
        description: "Optional: read the new checks available from the terminal.",
        factId: "colony.terminal.newChecksReviewed",
        required: false,
        legacyFieldTaskId: "new-challenges-in-pc"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.COLONY_TERMINAL_UNLOCKED,
        value: true
      },
      {
        type: TASK_EFFECT.OPEN_TERMINAL
      }
    ],
    nextTaskId: "build-first-base"
  }),
  createTask({
    id: "build-first-base",
    title: "Build the First Base",
    description: "Use gathered materials and Builder support to make the first base outline.",
    priority: 55,
    ownerId: "builder",
    objectives: [
      counterObjective({
        id: "collect-six-wood",
        title: "Collect six Wood",
        description: "Gather enough material for the first foundation.",
        counterId: TASK_FACT_IDS.FIRST_BASE_WOOD_COLLECTED,
        target: 6
      }),
      counterObjective({
        id: "build-twelve-foundation-walls",
        title: "Build twenty-four foundation walls",
        description: "Complete the base outline so the colony has a first safe shape.",
        counterId: TASK_FACT_IDS.FIRST_BASE_WALLS_BUILT,
        target: 24
      }),
      factObjective({
        id: "claim-house-kit",
        title: "Claim a House Kit",
        description: "Optional: use the terminal to claim the first shelter kit.",
        factId: "build.houseKit.claimed",
        required: false,
        legacyFieldTaskId: "leaf-den-kit"
      }),
      factObjective({
        id: "build-house",
        title: "Build a House",
        description: "Optional: place and complete the first House.",
        factId: "build.house.completed",
        required: false,
        legacyFieldTaskId: "build-leaf-den"
      }),
      factObjective({
        id: "furnish-house",
        title: "Furnish the House",
        description: "Optional: place furniture inside the House.",
        factId: "build.house.furnished",
        required: false,
        legacyFieldTaskId: "leaf-den-furniture"
      }),
      factObjective({
        id: "complete-solar-station-request",
        title: "Complete the Solar Station request",
        description: "Optional: build the Solar Station and finish Grow Bot's build request.",
        factId: "build.solarStation.requestComplete",
        required: false,
        legacyFieldTaskId: "straw-bed-recipe"
      }),
      factObjective({
        id: "prepare-grow-habitat-supplies",
        title: "Prepare Grow Bot's habitat supplies",
        description: "Optional: water trees and gather sturdy sticks for Grow Bot.",
        factId: "request.grow.habitatSuppliesComplete",
        required: false,
        legacyFieldTaskId: "bulbasaur-straw-bed"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.FIRST_BASE_READY,
        value: true
      }
    ],
    nextTaskId: "report-base-ready"
  }),
  createTask({
    id: "report-base-ready",
    title: "Tell Chopper the Base Is Ready",
    description: "Report the first base to Chopper and close the current chapter.",
    priority: 50,
    ownerId: "chopper",
    objectives: [
      eventObjective({
        id: "report-base-to-chopper",
        title: "Report to Chopper",
        description: "Tell Chopper the first base outline is standing.",
        eventType: TASK_EVENT.TALK,
        targetId: "chopper-first-habitat-report"
      }),
      factObjective({
        id: "log-boulder-report",
        title: "Log the boulder habitat report",
        description: "Optional: report the boulder-shaded tall grass viability check.",
        factId: "colony.boulderHabitat.reportLogged",
        required: false,
        legacyFieldTaskId: "boulder-shaded-tall-grass"
      }),
      factObjective({
        id: "hold-thermal-celebration",
        title: "Hold Thermal Bot's celebration",
        description: "Optional: gather the bots for Thermal Bot's celebration.",
        factId: "bot.thermal.celebrationComplete",
        required: false,
        legacyFieldTaskId: "charmander-celebration"
      }),
      factObjective({
        id: "place-colony-flag",
        title: "Place the colony flag",
        description: "Optional: mark the House with the colony flag.",
        factId: "build.house.colonyFlagPlaced",
        required: false,
        legacyFieldTaskId: "ditto-flag-house"
      }),
      factObjective({
        id: "build-greenhouse",
        title: "Build a Greenhouse",
        description: "Optional: add a greenhouse to the first colony zone.",
        factId: "build.greenhouse.placed",
        required: false,
        legacyFieldTaskId: "build-greenhouse"
      })
    ],
    effects: [
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.CHOPPER_BASE_REPORT_COMPLETE,
        value: true
      },
      {
        type: TASK_EFFECT.SET_FACT,
        id: TASK_FACT_IDS.MVP_CHAPTER_COMPLETE,
        value: true
      },
      {
        type: TASK_EFFECT.NOTICE,
        message: "Chapter complete: the first base is ready."
      }
    ],
    nextTaskId: null
  })
]);

export function listSmallIslandTasks() {
  return SMALL_ISLAND_TASKS;
}

export function getSmallIslandTaskById(taskId) {
  return SMALL_ISLAND_TASKS.find((task) => task.id === taskId) || null;
}
