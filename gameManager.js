import { createWorldRenderer } from "./rendering/worldRenderer.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCursorInput } from "./input/cursor.js";
import { loadTerrainAssets } from "./terrain/terrainAssets.js";
import {
  createTerrainSceneObjects,
  getBeachEntryPosition,
  getBeachSandPosition,
  getBeachSandZNearRestinga,
  getTerrainSurfaceY,
  getTerrainTileSpan,
  updateTerrainSceneObjects
} from "./terrain/terrainWorld.js";
import { BEACH_ZONES, createBeachGrid } from "./terrain/beachGrid.js";
import {
  createNpcSceneObjects,
  loadNpcAssets,
  updateNpcSceneObjects
} from "./npcs/npcWorld.js";
import { createNpcSystem, NPC_TYPES } from "./npcs/npcSystem.js";
import {
  createSceneryPlaceholderSceneObjects,
  createScenerySceneObjects,
  loadSceneryAsset,
  SCENERY_TYPES
} from "./scenery/sceneryWorld.js";
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
import { createRunPresentationView } from "./ui/runPresentationView.js";
import { createTimeManager } from "./time/timeManager.js";
import { createTimeCounterView } from "./ui/timeCounterView.js";
import { createNpcComplaintView } from "./ui/npcComplaintView.js";
import { createOnboardingView } from "./onboarding/onboardingView.js";
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
  createSpawnManager,
  SPAWN_TYPES
} from "./spawn/spawnManager.js";
import {
  getSpawnableObjectDto,
  SPAWNABLE_OBJECT_TRAITS,
  SPAWN_SOURCES
} from "./spawn/spawnableObjectDto.js";
import {
  addWorldObjectPlaceholderSceneInstance,
  createWorldObjectPlaceholderSceneObjects,
  removeWorldObjectSceneInstance,
  setHoveredWorldObjectSceneInstance
} from "./objects/worldObjectWorld.js";
import {
  findWorldObjectSelection,
  getWorldObjectScreenPosition
} from "./interaction/worldObjectInteraction.js";

