import "../../styles/app.css";
import "../../styles/introDialogueBox.css";
import "../../styles/render-frame.css";
import "../../styles/pragt-overrides.css";
import {
  ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS
} from "../../actTwoSceneConfig.js";
import {
  SQUIRTLE_POKEDEX_ENTRY_ID
} from "../../pokedexEntries.js";
import { GAME_FLOW } from "../../gameFlow.js";
import {
  createInactiveFieldMoveState,
  getActiveFieldMoveAbilityId
} from "../gameplay/content/activeFieldMoveState.ts";
import { START_SLOT_ACTION } from "../start/startSlotContract.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES,
  SANDBOTS_WORLD_TERMS
} from "../story/sandbotsLexicon.js";
import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackActionLabel,
  getColonyFeedbackNotice
} from "../gameplay/colonyFeedbackContracts.js";
import {
  resolvePlacementConsumptionDecision
} from "../gameplay/placementConsumptionContract.js";
import {
  resolveInputPrompt,
  resolvePlacementPreviewPrompt,
  UI_PROMPT_ACTION
} from "../ui/inputPromptResolver.js";
import { getFirstMissionCompletionPopText } from "../ui/firstMissionCompletionPop.js";
import {
  mapActiveFieldMoveStateToSaveGameDto,
  mapSaveGameDtoToActiveFieldMoveState
} from "../save/saveGameDto.ts";
import {
  createManualSavePointDto,
  isManualSavePointDto
} from "../save/manualSavePointDto.ts";
import {
  createConsoleGamePerformanceReporter,
  measureFieldMoveSwitchToPaint
} from "../performance/gamePerformanceMetrics.ts";
import {
  CARBON_ITEM_ID,
  CAMPFIRE_ITEM_ID,
  DITTO_FLAG_ITEM_ID,
  GEAR_ITEM_ID,
  GREENHOUSE_ITEM_ID,
  INVENTORY_ORDER,
  ITEM_DEFS,
  LEAF_DEN_BUILD_DURATION_MS,
  LEAF_DEN_BUILD_REQUIREMENTS,
  LEAF_DEN_KIT_ITEM_ID,
  LEAVES_ITEM_ID,
  LEPPA_BERRY_ITEM_ID,
  LOG_CHAIR_ITEM_ID,
  NPC_PROFILES,
  PLACEHOLDER_RECIPES,
  RUINED_POKEMON_CENTER_GUIDE_POSITION,
  RUINED_POKEMON_CENTER_POSITION,
  SIMPLE_WOODEN_DIY_RECIPES_ITEM_ID,
  STRAW_BED_ITEM_ID,
  STRAW_BED_RECIPE_ITEM_ID,
  TANGROWTH_OPENING_LINE,
  WATER_GUN_POWER_ITEM_ID,
  WORKBENCH_POSITION,
  canClaimBoulderChallengeReward,
  createInitialInventory,
  getItemLabel,
  listBuildingKits
} from "../../gameplayContent.js";
import {
  addItems,
  buildQuestProgressCopy,
  consumeItems,
  createStoryState,
  formatDifficulty,
  formatConstructionMaterialsSummary,
  formatRequirementSummary,
  getActiveQuest,
  getQuestProgressDescriptor,
  getRegionForPosition,
  hasItems,
  validateCreatureSpecialtiesReady
} from "../../story/progression.js";
import { createDialogueSystem } from "../dialogue/createDialogueSystem.js";
import { SMALL_ISLAND_DIALOGUES } from "../dialogue/dialogueData.js";
import { createQuestSystem } from "../quest/createQuestSystem.js";
import {
  getErrandQuestProgressFeedback,
  unlockErrandQuestPokedeskReward,
  warnInvalidErrandQuestDesign
} from "../quest/errandQuestDesign.js";
import { QUEST_EVENT, SMALL_ISLAND_QUESTS } from "../quest/questData.js";
import { createStoryBeatSystem } from "../story/createStoryBeatSystem.js";
import {
  FIELD_TASK_IDS,
  SMALL_ISLAND_FIELD_TASKS,
  STORY_BEAT_IDS
} from "../story/storyBeatData.js";
import {
  getHouseKitPlacementReadiness,
  getSolarStationProgressState,
  SOLAR_STATION_PROGRESS_STATE
} from "../story/progressionContracts.js";
import { AUTOSAVE_EVENT, createAutosaveRuntime } from "../runtime/autosaveRuntime.js";
import { createHabitatSystem } from "../sandbox/createHabitatSystem.js";
import { HABITAT_EVENT, SMALL_ISLAND_HABITATS } from "../sandbox/habitatData.js";
import {
  findNearbyGroundCell,
  purifyGroundCell,
  reviveGroundFlower,
  reviveGroundGrass,
  syncPurifiedGroundVariantInstances
} from "../../groundGrid.js";
import { createGameInputController } from "../../input/gameInputController.js";
import {
  buildNearbyPrompt,
  buildCampfirePlacement,
  buildGreenhousePlacement,
  buildLeafDenKitPlacement,
  buildLogChairPlacement,
  buildStrawBedPlacement,
  collectCarbonResourceNodes as collectCarbonResourceNodeItems,
  collectGearResourceNodes as collectGearResourceNodeItems,
  collectLeafDrops,
  collectLeafResourceNodes as collectLeafResourceNodeItems,
  collectLeppaBerryDrops as collectLeppaBerryDropItems,
  collectWoodDrops,
  findNearbyDestroyableInstantiatedObject,
  findNearbyHarvestTarget,
  findNearbyInteractable,
  isInteractableActive,
  isNpcActive,
  isResourceNodeActive,
  syncLeppaTreeState,
  strikeNearbyPalm,
  updateBulbasaurStrawBedChallengeCompletion,
  waterNearbyPalm,
  updatePalmShake,
  updateResourceNodes
} from "../../world/islandWorld.js";
import { createGameplayInteractions } from "../../world/gameplayInteractions.js";
import { createGameSession } from "../gameSession.js";
import { startNatureRevivalEffect } from "../session/natureRevivalEffects.js";
import { startChopperNpcFlight } from "../session/chopperNpcActor.js";
import {
  applySavedPlayerProfile,
  clonePlayerProfileState,
  confirmPlayerName,
  createPlayerProfileState,
  formatBuilderCallsignAcknowledgement,
  formatBuilderCallsignRegisteredNotice,
  formatHouseRegisteredNotice,
  hasConfirmedPlayerName
} from "../player/playerProfile.js";
import { createEngineRuntime } from "../runtime/createEngineRuntime.js";
import { createAudioMixRuntime, resolveAudioMix } from "../runtime/audioMixRuntime.js";
import { createDialogueCameraController } from "../runtime/dialogueCameraController.js";
import { createGameAppController } from "../runtime/gameAppController.js";
import { shouldGamepadSourceHarvestTarget } from "../runtime/gamepadHarvestPolicy.js";
import { startGameLoop } from "../runtime/gameLoop.js";
import { createMusicRuntime, MUSIC_TRACK_IDS } from "../runtime/musicRuntime.js";
import {
  SOUND_EVENT_IDS,
  createSoundEventRuntime
} from "../runtime/soundEventRuntime.js";
import { createLeafageObjectModalController } from "../ui/leafageObjectModalController.js";
import {
  PLANET_AMBIENT_INTENSITY,
  createPlanetAmbientRuntime
} from "../runtime/planetAmbientRuntime.js";
import { createUiRuntime } from "../runtime/createUiRuntime.js";
import { createSceneFlowRuntime } from "../scene/createSceneFlowRuntime.js";
import { playFirstChopperCinematic } from "../scene/chopperFirstCinematic.js";
import { createSettingsMenuController } from "../settings/createSettingsMenuController.js";
import { SETTINGS_SCHEMA, loadSettingsState, saveSettingsState } from "../settings/settingsState.js";
import {
  LAUNCH_MODE,
  LAUNCH_MODE_STORAGE_KEY,
  applyLaunchModeRuntime,
  getInitialGameFlowForLaunchMode,
  resolveLaunchMode,
  shouldUseNoopWebGlForLaunchMode
} from "../runtime/launchMode.js";
import { resolveActiveSceneWorkbench } from "../scene/sceneWorkbench.js";
import {
  DEV_SCENE,
  SKIP_START_SCREEN_STORAGE_KEY,
  resolveRuntimeFlags
} from "../runtime/runtimeFlags.js";
import {
  markAppReady
} from "./runtimeBootstrap.js";
import { resolveDomElements } from "./resolveDomElements.js";
import { createGameShell } from "../ui/createGameShell.js";
import { createOverlayVeil } from "../ui/overlayTransition.js";
import { createPokemonCenterPcModalController } from "../ui/pokemonCenterPcModalController.js";
import { createWorkbenchModalController } from "../ui/workbenchModalController.js";
import {
  createDefaultPlacementDatabase,
  createGridSystem,
  GRID_PLACEABLE_IDS,
  migrateLegacyPlaceablesToGridRecords
} from "../gameplay/gridBuildingSystem.js";
import { createWorkbenchRecipeMap } from "../gameplay/buildableCatalog.js";

const RESOURCE_HARVEST_PROMPT = "Enter action";
const INTERACT_PROMPT = "E talk";
const MAIN_THEME_MUSIC_URL = new URL("../soundFx/main-theme.mp3", import.meta.url).href;
const MAIN_THEME_B_MUSIC_URL = new URL("../soundFx/main-theme-b.mp3", import.meta.url).href;
const ENABLE_GAMEPLAY_DEV_BOOT = false;
const ENABLE_QUEST_PERSISTENCE = false;
const DEFAULT_DEV_SCENE = DEV_SCENE.GAMEPLAY;
const WATER_GUN_FLOWER_FIELD_GROUP_ID = "water-gun-flower-field-0";
const GRID_PLACEMENT_SAVE_SCHEMA_VERSION = 1;
const DEFAULT_GRID_PLACEMENT_SAVE_CONFIG = Object.freeze({
  cellSize: 1,
  origin: Object.freeze({ x: -128, y: 0, z: -128 }),
  width: 256,
  height: 256,
  visualOffsetY: 0.03
});
const DEFAULT_GRID_PLACEMENT_DATABASE = createDefaultPlacementDatabase();
const WORKBENCH_RECIPES = createWorkbenchRecipeMap({
  placeholderRecipes: PLACEHOLDER_RECIPES
});
const FLOWER_FIELD_COMPLETION_SPARK_BUDGET = 420;
const FLOWER_FIELD_COMPLETION_MIN_SPARKS_PER_PATCH = 4;
const FLOWER_FIELD_COMPLETION_MAX_SPARKS_PER_PATCH = 8;
const FLOWER_FIELD_COMPLETION_SPARK_INTERVAL = 0.095;
const GAMEPLAY_DEFAULT_UI_SECTIONS = Object.freeze([
  "hud",
  "builder"
]);
const POKEMON_CENTER_PC_ACTION = Object.freeze({
  UNLOCK_CHALLENGES: "unlock-challenges",
  CLAIM_BOULDER_REWARD: "claim-boulder-reward",
  REVIEW_NEW_CHALLENGES: "review-new-challenges",
  ISSUE_LEAF_DEN_KIT: "issue-leaf-den-kit"
});
const CHOPPER_BILL_CUTAWAY_START_TEXT =
  "Our human, Bill, waited as long as he could. Very patient man. Very limited warranty.";
const CHOPPER_BILL_CUTAWAY_END_TEXT =
  "Anyway, you're promoted. Mostly because everyone else is dust.";
const PLAYER_SKILL_DEFS = {
  transform: {
    id: "transform",
    label: "Transform",
    shortLabel: "Morph",
    glyph: "T",
    color: "#f0c96a",
    ink: "#2b2006"
  },
  waterGun: {
    id: "waterGun",
    label: SANDBOTS_ITEM_NAMES.hydroTool,
    shortLabel: "Hydro",
    glyph: "W",
    color: "#65c7ff",
    ink: "#081f33"
  },
  leafage: {
    id: "leafage",
    label: SANDBOTS_ITEM_NAMES.growTool,
    shortLabel: "Grow",
    glyph: "L",
    color: "#7ed36d",
    ink: "#0b2610"
  },
  fire: {
    id: "fire",
    label: SANDBOTS_ITEM_NAMES.thermalTool,
    shortLabel: "Heat",
    glyph: "F",
    color: "#ff8a3d",
    ink: "#2a1005"
  },
  buildBlock: {
    id: "buildBlock",
    label: "Build",
    shortLabel: "Build",
    glyph: "B",
    color: "#ffd866",
    ink: "#271900"
  }
};
const PLAYER_SKILL_ORDER = ["transform", "waterGun", "leafage", "fire", "buildBlock"];
const ACTIVE_FIELD_MOVE_ORDER = ["waterGun", "leafage", "fire", "buildBlock"];
const FIELD_MOVE_SWITCH_PROMPT_DURATION_MS = 1500;
const FIELD_MOVE_CAROUSEL_CARD_SIZE = 122;
const FIELD_MOVE_CAROUSEL_CARD_GAP = 10;
const FIELD_MOVE_CAROUSEL_SELECTED_OVERLAY_URL = new URL("../ui/images/selected.png", import.meta.url).href;
const FIELD_MOVE_SWITCH_PROMPT_PRESENTATION = Object.freeze({
  waterGun: {
    companionName: SANDBOTS_BOT_NAMES.hydro,
    companionId: "squirtle",
    hint: "Use LT to mark the ground",
    thumbnailUrl: new URL("../ui/images/Robot-1-thumb.png", import.meta.url).href
  },
  leafage: {
    companionName: SANDBOTS_BOT_NAMES.grow,
    companionId: "bulbasaur",
    hint: "Use LT on green ground",
    thumbnailUrl: new URL("../ui/images/Robot-2-thumb.png", import.meta.url).href
  },
  fire: {
    companionName: SANDBOTS_BOT_NAMES.thermal,
    companionId: "charmander",
    hint: "Use LT on white ground",
    thumbnailUrl: new URL("../ui/images/Robot-3-thumb.png", import.meta.url).href
  },
  buildBlock: {
    companionName: SANDBOTS_BOT_NAMES.builder,
    companionId: "timburr",
    hint: "Use LT to build",
    thumbnailUrl: new URL("../buildings/Box/robot-1-thumb.png", import.meta.url).href
  }
});
const QUEST_COMPLETION_POP_DURATION_MS = 2400;
const QUEST_COMPLETION_POP_MESSAGES = Object.freeze({
  "wake-guide": "You met Chopper!",
  "gather-first-supplies": "Hydro Bot is online!",
  "shape-a-living-patch": "You restored a patch!",
  "record-a-memory": "You recorded a memory!",
  "open-the-water-route": `${SANDBOTS_ITEM_NAMES.hydroTool} online!`,
  "water-dry-grass": "You restored the tall grass!",
  "inspect-rustling-grass": `${SANDBOTS_ITEM_NAMES.growTool} online!`,
  "grow-a-home-patch": "You grew a home patch!",
  "chopper-first-habitat-report": "You reported back!"
});
const CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_LINES = Object.freeze([
  {
    speaker: "Chopper",
    text: "Nice job, rookie. It's good to see some green around here after so many years."
  },
  {
    speaker: "Chopper",
    text: "But I don't believe just the two of you are going to clean up this mess. I don't believe the company only sent one worker here."
  },
  {
    speaker: "Chopper",
    text: "Okay, the situation here is complicated, but this is just ridiculous. All this time and only you came?"
  }
]);
const CHOPPER_BULBASAUR_REPAIR_BOX_PRE_INTERACTION_LINES = Object.freeze([
  {
    speaker: "Chopper",
    text: "These boxes fell from the sky with you. I wonder what's inside..."
  }
]);
const CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_STARTED_FLAG = "chopperBulbasaurRepairBoxIntroStarted";
const CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_COMPLETE_FLAG = "chopperBulbasaurRepairBoxIntroComplete";
const BULBASAUR_REPAIR_BOX_INTRO_FOCUS_HEIGHT = 1.12;
const BULBASAUR_REPAIR_BOX_INTRO_FOCUS_DELAY_MS = 480;
const BULBASAUR_REPAIR_BOX_INTRO_RUSTLE_DURATION_MS = 1550;
const GROW_BOT_REVEAL_CINEMATIC_FOCUS_HEIGHT = 1.18;
const GROW_BOT_REVEAL_CINEMATIC_DURATION = 4.35;
const GROW_BOT_REVEAL_CINEMATIC_VISIBLE_PROGRESS = 0.72;
const GROW_BOT_REVEAL_CINEMATIC_OPEN_START_PROGRESS = 0.62;
const GROW_BOT_REVEAL_CINEMATIC_FLASH_START = 2.62;
const GROW_BOT_REVEAL_CINEMATIC_FLASH_DURATION = 1.05;
function createBotRevealBoxOpening(onComplete) {
  return {
    active: true,
    elapsed: 0,
    duration: GROW_BOT_REVEAL_CINEMATIC_DURATION,
    visibleProgress: GROW_BOT_REVEAL_CINEMATIC_VISIBLE_PROGRESS,
    openStartProgress: GROW_BOT_REVEAL_CINEMATIC_OPEN_START_PROGRESS,
    flashStart: GROW_BOT_REVEAL_CINEMATIC_FLASH_START,
    flashDuration: GROW_BOT_REVEAL_CINEMATIC_FLASH_DURATION,
    hideBoxWhenVisible: true,
    botVisible: false,
    bulbasaurVisible: false,
    onComplete
  };
}
const CHOPPER_FIRST_GUIDE_APPROACH_DURATION = 0.85;
const CHOPPER_FIRST_GUIDE_CAMERA_HEIGHT = 1.55;
const CHOPPER_SECOND_TALK_APPROACH_DURATION = 1.05;
const CHOPPER_SECOND_TALK_STOP_DISTANCE = 1.45;
const SQUIRTLE_DIALOGUE_MIN_PLAYER_DISTANCE = 1.55;
const TALL_GRASS_MEMORY_APPROACH_DURATION = 1.05;
const POKEMON_CENTER_GUIDE_FLIGHT_DURATION = 2.8;
const LEPPA_TREE_TASK_CAMERA_FOCUS_HEIGHT = 1.75;
const LEPPA_TREE_TASK_CAMERA_FOCUS_TRANSITION_MS = 460;
const LEPPA_TREE_TASK_CAMERA_ORBIT_DURATION_MS = 4200;
const LEPPA_TREE_TASK_CAMERA_ORBIT_DISTANCE = 6.2;
const LEPPA_TREE_TASK_CAMERA_ORBIT_ZOOM = 4.45;
const LEPPA_TREE_TASK_CAMERA_ORBIT_PITCH = 0.34;
const LEPPA_TREE_TASK_CAMERA_FOCUS_RETRY_MS = 160;
const LEPPA_TREE_TASK_CAMERA_FOCUS_MAX_WAIT_MS = 8000;
const SQUIRTLE_DRY_GRASS_FOCUS_LINE_INDEX = 3;
const SQUIRTLE_DRY_GRASS_CAMERA_FOCUS_HEIGHT = 1.12;
const WORKBENCH_OBJECT_ROTATE_DISTANCE = 3.2;
const WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN = 1.425;
const GREENHOUSE_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 5, height: 3 });
const SOLAR_STATION_ROTATION_FOOTPRINT = [2.2, 2.2];
const TRAIN_HOUSE_ROTATION_FOOTPRINT = [1.7, 1.45];
const HOUSE_KIT_ROTATION_FOOTPRINT = [1.95, 1.45];
const HOUSE_BUILT_ROTATION_FOOTPRINT = [
  HOUSE_KIT_ROTATION_FOOTPRINT[0] * 2,
  HOUSE_KIT_ROTATION_FOOTPRINT[1] * 2
];
const MANUAL_SAVE_STORAGE_KEY = "small-island.manual-save.v1";
const MANUAL_SAVE_SLOT_STORAGE_PREFIX = "small-island.manual-save-slot.v1.";
const MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY = "small-island.manual-save.active-slot.v1";
const DEFAULT_MANUAL_SAVE_SLOT_ID = "slot-1";
const MANUAL_SAVE_SLOT_IDS = Object.freeze([
  DEFAULT_MANUAL_SAVE_SLOT_ID,
  "slot-2",
  "slot-3"
]);
const LOG_CHAIR_SAVE_REQUEST_GRACE_MS = 800;
const LEAFAGE_TALL_GRASS_ARTWORK_URL = new URL("../../Trees/tall-grass/tall-grass.png", import.meta.url).href;
const LEAFAGE_GARDEN_1_ARTWORK_URL = new URL("../../Trees/Garden-1/garden-1.png", import.meta.url).href;
const LEAFAGE_FLOWER_ARTWORK_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23284f24'/%3E%3Crect x='44' y='48' width='8' height='30' fill='%2338b764'/%3E%3Crect x='32' y='38' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='50' y='38' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='41' y='28' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='41' y='50' width='14' height='14' fill='%23fff06a'/%3E%3Crect x='42' y='42' width='12' height='12' fill='%23ff7eb6'/%3E%3Crect x='28' y='64' width='14' height='8' fill='%2346d75b'/%3E%3Crect x='54' y='62' width='16' height='8' fill='%2346d75b'/%3E%3C/svg%3E";
const LEAFAGE_OBJECT_OPTIONS = Object.freeze([
  {
    id: "tallGrass",
    label: "Tall Grass",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow Tall Grass with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_TALL_GRASS_ARTWORK_URL
  },
  {
    id: "garden1",
    label: "Garden-1",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow Garden-1 with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_GARDEN_1_ARTWORK_URL
  },
  {
    id: "flower",
    label: "Flower",
    notice: `${SANDBOTS_BOT_NAMES.grow} will grow a revived Flower with ${SANDBOTS_ITEM_NAMES.growTool}.`,
    artworkUrl: LEAFAGE_FLOWER_ARTWORK_URL
  }
]);
const BOT_TRADE_SFX_URL = new URL("../soundFx/bot-trade.mp3", import.meta.url).href;
const BOT_TRADE_SFX_VOLUME = 0.76;

function scheduleIdleTask(windowRef, callback, timeout = 1200) {
  if (typeof windowRef.requestIdleCallback === "function") {
    windowRef.requestIdleCallback(callback, { timeout });
    return;
  }

  windowRef.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining() {
        return 0;
      }
    });
  }, 1);
}

