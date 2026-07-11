import {
  createWorldRenderingResources,
  loadPicoModel
} from "./rendering/worldAssets.js";
import { WORLD_CURVATURE_CONFIG } from "./rendering/worldCurvature.js";
import { createStaticCamera } from "./camera/staticCamera.js";
import { createCursorInput } from "./input/cursor.js";
import { loadTerrainAssets } from "./terrain/terrainAssets.js";
import { createTerrainSceneObjects } from "./terrain/terrainWorld.js";

const PALM_TREE_MODEL_FACE_YAW_OFFSET = 0;

class TerrainGameManager {
  constructor() {
    this.started = false;
    this.windowRef = window;
    this.root = null;
    this.canvas = null;
    this.statusElement = null;
    this.gl = null;
    this.renderingResources = null;
    this.camera = null;
    this.cursor = null;
    this.sceneObjects = [];
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
    this.camera = createStaticCamera();
    this.mount();
    this.initializeCursor();
    this.initializeWebGl();
    this.loadWorld()
      .then((sceneObjects) => {
        this.sceneObjects = sceneObjects;
        this.statusElement?.remove();
        this.render();
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
      <canvas class="world-canvas" aria-label="Planeta com terrain"></canvas>
      <div class="boot-status" role="status">Carregando terrain...</div>
    `;
    this.canvas = this.root.querySelector(".world-canvas");
    this.statusElement = this.root.querySelector(".boot-status");
  }

  initializeCursor() {
    this.canvas.classList.add("cursor-debug-ready");
    this.cursor = createCursorInput({
      target: this.canvas,
      onChange: (cursorState) => this.applyCursorDebugState(cursorState)
    });
  }

  applyCursorDebugState(cursorState) {
    this.canvas.classList.toggle("cursor-debug-pressed", cursorState.pressed);
  }

  initializeWebGl() {
    this.gl = this.canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });

    if (!this.gl) {
      this.setStatus("WebGL indisponivel.");
      throw new Error("WebGL indisponivel");
    }

    this.renderingResources = createWorldRenderingResources(this.gl);
  }

  setStatus(message) {
    this.statusElement.textContent = message;
  }

  buildPalmTreeInstances() {
    return [
      [-18, 0, -10, 0.18, 0.95],
      [12, 0, -22, -0.34, 0.9],
      [28, 0, 8, 0.48, 1],
      [-30, 0, 20, -0.18, 0.86],
      [4, 0, 32, 0.08, 0.82],
      [-48, 0, -34, 0.38, 0.78],
      [52, 0, -28, -0.26, 0.82],
      [46, 0, 42, 0.16, 0.74]
    ].map(([x, y, z, yaw, scale], index) => ({
      id: `palm-tree-${index + 1}`,
      offset: [x, y, z],
      scale,
      yaw: PALM_TREE_MODEL_FACE_YAW_OFFSET + yaw
    }));
  }

  resizeCanvas() {
    const ratio = Math.min(this.windowRef.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  setUniform3(location, value) {
    if (location) {
      this.gl.uniform3fv(location, value);
    }
  }

  setUniform1(location, value) {
    if (location) {
      this.gl.uniform1f(location, value);
    }
  }

  setSceneUniforms(viewProjection) {
    const { program, uniforms } = this.renderingResources;
    const cameraTarget = this.camera.getTarget();

    this.gl.useProgram(program);
    this.gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
    this.setUniform1(uniforms.jitterAmount, 0);
    this.setUniform3(uniforms.worldCurvatureOrigin, this.camera.getCurvatureOrigin());
    this.setUniform1(uniforms.worldCurvatureStrength, WORLD_CURVATURE_CONFIG.strength);
    this.setUniform1(uniforms.worldCurvatureMaxDrop, WORLD_CURVATURE_CONFIG.maxDrop);
    this.gl.uniform2fv(uniforms.pixelSnap, [this.canvas.width * 0.5, this.canvas.height * 0.5]);
    this.setUniform1(uniforms.time, 0);
    this.setUniform3(uniforms.fogOrigin, cameraTarget);
    this.setUniform3(uniforms.fogColor, [0.82, 0.9, 0.94]);
    this.setUniform1(uniforms.fogNear, 84);
    this.setUniform1(uniforms.fogFar, 170);
    this.setUniform1(uniforms.fogIntensity, 0.28);
    this.gl.uniform1i(uniforms.texture, 0);
  }

  bindPrimitive(primitive) {
    const { attribs } = this.renderingResources;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, primitive.vertexBuffer);
    this.gl.enableVertexAttribArray(attribs.position);
    this.gl.vertexAttribPointer(attribs.position, 3, this.gl.FLOAT, false, 32, 0);
    this.gl.enableVertexAttribArray(attribs.texCoord);
    this.gl.vertexAttribPointer(attribs.texCoord, 2, this.gl.FLOAT, false, 32, 12);

    if (attribs.normal >= 0) {
      this.gl.enableVertexAttribArray(attribs.normal);
      this.gl.vertexAttribPointer(attribs.normal, 3, this.gl.FLOAT, false, 32, 20);
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, primitive.indexBuffer);
  }

  drawSceneObject(sceneObject) {
    const { uniforms } = this.renderingResources;

    this.setUniform3(uniforms.modelOffset, sceneObject.model.offset);
    this.setUniform1(uniforms.modelScale, sceneObject.model.scale);
    this.setUniform1(uniforms.modelHeight, sceneObject.model.size[1]);
    this.setUniform1(uniforms.brightness, sceneObject.brightness ?? 1);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, sceneObject.model.texture);

    for (const instance of sceneObject.instances) {
      this.setUniform3(uniforms.instanceOffset, instance.offset);
      this.setUniform1(uniforms.instanceScale, instance.scale ?? 1);
      this.setUniform1(uniforms.instanceYaw, instance.yaw || 0);
      this.setUniform1(uniforms.instancePitch, instance.pitch || 0);
      this.setUniform1(uniforms.instanceRoll, instance.roll || 0);
      this.setUniform3(uniforms.instanceTint, instance.tint || [1, 1, 1]);
      this.setUniform1(uniforms.instanceTintStrength, instance.tintStrength || 0);
      this.setUniform1(uniforms.instanceAlpha, instance.alpha ?? 1);
      this.setUniform1(uniforms.localYaw, instance.localYaw || 0);
      this.setUniform3(uniforms.localPivot, instance.localPivot || [0, 0, 0]);
      this.setUniform1(uniforms.swayStrength, instance.swayStrength || 0);

      for (const primitive of sceneObject.model.primitives) {
        this.bindPrimitive(primitive);
        this.gl.drawElements(this.gl.TRIANGLES, primitive.indexCount, primitive.indexType, 0);
      }
    }
  }

  render() {
    this.resizeCanvas();
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.setSceneUniforms(this.camera.getViewProjection(this.canvas.width, this.canvas.height));

    for (const sceneObject of this.sceneObjects) {
      this.drawSceneObject(sceneObject);
    }
  }

  async loadWorld() {
    const [terrainAssets, palmTreeModel] = await Promise.all([
      loadTerrainAssets({
        gl: this.gl,
        onStatus: (message) => this.setStatus(message)
      }),
      loadPicoModel({
        gl: this.gl,
        gltfPath: "./Trees/PalmTree/plamTree.gltf",
        txtPath: "./Trees/PalmTree/plamTree.txt",
        onStatus: (message) => this.setStatus(message)
      })
    ]);

    return [
      ...createTerrainSceneObjects({
        terrainAssets,
        camera: this.camera
      }),
      {
        model: palmTreeModel,
        instances: this.buildPalmTreeInstances(),
        brightness: 1.05
      }
    ];
  }
}

export const gameManager = new TerrainGameManager();
