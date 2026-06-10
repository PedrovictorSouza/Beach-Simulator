import { updateChopperNpcActor as defaultUpdateChopperNpcActor } from "../../session/chopperNpcActor.js";

const NOOP = () => {};

export function createCompanionFrameRuntime({
  session,
  controls,
  rendering,
  audio = {},
  guidePosition = null,
  updateChopperNpcActor = defaultUpdateChopperNpcActor,
  callbacks = {}
} = {}) {
  const {
    isDialogueActive = () => false,
    isGameplayActive = () => false,
    getRepairBoxInvestigationTarget = () => null,
    isWaterGunSfxBurstActive = () => false,
    updateBulbasaurRepairBoxRustle = NOOP,
    updateBulbasaurEncounter = NOOP,
    updateCharmanderEncounter = NOOP,
    updateCharmanderFireAction = NOOP,
    updateTimburrEncounter = NOOP,
    updateTimburrBuildBlockAction = NOOP,
    syncCompanionRepairModules = NOOP,
    syncBeeFieldRepairBox = NOOP,
    syncBeeFieldBees = NOOP,
    updateSquirtleReassembly = NOOP,
    updateSquirtleWaterStamina = NOOP,
    updateCharmanderCarbonEnergy = NOOP,
    updateSquirtleWaterGunAction = NOOP,
    updateBulbasaurLeafageAction = NOOP,
    updateSquirtleIdlePatrol = NOOP,
    updateBulbasaurIdlePatrol = NOOP
  } = callbacks;

  function update({
    deltaTime = 0,
    now = 0,
    activeMoveId = null,
    gameplayOpeningMovementLocked = false,
    cinematicActive = false,
    tutorialActive = false,
    pokedexModalOpen = false,
    dialogueActive = false,
    skillLearnActive = false,
    scriptedInteractionActive = false
  } = {}) {
    const nowSeconds = now * 0.001;
    const chopperBulbasaurRepairBoxInvestigationTarget =
      getRepairBoxInvestigationTarget();

    updateChopperNpcActor(session?.chopperNpcActor, {
      deltaTime,
      storyState: controls?.storyState,
      isNpcActive: rendering?.isNpcActive,
      isDialogueActive,
      guidePosition,
      investigationTarget: chopperBulbasaurRepairBoxInvestigationTarget
    });
    updateBulbasaurRepairBoxRustle(deltaTime);
    updateBulbasaurEncounter(deltaTime);
    updateCharmanderEncounter(deltaTime, { activeMoveId });
    updateCharmanderFireAction(deltaTime);
    audio.updateFireFlame?.({
      active: session?.charmanderFireAction?.phase === "spray",
      nowSeconds
    });
    updateTimburrEncounter(deltaTime, { activeMoveId });
    updateTimburrBuildBlockAction(deltaTime, now);
    syncCompanionRepairModules();
    syncBeeFieldRepairBox();
    syncBeeFieldBees(deltaTime);
    updateSquirtleReassembly(deltaTime);
    updateSquirtleWaterStamina(deltaTime);
    updateCharmanderCarbonEnergy(deltaTime);
    updateSquirtleWaterGunAction(deltaTime);
    audio.updateWaterGun?.({
      active: session?.squirtleWaterGunAction?.phase === "spray" ||
        isWaterGunSfxBurstActive(nowSeconds),
      nowSeconds
    });
    updateBulbasaurLeafageAction(deltaTime);

    const robotIdlePatrolActive = Boolean(
      isGameplayActive() &&
      !gameplayOpeningMovementLocked &&
      !cinematicActive &&
      !tutorialActive &&
      !pokedexModalOpen &&
      !dialogueActive &&
      !skillLearnActive &&
      !scriptedInteractionActive
    );
    updateSquirtleIdlePatrol(deltaTime, {
      active: robotIdlePatrolActive,
      activeMoveId
    });
    updateBulbasaurIdlePatrol(deltaTime, {
      active: robotIdlePatrolActive,
      activeMoveId
    });

    return {
      chopperBulbasaurRepairBoxInvestigationTarget,
      robotIdlePatrolActive
    };
  }

  return {
    update
  };
}
