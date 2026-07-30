import { createWorldRenderer } from "./rendering/worldRenderer.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCameraTargetMotionNode } from "./camera/cameraTargetMotionNode.js";
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
  NPC_STATES,
  NPC_TYPES
} from "./npcs/npcSystem.js";
import {
  createSceneryPlaceholderSceneObjects,
  createScenerySceneObjects,
  SCENERY_TYPES
} from "./scenery/sceneryWorld.js";
import { createBatherCounterView } from "./ui/batherCounterView.js";
import { presentBatherNeedFeedback } from "./ui/batherNeedPresenter.js";
import { createMoneyCounterView } from "./ui/moneyCounterView.js";
import { createRatingCounterView } from "./ui/ratingCounterView.js";
import { createTaskListModel, createTaskListView } from "./ui/taskList.js";
import { createBeachEconomyModel } from "./economy/beachEconomyModel.js";
import { createBeachRatingModel } from "./ratings/beachRatingModel.js";
import { evaluateBatherReview } from "./ratings/batherReviewPolicy.js";
import {
  findMainReviewProblem,
  summarizeReviewProblems
} from "./ratings/dayReviewSummary.js";
import { createReviewRewardModel } from "./ratings/reviewRewardModel.js";
import {
  createRunSessionModel,
  RUN_PHASES
} from "./run/runSessionModel.js";
import { createDayLifecycleController } from "./run/dayLifecycleController.js";
import {
  createDailyCleanupTask,
  createHeatWaveTask
} from "./run/dailyTaskPlan.js";
import { createRunPresentationView } from "./ui/runPresentationView.js";
import {
  presentDayClosing,
  presentDayResult
} from "./ui/dayClosingPresenter.js";
import { createStartScreenView } from "./ui/startScreen.js";
import { createGameModeView } from "./ui/gameModeView.js";
import { createTimeManager } from "./time/timeManager.js";
import { createTimeCounterView } from "./ui/timeCounterView.js";
import { createNpcComplaintView } from "./ui/npcComplaintView.js";
import { createPickupFeedbackView } from "./ui/pickupFeedbackView.js";
import { createBuildingInteractionModalView } from "./ui/buildingInteractionModalView.js";
import { createBuildingButtonView } from "./ui/buildingButton.js";
import { createOnboardingView } from "./onboarding/onboardingView.js";
import { createCleanBeachGuide } from "./onboarding/cleanBeachGuide.js";
import { createWorldInteractionGuide } from "./onboarding/worldInteractionGuide.js";
import {
  createBuildingChoiceModel,
  createBuildingChoiceView
} from "./ui/buildingChoice.js";
import {
  BEACH_AMENITY_TYPES,
  BUILDING_TYPES,
  createBuildingServicesModel
} from "./buildings/buildingServicesModel.js";
import { createPlayerExperienceModel } from "./experience/playerExperienceModel.js";
import {
  SPAWN_TYPES
} from "./spawn/spawnManager.js";
import {
  getSpawnableObjectDto,
  SPAWNABLE_OBJECT_TYPES,
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
import {
  loadBeachWorld,
  protectScenery
} from "./world/beachWorld.js";
import {
  createHeatMeterView,
  createHeatModel,
  HEAT_LEVELS
} from "./weather/heatFeature.js";
import { createHeatTintView } from "./ui/heatTintView.js";
import { createTranslator } from "./i18n/index.js";
import {
  createSoundManager,
  SOUND_IDS
} from "./audio/soundManager.js";

const COLLECTION_REWARD_IN_CENTS = 100;
const CLEAN_BEACH_TASK_ID = "clean-the-beach";
const LOGICAL_STAGE_WIDTH = 480;
const LOGICAL_STAGE_HEIGHT = 272;
const BUILDING_CAMERA_FOCUS_SCREEN_FRACTION = 0.44;
const BUILDING_CAMERA_PERSPECTIVE_ANGLE = (10 * Math.PI) / 180;
const BUILDING_CAMERA_FOCUS_YAW = Math.PI - BUILDING_CAMERA_PERSPECTIVE_ANGLE;
const BUILDING_CAMERA_FOCUS_PITCH = 0;
const CLEAN_BEACH_TARGET = 5;
const HEAT_WAVE_TASK_ID = "cool-down-heat-wave";
const WELCOME_BATHERS_TASK_ID = "welcome-more-bathers";
const BUILD_FIRST_CONSTRUCTION_TASK_ID = "build-first-construction";
const BUILDING_ACCESS_COST_IN_CENTS = 500;
const SUN_SHADE_COST_IN_CENTS = 500;
const BUILDING_PLACEHOLDER_SIZE = 10;
const CONSTRUCTION_DROP_EXCLUSION_PADDING = 4;
const BUILDING_CONSTRUCTION_ANIMATION_DURATION_SECONDS = 0.65;
const SHARK_WATERLINE_OFFSET = -3.6;
const SHARK_SWIM_HEIGHT = 0.35;
const SHARK_SWIM_PITCH = 0.08;
const SHARK_SWIM_ROLL = 0.04;
const TASK_COMPLETE_ANIMATION_MS = 1200;
const BATHER_INTENT_FEEDBACK_DURATION_MS = 1400;
const BATHER_SERVICE_FEEDBACK_DURATION_MS = 1100;
const BATHER_REVIEW_FEEDBACK_DURATION_MS = 1400;
const BATHER_ONBOARDING_NOTICE_ID = "onboarding.batherNotice";
const LANGUAGE_STORAGE_KEY = "beach-simulator.locale";
const BUILDING_REVENUE_TYPES = Object.freeze([
  BUILDING_TYPES.BEVERAGE_STORE,
  BUILDING_TYPES.WIFI_SPOT,
  BEACH_AMENITY_TYPES.SUN_SHADE
]);
const BATHER_SERVICE_DECISION_MESSAGE_IDS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: "feedback.pickup.serviceDecisions.lifeguard-building",
  [BUILDING_TYPES.WIFI_SPOT]: "feedback.pickup.serviceDecisions.wifi-spot",
  [BUILDING_TYPES.TOILET_BUILDING]: "feedback.pickup.serviceDecisions.toilet-building",
  [BUILDING_TYPES.VOLLEYBALL_COURT]: "feedback.pickup.serviceDecisions.volleyball-court",
  [BEACH_AMENITY_TYPES.SUN_SHADE]: "feedback.pickup.serviceDecisions.sun-shade"
});
const BATHER_SERVICE_COMPLETION_MESSAGE_IDS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: "feedback.pickup.serviceCompletions.lifeguard-building",
  [BUILDING_TYPES.WIFI_SPOT]: "feedback.pickup.serviceCompletions.wifi-spot",
  [BUILDING_TYPES.TOILET_BUILDING]: "feedback.pickup.serviceCompletions.toilet-building",
  [BUILDING_TYPES.VOLLEYBALL_COURT]: "feedback.pickup.serviceCompletions.volleyball-court",
  [BEACH_AMENITY_TYPES.SUN_SHADE]: "feedback.pickup.serviceCompletions.sun-shade"
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

