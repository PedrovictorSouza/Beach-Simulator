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
import {
  createNpcSceneObjects,
  loadNpcAssets,
  updateNpcSceneObjects
} from "./npcs/npcWorld.js";
import { createNpcSystem, NPC_TYPES } from "./npcs/npcSystem.js";
import {
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
import { createOnboardingView } from "./onboarding/onboardingView.js";
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
import { findWorldObjectSelection } from "./interaction/worldObjectInteraction.js";

const KIOSK_POSITION_X = -48;
const KIOSK_RESTINGA_INSET = 18;
const BEACH_HOUSE_POSITION_X = 12;
const BEACH_HOUSE_RESTINGA_INSET = 36;
const BEACH_HOUSE_RESTINGA_TILE_OFFSET = 2;
const PICKUP_REWARD_IN_CENTS = 500;
const CLEAN_BEACH_TASK_ID = "clean-the-beach";
const CLEAN_BEACH_TARGET = 5;

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
    this.runSessionModel = null;
    this.runPresentationView = null;
    this.onboardingView = null;
    this.timeManager = null;
    this.timeCounterView = null;
    this.unsubscribeTimeManager = null;
    this.kioskAssets = null;
    this.kioskSceneObjects = [];
    this.beachHouseAssets = null;
    this.beachHouseSceneObjects = [];
    this.terrainSurfaceY = 0;
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
        this.windowRef.addEventListener("resize", () => this.render());
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
    this.timeManager = createTimeManager();
    this.timeCounterView = createTimeCounterView({ root: gameHudRoot });
    this.unsubscribeTimeManager = this.timeManager.subscribe(
      (snapshot) => this.updateTimeCounter(snapshot)
    );
  }

  async beginRun() {
    const { day } = this.runSessionModel.getSnapshot();

    await this.runPresentationView.playDay(day);
    this.runSessionModel.activateDay();
    this.timeManager.start();
    this.spawnManager.start({
      averageRating: this.beachRatingModel.getSnapshot().averageRating
    });
    this.runPresentationView.setHudActive(true);

    if (day === 1) {
      await this.onboardingView.pointTo(
        `[data-task-id="${CLEAN_BEACH_TASK_ID}"] .task-list__progress-row`
      );
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
    this.canvas.classList.toggle("cursor-debug-pressed", cursorState.pressed || cursorState.panning);
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
    const selection = cursorState.inside && !cursorState.panning ?
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

    if (
      removedDefinition?.traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP)
    ) {
      this.beachEconomyModel.recordIncome({
        sourceId: removedObject.id,
        amountInCents: PICKUP_REWARD_IN_CENTS
      });
    }

    if (removedDefinition?.traits.some((trait) => (
      trait === SPAWNABLE_OBJECT_TRAITS.DIRTY ||
      trait === SPAWNABLE_OBJECT_TRAITS.PICKUP
    ))) {
      this.taskListModel.advance(CLEAN_BEACH_TASK_ID);
    }

    setHoveredWorldObjectSceneInstance({
      sceneObjects: this.worldObjectSceneObjects,
      objectId: null
    });
    this.renderIfLoopIsIdle();
  }

  applyCursorZoom(cursorState) {
    if (!this.isRunActive()) {
      return;
    }

    const changed = this.camera.zoomBy(cursorState.deltaY, {
      x: cursorState.x,
      y: cursorState.y,
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    });

    if (changed && this.renderer) {
      this.renderIfLoopIsIdle();
    }
  }

  applyCursorPan(cursorState) {
    if (!this.isRunActive()) {
      return;
    }

    this.camera.panByScreenDelta(cursorState.deltaX, cursorState.deltaY, {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight
    });

    if (this.renderer) {
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

      this.updateKeyboardCamera(deltaSeconds);
      if (this.isRunActive()) {
        const timeSnapshot = this.timeManager?.update(deltaSeconds);

        if (timeSnapshot?.complete) {
          this.spawnManager?.stop();
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

  updateKeyboardCamera(deltaSeconds) {
    if (!this.isRunActive()) {
      return;
    }

    const keyboardPan = this.cursor?.getKeyboardPan?.();
    if (!keyboardPan) {
      return;
    }

    this.camera.panByDirection(keyboardPan, deltaSeconds);
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
    const spawnRequests = this.spawnManager.update(deltaSeconds, {
      averageRating,
      bathers: this.npcSystem.getSnapshot()
    });

    for (const request of spawnRequests) {
      if (request.type === SPAWN_TYPES.BATHER) {
        this.npcSystem.addBather({
          position: getBeachEntryPosition(request.entryProgress)
        });
        continue;
      }

      if (request.source === SPAWN_SOURCES.NPC_DROP) {
        addWorldObjectPlaceholderSceneInstance({
          sceneObjects: this.worldObjectSceneObjects,
          request,
          terrainSurfaceY: this.terrainSurfaceY
        });
      }
    }
  }

  updateNpcWorld(deltaSeconds) {
    if (!this.isRunActive() || !this.npcSystem || this.npcSceneObjects.length === 0) {
      return;
    }

    this.npcSystem.update(deltaSeconds);
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
    const worldObjectSceneObjects = await createWorldObjectPlaceholderSceneObjects({
      gl,
      requests: initialObjectRequests,
      terrainSurfaceY,
      resolvePosition: ({ placement }) => getBeachSandPosition(
        placement.xProgress,
        placement.zProgress
      )
    });
    const npcSceneObjects = createNpcSceneObjects({
      npcAssets,
      npcs,
      terrainSurfaceY
    });
    const kioskAssets = await loadSceneryAsset({
      gl,
      type: SCENERY_TYPES.KIOSK,
      onStatus: (message) => this.setStatus(message)
    });
    const kioskSceneObjects = createScenerySceneObjects({
      sceneryAsset: kioskAssets,
      position: [
        KIOSK_POSITION_X,
        terrainSurfaceY,
        getBeachSandZNearRestinga(KIOSK_POSITION_X, KIOSK_RESTINGA_INSET)
      ]
    });
    const beachHouseAssets = await loadSceneryAsset({
      gl,
      type: SCENERY_TYPES.BEACH_HOUSE,
      onStatus: (message) => this.setStatus(message)
    });
    const beachHouseSceneObjects = createScenerySceneObjects({
      sceneryAsset: beachHouseAssets,
      position: [
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
      ]
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
      ...beachHouseSceneObjects,
      ...worldObjectSceneObjects,
      ...npcSceneObjects
    ];
  }
}

export const gameManager = new TerrainGameManager();
