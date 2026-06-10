import { getFlowerArrangementBillboards } from "../flowerArrangementBillboards.js";
import {
  getLeafDropBillboards,
  getLeafResourceBillboards
} from "../leafBillboards.js";
import { getLeppaTreeMusicNoteBillboards } from "../leppaTreeMusicNotes.js";
import { getLeppaTreeMissionParticleBillboards } from "../leppaTreeMissionParticleBillboards.js";
import { getRepairBoxRevealRayBillboards } from "../repairBoxRevealRayBillboards.js";
import { getRustlingGrassParticleBillboards } from "../rustlingGrassParticleBillboards.js";
import { getGrassPlayerBend } from "../grassPlayerBend.js";
import {
  getTallGrassInstanceScale,
  getTallGrassSway,
  getTallGrassYaw
} from "../tallGrassMotion.js";
import { getNatureRevivalScale } from "../../session/natureRevivalEffects.js";
import { LEAVES_ITEM_ID } from "../../../gameplayContent.js";
import {
  LEAF_RESOURCE_BILLBOARD_SIZE,
  LEAF_RESOURCE_BILLBOARD_Y_OFFSET
} from "../gameplayPresentationTuning.js";
import { getGrassObjectCollisionAlpha } from "./grassCollisionObjects.js";
import { isWorldPositionWithinRenderDistance } from "./renderDistance.js";

const BULBASAUR_REVEAL_BOX_RAY_BILLBOARD_CONFIG = Object.freeze({
  count: 10,
  baseSize: 0.18,
  chargeProgressMax: 0.72
});
const NATURE_PATCH_GRASS_MODEL_LOD_DISTANCE = 28;
const NATURE_PATCH_MODEL_PREPARE_DISTANCE = 48;
const NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE = 78;
const LEPPA_TREE_MISSION_PARTICLE_BILLBOARD_CONFIG = Object.freeze({
  count: 9,
  radius: 0.72,
  baseHeight: 0.62,
  height: 1.64
});

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function isOpeningLeppaTreeRequestActive(storyState) {
  return Boolean(
    storyState?.flags?.squirtleLeppaRequestAvailable &&
    !storyState.flags.leppaTreeRevived
  );
}

function isRustlingEncounterPatch(groundGrassPatch, storyState = {}) {
  if (groundGrassPatch?.state !== "alive") {
    return false;
  }

  const flags = storyState.flags || {};
  return Boolean(
    (
      groundGrassPatch.cellId === flags.rustlingGrassCellId &&
      !flags.bulbasaurRevealed
    ) ||
    (
      groundGrassPatch.cellId === flags.charmanderRustlingGrassCellId &&
      !flags.charmanderRevealed
    ) ||
    (
      groundGrassPatch.cellId === flags.timburrRustlingGrassCellId &&
      !flags.timburrRevealed
    )
  );
}

