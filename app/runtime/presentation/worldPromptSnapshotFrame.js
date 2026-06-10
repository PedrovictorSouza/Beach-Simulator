import { formatHabitatSiteChoicePrompt } from "../../gameplay/habitatSiteChoiceContract.js";
import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackPrompt
} from "../../gameplay/colonyFeedbackContracts.js";
import { setFrameWorldPrompt } from "../frameSnapshotController.js";
import {
  resolveInputPrompt,
  UI_PROMPT_ACTION
} from "../../ui/inputPromptResolver.js";
import { SANDBOTS_BOT_NAMES } from "../../story/sandbotsLexicon.js";
import { getPendingPlacementWorldPromptText } from "./worldPromptCopy.js";

const WATER_GUN_FIRST_USE_PROMPT_TEXT = `Press LT to use ${SANDBOTS_BOT_NAMES.hydro}`;
const LEAFAGE_SWITCH_PROMPT_TEXT = `Press LT on dry ground, then <- / -> to select ${SANDBOTS_BOT_NAMES.grow}`;
const LEAFAGE_USE_PROMPT_TEXT = "Use LT on green ground";
const LEAFAGE_INVALID_TARGET_PROMPT_TEXT = `Choose ${SANDBOTS_BOT_NAMES.hydro} to hydrate first`;
const FIRE_INVALID_TARGET_PROMPT_TEXT = "Use fire on white ground";

