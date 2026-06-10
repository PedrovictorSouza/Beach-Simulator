import { SANDBOTS_BOT_NAMES } from "../../story/sandbotsLexicon.js";
import {
  PLAYER_INTERACTION_WORLD_PROMPT_TARGET_IDS
} from "../gameplayPresentationTuning.js";
import { getNearbyRepairBoxPrompt } from "../repairBoxPromptTargets.js";
import {
  findNearbyDryGrassHintTarget,
  findNearbyDryGrassWorldPromptTarget
} from "./dryGrassPromptTargets.js";
import {
  getFieldToolWorldPromptText,
  getPlayerInteractionWorldPromptText,
  getRunBreadcrumbWorldPromptText,
  resolveWorldPromptVisibility
} from "./worldPromptCopy.js";

function getPlayerPosition(session) {
  return session.playerCharacter?.getPosition?.();
}

export function resolveWorldPromptFrameState({
  activeMoveId = null,
  activeQuest = null,
  activeTask = null,
  activeSystemQuest = null,
  buildBlockEquipped = false,
  canShowWorldSpaceUi = false,
  controls = {},
  session = {},
  now = 0,
  inputModalityState = null,
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  pendingPlacementPrompt = "",
  workbenchRotationPrompt = "",
  destroyableObjectPrompt = null,
  freeBlockPreviewTarget = null,
  transientNoticeRoute = null,
  playerCounterPromptText = "",
  waterGunEquipped = false,
  leafageEquipped = false,
  nearbyInteractable = null,
  tangrowthPosition = null,
  repairBoxPromptDistance = Infinity,
  waterGunFirstUsePromptDismissed = false,
  dryGrassHydroMissionActive = false,
  openingLeppaTreeRequestActive = false,
  getEncounterRepairBoxPosition = () => null,
  getLeppaTreeSurroundingGroundCells = () => [],
  getSquirtleWorldPosition = () => null,
  isSquirtleWaterCharging = () => false,
  getFreeBlockBuildCostMarker = () => null,
  getPeriodicChopperAttentionCue = () => null,
  isLeafageInvalidTargetVisible = () => false,
  isFireInvalidTargetVisible = () => false,
  isRunBreadcrumbVisible = () => false
} = {}) {
  const playerPosition = getPlayerPosition(session);
  const hasPlayerCharacter = Boolean(session.playerCharacter);
  const nearbyRepairBoxPrompt = getNearbyRepairBoxPrompt({
    playerPosition,
    repairBoxTargets: [
      {
        name: SANDBOTS_BOT_NAMES.hydro,
        encounter: session.actTwoSquirtle
      },
      {
        name: SANDBOTS_BOT_NAMES.grow,
        encounter: session.bulbasaurEncounter
      },
      {
        name: SANDBOTS_BOT_NAMES.thermal,
        encounter: session.charmanderEncounter
      },
      {
        name: SANDBOTS_BOT_NAMES.builder,
        encounter: session.timburrEncounter
      }
    ],
    promptDistance: repairBoxPromptDistance,
    getEncounterRepairBoxPosition
  });
  const waterGunFirstUsePromptVisible =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    controls.playerSkills?.waterGun &&
    activeMoveId === "waterGun" &&
    !waterGunFirstUsePromptDismissed &&
    !controls.isPrimaryActionActive?.();
  const leafageFirstUsePromptVisible =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    controls.playerSkills?.leafage &&
    !controls.storyState?.flags?.leafageTallGrassCount &&
    !controls.storyState?.flags?.leafageTallGrassHabitatCreated &&
    !controls.isPrimaryActionActive?.();
  const squirtleChargingPosition = getSquirtleWorldPosition();
  const squirtleWaterCharging =
    canShowWorldSpaceUi &&
    isSquirtleWaterCharging();
  const leafageInvalidTargetVisible =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    isLeafageInvalidTargetVisible(now);
  const fireInvalidTargetVisible =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    isFireInvalidTargetVisible(now);
  const fieldMoveSwitchPrompt = controls.getFieldMoveSwitchPrompt?.(now) || null;
  const freeBlockBuildCostMarker =
    canShowWorldSpaceUi && buildBlockEquipped ?
      getFreeBlockBuildCostMarker(freeBlockPreviewTarget) :
      null;
  const isPlayerInteractionPromptTarget =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    PLAYER_INTERACTION_WORLD_PROMPT_TARGET_IDS.has(nearbyInteractable?.target?.id);
  const nearbyDryGrassWorldPromptTarget =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    waterGunEquipped &&
    dryGrassHydroMissionActive ?
      findNearbyDryGrassWorldPromptTarget({
        playerPosition,
        groundGrassPatches: session.groundGrassPatches,
        groundDeadInstances: session.groundDeadInstances,
        groundPurifiedInstances: session.groundPurifiedInstances
      }) :
      null;
  const nearbyDryGrassHintTarget =
    canShowWorldSpaceUi &&
    hasPlayerCharacter ?
      findNearbyDryGrassHintTarget({
        playerPosition,
        groundGrassPatches: session.groundGrassPatches,
        leppaTree: session.leppaTree,
        groundDeadInstances: session.groundDeadInstances,
        openingLeppaTreeRequestActive,
        getLeppaTreeSurroundingGroundCells
      }) :
      null;
  const runBreadcrumbVisible =
    canShowWorldSpaceUi &&
    hasPlayerCharacter &&
    isRunBreadcrumbVisible(now);

  const visibility = resolveWorldPromptVisibility({
    canShowWorldSpaceUi,
    hasPlayerCharacter,
    nearbyRepairBoxPrompt,
    waterGunFirstUsePromptVisible,
    leafageFirstUsePromptVisible,
    squirtleWaterCharging,
    squirtleChargingPosition,
    leafageInvalidTargetVisible,
    fireInvalidTargetVisible,
    fieldMoveSwitchPrompt,
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    pendingPlacementPrompt,
    workbenchRotationPrompt,
    destroyableObjectPrompt,
    freeBlockBuildCostMarker,
    transientNoticeRoute,
    playerCounterPromptText,
    isPlayerInteractionPromptTarget,
    nearbyDryGrassWorldPromptTarget,
    runBreadcrumbVisible
  });
  const playerInteractionPromptText = visibility.shouldShowPlayerInteractionPrompt ?
    getPlayerInteractionWorldPromptText(inputModalityState) :
    "";
  const dryGrassHydroPromptText = visibility.shouldShowDryGrassHydroPrompt ?
    getFieldToolWorldPromptText(inputModalityState) :
    "";
  const runBreadcrumbPromptText = visibility.shouldShowRunBreadcrumbPrompt ?
    getRunBreadcrumbWorldPromptText(inputModalityState) :
    "";
  const chopperAttentionCue = canShowWorldSpaceUi ?
    getPeriodicChopperAttentionCue({
      activeTask,
      activeSystemQuest,
      chopperPosition: tangrowthPosition,
      now
    }) :
    null;

  return {
    ...visibility,
    nearbyRepairBoxPrompt,
    squirtleChargingPosition,
    fieldMoveSwitchPrompt,
    freeBlockBuildCostMarker,
    nearbyDryGrassWorldPromptTarget,
    nearbyDryGrassHintTarget,
    playerInteractionPromptText,
    dryGrassHydroPromptText,
    runBreadcrumbPromptText,
    chopperAttentionCue
  };
}
