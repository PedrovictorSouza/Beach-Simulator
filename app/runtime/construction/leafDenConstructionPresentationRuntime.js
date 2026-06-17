import {
  getConstructionCloudBurstBillboards,
  getLeafDenConstructionBillboards
} from "./constructionBillboards.js";
import {
  getActiveConstructionCloudBursts,
  syncConstructionCloudBurstEffects,
  syncLeafDenConstructionClouds
} from "./constructionCloudEffects.js";
import {
  getLeafDenConstructionProgress,
  isLeafDenBusyCompanionTarget,
  isLeafDenConstructionActive
} from "./leafDenConstructionState.js";

function defaultNowMs() {
  return Date.now();
}

function defaultNowSeconds() {
  return 0;
}

export function createLeafDenConstructionPresentationRuntime({
  session = {},
  getStoryState = () => ({}),
  getNowMs = defaultNowMs,
  getNowSeconds = defaultNowSeconds
} = {}) {
  function getStoryStateValue() {
    return getStoryState?.() || {};
  }

  function isActive() {
    return isLeafDenConstructionActive({
      storyState: getStoryStateValue(),
      leafDen: session.leafDen
    });
  }

  function isBusyCompanionTarget(target) {
    return isLeafDenBusyCompanionTarget({
      active: isActive(),
      target
    });
  }

  function getProgress(nowMs = getNowMs()) {
    return getLeafDenConstructionProgress({
      storyState: getStoryStateValue(),
      nowMs
    });
  }

  function getActiveCloudBursts(nowMs = getNowMs()) {
    return getActiveConstructionCloudBursts(session, nowMs);
  }

  function syncCloudBurstEffects(nowSeconds = getNowSeconds()) {
    return syncConstructionCloudBurstEffects({
      session,
      nowMs: getNowMs(),
      nowSeconds
    });
  }

  function syncConstructionClouds(nowSeconds = getNowSeconds()) {
    return syncLeafDenConstructionClouds({
      session,
      active: isActive(),
      position: session.leafDen?.position,
      nowSeconds
    });
  }

  function getConstructionBillboards(uvRect, nowSeconds = getNowSeconds()) {
    return getLeafDenConstructionBillboards({
      active: isActive(),
      leafDen: session.leafDen,
      progress: getProgress(),
      barBackTexture: session.squirtleWaterStaminaBackTexture,
      barFillTexture: session.charmanderCarbonFillTexture || session.squirtleWaterStaminaBackTexture,
      starTexture: session.logChairStarTexture || session.natureRevivalSparkTexture,
      uvRect,
      nowSeconds
    });
  }

  function getCloudBurstBillboards(uvRect, nowSeconds = getNowSeconds()) {
    return getConstructionCloudBurstBillboards({
      bursts: getActiveCloudBursts(),
      starTexture: session.logChairStarTexture || session.natureRevivalSparkTexture,
      uvRect,
      nowSeconds
    });
  }

  return {
    getActiveCloudBursts,
    getCloudBurstBillboards,
    getConstructionBillboards,
    getProgress,
    isActive,
    isBusyCompanionTarget,
    syncCloudBurstEffects,
    syncConstructionClouds
  };
}
