import {
  getLogicalFacingYaw,
  getModelYawToward
} from "../modelFacing.js";

export function createCompanionFacingRuntime({
  session = {},
  offsets = {}
} = {}) {
  const squirtleOffset = Number(offsets.squirtle || 0);
  const charmanderOffset = Number(offsets.charmander || 0);
  const bulbasaurOffset = Number(offsets.bulbasaur || 0);

  function getSquirtleModelYawToward(fromPosition, toPosition) {
    return getModelYawToward(fromPosition, toPosition, squirtleOffset);
  }

  function getRobotModelYawToward(fromPosition, toPosition, modelFaceYawOffset = 0) {
    return getModelYawToward(fromPosition, toPosition, modelFaceYawOffset);
  }

  function getSquirtleLogicalFacingYaw() {
    return getLogicalFacingYaw(
      session.actTwoSquirtle?.modelInstance?.yaw,
      squirtleOffset
    );
  }

  function getCharmanderLogicalFacingYaw() {
    return getLogicalFacingYaw(
      session.charmanderEncounter?.modelInstance?.yaw,
      charmanderOffset
    );
  }

  function getBulbasaurLogicalFacingYaw() {
    return getLogicalFacingYaw(
      session.bulbasaurEncounter?.modelInstance?.yaw,
      bulbasaurOffset
    );
  }

  return {
    getBulbasaurLogicalFacingYaw,
    getCharmanderLogicalFacingYaw,
    getRobotModelYawToward,
    getSquirtleLogicalFacingYaw,
    getSquirtleModelYawToward
  };
}