export function updateWorldPromptSnapshotFrame(nextFrame, {
  inputModalityState,
  playerPosition,
  shouldShowSolarStationPlacementPrompt,
  solarStationPlacementPreview,
  shouldShowDestroyableObjectPrompt,
  destroyableObjectPrompt,
  shouldShowGreenhousePlacementPrompt,
  greenhousePlacementPreview,
  shouldShowCampfirePlacementPrompt,
  campfirePlacementPreview,
  shouldShowLeafDenKitPlacementPrompt,
  leafDenKitPlacementPreview,
  shouldShowPendingPlacementPrompt,
  pendingPlacementIntent,
  nearbyHarvestTarget,
  shouldShowWorkbenchRotationPrompt,
  workbenchRotationPrompt,
  shouldShowFreeBlockBuildCostPrompt,
  freeBlockBuildCostMarker,
  shouldShowPlayerCounterPrompt,
  playerCounterPromptText,
  shouldShowFieldMoveSwitchPrompt,
  fieldMoveSwitchPrompt,
  shouldShowSquirtleChargingPrompt,
  squirtleChargingPosition,
  shouldShowInvalidLeafageUsePrompt,
  shouldShowInvalidFireUsePrompt,
  shouldShowTransientWorldPrompt,
  transientNoticeRoute,
  shouldShowDryGrassHydroPrompt,
  dryGrassHydroPromptText,
  shouldShowRunBreadcrumbPrompt,
  runBreadcrumbPromptText,
  shouldShowPlayerInteractionPrompt,
  playerInteractionPromptText,
  shouldShowRepairBoxPrompt,
  nearbyRepairBoxPrompt,
  shouldShowLeafageFirstUsePrompt,
  leafageEquipped,
  shouldShowWaterGunFirstUsePrompt
}) {
  if (shouldShowSolarStationPlacementPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "placement",
      target: "solarStation",
      valid: solarStationPlacementPreview.valid,
      text: solarStationPlacementPreview.valid ?
        resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
        getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
      worldPosition: solarStationPlacementPreview.snappedPosition
    });
  } else if (shouldShowDestroyableObjectPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "destroyableObject",
      text: destroyableObjectPrompt.promptCopy,
      worldPosition:
        destroyableObjectPrompt.worldPosition ||
        destroyableObjectPrompt.target?.worldPosition ||
        destroyableObjectPrompt.target?.position ||
        playerPosition
    });
  } else if (shouldShowGreenhousePlacementPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "placement",
      target: "greenhouse",
      valid: greenhousePlacementPreview.valid,
      text: greenhousePlacementPreview.valid ?
        resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
        getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
      worldPosition: greenhousePlacementPreview.snappedPosition
    });
  } else if (shouldShowCampfirePlacementPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "placement",
      target: "trainHouse",
      valid: campfirePlacementPreview.valid,
      text: campfirePlacementPreview.valid ?
        resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
        getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
      worldPosition: campfirePlacementPreview.snappedPosition
    });
  } else if (shouldShowLeafDenKitPlacementPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "placement",
      target: "houseKit",
      valid: leafDenKitPlacementPreview.valid,
      text: formatHabitatSiteChoicePrompt({
        siteChoice: leafDenKitPlacementPreview.siteChoice,
        placePrompt: resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState),
        clearPrompt: getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
        powerPrompt: getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_NEEDS_POWER)
      }),
      worldPosition: leafDenKitPlacementPreview.snappedPosition
    });
  } else if (shouldShowPendingPlacementPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "placementIntent",
      target: pendingPlacementIntent?.placeableId || pendingPlacementIntent?.itemId || "placement",
      valid: pendingPlacementIntent?.blockedReason !== "needs-solar-station",
      text: getPendingPlacementWorldPromptText(
        pendingPlacementIntent,
        nearbyHarvestTarget,
        inputModalityState
      ),
      worldPosition: playerPosition
    });
  } else if (shouldShowWorkbenchRotationPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "workbenchRotation",
      text: workbenchRotationPrompt,
      worldPosition: playerPosition
    });
  } else if (shouldShowFreeBlockBuildCostPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: freeBlockBuildCostMarker.affordable ? "buildCost" : "buildCostMissing",
      text: freeBlockBuildCostMarker.text,
      worldPosition: freeBlockBuildCostMarker.worldPosition
    });
  } else if (shouldShowPlayerCounterPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "counter",
      text: playerCounterPromptText,
      worldPosition: playerPosition
    });
  } else if (shouldShowFieldMoveSwitchPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "fieldMoveSwitch",
      html: fieldMoveSwitchPrompt.html,
      worldPosition: playerPosition
    });
  } else if (shouldShowSquirtleChargingPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "charging",
      companionId: "squirtle",
      abilityId: "waterGun",
      worldPosition: squirtleChargingPosition
    });
  } else if (shouldShowInvalidLeafageUsePrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "invalidMoveTarget",
      abilityId: "leafage",
      message: LEAFAGE_INVALID_TARGET_PROMPT_TEXT,
      worldPosition: playerPosition
    });
  } else if (shouldShowInvalidFireUsePrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "invalidMoveTarget",
      abilityId: "fire",
      message: FIRE_INVALID_TARGET_PROMPT_TEXT,
      worldPosition: playerPosition
    });
  } else if (shouldShowTransientWorldPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "transientNotice",
      text: transientNoticeRoute.worldPromptMessage,
      worldPosition: playerPosition
    });
  } else if (shouldShowDryGrassHydroPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "text",
      text: dryGrassHydroPromptText,
      worldPosition: playerPosition
    });
  } else if (shouldShowRunBreadcrumbPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "text",
      text: runBreadcrumbPromptText,
      worldPosition: playerPosition
    });
  } else if (shouldShowPlayerInteractionPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "text",
      text: playerInteractionPromptText,
      worldPosition: playerPosition
    });
  } else if (shouldShowRepairBoxPrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "repairBox",
      text: nearbyRepairBoxPrompt.text,
      worldPosition: nearbyRepairBoxPrompt.worldPosition
    });
  } else if (shouldShowLeafageFirstUsePrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "firstUse",
      abilityId: "leafage",
      text: leafageEquipped ? LEAFAGE_USE_PROMPT_TEXT : LEAFAGE_SWITCH_PROMPT_TEXT,
      worldPosition: playerPosition
    });
  } else if (shouldShowWaterGunFirstUsePrompt) {
    setFrameWorldPrompt(nextFrame, {
      kind: "firstUse",
      abilityId: "waterGun",
      text: WATER_GUN_FIRST_USE_PROMPT_TEXT,
      worldPosition: playerPosition
    });
  }
}
