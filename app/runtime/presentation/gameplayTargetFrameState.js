import { resolveNearbyGameplayQueryPermission } from "../gameLoopFramePolicies.js";

function createNearbyActionTargetArgs({
  session,
  controls,
  playerPosition,
  canPurifyGround = false,
  canUseLeafage = false,
  canUseFire = false
}) {
  return {
    playerPosition,
    palmModel: session?.palmModel,
    palmInstances: session?.palmInstances,
    resourceNodes: session?.resourceNodes,
    leppaTree: session?.leppaTree,
    leafDen: session?.leafDen,
    storyState: controls?.storyState,
    inventory: controls?.inventory,
    groundDeadInstances: session?.groundDeadInstances,
    iceGroundInstances: session?.iceGroundInstances,
    groundPurifiedInstances: session?.groundPurifiedInstances,
    groundGrassPatches: session?.groundGrassPatches,
    groundFlowerPatches: session?.groundFlowerPatches,
    canPurifyGround,
    canUseLeafage,
    canUseFire
  };
}

export function resolveGameplayTargetFrameState({
  session,
  controls,
  gameplay,
  flowState,
  gameplayOpeningMovementLocked = false,
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false
} = {}) {
  const canQueryNearbyGameplayTargets = resolveNearbyGameplayQueryPermission({
    hasPlayerCharacter: Boolean(session?.playerCharacter),
    gameplayOpeningMovementLocked,
    flowState
  });

  const nearbyHarvestTarget =
    canQueryNearbyGameplayTargets ?
      gameplay?.findNearbyActionTarget?.(createNearbyActionTargetArgs({
        session,
        controls,
        playerPosition: session.playerCharacter.getPosition(),
        canPurifyGround: waterGunEquipped,
        canUseLeafage: leafageEquipped,
        canUseFire: fireEquipped
      })) :
      null;

  const nearbyInvalidMoveTarget =
    canQueryNearbyGameplayTargets &&
    (
      (leafageEquipped && !nearbyHarvestTarget?.leafageGroundCell) ||
      (waterGunEquipped && !nearbyHarvestTarget?.groundCell) ||
      (fireEquipped && !nearbyHarvestTarget?.fireGroundCell)
    ) ?
      gameplay?.findNearbyActionTarget?.(createNearbyActionTargetArgs({
        session,
        controls,
        playerPosition: session.playerCharacter.getPosition(),
        canPurifyGround: leafageEquipped,
        canUseLeafage: waterGunEquipped,
        canUseFire: false
      })) :
      null;

  const invalidMoveGroundCell = leafageEquipped ?
    nearbyInvalidMoveTarget?.groundCell :
    waterGunEquipped ?
      nearbyInvalidMoveTarget?.leafageGroundCell :
      fireEquipped ?
        null :
      null;
  const highlightedGroundCell =
    nearbyHarvestTarget?.groundCell ||
    nearbyHarvestTarget?.leafageGroundCell ||
    nearbyHarvestTarget?.fireGroundCell ||
    invalidMoveGroundCell ||
    null;
  const highlightedGroundCellTargetState =
    highlightedGroundCell && highlightedGroundCell === invalidMoveGroundCell ?
      "invalid" :
      "valid";
  const highlightedGroundCellAbilityId =
    leafageEquipped ?
      "leafage" :
      waterGunEquipped ?
        "waterGun" :
        fireEquipped ?
          "fire" :
        null;
  const nearbyInteractable =
    canQueryNearbyGameplayTargets ?
      gameplay?.findNearbyInteractable?.(
        session.playerCharacter.getPosition(),
        session?.npcActors,
        session?.interactables,
        controls?.storyState,
        session?.groundGrassPatches || [],
        session?.logChair,
        session?.leafDen,
        session?.timburrEncounter,
        session?.charmanderEncounter,
        session?.leppaTree,
        session?.bulbasaurEncounter,
        session?.groundFlowerPatches || []
      ) :
      null;

  return {
    canQueryNearbyGameplayTargets,
    nearbyHarvestTarget,
    nearbyInvalidMoveTarget,
    invalidMoveGroundCell: invalidMoveGroundCell || null,
    highlightedGroundCell,
    highlightedGroundCellTargetState,
    highlightedGroundCellAbilityId,
    nearbyInteractable
  };
}
