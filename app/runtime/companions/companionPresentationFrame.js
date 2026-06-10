import { getBulbasaurInteractionRadiusGizmoBillboards } from "../bulbasaurInteractionRadiusGizmoBillboards.js";
import {
  getBulbasaurLeafageBillboards,
  getCharmanderFireBillboards,
  getSquirtleWaterGunBillboards
} from "../fieldMoveRuntime/fieldMoveBillboards.js";
import {
  getCharmanderCarbonBillboards,
  getSquirtleChargingBillboards,
  getSquirtleStaminaBillboards
} from "./companionStatusBillboards.js";

function appendFallbackCompanionBillboard({
  billboards,
  encounter,
  uvRect
}) {
  if (encounter?.modelInstance) {
    return;
  }

  billboards.push({
    texture: encounter?.visible ? encounter.texture : null,
    position: encounter?.visible ? encounter.position : null,
    size: encounter?.visible ? encounter.size : null,
    uvRect
  });
}

export function updateCompanionPresentationFrame({
  session,
  nextFrame,
  playerSkills,
  activeMoveId,
  rendering,
  camera,
  now,
  getSquirtleWorldPosition,
  getCharmanderWorldPosition,
  getSquirtleMouthPosition,
  getCharmanderMouthPosition,
  getBulbasaurGrowEmitterPosition,
  getSquirtleWaterStaminaState,
  getCharmanderCarbonEnergyState,
  isSquirtleWaterCharging,
  interactionRadiusGizmoConfig
}) {
  const billboards = nextFrame.render.genericBillboards;
  const uvRect = rendering.fullUvRect;

  const squirtleWaterStamina = getSquirtleWaterStaminaState();
  const shouldShowSquirtleStamina =
    playerSkills?.waterGun &&
    (
      activeMoveId === "waterGun" ||
      session.squirtleWaterGunAction ||
      isSquirtleWaterCharging() ||
      squirtleWaterStamina.current < squirtleWaterStamina.max
    );
  if (shouldShowSquirtleStamina) {
    billboards.push(
      ...getSquirtleStaminaBillboards({
        position: getSquirtleWorldPosition(),
        fillTexture: session.squirtleWaterStaminaFillTexture,
        uvRect,
        stamina: squirtleWaterStamina,
        billboardRight: camera.getBillboardAxes?.()?.right
      })
    );
  }

  const charmanderCarbonEnergy = getCharmanderCarbonEnergyState();
  const shouldShowCharmanderCarbon =
    playerSkills?.fire &&
    (
      activeMoveId === "fire" ||
      session.charmanderFireAction ||
      charmanderCarbonEnergy.current < 1 ||
      charmanderCarbonEnergy.visualCurrent < 1
    );
  if (shouldShowCharmanderCarbon) {
    billboards.push(
      ...getCharmanderCarbonBillboards({
        position: getCharmanderWorldPosition(),
        fillTexture: session.charmanderCarbonFillTexture,
        backTexture: session.squirtleWaterStaminaBackTexture,
        uvRect,
        energy: charmanderCarbonEnergy,
        billboardRight: camera.getBillboardAxes?.()?.right,
        cameraDirection: camera.getPose?.()?.direction
      })
    );
  }

  billboards.push(
    ...getSquirtleWaterGunBillboards({
      action: session.squirtleWaterGunAction,
      texture: session.squirtleWaterSprayTexture,
      uvRect,
      getMouthPosition: getSquirtleMouthPosition
    })
  );
  billboards.push(
    ...getCharmanderFireBillboards({
      action: session.charmanderFireAction,
      texture: session.charmanderFireTexture || session.campfireTexture,
      uvRect,
      getMouthPosition: getCharmanderMouthPosition
    })
  );
  billboards.push(
    ...getBulbasaurLeafageBillboards({
      action: session.bulbasaurLeafageAction,
      texture: session.natureRevivalSparkTexture,
      uvRect,
      getEmitterPosition: getBulbasaurGrowEmitterPosition
    })
  );
  billboards.push(
    ...getSquirtleChargingBillboards({
      active: isSquirtleWaterCharging(),
      position: getSquirtleWorldPosition(),
      texture: session.squirtleChargingParticleTexture,
      uvRect,
      now
    })
  );

  appendFallbackCompanionBillboard({
    billboards,
    encounter: session.bulbasaurEncounter,
    uvRect
  });
  billboards.push(
    ...getBulbasaurInteractionRadiusGizmoBillboards({
      encounter: session.bulbasaurEncounter,
      texture: session.natureRevivalSparkTexture,
      uvRect,
      now,
      config: interactionRadiusGizmoConfig
    })
  );
  appendFallbackCompanionBillboard({
    billboards,
    encounter: session.charmanderEncounter,
    uvRect
  });
  appendFallbackCompanionBillboard({
    billboards,
    encounter: session.timburrEncounter,
    uvRect
  });
}
