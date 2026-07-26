import { createWorldRenderer } from "./rendering/worldRenderer.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCursorInput } from "./input/cursor.js";
import {
  getBeachEntryPosition,
  updateTerrainSceneObjects
} from "./terrain/terrainWorld.js";
import { updateNpcSceneObjects } from "./npcs/npcWorld.js";
import { NPC_TYPES } from "./npcs/npcSystem.js";
import { createSceneryPlaceholderSceneObjects } from "./scenery/sceneryWorld.js";
import { createBatherCounterView } from "./ui/batherCounterView.js";
import { createMoneyCounterView } from "./ui/moneyCounterView.js";
import { createRatingCounterView } from "./ui/ratingCounterView.js";
import { createTaskListModel, createTaskListView } from "./ui/taskList.js";
import { createBeachEconomyModel } from "./economy/beachEconomyModel.js";
import { createBeachRatingModel } from "./ratings/beachRatingModel.js";
import {
  createRunSessionModel,
  RUN_PHASES
} from "./run/runSessionModel.js";
import { createDayLifecycleController } from "./run/dayLifecycleController.js";
import { createRunPresentationView } from "./ui/runPresentationView.js";
import { createTimeManager } from "./time/timeManager.js";
import { createTimeCounterView } from "./ui/timeCounterView.js";
import { createNpcComplaintView } from "./ui/npcComplaintView.js";
import { createPickupFeedbackView } from "./ui/pickupFeedbackView.js";
import { createBeverageStoreModalView } from "./ui/beverageStoreModalView.js";
import { createBuildingButtonView } from "./ui/buildingButton.js";
import { createOnboardingView } from "./onboarding/onboardingView.js";
import { createCleanBeachGuide } from "./onboarding/cleanBeachGuide.js";
import {
  createBuildingChoiceModel,
  createBuildingChoiceView
} from "./ui/buildingChoice.js";
import {
  BUILDING_TYPES,
  createBuildingServicesModel
} from "./buildings/buildingServicesModel.js";
import { createPlayerExperienceModel } from "./experience/playerExperienceModel.js";
import {
  SPAWN_TYPES
} from "./spawn/spawnManager.js";
import {
  getSpawnableObjectDto,
  SPAWNABLE_OBJECT_TRAITS,
  SPAWN_SOURCES
} from "./spawn/spawnableObjectDto.js";
import {
  addWorldObjectPlaceholderSceneInstance,
  removeWorldObjectSceneInstance,
  setHoveredWorldObjectSceneInstance
} from "./objects/worldObjectWorld.js";
import {
  createWorldOverlayProjector,
  findWorldObjectSelection,
} from "./interaction/worldObjectInteraction.js";
import { createCleanBeachController } from "./interaction/cleanBeachController.js";
import { loadBeachWorld } from "./world/beachWorld.js";
import { createHeatMeterView, createHeatModel } from "./weather/heatFeature.js";

const PICKUP_REWARD_IN_CENTS = 500;
const BEVERAGE_SALE_IN_CENTS = 200;
const CLEAN_BEACH_TASK_ID = "clean-the-beach";
const CLEAN_BEACH_TARGET = 5;
const VISITOR_CLEANUP_TASK_ID = "clean-up-after-visitor";
const WELCOME_BATHERS_TASK_ID = "welcome-more-bathers";
const BUILD_FIRST_CONSTRUCTION_TASK_ID = "build-first-construction";
const BUILDING_ACCESS_COST_IN_CENTS = 500;
const BATHER_ONBOARDING_NOTICE = "Bathers will start to populate your beach, they are the customers, treat them kindly  and they will comeback!";

