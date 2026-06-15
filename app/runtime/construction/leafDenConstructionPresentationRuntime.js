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

export function createLeafDenConstructionPresentationRuntime({
  session = {},
  getStoryState = () => ({}),
  getNowMs = defaultNowMs
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

  function syncCloudBurstEffects(nowSeconds = 0) {
    return syncConstructionCloudBurstEffects({
      session,
      nowMs: getNowMs(),
      nowSeconds
    });
  }

  function syncConstructionClouds(nowSeconds = 0) {
    return syncLeafDenConstructionClouds({
      session,
      active: isActive(),
      position: session.leafDen?.position,
      nowSeconds
    });
  }

  function getConstructionBillboards(uvRect, nowSeconds = 0) {
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

  function getCloudBurstBillboards(uvRect, nowSeconds = 0) {
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
