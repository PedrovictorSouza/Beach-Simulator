import { createWorldRenderer } from "./rendering/worldRenderer.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCursorInput } from "./input/cursor.js";
import {
  getBeachEntryPosition,
  updateTerrainSceneObjects
} from "./terrain/terrainWorld.js";
import {
  BEACH_ZONES
} from "./terrain/beachGrid.js";
import { updateNpcSceneObjects } from "./npcs/npcWorld.js";
import {
  BATHER_PROBLEM_SOURCES,
  NPC_TYPES
} from "./npcs/npcSystem.js";
import {
  createSceneryPlaceholderSceneObjects,
  createScenerySceneObjects
} from "./scenery/sceneryWorld.js";
import { createBatherCounterView } from "./ui/batherCounterView.js";
import { presentBatherNeedFeedback } from "./ui/batherNeedPresenter.js";
import { createMoneyCounterView } from "./ui/moneyCounterView.js";
import { createRatingCounterView } from "./ui/ratingCounterView.js";
import { createTaskListModel, createTaskListView } from "./ui/taskList.js";
import { createBeachEconomyModel } from "./economy/beachEconomyModel.js";
import { createBeachRatingModel } from "./ratings/beachRatingModel.js";
import { evaluateBatherReview } from "./ratings/batherReviewPolicy.js";
import { findMainReviewProblem } from "./ratings/dayReviewSummary.js";
import { createReviewRewardModel } from "./ratings/reviewRewardModel.js";
import {
  createRunSessionModel,
  RUN_PHASES
} from "./run/runSessionModel.js";
import { createDayLifecycleController } from "./run/dayLifecycleController.js";
import { createDailyCleanupTask } from "./run/dailyTaskPlan.js";
import { createRunPresentationView } from "./ui/runPresentationView.js";
import {
  presentDayClosing,
  presentDayResult
} from "./ui/dayClosingPresenter.js";
import { createStartScreenView } from "./ui/startScreen.js";
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
import {
  createHeatMeterView,
  createHeatModel,
  HEAT_LEVELS
} from "./weather/heatFeature.js";