class TerrainGameManager {
  constructor() {
    this.started = false;
    this.windowRef = window;
    this.root = null;
    this.canvas = null;
    this.statusElement = null;
    this.fpsElement = null;
    this.renderer = null;
    this.camera = null;
    this.cursor = null;
    this.terrainAssets = null;
    this.terrainSceneObjects = [];
    this.beachGrid = null;
    this.npcSceneObjects = [];
    this.npcSystem = null;
    this.spawnManager = null;
    this.worldObjectSceneObjects = [];
    this.visitorLitterObjectIds = new Set();
    this.pendingBatherRevenue = [];
    this.batherCounterView = null;
    this.beachEconomyModel = null;
    this.moneyCounterView = null;
    this.unsubscribeBeachEconomy = null;
    this.beachRatingModel = null;
    this.ratingCounterView = null;
    this.unsubscribeBeachRating = null;
    this.taskListModel = null;
    this.taskListView = null;
    this.cleanBeachController = null;
    this.cleanBeachGuide = null;
    this.unsubscribeTaskList = null;
    this.runSessionModel = null;
    this.dayLifecycleController = null;
    this.runPresentationView = null;
    this.onboardingView = null;
    this.buildingChoiceModel = null;
    this.buildingChoiceView = null;
    this.beverageStoreModalView = null;
    this.buildingServicesModel = null;
    this.buildingChoiceActive = false;
    this.buildingButtonView = null;
    this.unsubscribeBuildingEconomy = null;
    this.buildingAccessUnlocked = false;
    this.buildingChoiceUsed = false;
    this.buildingOnboardingShown = false;
    this.selectedRunBuilding = null;
    this.playerExperienceModel = null;
    this.timeManager = null;
    this.timeCounterView = null;
    this.heatModel = null;
    this.heatMeterView = null;
    this.npcComplaintView = null;
    this.pickupFeedbackView = null;
    this.unsubscribeTimeManager = null;
    this.beachHouseSceneObjects = [];
    this.runBuildingSceneObjects = [];
    this.terrainSurfaceY = 0;
    this.resolveWorldObjectPosition = null;
    this.sceneObjects = [];
    this.startTimeMs = 0;
    this.lastFrameTimeMs = 0;
    this.fpsFrameCount = 0;
    this.fpsSampleStartedMs = 0;
    this.animationFrameId = null;
  }

  start({ root, windowRef = window } = {}) {
    if (this.started) {
      return this;
    }

    if (!root) {
      throw new Error("GameManager precisa de um elemento root.");
    }

    this.started = true;
    this.root = root;
    this.windowRef = windowRef;
    this.startTimeMs = this.getNowMs();
    this.lastFrameTimeMs = this.startTimeMs;
    this.camera = createStaticCamera();
    this.playerExperienceModel = createPlayerExperienceModel({
      initialPressureCount: CLEAN_BEACH_TARGET
    });
    this.mount();
    this.initializeUi();
    this.initializeCursor();
    this.initializeRenderer();
    this.loadWorld()
      .then(async (sceneObjects) => {
        this.sceneObjects = sceneObjects;
        this.cleanBeachGuide = createCleanBeachGuide({
          root: this.root,
          canvas: this.canvas,
          camera: this.camera,
          sceneObjects: this.worldObjectSceneObjects,
          taskListModel: this.taskListModel,
          playerExperienceModel: this.playerExperienceModel,
          onboardingView: this.onboardingView,
          isRunActive: () => this.isRunActive(),
          taskId: CLEAN_BEACH_TASK_ID,
          windowRef: this.windowRef
        });
        this.statusElement?.remove();
        this.render();
        this.startRenderLoop();
        this.windowRef.addEventListener("resize", () => {
          this.cleanBeachGuide.markProjectionDirty();
          this.render();
        });
        await this.beginRun();
      })
      .catch((error) => {
        console.error(error);
        this.setStatus("Falha ao carregar terrain.");
      });

    return this;
  }

  mount() {
    this.root.innerHTML = `
      <canvas class="world-canvas" aria-label="Terrain"></canvas>
      <section class="game-hud" aria-label="Game status">
        <aside class="hud-stack" aria-label="Beach status"></aside>
      </section>
      <div class="boot-status" role="status">Carregando terrain...</div>
      <div class="fps-counter" aria-label="Frames por segundo">FPS --</div>
    `;
    this.canvas = this.root.querySelector(".world-canvas");
    this.statusElement = this.root.querySelector(".boot-status");
    this.fpsElement = this.root.querySelector(".fps-counter");
  }

  initializeCursor() {
    this.canvas.classList.add("cursor-debug-ready");
    this.cursor = createCursorInput({
      target: this.canvas,
      windowRef: this.windowRef,
      onChange: (cursorState) => this.applyCursorDebugState(cursorState),
      onPan: (cursorState) => this.applyCursorPan(cursorState),
      onRotate: (cursorState) => this.applyCursorRotate(cursorState),
      onZoom: (cursorState) => this.applyCursorZoom(cursorState),
      onPrimaryPress: (cursorState) => this.hasWorldObjectInteraction(cursorState),
      onSelect: (cursorState) => this.selectWorldObject(cursorState)
    });
  }

