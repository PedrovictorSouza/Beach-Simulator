import { getCampfireWoodPileBillboards } from "../campfireWoodPileBillboards.js";
import { applyPlayerPlacementSpawnToBillboard } from "../construction/playerPlacementSpawnEffect.js";
import {
  createInteractionInfoBillboard,
  getWorkbenchInteractionParticleBillboards,
  POKEMON_CENTER_PC_INFO_ICON_OFFSET,
  WORKBENCH_INFO_ICON_OFFSET
} from "../interactionInfoBillboards.js";
import { createMissionTargetIndicatorBillboard } from "../missionTargetIndicatorBillboard.js";
import { getMissionTargetPositions } from "../missionTargetPositions.js";
import { getSavePointStarBillboards } from "../savePointStarBillboards.js";
import {
  LOG_CHAIR_ITEM_ID,
  WORKBENCH_POSITION
} from "../../../gameplayContent.js";
import { buildLogChairPlacement } from "../../../world/islandWorld.js";

const LOG_CHAIR_PLACEMENT_PREVIEW_ALPHA = 0.42;
const SAVE_POINT_STAR_BILLBOARD_CONFIG = Object.freeze({
  count: 10,
  radius: 0.64,
  height: 1.18,
  duration: 1.9
});

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function appendOptionalBillboard(target, billboard) {
  if (billboard) {
    target.push(billboard);
  }
}

function appendWorkbenchBillboards({
  target,
  session,
  rendering,
  now,
  canShowWorldSpaceUi
}) {
  appendOptionalBillboard(
    target,
    createInteractionInfoBillboard(
      session.markerTextures?.workbench,
      WORKBENCH_POSITION,
      WORKBENCH_INFO_ICON_OFFSET,
      rendering.fullUvRect
    )
  );

  if (canShowWorldSpaceUi) {
    target.push(
      ...getWorkbenchInteractionParticleBillboards({
        texture: session.logChairStarTexture || session.natureRevivalSparkTexture,
        uvRect: rendering.fullUvRect,
        playerPosition: session.playerCharacter?.getPosition?.(),
        now
      })
    );
  }
}

function appendLogChairBillboards({
  target,
  session,
  storyState,
  inventory,
  rendering,
  now,
  deltaTime,
  clamp
}) {
  if (
    session.playerCharacter &&
    session.logChairTexture &&
    storyState.flags.logChairReceived &&
    !storyState.flags.logChairPlaced &&
    (inventory?.[LOG_CHAIR_ITEM_ID] || 0) > 0
  ) {
    const logChairPreview = buildLogChairPlacement(session.playerCharacter.getPosition());
    target.push({
      texture: session.logChairTexture,
      position: logChairPreview.position,
      size: logChairPreview.size,
      uvRect: rendering.fullUvRect,
      alpha: LOG_CHAIR_PLACEMENT_PREVIEW_ALPHA
    });
  }

  if (session.logChair && storyState.flags.logChairPlaced) {
    target.push(
      applyPlayerPlacementSpawnToBillboard(session.logChair, {
        texture: session.logChairTexture,
        position: session.logChair.position,
        size: session.logChair.size,
        uvRect: rendering.fullUvRect
      }, deltaTime)
    );
    target.push(
      ...getSavePointStarBillboards({
        logChair: session.logChair,
        texture: session.logChairStarTexture,
        uvRect: rendering.fullUvRect,
        now,
        clamp01: clamp,
        config: SAVE_POINT_STAR_BILLBOARD_CONFIG
      })
    );
  }
}