function appendGroundGrassPatchRenderables({
  session,
  nextFrame,
  groundGrassPatch,
  now,
  natureRenderCenter,
  grassBendPlayerPosition,
  grassCollisionObjects,
  storyState
}) {
  const hasRustlingEncounter = isRustlingEncounterPatch(groundGrassPatch, storyState);
  const shouldRustleGrass = false;
  const rustleOffset = shouldRustleGrass ? Math.sin(now * 0.024) * 0.11 : 0;
  const standardAliveGrassModelAvailable = Boolean(
    groundGrassPatch.state === "alive" &&
    groundGrassPatch.leafageObjectId !== "garden1" &&
    groundGrassPatch.leafageObjectId !== "nativeTree" &&
    session.tallGrassModel &&
    Array.isArray(session.tallGrassInstances)
  );
  const gardenGrassModelAvailable = Boolean(
    groundGrassPatch.state === "alive" &&
    groundGrassPatch.leafageObjectId === "garden1" &&
    session.leafageGardenModel &&
    Array.isArray(session.leafageGardenInstances)
  );
  const nativeTreeModelAvailable = Boolean(
    groundGrassPatch.state === "alive" &&
    groundGrassPatch.leafageObjectId === "nativeTree" &&
    session.leafageNativeTreeModel &&
    Array.isArray(session.leafageNativeTreeInstances)
  );
  const deadGrassModelAvailable = Boolean(
    groundGrassPatch.state !== "alive" &&
    session.deadGrassModel &&
    Array.isArray(session.deadGrassInstances)
  );
  const grassBillboardScaleX = Number(groundGrassPatch.size?.[0]) || 1;
  const grassBillboardScaleY = Number(groundGrassPatch.size?.[1]) || grassBillboardScaleX;
  const canUseGrassBillboardFallback =
    standardAliveGrassModelAvailable ||
    deadGrassModelAvailable ||
    (!gardenGrassModelAvailable && !nativeTreeModelAvailable);
  const patchPrepareDistance = canUseGrassBillboardFallback ?
    NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE :
    NATURE_PATCH_MODEL_PREPARE_DISTANCE;
  if (
    !hasRustlingEncounter &&
    !isWorldPositionWithinRenderDistance(
      groundGrassPatch.position,
      natureRenderCenter,
      patchPrepareDistance
    )
  ) {
    return false;
  }

  const playerBend = getGrassPlayerBend(groundGrassPatch, grassBendPlayerPosition);
  const grassRevivalScale = getNatureRevivalScale(
    session.natureRevivalEffects,
    groundGrassPatch.id
  );
  const grassAlpha = getGrassObjectCollisionAlpha(
    groundGrassPatch,
    grassCollisionObjects
  );
  const shouldUseGrassModelLod =
    hasRustlingEncounter ||
    isWorldPositionWithinRenderDistance(
      groundGrassPatch.position,
      natureRenderCenter,
      NATURE_PATCH_GRASS_MODEL_LOD_DISTANCE
    );
  const aliveGrassModelAvailable = Boolean(
    standardAliveGrassModelAvailable && shouldUseGrassModelLod
  );
  const leafageGardenModelAvailable = gardenGrassModelAvailable;
  const leafageNativeTreeModelAvailable = nativeTreeModelAvailable;
  const nearDeadGrassModelAvailable = Boolean(
    deadGrassModelAvailable && shouldUseGrassModelLod
  );

  if (leafageGardenModelAvailable) {
    session.leafageGardenInstances.push({
      id: `leafage-garden-${groundGrassPatch.id}`,
      offset: [
        groundGrassPatch.position[0] + rustleOffset,
        groundGrassPatch.position[1],
        groundGrassPatch.position[2]
      ],
      scale: getTallGrassInstanceScale(
        session.leafageGardenModel,
        groundGrassPatch,
        grassRevivalScale
      ) * (session.leafageGardenModelScale || 1),
      alpha: grassAlpha,
      yaw: getTallGrassYaw(groundGrassPatch) + (session.leafageGardenModelFaceYawOffset || 0),
      swayStrength: 0
    });
  } else if (leafageNativeTreeModelAvailable) {
    session.leafageNativeTreeInstances.push({
      id: `leafage-native-tree-${groundGrassPatch.id}`,
      offset: [
        groundGrassPatch.position[0] + rustleOffset,
        groundGrassPatch.position[1],
        groundGrassPatch.position[2]
      ],
      scale: getTallGrassInstanceScale(
        session.leafageNativeTreeModel,
        groundGrassPatch,
        grassRevivalScale
      ) * (session.leafageNativeTreeModelScale || 1),
      alpha: grassAlpha,
      yaw: getTallGrassYaw(groundGrassPatch) + (session.leafageNativeTreeModelFaceYawOffset || 0),
      swayStrength: 0
    });
  } else if (aliveGrassModelAvailable) {
    session.tallGrassInstances.push({
      id: `tall-grass-${groundGrassPatch.id}`,
      offset: [
        groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
        groundGrassPatch.position[1],
        groundGrassPatch.position[2] + playerBend.offsetZ
      ],
      scale: getTallGrassInstanceScale(
        session.tallGrassModel,
        groundGrassPatch,
        grassRevivalScale
      ),
      alpha: grassAlpha,
      yaw: getTallGrassYaw(groundGrassPatch),
      swayStrength: getTallGrassSway(groundGrassPatch, shouldRustleGrass, now) + playerBend.swayStrength
    });
  } else if (nearDeadGrassModelAvailable) {
    session.deadGrassInstances.push({
      id: `dead-grass-${groundGrassPatch.id}`,
      offset: [
        groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
        groundGrassPatch.position[1],
        groundGrassPatch.position[2] + playerBend.offsetZ
      ],
      scale: getTallGrassInstanceScale(
        session.deadGrassModel,
        groundGrassPatch,
        grassRevivalScale
      ),
      alpha: grassAlpha,
      yaw: getTallGrassYaw(groundGrassPatch),
      swayStrength: playerBend.swayStrength
    });
  } else {
    nextFrame.render.grassBillboards.push({
      texture: groundGrassPatch.state === "alive" ?
        session.greenGrassTexture :
        session.deadGrassTexture,
      position: [
        groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
        groundGrassPatch.position[1],
        groundGrassPatch.position[2] + playerBend.offsetZ
      ],
      size: [
        grassBillboardScaleX * grassRevivalScale,
        grassBillboardScaleY * grassRevivalScale
      ],
      alpha: grassAlpha
    });
  }

  return hasRustlingEncounter;
}

