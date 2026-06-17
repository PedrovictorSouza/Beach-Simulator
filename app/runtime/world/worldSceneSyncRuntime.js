import { updateLeppaTreeMusicNotes } from "../leppaTreeMusicNotes.js";
import { updateLeppaTreeDance } from "../presentation/leppaTreeDance.js";
import { updateSnowstormParticleField } from "../../session/snowstormParticleField.js";

export function syncModelResourceInstances(resourceNodes = [], storyState = {}, deltaTime = 0) {
  for (const resourceNode of resourceNodes) {
    if (!resourceNode?.usesModelInstance) {
      continue;
    }

    resourceNode.offset = Array.isArray(resourceNode.position) ?
      [...resourceNode.position] :
      resourceNode.offset;
    resourceNode.active =
      Number(resourceNode.cooldown || 0) <= 0 &&
      (typeof resourceNode.activeWhen !== "function" || resourceNode.activeWhen(storyState));

    const spinYawSpeed = Number(resourceNode.spinYawSpeed || 0);
    if (resourceNode.active && Number.isFinite(spinYawSpeed) && spinYawSpeed !== 0) {
      resourceNode.yaw = Number(resourceNode.yaw || 0) + spinYawSpeed * Math.max(0, deltaTime);
    }
  }
}

export function createWorldSceneSyncRuntime({
  session = {},
  controls = {},
  camera = {},
  config = {},
  hud = {},
  gameplay = {},
  ambient = {},
  sources = {}
} = {}) {
  const {
    updateLandscapeCutEffect = () => {},
    updateSnowstormFog = () => {}
  } = ambient;
  const {
    updateSnowstormParticleField: updateSnowstormParticleFieldSource = updateSnowstormParticleField,
    updateLeppaTreeDance: updateLeppaTreeDanceSource = updateLeppaTreeDance,
    updateLeppaTreeMusicNotes: updateLeppaTreeMusicNotesSource = updateLeppaTreeMusicNotes,
    syncModelResourceInstances: syncModelResourceInstancesSource = syncModelResourceInstances,
    clearInteractionObjectHighlights = () => {}
  } = sources;

  function syncInteractablePosition(interactableId, position) {
    if (!Array.isArray(position) || !Array.isArray(session.interactables)) {
      return;
    }

    const interactable = session.interactables.find((entry) => entry.id === interactableId);
    if (interactable) {
      interactable.position = [...position];
    }
  }

  function syncWorkbenchInteractable() {
    syncInteractablePosition("workbench", config.workbenchPosition);
    const workbench = session.interactables?.find((entry) => entry.id === "workbench");
    if (workbench) {
      workbench.interactDistance = config.workbenchInteractDistance;
    }
  }

  function syncPokemonCenterWorkshopVisualState() {
    const assembled = Boolean(controls.storyState?.flags?.challengesUnlocked);

    if (session.pokemonCenterWorkshopAssembledInstance) {
      session.pokemonCenterWorkshopAssembledInstance.active = assembled;
    }

    for (const instance of session.pokemonCenterWorkshopDismantledInstances || []) {
      instance.active = !assembled;
    }
  }

  function isPlayerNearWorldPosition(worldPosition, distance) {
    const playerPosition = session.playerCharacter?.getPosition?.();

    if (!Array.isArray(playerPosition) || !Array.isArray(worldPosition)) {
      return false;
    }

    return Math.hypot(
      playerPosition[0] - worldPosition[0],
      playerPosition[2] - worldPosition[2]
    ) <= distance;
  }

  function updateEarlySceneFrame(deltaTime = 0) {
    camera.resizeCanvases?.();
    camera.update?.(deltaTime);
    clearInteractionObjectHighlights(session);
    syncWorkbenchInteractable();
    syncPokemonCenterWorkshopVisualState();
  }

  function updateAmbientWorldFrame({ deltaTime = 0, now = 0 } = {}) {
    hud.updateTransientNotice?.(deltaTime);
    gameplay.updatePalmShake?.(deltaTime, session.palmInstances);
    gameplay.updateResourceNodes?.(deltaTime, session.resourceNodes);
    gameplay.updateResourceNodes?.(deltaTime, session.woodDrops);
    updateLandscapeCutEffect(deltaTime);
    syncModelResourceInstancesSource(session.resourceNodes, controls.storyState, deltaTime);
    session.updateCloudAtmosphere?.(deltaTime);
    updateSnowstormParticleFieldSource(session.snowstorm, {
      deltaTime,
      playerPosition: session.playerCharacter?.getPosition?.() || null
    });
    updateSnowstormFog({ session, deltaTime });
    gameplay.syncLeppaTreeState?.(session.leppaTree, controls.storyState);
    updateLeppaTreeDanceSource({ leppaTree: session.leppaTree, now });
    updateLeppaTreeMusicNotesSource({
      leppaTree: session.leppaTree,
      textures: session.leppaTreeMusicalNoteTextures,
      deltaTime
    });
  }

  return {
    isPlayerNearWorldPosition,
    syncInteractablePosition,
    updateEarlySceneFrame,
    updateAmbientWorldFrame,
    syncPokemonCenterWorkshopVisualState,
    syncWorkbenchInteractable
  };
}
