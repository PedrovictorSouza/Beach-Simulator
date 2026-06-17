import { createPlayerMovementFrameRuntime } from "./playerMovementFrame.js";
import { createPlayerModelRuntime } from "./playerModelMotion.js";
import { createPlayerResourceCollectionFrameRuntime } from "./playerResourceCollectionFrame.js";
import { COLONY_FEEDBACK_IDS } from "../gameplay/colonyFeedbackContracts.js";
import { SANDBOTS_BOT_NAMES, SANDBOTS_ITEM_NAMES } from "../story/sandbotsLexicon.js";
import {
  CARBON_ITEM_ID,
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID,
  LEPPA_BERRY_ITEM_ID
} from "../../gameplayContent.js";

const DEFAULT_ITEM_IDS = Object.freeze({
  wood: "wood",
  leaves: "leaves",
  gear: "gear",
  carbon: "carbon",
  leppaBerry: "leppaBerry"
});

const DEFAULT_LABELS = Object.freeze({
  leaves: "Leaves",
  gear: "Gear",
  carbon: "Carbon",
  leppaBerry: "Pulse Berry"
});

export function createGameplayPlayerFrameRuntimeBundle({
  config = {},
  soundEventIds = {},
  createRuntimeBundle = createPlayerFrameRuntimeBundle,
  ...options
} = {}) {
  const {
    botNames = {},
    colonyFeedbackIds = {},
    itemIds = {},
    labels = {},
    movementQuestId,
    soundEventIds: configSoundEventIds = {},
    ...restConfig
  } = config;

  return createRuntimeBundle({
    ...options,
    config: {
      ...restConfig,
      botNames: {
        ...SANDBOTS_BOT_NAMES,
        ...botNames
      },
      colonyFeedbackIds: {
        habitatCheckComplete: COLONY_FEEDBACK_IDS.HABITAT_CHECK_COMPLETE,
        ...colonyFeedbackIds
      },
      itemIds: {
        wood: "wood",
        leaves: LEAVES_ITEM_ID,
        gear: GEAR_ITEM_ID,
        carbon: CARBON_ITEM_ID,
        leppaBerry: LEPPA_BERRY_ITEM_ID,
        ...itemIds
      },
      labels: {
        leaves: "Leaves",
        gear: "Gear",
        carbon: "Carbon",
        leppaBerry: SANDBOTS_ITEM_NAMES.pulseBerry,
        ...labels
      },
      movementQuestId: movementQuestId ?? "learn-to-move",
      soundEventIds: {
        gameplayJump: soundEventIds.GAMEPLAY_JUMP,
        ...configSoundEventIds
      }
    }
  });
}

export function createPlayerFrameRuntimeBundle({
  audio = {},
  camera = null,
  cameraOrbit = null,
  cameraZoomPresetController = null,
  controls = {},
  createModelRuntime = createPlayerModelRuntime,
  createMovementRuntime = createPlayerMovementFrameRuntime,
  createResourceCollectionRuntime = createPlayerResourceCollectionFrameRuntime,
  gameplay = {},
  hud = {},
  policies = {},
  runtimes = {},
  callbacks = {},
  config = {},
  math = {},
  session = {}
} = {}) {
  const {
    companionFollowDirectionRuntime = null,
    gearPickupParticleRuntime = null,
    movementQuestRuntime = null,
    runBreadcrumbPromptRuntime = null,
    woodCollectPopRuntime = null
  } = runtimes;
  const {
    getColonyFeedbackNotice = () => "",
    playSoundEvent = () => {},
    pushSupplyResourceCollectFeedback = () => {},
    queueSupplyPickupFlyItems = () => {},
    restoreActiveZoomPresetOnMovement = () => {},
    triggerSupplyCounterPrompt = () => {}
  } = callbacks;
  const {
    botNames = {},
    colonyFeedbackIds = {},
    itemIds = {},
    labels = {},
    movementQuestId = "learn-to-move",
    soundEventIds = {}
  } = config;

  const resolvedItemIds = {
    ...DEFAULT_ITEM_IDS,
    ...itemIds
  };
  const resolvedLabels = {
    ...DEFAULT_LABELS,
    ...labels
  };

  const playerModelRuntime = createModelRuntime({
    moveValueToward: math.moveValueToward,
    rotateAngleToward: math.rotateAngleToward,
    playJumpSound: () => playSoundEvent(soundEventIds.gameplayJump)
  });

  const playerMovementFrameRuntime = createMovementRuntime({
    session,
    movementPolicy: {
      resolvePlayerMovementPermission: policies.resolvePlayerMovementPermission
    },
    model: playerModelRuntime,
    followDirection: companionFollowDirectionRuntime,
    movementQuest: movementQuestRuntime,
    runBreadcrumbPrompt: runBreadcrumbPromptRuntime,
    callbacks: {
      isMovementQuestActive: () => gameplay.getActiveSystemQuest?.()?.id === movementQuestId,
      isRunActive: () => controls.isRunActive?.(),
      reportMovement: () => gameplay.recordQuestEvent?.({
        type: "MOVE",
        targetId: "player"
      }),
      onPlayerMoved: ({
        movedDistance,
        nextPlayerPosition,
        gameplayOpeningCameraLocked,
        foundationBuildZoneCameraFocusActive,
        tutorialActive
      }) => {
        if (
          movedDistance > 0.0005 &&
          !tutorialActive &&
          !gameplayOpeningCameraLocked &&
          !foundationBuildZoneCameraFocusActive
        ) {
          restoreActiveZoomPresetOnMovement({
            playerPosition: nextPlayerPosition,
            camera,
            cameraOrbit,
            cameraZoomPresetController
          });
        }
      }
    }
  });

  const playerResourceCollectionFrameRuntime = createResourceCollectionRuntime({
    session,
    controls,
    gameplay,
    itemIds: resolvedItemIds,
    labels: resolvedLabels,
    feedback: {
      triggerWoodCollectPop: (woodDropSnapshots) =>
        woodCollectPopRuntime?.trigger?.(woodDropSnapshots),
      playWoodGrab: (options) => audio.playWoodGrab?.(options),
      syncInventoryUi: (inventory) => hud.syncInventoryUi?.(inventory),
      queueSupplyPickupFlyItems,
      pushNotice: (notice) => hud.pushNotice?.(notice),
      triggerSupplyCounterPrompt,
      pushSupplyResourceCollectFeedback,
      triggerGearPickupParticles: (positions) =>
        gearPickupParticleRuntime?.trigger?.(positions),
      getHabitatCheckCompleteNotice: () =>
        getColonyFeedbackNotice(colonyFeedbackIds.habitatCheckComplete, {
          growBotName: botNames.grow
        })
    }
  });

  return {
    playerModelRuntime,
    playerMovementFrameRuntime,
    playerResourceCollectionFrameRuntime
  };
}