function appendGroundFlowerPatchRenderables({
  session,
  nextFrame,
  groundFlowerPatch,
  now,
  natureRenderCenter,
  grassBendPlayerPosition
}) {
  if (
    !isWorldPositionWithinRenderDistance(
      groundFlowerPatch.position,
      natureRenderCenter,
      NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
    )
  ) {
    return;
  }

  const flowerRevivalScale = getNatureRevivalScale(
    session.natureRevivalEffects,
    groundFlowerPatch.id
  );

  if (groundFlowerPatch.state === "alive") {
    getFlowerArrangementBillboards({
      groundFlowerPatch,
      texture: session.greenFlowerTexture,
      playerPosition: grassBendPlayerPosition,
      revivalScale: flowerRevivalScale,
      now,
      target: nextFrame.render.flowerBillboards
    });
    return;
  }

  nextFrame.render.flowerBillboards.push({
    texture: session.deadFlowerTexture,
    position: groundFlowerPatch.position,
    size: groundFlowerPatch.size.map((value) => value * flowerRevivalScale)
  });
}

function appendRepairBoxNatureParticles({
  session,
  nextFrame,
  rendering,
  now,
  selectedRepairBoxParticleTarget,
  repairBoxRevealParticleTarget,
  shouldShowRepairBoxRustlingParticles,
  clamp
}) {
  if (repairBoxRevealParticleTarget) {
    nextFrame.render.genericBillboards.push(
      ...getRepairBoxRevealRayBillboards({
        target: repairBoxRevealParticleTarget,
        texture: session.natureRevivalSparkTexture,
        now,
        uvRect: rendering.fullUvRect,
        clamp01: clamp,
        config: BULBASAUR_REVEAL_BOX_RAY_BILLBOARD_CONFIG
      }),
      ...getRustlingGrassParticleBillboards(
        repairBoxRevealParticleTarget,
        session.natureRevivalSparkTexture,
        now,
        rendering.fullUvRect
      )
    );
  } else if (shouldShowRepairBoxRustlingParticles && selectedRepairBoxParticleTarget) {
    nextFrame.render.genericBillboards.push(
      ...getRustlingGrassParticleBillboards(
        selectedRepairBoxParticleTarget,
        session.natureRevivalSparkTexture,
        now,
        rendering.fullUvRect
      )
    );
  }
}

function appendNatureDropBillboards({
  session,
  nextFrame,
  rendering,
  storyState,
  natureRenderCenter,
  woodCollectPopRuntime,
  gearPickupParticleRuntime
}) {
  nextFrame.render.woodTexture = session.woodTexture;
  nextFrame.render.woodDrops = session.woodDrops.filter((drop) => {
    return (
      drop?.itemId !== LEAVES_ITEM_ID &&
      !drop.collected &&
      isWorldPositionWithinRenderDistance(
        drop.position,
        natureRenderCenter,
        NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
      )
    );
  });
  nextFrame.render.genericBillboards.push(
    ...woodCollectPopRuntime.getBillboards(session.woodTexture, rendering.fullUvRect)
  );
  nextFrame.render.genericBillboards.push(
    ...gearPickupParticleRuntime.getBillboards(session.natureRevivalSparkTexture, rendering.fullUvRect)
  );
  nextFrame.render.genericBillboards.push(
    ...getLeafDropBillboards({
      fieldDrops: session.woodDrops,
      texture: session.leavesTexture,
      uvRect: rendering.fullUvRect,
      renderCenter: natureRenderCenter,
      itemId: LEAVES_ITEM_ID,
      isWorldPositionWithinRenderDistance,
      prepareDistance: NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
    })
  );
  nextFrame.render.genericBillboards.push(
    ...getLeafResourceBillboards({
      resourceNodes: session.resourceNodes,
      texture: session.leavesTexture,
      uvRect: rendering.fullUvRect,
      storyState,
      renderCenter: natureRenderCenter,
      itemId: LEAVES_ITEM_ID,
      isResourceNodeActive: rendering.isResourceNodeActive,
      isWorldPositionWithinRenderDistance,
      prepareDistance: NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE,
      yOffset: LEAF_RESOURCE_BILLBOARD_Y_OFFSET,
      size: LEAF_RESOURCE_BILLBOARD_SIZE
    })
  );
  nextFrame.render.genericBillboards.push(
    ...(session.leppaBerryDrops || [])
      .filter((leppaBerryDrop) => (
        !leppaBerryDrop.collected &&
        isWorldPositionWithinRenderDistance(
          leppaBerryDrop.position,
          natureRenderCenter,
          NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
        )
      ))
      .map((leppaBerryDrop) => ({
        texture: session.leppaBerryTexture,
        position: leppaBerryDrop.position,
        size: leppaBerryDrop.size,
        uvRect: rendering.fullUvRect
      }))
  );
}

