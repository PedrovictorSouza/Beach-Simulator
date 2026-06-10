import { TALL_GRASS_MIN_FOOTPRINT } from "../tallGrassMotion.js";

const GRASS_OBJECT_COLLISION_ALPHA = 0.5;
const GRASS_OBJECT_COLLISION_BASE_RADIUS = 0.58;

function appendGrassCollisionObject(objects, position, radius = GRASS_OBJECT_COLLISION_BASE_RADIUS) {
  if (!Array.isArray(position) || position.length < 3) {
    return;
  }

  const x = Number(position[0]);
  const z = Number(position[2]);

  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return;
  }

  objects.push({
    position,
    radius
  });
}

export function getGrassCollisionObjects({ session = {} } = {}) {
  const objects = [];

  if (session.playerCharacter) {
    appendGrassCollisionObject(objects, session.playerCharacter.getPosition?.(), 0.52);
  }

  appendGrassCollisionObject(objects, session.chopperNpcActor?.bodyInstance?.offset, 0.54);

  if (session.actTwoSquirtle?.modelInstance?.active) {
    appendGrassCollisionObject(
      objects,
      session.actTwoSquirtle.position || session.actTwoSquirtle.modelInstance.offset,
      0.48
    );
  }

  if (session.bulbasaurEncounter?.visible) {
    appendGrassCollisionObject(
      objects,
      session.bulbasaurEncounter.position || session.bulbasaurEncounter.modelInstance?.offset,
      0.66
    );
  }

  if (session.charmanderEncounter?.visible) {
    appendGrassCollisionObject(objects, session.charmanderEncounter.position, 0.54);
  }

  if (session.timburrEncounter?.visible) {
    appendGrassCollisionObject(objects, session.timburrEncounter.position, 0.56);
  }

  for (const repairModuleInstance of session.robotRepairModuleInstances || []) {
    if (repairModuleInstance?.active !== false) {
      appendGrassCollisionObject(
        objects,
        repairModuleInstance.baseOffset || repairModuleInstance.offset,
        0.62
      );
    }
  }

  return objects;
}

export function getGrassObjectCollisionAlpha(groundGrassPatch, objects = []) {
  if (!Array.isArray(groundGrassPatch?.position) || !objects.length) {
    return 1;
  }

  const patchRadius = Math.max(
    groundGrassPatch.size?.[0] || TALL_GRASS_MIN_FOOTPRINT,
    groundGrassPatch.size?.[1] || TALL_GRASS_MIN_FOOTPRINT
  ) * 0.42;

  for (const object of objects) {
    const radius = patchRadius + object.radius;
    const deltaX = groundGrassPatch.position[0] - object.position[0];
    const deltaZ = groundGrassPatch.position[2] - object.position[2];

    if (deltaX * deltaX + deltaZ * deltaZ <= radius * radius) {
      return GRASS_OBJECT_COLLISION_ALPHA;
    }
  }

  return 1;
}