  initializeUi() {
    const gameHudRoot = this.root.querySelector(".game-hud");
    const hudRoot = this.root.querySelector(".hud-stack");

    this.batherCounterView = createBatherCounterView({ root: hudRoot });
    this.batherCounterView.render(0);
    this.beachEconomyModel = createBeachEconomyModel();
    this.moneyCounterView = createMoneyCounterView({ root: hudRoot });
    this.unsubscribeBeachEconomy = this.beachEconomyModel.subscribe(
      (snapshot) => this.updateMoneyCounter(snapshot)
    );
    this.beachRatingModel = createBeachRatingModel();
    this.ratingCounterView = createRatingCounterView({ root: hudRoot });
    this.unsubscribeBeachRating = this.beachRatingModel.subscribe(
      (snapshot) => this.updateRatingCounter(snapshot)
    );
    this.taskListModel = createTaskListModel([{
      id: CLEAN_BEACH_TASK_ID,
      label: "Clean the beach",
      progress: 0,
      target: CLEAN_BEACH_TARGET
    }]);
    this.cleanBeachController = createCleanBeachController({
      economyModel: this.beachEconomyModel,
      playerExperienceModel: this.playerExperienceModel,
      taskListModel: this.taskListModel,
      taskId: CLEAN_BEACH_TASK_ID,
      pickupRewardInCents: PICKUP_REWARD_IN_CENTS
    });
    this.taskListView = createTaskListView({ root: hudRoot });
    this.unsubscribeTaskList = this.taskListModel.subscribe(
      (tasks) => this.taskListView.render(tasks)
    );
    this.runSessionModel = createRunSessionModel();
    this.runPresentationView = createRunPresentationView({
      root: this.root,
      hudRoot: gameHudRoot
    });
    this.onboardingView = createOnboardingView({
      root: this.root,
      windowRef: this.windowRef
    });
    this.buildingChoiceModel = createBuildingChoiceModel();
    this.buildingChoiceView = createBuildingChoiceView({ root: this.root });
    this.buildingButtonView = createBuildingButtonView({
      root: gameHudRoot,
      onActivate: () => {
        void this.openBuildingChoice();
      }
    });
    this.unsubscribeBuildingEconomy = this.beachEconomyModel.subscribe(
      (snapshot) => this.updateBuildingAccess(snapshot)
    );
    this.beverageStoreModalView = createBeverageStoreModalView({ root: this.root });
    this.buildingServicesModel = createBuildingServicesModel();
    this.timeManager = createTimeManager();
    this.timeCounterView = createTimeCounterView({ root: gameHudRoot });
    this.heatModel = createHeatModel();
    this.heatMeterView = createHeatMeterView({ root: gameHudRoot });
    this.heatMeterView.render(this.heatModel.getSnapshot());
    this.npcComplaintView = createNpcComplaintView({ root: this.root });
    this.pickupFeedbackView = createPickupFeedbackView({
      root: this.root,
      windowRef: this.windowRef
    });
    this.unsubscribeTimeManager = this.timeManager.subscribe(
      (snapshot) => this.updateTimeCounter(snapshot)
    );
  }

