import {
  CHARMANDER_CARBON_VISUAL_DECREASE_DURATION,
  CHARMANDER_CARBON_VISUAL_INCREASE_DURATION,
  SQUIRTLE_WATER_GUN_BASE_LEVEL,
  SQUIRTLE_WATER_GUN_EVOLUTION_MAX_USES,
  SQUIRTLE_WATER_GUN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MAX_SPEED_MULTIPLIER,
  SQUIRTLE_WATER_GUN_MIN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MIN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_USE_COUNT_FLAG,
  SQUIRTLE_WATER_GUN_USES_PER_LEVEL,
  SQUIRTLE_WATER_STAMINA_COST,
  SQUIRTLE_WATER_STAMINA_MAX,
  SQUIRTLE_WATER_STAMINA_RECHARGE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_DECREASE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_INCREASE_DURATION
} from "./fieldMoveTuning.js";
import {
  CHARMANDER_FIRE_CARBON_USES_FLAG,
  CHARMANDER_FIRE_USES_PER_CARBON
} from "../../../world/gameplayInteractions.js";
import { CARBON_ITEM_ID } from "../../../gameplayContent.js";

const NOOP = () => {};

const DEFAULT_CONFIG = Object.freeze({
  squirtleWaterGunUseCountFlag: SQUIRTLE_WATER_GUN_USE_COUNT_FLAG,
  squirtleWaterGunBaseLevel: SQUIRTLE_WATER_GUN_BASE_LEVEL,
  squirtleWaterGunUsesPerLevel: SQUIRTLE_WATER_GUN_USES_PER_LEVEL,
  squirtleWaterGunEvolutionMaxUses: SQUIRTLE_WATER_GUN_EVOLUTION_MAX_USES,
  squirtleWaterGunMaxSpeedMultiplier: SQUIRTLE_WATER_GUN_MAX_SPEED_MULTIPLIER,
  squirtleWaterGunSprayDuration: SQUIRTLE_WATER_GUN_SPRAY_DURATION,
  squirtleWaterGunMinSprayDuration: SQUIRTLE_WATER_GUN_MIN_SPRAY_DURATION,
  squirtleWaterGunImpactTime: SQUIRTLE_WATER_GUN_IMPACT_TIME,
  squirtleWaterGunMinImpactTime: SQUIRTLE_WATER_GUN_MIN_IMPACT_TIME,
  squirtleWaterStaminaMax: SQUIRTLE_WATER_STAMINA_MAX,
  squirtleWaterStaminaCost: SQUIRTLE_WATER_STAMINA_COST,
  squirtleWaterStaminaRechargeDuration: SQUIRTLE_WATER_STAMINA_RECHARGE_DURATION,
  squirtleWaterStaminaVisualDecreaseDuration: SQUIRTLE_WATER_STAMINA_VISUAL_DECREASE_DURATION,
  squirtleWaterStaminaVisualIncreaseDuration: SQUIRTLE_WATER_STAMINA_VISUAL_INCREASE_DURATION,
  charmanderFireCarbonUsesFlag: CHARMANDER_FIRE_CARBON_USES_FLAG,
  charmanderFireUsesPerCarbon: CHARMANDER_FIRE_USES_PER_CARBON,
  charmanderCarbonVisualDecreaseDuration: CHARMANDER_CARBON_VISUAL_DECREASE_DURATION,
  charmanderCarbonVisualIncreaseDuration: CHARMANDER_CARBON_VISUAL_INCREASE_DURATION,
  carbonItemId: CARBON_ITEM_ID
});

function defaultClamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function defaultMoveValueToward(current, target, maxStep) {
  if (current < target) {
    return Math.min(target, current + maxStep);
  }
  return Math.max(target, current - maxStep);
}