function appendCampfireBillboards({
  target,
  session,
  storyState,
  rendering,
  campfirePlacementPreview
}) {
  if (
    campfirePlacementPreview?.snappedPosition &&
    session.campfireTexture &&
    !session.campfireTrainHouseModelInstance
  ) {
    target.push({
      texture: session.campfireTexture,
      position: campfirePlacementPreview.snappedPosition,
      size: campfirePlacementPreview.effectiveSize || campfirePlacementPreview.size,
      uvRect: campfirePlacementPreview.uvRect || rendering.fullUvRect,
      alpha: campfirePlacementPreview.valid ? 0.58 : 0.36
    });
  }

  if (
    session.campfire &&
    storyState.flags.campfireSpatOut &&
    !session.campfireTrainHouseModelInstance
  ) {
    if (storyState.flags.charmanderCampfireLit) {
      target.push({
        texture: session.campfireTexture,
        position: session.campfire.position,
        size: session.campfire.size,
        uvRect: rendering.fullUvRect
      });
    } else {
      target.push(
        ...getCampfireWoodPileBillboards({
          campfire: session.campfire,
          texture: session.woodTexture,
          uvRect: rendering.fullUvRect
        })
      );
    }
  }
}

function appendLeafDenBillboards({
  target,
  session,
  storyState,
  rendering,
  now,
  deltaTime,
  getLeafDenConstructionBillboards
}) {
  if (!session.leafDen || !storyState.flags.leafDenKitPlaced) {
    return;
  }

  const leafDenBuilt = Boolean(storyState.flags.leafDenBuilt);
  const shouldRenderLeafDenBillboard = !session.leafDenModelInstance;

  if (shouldRenderLeafDenBillboard) {
    target.push(
      applyPlayerPlacementSpawnToBillboard(session.leafDen, {
        texture: session.leafDenTexture,
        position: session.leafDen.position,
        size: [2.55, 1.85],
        uvRect: rendering.fullUvRect,
        rotation: Number(session.leafDen.yaw || 0)
      }, deltaTime)
    );
  }

  if (
    !leafDenBuilt &&
    session.leafDen?.interactionBox?.offset
  ) {
    appendOptionalBillboard(
      target,
      createInteractionInfoBillboard(
        session.markerTextures?.[session.leafDen.interactionBox.markerKey] ||
          session.markerTextures?.workbench,
        session.leafDen.position,
        session.leafDen.interactionBox.offset,
        rendering.fullUvRect
      )
    );
  }

  target.push(
    ...getLeafDenConstructionBillboards(rendering.fullUvRect, now * 0.001)
  );
}

function appendHouseInteriorBillboards({
  target,
  session,
  storyState,
  rendering,
  deltaTime
}) {
  if (session.dittoFlag && storyState.flags.dittoFlagPlacedOnHouse) {
    target.push(
      applyPlayerPlacementSpawnToBillboard(session.dittoFlag, {
        texture: session.dittoFlagTexture,
        position: session.dittoFlag.position,
        size: session.dittoFlag.size,
        uvRect: rendering.fullUvRect
      }, deltaTime)
    );
  }

  if (storyState.flags.leafDenInteriorEntered) {
    target.push(
      ...(session.leafDenFurniture || []).map((furniture) => (
        applyPlayerPlacementSpawnToBillboard(furniture, {
          texture: furniture.kind === "strawBed" ?
            session.strawBedTexture :
            furniture.kind === "campfire" ?
              session.campfireTexture :
              session.logChairTexture,
          position: furniture.position,
          size: furniture.size,
          uvRect: rendering.fullUvRect
        }, deltaTime)
      ))
    );
  }
}

function appendStrawBedBillboard({
  target,
  session,
  storyState,
  rendering
}) {
  if (session.strawBed && storyState.flags.strawBedPlacedInBulbasaurHabitat) {
    target.push({
      texture: session.strawBedTexture,
      position: session.strawBed.position,
      size: session.strawBed.size,
      uvRect: rendering.fullUvRect
    });
  }
}