  async beginRun() {
    const { day } = this.runSessionModel.getSnapshot();

    await this.runPresentationView.playDay(day);
    this.heatMeterView.render(this.heatModel.startDay());
    this.dayLifecycleController.startDay({
      averageRating: this.beachRatingModel.getSnapshot().averageRating,
      startWithSpawning: day !== 1
    });
    this.runPresentationView.setHudActive(true);

    if (day === 1) {
      const valuableInstance = this.worldObjectSceneObjects
        .flatMap((sceneObject) => sceneObject.instances)
        .find((instance) => getSpawnableObjectDto(instance.spawnableType)
          .traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP));

      if (valuableInstance) {
        const projectToOverlay = createWorldOverlayProjector({
          root: this.root,
          canvas: this.canvas,
          camera: this.camera
        });
        const position = projectToOverlay(
          valuableInstance.id,
          this.worldObjectSceneObjects
        );

        if (position) {
          this.pickupFeedbackView.showValuableHook(position);
        }
      }
      await this.onboardingView.pointTo(
        `[data-task-id="${CLEAN_BEACH_TASK_ID}"] .task-list__progress-row`
      );
      this.cleanBeachGuide.schedule();
    }
  }

  isRunActive() {
    return this.runSessionModel?.getSnapshot().phase === RUN_PHASES.ACTIVE;
  }

  updateBuildingAccess({ moneyInCents = 0 } = {}) {
    const hasAccess = Number(moneyInCents) >= BUILDING_ACCESS_COST_IN_CENTS;
    this.buildingAccessUnlocked = this.buildingAccessUnlocked || hasAccess;
    this.buildingButtonView?.render({
      enabled: this.buildingAccessUnlocked,
      used: this.buildingChoiceUsed
    });

    if (!hasAccess || this.buildingOnboardingShown) {
      return;
    }

    this.taskListModel?.upsert({
      id: BUILD_FIRST_CONSTRUCTION_TASK_ID,
      label: "Build your first construction",
      progress: 0,
      target: 1
    });
    this.buildingOnboardingShown = true;
    void this.onboardingView?.pointTo(".building-button");
  }

  async openBuildingChoice() {
    if (
      !this.isRunActive() ||
      !this.buildingAccessUnlocked ||
      this.buildingChoiceUsed ||
      this.buildingChoiceActive
    ) {
      return;
    }

    this.buildingChoiceActive = true;

    try {
      const choice = this.buildingChoiceModel.startChoice();
      const type = await this.buildingChoiceView.show(choice.options);

      this.selectedRunBuilding = this.buildingChoiceModel.select(type).selected;
      this.buildingServicesModel.addBuilding(type);
      const buildingPosition = this.beachHouseSceneObjects[0]?.instances[0]?.offset;

      this.runBuildingSceneObjects = type === BUILDING_TYPES.LIFEGUARD_BUILDING ?
        this.beachHouseSceneObjects :
        createSceneryPlaceholderSceneObjects({
          gl: this.renderer.getContext(),
          sceneryType: type,
          model: this.terrainAssets.groundModel,
          position: buildingPosition,
          tint: this.selectedRunBuilding.color
        });
      this.sceneObjects.push(...this.runBuildingSceneObjects);
      this.buildingChoiceUsed = true;
      this.buildingButtonView?.render({ enabled: true, used: true });
      this.taskListModel.remove(BUILD_FIRST_CONSTRUCTION_TASK_ID);
      this.taskListModel.remove(CLEAN_BEACH_TASK_ID);
      this.taskListModel.upsert({
        id: VISITOR_CLEANUP_TASK_ID,
        label: "Clean up after a visitor",
        progress: 0,
        target: 1
      });
      this.taskListModel.upsert({
        id: WELCOME_BATHERS_TASK_ID,
        label: "Welcome more bathers",
        progress: 0,
        target: 3
      });
      this.render();
      await this.onboardingView.showNotice(BATHER_ONBOARDING_NOTICE);
      this.dayLifecycleController.startSpawning({
        averageRating: this.beachRatingModel.getSnapshot().averageRating,
        immediateBather: true
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.buildingChoiceActive = false;
    }
  }

  updateBatherCounter(npcs) {
    const batherCount = npcs.reduce((count, npc) => (
      npc.type === NPC_TYPES.BATHER ? count + 1 : count
    ), 0);

    this.batherCounterView?.render(batherCount);
  }

  updateMoneyCounter({ moneyInCents }) {
    this.moneyCounterView?.render(moneyInCents);
  }

  updateRatingCounter(snapshot) {
    this.ratingCounterView?.render(snapshot);
  }

  updateTimeCounter(snapshot) {
    this.timeCounterView?.render(snapshot);
  }

  applyCursorDebugState(cursorState) {
    this.canvas.classList.toggle(
      "cursor-debug-pressed",
      cursorState.pressed || cursorState.panning || cursorState.rotating
    );
    this.canvas.classList.toggle("cursor-debug-space", cursorState.spacePressed);
    this.updateWorldObjectHover(cursorState);
  }

  findSceneObjectAtCursor(cursorState, sceneObjects = this.worldObjectSceneObjects) {
    if (!this.isRunActive() || sceneObjects.length === 0) {
      return null;
    }

    const viewport = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    };

    return findWorldObjectSelection({
      pointer: cursorState,
      sceneObjects,
      viewProjection: this.camera.getViewProjection(viewport.width, viewport.height),
      viewport
    });
  }

  updateWorldObjectHover(cursorState) {
    const selection = cursorState.inside && !cursorState.panning && !cursorState.rotating ?
      this.findSceneObjectAtCursor(cursorState) :
      null;
    const changed = setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: selection?.objectId || null
    });

    if (changed) {
      this.renderIfLoopIsIdle();
    }
  }

  hasWorldObjectInteraction(cursorState) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      return false;
    }

    const beverageStoreSelection = this.selectedRunBuilding?.type ===
      BUILDING_TYPES.BEVERAGE_STORE ?
      this.findSceneObjectAtCursor(cursorState, this.runBuildingSceneObjects) :
      null;

    return Boolean(beverageStoreSelection || this.findSceneObjectAtCursor(cursorState));
  }

  selectWorldObject(cursorState) {
    if (this.buildingChoiceActive) {
      return;
    }

    const beverageStoreSelection = this.selectedRunBuilding?.type ===
      BUILDING_TYPES.BEVERAGE_STORE ?
      this.findSceneObjectAtCursor(cursorState, this.runBuildingSceneObjects) :
      null;

    if (beverageStoreSelection) {
      this.beverageStoreModalView.show();
      return;
    }

    const selection = this.findSceneObjectAtCursor(cursorState);

    if (!selection) {
      return;
    }

    const projectToOverlay = createWorldOverlayProjector({
      root: this.root,
      canvas: this.canvas,
      camera: this.camera
    });
    const position = projectToOverlay(
      selection.objectId,
      this.worldObjectSceneObjects
    );

    const removedObject = removeWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: selection.objectId
    });
    const removedDefinition = removedObject ?
      getSpawnableObjectDto(removedObject.spawnableType) :
      null;
    const progressTaskId = removedObject &&
      this.visitorLitterObjectIds.delete(removedObject.id) ?
      VISITOR_CLEANUP_TASK_ID :
      CLEAN_BEACH_TASK_ID;
    const collection = removedObject ?
      this.cleanBeachController.collect({
        worldObject: removedObject,
        definition: removedDefinition,
        progressTaskId
      }) :
      null;

    if (position && collection?.progressesTask) {
      this.pickupFeedbackView.showCollection({
        ...position,
        valuable: collection.valuable
      });
    }

    if (removedObject) {
      this.beachGrid?.releaseWorldPosition(
        removedObject.offset[0],
        removedObject.offset[2]
      );
    }

    if (collection?.progressesTask) {
      this.cleanBeachGuide.schedule();
    }

    setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: null
    });
    this.renderIfLoopIsIdle();
  }

  applyCursorZoom(cursorState) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      return;
    }

    const changed = this.camera.zoomBy(cursorState.deltaY, {
      x: cursorState.x,
      y: cursorState.y,
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    });

    if (changed && this.renderer) {
      this.playerExperienceModel?.recordNavigation(
        Math.min(Math.abs(cursorState.deltaY) / 120, 1)
      );
      this.cleanBeachGuide.markProjectionDirty();
      this.renderIfLoopIsIdle();
    }
  }

  applyCursorPan(cursorState) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      return;
    }

    this.camera.panByScreenDelta(
      cursorState.deltaX,
      cursorState.invertedPan ? -cursorState.deltaY : cursorState.deltaY,
      {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight
      }
    );
    this.playerExperienceModel?.recordNavigation(
      Math.min(Math.hypot(cursorState.deltaX, cursorState.deltaY) / 40, 1)
    );
    this.cleanBeachGuide.markProjectionDirty();

    if (this.renderer) {
      this.renderIfLoopIsIdle();
    }
  }

  applyCursorRotate(cursorState) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      return;
    }

    const changed = this.camera.rotateByScreenDelta(cursorState.deltaX);

    if (changed && this.renderer) {
      this.playerExperienceModel?.recordNavigation(
        Math.min(Math.abs(cursorState.deltaX) / 80, 1)
      );
      this.cleanBeachGuide.markProjectionDirty();
      this.renderIfLoopIsIdle();
    }
  }

  initializeRenderer() {
    try {
      this.renderer = createWorldRenderer({ canvas: this.canvas });
    } catch (error) {
      this.setStatus("Falha ao inicializar renderizacao.");
      throw error;
    }
  }

  setStatus(message) {
    this.statusElement.textContent = message;
  }

  getNowMs() {
    return this.windowRef.performance?.now?.() ?? Date.now();
  }

  getElapsedSeconds() {
    return (this.getNowMs() - this.startTimeMs) / 1000;
  }

  renderIfLoopIsIdle() {
    if (this.animationFrameId === null) {
      this.render();
    }
  }

  updateFpsCounter(nowMs) {
    if (!this.fpsElement) {
      return;
    }

    if (this.fpsSampleStartedMs === 0) {
      this.fpsSampleStartedMs = nowMs;
    }

    this.fpsFrameCount += 1;
    const elapsedMs = nowMs - this.fpsSampleStartedMs;

    if (elapsedMs < 500) {
      return;
    }

    const fps = Math.round((this.fpsFrameCount * 1000) / elapsedMs);
    this.fpsElement.textContent = `FPS ${fps}`;
    this.fpsFrameCount = 0;
    this.fpsSampleStartedMs = nowMs;
  }

  startRenderLoop() {
    if (this.animationFrameId !== null) {
      return;
    }

    const requestFrame = this.windowRef.requestAnimationFrame?.bind(this.windowRef);
    const scheduleFrame = requestFrame || ((callback) => this.windowRef.setTimeout(callback, 16));
    const tick = () => {
      const now = this.getNowMs();
      const deltaSeconds = Math.min(Math.max((now - this.lastFrameTimeMs) / 1000, 0), 0.05);
      this.lastFrameTimeMs = now;

      this.updateNavigationCamera(deltaSeconds);
      if (this.isRunActive() && !this.buildingChoiceActive) {
        this.playerExperienceModel?.update(deltaSeconds);
        const timeSnapshot = this.timeManager?.update(deltaSeconds);
        this.heatMeterView.render(this.heatModel.update(timeSnapshot));

        if (timeSnapshot?.complete) {
          this.dayLifecycleController.completeDay();
        } else {
          this.updateSpawns(deltaSeconds);
        }
      }
      this.updateNpcWorld(deltaSeconds);
      this.render();
      this.updateFpsCounter(now);
      this.animationFrameId = scheduleFrame(tick);
    };

    this.animationFrameId = scheduleFrame(tick);
  }

  updateNavigationCamera(deltaSeconds) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      this.camera.stopMotion();
      return;
    }

    const navigation = this.cursor?.getNavigationIntent?.();
    if (!navigation) {
      return;
    }

    const panChanged = this.camera.panByDirection(
      navigation.pan,
      deltaSeconds,
      navigation.panSpeed
    );
    const rotationChanged = this.camera.rotateByDirection(
      navigation.rotation,
      deltaSeconds
    );

    if (!panChanged && !rotationChanged) {
      return;
    }

    if (
      Math.hypot(navigation.pan.x, navigation.pan.z) > 0 ||
      navigation.rotation !== 0
    ) {
      this.playerExperienceModel?.recordNavigation(deltaSeconds * 2);
    }
    setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: null
    });
    this.cleanBeachGuide.markProjectionDirty();
  }

  refreshTerrainSceneObjects() {
    if (!this.terrainAssets || this.terrainSceneObjects.length === 0) {
      return;
    }

    updateTerrainSceneObjects({
      sceneObjects: this.terrainSceneObjects,
      groundModel: this.terrainAssets.groundModel,
      camera: this.camera
    });
  }

  updateSpawns(deltaSeconds) {
    if (!this.spawnManager || !this.npcSystem) {
      return;
    }

    const { averageRating } = this.beachRatingModel.getSnapshot();
    const buildingServices = this.buildingServicesModel.getSnapshot();
    const heat = this.heatModel.getSnapshot();
    const spawnRequests = this.spawnManager.update(deltaSeconds, {
      averageRating,
      bathers: this.npcSystem.getSnapshot(),
      buildingServices,
      attractionMultiplier: heat.attractionMultiplier
    });

    for (const request of spawnRequests) {
      if (request.type === SPAWN_TYPES.BATHER) {
        const bather = this.npcSystem.addBather({
          position: getBeachEntryPosition(request.entryProgress)
        });
        this.taskListModel.advance(WELCOME_BATHERS_TASK_ID);
        if (buildingServices.hasBeverageStore) {
          const amountInCents = Math.round(
            BEVERAGE_SALE_IN_CENTS * heat.beverageSalesMultiplier
          );
          this.beachEconomyModel.recordIncome({
            sourceId: `${bather.id}-beverage-sale`,
            amountInCents
          });
          this.pendingBatherRevenue.push({
            batherId: bather.id,
            amountInCents,
            label: heat.beverageSaleLabel
          });
        }
        continue;
      }

      if (request.source === SPAWN_SOURCES.NPC_DROP) {
        const addedObject = addWorldObjectPlaceholderSceneInstance({
          sceneObjects: this.worldObjectSceneObjects,
          request,
          terrainSurfaceY: this.terrainSurfaceY,
          resolvePosition: (spawnRequest) => (
            this.resolveWorldObjectPosition(spawnRequest)
          )
        });
        if (addedObject) {
          this.visitorLitterObjectIds.add(addedObject.id);
          this.playerExperienceModel?.recordPressureAdded();
        }
      }
    }
  }

  updateNpcWorld(deltaSeconds) {
    if (!this.isRunActive() || !this.npcSystem || this.npcSceneObjects.length === 0) {
      return;
    }

    const batherCount = this.npcSystem.getSnapshot().filter(
      (npc) => npc.type === NPC_TYPES.BATHER
    ).length;
    this.buildingServicesModel.update(deltaSeconds, { batherCount });
    this.npcSystem.update(deltaSeconds, {
      buildingServices: this.buildingServicesModel.getSnapshot()
    });
    const npcs = this.npcSystem.getSnapshot();
    updateNpcSceneObjects({
      sceneObjects: this.npcSceneObjects,
      npcs,
      terrainSurfaceY: this.terrainSurfaceY
    });
    if (this.pendingBatherRevenue.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });

      for (const revenue of this.pendingBatherRevenue.splice(0)) {
        const { batherId, amountInCents, label } = revenue;
        const position = projectToOverlay(batherId, this.npcSceneObjects);

        if (position) {
          const dollars = amountInCents / 100;
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: true,
            text: `${label} +$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`
          });
        }
      }
    }
    this.updateBatherCounter(npcs);
  }

  render() {
    const { width, height } = this.renderer.resize(this.windowRef.devicePixelRatio);
    const viewProjection = this.camera.getViewProjection(width, height);
    this.refreshTerrainSceneObjects();

    this.renderer.renderFrame({
      viewProjection,
      sceneObjects: this.sceneObjects,
      cameraTarget: this.camera.getTarget(),
      timeSeconds: this.getElapsedSeconds()
    });
    const projectToOverlay = createWorldOverlayProjector({
      root: this.root,
      canvas: this.canvas,
      camera: this.camera
    });
    const complaints = (this.npcSystem?.getSnapshot() || [])
      .filter((npc) => npc.complaint)
      .map((npc) => {
        const position = projectToOverlay(npc.id, this.npcSceneObjects);

        return position ? {
          id: npc.id,
          text: npc.complaint,
          ...position
        } : null;
      })
      .filter(Boolean);

    this.npcComplaintView?.render(complaints);
    this.cleanBeachGuide?.render();
  }

  async loadWorld() {
    const world = await loadBeachWorld({
      gl: this.renderer.getContext(),
      camera: this.camera,
      onStatus: (message) => this.setStatus(message)
    });

    this.terrainAssets = world.terrainAssets;
    this.terrainSceneObjects = world.terrainSceneObjects;
    this.npcSceneObjects = world.npcSceneObjects;
    this.npcSystem = world.npcSystem;
    this.spawnManager = world.spawnManager;
    this.dayLifecycleController = createDayLifecycleController({
      runSessionModel: this.runSessionModel,
      timeManager: this.timeManager,
      spawnManager: this.spawnManager,
      buildingServicesModel: this.buildingServicesModel,
      economyModel: this.beachEconomyModel
    });
    this.worldObjectSceneObjects = world.worldObjectSceneObjects;
    this.beachGrid = world.beachGrid;
    this.beachHouseSceneObjects = world.beachHouseSceneObjects;
    this.terrainSurfaceY = world.terrainSurfaceY;
    this.resolveWorldObjectPosition = world.resolveWorldObjectPosition;
    this.updateBatherCounter(world.npcs);

    return world.sceneObjects;
  }
}

export const gameManager = new TerrainGameManager();