const KIOSK_POSITION_X = -48;
const KIOSK_RESTINGA_INSET = 18;
const BEACH_HOUSE_POSITION_X = 12;
const BEACH_HOUSE_RESTINGA_INSET = 36;
const BEACH_HOUSE_RESTINGA_TILE_OFFSET = 2;
const PICKUP_REWARD_IN_CENTS = 500;
const BEVERAGE_SALE_IN_CENTS = 200;
const CLEAN_BEACH_TASK_ID = "clean-the-beach";
const CLEAN_BEACH_TARGET = 5;
const TASK_COMPLETE_NOTICE_DELAY_MS = 1300;
const BATHER_ONBOARDING_NOTICE = "Bathers will start to populate your beach, they are the customers, treat them kindly  and they will comeback!";
const CLEAN_BEACH_HINT_DELAY_MS = Object.freeze({ min: 3000, max: 5000 });

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
    this.npcAssets = null;
    this.npcSceneObjects = [];
    this.npcSystem = null;
    this.spawnManager = null;
    this.worldObjectSceneObjects = [];
    this.batherCounterView = null;
    this.beachEconomyModel = null;
    this.moneyCounterView = null;
    this.unsubscribeBeachEconomy = null;
    this.beachRatingModel = null;
    this.ratingCounterView = null;
    this.unsubscribeBeachRating = null;
    this.taskListModel = null;
    this.taskListView = null;
    this.unsubscribeTaskList = null;
    this.cleanBeachHintTimeoutId = null;
    this.cleanBeachHintTargetId = null;
    this.cleanBeachHintNeedsUpdate = false;
    this.runSessionModel = null;
    this.runPresentationView = null;
    this.onboardingView = null;
    this.buildingChoiceModel = null;
    this.buildingChoiceView = null;
    this.buildingServicesModel = null;
    this.buildingChoiceActive = false;
    this.selectedRunBuilding = null;
    this.playerExperienceModel = null;
    this.timeManager = null;
    this.timeCounterView = null;
    this.npcComplaintView = null;
    this.unsubscribeTimeManager = null;
    this.kioskAssets = null;
    this.kioskSceneObjects = [];
    this.beachHouseAssets = null;
    this.beachHouseSceneObjects = [];
    this.runBuildingSceneObjects = [];
    this.terrainSurfaceY = 0;
    this.sceneObjects = [];
    this.startTimeMs = 0;
    this.lastFrameTimeMs = 0;
    this.fpsFrameCount = 0;
    this.fpsSampleStartedMs = 0;
    this.animationFrameId = null;
    this.dayCostsSettled = false;
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
        this.statusElement?.remove();
        this.render();
        this.startRenderLoop();
        this.windowRef.addEventListener("resize", () => {
          this.cleanBeachHintNeedsUpdate = true;
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
    this.taskListView = createTaskListView({
      root: hudRoot,
      onTaskComplete: (task) => {
        if (task.id !== CLEAN_BEACH_TASK_ID) {
          return;
        }

        this.buildingChoiceActive = true;
        this.windowRef.setTimeout(() => {
          const choice = this.buildingChoiceModel.startChoice();

          void this.buildingChoiceView
            .show(choice.options)
            .then((type) => {
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
              this.render();
              return this.onboardingView.showNotice(BATHER_ONBOARDING_NOTICE);
            })
            .then(() => {
              this.buildingChoiceActive = false;
              this.spawnManager?.start({
                averageRating: this.beachRatingModel.getSnapshot().averageRating
              });
              this.spawnManager?.requestImmediateBather();
            })
            .catch((error) => {
              this.buildingChoiceActive = false;
              console.error(error);
            });
        }, TASK_COMPLETE_NOTICE_DELAY_MS);
      }
    });
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
    this.buildingServicesModel = createBuildingServicesModel();
    this.timeManager = createTimeManager();
    this.timeCounterView = createTimeCounterView({ root: gameHudRoot });
    this.npcComplaintView = createNpcComplaintView({ root: this.root });
    this.unsubscribeTimeManager = this.timeManager.subscribe(
      (snapshot) => this.updateTimeCounter(snapshot)
    );
  }

  async beginRun() {
    const { day } = this.runSessionModel.getSnapshot();

    await this.runPresentationView.playDay(day);
    this.runSessionModel.activateDay();
    this.dayCostsSettled = false;
    this.timeManager.start();
    if (day !== 1) {
      this.spawnManager.start({
        averageRating: this.beachRatingModel.getSnapshot().averageRating
      });
    }
    this.runPresentationView.setHudActive(true);

    if (day === 1) {
      await this.onboardingView.pointTo(
        `[data-task-id="${CLEAN_BEACH_TASK_ID}"] .task-list__progress-row`
      );
      this.scheduleCleanBeachHint();
    }
  }

  isRunActive() {
    return this.runSessionModel?.getSnapshot().phase === RUN_PHASES.ACTIVE;
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
    this.updateWorldObjectHover(cursorState);
  }

  findWorldObjectAtCursor(cursorState) {
    if (!this.isRunActive() || this.worldObjectSceneObjects.length === 0) {
      return null;
    }

    const viewport = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    };

    return findWorldObjectSelection({
      pointer: cursorState,
      sceneObjects: this.worldObjectSceneObjects,
      viewProjection: this.camera.getViewProjection(viewport.width, viewport.height),
      viewport
    });
  }

  updateWorldObjectHover(cursorState) {
    const selection = cursorState.inside && !cursorState.panning && !cursorState.rotating ?
      this.findWorldObjectAtCursor(cursorState) :
      null;
    const changed = setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: selection?.objectId || null
    });

    if (changed) {
      this.renderIfLoopIsIdle();
    }
  }

  selectWorldObject(cursorState) {
    if (this.buildingChoiceActive) {
      return;
    }

    const selection = this.findWorldObjectAtCursor(cursorState);

    if (!selection) {
      return;
    }

    const removedObject = removeWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: selection.objectId
    });
    const removedDefinition = removedObject ?
      getSpawnableObjectDto(removedObject.spawnableType) :
      null;
    const isPickup = Boolean(
      removedDefinition?.traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP)
    );
    const contributesToCleanup = Boolean(
      removedDefinition?.traits.some((trait) => (
        trait === SPAWNABLE_OBJECT_TRAITS.DIRTY ||
        trait === SPAWNABLE_OBJECT_TRAITS.PICKUP
      ))
    );

    if (removedObject) {
      this.beachGrid?.releaseWorldPosition(
        removedObject.offset[0],
        removedObject.offset[2]
      );
    }

    if (isPickup) {
      this.beachEconomyModel.recordIncome({
        sourceId: removedObject.id,
        amountInCents: PICKUP_REWARD_IN_CENTS
      });
    }

    if (contributesToCleanup) {
      this.playerExperienceModel?.recordCleanup({ valuable: isPickup });
      this.taskListModel.advance(CLEAN_BEACH_TASK_ID);
      this.scheduleCleanBeachHint();
    }

    setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: null
    });
    this.renderIfLoopIsIdle();
  }

  scheduleCleanBeachHint() {
    this.windowRef.clearTimeout(this.cleanBeachHintTimeoutId);
    this.cleanBeachHintTargetId = null;
    this.cleanBeachHintNeedsUpdate = false;
    this.onboardingView?.hideWorldHint();

    const cleanBeachTask = this.taskListModel?.getSnapshot()
      .find((task) => task.id === CLEAN_BEACH_TASK_ID);

    if (
      !this.isRunActive() ||
      !cleanBeachTask ||
      cleanBeachTask.progress >= cleanBeachTask.target
    ) {
      return;
    }

    const delayRange = CLEAN_BEACH_HINT_DELAY_MS.max - CLEAN_BEACH_HINT_DELAY_MS.min;
    const delay = CLEAN_BEACH_HINT_DELAY_MS.min + Math.random() * delayRange;

    this.cleanBeachHintTimeoutId = this.windowRef.setTimeout(() => {
      const viewport = {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight
      };
      const viewProjection = this.camera.getViewProjection(
        viewport.width,
        viewport.height
      );
      const canvasRect = this.canvas.getBoundingClientRect();
      const hudRects = [
        this.root.querySelector(".hud-stack")?.getBoundingClientRect(),
        this.root.querySelector(".time-counter")?.getBoundingClientRect()
      ].filter(Boolean);
      const candidates = this.worldObjectSceneObjects.flatMap((sceneObject) => (
        sceneObject.instances
          .filter((instance) => {
            const definition = getSpawnableObjectDto(instance.spawnableType);

            return definition.traits.some((trait) => (
              trait === SPAWNABLE_OBJECT_TRAITS.DIRTY ||
              trait === SPAWNABLE_OBJECT_TRAITS.PICKUP
            ));
          })
          .map((instance) => {
            const screenPosition = getWorldObjectScreenPosition({
              objectId: instance.id,
              sceneObjects: this.worldObjectSceneObjects,
              viewProjection,
              viewport
            });

            if (!screenPosition) {
              return null;
            }

            const clientX = canvasRect.left + screenPosition.x;
            const clientY = canvasRect.top + screenPosition.y;
            const obscuredByHud = hudRects.some((rect) => (
              clientX >= rect.left && clientX <= rect.right &&
              clientY >= rect.top && clientY <= rect.bottom
            ));
            const onCanvas = (
              screenPosition.x >= 0 && screenPosition.x <= viewport.width &&
              screenPosition.y >= 0 && screenPosition.y <= viewport.height
            );

            return {
              id: instance.id,
              preferred: onCanvas && !obscuredByHud
            };
          })
          .filter(Boolean)
      ));

      if (candidates.length === 0) {
        this.scheduleCleanBeachHint();
        return;
      }

      const preferredCandidates = candidates.filter((candidate) => candidate.preferred);
      const candidatePool = preferredCandidates.length > 0 ?
        preferredCandidates :
        candidates;

      this.cleanBeachHintTargetId = candidatePool[
        Math.floor(Math.random() * candidatePool.length)
      ].id;
      this.playerExperienceModel?.recordGuidanceNeeded();
      this.cleanBeachHintNeedsUpdate = true;
      this.updateCleanBeachHint();
    }, delay);
  }

  updateCleanBeachHint() {
    if (!this.cleanBeachHintTargetId) {
      this.cleanBeachHintNeedsUpdate = false;
      return;
    }

    this.cleanBeachHintNeedsUpdate = false;

    if (!this.isRunActive()) {
      this.onboardingView?.hideWorldHint();
      return;
    }

    const viewport = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    };
    const projected = getWorldObjectScreenPosition({
      objectId: this.cleanBeachHintTargetId,
      sceneObjects: this.worldObjectSceneObjects,
      viewProjection: this.camera.getViewProjection(viewport.width, viewport.height),
      viewport
    });

    if (!projected) {
      this.onboardingView.hideWorldHint();
      return;
    }

    const rootRect = this.root.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    this.onboardingView.showWorldHint({
      x: canvasRect.left - rootRect.left + projected.x,
      y: canvasRect.top - rootRect.top + projected.y
    });
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
      this.cleanBeachHintNeedsUpdate = Boolean(this.cleanBeachHintTargetId);
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
    this.cleanBeachHintNeedsUpdate = Boolean(this.cleanBeachHintTargetId);

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
      this.cleanBeachHintNeedsUpdate = Boolean(this.cleanBeachHintTargetId);
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

        if (timeSnapshot?.complete) {
          this.spawnManager?.stop();
          if (!this.dayCostsSettled) {
            this.dayCostsSettled = true;
            const closing = this.buildingServicesModel.closeDay({
              availableMoneyInCents: this.beachEconomyModel.getSnapshot().moneyInCents
            });

            if (closing.totalPaidInCents > 0) {
              this.beachEconomyModel.recordExpense({
                sourceId: `day-${this.runSessionModel.getSnapshot().day}-services`,
                amountInCents: closing.totalPaidInCents
              });
            }
          }
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
    this.cleanBeachHintNeedsUpdate = Boolean(this.cleanBeachHintTargetId);
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
    const spawnRequests = this.spawnManager.update(deltaSeconds, {
      averageRating,
      bathers: this.npcSystem.getSnapshot(),
      buildingServices
    });

    for (const request of spawnRequests) {
      if (request.type === SPAWN_TYPES.BATHER) {
        const bather = this.npcSystem.addBather({
          position: getBeachEntryPosition(request.entryProgress)
        });
        if (buildingServices.hasBeverageStore) {
          this.beachEconomyModel.recordIncome({
            sourceId: `${bather.id}-beverage-sale`,
            amountInCents: BEVERAGE_SALE_IN_CENTS
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
          this.playerExperienceModel?.recordPressureAdded();
        }
      }
    }
  }

  resolveWorldObjectPosition(request) {
    if (!this.beachGrid) {
      throw new Error("Grid da praia precisa existir antes dos objetos.");
    }

    const placement = request?.placement;
    const desiredPosition = Array.isArray(placement?.position) ?
      placement.position :
      getBeachSandPosition(placement?.xProgress, placement?.zProgress);
    const tile = this.beachGrid.claimNearestAvailableTile({
      x: desiredPosition[0],
      z: desiredPosition[1],
      zone: BEACH_ZONES.SAND
    });

    if (!tile) {
      throw new Error("Nao foi encontrada uma celula livre na areia.");
    }

    return [tile.centerX, tile.centerZ];
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
    const complaintViewport = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    };
    const complaintProjection = this.camera.getViewProjection(
      complaintViewport.width,
      complaintViewport.height
    );
    const rootRect = this.root.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const complaints = (this.npcSystem?.getSnapshot() || [])
      .filter((npc) => npc.complaint)
      .map((npc) => {
        const projected = getWorldObjectScreenPosition({
          objectId: npc.id,
          sceneObjects: this.npcSceneObjects,
          viewProjection: complaintProjection,
          viewport: complaintViewport
        });

        return projected ? {
          id: npc.id,
          text: npc.complaint,
          x: canvasRect.left - rootRect.left + projected.x,
          y: canvasRect.top - rootRect.top + projected.y
        } : null;
      })
      .filter(Boolean);

    this.npcComplaintView?.render(complaints);
    if (this.cleanBeachHintNeedsUpdate) {
      this.updateCleanBeachHint();
    }
  }

  async loadWorld() {
    const gl = this.renderer.getContext();
    const terrainAssets = await loadTerrainAssets({
      gl,
      onStatus: (message) => this.setStatus(message)
    });
    const terrainSceneObjects = createTerrainSceneObjects({
      terrainAssets,
      camera: this.camera
    });
    const npcAssets = await loadNpcAssets({
      gl,
      onStatus: (message) => this.setStatus(message)
    });
    const npcSystem = createNpcSystem();
    const spawnManager = createSpawnManager();
    const initialObjectRequests = spawnManager.planInitialPopulation();
    const npcs = npcSystem.getSnapshot();
    const terrainSurfaceY = getTerrainSurfaceY(terrainAssets.groundModel);
    const terrainTileSpan = getTerrainTileSpan(terrainAssets.groundModel);
    const kioskAssets = await loadSceneryAsset({
      gl,
      type: SCENERY_TYPES.KIOSK,
      onStatus: (message) => this.setStatus(message)
    });
    const kioskPosition = [
      KIOSK_POSITION_X,
      terrainSurfaceY,
      getBeachSandZNearRestinga(KIOSK_POSITION_X, KIOSK_RESTINGA_INSET)
    ];
    const kioskSceneObjects = createScenerySceneObjects({
      sceneryAsset: kioskAssets,
      position: kioskPosition
    });
    const beachHouseAssets = await loadSceneryAsset({
      gl,
      type: SCENERY_TYPES.BEACH_HOUSE,
      onStatus: (message) => this.setStatus(message)
    });
    const beachHousePosition = [
      BEACH_HOUSE_POSITION_X,
      terrainSurfaceY,
      getBeachSandZNearRestinga(
        BEACH_HOUSE_POSITION_X,
        Math.max(
          0,
          BEACH_HOUSE_RESTINGA_INSET -
            terrainTileSpan * BEACH_HOUSE_RESTINGA_TILE_OFFSET
        )
      )
    ];
    const beachHouseSceneObjects = createScenerySceneObjects({
      sceneryAsset: beachHouseAssets,
      position: beachHousePosition
    });
    const beachGrid = createBeachGrid({ tileSize: terrainTileSpan });

    for (const sceneObject of [...kioskSceneObjects, ...beachHouseSceneObjects]) {
      const instance = sceneObject.instances[0];
      const cosine = Math.abs(Math.cos(instance.yaw));
      const sine = Math.abs(Math.sin(instance.yaw));
      const width = (
        sceneObject.model.size[0] * cosine + sceneObject.model.size[2] * sine
      ) * instance.scale;
      const depth = (
        sceneObject.model.size[0] * sine + sceneObject.model.size[2] * cosine
      ) * instance.scale;

      beachGrid.reserveWorldBounds({
        centerX: instance.offset[0],
        centerZ: instance.offset[2],
        width,
        depth,
        padding: terrainTileSpan
      });
    }

    this.beachGrid = beachGrid;
    const worldObjectSceneObjects = await createWorldObjectPlaceholderSceneObjects({
      gl,
      requests: initialObjectRequests,
      terrainSurfaceY,
      resolvePosition: (request) => this.resolveWorldObjectPosition(request)
    });
    const npcSceneObjects = createNpcSceneObjects({
      npcAssets,
      npcs,
      terrainSurfaceY
    });

    this.terrainAssets = terrainAssets;
    this.terrainSceneObjects = terrainSceneObjects;
    this.npcAssets = npcAssets;
    this.npcSceneObjects = npcSceneObjects;
    this.npcSystem = npcSystem;
    this.spawnManager = spawnManager;
    this.worldObjectSceneObjects = worldObjectSceneObjects;
    this.updateBatherCounter(npcs);
    this.kioskAssets = kioskAssets;
    this.kioskSceneObjects = kioskSceneObjects;
    this.beachHouseAssets = beachHouseAssets;
    this.beachHouseSceneObjects = beachHouseSceneObjects;
    this.terrainSurfaceY = terrainSurfaceY;

    return [
      ...terrainSceneObjects,
      ...kioskSceneObjects,
      ...worldObjectSceneObjects,
      ...npcSceneObjects
    ];
  }
}

export const gameManager = new TerrainGameManager();