export function createCompanionAbilityResourcesRuntime({
  session = {},
  controls = {},
  clamp01 = defaultClamp01,
  moveValueToward = defaultMoveValueToward,
  onSquirtleRechargeComplete = NOOP,
  config = {}
} = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config
  };

  function getSquirtleWaterGunUseCount() {
    return Math.max(
      0,
      Math.floor(Number(controls.storyState?.flags?.[settings.squirtleWaterGunUseCountFlag] || 0))
    );
  }

  function getSquirtleWaterGunLevel() {
    return settings.squirtleWaterGunBaseLevel +
      Math.floor(getSquirtleWaterGunUseCount() / settings.squirtleWaterGunUsesPerLevel);
  }

  function getSquirtleWaterStaminaMax() {
    return settings.squirtleWaterStaminaMax +
      Math.max(0, getSquirtleWaterGunLevel() - settings.squirtleWaterGunBaseLevel);
  }

  function getSquirtleWaterGunSpeedMultiplier() {
    const progress = clamp01(
      getSquirtleWaterGunUseCount() / settings.squirtleWaterGunEvolutionMaxUses
    );
    return 1 + (settings.squirtleWaterGunMaxSpeedMultiplier - 1) * progress;
  }

  function getSquirtleWaterGunSprayDuration(speedMultiplier = getSquirtleWaterGunSpeedMultiplier()) {
    return Math.max(
      settings.squirtleWaterGunMinSprayDuration,
      settings.squirtleWaterGunSprayDuration / Math.max(1, speedMultiplier)
    );
  }

  function getSquirtleWaterGunImpactTime(speedMultiplier = getSquirtleWaterGunSpeedMultiplier()) {
    return Math.max(
      settings.squirtleWaterGunMinImpactTime,
      settings.squirtleWaterGunImpactTime / Math.max(1, speedMultiplier)
    );
  }

  function recordSquirtleWaterGunUse() {
    if (!controls.storyState) {
      return;
    }

    controls.storyState.flags ||= {};
    controls.storyState.flags[settings.squirtleWaterGunUseCountFlag] =
      getSquirtleWaterGunUseCount() + 1;
  }

  function getSquirtleWaterStaminaState() {
    const staminaMax = getSquirtleWaterStaminaMax();

    if (!session.squirtleWaterStamina) {
      session.squirtleWaterStamina = {
        current: staminaMax,
        visualCurrent: staminaMax,
        max: staminaMax,
        charging: false,
        chargeElapsed: 0
      };
    }

    const previousMax = Math.max(
      1,
      Number(session.squirtleWaterStamina.max || staminaMax)
    );
    const maxIncrease = Math.max(0, staminaMax - previousMax);
    session.squirtleWaterStamina.max = staminaMax;
    session.squirtleWaterStamina.current = Math.min(
      staminaMax,
      Math.max(0, Number(session.squirtleWaterStamina.current || 0)) + maxIncrease
    );
    session.squirtleWaterStamina.visualCurrent = Math.min(
      staminaMax,
      Math.max(
        0,
        Number.isFinite(session.squirtleWaterStamina.visualCurrent) ?
          session.squirtleWaterStamina.visualCurrent :
          session.squirtleWaterStamina.current
      ) + maxIncrease
    );
    return session.squirtleWaterStamina;
  }

  function isSquirtleWaterCharging() {
    return Boolean(getSquirtleWaterStaminaState().charging);
  }

  function beginSquirtleWaterRecharge() {
    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging) {
      return;
    }

    stamina.current = 0;
    stamina.charging = true;
    stamina.chargeElapsed = 0;
  }

  function consumeSquirtleWaterStamina() {
    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging || stamina.current <= 0) {
      beginSquirtleWaterRecharge();
      return false;
    }

    stamina.current = Math.max(0, stamina.current - settings.squirtleWaterStaminaCost);
    return true;
  }

  function consumeSquirtleWaterStaminaForInstantAction() {
    if (!consumeSquirtleWaterStamina()) {
      return false;
    }

    if (getSquirtleWaterStaminaState().current <= 0) {
      beginSquirtleWaterRecharge();
    }

    return true;
  }

  function updateSquirtleWaterStamina(deltaTime) {
    const stamina = getSquirtleWaterStaminaState();

    if (stamina.charging) {
      stamina.chargeElapsed += deltaTime;
      const progress = clamp01(stamina.chargeElapsed / settings.squirtleWaterStaminaRechargeDuration);
      stamina.current = stamina.max * progress;

      if (progress >= 1) {
        stamina.current = stamina.max;
        stamina.charging = false;
        stamina.chargeElapsed = 0;
        onSquirtleRechargeComplete();
      }
    }

    const visualDuration =
      stamina.current < stamina.visualCurrent ?
        settings.squirtleWaterStaminaVisualDecreaseDuration :
        settings.squirtleWaterStaminaVisualIncreaseDuration;
    const maxVisualStep = (stamina.max * deltaTime) / Math.max(0.001, visualDuration);
    stamina.visualCurrent = moveValueToward(
      stamina.visualCurrent,
      stamina.current,
      maxVisualStep
    );
  }

  function getCharmanderCarbonUseCount() {
    const uses = Math.floor(Number(
      controls.storyState?.flags?.[settings.charmanderFireCarbonUsesFlag] || 0
    ));
    return Math.min(
      settings.charmanderFireUsesPerCarbon - 1,
      Math.max(0, uses)
    );
  }

  function getCharmanderCarbonEnergyRatio() {
    const carbonCount = Math.max(
      0,
      Math.floor(Number(controls.inventory?.[settings.carbonItemId] || 0))
    );

    if (carbonCount <= 0) {
      return 0;
    }

    const availableUses = Math.max(
      0,
      carbonCount * settings.charmanderFireUsesPerCarbon - getCharmanderCarbonUseCount()
    );
    return clamp01(availableUses / settings.charmanderFireUsesPerCarbon);
  }

  function getCharmanderCarbonEnergyState() {
    const current = getCharmanderCarbonEnergyRatio();

    if (!session.charmanderCarbonEnergy) {
      session.charmanderCarbonEnergy = {
        current,
        visualCurrent: current
      };
    }

    session.charmanderCarbonEnergy.current = current;
    session.charmanderCarbonEnergy.visualCurrent = clamp01(
      Number.isFinite(session.charmanderCarbonEnergy.visualCurrent) ?
        session.charmanderCarbonEnergy.visualCurrent :
        current
    );
    return session.charmanderCarbonEnergy;
  }

  function updateCharmanderCarbonEnergy(deltaTime) {
    const energy = getCharmanderCarbonEnergyState();
    const visualDuration =
      energy.current < energy.visualCurrent ?
        settings.charmanderCarbonVisualDecreaseDuration :
        settings.charmanderCarbonVisualIncreaseDuration;
    const maxVisualStep = deltaTime / Math.max(0.001, visualDuration);
    energy.visualCurrent = moveValueToward(
      energy.visualCurrent,
      energy.current,
      maxVisualStep
    );
  }

  return {
    beginSquirtleWaterRecharge,
    consumeSquirtleWaterStamina,
    consumeSquirtleWaterStaminaForInstantAction,
    getCharmanderCarbonEnergyRatio,
    getCharmanderCarbonEnergyState,
    getCharmanderCarbonUseCount,
    getSquirtleWaterGunImpactTime,
    getSquirtleWaterGunLevel,
    getSquirtleWaterGunSpeedMultiplier,
    getSquirtleWaterGunSprayDuration,
    getSquirtleWaterGunUseCount,
    getSquirtleWaterStaminaMax,
    getSquirtleWaterStaminaState,
    isSquirtleWaterCharging,
    recordSquirtleWaterGunUse,
    updateCharmanderCarbonEnergy,
    updateSquirtleWaterStamina
  };
}
