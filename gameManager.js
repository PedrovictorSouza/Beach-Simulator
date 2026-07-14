import { createWorldRenderer } from "./rendering/worldRenderer.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCursorInput } from "./input/cursor.js";
import { loadTerrainAssets } from "./terrain/terrainAssets.js";
import {
  createTerrainSceneObjects,
  getBeachSandZNearRestinga,
  getTerrainSurfaceY,
  updateTerrainSceneObjects
} from "./terrain/terrainWorld.js";
import {
  createNpcSceneObjects,
  loadNpcAssets,
  updateNpcSceneObjects
} from "./npcs/npcWorld.js";
import { createNpcSystem, NPC_TYPES } from "./npcs/npcSystem.js";
import {
  createKioskSceneObjects,
  loadKioskAssets
} from "./scenery/kioskWorld.js";
import { createBatherCounterView } from "./ui/batherCounterView.js";
import { createTaskListModel, createTaskListView } from "./ui/taskList.js";

const KIOSK_POSITION_X = -48;
const KIOSK_RESTINGA_INSET = 18;

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
    this.batherCounterView = null;
    this.taskListModel = null;
    this.taskListView = null;
    this.kioskAssets = null;
    this.kioskSceneObjects = [];
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
      .then((sceneObjects) => {
        this.sceneObjects = sceneObjects;
        this.statusElement?.remove();
        this.render();
        this.startRenderLoop();
        this.windowRef.addEventListener("resize", () => this.render());
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
      <aside class="hud-stack" aria-label="Game status"></aside>
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
      onZoom: (cursorState) => this.applyCursorZoom(cursorState)
    });
  }

  initializeUi() {
    const hudRoot = this.root.querySelector(".hud-stack");

    this.batherCounterView = createBatherCounterView({ root: hudRoot });
    this.batherCounterView.render(0);
    this.taskListModel = createTaskListModel();
    this.taskListView = createTaskListView({ root: hudRoot });
    this.taskListView.render(this.taskListModel.getSnapshot());
  }

  updateBatherCounter(npcs) {
    const batherCount = npcs.reduce((count, npc) => (
      npc.type === NPC_TYPES.BATHER ? count + 1 : count
    ), 0);

    this.batherCounterView?.render(batherCount);
  }

  applyCursorDebugState(cursorState) {
    this.canvas.classList.toggle("cursor-debug-pressed", cursorState.pressed || cursorState.panning);
  }

  applyCursorZoom(cursorState) {
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
      this.updateNpcWorld(deltaSeconds);
      this.render();
      this.updateFpsCounter(now);
      this.animationFrameId = scheduleFrame(tick);
    };

    this.animationFrameId = scheduleFrame(tick);
  }

  updateKeyboardCamera(deltaSeconds) {
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

  updateNpcWorld(deltaSeconds) {
    if (!this.npcSystem || this.npcSceneObjects.length === 0) {
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
    const npcs = npcSystem.getSnapshot();
    const terrainSurfaceY = getTerrainSurfaceY(terrainAssets.groundModel);
    const npcSceneObjects = createNpcSceneObjects({
      npcAssets,
      npcs,
      terrainSurfaceY
    });
    const kioskAssets = await loadKioskAssets({
      gl,
      onStatus: (message) => this.setStatus(message)
    });
    const kioskSceneObjects = createKioskSceneObjects({
      kioskAssets,
      position: [
        KIOSK_POSITION_X,
        terrainSurfaceY,
        getBeachSandZNearRestinga(KIOSK_POSITION_X, KIOSK_RESTINGA_INSET)
      ]
    });

    this.terrainAssets = terrainAssets;
    this.terrainSceneObjects = terrainSceneObjects;
    this.npcAssets = npcAssets;
    this.npcSceneObjects = npcSceneObjects;
    this.npcSystem = npcSystem;
    this.updateBatherCounter(npcs);
    this.kioskAssets = kioskAssets;
    this.kioskSceneObjects = kioskSceneObjects;
    this.terrainSurfaceY = terrainSurfaceY;

    return [...terrainSceneObjects, ...kioskSceneObjects, ...npcSceneObjects];
  }
}

export const gameManager = new TerrainGameManager();
