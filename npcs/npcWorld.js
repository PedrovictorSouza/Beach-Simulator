import { loadTexturedModel } from "../rendering/worldAssets.js";
import { NPC_STATES, NPC_TYPES } from "./npcSystem.js";

const BATHER_MODEL_FACE_YAW_OFFSET = Math.PI;
const SHARK_MODEL_FACE_YAW_OFFSET = 0;
const BATHER_SOURCE_PATH = "./npcs/bather-1/bather.txt";
const FULL_TURN_RADIANS = Math.PI * 2;
const BATHER_WALK_CYCLE_DISTANCE = 7;

async function loadBatherSource() {
  const response = await fetch(BATHER_SOURCE_PATH);

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${BATHER_SOURCE_PATH}`);
  }

  return response.json();
}

function createModelView(model, primitives) {
  return {
    ...model,
    primitives
  };
}

function createBatherRig(model, source) {
  const parts = source.graph?.children || [];
  const leftLegIndex = parts.findIndex((part) => part.name === "left-leg");
  const rightLegIndex = parts.findIndex((part) => part.name === "right-leg");

  if (leftLegIndex < 0 || rightLegIndex < 0) {
    throw new Error("Banhista precisa das partes left-leg e right-leg.");
  }

  const createLeg = (partIndex) => {
    const sourcePart = parts[partIndex];
    const position = sourcePart.transform?.pos || {};

    return {
      model: createModelView(model, [model.primitives[partIndex]]),
      source: sourcePart,
      pivot: [
        (Number(position.x) || 0) * model.scale + model.offset[0],
        (Number(position.y) || 0) * model.scale + model.offset[1],
        (Number(position.z) || 0) * model.scale + model.offset[2]
      ]
    };
  };

  return {
    bodyModel: createModelView(
      model,
      model.primitives.filter((primitive, index) => (
        index !== leftLegIndex && index !== rightLegIndex
      ))
    ),
    leftLeg: createLeg(leftLegIndex),
    rightLeg: createLeg(rightLegIndex),
    motionDuration: Math.max(0.001, Number(source.metadata?.motion_duration) || 1)
  };
}

function evaluateLegPitch(sourcePart, animationTimeSeconds, motionDuration) {
  const localTime = (
    (animationTimeSeconds % motionDuration) + motionDuration
  ) % motionDuration;
  const clips = sourcePart.motions?.tracks?.flat() || [];
  let rotation = Number(sourcePart.transform?.rot?.x) || 0;

  for (const clip of clips) {
    if (clip.prop !== "rot" || !clip.axises?.includes("x")) {
      continue;
    }

    const start = Number(clip.start) || 0;
    const stop = Number(clip.stop) || start;
    const duration = Math.max(0.001, stop - start);
    const progress = Math.min(1, Math.max(0, (localTime - start) / duration));

    rotation += (Number(clip.delta) || 0) * FULL_TURN_RADIANS * progress;
  }

  return rotation;
}

function isNpcWalking(npc) {
  return (
    npc.state === NPC_STATES.WALKING_TO_ACTIVITY ||
    npc.state === NPC_STATES.RETURNING_HOME
  );
}

function buildBodyInstances({ npcs, terrainSurfaceY }) {
  return npcs
    .filter((npc) => npc.type === NPC_TYPES.BATHER)
    .map((npc) => ({
      id: npc.id,
      offset: [npc.position[0], terrainSurfaceY, npc.position[1]],
      scale: npc.scale,
      yaw: BATHER_MODEL_FACE_YAW_OFFSET + npc.yaw
    }));
}

function buildLegInstances({ npcs, terrainSurfaceY, leg, motionDuration }) {
  return npcs
    .filter((npc) => npc.type === NPC_TYPES.BATHER)
    .map((npc) => {
      const yaw = BATHER_MODEL_FACE_YAW_OFFSET + npc.yaw;
      const animationTimeSeconds = (
        npc.walkDistance / BATHER_WALK_CYCLE_DISTANCE
      ) * motionDuration;
      const pitch = isNpcWalking(npc) ? evaluateLegPitch(
        leg.source,
        animationTimeSeconds,
        motionDuration
      ) : 0;
      const pivotY = leg.pivot[1] * npc.scale;
      const pivotZ = leg.pivot[2] * npc.scale;
      const pitchSine = Math.sin(pitch);
      const pitchCosine = Math.cos(pitch);
      const offsetY = pivotY - (pivotY * pitchCosine - pivotZ * pitchSine);
      const localOffsetZ = pivotZ - (pivotY * pitchSine + pivotZ * pitchCosine);

      return {
        id: `${npc.id}-${leg.source.name}`,
        offset: [
          npc.position[0] - localOffsetZ * Math.sin(yaw),
          terrainSurfaceY + offsetY,
          npc.position[1] + localOffsetZ * Math.cos(yaw)
        ],
        scale: npc.scale,
        yaw,
        pitch
      };
    });
}

function buildBatherPartInstances({ npcs, terrainSurfaceY, rig }) {
  return {
    body: buildBodyInstances({ npcs, terrainSurfaceY }),
    leftLeg: buildLegInstances({
      npcs,
      terrainSurfaceY,
      leg: rig.leftLeg,
      motionDuration: rig.motionDuration
    }),
    rightLeg: buildLegInstances({
      npcs,
      terrainSurfaceY,
      leg: rig.rightLeg,
      motionDuration: rig.motionDuration
    })
  };
}

export async function loadNpcAssets({ gl, onStatus }) {
  const [batherModel, batherSource, sharkModel] = await Promise.all([
    loadTexturedModel({
      gl,
      gltfPath: "./npcs/bather-1/bather-2.gltf",
      binPath: "./npcs/bather-1/bather-1.bin",
      texturePath: "./npcs/bather-1/bather-3.png",
      normalizedSize: 6.2,
      onStatus
    }),
    loadBatherSource(),
    loadTexturedModel({
      gl,
      gltfPath: "./npcs/shark/shark.gltf",
      binPath: "./npcs/shark/shark.bin",
      texturePath: "./npcs/shark/shark.png",
      normalizedSize: 12,
      onStatus
    })
  ]);

  return {
    batherRig: createBatherRig(batherModel, batherSource),
    sharkModel
  };
}

export function createNpcSceneObjects({ npcAssets, npcs, terrainSurfaceY }) {
  const { batherRig, sharkModel } = npcAssets;
  const instances = buildBatherPartInstances({
    npcs,
    terrainSurfaceY,
    rig: batherRig
  });

  const sceneObjects = [
    {
      worldObject: "npc",
      npcType: NPC_TYPES.BATHER,
      npcPart: "body",
      model: batherRig.bodyModel,
      instances: instances.body,
      brightness: 1.05
    },
    {
      worldObject: "npc",
      npcType: NPC_TYPES.BATHER,
      npcPart: "left-leg",
      npcRigPart: batherRig.leftLeg,
      npcMotionDuration: batherRig.motionDuration,
      model: batherRig.leftLeg.model,
      instances: instances.leftLeg,
      brightness: 1.05
    },
    {
      worldObject: "npc",
      npcType: NPC_TYPES.BATHER,
      npcPart: "right-leg",
      npcRigPart: batherRig.rightLeg,
      npcMotionDuration: batherRig.motionDuration,
      model: batherRig.rightLeg.model,
      instances: instances.rightLeg,
      brightness: 1.05
    }
  ];

  if (sharkModel) {
    sceneObjects.push({
      worldObject: "shark",
      npcType: "shark",
      model: sharkModel,
      instances: [],
      brightness: 1.08,
      wave: {
        strength: 0.2,
        scale: 0.45,
        speed: 1.6,
        chop: 0.18,
        direction: [1, 0]
      },
      modelFaceYawOffset: SHARK_MODEL_FACE_YAW_OFFSET
    });
  }

  return sceneObjects;
}

export function updateNpcSceneObjects({ sceneObjects, npcs, terrainSurfaceY }) {
  const bodySceneObject = sceneObjects.find((sceneObject) => sceneObject.npcPart === "body");
  const leftLegSceneObject = sceneObjects.find((sceneObject) => sceneObject.npcPart === "left-leg");
  const rightLegSceneObject = sceneObjects.find((sceneObject) => sceneObject.npcPart === "right-leg");

  if (!bodySceneObject || !leftLegSceneObject || !rightLegSceneObject) {
    return;
  }

  const rig = {
    bodyModel: bodySceneObject.model,
    leftLeg: leftLegSceneObject.npcRigPart,
    rightLeg: rightLegSceneObject.npcRigPart,
    motionDuration: leftLegSceneObject.npcMotionDuration
  };
  const instances = buildBatherPartInstances({ npcs, terrainSurfaceY, rig });

  bodySceneObject.instances = instances.body;
  leftLegSceneObject.instances = instances.leftLeg;
  rightLegSceneObject.instances = instances.rightLeg;
}