const COLLECTION_REWARD_IN_CENTS = 100;
const CLEAN_BEACH_TASK_ID = "clean-the-beach";
const CLEAN_BEACH_TARGET = 5;
const WELCOME_BATHERS_TASK_ID = "welcome-more-bathers";
const BUILD_FIRST_CONSTRUCTION_TASK_ID = "build-first-construction";
const BUILDING_ACCESS_COST_IN_CENTS = 500;
const BUILDING_PLACEHOLDER_SIZE = 10;
const TASK_COMPLETE_ANIMATION_MS = 1200;
const BATHER_ONBOARDING_NOTICE = "Bathers are your customers. Keep them happy to earn better reviews.";
const BUILDING_REVENUE_LABELS = Object.freeze({
  [BUILDING_TYPES.BEVERAGE_STORE]: "DRINK",
  [BUILDING_TYPES.WIFI_SPOT]: "WI-FI"
});
const BUILDING_TYPE_BY_BATHER_PROBLEM = Object.freeze({
  [BATHER_PROBLEM_SOURCES.HEAT]: BUILDING_TYPES.BEVERAGE_STORE,
  [BATHER_PROBLEM_SOURCES.ENTERTAINMENT]: BUILDING_TYPES.VOLLEYBALL_COURT,
  [BATHER_PROBLEM_SOURCES.WIFI]: BUILDING_TYPES.WIFI_SPOT,
  [BATHER_PROBLEM_SOURCES.TOILET]: BUILDING_TYPES.TOILET_BUILDING
});
const FIRST_BUILDING_DEFERRED_TYPES = Object.freeze([
  BUILDING_TYPES.LIFEGUARD_BUILDING,
  BUILDING_TYPES.TOILET_BUILDING
]);
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
    this.beverageStoreAsset = null;
    this.beachHouseAsset = null;
    this.terrainSceneObjects = [];
    this.beachGrid = null;
    this.npcSceneObjects = [];
    this.npcSystem = null;
    this.spawnManager = null;
    this.worldObjectSceneObjects = [];
    this.visitorLitterObjectIds = new Set();
    this.currentVisitorCleanupTaskId = null;
    this.pendingBatherRevenue = [];
    this.pendingBatherReviews = [];
    this.pendingBatherToleranceFeedback = [];
    this.batherCounterView = null;
    this.beachEconomyModel = null;
    this.moneyCounterView = null;
    this.unsubscribeBeachEconomy = null;
    this.beachRatingModel = null;
    this.reviewRewardModel = null;
    this.ratingCounterView = null;
    this.unsubscribeBeachRating = null;
    this.unsubscribeBatherDepartures = null;
    this.unsubscribeBatherToleranceChanges = null;
    this.taskListModel = null;
    this.taskListView = null;
    this.cleanBeachController = null;
    this.cleanBeachGuide = null;
    this.completedTaskRemovalIds = new Set();
    this.unsubscribeTaskList = null;
    this.runSessionModel = null;
    this.dayLifecycleController = null;
    this.runPresentationView = null;
    this.startScreenView = null;
    this.onboardingView = null;
    this.buildingChoiceModel = null;
    this.buildingChoiceView = null;
    this.beverageStoreModalView = null;
    this.buildingServicesModel = null;
    this.buildingChoiceActive = false;
    this.buildingButtonView = null;
    this.unsubscribeBuildingEconomy = null;
    this.unsubscribeBuildingRevenue = null;
    this.buildingAccessUnlocked = false;
    this.constructedBuildingCount = 0;
    this.buildingOnboardingShown = false;
    this.selectedRunBuilding = null;
    this.pendingBuildingPlacement = null;
    this.buildingPlacementTile = null;
    this.buildingPlacementGridSceneObject = null;
    this.buildingPlacementPreviewSceneObject = null;
    this.diagnosticSelectionSceneObject = null;
    this.diagnosticSelectedTiles = new Map();
    this.diagnosticClipboardText = "";
    this.preferredBuildingType = null;
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
    this.dayTransitionPromise = null;
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
    this.startScreenView = createStartScreenView({ root: this.root });
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
        this.startScreenView.setReady();
        await this.startScreenView.waitForStart();
        this.startScreenView.destroy();
        this.startScreenView = null;
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
      <canvas class="world-canvas" aria-label="Beach Simulator world"></canvas>
      <section class="game-hud" aria-label="Game status">
        <aside class="hud-stack" aria-label="Beach status"></aside>
      </section>
      <div class="boot-status" role="status">Carregando terrain...</div>
      <div class="fps-counter" aria-label="Frames per second">FPS --</div>
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
      onChange: (cursorState) => {
        this.applyCursorDebugState(cursorState);
        this.updateBuildingPlacementPreview(cursorState);
      },
      onPan: (cursorState) => this.applyCursorPan(cursorState),
      onRotate: (cursorState) => this.applyCursorRotate(cursorState),
      onZoom: (cursorState) => this.applyCursorZoom(cursorState),
      onPrimaryPress: (cursorState) => (
        cursorState.shiftKey ? true : this.isBuildingPlacementActive() ?
          Boolean(this.updateBuildingPlacementPreview(cursorState)) :
          this.hasWorldObjectInteraction(cursorState)
      ),
      onSelect: (cursorState) => this.selectWorldObject(cursorState),
      onCancel: () => this.cancelPendingBuildingPlacement()
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
    this.reviewRewardModel = createReviewRewardModel();
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
      collectionRewardInCents: COLLECTION_REWARD_IN_CENTS
    });
    this.taskListView = createTaskListView({
      root: hudRoot,
      onTaskComplete: (task) => this.scheduleCompletedTaskRemoval(task)
    });
    this.unsubscribeTaskList = this.taskListModel.subscribe(
      (tasks) => this.taskListView.render(tasks)
    );
    this.runSessionModel = createRunSessionModel();
    this.runPresentationView = createRunPresentationView({
      root: this.root,
      hudRoot: gameHudRoot,
      onPlayAgain: () => this.windowRef.location.reload()
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
    this.unsubscribeBuildingRevenue = this.buildingServicesModel.subscribeToRevenue(
      (event) => this.handleBuildingRevenue(event)
    );
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

  async beginRun({ notice = "" } = {}) {
    const { day } = this.runSessionModel.getSnapshot();

    await this.runPresentationView.playDay(day, { notice });
    this.heatMeterView.render(this.heatModel.startDay());
    this.dayLifecycleController.startDay({
      averageRating: this.beachRatingModel.getSnapshot().averageRating,
      startWithSpawning: day !== 1
    });
    this.runPresentationView.setHudActive(true);

    if (day > 1 && this.constructedBuildingCount > 0) {
      this.startDailyCleanupTask(day);
    }

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

  startDayTransition() {
    if (this.dayTransitionPromise) {
      return;
    }

    this.dayTransitionPromise = this.completeCurrentDay()
      .catch((error) => console.error(error))
      .finally(() => {
        this.dayTransitionPromise = null;
      });
  }

  async completeCurrentDay() {
    const closing = this.dayLifecycleController.completeDay();

    if (!closing) {
      return;
    }

    this.npcSystem.closeDay();
    updateNpcSceneObjects({
      sceneObjects: this.npcSceneObjects,
      npcs: [],
      terrainSurfaceY: this.terrainSurfaceY
    });
    this.updateBatherCounter([]);
    const dayReviews = [];
    for (const bather of this.pendingBatherReviews.splice(0)) {
      const review = this.recordBatherReview(bather);

      if (review) {
        dayReviews.push(review);
      }
    }
    this.preferredBuildingType = (
      BUILDING_TYPE_BY_BATHER_PROBLEM[findMainReviewProblem(dayReviews)] || null
    );
    const closingNotice = presentDayClosing(closing);
    const dayResultNotice = presentDayResult({
      reviews: dayReviews,
      closing
    });
    this.runPresentationView.setHudActive(false);
    const completedRun = this.runSessionModel.getSnapshot();

    if (!completedRun.hasNextDay) {
      const ratingSnapshot = this.beachRatingModel.getSnapshot();

      this.runPresentationView.showRunReport({
        moneyInCents: this.beachEconomyModel.getSnapshot().moneyInCents,
        averageRating: ratingSnapshot.averageRating,
        reviewCount: ratingSnapshot.reviewCount,
        totalBathers: ratingSnapshot.reviewCount,
        buildingsBuilt: this.constructedBuildingCount,
        reviews: ratingSnapshot.reviews,
        closingNotice
      });
      this.disposeObservers();
      return;
    }

    this.runSessionModel.prepareNextDay();
    this.timeManager.reset();
    await this.beginRun({ notice: dayResultNotice });
  }

  isRunActive() {
    return this.runSessionModel?.getSnapshot().phase === RUN_PHASES.ACTIVE;
  }

  disposeObservers() {
    const unsubscribeFields = [
      "unsubscribeBeachEconomy",
      "unsubscribeBeachRating",
      "unsubscribeBatherDepartures",
      "unsubscribeBatherToleranceChanges",
      "unsubscribeTaskList",
      "unsubscribeBuildingEconomy",
      "unsubscribeBuildingRevenue",
      "unsubscribeTimeManager"
    ];

    for (const field of unsubscribeFields) {
      this[field]?.();
      this[field] = null;
    }
  }

  updateBuildingAccess({ moneyInCents = 0 } = {}) {
    const hasAccess = Number(moneyInCents) >= BUILDING_ACCESS_COST_IN_CENTS;
    this.buildingAccessUnlocked = hasAccess;
    this.buildingButtonView?.render({
      enabled: this.buildingAccessUnlocked
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

  handleBuildingRevenue(event) {
    const label = BUILDING_REVENUE_LABELS[event?.buildingType];

    if (
      !label ||
      !event.batherId ||
      !Number.isSafeInteger(event.amountInCents)
    ) {
      return;
    }

    this.beachEconomyModel.recordIncome({
      sourceId: `${event.buildingType}-${event.batherId}-${event.sequence}`,
      amountInCents: event.amountInCents
    });
    this.pendingBatherRevenue.push({
      batherId: event.batherId,
      amountInCents: event.amountInCents,
      label
    });
  }

  scheduleCompletedTaskRemoval(task) {
    const taskId = String(task?.id || "");

    if (!taskId || this.completedTaskRemovalIds.has(taskId)) {
      return;
    }

    this.completedTaskRemovalIds.add(taskId);
    this.windowRef.setTimeout(() => {
      this.taskListModel?.remove(taskId);
      this.completedTaskRemovalIds.delete(taskId);
    }, TASK_COMPLETE_ANIMATION_MS);
  }

  startDailyCleanupTask(day) {
    const task = createDailyCleanupTask(day);

    if (
      this.currentVisitorCleanupTaskId &&
      this.currentVisitorCleanupTaskId !== task.id
    ) {
      this.taskListModel?.remove(this.currentVisitorCleanupTaskId);
    }
    this.currentVisitorCleanupTaskId = task.id;
    this.taskListModel?.upsert(task);
    return task;
  }

  async openBuildingChoice() {
    if (
      !this.isRunActive() ||
      !this.buildingAccessUnlocked ||
      this.buildingChoiceActive ||
      this.isBuildingPlacementActive()
    ) {
      return;
    }

    this.buildingChoiceActive = true;

    try {
      const ownedTypes = this.buildingServicesModel.getSnapshot().owned;
      const ownedTypeSet = new Set(ownedTypes);
      const isFirstConstruction = this.constructedBuildingCount === 0;
      const hasRevenueBuilding = (
        ownedTypeSet.has(BUILDING_TYPES.BEVERAGE_STORE) ||
        ownedTypeSet.has(BUILDING_TYPES.WIFI_SPOT)
      );
      const highHeatNeedsBeverage = (
        this.heatModel.getSnapshot().level === HEAT_LEVELS.HIGH &&
        !ownedTypeSet.has(BUILDING_TYPES.BEVERAGE_STORE)
      );
      const unresolvedProblemType = (
        this.preferredBuildingType &&
        !ownedTypeSet.has(this.preferredBuildingType)
      ) ? this.preferredBuildingType : null;
      const preferredTypes = [];
      const addPreferredType = (type) => {
        if (
          type &&
          !ownedTypeSet.has(type) &&
          !preferredTypes.includes(type)
        ) {
          preferredTypes.push(type);
        }
      };

      addPreferredType(unresolvedProblemType);
      if (highHeatNeedsBeverage) {
        addPreferredType(BUILDING_TYPES.BEVERAGE_STORE);
      }
      if (!hasRevenueBuilding) {
        addPreferredType(BUILDING_TYPES.BEVERAGE_STORE);
        addPreferredType(BUILDING_TYPES.WIFI_SPOT);
      }

      const excludedTypes = isFirstConstruction ?
        [...ownedTypes, ...FIRST_BUILDING_DEFERRED_TYPES] :
        ownedTypes;
      const choice = this.buildingChoiceModel.startChoice({
        preferredTypes,
        preferredOptionCount: hasRevenueBuilding ?
          Math.min(1, preferredTypes.length) :
          Math.min(3, preferredTypes.length),
        excludedTypes
      });
      const type = await this.buildingChoiceView.show(choice.options, {
        costInCents: BUILDING_ACCESS_COST_IN_CENTS
      });

      this.selectedRunBuilding = this.buildingChoiceModel.select(type).selected;
      const purchaseSourceId = `building-${this.constructedBuildingCount + 1}-${type}`;
      this.beachEconomyModel.recordExpense({
        sourceId: purchaseSourceId,
        amountInCents: BUILDING_ACCESS_COST_IN_CENTS
      });
      this.pendingBuildingPlacement = {
        type,
        purchaseSourceId,
        building: this.selectedRunBuilding
      };
      this.startBuildingPlacement();
    } catch (error) {
      console.error(error);
    } finally {
      this.buildingChoiceActive = false;
    }
  }

  isBuildingPlacementActive() {
    return Boolean(this.pendingBuildingPlacement);
  }

  cancelPendingBuildingPlacement() {
    const pendingPlacement = this.pendingBuildingPlacement;

    if (!pendingPlacement) {
      return false;
    }

    this.beachEconomyModel.refundExpense({
      sourceId: pendingPlacement.purchaseSourceId,
      amountInCents: BUILDING_ACCESS_COST_IN_CENTS
    });
    this.pendingBuildingPlacement = null;
    this.selectedRunBuilding = null;
    this.removeBuildingPlacementPreview();
    this.renderIfLoopIsIdle();
    return true;
  }

  getBuildingPlacementTile(cursorState) {
    if (!this.beachGrid || !cursorState) {
      return null;
    }

    const point = this.getGroundPointAtCursor(cursorState);

    if (!point) {
      return null;
    }

    const tile = this.beachGrid.getTileAtWorldPosition(point[0], point[2]);

    if (
      !tile ||
      tile.zone !== BEACH_ZONES.SAND ||
      !this.beachGrid.isTileAvailable(tile) ||
      !this.beachGrid.isBuildableTile(tile)
    ) {
      return null;
    }

    return tile;
  }

  getGroundPointAtCursor(cursorState) {
    if (!cursorState || !this.renderer) {
      return null;
    }

    const cssWidth = Math.max(1, this.canvas.clientWidth);
    const cssHeight = Math.max(1, this.canvas.clientHeight);
    const { width, height } = this.renderer.resize();

    return this.camera.getGroundPointFromScreen({
      x: cursorState.x * width / cssWidth,
      y: cursorState.y * height / cssHeight,
      width,
      height,
      groundY: this.terrainSurfaceY
    });
  }

  createBuildingPlacementGrid() {
    const model = this.terrainAssets?.sandgroundModel || this.terrainAssets?.groundModel;

    if (!model || !this.beachGrid) {
      return null;
    }

    const tileScale = this.beachGrid.tileSize / Math.max(model.size[0], model.size[2]);
    const instances = [];

    this.beachGrid.visitTilesInRange({
      startXIndex: -24,
      endXIndex: 24,
      startZIndex: -16,
      endZIndex: 16
    }, (tile) => {
      if (tile.zone !== BEACH_ZONES.SAND) {
        return;
      }

      const available = this.isBuildingPlacementTileAvailable(tile);

      instances.push({
        id: `building-placement-grid-${tile.xIndex}-${tile.zIndex}`,
        offset: [tile.centerX, 0.08, tile.centerZ],
        scale: tileScale,
        tint: available ? [0.2, 0.95, 0.55] : [0.95, 0.25, 0.18],
        tintStrength: 0.8,
        alpha: available ? 0.22 : 0.12
      });
    });

    return {
      worldObject: "building-placement-grid",
      model,
      instances,
      brightness: 1.15
    };
  }

  createBuildingPlacementPreview() {
    const pendingPlacement = this.pendingBuildingPlacement;
    const building = pendingPlacement?.building;

    if (!pendingPlacement || !building) {
      return null;
    }

    const position = [0, this.terrainSurfaceY, 0];
    const sceneObjects = (
      pendingPlacement.type === BUILDING_TYPES.BEVERAGE_STORE && this.beverageStoreAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.beverageStoreAsset,
      position
    }) : (
      pendingPlacement.type === BUILDING_TYPES.BEACH_HOUSE && this.beachHouseAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.beachHouseAsset,
      position
    }) : createSceneryPlaceholderSceneObjects({
      gl: this.renderer.getContext(),
      sceneryType: pendingPlacement.type,
      model: this.terrainAssets.groundModel,
      position,
      tint: building.color,
      normalizedSize: BUILDING_PLACEHOLDER_SIZE
    });
    const sceneObject = sceneObjects[0];

    sceneObject.worldObject = "building-placement-preview";
    sceneObject.instances = sceneObject.instances.map((instance) => ({
      ...instance,
      id: "building-placement-preview",
      alpha: 0.58
    }));

    return sceneObject;
  }

  isBuildingPlacementTileAvailable(tile) {
    if (
      !tile ||
      tile.zone !== BEACH_ZONES.SAND ||
      !this.beachGrid.isBuildableTile(tile) ||
      !this.beachGrid.isTileAvailable(tile)
    ) {
      return false;
    }

    return true;
  }

  startBuildingPlacement() {
    this.removeBuildingPlacementPreview();
    this.buildingPlacementTile = null;
    this.buildingPlacementPreviewSceneObject = this.createBuildingPlacementPreview();
    this.buildingPlacementGridSceneObject = this.createBuildingPlacementGrid();

    if (this.buildingPlacementGridSceneObject) {
      this.sceneObjects.push(this.buildingPlacementGridSceneObject);
    }
    if (this.buildingPlacementPreviewSceneObject) {
      this.sceneObjects.push(this.buildingPlacementPreviewSceneObject);
    }

    this.renderIfLoopIsIdle();
  }

  updateBuildingPlacementPreview(cursorState) {
    if (!this.isBuildingPlacementActive()) {
      return null;
    }

    const tile = this.getBuildingPlacementTile(cursorState);
    this.buildingPlacementTile = tile;

    const instance = this.buildingPlacementPreviewSceneObject?.instances?.[0];
    if (instance) {
      instance.offset = tile ?
        [tile.centerX, this.terrainSurfaceY, tile.centerZ] :
        [0, this.terrainSurfaceY, 0];
      instance.tint = tile ? [1, 1, 1] : [1, 0.18, 0.12];
      instance.tintStrength = tile ? 0 : 0.8;
      instance.alpha = tile ? 0.58 : 0.28;
    }

    this.renderIfLoopIsIdle();
    return tile;
  }

  removeBuildingPlacementPreview() {
    for (const sceneObject of [
      this.buildingPlacementGridSceneObject,
      this.buildingPlacementPreviewSceneObject
    ]) {
      if (!sceneObject) {
        continue;
      }

      const index = this.sceneObjects.indexOf(sceneObject);
      if (index >= 0) {
        this.sceneObjects.splice(index, 1);
      }
    }

    this.buildingPlacementGridSceneObject = null;
    this.buildingPlacementPreviewSceneObject = null;
    this.buildingPlacementTile = null;
  }

  getDiagnosticTile(cursorState) {
    if (!this.beachGrid || !cursorState) {
      return null;
    }

    const point = this.getGroundPointAtCursor(cursorState);

    if (!point) {
      return null;
    }

    const tile = this.beachGrid.getTileAtWorldPosition(point[0], point[2]);
    const diagnostics = this.beachGrid.getTileDiagnostics(tile);

    return diagnostics ? {
      ...diagnostics,
      key: `${diagnostics.xIndex}:${diagnostics.zIndex}`
    } : null;
  }

  updateDiagnosticSelectionSceneObject() {
    if (this.diagnosticSelectionSceneObject) {
      const index = this.sceneObjects.indexOf(this.diagnosticSelectionSceneObject);

      if (index >= 0) {
        this.sceneObjects.splice(index, 1);
      }
    }

    if (this.diagnosticSelectedTiles.size === 0 || !this.terrainAssets?.sandgroundModel) {
      this.diagnosticSelectionSceneObject = null;
      return;
    }

    const model = this.terrainAssets.sandgroundModel;
    const tileScale = this.beachGrid.tileSize / Math.max(model.size[0], model.size[2]);
    this.diagnosticSelectionSceneObject = {
      worldObject: "building-grid-diagnostic-selection",
      model,
      instances: [...this.diagnosticSelectedTiles.values()].map((tile) => ({
        id: `diagnostic-${tile.key}`,
        offset: [tile.centerX, 0.16, tile.centerZ],
        scale: tileScale,
        tint: [1, 0.86, 0.08],
        tintStrength: 0.95,
        alpha: 0.72
      })),
      brightness: 1.2
    };
    this.sceneObjects.push(this.diagnosticSelectionSceneObject);
  }

  async copyDiagnosticSelection() {
    const text = JSON.stringify({
      type: "beach-grid-diagnostic",
      tiles: [...this.diagnosticSelectedTiles.values()]
    }, null, 2);

    this.diagnosticClipboardText = text;

    try {
      await this.windowRef.navigator?.clipboard?.writeText(text);
    } catch (error) {
      console.warn("Nao foi possivel copiar o diagnostico para o clipboard.", error);
    }
  }

  selectDiagnosticTile(cursorState) {
    const tile = this.getDiagnosticTile(cursorState);

    if (!tile) {
      return;
    }

    if (this.diagnosticSelectedTiles.has(tile.key)) {
      this.diagnosticSelectedTiles.delete(tile.key);
    } else {
      this.diagnosticSelectedTiles.set(tile.key, tile);
    }

    if (!this.buildingPlacementGridSceneObject) {
      this.buildingPlacementGridSceneObject = this.createBuildingPlacementGrid();

      if (this.buildingPlacementGridSceneObject) {
        this.sceneObjects.push(this.buildingPlacementGridSceneObject);
      }
    }

    this.updateDiagnosticSelectionSceneObject();
    void this.copyDiagnosticSelection();
    this.renderIfLoopIsIdle();
  }

  async confirmPendingBuildingPlacement(cursorState) {
    const pendingPlacement = this.pendingBuildingPlacement;

    if (!pendingPlacement) {
      return;
    }

    const { type, building } = pendingPlacement;
    const isFirstConstruction = this.constructedBuildingCount === 0;
    const selectedTile = this.updateBuildingPlacementPreview(cursorState);

    if (!selectedTile) {
      return;
    }

    let claimedTile = null;

    try {
      const buildingNumber = this.constructedBuildingCount + 1;
      claimedTile = this.beachGrid.claimNearestAvailableTile({
        x: selectedTile.centerX,
        z: selectedTile.centerZ,
        zone: BEACH_ZONES.SAND,
        maxRadiusInTiles: 0,
        reason: `building:${type}-${buildingNumber}`
      });

      if (!claimedTile) {
        return;
      }

      const buildingPosition = [
        claimedTile.centerX,
        this.terrainSurfaceY,
        claimedTile.centerZ
      ];
      const newBuildingSceneObjects = (
        type === BUILDING_TYPES.BEVERAGE_STORE && this.beverageStoreAsset
      ) ? createScenerySceneObjects({
        sceneryAsset: this.beverageStoreAsset,
        position: buildingPosition
      }) : (
        type === BUILDING_TYPES.BEACH_HOUSE && this.beachHouseAsset
      ) ? createScenerySceneObjects({
        sceneryAsset: this.beachHouseAsset,
        position: buildingPosition
      }) : createSceneryPlaceholderSceneObjects({
        gl: this.renderer.getContext(),
        sceneryType: type,
        model: this.terrainAssets.groundModel,
        position: buildingPosition,
        tint: building.color,
        normalizedSize: BUILDING_PLACEHOLDER_SIZE
      });

      for (const sceneObject of newBuildingSceneObjects) {
        sceneObject.instances = sceneObject.instances.map((instance) => ({
          ...instance,
          id: `${type}-${buildingNumber}`
        }));
      }

      this.buildingServicesModel.addBuilding(type);
      this.removeBuildingPlacementPreview();
      this.runBuildingSceneObjects.push(...newBuildingSceneObjects);
      this.sceneObjects.push(...newBuildingSceneObjects);
      this.constructedBuildingCount += 1;
      this.pendingBuildingPlacement = null;
      this.selectedRunBuilding = null;

      if (!isFirstConstruction) {
        this.render();
        return;
      }

      this.taskListModel.remove(BUILD_FIRST_CONSTRUCTION_TASK_ID);
      this.startDailyCleanupTask(this.runSessionModel.getSnapshot().day);
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
      if (claimedTile) {
        this.beachGrid.releaseWorldPosition(claimedTile.centerX, claimedTile.centerZ);
      }
      this.beachEconomyModel.refundExpense({
        sourceId: pendingPlacement.purchaseSourceId,
        amountInCents: BUILDING_ACCESS_COST_IN_CENTS
      });
      this.pendingBuildingPlacement = null;
      this.selectedRunBuilding = null;
      this.removeBuildingPlacementPreview();
      console.error(error);
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

  handleBatherToleranceChange(event) {
    this.pendingBatherToleranceFeedback.push(event);
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

    const beverageStoreSelection = this.findSceneObjectAtCursor(
      cursorState,
      this.runBuildingSceneObjects.filter(
        (sceneObject) => sceneObject.sceneryType === BUILDING_TYPES.BEVERAGE_STORE
      )
    );

    return Boolean(beverageStoreSelection || this.findSceneObjectAtCursor(cursorState));
  }

  selectWorldObject(cursorState) {
    if (cursorState.shiftKey) {
      this.selectDiagnosticTile(cursorState);
      return;
    }

    if (this.isBuildingPlacementActive()) {
      void this.confirmPendingBuildingPlacement(cursorState);
      return;
    }

    if (this.buildingChoiceActive) {
      return;
    }

    const beverageStoreSelection = this.findSceneObjectAtCursor(
      cursorState,
      this.runBuildingSceneObjects.filter(
        (sceneObject) => sceneObject.sceneryType === BUILDING_TYPES.BEVERAGE_STORE
      )
    );

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
      this.currentVisitorCleanupTaskId :
      CLEAN_BEACH_TASK_ID;
    const collection = removedObject ?
      this.cleanBeachController.collect({
        worldObject: removedObject,
        definition: removedDefinition,
        progressTaskId
      }) :
      null;

    if (position && collection?.rewardAmountInCents > 0) {
      const totalRewardInCents = (
        collection.rewardAmountInCents + collection.bonusAmountInCents
      );
      this.pickupFeedbackView.showCollection({
        ...position,
        valuable: collection.valuable,
        text: collection.bonusAmountInCents > 0
          ? `+$${(totalRewardInCents / 100).toFixed(2)} BONUS!`
          : `+$${(totalRewardInCents / 100).toFixed(2)}`
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
          this.startDayTransition();
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
        this.npcSystem.addBather({
          position: getBeachEntryPosition(request.entryProgress)
        });
        const hasWelcomeTask = this.taskListModel.getSnapshot().some(
          (task) => task.id === WELCOME_BATHERS_TASK_ID
        );
        if (hasWelcomeTask) {
          this.taskListModel.advance(WELCOME_BATHERS_TASK_ID);
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
    if (
      !this.isRunActive() ||
      this.buildingChoiceActive ||
      !this.npcSystem ||
      this.npcSceneObjects.length === 0
    ) {
      return;
    }

    const bathers = this.npcSystem.getSnapshot().filter(
      (npc) => npc.type === NPC_TYPES.BATHER
    );
    this.buildingServicesModel.update(deltaSeconds, {
      batherCount: bathers.length,
      bathers
    });
    this.npcSystem.update(deltaSeconds, {
      buildingServices: this.buildingServicesModel.getSnapshot(),
      heat: this.heatModel.getSnapshot()
    });
    const npcs = this.npcSystem.getSnapshot();
    updateNpcSceneObjects({
      sceneObjects: this.npcSceneObjects,
      npcs,
      terrainSurfaceY: this.terrainSurfaceY
    });
    if (this.pendingBatherToleranceFeedback.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });

      for (const event of this.pendingBatherToleranceFeedback.splice(0)) {
        const position = projectToOverlay(event.bather.id, this.npcSceneObjects);
        if (position) {
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: false,
            text: presentBatherNeedFeedback(event.source)
          });
        }
      }
    }
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
      .filter((npc) => npc.complaint && !npc.departing)
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
    this.beverageStoreAsset = world.beverageStoreAsset;
    this.beachHouseAsset = world.beachHouseAsset;
    this.terrainSceneObjects = world.terrainSceneObjects;
    this.npcSceneObjects = world.npcSceneObjects;
    this.npcSystem = world.npcSystem;
    this.unsubscribeBatherDepartures = this.npcSystem.subscribeToDepartures(
      (bather) => this.pendingBatherReviews.push(bather)
    );
    this.unsubscribeBatherToleranceChanges = this.npcSystem.subscribeToToleranceChanges(
      (event) => this.handleBatherToleranceChange(event)
    );
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

  recordBatherReview(bather) {
    if (!this.beachRatingModel || !bather?.id) {
      return;
    }

    const review = evaluateBatherReview(bather);
    const {
      rating,
      baseRating,
      serviceBonus,
      positiveServiceMotives,
      toleranceUsed,
      toleranceLimit
    } = review;

    this.beachRatingModel.submitRating({
      npcId: bather.id,
      rating,
      toleranceUsed,
      toleranceLimit,
      toleranceIssues: bather.toleranceIssues,
      baseRating,
      serviceBonus,
      positiveServiceMotives
    });
    const reviewReward = this.reviewRewardModel.recordReview({ rating });

    if (reviewReward.awarded) {
      this.beachEconomyModel.recordIncome({
        sourceId: `${bather.id}-review-bonus-${reviewReward.rewardSequence}`,
        amountInCents: reviewReward.amountInCents
      });
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });
      const position = projectToOverlay(bather.id, this.npcSceneObjects);

      if (position) {
        this.pickupFeedbackView.showCollection({
          ...position,
          valuable: true,
          text: "REVIEW BONUS +$1"
        });
      }
    }

    return review;
  }
}

export const gameManager = new TerrainGameManager();
