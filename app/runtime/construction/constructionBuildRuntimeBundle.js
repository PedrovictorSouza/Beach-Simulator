import {
  createFoundationBuildZoneRuntime,
  getBuilderTutorialFoundationZoneSignature
} from "./foundationBuildZone.js";
import { createFreeBlockBuildRuntime } from "./freeBlockBuildRuntime.js";

export function createConstructionBuildRuntimeBundle({
  controls = null,
  rendering = null,
  session = null,
  callbacks = {},
  config = {},
  runtimes = {}
} = {}) {
  const wallBlockType = config.wallBlockType || "wall";
  const foundationBuildZoneRuntime = createFoundationBuildZoneRuntime({
    session,
    controls,
    rendering,
    freeBlockBuildSessionRuntime: runtimes.freeBlockBuildSessionRuntime,
    worldObjectPlacementBlockerRuntime: runtimes.worldObjectPlacementBlockerRuntime,
    groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
    config: {
      wallBlockType
    },
    callbacks: {
      getTerrainColliders: callbacks.getTerrainColliders,
      getActorPosition: callbacks.getActorPosition,
      getNowMs: callbacks.getNowMs
    }
  });
  const foundationBuildZoneCameraFocusRuntime =
    callbacks.createFoundationBuildZoneCameraFocusRuntime?.({
      foundationBuildZoneRuntime,
      getZoneSignature:
        callbacks.getFoundationBuildZoneSignature ||
        getBuilderTutorialFoundationZoneSignature
    }) || null;
  const freeBlockBuildRuntime = createFreeBlockBuildRuntime({
    session,
    controls,
    freeBlockBuildSessionRuntime: runtimes.freeBlockBuildSessionRuntime,
    foundationBuildZoneRuntime,
    companionConstructionBlockerRuntime: runtimes.companionConstructionBlockerRuntime,
    playerModelRuntime: runtimes.playerModelRuntime,
    groundActionFeedbackRuntime: runtimes.groundActionFeedbackRuntime,
    config: {
      wallBlockType,
      dropSize: config.dropSize,
      pickupRadius: config.pickupRadius,
      spread: config.spread
    },
    callbacks: {
      getTerrainColliders: callbacks.getTerrainColliders,
      isPositionInsideCollider: callbacks.isPositionInsideCollider,
      resolvePreviewValidity: callbacks.resolvePreviewValidity,
      resolveDisplacementPosition: callbacks.resolveDisplacementPosition,
      playPlacedSound: callbacks.playPlacedSound,
      playInvalidSound: callbacks.playInvalidSound,
      playImpactSound: callbacks.playImpactSound,
      pushNotice: callbacks.pushNotice
    }
  });

  return {
    foundationBuildZoneCameraFocusRuntime,
    foundationBuildZoneRuntime,
    freeBlockBuildRuntime
  };
}
