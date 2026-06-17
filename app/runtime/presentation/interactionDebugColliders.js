import {
  POKEMON_TALK_INTERACT_DISTANCE,
  WORKBENCH_INTERACT_DISTANCE
} from "../../../gameplayContent.js";
import { BULBASAUR_TALK_INTERACT_DISTANCE } from "../../../world/islandWorld.js";

export function createDebugAreaCollider({
  id,
  position,
  radius,
  surfaceY = 0.08,
  blocksPlayer = false
} = {}) {
  if (!id || !Array.isArray(position) || !(radius > 0)) {
    return null;
  }

  return {
    id,
    position: [position[0], surfaceY, position[2]],
    size: [radius * 2, 0.12, radius * 2],
    surfaceY: surfaceY + 0.08,
    blocksPlayer
  };
}

export function getActorDebugPosition(actor) {
  const position =
    actor?.character?.getPosition?.() ||
    actor?.position ||
    actor?.offset ||
    null;
  return Array.isArray(position) ? position : null;
}

export function getInteractionDebugColliders({
  session,
  storyState,
  rendering,
  pokemonTalkInteractDistance,
  workbenchInteractDistance,
  bulbasaurTalkInteractDistance
} = {}) {
  const colliders = [];
  const pushCollider = (config) => {
    const collider = createDebugAreaCollider(config);
    if (collider) {
      colliders.push(collider);
    }
  };

  for (const npcActor of session?.npcActors || []) {
    if (rendering?.isNpcActive?.(npcActor, storyState) === false) {
      continue;
    }

    pushCollider({
      id: `${npcActor.id || "npc"}:talk-trigger`,
      position: getActorDebugPosition(npcActor),
      radius: Number(npcActor.interactDistance) || pokemonTalkInteractDistance,
      surfaceY: 0.1
    });
  }

  for (const interactable of session?.interactables || []) {
    if (rendering?.isInteractableActive?.(interactable, storyState) === false) {
      continue;
    }

    pushCollider({
      id: `${interactable.id || "object"}:interact-trigger`,
      position: interactable.position,
      radius: Number(interactable.interactDistance) || workbenchInteractDistance,
      surfaceY: 0.09
    });
  }

  for (const resourceNode of session?.resourceNodes || []) {
    if (rendering?.isResourceNodeActive?.(resourceNode, storyState) === false) {
      continue;
    }

    pushCollider({
      id: `${resourceNode.id || "resource"}:pickup-trigger`,
      position: resourceNode.position,
      radius: Number(resourceNode.pickupRadius || resourceNode.interactDistance) || 1.6,
      surfaceY: 0.07
    });
  }

  const growBotPosition =
    session?.bulbasaurEncounter?.visible && Array.isArray(session.bulbasaurEncounter.position) ?
      session.bulbasaurEncounter.position :
      null;
  pushCollider({
    id: "grow-bot:talk-trigger",
    position: growBotPosition,
    radius: bulbasaurTalkInteractDistance,
    surfaceY: 0.12
  });

  for (const drop of [
    ...(session?.woodDrops || []),
    ...(session?.fieldDrops || []),
    ...(session?.leppaBerryDrops || [])
  ]) {
    pushCollider({
      id: `${drop.id || drop.itemId || "drop"}:pickup-trigger`,
      position: drop.position,
      radius: Number(drop.pickupRadius) || 1.1,
      surfaceY: 0.06
    });
  }

  return colliders;
}

export function createGameplayInteractionDebugColliderProvider({
  session = {},
  getStoryState = () => ({}),
  rendering = {},
  getColliders = getInteractionDebugColliders
} = {}) {
  return function getGameplayInteractionDebugColliders() {
    return getColliders({
      session,
      storyState: getStoryState(),
      rendering,
      pokemonTalkInteractDistance: POKEMON_TALK_INTERACT_DISTANCE,
      workbenchInteractDistance: WORKBENCH_INTERACT_DISTANCE,
      bulbasaurTalkInteractDistance: BULBASAUR_TALK_INTERACT_DISTANCE
    });
  };
}
