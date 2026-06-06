import { normalizeMissionTargetPositions } from "./missionTargetPositionUtils.js";
import { resolveMissionTargetAliasId } from "./missionTargetResolver.js";

function getActorMissionTargetPosition(actor) {
  const position =
    actor?.character?.getPosition?.() ||
    actor?.position ||
    actor?.offset ||
    null;
  return Array.isArray(position) ? position : null;
}

function getNpcMissionTargetPosition(session, npcId) {
  const npcActor = session?.npcActors?.find((actor) => actor.id === npcId);
  return getActorMissionTargetPosition(npcActor);
}

function getCompanionMissionTargetPosition(session, companionId) {
  if (companionId === "squirtle" || companionId === "waterGun") {
    return session?.actTwoSquirtle?.position ||
      session?.actTwoSquirtle?.repairModuleInstance?.baseOffset ||
      session?.actTwoSquirtle?.repairModuleInstance?.offset ||
      null;
  }

  if (companionId === "bulbasaur" || companionId === "leaf-helper" || companionId === "leafage") {
    return session?.bulbasaurEncounter?.position ||
      session?.bulbasaurEncounter?.repairPosition ||
      session?.bulbasaurEncounter?.repairModuleInstance?.baseOffset ||
      null;
  }

  if (companionId === "charmander" || companionId === "fire") {
    return session?.charmanderEncounter?.position ||
      session?.charmanderEncounter?.repairPosition ||
      session?.charmanderEncounter?.repairModuleInstance?.baseOffset ||
      null;
  }

  if (companionId === "timburr") {
    return session?.timburrEncounter?.position ||
      session?.timburrEncounter?.repairPosition ||
      session?.timburrEncounter?.repairModuleInstance?.baseOffset ||
      null;
  }

  return null;
}

function getDryGrassMissionTargetPositions(session) {
  const patches = session?.groundGrassPatches || [];
  const playerPosition = session?.playerCharacter?.getPosition?.() || null;
  const targetPatches = [];

  for (const patch of patches) {
    if (!Array.isArray(patch?.position) || patch.state === "alive") {
      continue;
    }

    const distance = Array.isArray(playerPosition) ?
      Math.hypot(patch.position[0] - playerPosition[0], patch.position[2] - playerPosition[2]) :
      0;

    targetPatches.push({ patch, distance });
  }

  targetPatches.sort((left, right) => left.distance - right.distance);
  return targetPatches.map(({ patch }) => patch.position);
}

export function getMissionTargetPositionsById({
  targetId,
  session,
  workbenchPosition,
  ruinedPokemonCenterPosition,
  getFreeBlockBuildZoneCenterPosition = () => null
} = {}) {
  const missionTargetId = resolveMissionTargetAliasId(targetId);
  if (!missionTargetId) {
    return [];
  }

  if (missionTargetId === "tangrowth") {
    return normalizeMissionTargetPositions(getNpcMissionTargetPosition(session, "tangrowth"));
  }

  if (missionTargetId === "squirtle") {
    return normalizeMissionTargetPositions(getCompanionMissionTargetPosition(session, "squirtle"));
  }

  if (missionTargetId === "leaf-helper") {
    return normalizeMissionTargetPositions(getCompanionMissionTargetPosition(session, "bulbasaur"));
  }

  if (missionTargetId === "charmander") {
    return normalizeMissionTargetPositions(getCompanionMissionTargetPosition(session, "charmander"));
  }

  if (missionTargetId === "timburr") {
    return normalizeMissionTargetPositions(getCompanionMissionTargetPosition(session, "timburr"));
  }

  if (missionTargetId === "workbench" || missionTargetId === "workbench-campfire") {
    return normalizeMissionTargetPositions(workbenchPosition);
  }

  if (missionTargetId === "revived-grass" || missionTargetId === "water-dry-tall-grass") {
    return getDryGrassMissionTargetPositions(session);
  }

  if (missionTargetId === "leppaTree" || missionTargetId === "revive-leppa-tree") {
    return normalizeMissionTargetPositions(session?.leppaTree?.position);
  }

  if (missionTargetId === "ruined-pokemon-center" || missionTargetId === "new-challenges-in-pc") {
    return normalizeMissionTargetPositions(session?.pokemonCenterPc?.position || ruinedPokemonCenterPosition);
  }

  if (missionTargetId === "foundation-wall") {
    return normalizeMissionTargetPositions(getFreeBlockBuildZoneCenterPosition());
  }

  return [];
}