function appendLateWorldObjectBillboards({
  target,
  session,
  storyState,
  rendering
}) {
  if (
    session.pokemonCenterPc &&
    storyState.flags.ruinedPokemonCenterInspected
  ) {
    target.push({
      texture: session.pokemonCenterPc.texture,
      position: session.pokemonCenterPc.position,
      size: session.pokemonCenterPc.size,
      uvRect: rendering.fullUvRect
    });
    appendOptionalBillboard(
      target,
      createInteractionInfoBillboard(
        session.markerTextures?.pokemonCenterPc,
        session.pokemonCenterPc.position,
        POKEMON_CENTER_PC_INFO_ICON_OFFSET,
        rendering.fullUvRect
      )
    );
  }

  if (session.challengeBoulder && storyState.flags.boulderChallengeAvailable) {
    target.push({
      texture: session.challengeBoulder.texture,
      position: session.challengeBoulder.position,
      size: session.challengeBoulder.size,
      uvRect: rendering.fullUvRect
    });
  }

  if (session.billCameo?.visible && session.billCameo.texture) {
    target.push({
      texture: session.billCameo.texture,
      position: session.billCameo.position,
      size: session.billCameo.size,
      uvRect: rendering.fullUvRect
    });
  }

  if (session.actTwoRepairPlant) {
    const repairPlantTexture = session.actTwoRepairPlant.fixed ?
      session.repairPlantFixedTexture :
      session.repairPlantBrokenTexture;

    target.push({
      texture: repairPlantTexture,
      position: session.actTwoRepairPlant.position,
      size: session.actTwoRepairPlant.size,
      uvRect: rendering.fullUvRect
    });
  }
}

function appendMissionTargetBillboards({
  target,
  session,
  storyState,
  rendering,
  now,
  canShowWorldSpaceUi,
  activeQuest,
  getMissionTargetPositionsById
}) {
  if (!canShowWorldSpaceUi) {
    return;
  }

  const missionTargetPositions = getMissionTargetPositions({
    activeQuest,
    storyState,
    getMissionTargetPositionsById
  });
  for (const missionTargetPosition of missionTargetPositions) {
    appendOptionalBillboard(
      target,
      createMissionTargetIndicatorBillboard({
        texture: session.missionTargetIndicatorTexture,
        targetPosition: missionTargetPosition,
        now,
        uvRect: rendering.fullUvRect
      })
    );
  }
}

export function updateWorldObjectBillboardFrame({
  session,
  nextFrame,
  storyState = {},
  inventory = {},
  rendering,
  now = 0,
  deltaTime = 0,
  canShowWorldSpaceUi = false,
  activeQuest = null,
  campfirePlacementPreview = null,
  getMissionTargetPositionsById = () => [],
  getLeafDenConstructionBillboards = () => [],
  getConstructionCloudBurstBillboards = () => [],
  clamp = clamp01
} = {}) {
  const target = nextFrame.render.genericBillboards;

  appendWorkbenchBillboards({
    target,
    session,
    rendering,
    now,
    canShowWorldSpaceUi
  });
  appendLogChairBillboards({
    target,
    session,
    storyState,
    inventory,
    rendering,
    now,
    deltaTime,
    clamp
  });
  appendStrawBedBillboard({
    target,
    session,
    storyState,
    rendering
  });
  appendCampfireBillboards({
    target,
    session,
    storyState,
    rendering,
    campfirePlacementPreview
  });
  appendLeafDenBillboards({
    target,
    session,
    storyState,
    rendering,
    now,
    deltaTime,
    getLeafDenConstructionBillboards
  });
  target.push(
    ...getConstructionCloudBurstBillboards(rendering.fullUvRect, now * 0.001)
  );
  appendHouseInteriorBillboards({
    target,
    session,
    storyState,
    rendering,
    deltaTime
  });
  appendLateWorldObjectBillboards({
    target,
    session,
    storyState,
    rendering
  });
  appendMissionTargetBillboards({
    target,
    session,
    storyState,
    rendering,
    now,
    canShowWorldSpaceUi,
    activeQuest,
    getMissionTargetPositionsById
  });
}