function appendLeppaTreeNatureBillboards({
  session,
  nextFrame,
  rendering,
  storyState,
  now,
  clamp
}) {
  nextFrame.render.genericBillboards.push(
    ...getLeppaTreeMusicNoteBillboards({
      leppaTree: session.leppaTree,
      textures: session.leppaTreeMusicalNoteTextures,
      uvRect: rendering.fullUvRect,
      now,
      clamp01: clamp
    })
  );
  nextFrame.render.genericBillboards.push(
    ...getLeppaTreeMissionParticleBillboards({
      active: isOpeningLeppaTreeRequestActive(storyState),
      leppaTree: session.leppaTree,
      texture: session.natureRevivalSparkTexture,
      uvRect: rendering.fullUvRect,
      now,
      clamp01: clamp,
      config: LEPPA_TREE_MISSION_PARTICLE_BILLBOARD_CONFIG
    })
  );
}

export function updateNatureGrassRenderFrame({
  session,
  nextFrame,
  storyState = {},
  now = 0,
  grassBendPlayerPosition = null,
  natureRenderCenter = null,
  grassCollisionObjects = [],
  shouldShowRepairBoxRustlingParticles = false
} = {}) {
  let shouldShowRustlingParticles = shouldShowRepairBoxRustlingParticles;

  for (const groundGrassPatch of session.groundGrassPatches) {
    if (appendGroundGrassPatchRenderables({
      session,
      nextFrame,
      groundGrassPatch,
      now,
      natureRenderCenter,
      grassBendPlayerPosition,
      grassCollisionObjects,
      storyState
    })) {
      shouldShowRustlingParticles = true;
    }
  }

  return {
    shouldShowRepairBoxRustlingParticles: shouldShowRustlingParticles
  };
}

export function updateNatureRenderFrame({
  session,
  nextFrame,
  storyState = {},
  rendering,
  now = 0,
  grassBendPlayerPosition = null,
  natureRenderCenter = null,
  selectedRepairBoxParticleTarget = null,
  repairBoxRevealParticleTarget = null,
  shouldShowRepairBoxRustlingParticles = false,
  woodCollectPopRuntime = { getBillboards: () => [] },
  gearPickupParticleRuntime = { getBillboards: () => [] },
  clamp = clamp01
} = {}) {
  appendRepairBoxNatureParticles({
    session,
    nextFrame,
    rendering,
    now,
    selectedRepairBoxParticleTarget,
    repairBoxRevealParticleTarget,
    shouldShowRepairBoxRustlingParticles,
    clamp
  });

  for (const groundFlowerPatch of session.groundFlowerPatches) {
    appendGroundFlowerPatchRenderables({
      session,
      nextFrame,
      groundFlowerPatch,
      now,
      natureRenderCenter,
      grassBendPlayerPosition
    });
  }

  appendNatureDropBillboards({
    session,
    nextFrame,
    rendering,
    storyState,
    natureRenderCenter,
    woodCollectPopRuntime,
    gearPickupParticleRuntime
  });

  appendLeppaTreeNatureBillboards({
    session,
    nextFrame,
    rendering,
    storyState,
    now,
    clamp
  });

  return {
    shouldShowRepairBoxRustlingParticles
  };
}