function readStoredLocale(windowRef) {
  try {
    return windowRef?.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

function persistLocale(windowRef, locale) {
  try {
    windowRef?.localStorage?.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    // A sessão continua funcionando mesmo quando o storage está indisponível.
  }
}

function createDayProblemMap({
  reviews = [],
  remainingVisitorLitterCount = 0,
  sharkEvents = 0,
  lifeguardOperational = false
} = {}) {
  const problemCounts = new Map(
    summarizeReviewProblems(reviews).map(({ source, count }) => [source, count])
  );
  const lines = [];
  const mainProblem = findMainReviewProblem(reviews);

  if (mainProblem === BATHER_PROBLEM_SOURCES.HEAT) {
    lines.push("run.problems.heat");
  }

  if (remainingVisitorLitterCount > 0) {
    lines.push("run.problems.litter");
  }

  if (problemCounts.get(BATHER_PROBLEM_SOURCES.ENTERTAINMENT) > 0) {
    lines.push("run.problems.entertainment");
  }

  if (sharkEvents > 0 && !lifeguardOperational) {
    lines.push("run.problems.sharkRisk");
  }

  return Object.freeze({
    titleId: "run.problems.title",
    lines: Object.freeze(
      lines.length > 0 ? lines : ["run.problems.none"]
    )
  });
}

class TerrainGameManager {
  constructor() {
    this.started = false;
    this.soundManager = null;
    this.windowRef = window;
    this.translator = createTranslator({
      initialLocale: readStoredLocale(this.windowRef)
    });
    this.locale = this.translator.getLocale();
    this.root = null;
    this.canvas = null;
    this.statusElement = null;
    this.fpsElement = null;
    this.unsubscribeShellLocale = null;
    this.renderer = null;
    this.camera = null;
    this.cameraTargetMotionNode = null;
    this.cursor = null;
    this.terrainAssets = null;
    this.beverageStoreAsset = null;
    this.beachHouseAsset = null;
    this.wifiSpotAsset = null;
    this.sunShadeAsset = null;
    this.trashCansAsset = null;
    this.terrainSceneObjects = [];
    this.beachGrid = null;
    this.npcSceneObjects = [];
    this.npcSystem = null;
    this.sharkSceneObject = null;
    this.activeSharkEvent = null;
    this.sharkEventsToday = 0;
    this.spawnManager = null;
    this.worldObjectSceneObjects = [];
    this.visitorLitterObjectIds = new Set();
    this.pendingMoneyDrops = [];
    this.currentVisitorCleanupTaskId = null;
    this.pendingBatherServiceDecisions = [];
    this.pendingBatherServiceCompletions = [];
    this.pendingBeverageDecisions = [];
    this.pendingBeveragePurchases = [];
    this.pendingBatherReviews = [];
    this.currentDayReviews = [];
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
    this.unsubscribeBatherServiceDecisions = null;
    this.unsubscribeBatherServiceCompletions = null;
    this.unsubscribeBatherBeverageDecisions = null;
    this.unsubscribeBatherBeveragePurchases = null;
    this.taskListModel = null;
    this.taskListView = null;
    this.cleanBeachController = null;
    this.cleanBeachGuide = null;
    this.worldInteractionGuide = null;
    this.completedTaskRemovalIds = new Set();
    this.unsubscribeTaskList = null;
    this.runSessionModel = null;
    this.dayLifecycleController = null;
    this.runPresentationView = null;
    this.gameModeView = null;
    this.startScreenView = null;
    this.onboardingView = null;
    this.buildingChoiceModel = null;
    this.buildingChoiceView = null;
    this.buildingInteractionModalView = null;
    this.buildingServicesModel = null;
    this.buildingChoiceActive = false;
    this.buildingButtonView = null;
    this.unsubscribeBuildingEconomy = null;
    this.unsubscribeBuildingRevenue = null;
    this.buildingAccessUnlocked = false;
    this.constructedBuildingCount = 0;
    this.sunShadeCount = 0;
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
    this.heatTintView = null;
    this.npcComplaintView = null;
    this.pickupFeedbackView = null;
    this.unsubscribeTimeManager = null;
    this.beachHouseSceneObjects = [];
    this.runBuildingSceneObjects = [];
    this.sunShadeSceneObjects = [];
    this.constructionAnimations = [];
    this.terrainSurfaceY = 0;
    this.resolveWorldObjectPosition = null;
    this.sceneObjects = [];
    this.lastMoneyInCents = null;
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
    this.soundManager = createSoundManager({
      windowRef: this.windowRef
    });
    this.startTimeMs = this.getNowMs();
    this.lastFrameTimeMs = this.startTimeMs;
    this.camera = createStaticCamera({ minDistance: 22 });
    this.cameraTargetMotionNode = createCameraTargetMotionNode({
      camera: this.camera
    });
    this.playerExperienceModel = createPlayerExperienceModel({
      initialPressureCount: CLEAN_BEACH_TARGET
    });
    this.mount();
    this.initializeUi();
    this.startScreenView = createStartScreenView({
      root: this.root,
      translator: this.translator,
      playSound: (soundId) => this.soundManager?.play(soundId)
    });
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
        this.worldInteractionGuide = createWorldInteractionGuide({
          root: this.root,
          canvas: this.canvas,
          camera: this.camera,
          sceneObjects: this.sceneObjects,
          onboardingView: this.onboardingView,
          isRunActive: () => this.isRunActive()
        });
        this.statusElement?.remove();
        this.render();
        this.startRenderLoop();
        this.windowRef.addEventListener("resize", () => {
          this.markOnboardingProjectionDirty();
          this.render();
        });
        this.startScreenView.setReady();
        await this.startScreenView.waitForStart();
        this.locale = this.translator.setLocale(
          await this.startScreenView.waitForLanguage()
        );
        persistLocale(this.windowRef, this.locale);
        this.startScreenView.destroy();
        this.startScreenView = null;
        await this.beginRun();
      })
      .catch((error) => {
        console.error(error);
        this.setStatus(this.translator.t("app.worldLoadError"));
      });

    return this;
  }

  mount() {
    const worldAria = this.translator.t("app.worldAria");
    const gameHudAria = this.translator.t("app.gameHudAria");
    const beachStatusAria = this.translator.t("app.beachStatusAria");
    const loading = this.translator.t("app.loading");
    const fpsAria = this.translator.t("app.fpsAria");

    this.root.innerHTML = `
      <canvas class="world-canvas" aria-label="${worldAria}"></canvas>
      <section class="game-hud" aria-label="${gameHudAria}">
        <aside class="hud-stack" aria-label="${beachStatusAria}"></aside>
      </section>
      <div class="boot-status" role="status">${loading}</div>
      <div class="fps-counter" aria-label="${fpsAria}">${this.translator.t("app.fps", { value: "--" })}</div>
    `;
    this.canvas = this.root.querySelector(".world-canvas");
    this.statusElement = this.root.querySelector(".boot-status");
    this.fpsElement = this.root.querySelector(".fps-counter");
    this.root.addEventListener("click", (event) => {
      const buttonElement = event.target?.closest?.("button");

      if (
        !buttonElement ||
        !this.root.contains(buttonElement) ||
        buttonElement.dataset.soundId
      ) {
        return;
      }

      this.soundManager?.play(SOUND_IDS.DEFAULT_BUTTON);
    }, true);
    this.statusElement.dataset.statusId = "app.loading";
    this.unsubscribeShellLocale = this.translator.subscribe(() => {
      this.root.ownerDocument.title = this.translator.t("app.title");
      this.canvas?.setAttribute("aria-label", this.translator.t("app.worldAria"));
      this.root.querySelector(".game-hud")?.setAttribute(
        "aria-label",
        this.translator.t("app.gameHudAria")
      );
      this.root.querySelector(".hud-stack")?.setAttribute(
        "aria-label",
        this.translator.t("app.beachStatusAria")
      );
      this.fpsElement?.setAttribute(
        "aria-label",
        this.translator.t("app.fpsAria")
      );

      if (this.statusElement?.dataset.statusId === "app.loading") {
        this.statusElement.textContent = this.translator.t("app.loading");
      }
    });
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

    this.batherCounterView = createBatherCounterView({
      root: hudRoot,
      translator: this.translator
    });
    this.batherCounterView.render(0);
    this.beachEconomyModel = createBeachEconomyModel();
    this.moneyCounterView = createMoneyCounterView({
      root: hudRoot,
      translator: this.translator,
      windowRef: this.windowRef
    });
    this.unsubscribeBeachEconomy = this.beachEconomyModel.subscribe(
      (snapshot) => this.updateMoneyCounter(snapshot)
    );
    this.beachRatingModel = createBeachRatingModel();
    this.reviewRewardModel = createReviewRewardModel();
    this.ratingCounterView = createRatingCounterView({
      root: hudRoot,
      translator: this.translator
    });
    this.unsubscribeBeachRating = this.beachRatingModel.subscribe(
      (snapshot) => this.updateRatingCounter(snapshot)
    );
    this.taskListModel = createTaskListModel([{
      id: CLEAN_BEACH_TASK_ID,
      messageId: "tasks.cleanBeach",
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
      translator: this.translator,
      onTaskComplete: (task) => this.scheduleCompletedTaskRemoval(task),
      onTaskProgress: () => this.soundManager?.play(SOUND_IDS.INCREMENT)
    });
    this.unsubscribeTaskList = this.taskListModel.subscribe(
      (tasks) => this.taskListView.render(tasks)
    );
    this.runSessionModel = createRunSessionModel();
    this.runPresentationView = createRunPresentationView({
      root: this.root,
      hudRoot: gameHudRoot,
      translator: this.translator,
      onPlayAgain: () => this.windowRef.location.reload(),
      playSound: (soundId) => this.soundManager?.play(soundId)
    });
    this.gameModeView = createGameModeView({
      root: gameHudRoot,
      translator: this.translator
    });
    this.onboardingView = createOnboardingView({
      root: this.root,
      translator: this.translator,
      windowRef: this.windowRef,
      playSound: (soundId) => this.soundManager?.play(soundId)
    });
    this.buildingChoiceModel = createBuildingChoiceModel();
    this.buildingChoiceView = createBuildingChoiceView({
      root: this.root,
      translator: this.translator
    });
    this.buildingButtonView = createBuildingButtonView({
      root: gameHudRoot,
      translator: this.translator,
      onActivate: () => {
        void this.openBuildingChoice();
      }
    });
    this.unsubscribeBuildingEconomy = this.beachEconomyModel.subscribe(
      (snapshot) => this.updateBuildingAccess(snapshot)
    );
    this.buildingInteractionModalView = createBuildingInteractionModalView({
      root: this.root,
      translator: this.translator
    });
    this.buildingServicesModel = createBuildingServicesModel();
    this.unsubscribeBuildingRevenue = this.buildingServicesModel.subscribeToRevenue(
      (event) => this.handleBuildingRevenue(event)
    );
    this.timeManager = createTimeManager();
    this.timeCounterView = createTimeCounterView({
      root: gameHudRoot,
      translator: this.translator
    });
    this.heatModel = createHeatModel();
    this.heatMeterView = createHeatMeterView({
      root: gameHudRoot,
      translator: this.translator
    });
    this.heatTintView = createHeatTintView({ root: this.root });
    const initialHeat = this.heatModel.getSnapshot();
    this.heatMeterView.render(initialHeat);
    this.heatTintView.render(initialHeat);
    this.npcComplaintView = createNpcComplaintView({
      root: this.root,
      translator: this.translator,
      onComplaint: () => this.soundManager?.play(SOUND_IDS.COMPLAINT)
    });
    this.pickupFeedbackView = createPickupFeedbackView({
      root: this.root,
      translator: this.translator,
      windowRef: this.windowRef
    });
    this.unsubscribeTimeManager = this.timeManager.subscribe(
      (snapshot) => this.updateTimeCounter(snapshot)
    );
  }

  async beginRun({ notice = "" } = {}) {
    const { day } = this.runSessionModel.getSnapshot();
    this.sharkEventsToday = 0;
    this.currentDayReviews = [];
    const heatForecast = this.heatModel.startDay();

    await this.runPresentationView.playDay(day, { notice });
    this.heatMeterView.render(heatForecast);
    this.heatTintView.render(heatForecast);
    this.dayLifecycleController.startDay({
      averageRating: this.beachRatingModel.getSnapshot().averageRating,
      startWithSpawning: day !== 1
    });
    this.runPresentationView.setHudActive(true);
    this.soundManager?.playLoop(SOUND_IDS.BEACH_AMBIENCE);
    this.gameModeView.render("LIVE");
    if (day > 1) {
      this.startHeatWaveTask(heatForecast);
    }

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

    this.soundManager?.stopLoop(SOUND_IDS.BEACH_AMBIENCE);
    this.npcSystem.closeDay();
    this.processPendingBatherReviews();
    updateNpcSceneObjects({
      sceneObjects: this.npcSceneObjects,
      npcs: [],
      terrainSurfaceY: this.terrainSurfaceY
    });
    this.clearSharkEvent();
    this.updateBatherCounter([]);
    const dayReviews = [...this.currentDayReviews];
    this.preferredBuildingType = (
      BUILDING_TYPE_BY_BATHER_PROBLEM[findMainReviewProblem(dayReviews)] || null
    );
    const dayTasks = this.taskListModel?.getSnapshot() || [];
    const closingNotice = presentDayClosing(closing, this.translator);
    const dayResultNotice = presentDayResult({
      reviews: dayReviews,
      closing,
      tasks: dayTasks
    }, this.translator);
    const dayProblemMap = createDayProblemMap({
      reviews: dayReviews,
      remainingVisitorLitterCount: this.visitorLitterObjectIds.size,
      sharkEvents: this.sharkEventsToday,
      lifeguardOperational: closing.services?.lifeguardOperational
    });
    const dayProblemNotice = [
      this.translator.t(dayProblemMap.titleId),
      ...dayProblemMap.lines.map((messageId) => this.translator.t(messageId))
    ].join("\n");
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
        closingNotice: [closingNotice, dayResultNotice, dayProblemNotice]
          .filter(Boolean)
          .join("\n")
      });
      this.disposeObservers();
      return;
    }

    this.runSessionModel.prepareNextDay();
    this.soundManager?.play(SOUND_IDS.NEW_DAY);
    this.timeManager.reset();
    await this.beginRun({
      notice: [dayResultNotice, dayProblemNotice]
        .filter(Boolean)
        .join("\n")
    });
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
      "unsubscribeBatherServiceDecisions",
      "unsubscribeBatherServiceCompletions",
      "unsubscribeBatherBeverageDecisions",
      "unsubscribeBatherBeveragePurchases",
      "unsubscribeTaskList",
      "unsubscribeBuildingEconomy",
      "unsubscribeBuildingRevenue",
      "unsubscribeTimeManager",
      "unsubscribeShellLocale"
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
      enabled: this.buildingAccessUnlocked,
      moneyInCents,
      costInCents: BUILDING_ACCESS_COST_IN_CENTS
    });

    if (!hasAccess || this.buildingOnboardingShown) {
      return;
    }

    this.taskListModel?.upsert({
      id: BUILD_FIRST_CONSTRUCTION_TASK_ID,
      messageId: "tasks.buildFirstConstruction",
      progress: 0,
      target: 1
    });
    this.buildingOnboardingShown = true;
    void this.onboardingView?.pointTo(".building-button");
  }

  handleBuildingRevenue(event) {
    if (
      !BUILDING_REVENUE_TYPES.includes(event?.buildingType) ||
      !event.batherId ||
      !Number.isSafeInteger(event.amountInCents) ||
      event.amountInCents <= 0
    ) {
      return;
    }

    this.spawnBuildingRevenueMoneyDrop(event);
  }

  getBatherWorldPosition(batherId) {
    const bather = this.npcSystem?.getSnapshot?.().find((npc) => (
      npc.id === batherId
    ));

    return Array.isArray(bather?.position) && bather.position.length === 2 &&
      bather.position.every(Number.isFinite) ?
      [...bather.position] :
      null;
  }

  getBuildingRevenueWorldPosition(event) {
    const batherPosition = this.getBatherWorldPosition(event.batherId);

    if (event.buildingType !== BEACH_AMENITY_TYPES.SUN_SHADE) {
      return this.getBuildingServiceWorldPositions()[event.buildingType] ||
        batherPosition;
    }

    const sunShadePositions = this.getSunShadeWorldPositions();

    if (sunShadePositions.length === 0 || !batherPosition) {
      return sunShadePositions[0] || batherPosition;
    }

    return sunShadePositions.reduce((closestPosition, position) => {
      const closestDistance = Math.hypot(
        closestPosition[0] - batherPosition[0],
        closestPosition[1] - batherPosition[1]
      );
      const distance = Math.hypot(
        position[0] - batherPosition[0],
        position[1] - batherPosition[1]
      );

      return distance < closestDistance ? position : closestPosition;
    });
  }

  spawnMoneyDrop(
    { sourceId, position, amountInCents },
    { queueOnFailure = true } = {}
  ) {
    if (
      !sourceId ||
      !Array.isArray(position) ||
      position.length !== 2 ||
      !position.every(Number.isFinite) ||
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0
    ) {
      return false;
    }

    const request = Object.freeze({
      id: sourceId,
      type: SPAWNABLE_OBJECT_TYPES.MONEY,
      source: SPAWN_SOURCES.SPAWN_MANAGER,
      zone: BEACH_ZONES.SAND,
      collectionRewardInCents: amountInCents,
      countsForCleanupTask: false,
      placement: Object.freeze({
        position: Object.freeze([...position]),
        yaw: 0
      })
    });

    let addedObject = null;

    try {
      addedObject = addWorldObjectPlaceholderSceneInstance({
        sceneObjects: this.worldObjectSceneObjects,
        request,
        terrainSurfaceY: this.terrainSurfaceY,
        resolvePosition: (spawnRequest) => (
          this.resolveWorldObjectPosition(spawnRequest)
        )
      });
    } catch (error) {
      if (
        queueOnFailure &&
        !this.pendingMoneyDrops.some((drop) => drop.sourceId === sourceId)
      ) {
        this.pendingMoneyDrops.push({
          sourceId,
          position: [...position],
          amountInCents
        });
      }
    }

    if (addedObject) {
      this.renderIfLoopIsIdle();
    }

    return Boolean(addedObject);
  }

  flushPendingMoneyDrops() {
    while (this.pendingMoneyDrops.length > 0) {
      const pendingDrop = this.pendingMoneyDrops[0];
      const added = this.spawnMoneyDrop(pendingDrop, {
        queueOnFailure: false
      });

      if (!added) {
        break;
      }

      this.pendingMoneyDrops.shift();
    }
  }

  spawnBuildingRevenueMoneyDrop(event) {
    return this.spawnMoneyDrop({
      sourceId: `building-revenue-money-${event.buildingType}-${event.batherId}-${event.sequence}`,
      position: this.getBuildingRevenueWorldPosition(event),
      amountInCents: event.amountInCents
    });
  }

  handleBeveragePurchase(event) {
    if (
      !event?.batherId ||
      !Number.isSafeInteger(event.amountInCents) ||
      event.amountInCents <= 0
    ) {
      return;
    }

    this.spawnBuildingRevenueMoneyDrop({
      ...event,
      buildingType: BUILDING_TYPES.BEVERAGE_STORE
    });
    this.pendingBeveragePurchases.push(event);
    this.advanceHeatWaveTask();
  }

  handleBeverageDecision(event) {
    if (!event?.batherId) {
      return;
    }

    this.pendingBeverageDecisions.push(event);
  }

  handleBatherServiceDecision(event) {
    if (!event?.batherId || !event?.buildingType) {
      return;
    }

    this.pendingBatherServiceDecisions.push(event);
  }

  handleBatherServiceCompletion(event) {
    if (!event?.batherId || !event?.buildingType) {
      return;
    }

    if (event.buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
      this.buildingServicesModel?.recordServiceCompletion({
        buildingType: event.buildingType,
        batherId: event.batherId,
        durationSeconds: event.durationSeconds
      });
    }

    this.pendingBatherServiceCompletions.push(event);

    if (event.buildingType === BEACH_AMENITY_TYPES.SUN_SHADE) {
      this.advanceHeatWaveTask();
    }
  }

  scheduleCompletedTaskRemoval(task) {
    const taskId = String(task?.id || "");

    if (!taskId || this.completedTaskRemovalIds.has(taskId)) {
      return;
    }

    this.completedTaskRemovalIds.add(taskId);
    this.soundManager?.play(SOUND_IDS.TASK_DONE);
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

  startHeatWaveTask(heat) {
    this.taskListModel?.remove(HEAT_WAVE_TASK_ID);

    if (heat?.level !== HEAT_LEVELS.HIGH) {
      return null;
    }

    return this.taskListModel?.upsert(createHeatWaveTask()) || null;
  }

  advanceHeatWaveTask() {
    if (this.heatModel?.getSnapshot().level !== HEAT_LEVELS.HIGH) {
      return;
    }

    const task = this.taskListModel?.getSnapshot().find(({ id }) => (
      id === HEAT_WAVE_TASK_ID
    ));

    if (!task || task.progress >= task.target) {
      return;
    }

    this.taskListModel.advance(HEAT_WAVE_TASK_ID);
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
    this.gameModeView.render("BUILD");

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
        costInCents: BUILDING_ACCESS_COST_IN_CENTS,
        building: this.selectedRunBuilding
      };
      this.startBuildingPlacement();
    } catch (error) {
      console.error(error);
    } finally {
      this.buildingChoiceActive = false;
      if (!this.isBuildingPlacementActive()) {
        this.gameModeView.render("LIVE");
      }
    }
  }

  isBuildingPlacementActive() {
    return Boolean(this.pendingBuildingPlacement);
  }

  getSunShadePurchaseCostInCents() {
    return this.sunShadeCount === 0 ? 0 : SUN_SHADE_COST_IN_CENTS;
  }

  startSunShadePlacement() {
    if (!this.isRunActive() || this.isBuildingPlacementActive()) {
      return false;
    }

    const costInCents = this.getSunShadePurchaseCostInCents();
    const sunShadeNumber = this.sunShadeCount + 1;
    const purchaseSourceId = `sun-shade-${sunShadeNumber}`;

    try {
      if (costInCents > 0) {
        this.beachEconomyModel.recordExpense({
          sourceId: purchaseSourceId,
          amountInCents: costInCents
        });
      }

      this.pendingBuildingPlacement = {
        type: SCENERY_TYPES.SUN_SHADE,
        purchaseSourceId,
        costInCents,
        building: {
          color: [1, 1, 1]
        }
      };
      this.startBuildingPlacement();
      this.gameModeView.render("BUILD");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  cancelPendingBuildingPlacement() {
    const pendingPlacement = this.pendingBuildingPlacement;

    if (!pendingPlacement) {
      return false;
    }

    if (pendingPlacement.costInCents > 0) {
      this.beachEconomyModel.refundExpense({
        sourceId: pendingPlacement.purchaseSourceId,
        amountInCents: pendingPlacement.costInCents
      });
    }
    this.pendingBuildingPlacement = null;
    this.selectedRunBuilding = null;
    this.removeBuildingPlacementPreview();
    this.gameModeView.render("LIVE");
    this.renderIfLoopIsIdle();
    return true;
  }

  getBuildingPlacementCursorTile(cursorState) {
    if (!this.beachGrid || !cursorState) {
      return null;
    }

    const point = this.getGroundPointAtCursor(cursorState);

    if (!point) {
      return null;
    }

    return this.beachGrid.getTileAtWorldPosition(point[0], point[2]);
  }

  isPlacementTileAllowed(tile, placementType = this.pendingBuildingPlacement?.type) {
    return this.beachGrid?.isPlacementTileAllowed(tile, placementType) || false;
  }

  getBuildingPlacementTile(cursorState) {
    const tile = this.getBuildingPlacementCursorTile(cursorState);

    if (
      !tile ||
      tile.zone !== BEACH_ZONES.SAND ||
      !this.beachGrid.isTileAvailable(tile) ||
      !this.isPlacementTileAllowed(tile)
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
      pendingPlacement.type === BUILDING_TYPES.LIFEGUARD_BUILDING && this.beachHouseAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.beachHouseAsset,
      position
    }) : (
      pendingPlacement.type === BUILDING_TYPES.WIFI_SPOT && this.wifiSpotAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.wifiSpotAsset,
      position
    }) : (
      pendingPlacement.type === SCENERY_TYPES.SUN_SHADE && this.sunShadeAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.sunShadeAsset,
      position
    }) : (
      pendingPlacement.type === BUILDING_TYPES.TRASH_CANS && this.trashCansAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.trashCansAsset,
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
      !this.isPlacementTileAllowed(tile) ||
      !this.beachGrid.isTileAvailable(tile)
    ) {
      return false;
    }

    return true;
  }

  getBuildingPlacementHint(tile) {
    if (!tile) {
      return "moveOverBeach";
    }

    const diagnostics = this.beachGrid?.getTileDiagnostics(tile);

    if (diagnostics?.occupied) {
      return "spotBusy";
    }

    if (tile.zone === BEACH_ZONES.SEA) {
      return "notWater";
    }

    if (tile.zone !== BEACH_ZONES.SAND) {
      return "stayOnSand";
    }

    if (!this.isPlacementTileAllowed(tile)) {
      return this.pendingBuildingPlacement?.type === SCENERY_TYPES.SUN_SHADE
        ? "useSunShadeRow"
        : "useGreenRow";
    }

    return "";
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

    this.gameModeView.renderPlacementHint("moveOverBeach");
    this.renderIfLoopIsIdle();
  }

  updateBuildingPlacementPreview(cursorState) {
    if (!this.isBuildingPlacementActive()) {
      return null;
    }

    const cursorTile = this.getBuildingPlacementCursorTile(cursorState);
    const validTile = this.getBuildingPlacementTile(cursorState);
    this.buildingPlacementTile = validTile;
    const instance = this.buildingPlacementPreviewSceneObject?.instances?.[0];
    if (instance) {
      instance.offset = cursorTile ?
        [cursorTile.centerX, this.terrainSurfaceY, cursorTile.centerZ] :
        [0, this.terrainSurfaceY, 0];
      instance.tint = validTile ? [1, 1, 1] : [1, 0.18, 0.12];
      instance.tintStrength = validTile ? 0 : 0.8;
      instance.alpha = validTile ? 0.58 : 0.28;
    }

    const placementHintPosition = cursorTile ?
      createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      })(
        "building-placement-preview",
        [this.buildingPlacementPreviewSceneObject]
      ) :
      null;
    this.gameModeView.renderPlacementHint(
      this.getBuildingPlacementHint(cursorTile),
      placementHintPosition
    );

    this.renderIfLoopIsIdle();
    return validTile;
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
    const isSunShadePlacement = type === SCENERY_TYPES.SUN_SHADE;
    const isFirstConstruction = this.constructedBuildingCount === 0;
    const selectedTile = this.updateBuildingPlacementPreview(cursorState);

    if (!selectedTile) {
      return;
    }

    let claimedTile = null;

    try {
      const placementNumber = isSunShadePlacement ?
        this.sunShadeCount + 1 :
        this.constructedBuildingCount + 1;
      claimedTile = this.beachGrid.claimNearestAvailableTile({
        x: selectedTile.centerX,
        z: selectedTile.centerZ,
        zone: BEACH_ZONES.SAND,
        placementType: type,
        maxRadiusInTiles: 0,
        reason: `${isSunShadePlacement ? "sun-shade" : "building"}:${type}-${placementNumber}`
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
      type === BUILDING_TYPES.LIFEGUARD_BUILDING && this.beachHouseAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.beachHouseAsset,
      position: buildingPosition
    }) : (
      type === BUILDING_TYPES.WIFI_SPOT && this.wifiSpotAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.wifiSpotAsset,
      position: buildingPosition
    }) : (
      isSunShadePlacement && this.sunShadeAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.sunShadeAsset,
      position: buildingPosition
    }) : (
      type === BUILDING_TYPES.TRASH_CANS && this.trashCansAsset
    ) ? createScenerySceneObjects({
      sceneryAsset: this.trashCansAsset,
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
          id: `${type}-${placementNumber}`
        }));
      }

      if (!isSunShadePlacement) {
        this.buildingServicesModel.addBuilding(type);
        this.runBuildingSceneObjects.push(...newBuildingSceneObjects);
        this.constructedBuildingCount += 1;
      } else {
        this.sunShadeSceneObjects.push(...newBuildingSceneObjects);
        this.sunShadeCount += 1;
      }
      this.removeBuildingPlacementPreview();
      this.sceneObjects.push(...newBuildingSceneObjects);
      this.soundManager?.play(SOUND_IDS.POP);
      protectScenery(
        this.beachGrid,
        newBuildingSceneObjects,
        CONSTRUCTION_DROP_EXCLUSION_PADDING
      );
      this.startConstructionAnimation(newBuildingSceneObjects);
      this.pendingBuildingPlacement = null;
      this.selectedRunBuilding = null;
      this.gameModeView.render("LIVE");

      if (isSunShadePlacement || !isFirstConstruction) {
        this.render();
        return;
      }

      this.taskListModel.remove(BUILD_FIRST_CONSTRUCTION_TASK_ID);
      this.startDailyCleanupTask(this.runSessionModel.getSnapshot().day);
      this.taskListModel.upsert({
        id: WELCOME_BATHERS_TASK_ID,
        messageId: "tasks.welcomeBathers",
        progress: 0,
        target: 3
      });
      this.startHeatWaveTask(this.heatModel.getSnapshot());
      this.render();
      await this.onboardingView.showNotice({
        messageId: BATHER_ONBOARDING_NOTICE_ID
      });
      this.worldInteractionGuide?.showForObject(`${SCENERY_TYPES.KIOSK}-main`);
      this.dayLifecycleController.startSpawning({
        averageRating: this.beachRatingModel.getSnapshot().averageRating,
        immediateBather: true
      });
    } catch (error) {
      if (claimedTile) {
        this.beachGrid.releaseWorldPosition(claimedTile.centerX, claimedTile.centerZ);
      }
      if (pendingPlacement.costInCents > 0) {
        this.beachEconomyModel.refundExpense({
          sourceId: pendingPlacement.purchaseSourceId,
          amountInCents: pendingPlacement.costInCents
        });
      }
      this.pendingBuildingPlacement = null;
      this.selectedRunBuilding = null;
      this.removeBuildingPlacementPreview();
      this.gameModeView.render("LIVE");
      console.error(error);
    }
  }

  startConstructionAnimation(sceneObjects) {
    for (const sceneObject of sceneObjects) {
      for (const instance of sceneObject.instances) {
        const finalScale = instance.scale ?? 1;

        instance.scale = 0;
        instance.alpha = 0;
        this.constructionAnimations.push({
          instance,
          finalScale,
          elapsedSeconds: 0
        });
      }
    }
  }

  updateConstructionAnimations(deltaSeconds) {
    if (this.constructionAnimations.length === 0) {
      return;
    }

    const stepSeconds = Math.max(0, Number(deltaSeconds) || 0);
    const remainingAnimations = [];

    for (const animation of this.constructionAnimations) {
      animation.elapsedSeconds = Math.min(
        BUILDING_CONSTRUCTION_ANIMATION_DURATION_SECONDS,
        animation.elapsedSeconds + stepSeconds
      );

      const progress = animation.elapsedSeconds /
        BUILDING_CONSTRUCTION_ANIMATION_DURATION_SECONDS;
      const easedProgress = this.easeOutBack(progress);
      const alphaProgress = 1 - (1 - progress) ** 3;

      animation.instance.scale = animation.finalScale * easedProgress;
      animation.instance.alpha = alphaProgress;

      if (progress < 1) {
        remainingAnimations.push(animation);
      } else {
        animation.instance.scale = animation.finalScale;
        animation.instance.alpha = 1;
      }
    }

    this.constructionAnimations = remainingAnimations;
  }

  easeOutBack(value) {
    const t = Math.min(1, Math.max(0, Number(value) || 0));
    const overshoot = 1.70158;
    const shifted = t - 1;

    return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
  }

  updateBatherCounter(npcs) {
    const bathers = npcs.filter((npc) => npc.type === NPC_TYPES.BATHER);
    const batherCount = bathers.length;

    this.batherCounterView?.render(batherCount, bathers);
  }

  updateMoneyCounter({ moneyInCents }) {
    if (
      this.lastMoneyInCents !== null &&
      moneyInCents > this.lastMoneyInCents
    ) {
      this.soundManager?.play(SOUND_IDS.CASH);
    }

    this.lastMoneyInCents = moneyInCents;
    this.moneyCounterView?.render(moneyInCents);
  }

  showMoneyGainAtPosition(position) {
    return this.pickupFeedbackView?.showMoneyGain({
      ...position,
      targetElement: this.moneyCounterView?.getElement?.()
    });
  }

  showMoneyGainFromBuilding(buildingType) {
    if (!buildingType) {
      return false;
    }

    const projectToOverlay = createWorldOverlayProjector({
      root: this.root,
      canvas: this.canvas,
      camera: this.camera
    });
    const position = projectToOverlay(
      `${buildingType}-main`,
      this.runBuildingSceneObjects
    );

    return position ? this.showMoneyGainAtPosition(position) : false;
  }

  showMoneyGainFromBather(batherId) {
    if (!batherId) {
      return false;
    }

    const projectToOverlay = createWorldOverlayProjector({
      root: this.root,
      canvas: this.canvas,
      camera: this.camera
    });
    const position = projectToOverlay(batherId, this.npcSceneObjects);

    return position ? this.showMoneyGainAtPosition(position) : false;
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

  getInteractiveBuildingSceneObjects() {
    return this.sceneObjects.filter((sceneObject) => (
      sceneObject.sceneryType === SCENERY_TYPES.KIOSK ||
      sceneObject.sceneryType === BUILDING_TYPES.BEVERAGE_STORE
    ));
  }

  hasWorldObjectInteraction(cursorState) {
    if (!this.isRunActive() || this.buildingChoiceActive) {
      return false;
    }

    const buildingSelection = this.findSceneObjectAtCursor(
      cursorState,
      this.getInteractiveBuildingSceneObjects()
    );

    return Boolean(buildingSelection || this.findSceneObjectAtCursor(cursorState));
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

    const interactiveBuildingSceneObjects = this.getInteractiveBuildingSceneObjects();
    const buildingSelection = this.findSceneObjectAtCursor(
      cursorState,
      interactiveBuildingSceneObjects
    );

    if (buildingSelection) {
      const sceneObject = interactiveBuildingSceneObjects.find((candidate) => (
        candidate.instances?.some((instance) => instance.id === buildingSelection.objectId)
      ));
      const buildingType = sceneObject?.sceneryType;

      if (buildingType === SCENERY_TYPES.KIOSK) {
        this.worldInteractionGuide?.hide();
      }
      this.focusCameraOnBuilding(buildingType, buildingSelection.objectId);
      this.buildingInteractionModalView.show({
        buildingType,
        actions: this.getBuildingInteractionActions(buildingType),
        onClose: () => this.restoreCameraAfterBuildingModal()
      });
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
      const totalRewardInDollars = totalRewardInCents / 100;
      this.showMoneyGainAtPosition(position);
      this.pickupFeedbackView.showCollection({
        ...position,
        valuable: collection.valuable,
        messageId: collection.bonusAmountInCents > 0
          ? "feedback.pickup.moneyBonus"
          : "feedback.pickup.money",
        messageParams: {
          amount: this.translator.formatCurrency(totalRewardInDollars)
        }
      });
    }

    if (removedObject) {
      this.soundManager?.play(SOUND_IDS.POP);
      this.beachGrid?.releaseWorldPosition(
        removedObject.offset[0],
        removedObject.offset[2]
      );
      this.flushPendingMoneyDrops();
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

  focusCameraOnBuilding(buildingType, objectId) {
    const sceneObject = this.getInteractiveBuildingSceneObjects().find((candidate) => (
      candidate.sceneryType === buildingType &&
      candidate.instances?.some((instance) => instance.id === objectId)
    ));
    const instance = sceneObject?.instances?.find((candidate) => candidate.id === objectId);

    if (
      !instance ||
      !Array.isArray(instance.offset) ||
      instance.offset.length !== 3 ||
      !instance.offset.every(Number.isFinite)
    ) {
      return false;
    }

    const modelSpan = Math.max(
      Number(sceneObject.model?.size?.[0]) || 0,
      Number(sceneObject.model?.size?.[2]) || 0
    ) * (Number(instance.scale) || 1);
    const focusDistance = this.camera.getDistanceForScreenWidth(
      modelSpan,
      BUILDING_CAMERA_FOCUS_SCREEN_FRACTION,
      LOGICAL_STAGE_WIDTH / LOGICAL_STAGE_HEIGHT
    );
    const targetScreenOffset = this.camera.getHorizontalScreenHalfSpan(
      LOGICAL_STAGE_WIDTH / LOGICAL_STAGE_HEIGHT,
      focusDistance
    ) * BUILDING_CAMERA_FOCUS_SCREEN_FRACTION;
    const modelHeight = (
      Number(sceneObject.model?.size?.[1]) || 0
    ) * (Number(instance.scale) || 1);

    this.cameraTargetMotionNode?.focus(
      [
        instance.offset[0] + Math.cos(BUILDING_CAMERA_FOCUS_YAW) * targetScreenOffset,
        instance.offset[1] + modelHeight * 0.5,
        instance.offset[2] - Math.sin(BUILDING_CAMERA_FOCUS_YAW) * targetScreenOffset
      ],
      {
        distance: focusDistance,
        yaw: BUILDING_CAMERA_FOCUS_YAW,
        pitch: BUILDING_CAMERA_FOCUS_PITCH
      }
    );
    this.markOnboardingProjectionDirty();
    return true;
  }

  restoreCameraAfterBuildingModal() {
    const restored = this.cameraTargetMotionNode?.restore();
    if (restored) {
      this.markOnboardingProjectionDirty();
    }
  }

  markOnboardingProjectionDirty() {
    this.cleanBeachGuide?.markProjectionDirty();
    this.worldInteractionGuide?.markProjectionDirty();
  }

  isCameraNavigationLocked() {
    return Boolean(
      this.buildingChoiceActive ||
      this.buildingInteractionModalView?.isOpen?.() ||
      this.cameraTargetMotionNode?.isActive?.()
    );
  }

  getBuildingInteractionActions(buildingType) {
    if (buildingType !== SCENERY_TYPES.KIOSK) {
      return [];
    }

    const costInCents = this.getSunShadePurchaseCostInCents();
    const canAfford = Number(this.beachEconomyModel?.getSnapshot().moneyInCents) >= costInCents;
    const costLabel = costInCents === 0 ?
      this.translator.t("common.free") :
      this.translator.formatCurrency(costInCents / 100);

    return [{
      messageId: "actions.placeSunShade",
      messageParams: { cost: costLabel },
      descriptionId: costInCents === 0 ?
        "actions.firstSunShadeFree" :
        "actions.additionalSunShadeCost",
      disabled: !canAfford,
      onSelect: () => {
        this.buildingInteractionModalView.close();
        this.startSunShadePlacement();
      }
    }];
  }

  applyCursorZoom(cursorState) {
    if (!this.isRunActive() || this.isCameraNavigationLocked()) {
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
      this.markOnboardingProjectionDirty();
      this.renderIfLoopIsIdle();
    }
  }

  applyCursorPan(cursorState) {
    if (!this.isRunActive() || this.isCameraNavigationLocked()) {
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
    this.markOnboardingProjectionDirty();

    if (this.renderer) {
      this.renderIfLoopIsIdle();
    }
  }

  applyCursorRotate(cursorState) {
    if (!this.isRunActive() || this.isCameraNavigationLocked()) {
      return;
    }

    const changed = this.camera.rotateByScreenDelta(cursorState.deltaX);

    if (changed && this.renderer) {
      this.playerExperienceModel?.recordNavigation(
        Math.min(Math.abs(cursorState.deltaX) / 80, 1)
      );
      this.markOnboardingProjectionDirty();
      this.renderIfLoopIsIdle();
    }
  }

  initializeRenderer() {
    try {
      this.renderer = createWorldRenderer({ canvas: this.canvas });
    } catch (error) {
      this.setStatus(this.translator.t("app.rendererError"));
      throw error;
    }
  }

  setStatus(message) {
    this.statusElement.dataset.statusId = "";
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
    this.fpsElement.textContent = this.translator.t("app.fps", { value: fps });
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
      if (this.cameraTargetMotionNode?.update(deltaSeconds)) {
        this.markOnboardingProjectionDirty();
      }
      if (this.isRunActive() && !this.buildingChoiceActive) {
        this.playerExperienceModel?.update(deltaSeconds);
        const timeSnapshot = this.timeManager?.update(deltaSeconds);
        const heatSnapshot = this.heatModel.update(timeSnapshot);
        this.heatMeterView.render(heatSnapshot);
        this.heatTintView.render(heatSnapshot);

        if (timeSnapshot?.complete) {
          this.startDayTransition();
        } else {
          this.updateSpawns(deltaSeconds);
        }
      }
      this.updateNpcWorld(deltaSeconds);
      this.updateSharkEvent(deltaSeconds);
      this.updateConstructionAnimations(deltaSeconds);
      this.render();
      this.updateFpsCounter(now);
      this.animationFrameId = scheduleFrame(tick);
    };

    this.animationFrameId = scheduleFrame(tick);
  }

  updateNavigationCamera(deltaSeconds) {
    if (!this.isRunActive() || this.isCameraNavigationLocked()) {
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
    this.markOnboardingProjectionDirty();
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

  startSharkEvent(request) {
    const placement = request?.placement;
    const startPosition = placement?.position;
    const exitPosition = placement?.exitPosition;

    if (
      !this.sharkSceneObject ||
      !Array.isArray(startPosition) ||
      !Array.isArray(exitPosition) ||
      startPosition.length !== 2 ||
      exitPosition.length !== 2 ||
      !startPosition.every(Number.isFinite) ||
      !exitPosition.every(Number.isFinite)
    ) {
      return false;
    }

    const direction = Number(placement.direction) < 0 ? -1 : 1;
    const modelYawOffset = Number(this.sharkSceneObject.modelFaceYawOffset) || 0;

    this.activeSharkEvent = {
      id: request.id,
      elapsedSeconds: 0,
      durationSeconds: Math.max(0.1, Number(request.durationSeconds) || 12),
      startPosition: [...startPosition],
      exitPosition: [...exitPosition],
      direction,
      modelYaw: modelYawOffset + (direction > 0 ? -Math.PI / 2 : Math.PI / 2)
    };
    this.sharkEventsToday += 1;
    this.sharkSceneObject.instances = [{
      id: request.id,
      offset: [
        startPosition[0],
        this.terrainSurfaceY + SHARK_WATERLINE_OFFSET + SHARK_SWIM_HEIGHT,
        startPosition[1]
      ],
      scale: 1,
      yaw: this.activeSharkEvent.modelYaw,
      pitch: 0,
      roll: 0,
      tint: [1, 1, 1],
      tintStrength: 0,
      alpha: 1
    }];

    return true;
  }

  updateSharkEvent(deltaSeconds) {
    if (!this.activeSharkEvent || !this.sharkSceneObject) {
      return;
    }

    const event = this.activeSharkEvent;
    event.elapsedSeconds += Math.max(0, Number(deltaSeconds) || 0);
    const progress = Math.min(1, event.elapsedSeconds / event.durationSeconds);
    const x = event.startPosition[0] + (
      event.exitPosition[0] - event.startPosition[0]
    ) * progress;
    const z = event.startPosition[1] + (
      event.exitPosition[1] - event.startPosition[1]
    ) * progress;
    const swimPhase = event.elapsedSeconds * 6.5;
    const instance = this.sharkSceneObject.instances[0];

    if (instance) {
      instance.offset = [
        x,
        this.terrainSurfaceY + SHARK_WATERLINE_OFFSET +
          SHARK_SWIM_HEIGHT + Math.sin(swimPhase) * 0.08,
        z
      ];
      instance.yaw = event.modelYaw;
      instance.pitch = Math.sin(swimPhase) * SHARK_SWIM_PITCH;
      instance.roll = Math.cos(swimPhase * 0.7) * SHARK_SWIM_ROLL;
    }

    if (progress >= 1) {
      this.clearSharkEvent();
    }
  }

  clearSharkEvent() {
    this.activeSharkEvent = null;

    if (this.sharkSceneObject) {
      this.sharkSceneObject.instances = [];
    }
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

      if (request.type === SPAWN_TYPES.SHARK) {
        this.startSharkEvent(request);
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

          if (request.reason === "beverage") {
            const projectToOverlay = createWorldOverlayProjector({
              root: this.root,
              canvas: this.canvas,
              camera: this.camera
            });
            const position = projectToOverlay(
              addedObject.id,
              this.worldObjectSceneObjects
            );

            if (position) {
              this.pickupFeedbackView.showCollection({
                ...position,
                valuable: false,
                messageId: "feedback.pickup.beerLitter",
                durationMs: 1400
              });
            }
          }
        }
      }
    }
  }

  processPendingBatherReviews() {
    for (const bather of this.pendingBatherReviews.splice(0)) {
      const review = this.recordBatherReview(bather);

      if (review) {
        this.currentDayReviews.push(review);
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
    const serviceUsers = bathers.filter((bather) => (
      bather.state === NPC_STATES.SERVICE_USE &&
      Boolean(bather.activityBuildingType)
    ));
    this.buildingServicesModel.update(deltaSeconds, {
      batherCount: bathers.length,
      bathers,
      serviceUsers
    });
    const sunShadePositions = this.getSunShadeWorldPositions();
    const servicePositions = this.getBuildingServiceWorldPositions();
    this.npcSystem.update(deltaSeconds, {
      buildingServices: this.buildingServicesModel.getSnapshot(),
      heat: this.heatModel.getSnapshot(),
      beverageStorePosition: servicePositions[BUILDING_TYPES.BEVERAGE_STORE] || null,
      servicePositions,
      sunShadePositions,
      buildingObstacles: this.getBatherBuildingObstacles()
    });
    const npcs = this.npcSystem.getSnapshot();
    this.processPendingBatherReviews();
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
            text: presentBatherNeedFeedback(event.source, this.translator)
          });
        }
      }
    }
    if (this.pendingBeverageDecisions.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });

      for (const decision of this.pendingBeverageDecisions.splice(0)) {
        const position = projectToOverlay(decision.batherId, this.npcSceneObjects);

        if (position) {
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: false,
            messageId: "feedback.pickup.wantsBeer",
            durationMs: BATHER_INTENT_FEEDBACK_DURATION_MS
          });
        }
      }
    }
    if (this.pendingBatherServiceDecisions.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });

      for (const decision of this.pendingBatherServiceDecisions.splice(0)) {
        const messageId = BATHER_SERVICE_DECISION_MESSAGE_IDS[decision.buildingType];
        const position = projectToOverlay(decision.batherId, this.npcSceneObjects);

        if (messageId && position) {
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: false,
            messageId,
            durationMs: BATHER_INTENT_FEEDBACK_DURATION_MS
          });
        }
      }
    }
    if (this.pendingBatherServiceCompletions.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });

      for (const completion of this.pendingBatherServiceCompletions.splice(0)) {
        const messageId = BATHER_SERVICE_COMPLETION_MESSAGE_IDS[completion.buildingType];
        const position = projectToOverlay(completion.batherId, this.npcSceneObjects);

        if (messageId && position) {
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: false,
            messageId,
            durationMs: BATHER_SERVICE_FEEDBACK_DURATION_MS
          });
        }
      }
    }
    if (this.pendingBeveragePurchases.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });
      const beverageStoreObjectId = `${BUILDING_TYPES.BEVERAGE_STORE}-main`;

      for (const purchase of this.pendingBeveragePurchases.splice(0)) {
        const position = projectToOverlay(
          beverageStoreObjectId,
          this.runBuildingSceneObjects
        );

        if (position) {
          this.pickupFeedbackView.showCollection({
            ...position,
            valuable: false,
            messageId: "feedback.pickup.beerSold",
            durationMs: BATHER_SERVICE_FEEDBACK_DURATION_MS
          });
        }
      }
    }
    this.updateBatherCounter(npcs);
  }

  getBuildingServiceWorldPositions() {
    const positions = {};

    for (const sceneObject of this.runBuildingSceneObjects) {
      const instance = sceneObject?.instances?.[0];

      if (
        !sceneObject?.sceneryType ||
        !Array.isArray(instance?.offset) ||
        instance.offset.length !== 3 ||
        !instance.offset.every(Number.isFinite)
      ) {
        continue;
      }

      positions[sceneObject.sceneryType] = [
        instance.offset[0],
        instance.offset[2]
      ];
    }

    return positions;
  }

  getBatherBuildingObstacles() {
    const sceneryTypes = new Set(Object.values(SCENERY_TYPES));

    return this.sceneObjects.flatMap((sceneObject) => {
      if (
        sceneObject === this.buildingPlacementPreviewSceneObject ||
        !sceneryTypes.has(sceneObject?.sceneryType) ||
        !Array.isArray(sceneObject?.instances)
      ) {
        return [];
      }

      const modelSpan = Math.max(
        Number(sceneObject.model?.size?.[0]) || 0,
        Number(sceneObject.model?.size?.[2]) || 0
      );

      return sceneObject.instances.map((instance) => {
        if (
          !Array.isArray(instance?.offset) ||
          instance.offset.length !== 3 ||
          !instance.offset.every(Number.isFinite)
        ) {
          return null;
        }

        return {
          position: [instance.offset[0], instance.offset[2]],
          radius: Math.max(
            2.5,
            modelSpan * (Number(instance.scale) || 1) * 0.42 + 1.5
          )
        };
      }).filter(Boolean);
    });
  }

  getSunShadeWorldPositions() {
    return this.sunShadeSceneObjects.flatMap((sceneObject) => (
      sceneObject.instances
        .map((instance) => (
          Array.isArray(instance.offset) && instance.offset.length === 3 &&
          instance.offset.every(Number.isFinite) ?
            [instance.offset[0], instance.offset[2]] :
            null
        ))
        .filter(Boolean)
    ));
  }

  getBeverageStoreWorldPosition() {
    return this.getBuildingServiceWorldPositions()[BUILDING_TYPES.BEVERAGE_STORE] || null;
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
    const complaintNpcs = (this.npcSystem?.getSnapshot() || [])
      .filter((npc) => npc.complaint && !npc.departing);
    let complaints = [];

    if (complaintNpcs.length > 0) {
      const projectToOverlay = createWorldOverlayProjector({
        root: this.root,
        canvas: this.canvas,
        camera: this.camera
      });
      complaints = complaintNpcs
        .map((npc) => {
          const position = projectToOverlay(npc.id, this.npcSceneObjects);

          return position ? {
            id: npc.id,
            messageId: npc.complaint,
            needMotive: npc.mood?.strongestNeed?.motive || "",
            needPercent: npc.mood?.strongestNeed?.value || 0,
            ...position
          } : null;
        })
        .filter(Boolean);
    }

    this.npcComplaintView?.render(complaints);
    this.cleanBeachGuide?.render();
    this.worldInteractionGuide?.render();
  }

  async loadWorld() {
    const world = await loadBeachWorld({
      gl: this.renderer.getContext(),
      camera: this.camera,
      onStatus: (status) => {
        if (status?.type === "asset-loading") {
          this.setStatus(this.translator.t("app.loadingAsset", {
            asset: status.asset
          }));
          return;
        }

        this.setStatus(status);
      }
    });

    this.terrainAssets = world.terrainAssets;
    this.beverageStoreAsset = world.beverageStoreAsset;
    this.beachHouseAsset = world.beachHouseAsset;
    this.wifiSpotAsset = world.wifiSpotAsset;
    this.sunShadeAsset = world.sunShadeAsset;
    this.trashCansAsset = world.trashCansAsset;
    this.terrainSceneObjects = world.terrainSceneObjects;
    this.npcSceneObjects = world.npcSceneObjects;
    this.sharkSceneObject = this.npcSceneObjects.find((sceneObject) => (
      sceneObject.npcType === SPAWNABLE_OBJECT_TYPES.SHARK
    )) || null;
    this.npcSystem = world.npcSystem;
    this.unsubscribeBatherDepartures = this.npcSystem.subscribeToDepartures(
      (bather) => this.pendingBatherReviews.push(bather)
    );
    this.unsubscribeBatherToleranceChanges = this.npcSystem.subscribeToToleranceChanges(
      (event) => this.handleBatherToleranceChange(event)
    );
    this.unsubscribeBatherServiceDecisions = this.npcSystem.subscribeToServiceDecisions(
      (event) => this.handleBatherServiceDecision(event)
    );
    this.unsubscribeBatherServiceCompletions = this.npcSystem.subscribeToServiceCompletions(
      (event) => this.handleBatherServiceCompletion(event)
    );
    this.unsubscribeBatherBeverageDecisions = this.npcSystem.subscribeToBeverageDecisions(
      (event) => this.handleBeverageDecision(event)
    );
    this.unsubscribeBatherBeveragePurchases = this.npcSystem.subscribeToBeveragePurchases(
      (event) => this.handleBeveragePurchase(event)
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
    const projectToOverlay = createWorldOverlayProjector({
      root: this.root,
      canvas: this.canvas,
      camera: this.camera
    });
    const position = projectToOverlay(bather.id, this.npcSceneObjects);
    if (position) {
      this.pickupFeedbackView.showCollection({
        ...position,
        valuable: rating >= 4,
        messageId: "feedback.pickup.review",
        messageParams: {
          rating,
          stars: this.translator.t(
            rating === 1 ? "feedback.pickup.star" : "feedback.pickup.stars"
          )
        },
        durationMs: BATHER_REVIEW_FEEDBACK_DURATION_MS
      });
    }
    const reviewReward = this.reviewRewardModel.recordReview({ rating });

    if (reviewReward.awarded) {
      this.spawnMoneyDrop({
        sourceId: `${bather.id}-review-bonus-${reviewReward.rewardSequence}`,
        position: bather.position,
        amountInCents: reviewReward.amountInCents
      });

      if (position) {
        this.pickupFeedbackView.showCollection({
          ...position,
          valuable: false,
          messageId: "feedback.pickup.reviewBonus",
          durationMs: BATHER_REVIEW_FEEDBACK_DURATION_MS
        });
      }
    }

    return review;
  }
}

export const gameManager = new TerrainGameManager();