function readLocalStorageItem(windowRef, key) {
  try {
    return windowRef.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeLocalStorageItem(windowRef, key) {
  try {
    windowRef.localStorage?.removeItem(key);
  } catch {
    // Ignore storage access failures so restart can still reload the runtime.
  }
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readManualSavePointFromKey(windowRef, key) {
  try {
    const raw = readLocalStorageItem(windowRef, key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isManualSavePointDto(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readManualSavePoint(windowRef) {
  return readManualSavePointFromKey(windowRef, MANUAL_SAVE_STORAGE_KEY);
}

function normalizeManualSaveSlotId(slotId) {
  return MANUAL_SAVE_SLOT_IDS.includes(slotId) ? slotId : DEFAULT_MANUAL_SAVE_SLOT_ID;
}

function getManualSaveSlotStorageKey(slotId) {
  return `${MANUAL_SAVE_SLOT_STORAGE_PREFIX}${normalizeManualSaveSlotId(slotId)}`;
}

function readActiveManualSaveSlotId(windowRef) {
  return normalizeManualSaveSlotId(readLocalStorageItem(windowRef, MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY));
}

function writeActiveManualSaveSlotId(windowRef, slotId) {
  try {
    windowRef.localStorage?.setItem(
      MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY,
      normalizeManualSaveSlotId(slotId)
    );
  } catch {
    // The game can still run without localStorage write access.
  }
}

function readManualSaveSlot(windowRef, slotId) {
  const normalizedSlotId = normalizeManualSaveSlotId(slotId);
  const slotSavePoint = readManualSavePointFromKey(
    windowRef,
    getManualSaveSlotStorageKey(normalizedSlotId)
  );

  if (slotSavePoint) {
    return slotSavePoint;
  }

  return normalizedSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID ?
    readManualSavePoint(windowRef) :
    null;
}

function removeManualSaveSlot(windowRef, slotId) {
  const normalizedSlotId = normalizeManualSaveSlotId(slotId);
  removeLocalStorageItem(windowRef, getManualSaveSlotStorageKey(normalizedSlotId));
  if (normalizedSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID) {
    removeLocalStorageItem(windowRef, MANUAL_SAVE_STORAGE_KEY);
  }
}

function resolveBootManualSaveSlot(windowRef) {
  const activeSlotId = readActiveManualSaveSlotId(windowRef);
  const activeSlotSavePoint = readManualSaveSlot(windowRef, activeSlotId);
  if (activeSlotSavePoint) {
    return {
      slotId: activeSlotId,
      savePoint: activeSlotSavePoint
    };
  }

  const defaultSlotSavePoint = activeSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID ?
    activeSlotSavePoint :
    readManualSaveSlot(windowRef, DEFAULT_MANUAL_SAVE_SLOT_ID);

  return {
    slotId: defaultSlotSavePoint ? DEFAULT_MANUAL_SAVE_SLOT_ID : activeSlotId,
    savePoint: defaultSlotSavePoint
  };
}

function buildStartSaveSlots(savePoint, slotId) {
  if (!savePoint) {
    return [];
  }

  const continueSlotId = normalizeManualSaveSlotId(slotId);
  const newGameSlotIds = MANUAL_SAVE_SLOT_IDS
    .filter((candidateSlotId) => candidateSlotId !== continueSlotId)
    .slice(0, 2);

  return [
    {
      id: "continue",
      action: START_SLOT_ACTION.CONTINUE,
      slotId: continueSlotId,
      label: "Continue",
      detail: "Saved Game"
    },
    ...newGameSlotIds.map((newGameSlotId, index) => ({
      id: `new-game-${newGameSlotId}`,
      action: START_SLOT_ACTION.NEW_GAME,
      slotId: newGameSlotId,
      label: "New Game",
      detail: `Empty Slot ${index + 1}`
    }))
  ];
}

function cloneFiniteNumberArray(value, length) {
  if (!Array.isArray(value) || value.length < length) {
    return null;
  }

  const next = value.slice(0, length).map(Number);
  return next.every(Number.isFinite) ? next : null;
}

function cloneGridCell(cell) {
  if (!isPlainObject(cell)) {
    return null;
  }

  const x = Number(cell.x);
  const y = Number(cell.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: Math.floor(x),
    y: Math.floor(y)
  };
}

function cloneGridFootprintSize(size) {
  if (!isPlainObject(size)) {
    return null;
  }

  const width = Number(size.width);
  const height = Number(size.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height))
  };
}

function cloneGridPlacementConfig(config = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG) {
  const source = isPlainObject(config) ? config : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG;
  const origin = isPlainObject(source.origin) ? source.origin : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin;
  const cellSize = Number(source.cellSize);
  const width = Number(source.width);
  const height = Number(source.height);
  const visualOffsetY = Number(source.visualOffsetY);
  const originX = Number(origin.x);
  const originY = Number(origin.y);
  const originZ = Number(origin.z);

  return {
    cellSize: Number.isFinite(cellSize) && cellSize > 0 ?
      cellSize :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize,
    origin: {
      x: Number.isFinite(originX) ? originX : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.x,
      y: Number.isFinite(originY) ? originY : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.y,
      z: Number.isFinite(originZ) ? originZ : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.z
    },
    width: Number.isFinite(width) && width > 0 ?
      Math.floor(width) :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.width,
    height: Number.isFinite(height) && height > 0 ?
      Math.floor(height) :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.height,
    visualOffsetY: Number.isFinite(visualOffsetY) ?
      visualOffsetY :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.visualOffsetY
  };
}

function buildOccupiedGridCells(originCell, size) {
  const cells = [];

  for (let y = 0; y < size.height; y += 1) {
    for (let x = 0; x < size.width; x += 1) {
      cells.push({
        x: originCell.x + x,
        y: originCell.y + y
      });
    }
  }

  return cells;
}

function normalizeGreenhouseGridFootprint(footprint = GREENHOUSE_PLACEMENT_GRID_FOOTPRINT) {
  return {
    width: Math.max(1, Math.round(Number(footprint?.width) || GREENHOUSE_PLACEMENT_GRID_FOOTPRINT.width)),
    height: Math.max(1, Math.round(Number(footprint?.height) || GREENHOUSE_PLACEMENT_GRID_FOOTPRINT.height))
  };
}

function getRotatedGreenhouseGridFootprint(footprint = GREENHOUSE_PLACEMENT_GRID_FOOTPRINT, yaw = 0) {
  const normalizedFootprint = normalizeGreenhouseGridFootprint(footprint);
  const quarterTurn = Math.abs(Math.round(Number(yaw || 0) / (Math.PI * 0.5))) % 4;

  if (quarterTurn % 2 === 1) {
    return {
      width: normalizedFootprint.height,
      height: normalizedFootprint.width
    };
  }

  return normalizedFootprint;
}

export function buildGreenhouseFootprintGroundPositions(preview) {
  const snappedPosition = Array.isArray(preview?.snappedPosition) ?
    preview.snappedPosition :
    preview?.position;
  if (!Array.isArray(snappedPosition)) {
    return [];
  }

  const gridStep = Math.max(
    0.25,
    Number(preview?.gridStep) ||
      Number(preview?.gridConfig?.cellSize) ||
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize
  );
  const rotatedFootprint = getRotatedGreenhouseGridFootprint(
    GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
    preview?.yaw
  );
  const originX = snappedPosition[0] - ((rotatedFootprint.width - 1) * gridStep * 0.5);
  const originZ = snappedPosition[2] - ((rotatedFootprint.height - 1) * gridStep * 0.5);
  const surfaceY = snappedPosition[1] || 0.02;
  const positions = [];

  for (let row = 0; row < rotatedFootprint.height; row += 1) {
    for (let column = 0; column < rotatedFootprint.width; column += 1) {
      positions.push({
        position: [
          Number((originX + column * gridStep).toFixed(3)),
          surfaceY,
          Number((originZ + row * gridStep).toFixed(3))
        ],
        tileSpan: gridStep
      });
    }
  }

  return positions;
}

function getNearestGreenhouseFootprintTerrainCell(position, {
  groundDeadInstances = [],
  iceGroundInstances = [],
  groundPurifiedInstances = [],
  tileSpan = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize
} = {}) {
  if (!Array.isArray(position)) {
    return null;
  }

  const candidates = [
    ...(Array.isArray(groundDeadInstances) ? groundDeadInstances : []),
    ...(Array.isArray(iceGroundInstances) ? iceGroundInstances : []),
    ...(Array.isArray(groundPurifiedInstances) ? groundPurifiedInstances : [])
  ];
  const tolerance = Math.max(0.18, Number(tileSpan) * 0.42);
  let nearestCell = null;
  let nearestDistance = Infinity;

  for (const groundCell of candidates) {
    if (groundCell?.active === false || !Array.isArray(groundCell?.offset)) {
      continue;
    }

    const distance = Math.hypot(
      Number(position[0]) - Number(groundCell.offset[0]),
      Number(position[2]) - Number(groundCell.offset[2])
    );
    if (distance <= tolerance && distance < nearestDistance) {
      nearestCell = groundCell;
      nearestDistance = distance;
    }
  }

  return nearestCell;
}

export function restoreGreenhouseFootprintGround({
  preview,
  groundDeadInstances = [],
  iceGroundInstances = [],
  groundPurifiedInstances = [],
  restoredGroundCells = null
} = {}) {
  if (!Array.isArray(groundPurifiedInstances)) {
    return 0;
  }

  const deadGround = Array.isArray(groundDeadInstances) ? groundDeadInstances : [];
  const iceGround = Array.isArray(iceGroundInstances) ? iceGroundInstances : [];
  const visitedCells = new Set();
  let restoredCount = 0;
  const footprintPositions = buildGreenhouseFootprintGroundPositions(preview);

  for (const footprintPosition of footprintPositions) {
    const groundCell = getNearestGreenhouseFootprintTerrainCell(footprintPosition.position, {
      groundDeadInstances: deadGround,
      iceGroundInstances: iceGround,
      groundPurifiedInstances,
      tileSpan: footprintPosition.tileSpan
    });

    if (!groundCell || visitedCells.has(groundCell)) {
      continue;
    }

    if (groundPurifiedInstances.includes(groundCell)) {
      visitedCells.add(groundCell);
      continue;
    }

    const restored =
      purifyGroundCell(groundCell, deadGround, groundPurifiedInstances) ||
      purifyGroundCell(groundCell, iceGround, groundPurifiedInstances);

    if (restored) {
      visitedCells.add(groundCell);
      restoredCount += 1;
      if (Array.isArray(restoredGroundCells)) {
        restoredGroundCells.push(groundCell);
      }
    }
  }

  if (restoredCount > 0) {
    syncPurifiedGroundVariantInstances(groundPurifiedInstances);
  }

  return restoredCount;
}

function cloneSavedGridPlacementRecord(record) {
  if (!isPlainObject(record)) {
    return null;
  }

  const placedObjectId = typeof record.placedObjectId === "string" ?
    record.placedObjectId :
    null;
  const sourceDatabaseId = typeof record.sourceDatabaseId === "string" ?
    record.sourceDatabaseId :
    null;
  const originCell = cloneGridCell(record.originCell);
  const size = cloneGridFootprintSize(record.size);
  if (!placedObjectId || !sourceDatabaseId || !originCell || !size) {
    return null;
  }

  const occupiedCells = Array.isArray(record.occupiedCells) ?
    record.occupiedCells.map(cloneGridCell).filter(Boolean) :
    buildOccupiedGridCells(originCell, size);

  return {
    placedObjectId,
    sourceDatabaseId,
    originCell,
    size,
    occupiedCells,
    ...(typeof record.legacyKey === "string" ? { legacyKey: record.legacyKey } : {})
  };
}

export function cloneSavedGridPlacement(gridPlacement) {
  if (!isPlainObject(gridPlacement) || !Array.isArray(gridPlacement.placedObjects)) {
    return null;
  }

  return {
    schemaVersion: GRID_PLACEMENT_SAVE_SCHEMA_VERSION,
    gridConfig: cloneGridPlacementConfig(gridPlacement.gridConfig),
    placedObjects: gridPlacement.placedObjects
      .map(cloneSavedGridPlacementRecord)
      .filter(Boolean)
  };
}

export function cloneSavedFreeBlockBuild(freeBlockBuild) {
  if (!isPlainObject(freeBlockBuild) || !Array.isArray(freeBlockBuild.floorBlocks)) {
    return null;
  }

  const minX = Math.trunc(Number(freeBlockBuild.bounds?.minX));
  const maxX = Math.trunc(Number(freeBlockBuild.bounds?.maxX));
  const minY = Math.trunc(Number(freeBlockBuild.bounds?.minY));
  const maxY = Math.trunc(Number(freeBlockBuild.bounds?.maxY));
  const bounds = [minX, maxX, minY, maxY].every(Number.isFinite) ?
    { minX, maxX, minY, maxY } :
    null;
  const floorBlocks = freeBlockBuild.floorBlocks
    .map((block) => {
      const cell = cloneGridCell(block?.cell || block);
      return cell ? { cell } : null;
    })
    .filter(Boolean);

  if (!bounds || !floorBlocks.length) {
    return null;
  }

  return {
    schemaVersion: 1,
    buildId: typeof freeBlockBuild.buildId === "string" ? freeBlockBuild.buildId : "freeBuild",
    bounds,
    floorBlocks
  };
}

export function createLegacyGridPlacementSaveData(placeables, {
  gridConfig: sourceGridConfig = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG
} = {}) {
  const gridConfig = cloneGridPlacementConfig(sourceGridConfig);
  const gridSystem = createGridSystem(gridConfig);
  const placedObjects = migrateLegacyPlaceablesToGridRecords({
    placeables,
    gridSystem,
    placementDatabase: DEFAULT_GRID_PLACEMENT_DATABASE
  })
    .map((record) => cloneSavedGridPlacementRecord({
      ...record,
      occupiedCells: buildOccupiedGridCells(record.originCell, record.size)
    }))
    .filter(Boolean);

  return {
    schemaVersion: GRID_PLACEMENT_SAVE_SCHEMA_VERSION,
    gridConfig,
    placedObjects
  };
}

export function cloneSavedPlacement(placement) {
  if (!isPlainObject(placement)) {
    return null;
  }

  const position = cloneFiniteNumberArray(placement.position, 3);
  const size = cloneFiniteNumberArray(placement.size, 2);
  const uvRect = cloneFiniteNumberArray(placement.uvRect, 4) || [0, 0, 1, 1];
  if (!position || !size) {
    return null;
  }

  const interactionBox = isPlainObject(placement.interactionBox) ?
    {
      id: typeof placement.interactionBox.id === "string" ? placement.interactionBox.id : null,
      markerKey: typeof placement.interactionBox.markerKey === "string" ?
        placement.interactionBox.markerKey :
        null,
      offset: cloneFiniteNumberArray(placement.interactionBox.offset, 3)
    } :
    null;

  return {
    id: typeof placement.id === "string" ? placement.id : null,
    ...(typeof placement.kind === "string" ? { kind: placement.kind } : {}),
    ...(typeof placement.constructionSiteId === "string" ? { constructionSiteId: placement.constructionSiteId } : {}),
    ...(typeof placement.buildingKitId === "string" ? { buildingKitId: placement.buildingKitId } : {}),
    ...(typeof placement.constructionName === "string" ? { constructionName: placement.constructionName } : {}),
    ...(typeof placement.constructionStatus === "string" ? { constructionStatus: placement.constructionStatus } : {}),
    ...(Number.isFinite(Number(placement.yaw)) ? { yaw: Number(placement.yaw) } : {}),
    ...(interactionBox?.offset ? { interactionBox } : {}),
    position,
    size,
    uvRect
  };
}

function cloneSavedPatch(patch) {
  if (!isPlainObject(patch) || typeof patch.cellId !== "string") {
    return null;
  }

  const position = cloneFiniteNumberArray(patch.position, 3);
  const size = cloneFiniteNumberArray(patch.size, 2);
  if (!position || !size) {
    return null;
  }

  return {
    id: typeof patch.id === "string" ? patch.id : `saved-patch-${patch.cellId}`,
    cellId: patch.cellId,
    position,
    size,
    state: patch.state === "alive" ? "alive" : "dead",
    ...(typeof patch.habitatGroupId === "string" ? { habitatGroupId: patch.habitatGroupId } : {})
  };
}

function cloneSavedPlacementList(placements) {
  return Array.isArray(placements) ?
    placements.map(cloneSavedPlacement).filter(Boolean) :
    [];
}

function cloneSessionPlaceables(session) {
  const greenhouses = cloneSavedPlacementList(session?.greenhouses);
  const legacyGreenhouse = cloneSavedPlacement(session?.greenhouse);
  const savedGreenhouses = greenhouses.length > 0 ?
    greenhouses :
    (legacyGreenhouse ? [legacyGreenhouse] : []);

  return {
    logChair: cloneSavedPlacement(session?.logChair),
    greenhouse: savedGreenhouses[0] || null,
    greenhouses: savedGreenhouses,
    strawBed: cloneSavedPlacement(session?.strawBed),
    campfire: cloneSavedPlacement(session?.campfire),
    leafDen: cloneSavedPlacement(session?.leafDen),
    dittoFlag: cloneSavedPlacement(session?.dittoFlag),
    playerHouses: Array.isArray(session?.playerHouses) ?
      session.playerHouses.map(cloneSavedPlacement).filter(Boolean) :
      [],
    leafDenFurniture: Array.isArray(session?.leafDenFurniture) ?
      session.leafDenFurniture.map(cloneSavedPlacement).filter(Boolean) :
      []
  };
}

function cloneSessionGridPlacement(session) {
  const savedGridPlacement = cloneSavedGridPlacement(session?.gridPlacement);
  if (savedGridPlacement) {
    return savedGridPlacement;
  }

  const legacyGridPlacement = createLegacyGridPlacementSaveData(cloneSessionPlaceables(session), {
    gridConfig: session?.buildGridConfig || DEFAULT_GRID_PLACEMENT_SAVE_CONFIG
  });
  return legacyGridPlacement.placedObjects.length ? legacyGridPlacement : null;
}

function cloneSessionFreeBlockBuild(session) {
  const snapshot =
    session?.freeBlockBuildState?.serializeFreeBlocks?.() ||
    session?.freeBlockBuildSnapshot ||
    null;
  return cloneSavedFreeBlockBuild(snapshot);
}

function cloneAlivePatches(patches) {
  return Array.isArray(patches) ?
    patches
      .filter((patch) => patch?.state === "alive")
      .map(cloneSavedPatch)
      .filter(Boolean) :
    [];
}

function cloneSessionWorldState(session) {
  const burnedColdGroundCellIds = [
    ...(Array.isArray(session?.groundDeadInstances) ? session.groundDeadInstances : []),
    ...(Array.isArray(session?.groundPurifiedInstances) ? session.groundPurifiedInstances : [])
  ]
    .filter((groundCell) => groundCell?.wasColdGroundBurned)
    .map((groundCell) => groundCell?.id)
    .filter((id) => typeof id === "string");

  return {
    burnedColdGroundCellIds: [...new Set(burnedColdGroundCellIds)],
    purifiedGroundCellIds: Array.isArray(session?.groundPurifiedInstances) ?
      session.groundPurifiedInstances
        .map((groundCell) => groundCell?.id)
        .filter((id) => typeof id === "string") :
      [],
    aliveGroundGrassPatches: cloneAlivePatches(session?.groundGrassPatches),
    aliveGroundFlowerPatches: cloneAlivePatches(session?.groundFlowerPatches)
  };
}

function cloneSessionCompanionState(session) {
  const squirtle = session?.actTwoSquirtle;

  return {
    squirtle: {
      recovered: Boolean(squirtle?.recovered),
      visible: Boolean(squirtle?.visible),
      assemblyState: typeof squirtle?.assemblyState === "string" ?
        squirtle.assemblyState :
        "hidden",
      position: cloneFiniteNumberArray(squirtle?.position, 3)
    }
  };
}

function getSavedPlaceables(savePoint) {
  if (isPlainObject(savePoint?.placeables)) {
    return savePoint.placeables;
  }

  if (savePoint?.logChair) {
    return { logChair: savePoint.logChair };
  }

  return null;
}

function restoreSavedGroundCells(session, worldState) {
  const burnedColdIds = new Set(
    Array.isArray(worldState?.burnedColdGroundCellIds) ?
      worldState.burnedColdGroundCellIds.filter((id) => typeof id === "string") :
      []
  );
  const purifiedIds = new Set(
    Array.isArray(worldState?.purifiedGroundCellIds) ?
      worldState.purifiedGroundCellIds.filter((id) => typeof id === "string") :
      []
  );
  if (
    (!burnedColdIds.size && !purifiedIds.size) ||
    !Array.isArray(session?.groundDeadInstances)
  ) {
    return;
  }
  if (!Array.isArray(session.groundPurifiedInstances)) {
    session.groundPurifiedInstances = [];
  }
  if (burnedColdIds.size && Array.isArray(session.iceGroundInstances)) {
    const nextIceGroundInstances = [];

    for (const groundCell of session.iceGroundInstances) {
      if (burnedColdIds.has(groundCell?.id)) {
        groundCell.groundKind = "dead";
        groundCell.purifiable = true;
        groundCell.wasColdGroundBurned = true;
        session.groundDeadInstances.push(groundCell);
        continue;
      }

      nextIceGroundInstances.push(groundCell);
    }

    session.iceGroundInstances.length = 0;
    session.iceGroundInstances.push(...nextIceGroundInstances);
  }

  const nextDeadInstances = [];
  const nextPurifiedInstances = session.groundPurifiedInstances
    .filter((groundCell) => purifiedIds.has(groundCell?.id));
  const restoredPurifiedIds = new Set(nextPurifiedInstances.map((groundCell) => groundCell?.id));

  for (const groundCell of session.groundDeadInstances) {
    if (purifiedIds.has(groundCell?.id)) {
      if (!restoredPurifiedIds.has(groundCell.id)) {
        nextPurifiedInstances.push(groundCell);
        restoredPurifiedIds.add(groundCell.id);
      }
      continue;
    }

    nextDeadInstances.push(groundCell);
  }

  session.groundDeadInstances.length = 0;
  session.groundDeadInstances.push(...nextDeadInstances);
  session.groundPurifiedInstances.length = 0;
  session.groundPurifiedInstances.push(...nextPurifiedInstances);
  syncPurifiedGroundVariantInstances(session.groundPurifiedInstances);
}

function restoreSavedPatchStates(patches, savedPatches) {
  if (!Array.isArray(patches) || !Array.isArray(savedPatches)) {
    return;
  }

  const existingByCellId = new Map(
    patches
      .filter((patch) => typeof patch?.cellId === "string")
      .map((patch) => [patch.cellId, patch])
  );

  for (const savedPatch of savedPatches) {
    const restoredPatch = cloneSavedPatch(savedPatch);
    if (!restoredPatch || restoredPatch.state !== "alive") {
      continue;
    }

    const existingPatch = existingByCellId.get(restoredPatch.cellId);
    if (existingPatch) {
      existingPatch.state = "alive";
      if (restoredPatch.habitatGroupId) {
        existingPatch.habitatGroupId = restoredPatch.habitatGroupId;
      }
      continue;
    }

    patches.push(restoredPatch);
    existingByCellId.set(restoredPatch.cellId, restoredPatch);
  }
}

function restoreSavedWorldState(session, savePoint) {
  if (!session || !isPlainObject(savePoint?.worldState)) {
    return;
  }

  restoreSavedGroundCells(session, savePoint.worldState);
  restoreSavedPatchStates(session.groundGrassPatches, savePoint.worldState.aliveGroundGrassPatches);
  restoreSavedPatchStates(session.groundFlowerPatches, savePoint.worldState.aliveGroundFlowerPatches);
}

function isSavedQuestCompleted(savePoint, questId) {
  const questState = savePoint?.questState;
  return Boolean(
    questState?.completedQuestIds?.includes?.(questId) ||
    questState?.quests?.[questId]?.status === "completed"
  );
}

function applySavedStoryState(storyState, savedStoryState) {
  if (!isPlainObject(savedStoryState)) {
    return;
  }

  const questIndex = Number(savedStoryState.questIndex);
  if (Number.isFinite(questIndex)) {
    storyState.questIndex = Math.max(0, Math.floor(questIndex));
  }

  if (isPlainObject(savedStoryState.flags)) {
    Object.assign(storyState.flags, savedStoryState.flags);
  }
}

function applySavedInventory(inventory, savedInventory) {
  if (!isPlainObject(savedInventory)) {
    return;
  }

  for (const [itemId, amount] of Object.entries(savedInventory)) {
    if (!Object.prototype.hasOwnProperty.call(inventory, itemId)) {
      continue;
    }

    const numericAmount = Number(amount);
    if (Number.isFinite(numericAmount)) {
      inventory[itemId] = Math.max(0, Math.floor(numericAmount));
    }
  }
}

function applySavedPlayerSkills(playerSkills, savePoint, inventory) {
  const savedSkills = isPlainObject(savePoint?.playerSkills) ? savePoint.playerSkills : {};

  for (const skillId of Object.keys(playerSkills)) {
    playerSkills[skillId] = Boolean(savedSkills[skillId]);
  }

  if (
    Number(inventory?.[WATER_GUN_POWER_ITEM_ID] || 0) > 0 ||
    isSavedQuestCompleted(savePoint, "open-the-water-route")
  ) {
    playerSkills.waterGun = true;
  }

  if (
    savePoint?.questState?.unlocked?.includes?.("leafage") ||
    isSavedQuestCompleted(savePoint, "inspect-rustling-grass") ||
    savePoint?.storyState?.flags?.bulbasaurDryGrassRequestTurnedIn
  ) {
    playerSkills.leafage = true;
  }

  if (
    savedSkills.fire ||
    savePoint?.questState?.unlocked?.includes?.("fire") ||
    savePoint?.storyState?.flags?.charmanderRevealed
  ) {
    playerSkills.fire = true;
  }

  if (
    savedSkills.buildBlock ||
    savePoint?.questState?.unlocked?.includes?.("buildBlock") ||
    savePoint?.storyState?.flags?.timburrRevealed
  ) {
    playerSkills.buildBlock = true;
  }
}

function getSavedActiveFieldMoveId(savePoint, playerSkills) {
  const savedMoveId = savePoint?.activeFieldMoveId;
  if (ACTIVE_FIELD_MOVE_ORDER.includes(savedMoveId) && playerSkills[savedMoveId]) {
    return savedMoveId;
  }

  return ACTIVE_FIELD_MOVE_ORDER.find((skillId) => playerSkills[skillId]) || null;
}

function applyManualSaveState(savePoint, {
  storyState,
  inventory,
  playerSkills,
  playerMemory
}) {
  if (!savePoint) {
    return null;
  }

  applySavedStoryState(storyState, savePoint.storyState);
  applySavedInventory(inventory, savePoint.inventory);
  applySavedPlayerSkills(playerSkills, savePoint, inventory);
  applySavedPlayerProfile(playerMemory, savePoint.playerProfile);
  return getSavedActiveFieldMoveId(savePoint, playerSkills);
}

function isSquirtleRecoveredInSavePoint(savePoint) {
  const savedSquirtle = savePoint?.companions?.squirtle;

  return Boolean(
    savedSquirtle?.recovered ||
    savedSquirtle?.assemblyState === "assembled" ||
    savePoint?.playerSkills?.waterGun ||
    Number(savePoint?.inventory?.[WATER_GUN_POWER_ITEM_ID] || 0) > 0 ||
    isSavedQuestCompleted(savePoint, "open-the-water-route")
  );
}

function restoreSavedSquirtleState(session, savePoint) {
  const squirtle = session?.actTwoSquirtle;

  if (!squirtle || !isSquirtleRecoveredInSavePoint(savePoint)) {
    return;
  }

  const savedPosition = cloneFiniteNumberArray(savePoint?.companions?.squirtle?.position, 3);
  if (savedPosition) {
    squirtle.position = savedPosition;
  }

  squirtle.recovered = true;
  squirtle.visible = true;
  squirtle.assemblyState = "assembled";

  if (squirtle.reassembly) {
    squirtle.reassembly.active = false;
    squirtle.reassembly.elapsed = 0;
    squirtle.reassembly.progress = 0;
    squirtle.reassembly.onComplete = null;
  }

  if (squirtle.modelInstance) {
    squirtle.modelInstance.active = true;
    if (Array.isArray(squirtle.position)) {
      squirtle.modelInstance.offset = [...squirtle.position];
    }
  }

  if (squirtle.repairModuleInstance) {
    squirtle.repairModuleInstance.active = false;
  }
}

export function restoreSavedSessionState(session, savePoint) {
  if (!session || !savePoint) {
    return false;
  }

  const placeables = getSavedPlaceables(savePoint);
  if (placeables) {
    const restoredGreenhouses = cloneSavedPlacementList(placeables.greenhouses);
    const legacyGreenhouse = cloneSavedPlacement(placeables.greenhouse);
    const savedGreenhouses = restoredGreenhouses.length > 0 ?
      restoredGreenhouses :
      (legacyGreenhouse ? [legacyGreenhouse] : []);
    session.logChair = cloneSavedPlacement(placeables.logChair);
    session.greenhouses = savedGreenhouses;
    session.greenhouse = savedGreenhouses[0] || null;
    session.strawBed = cloneSavedPlacement(placeables.strawBed);
    session.campfire = cloneSavedPlacement(placeables.campfire);
    session.leafDen = cloneSavedPlacement(placeables.leafDen);
    session.dittoFlag = cloneSavedPlacement(placeables.dittoFlag);
    session.playerHouses = Array.isArray(placeables.playerHouses) ?
      placeables.playerHouses.map(cloneSavedPlacement).filter(Boolean) :
      [];
    session.leafDenFurniture = Array.isArray(placeables.leafDenFurniture) ?
      placeables.leafDenFurniture.map(cloneSavedPlacement).filter(Boolean) :
      [];
  }

  session.gridPlacement =
    cloneSavedGridPlacement(savePoint.gridPlacement) ||
    createLegacyGridPlacementSaveData(placeables || {});
  session.freeBlockBuildSnapshot = cloneSavedFreeBlockBuild(savePoint.freeBlockBuild);
  session.freeBlockInstances ||= [];
  session.freeBlockInstances.length = 0;
  session.freeBlockBuildState = null;
  session.freeBlockPlacementController = null;
  session.freeBlockPlacementGridSignature = null;

  restoreSavedSquirtleState(session, savePoint);

  const playerPosition = cloneFiniteNumberArray(savePoint.playerPosition, 3);
  if (!playerPosition) {
    return false;
  }

  if (!session.playerCharacter) {
    session.spawnActTwoPlayer?.({
      position: playerPosition,
      preserveCamera: false,
      configureCamera: true
    });
  } else {
    session.playerCharacter.setPosition?.(playerPosition);
    if (session.playerModelInstance) {
      session.playerModelInstance.offset = [...playerPosition];
      session.playerModelInstance.active = true;
    }
  }

  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFieldTaskDescription(task, storyState) {
  if (typeof task?.description === "function") {
    return task.description(storyState);
  }

  return task?.description || "";
}

function isFieldTaskComplete(storyState, task) {
  return Boolean(
    (typeof task?.isComplete === "function" && task.isComplete(storyState)) ||
    (task?.completeFlag && storyState.flags?.[task.completeFlag])
  );
}

function isFieldTaskKnown(storyState, task) {
  const flags = storyState.flags || {};
  const trackedTaskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];

  return Boolean(
    task?.background ||
    trackedTaskIds.includes(task.id) ||
    isFieldTaskComplete(storyState, task)
  );
}

function formatQuestMissionProgress(quest) {
  return (quest.objectives || [])
    .map((objective) => {
      const current = Math.min(objective.current || 0, objective.required || 1);
      return `${current}/${objective.required}`;
    })
    .join("  ");
}

export function createAutosaveIndicator({ documentRef, mount, windowRef }) {
  const root = mount || documentRef?.body || null;
  let hideTimeout = null;
  let element = null;

  function ensureElement() {
    if (element || !root || !documentRef?.createElement) {
      return element;
    }

    element = documentRef.createElement("div");
    element.textContent = "Saving...";
    element.setAttribute("aria-live", "polite");
    Object.assign(element.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "40",
      pointerEvents: "none",
      color: "#ffffff",
      fontFamily: "var(--game-ui-font, monospace)",
      fontSize: "32px",
      lineHeight: "1",
      letterSpacing: "0",
      textAlign: "center",
      textShadow: "2px 2px 0 #11111b",
      opacity: "0",
      transition: "opacity 120ms linear"
    });
    root.appendChild(element);
    return element;
  }

  function show() {
    const indicator = ensureElement();
    if (!indicator) {
      return;
    }

    indicator.style.opacity = "1";
    if (hideTimeout) {
      windowRef.clearTimeout?.(hideTimeout);
    }
    hideTimeout = windowRef.setTimeout?.(() => {
      indicator.style.opacity = "0";
      hideTimeout = null;
    }, 900);
  }

  return {
    show
  };
}

export function createBotTradeSfxPlayer({
  windowRef,
  src = BOT_TRADE_SFX_URL,
  volume = BOT_TRADE_SFX_VOLUME,
  volumeScale = () => 1
} = {}) {
  let audio = null;

  function getEffectiveVolume() {
    const scale = typeof volumeScale === "function" ? volumeScale() : volumeScale;
    const numericScale = Number(scale);
    return Math.max(0, Math.min(1, volume * (Number.isFinite(numericScale) ? numericScale : 1)));
  }

  function getAudio() {
    if (audio || typeof windowRef?.Audio !== "function") {
      return audio;
    }

    audio = new windowRef.Audio(src);
    audio.preload = "auto";
    audio.volume = getEffectiveVolume();
    return audio;
  }

  function play() {
    const sfx = getAudio();
    if (!sfx) {
      return false;
    }

    sfx.volume = getEffectiveVolume();
    try {
      sfx.currentTime = 0;
    } catch {
      // Some browser audio objects disallow seeking before metadata is ready.
    }

    const playResult = sfx.play?.();
    if (playResult?.catch) {
      playResult.catch(() => {});
    }
    return true;
  }

  return {
    play
  };
}

export function resolveSelectableBuildingKit({
  storyState,
  inventory,
  buildingKits = listBuildingKits(),
  hasItemsFn = hasItems
} = {}) {
  const flags = storyState?.flags || {};

  return (
    buildingKits.find((kit) => {
      if (!kit?.itemId || !hasItemsFn(inventory, { [kit.itemId]: 1 })) {
        return false;
      }

      if (kit.itemId === LEAF_DEN_KIT_ITEM_ID) {
        return Boolean(flags.leafDenBuildAvailable);
      }

      return false;
    }) || null
  );
}

export function shouldChainHouseKitPlacementAfterSolarStation({
  storyState,
  inventory,
  gameSession,
  hasItemsFn = hasItems
} = {}) {
  const flags = storyState?.flags || {};
  return Boolean(
    flags.leafDenKitSelected &&
    !flags.leafDenKitPlaced &&
    !gameSession?.leafDen &&
    !gameSession?.leafDenKitPlacementPreview?.active &&
    hasItemsFn(inventory, { [LEAF_DEN_KIT_ITEM_ID]: 1 })
  );
}

export function resolveInitialSceneIdForApplicationBoot({
  devSceneOverride = null,
  launchInitialGameFlow = GAME_FLOW.START,
  manualSavePoint = null,
  runtimeFlags = {},
  sceneWorkbench = null
} = {}) {
  const devSceneInitialGameFlow =
    devSceneOverride === DEV_SCENE.GAMEPLAY ? GAME_FLOW.GAMEPLAY :
    devSceneOverride === DEV_SCENE.INTRO ? GAME_FLOW.INTRO :
    devSceneOverride === DEV_SCENE.TUTORIAL ? GAME_FLOW.TUTORIAL :
    null;
  const shouldResumeSavedGameOnBoot =
    launchInitialGameFlow !== GAME_FLOW.START ||
    devSceneOverride === DEV_SCENE.GAMEPLAY;
  const savedGameInitialGameFlow =
    shouldResumeSavedGameOnBoot &&
    cloneFiniteNumberArray(manualSavePoint?.playerPosition, 3) ?
      GAME_FLOW.GAMEPLAY :
      null;

  return devSceneInitialGameFlow ||
    savedGameInitialGameFlow ||
    (
      (runtimeFlags.skipStartScreen || runtimeFlags.introRoom) && launchInitialGameFlow === GAME_FLOW.START ?
        GAME_FLOW.INTRO :
        sceneWorkbench?.initialSceneId ||
        launchInitialGameFlow
    );
}

export function createApplicationRuntime({
  documentRef = document,
  windowRef = window,
  isDev = import.meta.env.DEV
} = {}) {
  createGameShell({ documentRef });
  const dom = resolveDomElements(documentRef);
  const { appRoot, status } = dom;
  const launchParams = new URLSearchParams(windowRef.location.search);
  const storedLaunchMode = readLocalStorageItem(windowRef, LAUNCH_MODE_STORAGE_KEY);
  const storedSkipStartScreen = readLocalStorageItem(windowRef, SKIP_START_SCREEN_STORAGE_KEY);
  const launchMode = resolveLaunchMode({
    searchParams: launchParams,
    hash: windowRef.location.hash,
    storedLaunchMode
  }, {
    isDev
  });
  const sceneWorkbench = resolveActiveSceneWorkbench(launchMode);
  const effectiveLaunchMode = sceneWorkbench?.launchMode || launchMode;
  const runtimeFlags = resolveRuntimeFlags({
    searchParams: launchParams,
    hash: windowRef.location.hash,
    storedSkipStartScreen
  });
  const reportGamePerformanceMetric = createConsoleGamePerformanceReporter({
    enabled: isDev,
    consoleRef: windowRef.console || globalThis.console
  });
  let gameInput = null;
  const bootManualSaveSlot = resolveBootManualSaveSlot(windowRef);
  const bootManualSavePoint = bootManualSaveSlot.savePoint;
  let activeManualSaveSlotId = bootManualSaveSlot.slotId;
  const devSceneOverride =
    isDev &&
    ENABLE_GAMEPLAY_DEV_BOOT &&
    !runtimeFlags.scene &&
    !runtimeFlags.introRoom &&
    !runtimeFlags.skipStartScreen ?
      DEFAULT_DEV_SCENE :
      runtimeFlags.scene;
  const launchInitialGameFlow = getInitialGameFlowForLaunchMode(effectiveLaunchMode);
  const initialSceneId = resolveInitialSceneIdForApplicationBoot({
    devSceneOverride,
    launchInitialGameFlow,
    manualSavePoint: bootManualSavePoint,
    runtimeFlags,
    sceneWorkbench
  });
  const shouldDeferManualSavePoint =
    initialSceneId === GAME_FLOW.START &&
    Boolean(bootManualSavePoint);
  let manualSavePoint = shouldDeferManualSavePoint ? null : bootManualSavePoint;
  const startSaveSlots = shouldDeferManualSavePoint ?
    buildStartSaveSlots(bootManualSavePoint, activeManualSaveSlotId) :
    [];

  markAppReady(appRoot, "loading", effectiveLaunchMode);

  const pressedKeys = new Set();
  const inventory = createInitialInventory();
  const storyState = createStoryState();
  const settingsState = loadSettingsState(windowRef.localStorage, SETTINGS_SCHEMA);
  function syncVisualSettings() {
    appRoot.dataset.crtFilter = settingsState.accessibility?.crtFilter === false ? "off" : "on";
  }
  syncVisualSettings();
  const initialAudioMix = resolveAudioMix(settingsState);
  const musicRuntime = createMusicRuntime({
    tracks: {
      [MUSIC_TRACK_IDS.MAIN_THEME]: MAIN_THEME_MUSIC_URL,
      [MUSIC_TRACK_IDS.MAIN_THEME_B]: MAIN_THEME_B_MUSIC_URL
    },
    initialVolume: initialAudioMix.music,
    audioFactory: (src) => {
      if (typeof windowRef.Audio !== "function") {
        return null;
      }

      return new windowRef.Audio(src);
    }
  });
  const planetAmbientRuntime = createPlanetAmbientRuntime({
    initialVolume: initialAudioMix.ambience,
    audioFactory: (src) => {
      if (typeof windowRef.Audio !== "function") {
        return null;
      }

      return new windowRef.Audio(src);
    }
  });
  const audioMixRuntime = createAudioMixRuntime({
    settingsState,
    musicRuntime,
    planetAmbientRuntime
  });
  planetAmbientRuntime.start({
    intensity: PLANET_AMBIENT_INTENSITY.OPENING
  });
  planetAmbientRuntime.startOnFirstGesture(windowRef, {
    intensity: PLANET_AMBIENT_INTENSITY.OPENING
  });
  musicRuntime.startOnFirstGesture(windowRef);
  const botTradeSfxPlayer = createBotTradeSfxPlayer({
    windowRef,
    volumeScale: () => audioMixRuntime.getSfxVolumeScale()
  });
  const soundEventRuntime = createSoundEventRuntime({
    windowRef,
    root: appRoot,
    volumeScale: () => audioMixRuntime.getSfxVolumeScale()
  });
  soundEventRuntime.attachUiEventDelegates();
  function playSoundEvent(eventId, options) {
    soundEventRuntime.play(eventId, options);
  }
  function syncColliderDebugToggle(toggle) {
    if (!toggle) {
      return;
    }

    toggle.dataset.active = runtimeFlags.debugColliders ? "true" : "false";
    toggle.setAttribute("aria-pressed", runtimeFlags.debugColliders ? "true" : "false");
    toggle.textContent = runtimeFlags.debugColliders ? "COLLIDERS ON" : "COLLIDERS OFF";
  }

  function setupColliderDebugToggle() {
    const fpsPanel = dom.fpsPanel;
    const toggleMount = fpsPanel?.parentElement;
    if (!fpsPanel || !toggleMount) {
      return null;
    }

    const toggle = documentRef.createElement("button");
    toggle.type = "button";
    toggle.id = "collider-debug-toggle";
    toggle.className = "collider-debug-toggle";
    toggle.setAttribute("aria-label", "Toggle collision and trigger debug areas");
    syncColliderDebugToggle(toggle);
    toggle.addEventListener("click", () => {
      runtimeFlags.debugColliders = !runtimeFlags.debugColliders;
      syncColliderDebugToggle(toggle);
      playSoundEvent(runtimeFlags.debugColliders ? SOUND_EVENT_IDS.UI_CONFIRM : SOUND_EVENT_IDS.UI_CANCEL);
      uiRuntime?.pushNotice?.(
        runtimeFlags.debugColliders ?
          "Collision and trigger areas visible." :
          "Collision and trigger areas hidden."
      );
    });

    fpsPanel.insertAdjacentElement("afterend", toggle);
    return toggle;
  }
  setupColliderDebugToggle();
  const playerMemory = createPlayerProfileState();
  const playerSkills = {
    transform: false,
    waterGun: false,
    leafage: false,
    fire: false,
    buildBlock: false
  };
  let harvestRequested = false;
  let harvestRequestSource = null;
  let interactRequested = false;
  let gamePaused = false;
  let builderPanelOpen = false;
  let gameSession = null;
  let uiRuntime = null;
  let sceneFlowRuntime = null;
  let storyBeats = null;
  let autosaveRuntime = null;
  let autosaveIndicatorSuppressed = false;
  let settingsMenu = null;
  let questCompletionPop = null;
  let scriptedInteractionActive = false;
  let leppaTreeTaskCameraFocusActive = false;
  let leppaTreeTaskCameraFocusTimeout = null;
  let leppaTreeTaskCameraFocusFrame = null;
  let leppaTreeTaskHintTimeout = null;
  let leppaTreeTileHintFlashUntil = 0;
  let squirtleDryGrassCameraFocusActive = false;
  let squirtleDryGrassCameraFocusTimeout = null;
  let squirtleDryGrassCameraFocusFrame = null;
  let squirtleDryGrassCameraFocusShown = false;
  let followerCallRequested = false;
  let activeFieldMoveState = createInactiveFieldMoveState();
  let mainThemeStarted = false;
  let settingsUnlockAutosaved = false;
  let fieldMoveSwitchPrompt = null;
  let logChairSaveRequestExpiresAt = 0;

  function getRuntimeNow() {
    return windowRef.performance?.now?.() ?? Date.now();
  }

  function prepareStrawBedSolarStationPlacement(placement) {
    if (!placement) {
      return placement;
    }

    placement.kind = "solarStation";
    placement.size = [0, 0];
    return placement;
  }

  function getCurrentPlayerPosition() {
    const position = gameSession?.playerCharacter?.getPosition?.() || null;
    return Array.isArray(position) ? position : null;
  }

  function setPendingPlacementIntent(intent = null) {
    if (!gameSession) {
      return null;
    }

    gameSession.pendingPlacementIntent = intent ? {
      source: "workbench",
      ...intent
    } : null;
    return gameSession.pendingPlacementIntent;
  }

  function clearPendingPlacementIntent(itemId = null) {
    if (!gameSession?.pendingPlacementIntent) {
      return;
    }

    if (!itemId || gameSession.pendingPlacementIntent.itemId === itemId) {
      gameSession.pendingPlacementIntent = null;
    }
  }

  function getCurrentInputModalityState() {
    return gameInput?.getInputModalityState?.() || null;
  }

  function getCurrentSolarStationPlacementTarget() {
    const playerPosition = getCurrentPlayerPosition();
    if (!playerPosition || typeof findNearbyActionTarget !== "function") {
      return null;
    }

    return findNearbyActionTarget({
      playerPosition,
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      storyState,
      inventory: {
        [STRAW_BED_ITEM_ID]: inventory[STRAW_BED_ITEM_ID]
      },
      groundGrassPatches: gameSession.groundGrassPatches,
      allowPlacement: true
    })?.strawBedPlacement || null;
  }

  function requestSolarStationPlacementIntent() {
    const solarStationState = getSolarStationProgressState({ storyState, inventory });

    if (
      !solarStationState.inBag ||
      solarStationState.state === SOLAR_STATION_PROGRESS_STATE.PLACED
    ) {
      clearPendingPlacementIntent(STRAW_BED_ITEM_ID);
      return false;
    }

    setPendingPlacementIntent({
      itemId: STRAW_BED_ITEM_ID,
      placeableId: GRID_PLACEABLE_IDS.SOLAR_STATION,
      label: "Solar Station"
    });

    const placementTarget = getCurrentSolarStationPlacementTarget();
    if (placementTarget?.canPlace && placementTarget?.center) {
      startStrawBedPlacementPreview(placementTarget);
      return true;
    }

    uiRuntime?.pushNotice?.(
      placementTarget?.reason ||
        `Solar Station ready. Move to open terrain and press ${
          resolveInputPrompt(UI_PROMPT_ACTION.PLACE, getCurrentInputModalityState())
        }.`
    );
    return false;
  }

  function requestGreenhousePlacementIntent() {
    if (Number(inventory[GREENHOUSE_ITEM_ID] || 0) <= 0) {
      clearPendingPlacementIntent(GREENHOUSE_ITEM_ID);
      return false;
    }

    setPendingPlacementIntent({
      itemId: GREENHOUSE_ITEM_ID,
      placeableId: GRID_PLACEABLE_IDS.GREENHOUSE,
      label: "Greenhouse"
    });
    uiRuntime?.pushNotice?.(
      `Greenhouse ready. Move to open terrain and press ${
        resolveInputPrompt(UI_PROMPT_ACTION.PLACE, getCurrentInputModalityState())
      }.`
    );
    return true;
  }

  function startGreenhousePlacementPreview(playerPosition) {
    if (!Array.isArray(playerPosition)) {
      uiRuntime?.pushNotice?.("Move into the world before placing the Greenhouse.");
      return false;
    }

    if (!hasItems(inventory, { [GREENHOUSE_ITEM_ID]: 1 })) {
      uiRuntime?.pushNotice?.("You need a Greenhouse in your bag.");
      clearPendingPlacementIntent(GREENHOUSE_ITEM_ID);
      return false;
    }

    const placement = buildGreenhousePlacement(playerPosition);
    const gridConfig = gameSession?.buildGridConfig ?
      cloneGridPlacementConfig(gameSession.buildGridConfig) :
      null;
    setPendingPlacementIntent({
      itemId: GREENHOUSE_ITEM_ID,
      placeableId: GRID_PLACEABLE_IDS.GREENHOUSE,
      label: "Greenhouse"
    });
    gameSession.greenhousePlacementPreview = {
      active: true,
      position: [...placement.position],
      snappedPosition: [...placement.position],
      size: [...placement.size],
      uvRect: [...placement.uvRect],
      gridConfig,
      gridStep: Number(gridConfig?.cellSize) || 1.425,
      yaw: 0,
      valid: false,
      readyForConfirm: false
    };
    uiRuntime?.pushNotice?.(
      resolvePlacementPreviewPrompt("Move the Greenhouse preview.", getCurrentInputModalityState())
    );
    return true;
  }

  function getSessionGreenhouses() {
    if (!Array.isArray(gameSession.greenhouses)) {
      gameSession.greenhouses = gameSession.greenhouse ? [gameSession.greenhouse] : [];
    }

    return gameSession.greenhouses;
  }

  function queueGroundActionFeedback({
    groundCells,
    abilityId = "waterGun",
    startedAt = null
  } = {}) {
    if (!gameSession) {
      return false;
    }

    const cells = (Array.isArray(groundCells) ? groundCells : [groundCells]).filter((groundCell) => {
      return groundCell && Array.isArray(groundCell.offset);
    });

    if (!cells.length) {
      return false;
    }

    if (!Array.isArray(gameSession.groundActionFeedbackQueue)) {
      gameSession.groundActionFeedbackQueue = [];
    }

    gameSession.groundActionFeedbackQueue.push({
      groundCells: cells,
      abilityId,
      startedAt: Number.isFinite(startedAt) ?
        startedAt :
        (typeof performance !== "undefined" ? performance.now() : Date.now())
    });
    return true;
  }

  function getGreenhouseSceneInstances() {
    if (Array.isArray(gameSession?.greenhouseSceneObject?.instances)) {
      return gameSession.greenhouseSceneObject.instances;
    }

    const previewInstance = gameSession?.greenhouseModelInstance;
    const greenhouseSceneObject = Array.isArray(gameSession?.sceneObjects) ?
      gameSession.sceneObjects.find((sceneObject) => {
        return Array.isArray(sceneObject?.instances) &&
          (
            sceneObject.instances.includes(previewInstance) ||
            sceneObject.instances.some((instance) => {
              return typeof instance?.id === "string" && instance.id.startsWith("greenhouse-");
            })
          );
      }) :
      null;

    if (greenhouseSceneObject) {
      gameSession.greenhouseSceneObject = greenhouseSceneObject;
    }

    return greenhouseSceneObject?.instances || null;
  }

  function appendGreenhouseModelInstance(placement) {
    const previewInstance = gameSession?.greenhouseModelInstance;
    if (!previewInstance || !Array.isArray(placement?.position)) {
      return;
    }

    const instances = getGreenhouseSceneInstances();
    const groundY = previewInstance.greenhouseGroundY ?? Number(previewInstance.offset?.[1] ?? 0.02);
    const baseScale = previewInstance.greenhouseBaseScale ?? Number(previewInstance.scale || 3);
    const baseYaw = previewInstance.greenhouseBaseYaw ?? Number(previewInstance.yaw || 0) - Number(placement.yaw || 0);
    const placedIndex = Array.isArray(gameSession.greenhouseModelInstances) ?
      gameSession.greenhouseModelInstances.length :
      0;

    previewInstance.id = `greenhouse-model-${placedIndex}`;
    previewInstance.placementId = placement.id;
    previewInstance.offset = [
      placement.position[0],
      groundY,
      placement.position[2]
    ];
    previewInstance.scale = baseScale;
    previewInstance.yaw = baseYaw + Number(placement.yaw || 0);
    previewInstance.active = true;
    previewInstance.alpha = 1;
    previewInstance.tintStrength = 0;

    if (!Array.isArray(gameSession.greenhouseModelInstances)) {
      gameSession.greenhouseModelInstances = [];
    }
    gameSession.greenhouseModelInstances.push(previewInstance);

    const nextPreviewInstance = {
      id: "greenhouse-preview-model",
      offset: [0, groundY, 0],
      scale: baseScale,
      yaw: baseYaw,
      active: false,
      placementId: null,
      greenhouseBaseScale: baseScale,
      greenhouseGroundY: groundY,
      greenhouseBaseYaw: baseYaw,
      alpha: 1,
      tintStrength: 0
    };
    gameSession.greenhouseModelInstance = nextPreviewInstance;

    if (instances && !instances.includes(nextPreviewInstance)) {
      instances.push(nextPreviewInstance);
    }
  }

  function confirmGreenhousePlacementPreview() {
    const preview = gameSession?.greenhousePlacementPreview;
    if (!preview?.active) {
      return false;
    }

    if (!preview.readyForConfirm) {
      uiRuntime?.pushNotice?.("Position the Greenhouse preview first.");
      return true;
    }

    if (preview.valid === false) {
      uiRuntime?.pushNotice?.("Greenhouse placement is blocked.");
      return true;
    }

    if (!hasItems(inventory, { [GREENHOUSE_ITEM_ID]: 1 })) {
      uiRuntime?.pushNotice?.("You need a Greenhouse in your bag.");
      gameSession.greenhousePlacementPreview = null;
      clearPendingPlacementIntent(GREENHOUSE_ITEM_ID);
      return true;
    }

    const basePlacement = buildGreenhousePlacement([0, 0.02, 0]);
    const placementPosition = Array.isArray(preview.snappedPosition) ?
      preview.snappedPosition :
      preview.position;
    const greenhouses = getSessionGreenhouses();
    const placedGreenhouse = attachPlayerPlacementSpawnEffect({
      ...basePlacement,
      id: `greenhouse-${greenhouses.length}`,
      position: [
        placementPosition[0],
        0.02,
        placementPosition[2]
      ],
      size: getPlacementQuarterTurnSize(
        Array.isArray(preview.size) ? preview.size : basePlacement.size,
        preview.yaw
      ),
      yaw: Number(preview.yaw || 0),
      uvRect: Array.isArray(preview.uvRect) ? [...preview.uvRect] : basePlacement.uvRect
    });
    greenhouses.push(placedGreenhouse);
    if (!gameSession.greenhouse) {
      gameSession.greenhouse = placedGreenhouse;
    }
    const restoredGreenhouseGroundCells = [];
    restoreGreenhouseFootprintGround({
      preview: {
        ...preview,
        snappedPosition: placementPosition
      },
      groundDeadInstances: gameSession.groundDeadInstances,
      iceGroundInstances: gameSession.iceGroundInstances,
      groundPurifiedInstances: gameSession.groundPurifiedInstances,
      restoredGroundCells: restoredGreenhouseGroundCells
    });
    queueGroundActionFeedback({
      groundCells: restoredGreenhouseGroundCells,
      abilityId: "greenhouse"
    });
    appendGreenhouseModelInstance(placedGreenhouse);
    gameSession.greenhousePlacementPreview = null;
    clearPendingPlacementIntent(GREENHOUSE_ITEM_ID);
    consumeItems(inventory, { [GREENHOUSE_ITEM_ID]: 1 });
    storyState.flags.greenhouseCrafted = true;
    storyState.flags.greenhousePlaced = true;
    uiRuntime?.syncInventoryUi?.(inventory);
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
    startConstructionCloudEffect({
      id: placedGreenhouse.id,
      position: placedGreenhouse.position
    });
    syncQuestPanels();
    requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
      storyBeatId: "greenhouse-placed"
    });
    return true;
  }

  function requestHouseKitPlacementIntent() {
    const hasSolarStationPower = Boolean(
      storyState.flags.strawBedPlacedInBulbasaurHabitat &&
      gameSession?.strawBed?.position
    );
    const placementReadiness = getHouseKitPlacementReadiness({
      storyState,
      inventory,
      hasSolarStationPower
    });

    if (placementReadiness.blockedReason === "missing-house-kit") {
      clearPendingPlacementIntent(LEAF_DEN_KIT_ITEM_ID);
      return false;
    }

    setPendingPlacementIntent({
      itemId: LEAF_DEN_KIT_ITEM_ID,
      placeableId: GRID_PLACEABLE_IDS.LEAF_DEN_KIT,
      label: "House Kit",
      blockedReason: placementReadiness.blockedReason
    });

    if (!placementReadiness.canPlace) {
      uiRuntime?.pushNotice?.(
        getColonyFeedbackNotice(COLONY_FEEDBACK_IDS.HOUSE_KIT_READY_NEEDS_SOLAR_STATION)
      );
      return false;
    }

    const playerPosition = getCurrentPlayerPosition();
    if (!playerPosition) {
      uiRuntime?.pushNotice?.(
        `House Kit ready. Move into the world and press ${
          resolveInputPrompt(UI_PROMPT_ACTION.PLACE, getCurrentInputModalityState())
        }.`
      );
      return false;
    }

    startLeafDenKitPlacementPreview(playerPosition);
    return true;
  }

  function getPlacementQuarterTurnSize(size, yaw = 0) {
    const width = Math.max(0.01, Number(size?.[0]) || 1);
    const depth = Math.max(0.01, Number(size?.[1]) || 1);
    const quarterTurn = Math.round((Number(yaw || 0) / (Math.PI * 0.5))) % 4;
    return Math.abs(quarterTurn) % 2 === 1 ? [depth, width] : [width, depth];
  }

  function createPlayerPlacementSpawnEffect() {
    return {
      elapsed: 0,
      duration: 0.82,
      fromScale: 0.18,
      toScale: 1,
      fromYOffset: 0.54,
      toYOffset: 0,
      fromAlpha: 0.08,
      toAlpha: 1
    };
  }

  function attachPlayerPlacementSpawnEffect(placement) {
    if (!placement) {
      return placement;
    }

    placement.spawnEffect = createPlayerPlacementSpawnEffect();
    return placement;
  }

  function startConstructionCloudEffect({ id, position, durationMs = 1600 } = {}) {
    if (!gameSession || !Array.isArray(position)) {
      return;
    }

    const now = Date.now();
    gameSession.constructionCloudBursts = Array.isArray(gameSession.constructionCloudBursts) ?
      gameSession.constructionCloudBursts.filter((effect) => {
        const startedAt = Number(effect?.startedAt || 0);
        const effectDuration = Number(effect?.durationMs || 0);
        return startedAt > 0 && effectDuration > 0 && now - startedAt < effectDuration;
      }) :
      [];
    gameSession.constructionCloudBursts.push({
      id: id || `construction-cloud-${now}`,
      position: [
        Number(position[0]) || 0,
        Number(position[1]) || 0.02,
        Number(position[2]) || 0
      ],
      startedAt: now,
      durationMs
    });
  }

  function syncStrawBedSolarStationModel(placement, { animate = false } = {}) {
    if (!gameSession?.strawBedModelInstance || !Array.isArray(placement?.position)) {
      return;
    }

    const finalScale =
      gameSession.strawBedModelInstance.solarStationFinalScale ||
      Number(gameSession.strawBedModelInstance.scale || 1);
    const groundY = gameSession.strawBedModelInstance.offset?.[1] ?? 0.02;
    const baseYaw =
      gameSession.strawBedModelInstance.solarStationBaseYaw ??
      Number(gameSession.strawBedModelInstance.yaw || 0);
    gameSession.strawBedModelInstance.solarStationBaseYaw = baseYaw;
    gameSession.strawBedModelInstance.offset = [
      placement.position[0],
      groundY,
      placement.position[2]
    ];
    gameSession.strawBedModelInstance.yaw = baseYaw + Number(placement.yaw || 0);
    gameSession.strawBedModelInstance.active = true;
    gameSession.strawBedModelInstance.solarStationFinalScale = finalScale;

    if (animate) {
      gameSession.strawBedModelInstance.solarStationSpawnEffect = {
        elapsed: 0,
        duration: 0.82,
        groundY,
        fromScale: finalScale * 0.18,
        toScale: finalScale,
        fromYOffset: 0.54,
        toYOffset: 0,
        fromAlpha: 0.08,
        toAlpha: 1
      };
      gameSession.strawBedModelInstance.scale = finalScale * 0.18;
      gameSession.strawBedModelInstance.offset[1] = groundY + 0.54;
      gameSession.strawBedModelInstance.alpha = 0.08;
      gameSession.strawBedModelInstance.tint = [1, 1.14, 0.72];
      gameSession.strawBedModelInstance.tintStrength = 0.34;
      return;
    }

    gameSession.strawBedModelInstance.scale = finalScale;
    gameSession.strawBedModelInstance.alpha = 1;
    gameSession.strawBedModelInstance.tintStrength = 0;
    gameSession.strawBedModelInstance.solarStationSpawnEffect = null;
  }

  function clonePlacementBounds(bounds) {
    if (!bounds) {
      return null;
    }

    return {
      minX: Number(bounds.minX),
      maxX: Number(bounds.maxX),
      minZ: Number(bounds.minZ),
      maxZ: Number(bounds.maxZ)
    };
  }

  function startStrawBedPlacementPreview(placementTarget) {
    const gridConfig = gameSession?.buildGridConfig ?
      cloneGridPlacementConfig(gameSession.buildGridConfig) :
      null;
    gameSession.strawBedPlacementPreview = {
      active: true,
      position: [...placementTarget.center],
      snappedPosition: [...placementTarget.center],
      bounds: clonePlacementBounds(placementTarget.bounds),
      gridConfig,
      gridStep: Number(gridConfig?.cellSize || placementTarget.gridStep) || 1.425,
      habitatGroupId: placementTarget.habitatGroupId || null,
      yaw: 0,
      valid: true,
      readyForConfirm: false
    };
    uiRuntime.pushNotice(
      resolvePlacementPreviewPrompt("Move the Solar Station preview.", getCurrentInputModalityState())
    );
  }

  function confirmStrawBedPlacementPreview() {
    const preview = gameSession?.strawBedPlacementPreview;
    if (!preview?.active) {
      return false;
    }

    if (!preview.readyForConfirm) {
      uiRuntime.pushNotice("Position the Solar Station preview first.");
      return true;
    }

    if (preview.valid === false) {
      uiRuntime.pushNotice("The Solar Station is overlapping another object.");
      return true;
    }

    const consumptionDecision = resolvePlacementConsumptionDecision({
      preview,
      inventory,
      itemId: STRAW_BED_ITEM_ID
    });
    if (!consumptionDecision.shouldConsume) {
      uiRuntime.pushNotice("The Solar Station kit is no longer in the bag.");
      return true;
    }

    const placementPosition = Array.isArray(preview.snappedPosition) ?
      preview.snappedPosition :
      preview.position;
    gameSession.strawBed = prepareStrawBedSolarStationPlacement(
      buildStrawBedPlacement(placementPosition)
    );
    gameSession.strawBed.yaw = Number(preview.yaw || 0);
    gameSession.strawBedPlacementPreview = null;
    clearPendingPlacementIntent(STRAW_BED_ITEM_ID);
    syncStrawBedSolarStationModel(gameSession.strawBed, { animate: true });
    startConstructionCloudEffect({
      id: "solar-station",
      position: gameSession.strawBed.position
    });
    consumeItems(inventory, { [STRAW_BED_ITEM_ID]: 1 });
    storyState.flags.strawBedPlacedInBulbasaurHabitat = true;
    uiRuntime.syncInventoryUi(inventory);
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
    uiRuntime.pushNotice(getColonyFeedbackNotice(COLONY_FEEDBACK_IDS.SOLAR_STATION_PLACED));
    syncQuestPanels();
    if (shouldChainHouseKitPlacementAfterSolarStation({ storyState, inventory, gameSession })) {
      requestHouseKitPlacementIntent();
    }
    return true;
  }

  function startLeafDenKitPlacementPreview(playerPosition) {
    const placement = buildLeafDenKitPlacement(playerPosition);
    const gridConfig = gameSession?.buildGridConfig ?
      cloneGridPlacementConfig(gameSession.buildGridConfig) :
      null;
    gameSession.leafDenKitPlacementPreview = {
      active: true,
      position: [...placement.position],
      snappedPosition: [...placement.position],
      size: [...placement.size],
      uvRect: [...placement.uvRect],
      gridConfig,
      gridStep: Number(gridConfig?.cellSize) || 1.425,
      yaw: 0,
      valid: true,
      readyForConfirm: false
    };
    uiRuntime.pushNotice(
      resolvePlacementPreviewPrompt("Move the House Kit preview.", getCurrentInputModalityState())
    );
  }

  function buildPlayerHousePlacement(basePlacement, placementPosition, preview) {
    const houseIndex = Array.isArray(gameSession?.playerHouses) ?
      gameSession.playerHouses.length :
      0;
    const x = Number(placementPosition?.[0] || 0);
    const z = Number(placementPosition?.[2] || 0);

    return {
      ...basePlacement,
      id: `player-house-${houseIndex + 1}-${Math.round(x * 100)}-${Math.round(z * 100)}`,
      kind: "playerHouse",
      constructionSiteId: null,
      buildingKitId: LEAF_DEN_KIT_ITEM_ID,
      constructionName: "House",
      constructionStatus: "complete",
      interactionBox: null,
      position: [
        x,
        0.02,
        z
      ],
      size: getPlacementQuarterTurnSize(
        Array.isArray(preview.size) ? preview.size : basePlacement.size,
        preview.yaw
      ),
      yaw: Number(preview.yaw || 0),
      uvRect: Array.isArray(preview.uvRect) ? [...preview.uvRect] : basePlacement.uvRect
    };
  }

  function startCampfirePlacementPreview(playerPosition) {
    if (!Array.isArray(playerPosition)) {
      uiRuntime.pushNotice(`Move into the world before placing the ${SANDBOTS_ITEM_NAMES.thermalCabin}.`);
      return false;
    }

    const placement = buildCampfirePlacement(playerPosition);
    const gridConfig = gameSession?.buildGridConfig ?
      cloneGridPlacementConfig(gameSession.buildGridConfig) :
      null;
    setPendingPlacementIntent({
      itemId: CAMPFIRE_ITEM_ID,
      placeableId: GRID_PLACEABLE_IDS.TRAIN_HOUSE,
      label: SANDBOTS_ITEM_NAMES.thermalCabin
    });
    gameSession.campfirePlacementPreview = {
      active: true,
      position: [...placement.position],
      snappedPosition: [...placement.position],
      size: [...placement.size],
      uvRect: [...placement.uvRect],
      gridConfig,
      gridStep: Number(gridConfig?.cellSize) || 1.425,
      yaw: 0,
      valid: true,
      readyForConfirm: false
    };
    uiRuntime.pushNotice(
      resolvePlacementPreviewPrompt(`Move the ${SANDBOTS_ITEM_NAMES.thermalCabin} preview.`, getCurrentInputModalityState())
    );
    return true;
  }

  function confirmCampfirePlacementPreview() {
    const preview = gameSession?.campfirePlacementPreview;
    if (!preview?.active) {
      return false;
    }

    if (!preview.readyForConfirm) {
      uiRuntime.pushNotice(`Position the ${SANDBOTS_ITEM_NAMES.thermalCabin} preview first.`);
      return true;
    }

    if (preview.valid === false) {
      uiRuntime.pushNotice(`${SANDBOTS_ITEM_NAMES.thermalCabin} is overlapping another object.`);
      return true;
    }

    if (!hasItems(inventory, { [CAMPFIRE_ITEM_ID]: 1 })) {
      uiRuntime.pushNotice(`You need the ${SANDBOTS_ITEM_NAMES.thermalCabin} in your bag.`);
      gameSession.campfirePlacementPreview = null;
      clearPendingPlacementIntent(CAMPFIRE_ITEM_ID);
      return true;
    }

    const basePlacement = buildCampfirePlacement([0, 0.02, 0]);
    const placementPosition = Array.isArray(preview.snappedPosition) ?
      preview.snappedPosition :
      preview.position;
    musicRuntime.stopBackgroundSoundtrack();
    gameSession.campfire = attachPlayerPlacementSpawnEffect({
      ...basePlacement,
      position: [
        placementPosition[0],
        0.02,
        placementPosition[2]
      ],
      size: getPlacementQuarterTurnSize(
        Array.isArray(preview.size) ? preview.size : basePlacement.size,
        preview.yaw
      ),
      yaw: Number(preview.yaw || 0),
      uvRect: Array.isArray(preview.uvRect) ? [...preview.uvRect] : basePlacement.uvRect
    });
    gameSession.campfirePlacementPreview = null;
    clearPendingPlacementIntent(CAMPFIRE_ITEM_ID);
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
    startConstructionCloudEffect({
      id: "train-house",
      position: gameSession.campfire.position
    });
    consumeItems(inventory, { [CAMPFIRE_ITEM_ID]: 1 });
    uiRuntime.syncInventoryUi(inventory);
    storyBeats.complete(STORY_BEAT_IDS.CAMPFIRE_SPIT_OUT);
    syncQuestPanels();
    requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
      storyBeatId: STORY_BEAT_IDS.CAMPFIRE_SPIT_OUT
    });
    return true;
  }

  function confirmLeafDenKitPlacementPreview() {
    const preview = gameSession?.leafDenKitPlacementPreview;
    if (!preview?.active) {
      return false;
    }

    if (!preview.readyForConfirm) {
      uiRuntime.pushNotice("Position the House Kit preview first.");
      return true;
    }

    if (preview.valid === false) {
      uiRuntime.pushNotice(
        preview.invalidReason === "invalid-terrain" ?
          "The House Kit needs valid ground." :
          preview.invalidReason === "outside-solar-station-radius" ?
            "The House Kit must stay inside the blue Solar Station support zone." :
            "The House Kit is overlapping another object."
      );
      return true;
    }

    const consumptionDecision = resolvePlacementConsumptionDecision({
      preview,
      inventory,
      itemId: LEAF_DEN_KIT_ITEM_ID
    });
    if (!consumptionDecision.shouldConsume) {
      uiRuntime.pushNotice("The House Kit is no longer in the bag.");
      return true;
    }

    const basePlacement = buildLeafDenKitPlacement([0, 0.02, 0]);
    const placementPosition = Array.isArray(preview.snappedPosition) ?
      preview.snappedPosition :
      preview.position;
    const placingStoryHouse = !storyState.flags.leafDenKitPlaced && !gameSession?.leafDen;
    if (!placingStoryHouse) {
      const playerHouse = buildPlayerHousePlacement(basePlacement, placementPosition, preview);
      attachPlayerPlacementSpawnEffect(playerHouse);
      gameSession.playerHouses ||= [];
      gameSession.playerHouses.push(playerHouse);
      gameSession.leafDenKitPlacementPreview = null;
      clearPendingPlacementIntent(LEAF_DEN_KIT_ITEM_ID);
      consumeItems(inventory, { [LEAF_DEN_KIT_ITEM_ID]: 1 });
      storyState.flags.leafDenKitSelected = Number(inventory[LEAF_DEN_KIT_ITEM_ID] || 0) > 0;
      uiRuntime.syncInventoryUi(inventory);
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
      startConstructionCloudEffect({
        id: playerHouse.id,
        position: playerHouse.position
      });
      uiRuntime.pushNotice(formatHouseRegisteredNotice(playerMemory));
      syncQuestPanels();
      return true;
    }

    gameSession.leafDen = {
      ...basePlacement,
      position: [
        placementPosition[0],
        0.02,
        placementPosition[2]
      ],
      size: getPlacementQuarterTurnSize(
        Array.isArray(preview.size) ? preview.size : basePlacement.size,
        preview.yaw
      ),
      yaw: Number(preview.yaw || 0),
      uvRect: Array.isArray(preview.uvRect) ? [...preview.uvRect] : basePlacement.uvRect
    };
    attachPlayerPlacementSpawnEffect(gameSession.leafDen);
    gameSession.leafDenKitPlacementPreview = null;
    clearPendingPlacementIntent(LEAF_DEN_KIT_ITEM_ID);
    consumeItems(inventory, { [LEAF_DEN_KIT_ITEM_ID]: 1 });
    storyState.flags.leafDenKitPlaced = true;
    storyState.flags.leafDenKitSelected = false;
    uiRuntime.syncInventoryUi(inventory);
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
    uiRuntime.pushNotice(formatHouseRegisteredNotice(playerMemory));
    syncQuestPanels();
    return true;
  }

  function startMainThemeFromChopperFirstTalk() {
    if (mainThemeStarted) {
      return;
    }

    mainThemeStarted = true;
    planetAmbientRuntime.start({
      intensity: PLANET_AMBIENT_INTENSITY.CALM
    });
    planetAmbientRuntime.setIntensity(PLANET_AMBIENT_INTENSITY.CALM);
    musicRuntime.play(MUSIC_TRACK_IDS.MAIN_THEME);
  }

  function startRandomSavedGameSoundtrack() {
    mainThemeStarted = true;
    planetAmbientRuntime.start({
      intensity: PLANET_AMBIENT_INTENSITY.CALM
    });
    planetAmbientRuntime.setIntensity(PLANET_AMBIENT_INTENSITY.CALM);
    musicRuntime.playRandomSoundtrack({ restart: true });
  }

  function flashLeppaTreeTaskHint() {
    const applyFlash = () => {
      const taskElement = Array.from(
        dom.hudChecklist?.querySelectorAll?.(".hud-checklist__item--tracked") || []
      ).find((element) => {
        return element.dataset.taskTitle === "Revive the dead tree";
      });

      if (!taskElement) {
        return;
      }

      if (leppaTreeTaskHintTimeout !== null) {
        windowRef.clearTimeout?.(leppaTreeTaskHintTimeout);
        leppaTreeTaskHintTimeout = null;
      }

      taskElement.dataset.hintFlash = "false";
      void taskElement.offsetWidth;
      taskElement.dataset.hintFlash = "true";
      leppaTreeTaskHintTimeout = windowRef.setTimeout(() => {
        taskElement.dataset.hintFlash = "false";
        leppaTreeTaskHintTimeout = null;
      }, 1500);
    };

    uiRuntime?.syncQuestFocus?.(storyState);
    leppaTreeTileHintFlashUntil = getRuntimeNow() + 1500;

    if (typeof windowRef.requestAnimationFrame === "function") {
      windowRef.requestAnimationFrame(applyFlash);
      return;
    }

    windowRef.setTimeout?.(applyFlash, 0);
  }

  function buildQuestTransitionNotice(completedQuestIds = [], activeQuest = null) {
    const completedQuest = questSystem.getQuest(completedQuestIds.at(-1));
    const nextQuest = completedQuest?.nextQuestId ?
      questSystem.getQuest(completedQuest.nextQuestId) :
      activeQuest;
    const completedCopy = completedQuest ? `Task complete: ${completedQuest.title}.` : "Task complete.";
    const nextCopy = nextQuest ?
      `Next: ${nextQuest.title}. ${nextQuest.guidance || nextQuest.description}` :
      "Free roam: keep restoring the island and checking in with helpers.";
    return `${completedCopy} ${nextCopy}`;
  }

  function buildQuestCompletionPopText(completedQuestIds = []) {
    const completedQuestId = completedQuestIds.at(-1);
    const completedQuest = completedQuestId ? questSystem.getQuest(completedQuestId) : null;
    const firstMissionPopText = getFirstMissionCompletionPopText(completedQuestId);

    if (firstMissionPopText) {
      return firstMissionPopText;
    }

    return QUEST_COMPLETION_POP_MESSAGES[completedQuestId] ||
      `You completed ${completedQuest?.title || "the task"}!`;
  }

  function showQuestCompletionPop(completedQuestIds = []) {
    if (completedQuestIds.length > 0) {
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_SUCCESS);
    }
    questCompletionPop = {
      text: buildQuestCompletionPopText(completedQuestIds),
      expiresAt: getRuntimeNow() + QUEST_COMPLETION_POP_DURATION_MS
    };
  }

  function getBulbasaurRepairBoxFocusPosition() {
    const encounter = gameSession?.bulbasaurEncounter;
    const repairBoxPosition =
      encounter?.repairBoxPosition ||
      encounter?.repairModuleInstance?.baseOffset ||
      encounter?.repairPosition ||
      null;

    return Array.isArray(repairBoxPosition) ? [...repairBoxPosition] : null;
  }

  function focusChopperForBulbasaurRepairBoxIntro() {
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const chopperPosition = getChopperNpcPosition();

    if (!playerPosition || !chopperPosition) {
      return;
    }

    gameSession?.chopperNpcActor?.npcActor?.character?.faceToward?.(playerPosition);
    if (gameSession?.chopperNpcActor?.npcActor) {
      gameSession.chopperNpcActor.npcActor.faceYaw = getYawToward(chopperPosition, playerPosition);
    }
    dialogueCamera?.focusNpcConversation({
      targetId: "tangrowth",
      playerPosition,
      npcActors: gameSession?.npcActors || [],
      interactables: gameSession?.interactables || []
    });
  }

  function startBulbasaurRepairBoxRustle() {
    const encounter = gameSession?.bulbasaurEncounter;

    if (!encounter) {
      return;
    }

    encounter.repairBoxRustle = {
      active: true,
      elapsed: 0,
      duration: BULBASAUR_REPAIR_BOX_INTRO_RUSTLE_DURATION_MS / 1000
    };
    if (encounter.repairModuleInstance) {
      encounter.repairModuleInstance.active = true;
    }
  }

  function completeBulbasaurRepairBoxIntro() {
    delete storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_STARTED_FLAG];
    storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_COMPLETE_FLAG] = true;
    scriptedInteractionActive = false;
    dialogueCamera?.restoreGameplayCamera();
    syncQuestPanels();
    requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
      storyBeatId: "chopper-bulbasaur-repair-box-intro"
    }, { silent: true });
  }

  function openBulbasaurRepairBoxPreInteractionDialogue() {
    focusChopperForBulbasaurRepairBoxIntro();
    const opened = uiRuntime.gameplayDialogue.openConversation({
      lines: CHOPPER_BULBASAUR_REPAIR_BOX_PRE_INTERACTION_LINES,
      onComplete: completeBulbasaurRepairBoxIntro
    });

    if (!opened) {
      completeBulbasaurRepairBoxIntro();
    }
  }

  function autoStartBulbasaurRepairBoxIntroFromCompletedQuests(completedQuestIds = []) {
    if (
      !completedQuestIds.includes("water-dry-grass") ||
      storyState.flags.bulbasaurRevealed ||
      storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_STARTED_FLAG] ||
      storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_COMPLETE_FLAG]
    ) {
      return false;
    }

    const repairBoxPosition = getBulbasaurRepairBoxFocusPosition();

    if (!repairBoxPosition) {
      return false;
    }

    storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_STARTED_FLAG] = true;
    scriptedInteractionActive = true;
    clearGameFlowInput();

    const openIntroConversation = () => {
      focusChopperForBulbasaurRepairBoxIntro();
      return uiRuntime.gameplayDialogue.openConversation({
        lines: CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_LINES,
        onComplete() {
          clearGameFlowInput();
          windowRef.setTimeout(() => {
            dialogueCamera?.focusWorldPoint({
              position: repairBoxPosition,
              height: BULBASAUR_REPAIR_BOX_INTRO_FOCUS_HEIGHT
            });
            windowRef.setTimeout(
              () => {
                startBulbasaurRepairBoxRustle();
                windowRef.setTimeout(
                  () => {
                    dialogueCamera?.restoreGameplayCamera();
                    windowRef.setTimeout(
                      openBulbasaurRepairBoxPreInteractionDialogue,
                      BULBASAUR_REPAIR_BOX_INTRO_FOCUS_DELAY_MS
                    );
                  },
                  BULBASAUR_REPAIR_BOX_INTRO_RUSTLE_DURATION_MS
                );
              },
              BULBASAUR_REPAIR_BOX_INTRO_FOCUS_DELAY_MS
            );
          }, BULBASAUR_REPAIR_BOX_INTRO_FOCUS_DELAY_MS);
        }
      });
    };

    const chopperActor = gameSession?.chopperNpcActor;
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const chopperPosition = getChopperNpcPosition() || playerPosition;
    const flightStarted = playerPosition && chopperPosition ?
      startChopperNpcFlight(chopperActor, {
        targetPosition: buildChopperApproachTarget(playerPosition, chopperPosition),
        duration: CHOPPER_SECOND_TALK_APPROACH_DURATION,
        onComplete: openIntroConversation
      }) :
      false;
    const opened = flightStarted || openIntroConversation();

    if (!opened) {
      scriptedInteractionActive = false;
      delete storyState.flags[CHOPPER_BULBASAUR_REPAIR_BOX_INTRO_STARTED_FLAG];
      return false;
    }

    return true;
  }

  function isBulbasaurDryGrassRequestTaskActive() {
    return Boolean(
      storyState.flags.bulbasaurRevealed &&
      !storyState.flags.bulbasaurDryGrassMissionAccepted &&
      !(
        storyState.flags.squirtleLeppaRequestAvailable &&
        !storyState.flags.leppaTreeRevived
      )
    );
  }

  function autoStartBulbasaurDryGrassRequestFromTask() {
    if (!isBulbasaurDryGrassRequestTaskActive()) {
      return false;
    }

    storyState.flags.bulbasaurDryGrassMissionAccepted = true;
    storyState.flags.bulbasaurFollowing = true;
    syncQuestPanels();

    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const targetPosition =
      gameSession?.bulbasaurEncounter?.position ||
      gameSession?.bulbasaurEncounter?.repairPosition ||
      null;

    if (playerPosition && targetPosition) {
      dialogueCamera?.focusNpcConversation({
        targetId: "bulbasaur",
        playerPosition,
        npcActors: gameSession?.npcActors || [],
        interactables: gameSession?.interactables || [],
        targetPosition
      });
    }

    storyBeats?.playDialogue?.(STORY_BEAT_IDS.BULBASAUR_DRY_GRASS_REQUEST);
    return true;
  }

  function getQuestCompletionPop() {
    if (!questCompletionPop) {
      return null;
    }

    if (questCompletionPop.expiresAt <= getRuntimeNow()) {
      questCompletionPop = null;
      return null;
    }

    return questCompletionPop;
  }

  function getYawToward(fromPosition, toPosition) {
    const deltaX = toPosition[0] - fromPosition[0];
    const deltaZ = toPosition[2] - fromPosition[2];
    return Math.atan2(deltaX, deltaZ);
  }

  function getChopperNpcPosition() {
    return gameSession?.chopperNpcActor?.npcActor?.character?.getPosition?.() || null;
  }

  function setBillCameoVisible(visible) {
    if (gameSession?.billCameo) {
      gameSession.billCameo.visible = gameSession.billCameo.persistent ? true : visible;
    }
  }

  function focusBillCameo() {
    const position = gameSession?.billCameo?.position;

    if (!position) {
      return false;
    }

    setBillCameoVisible(true);
    dialogueCamera?.focusWorldPoint({
      position,
      height: 1.05
    });
    return true;
  }

  function refocusChopperConversation() {
    const latestPlayerPosition = gameSession?.playerCharacter?.getPosition?.();

    if (!latestPlayerPosition) {
      return false;
    }

    dialogueCamera?.focusNpcConversation({
      targetId: "tangrowth",
      playerPosition: latestPlayerPosition,
      npcActors: gameSession?.npcActors || [],
      interactables: gameSession?.interactables || []
    });
    return true;
  }

  function getFirstChopperGuideTarget() {
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const chopperPosition = getChopperNpcPosition();

    if (!playerPosition || !chopperPosition) {
      return null;
    }

    return buildChopperApproachTarget(playerPosition, chopperPosition);
  }

  function focusFirstChopperGuideBeat() {
    const chopperPosition = getChopperNpcPosition();
    const targetPosition = getFirstChopperGuideTarget();

    if (!chopperPosition || !targetPosition) {
      return refocusChopperConversation();
    }

    dialogueCamera?.focusWorldPoint({
      position: [
        (chopperPosition[0] + targetPosition[0]) * 0.5,
        chopperPosition[1],
        (chopperPosition[2] + targetPosition[2]) * 0.5
      ],
      height: CHOPPER_FIRST_GUIDE_CAMERA_HEIGHT
    });
    return true;
  }

  function playFirstChopperGuideAction() {
    const chopperActor = gameSession?.chopperNpcActor;
    const targetPosition = getFirstChopperGuideTarget();

    if (!chopperActor || !targetPosition) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const flightStarted = startChopperNpcFlight(chopperActor, {
        targetPosition,
        duration: CHOPPER_FIRST_GUIDE_APPROACH_DURATION,
        onComplete() {
          resolve(true);
        }
      });

      if (!flightStarted) {
        resolve(false);
      }
    });
  }

  function revealDismantledSquirtle() {
    const squirtle = gameSession?.actTwoSquirtle;

    if (!squirtle) {
      return false;
    }

    squirtle.visible = true;
    if (!squirtle.recovered && squirtle.assemblyState !== "assembled") {
      squirtle.assemblyState = squirtle.reassembly?.active ? "reassembling" : "dismantled";
    }
    if (squirtle.modelInstance && squirtle.assemblyState !== "assembled") {
      squirtle.modelInstance.active = false;
    }
    return true;
  }

  function focusActTwoSquirtle({ defer = false } = {}) {
    const position = gameSession?.actTwoSquirtle?.position;

    if (!position) {
      return false;
    }

    const focus = () => {
      dialogueCamera?.focusWorldPoint({
        position,
        height: 1.05
      });
    };

    if (defer && typeof windowRef.requestAnimationFrame === "function") {
      windowRef.requestAnimationFrame(focus);
    } else {
      focus();
    }
    return true;
  }

  function focusActTwoSquirtleConversation({ defer = false } = {}) {
    const position = gameSession?.actTwoSquirtle?.position;
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();

    if (!position || !playerPosition) {
      return focusActTwoSquirtle({ defer });
    }

    const focus = () => {
      const latestPlayerPosition = gameSession?.playerCharacter?.getPosition?.() || playerPosition;

      dialogueCamera?.focusNpcConversation({
        targetId: "squirtle",
        playerPosition: latestPlayerPosition,
        npcActors: gameSession?.npcActors || [],
        interactables: gameSession?.interactables || [],
        targetPosition: position
      });
    };

    if (defer && typeof windowRef.requestAnimationFrame === "function") {
      windowRef.requestAnimationFrame(focus);
    } else {
      focus();
    }
    return true;
  }

  function clearLeppaTreeTaskCameraFocusTimeout() {
    if (leppaTreeTaskCameraFocusTimeout !== null) {
      windowRef.clearTimeout?.(leppaTreeTaskCameraFocusTimeout);
      leppaTreeTaskCameraFocusTimeout = null;
    }
  }

  function clearLeppaTreeTaskCameraFocusFrame() {
    if (leppaTreeTaskCameraFocusFrame !== null) {
      if (typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(leppaTreeTaskCameraFocusFrame);
      } else {
        windowRef.clearTimeout?.(leppaTreeTaskCameraFocusFrame);
      }
      leppaTreeTaskCameraFocusFrame = null;
    }
  }

  function requestLeppaTreeTaskCameraFocusFrame(callback) {
    if (typeof windowRef.requestAnimationFrame === "function") {
      leppaTreeTaskCameraFocusFrame = windowRef.requestAnimationFrame((timestamp) => {
        leppaTreeTaskCameraFocusFrame = null;
        callback(timestamp);
      });
      return;
    }

    leppaTreeTaskCameraFocusFrame = windowRef.setTimeout(() => {
      leppaTreeTaskCameraFocusFrame = null;
      callback(getRuntimeNow());
    }, 16);
  }

  function finishLeppaTreeTaskCameraFocus() {
    clearLeppaTreeTaskCameraFocusTimeout();
    clearLeppaTreeTaskCameraFocusFrame();

    if (!leppaTreeTaskCameraFocusActive) {
      return;
    }

    leppaTreeTaskCameraFocusActive = false;
    clearGameFlowInput();
    scriptedInteractionActive = false;
    dialogueCamera?.restoreGameplayCamera();
  }

  function startLeppaTreeTaskCameraOrbit(position) {
    if (!leppaTreeTaskCameraFocusActive || !Array.isArray(position)) {
      finishLeppaTreeTaskCameraFocus();
      return;
    }

    const camera = engine?.camera;

    if (!camera?.getPose || !camera?.setPose) {
      finishLeppaTreeTaskCameraFocus();
      return;
    }

    const startedAt = getRuntimeNow();
    const currentPose = camera.getPose();
    const currentDirection = currentPose.direction || [1, LEPPA_TREE_TASK_CAMERA_ORBIT_PITCH, 0];
    const startYaw = Math.atan2(currentDirection[2] || 0, currentDirection[0] || 1);
    const pitch = Math.max(
      0.18,
      Math.min(0.58, Math.abs(currentDirection[1]) || LEPPA_TREE_TASK_CAMERA_ORBIT_PITCH)
    );
    const target = [
      position[0],
      LEPPA_TREE_TASK_CAMERA_FOCUS_HEIGHT,
      position[2]
    ];

    const orbit = (now = getRuntimeNow()) => {
      if (!leppaTreeTaskCameraFocusActive) {
        return;
      }

      const progress = Math.min(
        1,
        (now - startedAt) / LEPPA_TREE_TASK_CAMERA_ORBIT_DURATION_MS
      );
      const angle = startYaw + Math.PI * 2 * progress;
      const direction = [Math.cos(angle), pitch, Math.sin(angle)];

      clearGameFlowInput();
      camera.setPose({
        target,
        direction,
        zoom: LEPPA_TREE_TASK_CAMERA_ORBIT_ZOOM,
        distance: LEPPA_TREE_TASK_CAMERA_ORBIT_DISTANCE
      });
      engine.cameraOrbit?.sync?.(direction);

      if (progress >= 1) {
        finishLeppaTreeTaskCameraFocus();
        return;
      }

      requestLeppaTreeTaskCameraFocusFrame(orbit);
    };

    requestLeppaTreeTaskCameraFocusFrame(orbit);
  }

  function shouldWaitForLeppaTreeTaskCameraFocus() {
    return Boolean(
      uiRuntime?.pokedexUiState?.open ||
      uiRuntime?.gameplayDialogue?.isActive?.() ||
      gamePaused ||
      builderPanelOpen ||
      !sceneFlowRuntime?.sceneDirector?.is?.(GAME_FLOW.GAMEPLAY) ||
      (scriptedInteractionActive && !leppaTreeTaskCameraFocusActive)
    );
  }

  function scheduleLeppaTreeTaskCameraFocus(startedAt = getRuntimeNow()) {
    clearLeppaTreeTaskCameraFocusTimeout();
    clearLeppaTreeTaskCameraFocusFrame();

    const attemptFocus = () => {
      leppaTreeTaskCameraFocusTimeout = null;

      const position = gameSession?.leppaTree?.position;

      if (!Array.isArray(position)) {
        if (getRuntimeNow() - startedAt > LEPPA_TREE_TASK_CAMERA_FOCUS_MAX_WAIT_MS) {
          return;
        }

        leppaTreeTaskCameraFocusTimeout = windowRef.setTimeout(
          attemptFocus,
          LEPPA_TREE_TASK_CAMERA_FOCUS_RETRY_MS
        );
        return;
      }

      if (shouldWaitForLeppaTreeTaskCameraFocus()) {
        leppaTreeTaskCameraFocusTimeout = windowRef.setTimeout(
          attemptFocus,
          LEPPA_TREE_TASK_CAMERA_FOCUS_RETRY_MS
        );
        return;
      }

      leppaTreeTaskCameraFocusActive = true;
      scriptedInteractionActive = true;
      clearGameFlowInput();
      dialogueCamera?.focusWorldPoint({
        position,
        height: LEPPA_TREE_TASK_CAMERA_FOCUS_HEIGHT
      });
      leppaTreeTaskCameraFocusTimeout = windowRef.setTimeout(
        () => {
          leppaTreeTaskCameraFocusTimeout = null;
          startLeppaTreeTaskCameraOrbit(position);
        },
        LEPPA_TREE_TASK_CAMERA_FOCUS_TRANSITION_MS
      );
    };

    leppaTreeTaskCameraFocusTimeout = windowRef.setTimeout(attemptFocus, 0);
  }

  function clearSquirtleDryGrassCameraFocusTimeout() {
    if (squirtleDryGrassCameraFocusTimeout !== null) {
      windowRef.clearTimeout?.(squirtleDryGrassCameraFocusTimeout);
      squirtleDryGrassCameraFocusTimeout = null;
    }
  }

  function clearSquirtleDryGrassCameraFocusFrame() {
    if (squirtleDryGrassCameraFocusFrame !== null) {
      if (typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(squirtleDryGrassCameraFocusFrame);
      } else {
        windowRef.clearTimeout?.(squirtleDryGrassCameraFocusFrame);
      }
      squirtleDryGrassCameraFocusFrame = null;
    }
  }

  function requestSquirtleDryGrassCameraFocusFrame(callback) {
    if (typeof windowRef.requestAnimationFrame === "function") {
      squirtleDryGrassCameraFocusFrame = windowRef.requestAnimationFrame((timestamp) => {
        squirtleDryGrassCameraFocusFrame = null;
        callback(timestamp);
      });
      return;
    }

    squirtleDryGrassCameraFocusFrame = windowRef.setTimeout(() => {
      squirtleDryGrassCameraFocusFrame = null;
      callback(getRuntimeNow());
    }, 16);
  }

  function finishSquirtleDryGrassCameraFocus({ refocusSquirtle = true } = {}) {
    clearSquirtleDryGrassCameraFocusTimeout();
    clearSquirtleDryGrassCameraFocusFrame();

    if (!squirtleDryGrassCameraFocusActive) {
      return;
    }

    squirtleDryGrassCameraFocusActive = false;
    clearGameFlowInput();
    scriptedInteractionActive = false;
    if (refocusSquirtle) {
      focusActTwoSquirtleConversation();
    }
  }

  function findSquirtleDryGrassFocusPatch() {
    const squirtlePosition = gameSession?.actTwoSquirtle?.position;
    const dryPatches = (gameSession?.groundGrassPatches || [])
      .filter((patch) => {
        return (
          patch?.state !== "alive" &&
          Array.isArray(patch.position)
        );
      });

    if (!dryPatches.length) {
      return null;
    }

    if (!Array.isArray(squirtlePosition)) {
      return dryPatches[0];
    }

    return dryPatches.reduce((nearestPatch, patch) => {
      const nearestDistance = Math.hypot(
        nearestPatch.position[0] - squirtlePosition[0],
        nearestPatch.position[2] - squirtlePosition[2]
      );
      const patchDistance = Math.hypot(
        patch.position[0] - squirtlePosition[0],
        patch.position[2] - squirtlePosition[2]
      );

      return patchDistance < nearestDistance ? patch : nearestPatch;
    }, dryPatches[0]);
  }

  function startSquirtleDryGrassCameraOrbit(position) {
    if (!squirtleDryGrassCameraFocusActive || !Array.isArray(position)) {
      finishSquirtleDryGrassCameraFocus();
      return;
    }

    const camera = engine?.camera;

    if (!camera?.getPose || !camera?.setPose) {
      finishSquirtleDryGrassCameraFocus();
      return;
    }

    const startedAt = getRuntimeNow();
    const currentPose = camera.getPose();
    const currentDirection = currentPose.direction || [1, LEPPA_TREE_TASK_CAMERA_ORBIT_PITCH, 0];
    const startYaw = Math.atan2(currentDirection[2] || 0, currentDirection[0] || 1);
    const pitch = Math.max(
      0.18,
      Math.min(0.58, Math.abs(currentDirection[1]) || LEPPA_TREE_TASK_CAMERA_ORBIT_PITCH)
    );
    const target = [
      position[0],
      SQUIRTLE_DRY_GRASS_CAMERA_FOCUS_HEIGHT,
      position[2]
    ];

    const orbit = (now = getRuntimeNow()) => {
      if (!squirtleDryGrassCameraFocusActive) {
        return;
      }

      const progress = Math.min(
        1,
        (now - startedAt) / LEPPA_TREE_TASK_CAMERA_ORBIT_DURATION_MS
      );
      const angle = startYaw + Math.PI * 2 * progress;
      const direction = [Math.cos(angle), pitch, Math.sin(angle)];

      clearGameFlowInput();
      camera.setPose({
        target,
        direction,
        zoom: LEPPA_TREE_TASK_CAMERA_ORBIT_ZOOM,
        distance: LEPPA_TREE_TASK_CAMERA_ORBIT_DISTANCE
      });
      engine.cameraOrbit?.sync?.(direction);

      if (progress >= 1) {
        finishSquirtleDryGrassCameraFocus();
        return;
      }

      requestSquirtleDryGrassCameraFocusFrame(orbit);
    };

    requestSquirtleDryGrassCameraFocusFrame(orbit);
  }

  function startSquirtleDryGrassCameraFocus() {
    if (squirtleDryGrassCameraFocusShown || squirtleDryGrassCameraFocusActive) {
      return false;
    }

    const dryGrassPatch = findSquirtleDryGrassFocusPatch();
    const position = dryGrassPatch?.position;

    if (!Array.isArray(position)) {
      return false;
    }

    squirtleDryGrassCameraFocusShown = true;
    squirtleDryGrassCameraFocusActive = true;
    scriptedInteractionActive = true;
    clearGameFlowInput();
    dialogueCamera?.focusWorldPoint({
      position,
      height: SQUIRTLE_DRY_GRASS_CAMERA_FOCUS_HEIGHT
    });
    squirtleDryGrassCameraFocusTimeout = windowRef.setTimeout(
      () => {
        squirtleDryGrassCameraFocusTimeout = null;
        startSquirtleDryGrassCameraOrbit(position);
      },
      LEPPA_TREE_TASK_CAMERA_FOCUS_TRANSITION_MS
    );
    return true;
  }

  function movePlayerAwayFromSquirtleForDialogue() {
    const squirtlePosition = gameSession?.actTwoSquirtle?.position;
    const playerCharacter = gameSession?.playerCharacter;
    const playerPosition = playerCharacter?.getPosition?.();

    if (!Array.isArray(squirtlePosition) || !Array.isArray(playerPosition)) {
      return false;
    }

    let deltaX = playerPosition[0] - squirtlePosition[0];
    let deltaZ = playerPosition[2] - squirtlePosition[2];
    let distance = Math.hypot(deltaX, deltaZ);

    if (distance >= SQUIRTLE_DIALOGUE_MIN_PLAYER_DISTANCE) {
      playerCharacter.faceToward?.(squirtlePosition);
      return false;
    }

    if (distance < 0.001) {
      deltaX = 0;
      deltaZ = 1;
      distance = 1;
    }

    const nextPosition = [
      squirtlePosition[0] + (deltaX / distance) * SQUIRTLE_DIALOGUE_MIN_PLAYER_DISTANCE,
      playerPosition[1],
      squirtlePosition[2] + (deltaZ / distance) * SQUIRTLE_DIALOGUE_MIN_PLAYER_DISTANCE
    ];

    playerCharacter.setPosition?.(nextPosition);
    playerCharacter.faceToward?.(squirtlePosition);
    return true;
  }

  function startSquirtleReassemblyBeforeDialogue(onComplete) {
    const squirtle = gameSession?.actTwoSquirtle;

    if (!squirtle || squirtle.recovered || squirtle.assemblyState === "assembled") {
      return false;
    }

    revealDismantledSquirtle();
    focusActTwoSquirtle({ defer: true });

    if (squirtle.reassembly?.active) {
      return true;
    }

    scriptedInteractionActive = true;
    clearGameFlowInput();
    squirtle.assemblyState = "reassembling";
    squirtle.visible = true;
    squirtle.reassembly = {
      active: true,
      elapsed: 0,
      duration: squirtle.reassembly?.duration || 1.25,
      progress: 0,
      onComplete: () => {
        scriptedInteractionActive = false;
        squirtle.visible = true;
        squirtle.assemblyState = "assembled";
        movePlayerAwayFromSquirtleForDialogue();
        focusActTwoSquirtleConversation();
        onComplete?.();
      }
    };

    return true;
  }

  function handleChopperOnboardingLineChange(line) {
    if (line?.text === CHOPPER_BILL_CUTAWAY_START_TEXT) {
      focusBillCameo();
      return;
    }

    if (line?.text === CHOPPER_BILL_CUTAWAY_END_TEXT) {
      setBillCameoVisible(false);
      refocusChopperConversation();
      return;
    }

    if (line?.id === "notice-squirtle-sound") {
      setBillCameoVisible(false);
      revealDismantledSquirtle();
      focusActTwoSquirtle();
    }
  }

  function syncQuestPanels() {
    uiRuntime?.syncQuestFocus(storyState);
    uiRuntime?.syncHudInstructions(storyState);
    uiRuntime?.renderMissionCards(storyState, inventory, uiRuntime.getNoticeMessage());
  }

  function trackFieldTask(taskId) {
    storyState.flags.trackedTaskIds ||= [];

    if (storyState.flags.trackedTaskIds.includes(taskId)) {
      return false;
    }

    storyState.flags.trackedTaskIds.push(taskId);
    syncQuestPanels();

    if (taskId === FIELD_TASK_IDS.REVIVE_LEPPA_TREE) {
      scheduleLeppaTreeTaskCameraFocus();
    }

    return true;
  }

  function recordBulbasaurSturdyStickChallengeProgress(amount) {
    const flags = storyState.flags;

    if (
      !flags.bulbasaurStrawBedChallengeAvailable ||
      flags.strawBedRecipeUnlocked ||
      amount <= 0
    ) {
      return false;
    }

    flags.sturdySticksGatheredForChallenge = Math.min(
      10,
      (flags.sturdySticksGatheredForChallenge || 0) + amount
    );

    const completed = updateBulbasaurStrawBedChallengeCompletion(storyState);

    if (completed) {
      flags.bulbasaurStrawBedChallengeCompletionNoticePending = true;
    }

    syncQuestPanels();
    return true;
  }

  function inspectBag() {
    const shouldSelectStrawBedForBulbasaur =
      storyState.flags.strawBedCrafted &&
      !storyState.flags.strawBedPlacedInBulbasaurHabitat &&
      hasItems(inventory, { [STRAW_BED_ITEM_ID]: 1 });

    if (shouldSelectStrawBedForBulbasaur) {
      uiRuntime.bagUiRuntime.selectItem(STRAW_BED_ITEM_ID);

      if (!storyState.flags.strawBedSelectedForBulbasaur) {
        storyState.flags.strawBedSelectedForBulbasaur = true;
        uiRuntime.pushNotice("Solar Station selected.");
        syncQuestPanels();
      }
    }

    const selectableBuildingKit = resolveSelectableBuildingKit({
      storyState,
      inventory
    });

    if (selectableBuildingKit?.itemId) {
      uiRuntime.bagUiRuntime.selectItem(selectableBuildingKit.itemId);

      if (
        selectableBuildingKit.itemId === LEAF_DEN_KIT_ITEM_ID &&
        !storyState.flags.leafDenKitSelected
      ) {
        storyState.flags.leafDenKitSelected = true;
        uiRuntime.pushNotice(`${selectableBuildingKit.name} selected.`);
        syncQuestPanels();
      }
    }

    const shouldSelectDittoFlagForHouse =
      storyState.flags.dittoFlagReceived &&
      !storyState.flags.dittoFlagPlacedOnHouse &&
      hasItems(inventory, { [DITTO_FLAG_ITEM_ID]: 1 });

    if (shouldSelectDittoFlagForHouse) {
      uiRuntime.bagUiRuntime.selectItem(DITTO_FLAG_ITEM_ID);

      if (!storyState.flags.dittoFlagSelectedForHouse) {
        storyState.flags.dittoFlagSelectedForHouse = true;
        uiRuntime.pushNotice(`${SANDBOTS_ITEM_NAMES.colonyFlag} selected.`);
        syncQuestPanels();
      }
    }

    uiRuntime.inspectBag();
  }

  function shouldBagButtonInteractWithNearbyCharacter() {
    if (gameSession?.strawBedPlacementPreview?.active) {
      return false;
    }

    if (
      !gameSession?.playerCharacter ||
      !sceneFlowRuntime?.sceneDirector?.is?.(GAME_FLOW.GAMEPLAY) ||
      uiRuntime?.pokedexUiState?.open ||
      builderPanelOpen ||
      gamePaused
    ) {
      return false;
    }

    if (
      storyState.flags.leafDenFurnitureRequestAvailable &&
      storyState.flags.leafDenInteriorEntered &&
      !storyState.flags.leafDenFurnitureRequestComplete &&
      Number(storyState.flags.leafDenFurniturePlacedCount || 0) < 3
    ) {
      return false;
    }

    const playerPosition = gameSession.playerCharacter.getPosition();
    if (isPlayerNearRotatableWorkbenchPlacement(playerPosition)) {
      return false;
    }

    const nearbyInteractable = findNearbyInteractable(
      playerPosition,
      gameSession.npcActors,
      gameSession.interactables,
      storyState,
      gameSession.groundGrassPatches,
      gameSession.logChair,
      gameSession.leafDen,
      gameSession.timburrEncounter,
      gameSession.charmanderEncounter,
      gameSession.leppaTree,
      gameSession.bulbasaurEncounter
    );

    const target = nearbyInteractable?.target;
    if (!target) {
      return false;
    }

    if (target.action === "destroyInstantiatedObject") {
      return false;
    }

    if (target.kind === "logChairSeat") {
      armLogChairSaveRequest();
      return true;
    }

    const characterInteractionKinds = new Set([
      "grassEncounter",
      "charmanderGrassEncounter",
      "timburrGrassEncounter",
      "bulbasaurMission",
      "bulbasaurRequestComplete",
      "bulbasaurStrawBedRecipe",
      "bulbasaurStrawBedComplete",
      "leppaBerryGift",
      "leppaBerryTree",
      "leppaTreeLeafageOptions",
      "pokemonCompanion",
      "timburrLeafDenFurnitureComplete",
      "charmanderCelebrationRequest"
    ]);

    if (
      target.id === "squirtle" ||
      target.kind === "station" ||
      target.kind === "site" ||
      target.kind === "leafDenConstruction" ||
      target.kind === "leafDenEntrance" ||
      characterInteractionKinds.has(target.kind)
    ) {
      return true;
    }

    if (target.kind === "npc" && target.id !== "tangrowth") {
      return true;
    }

    if (target.id !== "tangrowth") {
      return false;
    }

    const activeQuest = getActiveQuest(storyState);
    const activeSystemQuest = questSystem?.getActiveQuest?.();

    return (
      activeSystemQuest?.id === "chopper-first-habitat-report" ||
      activeQuest?.id === "meetTangrowth" ||
      (
        storyState.flags.tallGrassDiscovered &&
        !storyState.flags.tangrowthTallGrassCommentSeen
      ) ||
      (
        storyState.flags.tangrowthLogChairRequestAvailable &&
        !storyState.flags.logChairReceived
      ) ||
      (
        storyState.flags.tangrowthHouseTalkAvailable &&
        !storyState.flags.tangrowthHouseTalkComplete
      ) ||
      (
        storyState.flags.charmanderCelebrationSuggested &&
        !storyState.flags.charmanderCelebrationComplete
      )
    );
  }

  function shouldGamepadButtonHarvestNearbyFieldAction({ source = null } = {}) {
    if (
      !gameSession?.playerCharacter ||
      !sceneFlowRuntime?.sceneDirector?.is?.(GAME_FLOW.GAMEPLAY) ||
      uiRuntime?.pokedexUiState?.open ||
      uiRuntime?.skillLearnOverlay?.isActive?.() ||
      scriptedInteractionActive ||
      builderPanelOpen ||
      gamePaused
    ) {
      return false;
    }

    if (
      source === "gamepadBag" &&
      (
        gameSession?.greenhousePlacementPreview?.active ||
        gameSession?.campfirePlacementPreview?.active ||
        (
          storyState?.flags?.greenhouseCrafted &&
          hasItems(inventory, { [GREENHOUSE_ITEM_ID]: 1 })
        ) ||
        (
          storyState?.flags?.campfireCrafted &&
          !storyState.flags.campfireSpatOut &&
          hasItems(inventory, { [CAMPFIRE_ITEM_ID]: 1 })
        )
      )
    ) {
      return true;
    }

    if (shouldBagButtonInteractWithNearbyCharacter()) {
      return false;
    }

    const playerPosition = gameSession.playerCharacter.getPosition();
    if (isPlayerNearRotatableWorkbenchPlacement(playerPosition)) {
      return true;
    }

    if (source === "gamepadBag") {
      const nearbyDestroyableObject = findNearbyDestroyableInstantiatedObject(
        playerPosition,
        gameSession.groundGrassPatches,
        storyState,
        gameSession.groundFlowerPatches,
        { includeRestoredGrass: true }
      );

      if (nearbyDestroyableObject?.target) {
        return true;
      }

      const nearbyHarvestTarget = findNearbyHarvestTarget(
        playerPosition,
        gameSession.palmModel,
        gameSession.palmInstances,
        gameSession.resourceNodes,
        storyState
      );

      if (nearbyHarvestTarget?.palm || nearbyHarvestTarget?.resourceNode) {
        return true;
      }
    }

    const activeFieldMoveId = getActiveFieldMoveId();
    const activeHarvestTarget = findNearbyActionTarget({
      playerPosition,
      palmModel: gameSession.palmModel,
      palmInstances: gameSession.palmInstances,
      resourceNodes: gameSession.resourceNodes,
      leppaTree: gameSession.leppaTree,
      leafDen: gameSession.leafDen,
      storyState,
      inventory,
      groundDeadInstances: gameSession.groundDeadInstances,
      iceGroundInstances: gameSession.iceGroundInstances,
      groundPurifiedInstances: gameSession.groundPurifiedInstances,
      groundGrassPatches: gameSession.groundGrassPatches,
      groundFlowerPatches: gameSession.groundFlowerPatches,
      canPurifyGround: playerSkills.waterGun && activeFieldMoveId === "waterGun",
      canUseLeafage: playerSkills.leafage && activeFieldMoveId === "leafage",
      canUseFire: playerSkills.fire && activeFieldMoveId === "fire"
    });

    if (source === "gamepadBag" && activeHarvestTarget?.campfirePlacement) {
      return true;
    }

    return shouldGamepadSourceHarvestTarget({
      source,
      activeHarvestTarget
    });
  }

  function buildChopperApproachTarget(playerPosition, chopperPosition) {
    const toPlayer = [
      playerPosition[0] - chopperPosition[0],
      playerPosition[2] - chopperPosition[2]
    ];
    const distance = Math.hypot(toPlayer[0], toPlayer[1]);
    const direction = distance > 0.001 ?
      [toPlayer[0] / distance, toPlayer[1] / distance] :
      [0, 1];

    return [
      playerPosition[0] - direction[0] * CHOPPER_SECOND_TALK_STOP_DISTANCE,
      playerPosition[1],
      playerPosition[2] - direction[1] * CHOPPER_SECOND_TALK_STOP_DISTANCE
    ];
  }

  function getRestoredGrassHabitatPosition(restoredGrassHabitat, fallbackPosition) {
    const patches = Array.isArray(restoredGrassHabitat?.patches) ?
      restoredGrassHabitat.patches.filter((patch) => Array.isArray(patch?.position)) :
      [];

    if (!patches.length) {
      return fallbackPosition;
    }

    const center = patches.reduce((sum, patch) => [
      sum[0] + patch.position[0],
      sum[1] + patch.position[1],
      sum[2] + patch.position[2]
    ], [0, 0, 0]);

    return [
      center[0] / patches.length,
      center[1] / patches.length,
      center[2] / patches.length
    ];
  }

  function playTallGrassMemorySequence({
    groundCell = null,
    restoredGrassHabitat = null,
    newlyDiscoveredHabitats = []
  } = {}) {
    if (storyBeats?.hasCompleted(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_MEMORY)) {
      storyBeats.complete(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_MEMORY, {
        discoveredHabitats: newlyDiscoveredHabitats
      });
      return;
    }

    const chopperActor = gameSession?.chopperNpcActor;
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const chopperPosition = getChopperNpcPosition() || playerPosition;

    if (!playerPosition || !chopperPosition) {
      storyBeats?.complete(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_MEMORY, {
        discoveredHabitats: newlyDiscoveredHabitats
      });
      return;
    }

    const restoredHabitatPosition = getRestoredGrassHabitatPosition(
      restoredGrassHabitat,
      groundCell?.offset || playerPosition
    );

    const openMemoryConversation = () => {
      const latestPlayerPosition = gameSession?.playerCharacter?.getPosition?.() || playerPosition;
      const latestChopperPosition = getChopperNpcPosition() || chopperPosition;
      chopperActor?.npcActor?.character?.faceToward?.(latestPlayerPosition);
      if (chopperActor?.npcActor) {
        chopperActor.npcActor.faceYaw = getYawToward(latestChopperPosition, latestPlayerPosition);
      }
      dialogueCamera?.focusNpcConversation({
        targetId: "tangrowth",
        playerPosition: latestPlayerPosition,
        npcActors: gameSession?.npcActors || [],
        interactables: gameSession?.interactables || []
      });
      storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_MEMORY, {
        context: {
          discoveredHabitats: newlyDiscoveredHabitats
        },
        onBeforeCompleteEffects: () => {
          scriptedInteractionActive = false;
          dialogueCamera?.restoreGameplayCamera();
        }
      });
    };

    storyBeats?.markCompleted(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_MEMORY);
    scriptedInteractionActive = true;
    clearGameFlowInput();
    dialogueCamera?.focusWorldPoint({
      position: restoredHabitatPosition,
      height: 1.55
    });

    const targetPosition = buildChopperApproachTarget(restoredHabitatPosition, chopperPosition);
    const flightStarted = startChopperNpcFlight(chopperActor, {
      targetPosition,
      duration: TALL_GRASS_MEMORY_APPROACH_DURATION,
      onComplete: openMemoryConversation
    });

    if (!flightStarted) {
      openMemoryConversation();
    }
  }

  function startRuinedPokemonCenterGuide() {
    if (
      storyState.flags.pokemonCenterGuideFlightStarted ||
      storyState.flags.challengesUnlocked
    ) {
      syncQuestPanels();
      return;
    }

    storyState.flags.pokemonCenterGuideFlightStarted = true;
    uiRuntime?.pushNotice(
      `Follow ${SANDBOTS_BOT_NAMES.overseer} to the damaged ${SANDBOTS_WORLD_TERMS.terminal}.`,
      4.8
    );

    const chopperActor = gameSession?.chopperNpcActor;
    const flightStarted = startChopperNpcFlight(chopperActor, {
      targetPosition: RUINED_POKEMON_CENTER_GUIDE_POSITION,
      duration: POKEMON_CENTER_GUIDE_FLIGHT_DURATION,
      onComplete() {
        const chopperPosition = getChopperNpcPosition();

        if (!chopperPosition || !chopperActor?.npcActor) {
          return;
        }

        chopperActor.npcActor.faceYaw = getYawToward(
          chopperPosition,
          RUINED_POKEMON_CENTER_POSITION
        );
      }
    });

    if (!flightStarted) {
      storyState.flags.pokemonCenterGuideFlightStarted = false;
    }

    syncQuestPanels();
  }

  function getLeafDenConstructionNow() {
    return windowRef.Date?.now?.() ?? Date.now();
  }

  function getDistance2d(fromPosition, toPosition) {
    if (!Array.isArray(fromPosition) || !Array.isArray(toPosition)) {
      return Infinity;
    }

    return Math.hypot(
      fromPosition[0] - toPosition[0],
      fromPosition[2] - toPosition[2]
    );
  }

  function getPlacementEdgeDistance2d(playerPosition, placement, fallbackSize = [1, 1], sizeOverride = null) {
    if (!Array.isArray(playerPosition) || !Array.isArray(placement?.position)) {
      return Infinity;
    }

    const placementSizeIsValid =
      Array.isArray(placement.size) &&
      Number(placement.size[0]) > 0 &&
      Number(placement.size[1]) > 0;
    const size = Array.isArray(sizeOverride) ?
      sizeOverride :
      placementSizeIsValid ?
        placement.size :
        fallbackSize;
    const halfX = Math.max(0.01, Number(size?.[0]) || 1) * 0.5;
    const halfZ = Math.max(0.01, Number(size?.[1]) || 1) * 0.5;
    const dx = Math.max(0, Math.abs(playerPosition[0] - placement.position[0]) - halfX);
    const dz = Math.max(0, Math.abs(playerPosition[2] - placement.position[2]) - halfZ);
    return Math.hypot(dx, dz);
  }

  function getWorkbenchRotationTriggerDistance() {
    const cellSize = Number(gameSession?.buildGridConfig?.cellSize);
    const tileMargin = Number.isFinite(cellSize) && cellSize > 0 ?
      cellSize :
      WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN;
    return WORKBENCH_OBJECT_ROTATE_DISTANCE + tileMargin;
  }

  function isPlayerNearRotatableWorkbenchPlacement(playerPosition) {
    if (!Array.isArray(playerPosition)) {
      return false;
    }

    const flags = storyState.flags || {};
    const candidates = [];

    if (gameSession?.strawBed?.position && flags.strawBedPlacedInBulbasaurHabitat) {
      candidates.push({
        placement: gameSession.strawBed,
        fallbackSize: SOLAR_STATION_ROTATION_FOOTPRINT
      });
    }

    if (gameSession?.campfire?.position && flags.campfireSpatOut) {
      candidates.push({
        placement: gameSession.campfire,
        fallbackSize: TRAIN_HOUSE_ROTATION_FOOTPRINT
      });
    }

    if (gameSession?.leafDen?.position && (flags.leafDenKitPlaced || flags.leafDenBuilt)) {
      const houseSize = flags.leafDenBuilt ?
        HOUSE_BUILT_ROTATION_FOOTPRINT :
        HOUSE_KIT_ROTATION_FOOTPRINT;
      candidates.push({
        placement: gameSession.leafDen,
        fallbackSize: houseSize,
        sizeOverride: houseSize
      });
    }

    for (const playerHouse of gameSession?.playerHouses || []) {
      if (!Array.isArray(playerHouse?.position)) {
        continue;
      }

      candidates.push({
        placement: playerHouse,
        fallbackSize: HOUSE_BUILT_ROTATION_FOOTPRINT,
        sizeOverride: HOUSE_BUILT_ROTATION_FOOTPRINT
      });
    }

    return candidates.some((candidate) => {
      return getPlacementEdgeDistance2d(
        playerPosition,
        candidate.placement,
        candidate.fallbackSize,
        candidate.sizeOverride
      ) <= getWorkbenchRotationTriggerDistance();
    });
  }

  function getLeafDenHelperStatus() {
    const flags = storyState.flags;
    const followingCreatureIds = [
      flags.charmanderFollowing && "charmander",
      flags.timburrFollowing && "timburr"
    ].filter(Boolean);
    const leafDenPosition = gameSession?.leafDen?.position;
    const nearbyCreatureIds = [];
    const leafDenHelperNearbyDistance = 4.5;

    for (const [creatureId, encounter, revealed] of [
      ["charmander", gameSession?.charmanderEncounter, flags.charmanderRevealed],
      ["timburr", gameSession?.timburrEncounter, flags.timburrRevealed]
    ]) {
      if (revealed) {
        nearbyCreatureIds.push(creatureId);
      }

      if (!revealed || !leafDenPosition || !Array.isArray(encounter?.position)) {
        continue;
      }

      if (getDistance2d(encounter.position, leafDenPosition) <= leafDenHelperNearbyDistance) {
        nearbyCreatureIds.push(creatureId);
      }
    }

    const leafDenKit = listBuildingKits().find((kit) => kit.itemId === LEAF_DEN_KIT_ITEM_ID);
    return validateCreatureSpecialtiesReady(leafDenKit?.requiredSpecialties || [], {
      followingCreatureIds,
      nearbyCreatureIds
    });
  }

  function formatMissingLeafDenSpecialtiesNotice(helperStatus) {
    const missing = helperStatus.missingSpecialties
      .map(({ specialty }) => specialty)
      .join(", ");

    return missing ?
      `Missing helper specialties: ${missing}. Call or bring matching bots.` :
      "Call or bring matching bots before building the House.";
  }

  function isCharmanderNearTangrowthForCelebration() {
    const charmanderPosition = gameSession?.charmanderEncounter?.position;
    const tangrowthPosition = getChopperNpcPosition();

    return (
      storyState.flags.charmanderRevealed &&
      storyState.flags.charmanderFollowing &&
      gameSession?.charmanderEncounter?.visible &&
      getDistance2d(charmanderPosition, tangrowthPosition) <= 3.2
    );
  }

  function completeLeafDenConstructionIfReady({ playDialogue = true } = {}) {
    if (
      !storyState.flags.leafDenConstructionStarted ||
      storyState.flags.leafDenBuilt
    ) {
      return false;
    }

    const completesAt = Number(storyState.flags.leafDenConstructionCompletesAt || 0);
    if (!completesAt || getLeafDenConstructionNow() < completesAt) {
      return false;
    }

    const finalizeLeafDenConstruction = () => {
      if (gameSession?.leafDen) {
        gameSession.leafDen.constructionStatus = "complete";
        attachPlayerPlacementSpawnEffect(gameSession.leafDen);
      }
      syncQuestPanels();
    };

    if (playDialogue) {
      storyBeats.playDialogue(STORY_BEAT_IDS.LEAF_DEN_COMPLETE, {
        onComplete: finalizeLeafDenConstruction
      });
    } else {
      storyBeats.complete(STORY_BEAT_IDS.LEAF_DEN_COMPLETE);
      finalizeLeafDenConstruction();
    }

    return true;
  }

  function buildLeafDenFurniturePlacement(index) {
    const anchor = gameSession?.leafDen?.position || [0, 0.02, 0];
    const offsets = [
      [-0.72, 0, 0.62],
      [0.58, 0, 0.58],
      [0.04, 0, -0.52]
    ];
    const offset = offsets[index % offsets.length];

    return {
      id: `leaf-den-furniture-${index}`,
      kind: index === 0 ? "logChair" : index === 1 ? "strawBed" : "campfire",
      position: [
        anchor[0] + offset[0],
        0.025,
        anchor[2] + offset[2]
      ],
      size: index === 1 ? [1.24, 0.86] : [1.05, 0.92],
      uvRect: [0, 0, 1, 1]
    };
  }

  function buildDittoFlagPlacement() {
    const anchor = gameSession?.leafDen?.position || [0, 0.02, 0];

    return {
      id: "ditto-flag-0",
      position: [
        anchor[0] + 0.9,
        0.04,
        anchor[2] - 0.42
      ],
      size: [0.68, 1.18],
      uvRect: [0, 0, 1, 1]
    };
  }

  function shouldPlayChopperSecondTalkApproach({ targetId, dialogueId }) {
    const firstMovementComplete = questSystem.getQuest("learn-to-move")?.status === "completed";

    return targetId === "tangrowth" &&
      dialogueId === "onboarding" &&
      firstMovementComplete &&
      !storyState.flags.chopperSecondTalkApproachSeen &&
      Boolean(gameSession?.chopperNpcActor) &&
      Boolean(gameSession?.playerCharacter);
  }

  function requestAutosave(type, payload = {}, { silent = false } = {}) {
    if (!autosaveRuntime) {
      return false;
    }

    autosaveIndicatorSuppressed = Boolean(silent);
    try {
      return autosaveRuntime.trigger(type, payload);
    } finally {
      autosaveIndicatorSuppressed = false;
    }
  }

  function armLogChairSaveRequest() {
    logChairSaveRequestExpiresAt = getRuntimeNow() + LOG_CHAIR_SAVE_REQUEST_GRACE_MS;
  }

  function consumeLogChairSaveRequest() {
    if (getRuntimeNow() > logChairSaveRequestExpiresAt) {
      logChairSaveRequestExpiresAt = 0;
      return false;
    }

    logChairSaveRequestExpiresAt = 0;
    return true;
  }

  function isLogChairSaveBlocked() {
    return Boolean(
      !gameSession?.playerCharacter ||
      !sceneFlowRuntime?.sceneDirector?.is?.(GAME_FLOW.GAMEPLAY) ||
      uiRuntime?.pokedexUiState?.open ||
      uiRuntime?.gameplayDialogue?.isActive?.() ||
      settingsMenu?.isOpen?.() ||
      gamePaused ||
      builderPanelOpen ||
      scriptedInteractionActive
    );
  }

  function focusBulbasaurWorkbenchGuideIntro() {
    const playerPosition = gameSession?.playerCharacter?.getPosition?.();
    const targetPosition =
      gameSession?.bulbasaurEncounter?.position ||
      gameSession?.bulbasaurEncounter?.repairPosition ||
      null;

    if (!playerPosition || !targetPosition) {
      return false;
    }

    dialogueCamera?.focusNpcConversation({
      targetId: "bulbasaur",
      playerPosition,
      npcActors: gameSession?.npcActors || [],
      interactables: gameSession?.interactables || [],
      targetPosition
    });
    return true;
  }

  function hasCharmanderProgressStartedBeforeTrainHouse() {
    return Boolean(
      !storyState.flags.campfireSpatOut &&
      (
        storyState.flags.charmanderRustlingGrassCellId ||
        storyState.flags.charmanderRevealed ||
        storyState.flags.charmanderFollowing
      )
    );
  }

  function shouldRecoverBulbasaurWorkbenchGuide() {
    return Boolean(
      !storyState.flags.workbenchDiyRecipesReceived &&
      !storyState.flags.bulbasaurWorkbenchGuideAvailable &&
      (
        storyState.flags.logChairSat ||
        hasCharmanderProgressStartedBeforeTrainHouse()
      )
    );
  }

  function playBulbasaurWorkbenchGuideIntro() {
    if (storyState.flags.bulbasaurWorkbenchGuideAvailable) {
      return false;
    }

    if (storyBeats?.hasCompleted?.(STORY_BEAT_IDS.BULBASAUR_WORKBENCH_GUIDE_INTRO)) {
      storyBeats.complete?.(STORY_BEAT_IDS.BULBASAUR_WORKBENCH_GUIDE_INTRO);
      syncQuestPanels();
      requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
        beatId: STORY_BEAT_IDS.BULBASAUR_WORKBENCH_GUIDE_INTRO
      }, { silent: true });
      return true;
    }

    scriptedInteractionActive = true;
    clearGameFlowInput();
    focusBulbasaurWorkbenchGuideIntro();
    const opened = storyBeats?.playDialogue?.(STORY_BEAT_IDS.BULBASAUR_WORKBENCH_GUIDE_INTRO, {
      onBeforeCompleteEffects: () => {
        scriptedInteractionActive = false;
        dialogueCamera?.restoreGameplayCamera();
      },
      onComplete: () => {
        syncQuestPanels();
        requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
          beatId: STORY_BEAT_IDS.BULBASAUR_WORKBENCH_GUIDE_INTRO
        });
      }
    }) || false;

    if (!opened) {
      scriptedInteractionActive = false;
    }

    return opened;
  }

  const questSystem = createQuestSystem({
    quests: SMALL_ISLAND_QUESTS,
    storage: ENABLE_QUEST_PERSISTENCE ? windowRef.localStorage : null,
    initialState: (manualSavePoint || bootManualSavePoint)?.questState || null,
    transitionDelayMs: 3000,
    onChange({ reason, payload, activeQuest }) {
      uiRuntime?.syncQuestFocus(storyState);
      uiRuntime?.syncHudInstructions(storyState);
      uiRuntime?.renderMissionCards(storyState, inventory, uiRuntime.getNoticeMessage());

      if (reason === "quest-progress-completed" && payload?.completedQuestIds?.length) {
        showQuestCompletionPop(payload.completedQuestIds);
        uiRuntime?.pushNotice(
          buildQuestTransitionNotice(payload.completedQuestIds, activeQuest),
          5.2
        );
        autoStartBulbasaurRepairBoxIntroFromCompletedQuests(payload.completedQuestIds);
        requestAutosave(AUTOSAVE_EVENT.TASK_COMPLETED, {
          completedQuestIds: payload.completedQuestIds,
          activeQuestId: activeQuest?.id || null
        });

      }
    }
  });
  warnInvalidErrandQuestDesign({
    quests: SMALL_ISLAND_QUESTS,
    enabled: isDev,
    consoleRef: windowRef.console || globalThis.console
  });

  function reconcileQuestProgressFromUnlockedSkills() {
    if (!playerSkills.waterGun) {
      return;
    }

    questSystem.emit({
      type: QUEST_EVENT.UNLOCK,
      targetId: "waterGun"
    });
  }

  function setActiveManualSaveSlot(slotId) {
    activeManualSaveSlotId = normalizeManualSaveSlotId(slotId);
    writeActiveManualSaveSlotId(windowRef, activeManualSaveSlotId);
    return activeManualSaveSlotId;
  }

  function applyManualSavePointToSession(savePoint, session = gameSession) {
    if (!savePoint || !session) {
      return false;
    }

    setActiveFieldMoveStateFromId(
      applyManualSaveState(savePoint, {
        storyState,
        inventory,
        playerSkills,
        playerMemory
      })
    );
    reconcileQuestProgressFromUnlockedSkills();
    restoreSavedSessionState(session, savePoint);
    restoreSavedWorldState(session, savePoint);
    if (session.strawBed) {
      prepareStrawBedSolarStationPlacement(session.strawBed);
      syncStrawBedSolarStationModel(session.strawBed);
    }
    startRandomSavedGameSoundtrack();
    syncSkillsUi();
    uiRuntime.syncInventoryUi(inventory);
    syncQuestPanels();
    uiRuntime.syncHudMeta(
      storyState,
      inventory,
      session.playerCharacter?.getPosition?.() || [0, 0, 0]
    );
    return true;
  }

  function handleStartGameSelection(selection = {}) {
    const action = selection?.action || START_SLOT_ACTION.NEW_GAME;
    const selectedSlotId = setActiveManualSaveSlot(selection?.slotId || activeManualSaveSlotId);

    if (action === START_SLOT_ACTION.CONTINUE) {
      const selectedSavePoint =
        readManualSaveSlot(windowRef, selectedSlotId) ||
        (selectedSlotId === bootManualSaveSlot.slotId ? bootManualSavePoint : null);

      if (!selectedSavePoint) {
        return;
      }

      manualSavePoint = selectedSavePoint;
      applyManualSavePointToSession(manualSavePoint);
      return;
    }

    if (action === START_SLOT_ACTION.NEW_GAME) {
      manualSavePoint = null;
      removeManualSaveSlot(windowRef, selectedSlotId);
      if (shouldDeferManualSavePoint) {
        questSystem.reset();
      }
    }
  }

  function getQuestObjectiveProgress(quest = null, type = "", targetId = "") {
    const objective = quest?.objectives?.find((candidate) => (
      candidate.type === type &&
      candidate.targetId === targetId
    ));

    return Number(objective?.current || 0);
  }

  function pushErrandQuestProgressFeedback(quest = null, progress = {}) {
    const feedback = getErrandQuestProgressFeedback(quest, progress);
    for (const message of feedback) {
      uiRuntime?.pushNotice?.(message, 5.2);
    }
    unlockErrandQuestPokedeskReward({
      quest,
      completed: progress.completed,
      pokedexRuntime: uiRuntime?.pokedexRuntime
    });
    return feedback;
  }

  function writeManualSavePoint(meta = {}) {
    try {
      const playerPosition = gameSession?.playerCharacter?.getPosition?.() || null;
      const payload = createManualSavePointDto({
        slotId: activeManualSaveSlotId,
        saveKind: meta.saveKind || "manual",
        savePointId: meta.savePointId || null,
        autosaveEvent: meta.autosaveEvent || null,
        savedAt: new Date().toISOString(),
        storyState: {
          questIndex: storyState.questIndex,
          flags: { ...storyState.flags }
        },
        inventory: { ...inventory },
        playerProfile: clonePlayerProfileState(playerMemory),
        playerSkills: { ...playerSkills },
        ...mapActiveFieldMoveStateToSaveGameDto(activeFieldMoveState),
        settings: Object.fromEntries(
          Object.entries(settingsState).map(([groupId, groupState]) => [
            groupId,
            { ...groupState }
          ])
        ),
        questState: questSystem.getState(),
        playerPosition: Array.isArray(playerPosition) ? [...playerPosition] : null,
        worldState: cloneSessionWorldState(gameSession),
        companions: cloneSessionCompanionState(gameSession),
        placeables: cloneSessionPlaceables(gameSession),
        gridPlacement: cloneSessionGridPlacement(gameSession),
        freeBlockBuild: cloneSessionFreeBlockBuild(gameSession),
        logChair: gameSession?.logChair ?
          {
            ...gameSession.logChair,
            position: [...gameSession.logChair.position],
            size: [...gameSession.logChair.size],
            uvRect: [...gameSession.logChair.uvRect]
          } :
          null
      });

      windowRef.localStorage?.setItem(
        getManualSaveSlotStorageKey(activeManualSaveSlotId),
        JSON.stringify(payload)
      );
      windowRef.localStorage?.setItem(
        MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY,
        activeManualSaveSlotId
      );
      if (activeManualSaveSlotId === DEFAULT_MANUAL_SAVE_SLOT_ID) {
        windowRef.localStorage?.setItem(MANUAL_SAVE_STORAGE_KEY, JSON.stringify(payload));
      }
      return true;
    } catch {
      return false;
    }
  }
  const dialogueSystem = createDialogueSystem({
    dialogues: SMALL_ISLAND_DIALOGUES,
    questSystem
  });
  const habitatSystem = createHabitatSystem({
    habitats: SMALL_ISLAND_HABITATS,
    storyState,
    onDiscover({ habitat, discoveredHabitats, context }) {
      uiRuntime?.setNearbyHabitats(discoveredHabitats.map((entry) => entry.label));
      const discoveryEvent = context?.event;
      const isRestoredTallGrassHabitat =
        discoveryEvent?.type === HABITAT_EVENT.RESTORE_HABITAT &&
        discoveryEvent?.targetId === "tall-grass";
      const hasSpecificRestoreNotice =
        discoveryEvent?.type === HABITAT_EVENT.RESTORE_HABITAT &&
        (discoveryEvent.targetId === "tall-grass" ||
          discoveryEvent.targetId === "pretty-flower-bed" ||
          discoveryEvent.targetId === "boulder-shaded-tall-grass");

      if (discoveryEvent?.type === HABITAT_EVENT.RESTORE_HABITAT) {
        storyState.flags.makingHabitatsComplete = true;
        syncQuestPanels();
      }

      if (!hasSpecificRestoreNotice) {
        uiRuntime?.pushNotice(`Habitat discovered: ${habitat.label}.`);
      }

      if (habitat.pokedexEntryId && !isRestoredTallGrassHabitat) {
        storyBeats?.openPokedexEntry(habitat.pokedexEntryId);
      }
    }
  });

  function setStatusFallback(message, isError = false) {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.error = isError ? "true" : "false";
  }

  function reportStatus(message, isError = false) {
    if (uiRuntime?.setStatus) {
      uiRuntime.setStatus(message, isError);
      return;
    }

    setStatusFallback(message, isError);
  }

  function clearGameFlowInput() {
    pressedKeys.clear();
    engine.cameraTurnKeys.clear();
    harvestRequested = false;
    interactRequested = false;
    followerCallRequested = false;
  }

  function setGamePaused(paused) {
    gamePaused = Boolean(paused);

    if (dom.pauseOverlay) {
      dom.pauseOverlay.hidden = !gamePaused;
      dom.pauseOverlay.dataset.active = gamePaused ? "true" : "false";
    }

    if (gamePaused) {
      clearGameFlowInput();
    }
  }

  function toggleGamePaused() {
    if (!sceneFlowRuntime?.sceneDirector?.is?.(sceneFlowRuntime.gameFlowValues.GAMEPLAY)) {
      return;
    }

    setGamePaused(!gamePaused);
  }

  function isBagDetailItemId(itemId) {
    return Boolean(ITEM_DEFS[itemId]?.bagDetailsEligible);
  }

  function getActiveFieldMoveId() {
    return getActiveFieldMoveAbilityId(activeFieldMoveState);
  }

  function setActiveFieldMoveStateFromId(skillId) {
    activeFieldMoveState = mapSaveGameDtoToActiveFieldMoveState({
      activeFieldMoveId: skillId
    });
  }

  function getUnlockedFieldMoveIds() {
    return ACTIVE_FIELD_MOVE_ORDER.filter((skillId) => playerSkills[skillId]);
  }

  function syncSkillsUi() {
    uiRuntime?.syncSkillsUi(playerSkills, getActiveFieldMoveId());
  }

  function getCarouselRelativeIndex(index, selectedIndex, total) {
    if (total <= 1) {
      return 0;
    }

    let relativeIndex = index - selectedIndex;
    const halfTotal = total * 0.5;

    if (relativeIndex > halfTotal) {
      relativeIndex -= total;
    } else if (relativeIndex < -halfTotal) {
      relativeIndex += total;
    }

    return relativeIndex;
  }

  function getFieldMoveCarouselCardState(relativeIndex) {
    const clampedIndex = Math.max(-2, Math.min(2, relativeIndex));
    const distance = Math.min(2, Math.abs(clampedIndex));
    const translateX = clampedIndex * (FIELD_MOVE_CAROUSEL_CARD_SIZE + FIELD_MOVE_CAROUSEL_CARD_GAP);
    const translateZ = -distance * 56;
    const rotateY = clampedIndex * -34;
    const scale = 1 - distance * 0.12;

    return {
      opacity: distance === 0 ? 1 : 0.5,
      transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`
    };
  }

  function buildFieldMoveSwitchPromptHtml(skillId, previousSkillId = null) {
    const skill = PLAYER_SKILL_DEFS[skillId];
    const presentation = FIELD_MOVE_SWITCH_PROMPT_PRESENTATION[skillId];
    const unlockedFieldMoveIds = getUnlockedFieldMoveIds();

    if (!skill || !presentation || unlockedFieldMoveIds.length === 0) {
      return "";
    }

    const selectedIndex = Math.max(0, unlockedFieldMoveIds.indexOf(skillId));
    const previousIndex = Math.max(
      0,
      unlockedFieldMoveIds.indexOf(previousSkillId || skillId)
    );
    const cardHtml = unlockedFieldMoveIds.map((moveId, index) => {
      const cardSkill = PLAYER_SKILL_DEFS[moveId];
      const cardPresentation = FIELD_MOVE_SWITCH_PROMPT_PRESENTATION[moveId];

      if (!cardSkill || !cardPresentation) {
        return "";
      }

      const fromState = getFieldMoveCarouselCardState(
        getCarouselRelativeIndex(index, previousIndex, unlockedFieldMoveIds.length)
      );
      const toRelativeIndex = getCarouselRelativeIndex(
        index,
        selectedIndex,
        unlockedFieldMoveIds.length
      );
      const toState = getFieldMoveCarouselCardState(toRelativeIndex);
      const isSelected = index === selectedIndex;
      const companionId = escapeHtml(cardPresentation.companionId);
      const thumbnailUrl = escapeHtml(cardPresentation.thumbnailUrl);
      const selectedOverlayUrl = escapeHtml(FIELD_MOVE_CAROUSEL_SELECTED_OVERLAY_URL);
      const zIndex = String(20 - Math.min(2, Math.abs(toRelativeIndex)) * 3);

      return `
        <span
          class="field-move-carousel__card"
          data-field-move-carousel-card="true"
          data-companion-id="${companionId}"
          data-selected="${isSelected ? "true" : "false"}"
          style="--field-move-card-from:${fromState.transform};--field-move-card-to:${toState.transform};--field-move-card-from-opacity:${fromState.opacity.toFixed(2)};--field-move-card-to-opacity:${toState.opacity.toFixed(2)};z-index:${zIndex};"
        >
          <img
            src="${thumbnailUrl}"
            alt=""
            loading="eager"
            decoding="async"
            style="display:block;width:100%;height:100%;object-fit:cover;border:0;background:transparent;image-rendering:pixelated;"
          >
          ${isSelected ? `
            <img
              class="field-move-carousel__selected-overlay"
              src="${selectedOverlayUrl}"
              alt=""
              loading="eager"
              decoding="async"
              style="position:absolute;inset:-10px;width:calc(100% + 20px);height:calc(100% + 20px);object-fit:fill;pointer-events:none;image-rendering:pixelated;transform-origin:center center;animation:fieldMoveCarouselSelectedPulse 520ms cubic-bezier(.2,.9,.24,1) both;"
            >
          ` : ""}
        </span>
      `;
    }).join("");

    return `
      <style>
        .field-move-carousel__card {
          position: absolute;
          left: 50%;
          top: 50%;
          display: grid;
          width: ${FIELD_MOVE_CAROUSEL_CARD_SIZE}px;
          height: ${FIELD_MOVE_CAROUSEL_CARD_SIZE}px;
          transform: var(--field-move-card-to);
          transform-origin: center center;
          transform-style: preserve-3d;
          opacity: var(--field-move-card-to-opacity);
          image-rendering: pixelated;
          animation: fieldMoveCarouselCardIn 360ms cubic-bezier(.2,.9,.25,1) both;
        }
        @keyframes fieldMoveCarouselCardIn {
          from {
            opacity: var(--field-move-card-from-opacity);
            transform: var(--field-move-card-from);
          }
          to {
            opacity: var(--field-move-card-to-opacity);
            transform: var(--field-move-card-to);
          }
        }
        @keyframes fieldMoveCarouselSelectedPulse {
          0% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.11);
          }
          100% {
            transform: scale(1);
          }
        }
      </style>
      <span
        data-field-move-switch-card="true"
        data-selected-move-id="${escapeHtml(skillId)}"
        style="display:grid;width:420px;height:248px;place-items:center;color:#fff;font-family:var(--game-ui-font, monospace);text-align:left;text-transform:none;perspective:820px;transform-style:preserve-3d;"
      >
        <span style="position:relative;width:100%;height:214px;transform-style:preserve-3d;">
          ${cardHtml}
        </span>
      </span>
    `;
  }

  function showFieldMoveSwitchPrompt(skillId, previousSkillId = null) {
    const html = buildFieldMoveSwitchPromptHtml(skillId, previousSkillId);

    if (!html) {
      fieldMoveSwitchPrompt = null;
      return;
    }

    fieldMoveSwitchPrompt = {
      html,
      expiresAt: getRuntimeNow() + FIELD_MOVE_SWITCH_PROMPT_DURATION_MS
    };
  }

  function measureFieldMoveSwitchPaint(activeFieldMoveId, previousFieldMoveId) {
    measureFieldMoveSwitchToPaint({
      activeFieldMoveId,
      previousFieldMoveId,
      now: getRuntimeNow,
      requestAnimationFrame: windowRef.requestAnimationFrame?.bind(windowRef),
      report: reportGamePerformanceMetric
    });
  }

  function setActiveFieldMove(skillId, { notify = false } = {}) {
    if (!ACTIVE_FIELD_MOVE_ORDER.includes(skillId) || !playerSkills[skillId]) {
      return false;
    }

    const activeFieldMoveId = getActiveFieldMoveId();
    const previousActiveFieldMoveId = activeFieldMoveId;

    if (activeFieldMoveId === skillId) {
      if (notify) {
        showFieldMoveSwitchPrompt(skillId, previousActiveFieldMoveId);
      }
      return true;
    }

    setActiveFieldMoveStateFromId(skillId);
    syncSkillsUi();

    if (notify) {
      showFieldMoveSwitchPrompt(skillId, previousActiveFieldMoveId);
      measureFieldMoveSwitchPaint(skillId, previousActiveFieldMoveId);
    }

    return true;
  }

  function ensureActiveFieldMove() {
    const activeFieldMoveId = getActiveFieldMoveId();

    if (activeFieldMoveId && playerSkills[activeFieldMoveId]) {
      return;
    }

    setActiveFieldMoveStateFromId(getUnlockedFieldMoveIds()[0] || null);
    syncSkillsUi();
  }

  function cycleActiveFieldMove(direction = 1) {
    const unlockedFieldMoveIds = getUnlockedFieldMoveIds();
    const previousActiveFieldMoveId = getActiveFieldMoveId();

    if (unlockedFieldMoveIds.length === 0) {
      return;
    }

    if (unlockedFieldMoveIds.length === 1) {
      setActiveFieldMove(unlockedFieldMoveIds[0], { notify: true });
      return;
    }

    const currentIndex = Math.max(0, unlockedFieldMoveIds.indexOf(previousActiveFieldMoveId));
    const step = direction < 0 ? -1 : 1;
    const nextIndex =
      (currentIndex + step + unlockedFieldMoveIds.length) % unlockedFieldMoveIds.length;

    setActiveFieldMove(unlockedFieldMoveIds[nextIndex], { notify: true });
    if (getActiveFieldMoveId() !== previousActiveFieldMoveId) {
      botTradeSfxPlayer.play();
    }
  }

  function unlockPlayerSkill(skillId, { silent = false } = {}) {
    if (!PLAYER_SKILL_DEFS[skillId] || playerSkills[skillId]) {
      return;
    }

    playerSkills[skillId] = true;
    if (ACTIVE_FIELD_MOVE_ORDER.includes(skillId)) {
      setActiveFieldMoveStateFromId(skillId);
    } else {
      ensureActiveFieldMove();
    }
    syncSkillsUi();
    if (!silent) {
      questSystem.emit({
        type: QUEST_EVENT.UNLOCK,
        targetId: skillId
      });
    }

    if (skillId === "waterGun") {
      inventory[WATER_GUN_POWER_ITEM_ID] = 1;
      uiRuntime.syncInventoryUi(inventory);
      uiRuntime.gameplayUiVisibility.showSections(["inventory"]);
    }

    requestAutosave(AUTOSAVE_EVENT.NEW_ABILITY_LEARNED, {
      skillId
    });
  }

  function setBuilderPanelOpen(open) {
    if (open && !uiRuntime.gameplayUiVisibility.isSectionVisible("builder")) {
      return;
    }

    builderPanelOpen = open;
    if (dom.builderPanel) {
      dom.builderPanel.hidden = !open;
    }

    pressedKeys.clear();
    harvestRequested = false;
    interactRequested = false;

    if (open) {
      windowRef.requestAnimationFrame(() => {
        uiRuntime.guidePanel.focusSearch();
      });
    }
  }

  const engine = createEngineRuntime({
    dom,
    launchMode: effectiveLaunchMode,
    shouldUseNoopWebGlForLaunchMode,
    windowRef,
    onWebGlUnavailable() {
      if (status) {
        status.textContent = "WebGL nao disponivel neste navegador.";
        status.dataset.error = "true";
      }
      markAppReady(appRoot, "error", effectiveLaunchMode);
    }
  });

  windowRef.addEventListener("error", (event) => {
    if (event.error && event.error.message) {
      reportStatus(event.error.message, true);
    }
  });

  windowRef.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason && event.reason.message ?
      event.reason.message :
      "Erro inesperado ao carregar o viewer.";
    reportStatus(reason, true);
  });

  uiRuntime = createUiRuntime({
    dom,
    inventory,
    storyState,
    playerSkills,
    inventoryOrder: INVENTORY_ORDER,
    itemDefs: ITEM_DEFS,
    playerSkillDefs: PLAYER_SKILL_DEFS,
    playerSkillOrder: PLAYER_SKILL_ORDER,
    npcProfiles: NPC_PROFILES,
    placeholderRecipes: PLACEHOLDER_RECIPES,
    getActiveQuest,
    getQuestProgressDescriptor,
    buildQuestProgressCopy,
    formatRequirementSummary,
    formatDifficulty,
    getRegionForPosition,
    resourceHarvestPrompt: RESOURCE_HARVEST_PROMPT,
    interactPrompt: INTERACT_PROMPT,
    questSystem,
    isBagDetailItemId,
    clearGameFlowInput,
    isBuilderPanelOpen: () => builderPanelOpen,
    setBuilderPanelOpen,
    onNoticePushed: () => {
      playSoundEvent(SOUND_EVENT_IDS.UI_NOTICE);
    },
    onPokedexScriptedClose: () => {
      sceneFlowRuntime?.actTwoTutorial.notifyPokedexClosed();
    }
  });
  const autosaveIndicator = createAutosaveIndicator({
    documentRef,
    mount: dom.renderFrame || dom.uiLayer || dom.mount,
    windowRef
  });
  autosaveRuntime = createAutosaveRuntime({
    save(event) {
      return writeManualSavePoint({
        saveKind: "autosave",
        autosaveEvent: event
      });
    },
    onSaving() {
      if (!autosaveIndicatorSuppressed) {
        autosaveIndicator.show();
      }
    }
  });

  function restartGameFromSettings() {
    removeManualSaveSlot(windowRef, activeManualSaveSlotId);
    removeLocalStorageItem(windowRef, MANUAL_SAVE_ACTIVE_SLOT_STORAGE_KEY);
    removeLocalStorageItem(windowRef, SKIP_START_SCREEN_STORAGE_KEY);

    try {
      windowRef.location?.reload?.();
    } catch {
      return true;
    }
    return true;
  }

  settingsMenu = createSettingsMenuController({
    mount: dom.renderFrame || dom.uiLayer || dom.mount,
    schema: SETTINGS_SCHEMA,
    settingsState,
    inventory,
    inventoryOrder: INVENTORY_ORDER,
    itemDefs: ITEM_DEFS,
    storyState,
    onChange: () => {
      audioMixRuntime.updateFromSettings(settingsState);
      syncVisualSettings();
      saveSettingsState(windowRef.localStorage, settingsState);
    },
    onClose: clearGameFlowInput,
    onRestartGame: restartGameFromSettings
  });
  const firstChopperCinematicVeil = createOverlayVeil({
    root: dom.sceneTransitionVeil
  });
  const workbenchModal = createWorkbenchModalController({
    mount: dom.renderFrame || dom.uiLayer || dom.mount,
    inventory,
    getItemLabel,
    formatRequirementSummary,
    clearGameFlowInput
  });
  const pokemonCenterPcModal = createPokemonCenterPcModalController({
    mount: dom.renderFrame || dom.uiLayer || dom.mount,
    clearGameFlowInput
  });
  const leafageObjectModal = createLeafageObjectModalController({
    mount: dom.renderFrame || dom.uiLayer || dom.mount,
    clearGameFlowInput
  });
  storyBeats = createStoryBeatSystem({
    dialogueSystem,
    gameplayDialogue: uiRuntime.gameplayDialogue,
    storyState,
    playerProfile: playerMemory,
    questSystem,
    pokedexRuntime: uiRuntime.pokedexRuntime,
    trackFieldTask,
    unlockPlayerSkill,
    pushNotice: uiRuntime.pushNotice
  });

  function getPokemonCenterPcActionForTask(taskId) {
    if (
      taskId === FIELD_TASK_IDS.RUINED_POKEMON_CENTER &&
      !storyState.flags.challengesUnlocked
    ) {
      return {
        actionId: POKEMON_CENTER_PC_ACTION.UNLOCK_CHALLENGES,
        actionLabel: "Open Colony Checks"
      };
    }

    if (
      taskId === FIELD_TASK_IDS.BOULDER_SHADED_TALL_GRASS &&
      canClaimBoulderChallengeReward(storyState)
    ) {
      return {
        actionId: POKEMON_CENTER_PC_ACTION.CLAIM_BOULDER_REWARD,
        actionLabel: getColonyFeedbackActionLabel(COLONY_FEEDBACK_IDS.LOG_VIABILITY_ACTION)
      };
    }

    if (
      taskId === FIELD_TASK_IDS.NEW_CHALLENGES_IN_PC &&
      storyState.flags.newPcChallengesAvailable &&
      !storyState.flags.newPcChallengesChecked
    ) {
      return {
        actionId: POKEMON_CENTER_PC_ACTION.REVIEW_NEW_CHALLENGES,
        actionLabel: "Review"
      };
    }

    if (
      taskId === FIELD_TASK_IDS.LEAF_DEN_KIT &&
      storyState.flags.leafDenKitPurchaseAvailable &&
      !storyState.flags.leafDenKitPurchased
    ) {
      return {
        actionId: POKEMON_CENTER_PC_ACTION.ISSUE_LEAF_DEN_KIT,
        actionLabel: getColonyFeedbackActionLabel(COLONY_FEEDBACK_IDS.ISSUE_HOUSE_KIT_ACTION)
      };
    }

    return {};
  }

  function buildPokemonCenterPcMissionEntries() {
    const questEntries = (questSystem?.getQuestLog?.() || []).map((quest) => {
      const locked = quest.status === "locked";
      return {
        id: `quest:${quest.id}`,
        source: "story",
        status: quest.status,
        title: locked ? "????" : quest.title,
        description: locked ? "Check data has not been recovered yet." : quest.description,
        progress: locked ? "" : formatQuestMissionProgress(quest)
      };
    });

    const fieldTaskEntries = Object.values(SMALL_ISLAND_FIELD_TASKS).map((task) => {
      const done = isFieldTaskComplete(storyState, task);
      const known = isFieldTaskKnown(storyState, task);
      const action = getPokemonCenterPcActionForTask(task.id);
      const status = done ? "completed" : (known || action.actionId ? "available" : "locked");

      return {
        id: `field:${task.id}`,
        source: task.background ? "field note" : "request",
        status,
        title: status === "locked" ? "????" : task.title,
        description: status === "locked" ?
          "Check data has not been recovered yet." :
          getFieldTaskDescription(task, storyState),
        ...action
      };
    });

    return [...fieldTaskEntries, ...questEntries];
  }

  function runPokemonCenterPcAction(actionId) {
    if (actionId === POKEMON_CENTER_PC_ACTION.CLAIM_BOULDER_REWARD) {
      storyState.flags.boulderChallengeRewardReady = true;
      storyBeats.playDialogue(STORY_BEAT_IDS.BOULDER_CHALLENGE_REWARD, {
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
      return true;
    }

    if (actionId === POKEMON_CENTER_PC_ACTION.REVIEW_NEW_CHALLENGES) {
      storyBeats.playDialogue(STORY_BEAT_IDS.NEW_PC_CHALLENGES, {
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
      return true;
    }

    if (actionId === POKEMON_CENTER_PC_ACTION.ISSUE_LEAF_DEN_KIT) {
      storyBeats.playDialogue(STORY_BEAT_IDS.LEAF_DEN_KIT_PURCHASED, {
        onBeforeCompleteEffects: () => {
          addItems(inventory, { [LEAF_DEN_KIT_ITEM_ID]: 1 });
          uiRuntime.syncInventoryUi(inventory);
          uiRuntime.bagUiRuntime.handleItemCollected(LEAF_DEN_KIT_ITEM_ID, storyState);
          syncQuestPanels();
        },
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
      return true;
    }

    if (actionId === POKEMON_CENTER_PC_ACTION.UNLOCK_CHALLENGES) {
      storyBeats.playDialogue(STORY_BEAT_IDS.CHALLENGES_UNLOCKED, {
        onBeforeCompleteEffects: () => {
          requestAutosave(AUTOSAVE_EVENT.MAJOR_SYSTEM_UNLOCKED, {
            systemId: "challenges"
          });
        },
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
      return true;
    }

    return false;
  }

  function createWorkbenchModalRecipeOption(option) {
    return {
      ...option,
      onConfirm: () => {
        const crafted =
          option.recipe?.id === GREENHOUSE_ITEM_ID ?
            craftGreenhouseAtWorkbench({
              storyState,
              inventory
            }) :
            option.recipe?.id === "strawBed" ?
            craftStrawBedAtWorkbench({
              storyState,
              inventory
            }) :
            option.recipe?.id === LEAF_DEN_KIT_ITEM_ID ?
              craftLeafDenKitAtWorkbench({
                storyState,
                inventory
              }) :
              craftCampfireAtWorkbench({
                storyState,
                inventory
              });

        if (crafted) {
          playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_SUCCESS);
          syncQuestPanels();
          if (option.recipe?.id === "strawBed") {
            requestSolarStationPlacementIntent();
          } else if (option.recipe?.id === LEAF_DEN_KIT_ITEM_ID) {
            requestHouseKitPlacementIntent();
          }
        }

        return crafted;
      }
    };
  }

  function getCurrentWorkbenchRecipeOptions() {
    const recipes = getWorkbenchRecipeOptions?.(storyState, inventory);
    return Array.isArray(recipes) ? recipes : [];
  }

  function openWorkbenchCraftOptions(recipes = getCurrentWorkbenchRecipeOptions()) {
    const recipeOptions = Array.isArray(recipes) ? recipes : [];
    if (!recipeOptions.length) {
      uiRuntime.pushNotice("Workbench has no active protocols.");
      return false;
    }

    const shouldFocusThermalCabin =
      Boolean(storyState?.flags?.greenhousePlaced) &&
      !storyState.flags.campfireCrafted;

    workbenchModal.open({
      recipes: recipeOptions.map(createWorkbenchModalRecipeOption),
      initialRecipeId: shouldFocusThermalCabin ? CAMPFIRE_ITEM_ID : null
    });
    clearGameFlowInput();
    return true;
  }

  function teleportPlayerToWorkbench() {
    const playerCharacter = gameSession?.playerCharacter;
    if (!playerCharacter?.setPosition) {
      uiRuntime.pushNotice("Player is not ready for Workbench connection.");
      return false;
    }

    playerCharacter.setPosition([
      WORKBENCH_POSITION[0],
      WORKBENCH_POSITION[1],
      WORKBENCH_POSITION[2] + 1.35
    ]);
    uiRuntime.pushNotice("Player moved near the Workbench.");
    return true;
  }

  function installWorkbenchConsoleBridge() {
    if (!windowRef || typeof windowRef !== "object") {
      return;
    }

    windowRef.sandbotsWorkbench = {
      close() {
        workbenchModal.close();
        return true;
      },
      connect() {
        teleportPlayerToWorkbench();
        return openWorkbenchCraftOptions();
      },
      isOpen() {
        return workbenchModal.isOpen();
      },
      open() {
        return openWorkbenchCraftOptions();
      },
      recipes() {
        return getCurrentWorkbenchRecipeOptions().map((option) => ({
          id: option.recipe?.id || null,
          label: option.recipe?.label || option.recipe?.name || null,
          disabled: Boolean(option.disabled),
          status: option.status || null,
          actionLabel: option.actionLabel || null,
          guidance: option.guidance || null
        }));
      },
      teleport() {
        return teleportPlayerToWorkbench();
      }
    };
  }

  const {
    craftCampfireAtWorkbench,
    craftGreenhouseAtWorkbench,
    craftLeafDenKitAtWorkbench,
    craftStrawBedAtWorkbench,
    findNearbyActionTarget,
    getWorkbenchRecipeOptions,
    performHarvestAction,
    performInteractAction,
    resetRuntimeState: resetGameplayRuntimeState
  } = createGameplayInteractions({
    npcProfiles: NPC_PROFILES,
    placeholderRecipes: PLACEHOLDER_RECIPES,
    workbenchRecipes: WORKBENCH_RECIPES,
    startDialogue({ targetId, dialogueId, onComplete }) {
      const restoreCameraOnComplete = () => {
        onComplete?.();
        dialogueCamera.restoreGameplayCamera();
      };

      if (targetId === "tangrowth" && dialogueId === "onboarding") {
        startMainThemeFromChopperFirstTalk();

        const openOnboardingConversation = () => {
          scriptedInteractionActive = true;
          const completeOnboardingConversation = () => {
            setBillCameoVisible(false);

            if (!hasConfirmedPlayerName(playerMemory)) {
              const opened = uiRuntime.gameplayDialogue.openNameEntry?.({
                initialName: playerMemory.playerName,
                onComplete: ({ playerName, nameConfirmation }) => {
                  if (confirmPlayerName(playerMemory, { playerName, nameConfirmation })) {
                    requestAutosave(AUTOSAVE_EVENT.PLAYER_NAME_CONFIRMED, {
                      playerName: playerMemory.playerName,
                      nameConfirmation: playerMemory.nameConfirmation
                    });
                    uiRuntime.pushNotice(formatBuilderCallsignRegisteredNotice(playerMemory), 3.6);
                    const openedAcknowledgement = uiRuntime.gameplayDialogue.openConversation?.({
                      lines: [
                        {
                          speaker: SANDBOTS_BOT_NAMES.scout,
                          text: formatBuilderCallsignAcknowledgement(playerMemory)
                        }
                      ],
                      onComplete: restoreCameraOnComplete
                    });
                    if (openedAcknowledgement) {
                      return;
                    }
                  }
                  restoreCameraOnComplete();
                }
              });

              if (opened) {
                return;
              }
            }

            restoreCameraOnComplete();
          };
          const playOnboardingConversation = () => {
            return storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_ONBOARDING, {
              context: {
                needsPlayerName: !hasConfirmedPlayerName(playerMemory)
              },
              onLineChange(line) {
                handleChopperOnboardingLineChange(line);
              },
              onComplete: completeOnboardingConversation
            });
          };

          void playFirstChopperCinematic({
            storyState,
            targetId,
            dialogueId,
            transitionVeil: firstChopperCinematicVeil,
            focusGuideTarget: focusFirstChopperGuideBeat,
            performGuideAction: playFirstChopperGuideAction,
            focusConversation: refocusChopperConversation,
            openConversation: playOnboardingConversation,
            clearGameFlowInput
          }).finally(() => {
            scriptedInteractionActive = false;
          });

          return true;
        };

        if (shouldPlayChopperSecondTalkApproach({ targetId, dialogueId })) {
          const chopperActor = gameSession.chopperNpcActor;
          const playerPosition = gameSession.playerCharacter.getPosition();
          const chopperPosition = getChopperNpcPosition() || playerPosition;
          const targetPosition = buildChopperApproachTarget(playerPosition, chopperPosition);

          storyState.flags.chopperSecondTalkApproachSeen = true;
          scriptedInteractionActive = true;
          clearGameFlowInput();
          dialogueCamera?.focusWorldPoint({
            position: chopperPosition,
            height: 1.55
          });

          const flightStarted = startChopperNpcFlight(chopperActor, {
            targetPosition,
            duration: CHOPPER_SECOND_TALK_APPROACH_DURATION,
            onComplete() {
              const latestPlayerPosition = gameSession?.playerCharacter?.getPosition?.() || playerPosition;
              const latestChopperPosition = getChopperNpcPosition() || targetPosition;

              chopperActor.npcActor.character?.faceToward?.(latestPlayerPosition);
              chopperActor.npcActor.faceYaw = getYawToward(latestChopperPosition, latestPlayerPosition);
              scriptedInteractionActive = false;
              dialogueCamera?.focusNpcConversation({
                targetId,
                playerPosition: latestPlayerPosition,
                npcActors: gameSession?.npcActors || [],
                interactables: gameSession?.interactables || []
              });
              scriptedInteractionActive = true;
              openOnboardingConversation();
            }
          });

          if (!flightStarted) {
            return openOnboardingConversation();
          }

          return true;
        }

        return openOnboardingConversation();
      }

      if (targetId === "tangrowth" && dialogueId === "tallGrassReturn") {
        return storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_TALL_GRASS_RETURN, {
          onComplete: () => {
            dialogueCamera.restoreGameplayCamera();
          }
        });
      }

      if (targetId === "tangrowth" && dialogueId === "firstHabitatReport") {
        return storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_FIRST_HABITAT_REPORT, {
          onComplete: () => {
            dialogueCamera.restoreGameplayCamera();
          }
        });
      }

      if (targetId === "tangrowth" && dialogueId === "logChairGift") {
        return storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_LOG_CHAIR_GIFT, {
          onBeforeCompleteEffects: () => {
            addItems(inventory, { [LOG_CHAIR_ITEM_ID]: 1 });
            uiRuntime.syncInventoryUi(inventory);
            uiRuntime.bagUiRuntime.handleItemCollected(LOG_CHAIR_ITEM_ID, storyState);
            syncQuestPanels();
          },
          onComplete: () => {
            dialogueCamera.restoreGameplayCamera();
            syncQuestPanels();
          }
        });
      }

      if (targetId === "squirtle" && dialogueId === "discovery") {
        squirtleDryGrassCameraFocusShown = false;
        const playDiscoveryDialogue = () => storyBeats.playDialogue(STORY_BEAT_IDS.SQUIRTLE_DISCOVERY, {
          onLineChange(_line, lineIndex) {
            if (lineIndex === SQUIRTLE_DRY_GRASS_FOCUS_LINE_INDEX) {
              startSquirtleDryGrassCameraFocus();
            }
          },
          onBeforeCompleteEffects: () => {
            finishSquirtleDryGrassCameraFocus({
              refocusSquirtle: false
            });
          },
          onComplete: restoreCameraOnComplete
        });

        if (startSquirtleReassemblyBeforeDialogue(playDiscoveryDialogue)) {
          return true;
        }

        return playDiscoveryDialogue();
      }

      if (targetId === "leppaTree" && dialogueId === "revivedTree") {
        return uiRuntime.gameplayDialogue.openConversation({
          lines: [
            {
              speaker: "TREE",
              text: "Show me what you got"
            }
          ],
          onComplete: restoreCameraOnComplete
        });
      }

      return false;
    },
    unlockPlayerAbility: unlockPlayerSkill,
    unlockPokedexReward() {
      if (gameSession?.actTwoSquirtle) {
        gameSession.actTwoSquirtle.recovered = true;
        gameSession.actTwoSquirtle.visible = true;
        gameSession.actTwoSquirtle.assemblyState = "assembled";
      }

      playerMemory.foundPokedex = true;
      uiRuntime.pokedexRuntime.unlock();
      requestAutosave(AUTOSAVE_EVENT.ROBOT_REACTIVATED, {
        robotId: "squirtle"
      });
      requestAutosave(AUTOSAVE_EVENT.MAJOR_SYSTEM_UNLOCKED, {
        systemId: "pokedex"
      });
      questSystem.emit({
        type: QUEST_EVENT.PHOTO,
        targetId: "first-memory"
      });

      void uiRuntime.skillLearnOverlay.play({
        title: "YOU LEARNED",
        skillName: "WATER GUN!",
        note: "Hold X to restore dry ground."
      }).then(() => {
        uiRuntime.pokedexRuntime.setOpen(true, {
          markSeen: true,
          scripted: true,
          entryId: SQUIRTLE_POKEDEX_ENTRY_ID
        });
      });
    },
    onFirstGrassRestored() {
      questSystem.emit({
        type: QUEST_EVENT.PLACE,
        targetId: "revived-habitat"
      });
      questSystem.emit({
        type: QUEST_EVENT.BUILD,
        targetId: "revived-habitat"
      });
      uiRuntime.setNearbyHabitats(habitatSystem.getDiscoveredLabels());
      uiRuntime.syncQuestFocus(storyState);
    },
    onFlowersRecovered() {
      storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_FLOWER_RECOVERY);
    },
    onBulbasaurRevealed({ cellId }) {
      const rustlingGrassPatch = gameSession?.groundGrassPatches?.find((groundGrassPatch) => {
        return groundGrassPatch.cellId === cellId;
      });
      const encounter = gameSession?.bulbasaurEncounter;

      if (!encounter) {
        return;
      }

      const repairPosition = encounter.repairPosition || rustlingGrassPatch?.position;

      if (!Array.isArray(repairPosition)) {
        return;
      }
      const repairBoxFocusPosition = getBulbasaurRepairBoxFocusPosition() || repairPosition;

      const openChopperEncouragement = () => {
        const playerPosition = gameSession?.playerCharacter?.getPosition?.();
        const chopperPosition = getChopperNpcPosition();

        if (playerPosition && chopperPosition) {
          gameSession?.chopperNpcActor?.npcActor?.character?.faceToward?.(playerPosition);
          if (gameSession?.chopperNpcActor?.npcActor) {
            gameSession.chopperNpcActor.npcActor.faceYaw = getYawToward(chopperPosition, playerPosition);
          }
          dialogueCamera?.focusNpcConversation({
            targetId: "tangrowth",
            playerPosition,
            npcActors: gameSession?.npcActors || [],
            interactables: gameSession?.interactables || []
          });
        }

        storyBeats.playDialogue(STORY_BEAT_IDS.CHOPPER_BULBASAUR_ENCOURAGEMENT, {
          onBeforeCompleteEffects: () => {
            dialogueCamera?.restoreGameplayCamera();
          }
        });
      };

      const focusBulbasaurDiscovery = () => {
        const playerPosition = gameSession?.playerCharacter?.getPosition?.();
        const targetPosition = Array.isArray(encounter.position) ?
          encounter.position :
          repairPosition;

        if (!playerPosition || !targetPosition) {
          return;
        }

        dialogueCamera?.focusNpcConversation({
          targetId: "bulbasaur",
          playerPosition,
          npcActors: gameSession?.npcActors || [],
          interactables: gameSession?.interactables || [],
          targetPosition
        });
      };

      const openBulbasaurDiscoveryDialogue = () => {
        scriptedInteractionActive = false;
        clearGameFlowInput();
        if (dom.uiLayer instanceof HTMLElement) {
          dom.uiLayer.dataset.mode = "game";
        }
        focusBulbasaurDiscovery();
        storyBeats.playDialogue(STORY_BEAT_IDS.BULBASAUR_HABITAT_DISCOVERY, {
          onComplete: openChopperEncouragement
        });
      };

      scriptedInteractionActive = true;
      clearGameFlowInput();
      if (dom.uiLayer instanceof HTMLElement) {
        dom.uiLayer.dataset.mode = "cinematic";
      }
      dialogueCamera?.focusWorldPoint({
        position: repairBoxFocusPosition,
        height: GROW_BOT_REVEAL_CINEMATIC_FOCUS_HEIGHT
      });

      requestAutosave(AUTOSAVE_EVENT.ROBOT_REACTIVATED, {
        robotId: "bulbasaur"
      });
      encounter.visible = false;
      encounter.jumpTimer = 0;
      encounter.originPosition = null;
      encounter.landingPosition = null;
      encounter.position = null;
      encounter.revealBoxOpening = createBotRevealBoxOpening(openBulbasaurDiscoveryDialogue);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = true;
      }
    },
    onBulbasaurDryGrassMissionAccepted() {
      storyBeats.playDialogue(STORY_BEAT_IDS.BULBASAUR_DRY_GRASS_REQUEST);
    },
    onBulbasaurDryGrassRequestCompleted() {
      storyBeats.playDialogue(STORY_BEAT_IDS.BULBASAUR_LEAFAGE_REWARD);
    },
    onBulbasaurStrawBedRecipeRequested() {
      storyBeats.playDialogue(STORY_BEAT_IDS.BULBASAUR_STRAW_BED_RECIPE, {
        onBeforeCompleteEffects: () => {
          if (!hasItems(inventory, { [STRAW_BED_RECIPE_ITEM_ID]: 1 })) {
            addItems(inventory, { [STRAW_BED_RECIPE_ITEM_ID]: 1 });
          }
          uiRuntime.syncInventoryUi(inventory);
          uiRuntime.bagUiRuntime.handleItemCollected(STRAW_BED_RECIPE_ITEM_ID, storyState);
          syncQuestPanels();
        },
        onComplete: syncQuestPanels
      });
    },
    onCharmanderRevealed({ cellId }) {
      const rustlingGrassPatch = gameSession?.groundGrassPatches?.find((groundGrassPatch) => {
        return groundGrassPatch.cellId === cellId;
      });
      const encounter = gameSession?.charmanderEncounter;
      const openCharmanderDiscoveryDialogue = () => {
        scriptedInteractionActive = false;
        clearGameFlowInput();
        if (dom.uiLayer instanceof HTMLElement) {
          dom.uiLayer.dataset.mode = "game";
        }
        storyBeats.playDialogue(STORY_BEAT_IDS.CHARMANDER_DISCOVERY, {
          onComplete: () => {
            syncQuestPanels();
            if (shouldRecoverBulbasaurWorkbenchGuide()) {
              playBulbasaurWorkbenchGuideIntro();
            }
          }
        });
      };

      if (encounter) {
        const repairPosition = encounter.repairPosition || rustlingGrassPatch?.position;
        if (!Array.isArray(repairPosition)) {
          return;
        }
        scriptedInteractionActive = true;
        clearGameFlowInput();
        if (dom.uiLayer instanceof HTMLElement) {
          dom.uiLayer.dataset.mode = "cinematic";
        }
        dialogueCamera?.focusWorldPoint({
          position: repairPosition,
          height: GROW_BOT_REVEAL_CINEMATIC_FOCUS_HEIGHT
        });

        encounter.visible = false;
        encounter.position = null;
        encounter.targetPosition = null;
        encounter.originPosition = null;
        encounter.landingPosition = null;
        encounter.jumpTimer = 0;
        encounter.revealBoxOpening = createBotRevealBoxOpening(openCharmanderDiscoveryDialogue);
        if (encounter.repairModuleInstance) {
          encounter.repairModuleInstance.active = true;
        }
        requestAutosave(AUTOSAVE_EVENT.ROBOT_REACTIVATED, {
          robotId: "charmander"
        });
        return;
      }

      openCharmanderDiscoveryDialogue();
    },
    onTimburrRevealed({ cellId }) {
      const rustlingGrassPatch = gameSession?.groundGrassPatches?.find((groundGrassPatch) => {
        return groundGrassPatch.cellId === cellId;
      });
      const encounter = gameSession?.timburrEncounter;

      if (encounter) {
        const repairPosition = encounter.repairPosition || rustlingGrassPatch?.position;
        if (!Array.isArray(repairPosition)) {
          return;
        }
        encounter.visible = true;
        encounter.position = [...repairPosition];
        if (encounter.repairModuleInstance) {
          encounter.repairModuleInstance.active = false;
        }
        requestAutosave(AUTOSAVE_EVENT.ROBOT_REACTIVATED, {
          robotId: "timburr"
        });
      }

      storyBeats.playDialogue(STORY_BEAT_IDS.TIMBURR_DISCOVERY, {
        onComplete: syncQuestPanels
      });
    },
    onLeppaBerryGiftRequested({ targetId = "bulbasaur" } = {}) {
      if (!hasItems(inventory, { [LEPPA_BERRY_ITEM_ID]: 1 })) {
        uiRuntime.pushNotice(`You need a ${SANDBOTS_ITEM_NAMES.pulseBerry} to show them.`);
        return;
      }

      storyBeats.playDialogue(STORY_BEAT_IDS.LEPPA_BERRY_DELIVERY, {
        context: {
          targetId
        },
        onBeforeCompleteEffects: () => {
          consumeItems(inventory, { [LEPPA_BERRY_ITEM_ID]: 1 });
          uiRuntime.syncInventoryUi(inventory);
          syncQuestPanels();
        },
        onComplete: syncQuestPanels
      });
    },
    onChopperLogChairGiftRequested() {
      addItems(inventory, { [LOG_CHAIR_ITEM_ID]: 1 });
      storyState.flags.logChairReceived = true;
      uiRuntime.syncInventoryUi(inventory);
      uiRuntime.bagUiRuntime.handleItemCollected(LOG_CHAIR_ITEM_ID, storyState);
      uiRuntime.pushNotice("You got a Log Chair.");
      syncQuestPanels();
    },
    onTangrowthHouseTalkRequested() {
      storyBeats.playDialogue(STORY_BEAT_IDS.TANGROWTH_HOUSE_BUILDING_TALK, {
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
    },
    onLeafDenKitPlacementRequested({ playerPosition }) {
      const placementReadiness = getHouseKitPlacementReadiness({
        storyState,
        inventory,
        hasSolarStationPower: Boolean(
          storyState.flags.strawBedPlacedInBulbasaurHabitat &&
          gameSession?.strawBed?.position
        )
      });

      if (placementReadiness.blockedReason === "missing-house-kit") {
        clearPendingPlacementIntent(LEAF_DEN_KIT_ITEM_ID);
        uiRuntime.pushNotice(placementReadiness.reason);
        return;
      }

      if (!placementReadiness.canPlace) {
        setPendingPlacementIntent({
          itemId: LEAF_DEN_KIT_ITEM_ID,
          placeableId: GRID_PLACEABLE_IDS.LEAF_DEN_KIT,
          label: "House Kit",
          blockedReason: placementReadiness.blockedReason
        });
        uiRuntime.pushNotice(placementReadiness.reason);
        return;
      }

      setPendingPlacementIntent({
        itemId: LEAF_DEN_KIT_ITEM_ID,
        placeableId: GRID_PLACEABLE_IDS.LEAF_DEN_KIT,
        label: "House Kit"
      });

      if (confirmLeafDenKitPlacementPreview()) {
        return;
      }

      if (!Array.isArray(playerPosition)) {
        uiRuntime.pushNotice("Move into the world before placing the House Kit.");
        return;
      }

      startLeafDenKitPlacementPreview(playerPosition);
    },
    onLeafDenConstructionRequested() {
      if (!storyState.flags.leafDenKitPlaced || !gameSession?.leafDen) {
        uiRuntime.pushNotice("Place the House Kit first.");
        return;
      }

      if (storyState.flags.leafDenConstructionStarted) {
        if (completeLeafDenConstructionIfReady()) {
          return;
        }

        uiRuntime.pushNotice("House construction is still underway.");
        syncQuestPanels();
        return;
      }

      if (!hasItems(inventory, LEAF_DEN_BUILD_REQUIREMENTS)) {
        uiRuntime.pushNotice(formatConstructionMaterialsSummary(
          gameSession.leafDen.constructionName,
          LEAF_DEN_BUILD_REQUIREMENTS,
          inventory
        ));
        syncQuestPanels();
        return;
      }

      const helperStatus = getLeafDenHelperStatus();
      if (!helperStatus.ok) {
        uiRuntime.pushNotice(formatMissingLeafDenSpecialtiesNotice(helperStatus));
        syncQuestPanels();
        return;
      }

      storyBeats.playDialogue(STORY_BEAT_IDS.LEAF_DEN_CONSTRUCTION_STARTED, {
        onBeforeCompleteEffects: () => {
          const now = getLeafDenConstructionNow();
          consumeItems(inventory, LEAF_DEN_BUILD_REQUIREMENTS);
          if (gameSession?.leafDen) {
            gameSession.leafDen.constructionStatus = "building";
          }
          storyState.flags.leafDenConstructionStartedAt = now;
          storyState.flags.leafDenConstructionCompletesAt = now + LEAF_DEN_BUILD_DURATION_MS;
          storyState.flags.timburrFollowing = false;
          storyState.flags.charmanderFollowing = false;
          uiRuntime.syncInventoryUi(inventory);
          syncQuestPanels();
        },
        onComplete: syncQuestPanels
      });
    },
    onLeafDenEnterRequested() {
      if (!storyState.flags.leafDenBuilt) {
        uiRuntime.pushNotice("The House is not ready yet.");
        return;
      }

      storyState.flags.leafDenInteriorEntered = true;
      uiRuntime.pushNotice("You entered the House.");
      syncQuestPanels();
    },
    onLeafDenFurniturePlacementRequested() {
      if (!storyState.flags.leafDenInteriorEntered) {
        uiRuntime.pushNotice("Enter the House first.");
        return;
      }

      const current = Math.min(3, Number(storyState.flags.leafDenFurniturePlacedCount || 0));
      if (current >= 3) {
        uiRuntime.pushNotice(`The House has enough furniture. Talk to ${SANDBOTS_BOT_NAMES.builder} to finish the room.`);
        return;
      }

      gameSession.leafDenFurniture ||= [];
      gameSession.leafDenFurniture.push(
        attachPlayerPlacementSpawnEffect(buildLeafDenFurniturePlacement(current))
      );
      storyState.flags.leafDenFurniturePlacedCount = current + 1;
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
      uiRuntime.pushNotice(
        storyState.flags.leafDenFurniturePlacedCount >= 3 ?
          `All furniture is placed. Talk to ${SANDBOTS_BOT_NAMES.builder}.` :
          `Furniture placed inside the House. ${storyState.flags.leafDenFurniturePlacedCount}/3.`
      );
      syncQuestPanels();
    },
    onTimburrLeafDenFurnitureCompleteRequested() {
      if (Number(storyState.flags.leafDenFurniturePlacedCount || 0) < 3) {
        uiRuntime.pushNotice("Place 3 furniture pieces inside the House first.");
        return;
      }

      storyBeats.playDialogue(STORY_BEAT_IDS.TIMBURR_LEAF_DEN_FURNITURE_COMPLETE, {
        onComplete: syncQuestPanels
      });
    },
    onCharmanderCelebrationSuggested() {
      storyBeats.playDialogue(STORY_BEAT_IDS.CHARMANDER_CELEBRATION_SUGGESTION, {
        onComplete: syncQuestPanels
      });
    },
    onCharmanderCelebrationTangrowthRequested() {
      if (!storyState.flags.charmanderCelebrationSuggested) {
        uiRuntime.pushNotice(`Talk to ${SANDBOTS_BOT_NAMES.thermal} about the celebration first.`);
        dialogueCamera.restoreGameplayCamera();
        return;
      }

      if (!isCharmanderNearTangrowthForCelebration()) {
        uiRuntime.pushNotice(`Bring ${SANDBOTS_BOT_NAMES.thermal} closer to ${SANDBOTS_BOT_NAMES.overseer} first.`);
        dialogueCamera.restoreGameplayCamera();
        syncQuestPanels();
        return;
      }

      storyBeats.playDialogue(STORY_BEAT_IDS.CHARMANDER_CELEBRATION_CUTSCENE, {
        onBeforeCompleteEffects: () => {
          if (!storyState.flags.dittoFlagReceived && !hasItems(inventory, { [DITTO_FLAG_ITEM_ID]: 1 })) {
            addItems(inventory, { [DITTO_FLAG_ITEM_ID]: 1 });
          }
          storyState.flags.charmanderFollowing = false;
          uiRuntime.syncInventoryUi(inventory);
          uiRuntime.bagUiRuntime.handleItemCollected(DITTO_FLAG_ITEM_ID, storyState);
          syncQuestPanels();
        },
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
    },
    onDittoFlagPlacementRequested() {
      if (!storyState.flags.dittoFlagSelectedForHouse) {
        uiRuntime.pushNotice(`Open the bag with X and select the ${SANDBOTS_ITEM_NAMES.colonyFlag} first.`);
        return;
      }

      if (!storyState.flags.leafDenBuilt || !gameSession?.leafDen) {
        uiRuntime.pushNotice("The House needs to be complete before you can mark it.");
        return;
      }

      if (!hasItems(inventory, { [DITTO_FLAG_ITEM_ID]: 1 })) {
        uiRuntime.pushNotice(`You need a ${SANDBOTS_ITEM_NAMES.colonyFlag} in your bag.`);
        return;
      }

      gameSession.dittoFlag = attachPlayerPlacementSpawnEffect(buildDittoFlagPlacement());
      consumeItems(inventory, { [DITTO_FLAG_ITEM_ID]: 1 });
      storyState.flags.dittoFlagSelectedForHouse = false;
      uiRuntime.syncInventoryUi(inventory);
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
      storyBeats.complete(STORY_BEAT_IDS.DITTO_FLAG_PLACED_ON_HOUSE);
      syncQuestPanels();
    },
    onLogChairPlacementRequested({ playerPosition }) {
      if (!hasItems(inventory, { [LOG_CHAIR_ITEM_ID]: 1 })) {
        uiRuntime.pushNotice("You need a Log Chair before you can place it.");
        return;
      }

      gameSession.logChair = attachPlayerPlacementSpawnEffect(buildLogChairPlacement(playerPosition));
      consumeItems(inventory, { [LOG_CHAIR_ITEM_ID]: 1 });
      storyState.flags.logChairPlaced = true;
      uiRuntime.syncInventoryUi(inventory);
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_PLACE);
      uiRuntime.pushNotice("You placed the Log Chair.");
      syncQuestPanels();
    },
    onLogChairSitRequested() {
      if (!consumeLogChairSaveRequest()) {
        uiRuntime.pushNotice("Press X near the Log Chair to save.");
        return;
      }

      if (isLogChairSaveBlocked()) {
        uiRuntime.pushNotice("Save is busy. Wait for the current save to finish, then sit again.");
        return;
      }

      autosaveIndicator.show();
      uiRuntime.pushNotice("Saving Game...");
      storyState.flags.logChairSat = true;
      const saved = writeManualSavePoint({
        saveKind: "manual",
        savePointId: "logChair"
      });
      syncQuestPanels();
      windowRef.setTimeout(() => {
        uiRuntime.pushNotice(saved ? "saved." : "save failed.");
      }, 360);
      playBulbasaurWorkbenchGuideIntro();
    },
    onWorkbenchRecipesRequested() {
      storyBeats.playDialogue(STORY_BEAT_IDS.WORKBENCH_DIY_RECIPES, {
        onBeforeCompleteEffects: () => {
          if (!hasItems(inventory, { [SIMPLE_WOODEN_DIY_RECIPES_ITEM_ID]: 1 })) {
            addItems(inventory, { [SIMPLE_WOODEN_DIY_RECIPES_ITEM_ID]: 1 });
          }
          uiRuntime.syncInventoryUi(inventory);
          uiRuntime.bagUiRuntime.handleItemCollected(SIMPLE_WOODEN_DIY_RECIPES_ITEM_ID, storyState);
          syncQuestPanels();
          requestAutosave(AUTOSAVE_EVENT.MAJOR_SYSTEM_UNLOCKED, {
            systemId: "workbench"
          });
        },
        onComplete: syncQuestPanels
      });
    },
    onWorkbenchCraftOptionsRequested({ recipes }) {
      openWorkbenchCraftOptions(recipes);
    },
    onCampfireCraftRequested({ recipe }) {
      workbenchModal.open({
        recipe,
        onConfirm: () => {
          const crafted = craftCampfireAtWorkbench({
            storyState,
            inventory
          });
          if (crafted) {
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_SUCCESS);
            syncQuestPanels();
          }
          return crafted;
        }
      });
    },
    onCampfireCrafted() {
      uiRuntime.bagUiRuntime.handleItemCollected(CAMPFIRE_ITEM_ID, storyState);
      storyBeats.complete(STORY_BEAT_IDS.CAMPFIRE_CREATED);
      setPendingPlacementIntent({
        itemId: CAMPFIRE_ITEM_ID,
        placeableId: GRID_PLACEABLE_IDS.TRAIN_HOUSE,
        label: SANDBOTS_ITEM_NAMES.thermalCabin
      });
      syncQuestPanels();
    },
    onGreenhouseCrafted() {
      uiRuntime.bagUiRuntime.handleItemCollected(GREENHOUSE_ITEM_ID, storyState);
      requestGreenhousePlacementIntent();
      syncQuestPanels();
    },
    onGreenhousePlacementRequested({ playerPosition } = {}) {
      if (confirmGreenhousePlacementPreview()) {
        return;
      }

      const placementAnchor =
        Array.isArray(playerPosition) ?
          playerPosition :
          gameSession?.playerCharacter?.getPosition?.() || null;

      if (!Array.isArray(placementAnchor)) {
        requestGreenhousePlacementIntent();
        return;
      }

      startGreenhousePlacementPreview(placementAnchor);
    },
    onStrawBedCrafted() {
      uiRuntime.bagUiRuntime.handleItemCollected(STRAW_BED_ITEM_ID, storyState);
      storyBeats.complete(STORY_BEAT_IDS.STRAW_BED_CREATED);
      syncQuestPanels();
    },
    onStrawBedPlacementRequested({ placementTarget }) {
      const solarStationState = getSolarStationProgressState({ storyState, inventory });

      if (!solarStationState.inBag) {
        clearPendingPlacementIntent(STRAW_BED_ITEM_ID);
        uiRuntime.pushNotice("You need a Solar Station in your bag.");
        return;
      }

      setPendingPlacementIntent({
        itemId: STRAW_BED_ITEM_ID,
        placeableId: GRID_PLACEABLE_IDS.SOLAR_STATION,
        label: "Solar Station"
      });

      if (confirmStrawBedPlacementPreview()) {
        return;
      }

      if (!placementTarget?.center) {
        uiRuntime.pushNotice(`Move closer to ${SANDBOTS_BOT_NAMES.grow}'s restored tall grass colony zone.`);
        return;
      }

      startStrawBedPlacementPreview(placementTarget);
    },
    onBulbasaurStrawBedRequestCompleted() {
      storyBeats.playDialogue(STORY_BEAT_IDS.BULBASAUR_STRAW_BED_REQUEST_COMPLETE, {
        onComplete: syncQuestPanels
      });
    },
    onCampfireSpitOutRequested({ playerPosition = null } = {}) {
      if (confirmCampfirePlacementPreview()) {
        return;
      }

      if (!hasItems(inventory, { [CAMPFIRE_ITEM_ID]: 1 })) {
        uiRuntime.pushNotice(`You need the ${SANDBOTS_ITEM_NAMES.thermalCabin} in your bag.`);
        return;
      }

      const placementAnchor =
        Array.isArray(playerPosition) ?
          playerPosition :
          gameSession?.playerCharacter?.getPosition?.() || null;

      if (!Array.isArray(placementAnchor)) {
        uiRuntime.pushNotice(`Move into the world before placing the ${SANDBOTS_ITEM_NAMES.thermalCabin}.`);
        return;
      }

      startCampfirePlacementPreview(placementAnchor);
    },
    onRuinedPokemonCenterInspectRequested() {
      storyBeats.playDialogue(STORY_BEAT_IDS.RUINED_POKEMON_CENTER_INSPECTED, {
        onComplete: () => {
          dialogueCamera.restoreGameplayCamera();
          syncQuestPanels();
        }
      });
    },
    onPokemonCenterPcCheckRequested() {
      if (
        storyState.flags.ruinedPokemonCenterInspected &&
        !storyState.flags.challengesUnlocked
      ) {
        runPokemonCenterPcAction(POKEMON_CENTER_PC_ACTION.UNLOCK_CHALLENGES);
        return;
      }

      pokemonCenterPcModal.open({
        builderCallsign: playerMemory.playerName,
        missions: buildPokemonCenterPcMissionEntries(),
        onConfirm: (actionId) => runPokemonCenterPcAction(actionId)
      });
    },
    onGroundItemCollected({ itemId }) {
      uiRuntime.bagUiRuntime.handleItemCollected(itemId, storyState);
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
    },
    questSystem,
    habitatSystem,
    onTallGrassHabitatRestored({
      groundCell = null,
      restoredGrassHabitat = null,
      newlyDiscoveredHabitats = []
    } = {}) {
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_SUCCESS);
      playTallGrassMemorySequence({
        groundCell,
        restoredGrassHabitat,
        newlyDiscoveredHabitats
      });
    },
    onNaturePatchRevived({ patch, type }) {
      if (!gameSession?.natureRevivalEffects || !patch) {
        return;
      }

      startNatureRevivalEffect(gameSession.natureRevivalEffects, {
        patch,
        type
      });
    },
    onWaterGunImpactMotionRequested({ groundCell = null, patch = null, type = "ground" } = {}) {
      queueGroundActionFeedback({
        groundCells: groundCell,
        abilityId: "waterGun"
      });

      if (!gameSession?.natureRevivalEffects) {
        return;
      }

      const targetPatch = patch || (
        groundCell ?
          {
            id: `water-gun-impact-${groundCell.id}`,
            position: groundCell.offset || [0, 0, 0],
            size: [
              groundCell.tileSpan || groundCell.size?.[0] || 1,
              groundCell.tileSpan || groundCell.size?.[1] || 1
            ]
          } :
          null
      );

      if (!targetPatch) {
        return;
      }

      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_WATER);
      startNatureRevivalEffect(gameSession.natureRevivalEffects, {
        patch: targetPatch,
        type,
        maxSparks: 54,
        emitInterval: 0.035,
        scalePulse: 1.04
      });
    },
    onFlowerHabitatRestored({ restoredFlowerBedHabitat } = {}) {
      playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_SUCCESS);
      if (
        !gameSession?.natureRevivalEffects ||
        restoredFlowerBedHabitat?.id !== WATER_GUN_FLOWER_FIELD_GROUP_ID
      ) {
        return;
      }

      const fieldPatches = (gameSession.groundFlowerPatches || []).filter((patch) => {
        return patch.habitatGroupId === WATER_GUN_FLOWER_FIELD_GROUP_ID;
      });
      const sparksPerPatch = Math.max(
        FLOWER_FIELD_COMPLETION_MIN_SPARKS_PER_PATCH,
        Math.min(
          FLOWER_FIELD_COMPLETION_MAX_SPARKS_PER_PATCH,
          Math.floor(FLOWER_FIELD_COMPLETION_SPARK_BUDGET / Math.max(1, fieldPatches.length))
        )
      );

      for (const patch of fieldPatches) {
        startNatureRevivalEffect(gameSession.natureRevivalEffects, {
          patch,
          type: "flower",
          maxSparks: sparksPerPatch,
          emitInterval: FLOWER_FIELD_COMPLETION_SPARK_INTERVAL
        });
      }
    },
    onLeppaTreeRevived() {
      windowRef.setTimeout(() => {
        autoStartBulbasaurDryGrassRequestFromTask();
      }, 0);
    },
    onLeppaTreeLeafageOptionsRequested() {
      leafageObjectModal.open({
        options: LEAFAGE_OBJECT_OPTIONS,
        selectedId: storyState.flags.leafageObjectId || "tallGrass",
        onSelect: (option) => {
          storyState.flags.leafageObjectId = option.id;
          uiRuntime.pushNotice(option.notice || `${SANDBOTS_BOT_NAMES.grow} changed ${SANDBOTS_ITEM_NAMES.growTool} object.`);
          syncQuestPanels();
          requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
            storyBeatId: "leppa-tree-leafage-options"
          });
        }
      });
    },
    onLeppaTreeWaterHintRequested() {
      flashLeppaTreeTaskHint();
    },
    getActiveQuest,
    hasItems,
    consumeItems,
    addItems,
    formatRequirementSummary,
    getItemLabel,
    findNearbyInteractable,
    findNearbyHarvestTarget,
    findNearbyGroundCell,
    purifyGroundCell,
    reviveGroundFlower,
    reviveGroundGrass,
    strikeNearbyPalm,
    waterNearbyPalm,
    syncInventoryUi: uiRuntime.syncInventoryUi,
    pushNotice: uiRuntime.pushNotice
  });
  installWorkbenchConsoleBridge();
  const dialogueCamera = createDialogueCameraController({
    camera: engine.camera,
    cameraOrbit: engine.cameraOrbit
  });
  uiRuntime.gameplayDialogue.setBeforeComplete?.(() => {
    dialogueCamera.restoreGameplayCamera();
  });

  sceneFlowRuntime = createSceneFlowRuntime({
    dom,
    appRoot,
    initialSceneId,
    sceneWorkbench,
    uiLayer: dom.uiLayer,
    gameplayUiVisibility: uiRuntime.gameplayUiVisibility,
    gameplayDialogue: uiRuntime.gameplayDialogue,
    camera: engine.camera,
    cameraOrbit: engine.cameraOrbit,
    createLazyUiModule: uiRuntime.createLazyUiModule,
    getGameSession: () => gameSession,
    playerMemory,
    pushNotice: uiRuntime.pushNotice,
    unlockPlayerSkill,
    unlockPokedexUi: uiRuntime.pokedexRuntime.unlock,
    setPokedexOverlayOpen: uiRuntime.pokedexRuntime.setOpen,
    startSaveSlots,
    onStartGame: handleStartGameSelection,
    onPlayerNameConfirmed(payload) {
      requestAutosave(AUTOSAVE_EVENT.PLAYER_NAME_CONFIRMED, payload);
    }
  });

  let gameplayCinematicInputActive = false;
  gameInput = createGameInputController({
    pressedKeys,
    cameraTurnKeys: engine.cameraTurnKeys,
    clearGameFlowInput,
    isPokedexOpen: () => uiRuntime.pokedexUiState.open,
    pokedexEntry: uiRuntime.pokedexEntry,
    sceneDirector: sceneFlowRuntime.sceneDirector,
    isBuilderPanelOpen: () => builderPanelOpen,
    setBuilderPanelOpen,
    requestHarvest: ({ source = null } = {}) => {
      harvestRequested = true;
      harvestRequestSource = source;
    },
    requestInteract: () => {
      interactRequested = true;
    },
    requestPauseToggle: toggleGamePaused,
    requestPokedexOpen: () => {
      uiRuntime.pokedexRuntime.setOpen(true);
    },
    requestSettingsOpen: () => {
      clearGameFlowInput();
      settingsMenu.open();
      if (!settingsUnlockAutosaved) {
        settingsUnlockAutosaved = true;
        requestAutosave(AUTOSAVE_EVENT.MAJOR_SYSTEM_UNLOCKED, {
          systemId: "settings"
        });
      }
    },
    requestFollowerCall: () => {
      followerCallRequested = true;
    },
    requestMoveCycle: cycleActiveFieldMove,
    shouldBagButtonInteract: shouldBagButtonInteractWithNearbyCharacter,
    shouldGamepadButtonHarvest: shouldGamepadButtonHarvestNearbyFieldAction,
    isWorkbenchModalOpen: () => (
      workbenchModal.isOpen() ||
      pokemonCenterPcModal.isOpen() ||
      leafageObjectModal.isOpen()
    ),
    handleWorkbenchModalKeydown: (event) => {
      if (leafageObjectModal.isOpen()) {
        return leafageObjectModal.handleKeydown(event);
      }

      if (pokemonCenterPcModal.isOpen()) {
        return pokemonCenterPcModal.handleKeydown(event);
      }

      return workbenchModal.handleKeydown(event);
    },
    isSettingsOpen: () => settingsMenu.isOpen(),
    handleSettingsKeydown: (event) => settingsMenu.handleKeydown(event),
    isGameplayDialogueActive: () => uiRuntime.gameplayDialogue.isActive(),
    isGameplayCinematicInputActive: () => gameplayCinematicInputActive,
    inspectBag,
    getKeyboardControls: () => settingsState.controls?.keyboard,
    windowRef
  });

  windowRef.addEventListener("keydown", gameInput.handleKeydown);
  windowRef.addEventListener("keyup", gameInput.handleKeyup);
  windowRef.addEventListener("pointermove", gameInput.handlePointerMove);

  const gameAppController = createGameAppController({
    createGameSession,
    sessionConfig: {
      gl: engine.gl,
      setStatus: uiRuntime.setStatus,
      camera: engine.camera,
      cameraOrbit: engine.cameraOrbit,
      worldTextureFactory: engine.worldTextureFactory,
      pressedKeys,
      getAnalogMovement: gameInput.getAnalogMovement,
      isRunActive: gameInput.isRunActive,
      consumeJumpRequest: gameInput.consumeJumpRequest,
      storyState,
      inventory,
      resetGameplayRuntimeState,
      syncInventoryUi: uiRuntime.syncInventoryUi,
      syncHudMeta: uiRuntime.syncHudMeta,
      syncHudInstructions: uiRuntime.syncHudInstructions,
      renderMissionCards: uiRuntime.renderMissionCards,
      clearGameFlowInput,
      launchMode: effectiveLaunchMode,
      initialSceneId,
      startScreen: sceneFlowRuntime.startScreen,
      introSequence: sceneFlowRuntime.introSequence
    },
    startGameLoop,
    loopConfig: {
      camera: engine.camera,
      mount: dom.renderFrame,
      fpsPanel: dom.fpsPanel,
      inputModalityPanel: dom.inputModalityPanel,
      worldCanvas: dom.worldCanvas,
      worldRenderer: engine.worldRenderer,
      worldSpeech: uiRuntime.worldSpeech,
      colliderGizmos: uiRuntime.colliderGizmos,
      groundCellHighlight: uiRuntime.groundCellHighlight,
      gameplayDialogue: uiRuntime.gameplayDialogue,
      dialogueCamera,
      gameFlowValues: sceneFlowRuntime.gameFlowValues,
      isGameFlow: sceneFlowRuntime.sceneDirector.is.bind(sceneFlowRuntime.sceneDirector),
      actTwoSequence: sceneFlowRuntime.actTwoSequence,
      actTwoTutorial: sceneFlowRuntime.actTwoTutorial,
      pokedexUiState: uiRuntime.pokedexUiState,
      controls: {
        cameraTurnKeys: engine.cameraTurnKeys,
        consumeCameraLookDelta: gameInput.consumeCameraLookDelta,
        clearCameraLookInput: gameInput.clearCameraLookInput,
        updateGamepads: gameInput.updateGamepads,
        getInputModalityState: gameInput.getInputModalityState,
        isPaused: () => gamePaused,
        isSkillLearnActive: () => uiRuntime.skillLearnOverlay.isActive(),
        isScriptedInteractionActive: () => scriptedInteractionActive,
        isPrimaryActionActive: gameInput.isPrimaryActionActive,
        isCinematicSkipActionActive: gameInput.isCinematicSkipActionActive,
        setGameplayCinematicInputActive(active) {
          gameplayCinematicInputActive = Boolean(active);
        },
        shouldBagButtonInteract: shouldBagButtonInteractWithNearbyCharacter,
        getActiveMoveId: getActiveFieldMoveId,
        setActiveMoveId: setActiveFieldMove,
        getFieldMoveSwitchPrompt(nowMs = getRuntimeNow()) {
          if (!fieldMoveSwitchPrompt || fieldMoveSwitchPrompt.expiresAt <= nowMs) {
            fieldMoveSwitchPrompt = null;
            return null;
          }

          return fieldMoveSwitchPrompt;
        },
        inventory,
        playerSkills,
        storyState,
        isBuilderPanelOpen: () => builderPanelOpen,
        clearPendingActions() {
          harvestRequested = false;
          harvestRequestSource = null;
          interactRequested = false;
          followerCallRequested = false;
        },
        clearMovementInput() {
          pressedKeys.clear();
          engine.cameraTurnKeys.clear();
          gameInput.clearCameraLookInput();
        },
        getPlacementMovementInput() {
          const analogMovement = gameInput.getAnalogMovement?.() || { x: 0, y: 0 };
          return {
            horizontal:
              (pressedKeys.has("d") ? 1 : 0) -
              (pressedKeys.has("a") ? 1 : 0) +
              Number(analogMovement.x || 0),
            vertical:
              (pressedKeys.has("w") ? 1 : 0) -
              (pressedKeys.has("s") ? 1 : 0) -
              Number(analogMovement.y || 0)
          };
        },
        consumeHarvestRequest() {
          if (!harvestRequested) {
            return false;
          }

          harvestRequested = false;
          const source = harvestRequestSource;
          harvestRequestSource = null;
          return { source };
        },
        consumeInteractRequest() {
          if (!interactRequested) {
            return false;
          }

          interactRequested = false;
          return true;
        },
        consumeDestroyActionRequest() {
          return gameInput.consumeDestroyActionRequest();
        },
        consumeFollowerCallRequest() {
          if (!followerCallRequested) {
            return false;
          }

          followerCallRequested = false;
          return true;
        },
        onGardenProgressChanged({ actionType = null, groundCellId = null } = {}) {
          if (
            actionType === "waterGun" &&
            storyState.flags.firstRequiredTaughtActionComplete &&
            !storyState.flags.firstRequiredTaughtActionAutosaved
          ) {
            storyState.flags.firstRequiredTaughtActionAutosaved = true;
            requestAutosave(AUTOSAVE_EVENT.FIRST_REQUIRED_ABILITY_USE, {
              actionId: storyState.flags.firstRequiredTaughtActionId || "water-dry-grass"
            }, { silent: true });
          } else if (actionType === "fire") {
            requestAutosave(AUTOSAVE_EVENT.STORY_STEP_ADVANCED, {
              actionId: "fire-white-ground",
              groundCellId
            }, { silent: true });
          }
        },
        onCharmanderCampfireLit() {
          storyBeats.playDialogue(STORY_BEAT_IDS.CHARMANDER_CAMPFIRE_LIT, {
            onComplete: () => {
              startRuinedPokemonCenterGuide();
              syncQuestPanels();
            }
          });
        },
        completeLeafDenConstructionIfReady,
        consumeCameraZoomCycleRequest: gameInput.consumeCameraZoomCycleRequest,
        consumeFreeBlockBuildRequest: gameInput.consumeFreeBlockBuildRequest,
        consumePlacementRotationRequest: gameInput.consumePlacementRotationRequest
      },
      cameraOrbit: engine.cameraOrbitConfig,
      cameraZoomPresets: ACT_TWO_PLAYER_CAMERA_ZOOM_PRESETS,
      gameplay: {
        buildNearbyPrompt,
        collectLeppaBerryDrops(playerPosition, leppaBerryDrops, inventoryState) {
          const collectedLeppaBerryCount = collectLeppaBerryDropItems(
            playerPosition,
            leppaBerryDrops,
            inventoryState,
            storyState
          );

          if (collectedLeppaBerryCount > 0) {
            uiRuntime.bagUiRuntime.handleItemCollected(LEPPA_BERRY_ITEM_ID, storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: LEPPA_BERRY_ITEM_ID,
              amount: collectedLeppaBerryCount
            });
            syncQuestPanels();
          }

          return collectedLeppaBerryCount;
        },
        collectWoodDrops(playerPosition, woodDrops, inventoryState) {
          const collectedWoodCount = collectWoodDrops(playerPosition, woodDrops, inventoryState);

          if (collectedWoodCount > 0) {
            const activeQuestBeforeCollection = questSystem.getActiveQuest();
            const previousWoodQuestProgress = getQuestObjectiveProgress(
              activeQuestBeforeCollection,
              QUEST_EVENT.COLLECT,
              "wood"
            );
            uiRuntime.bagUiRuntime.handleItemCollected("wood", storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            const questResult = questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: "wood",
              amount: collectedWoodCount
            });
            const updatedQuest = activeQuestBeforeCollection?.id ?
              questSystem.getQuest(activeQuestBeforeCollection.id) :
              null;
            pushErrandQuestProgressFeedback(activeQuestBeforeCollection, {
              previousProgress: previousWoodQuestProgress,
              nextProgress: getQuestObjectiveProgress(updatedQuest, QUEST_EVENT.COLLECT, "wood"),
              completed: questResult.completedQuestIds.includes(activeQuestBeforeCollection?.id)
            });
            recordBulbasaurSturdyStickChallengeProgress(collectedWoodCount);
          }

          return collectedWoodCount;
        },
        collectLeafDrops(playerPosition, fieldDrops, inventoryState) {
          const collectedLeafCount = collectLeafDrops(playerPosition, fieldDrops, inventoryState);

          if (collectedLeafCount > 0) {
            uiRuntime.bagUiRuntime.handleItemCollected(LEAVES_ITEM_ID, storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: LEAVES_ITEM_ID,
              amount: collectedLeafCount
            });
            syncQuestPanels();
          }

          return collectedLeafCount;
        },
        collectLeafResourceNodes(playerPosition, resourceNodes, inventoryState) {
          const collectedLeafCount = collectLeafResourceNodeItems(
            playerPosition,
            resourceNodes,
            storyState,
            inventoryState
          );

          if (collectedLeafCount > 0) {
            uiRuntime.bagUiRuntime.handleItemCollected(LEAVES_ITEM_ID, storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: LEAVES_ITEM_ID,
              amount: collectedLeafCount
            });
            syncQuestPanels();
          }

          return collectedLeafCount;
        },
        collectCarbonResourceNodes(playerPosition, resourceNodes, inventoryState) {
          const collectedCarbonCount = collectCarbonResourceNodeItems(
            playerPosition,
            resourceNodes,
            storyState,
            inventoryState
          );

          if (collectedCarbonCount > 0) {
            uiRuntime.bagUiRuntime.handleItemCollected(CARBON_ITEM_ID, storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: CARBON_ITEM_ID,
              amount: collectedCarbonCount
            });
            syncQuestPanels();
          }

          return collectedCarbonCount;
        },
        collectGearResourceNodes(playerPosition, resourceNodes, inventoryState) {
          const collectedGearCount = collectGearResourceNodeItems(
            playerPosition,
            resourceNodes,
            storyState,
            inventoryState
          );

          if (collectedGearCount > 0) {
            uiRuntime.bagUiRuntime.handleItemCollected(GEAR_ITEM_ID, storyState);
            playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_COLLECT);
            questSystem.emit({
              type: QUEST_EVENT.COLLECT,
              targetId: GEAR_ITEM_ID,
              amount: collectedGearCount
            });
            syncQuestPanels();
          }

          return collectedGearCount;
        },
        findNearbyActionTarget,
        findNearbyInteractable,
        getActiveQuest,
        getActiveSystemQuest() {
          return questSystem.getActiveQuest();
        },
        getQuestCompletionPop,
        getItemLabel,
        performHarvestAction,
        performInteractAction,
        isLeppaTreeTileHintFlashing() {
          return leppaTreeTileHintFlashUntil > getRuntimeNow();
        },
        recordQuestEvent(event) {
          return questSystem.emit(event);
        },
        tangrowthOpeningLine: TANGROWTH_OPENING_LINE,
        syncLeppaTreeState,
        updatePalmShake,
        updateResourceNodes,
        audioMixRuntime,
        musicRuntime,
        playSoundEvent
      },
      hud: {
        getNoticeMessage: uiRuntime.getNoticeMessage,
        pushNotice: uiRuntime.pushNotice,
        renderMissionCards: uiRuntime.renderMissionCards,
        setStatus: uiRuntime.setStatus,
        syncQuestFocus: uiRuntime.syncQuestFocus,
        syncHudInstructions: uiRuntime.syncHudInstructions,
        syncHudMeta: uiRuntime.syncHudMeta,
        syncInventoryUi: uiRuntime.syncInventoryUi,
        updateTransientNotice: uiRuntime.updateTransientNotice
      },
      gameplayUiVisibility: uiRuntime.gameplayUiVisibility,
      rendering: {
        ...engine.rendering,
        get debugColliders() {
          return runtimeFlags.debugColliders;
        },
        isNpcActive,
        isInteractableActive,
        isResourceNodeActive
      }
    },
    onSessionReady(session) {
      gameSession = session;
      if (manualSavePoint) {
        applyManualSavePointToSession(manualSavePoint, session);
      }
      if (sceneFlowRuntime.sceneDirector.is(GAME_FLOW.INTRO)) {
        sceneFlowRuntime.activateIntroRoomScene(session.introRoomScene);
        sceneFlowRuntime.scheduleIntroSequenceStart(session.introRoomScene);
      }
      if (sceneFlowRuntime.sceneDirector.is(GAME_FLOW.TUTORIAL)) {
        session.spawnActTwoPlayer?.();
        if (session.actTwoSquirtle) {
          session.actTwoSquirtle.recovered = false;
          session.actTwoSquirtle.visible = false;
          session.actTwoSquirtle.assemblyState = "hidden";
          if (session.actTwoSquirtle.reassembly) {
            session.actTwoSquirtle.reassembly.active = false;
            session.actTwoSquirtle.reassembly.elapsed = 0;
            session.actTwoSquirtle.reassembly.progress = 0;
            session.actTwoSquirtle.reassembly.onComplete = null;
          }
        }
      }
      if (sceneFlowRuntime.sceneDirector.is(GAME_FLOW.GAMEPLAY)) {
        const shouldDelayGameplayHud = !session.playerCharacter;
        if (!session.playerCharacter) {
          session.gameplayOpeningRequested = true;
        }
        if (dom.uiLayer instanceof HTMLElement) {
          dom.uiLayer.dataset.mode = "game";
        }
        uiRuntime.gameplayDialogue.close?.();
        uiRuntime.gameplayUiVisibility.hideAll?.();
        uiRuntime.gameplayUiVisibility.showSections?.(
          shouldDelayGameplayHud ?
            GAMEPLAY_DEFAULT_UI_SECTIONS.filter((sectionId) => sectionId !== "hud") :
            GAMEPLAY_DEFAULT_UI_SECTIONS
        );
        if (runtimeFlags.debugColliders) {
          uiRuntime.pushNotice("Collider gizmos enabled.");
        }
        if (shouldRecoverBulbasaurWorkbenchGuide()) {
          windowRef.setTimeout?.(() => {
            playBulbasaurWorkbenchGuideIntro();
          }, 0);
        }
      }
      applyLaunchModeRuntime(effectiveLaunchMode, {
        session,
        startScreen: sceneFlowRuntime.startScreen,
        introSequence: sceneFlowRuntime.introSequence,
        clearGameFlowInput,
        unlockPlayerSkill,
        unlockPokedexUi: uiRuntime.pokedexRuntime.unlock,
        setPokedexSeen: uiRuntime.pokedexRuntime.setSeen,
        playerMemory
      });
    }
  });

  function warmDeferredUiModules() {
    if (effectiveLaunchMode === LAUNCH_MODE.HANDBOOK) {
      scheduleIdleTask(windowRef, () => {
        void uiRuntime.guidePanel.preload();
      }, 400);
    }

    scheduleIdleTask(windowRef, () => {
      void uiRuntime.pokedexEntry.preload();
    }, 900);

    if (initialSceneId === GAME_FLOW.GAMEPLAY) {
      return;
    }

    scheduleIdleTask(windowRef, () => {
      void sceneFlowRuntime.introSequence.preload();
    }, 1100);
    scheduleIdleTask(windowRef, () => {
      void sceneFlowRuntime.actTwoSequence.preload();
    }, 1500);
    scheduleIdleTask(windowRef, () => {
      void sceneFlowRuntime.actTwoTutorial.preload();
    }, 1900);
  }

  return {
    async start() {
      try {
        await gameAppController.start();
        if (
          sceneFlowRuntime.sceneDirector?.is(GAME_FLOW.START) &&
          sceneFlowRuntime.startScreen.isActive()
        ) {
          sceneFlowRuntime.startScreen.start();
        }
        markAppReady(appRoot, "ready", effectiveLaunchMode);
        warmDeferredUiModules();
      } catch (error) {
        console.error(error);
        reportStatus(error.message || "Failed to load scene.", true);
        markAppReady(appRoot, "error", effectiveLaunchMode);
      }
    }
  };
}
