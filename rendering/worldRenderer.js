import { createOceanSurface, drawOceanSurface } from "../ocean/oceanSurface.js";
import { createWorldRenderingResources } from "./worldAssets.js";

/**
 * @typedef {Object} ScenePrimitive
 * @property {WebGLBuffer} vertexBuffer
 * @property {WebGLBuffer} indexBuffer
 * @property {number} indexCount
 * @property {number} indexType
 */

/**
 * @typedef {Object} SceneModel
 * @property {number[]} offset
 * @property {number} scale
 * @property {number[]} size
 * @property {WebGLTexture} texture
 * @property {ScenePrimitive[]} primitives
 */

/**
 * @typedef {Object} SceneInstance
 * @property {string} [id]
 * @property {number[]} offset
 * @property {number} [scale]
 * @property {number} [yaw]
 * @property {number} [pitch]
 * @property {number} [roll]
 * @property {number[]} [tint]
 * @property {number} [tintStrength]
 * @property {number} [alpha]
 * @property {number} [localYaw]
 * @property {number[]} [localPivot]
 * @property {number} [swayStrength]
 */

/**
 * @typedef {Object} SceneWave
 * @property {number} [strength]
 * @property {number} [scale]
 * @property {number} [speed]
 * @property {number} [chop]
 * @property {number[]} [direction]
 */

/**
 * @typedef {Object} SceneObject
 * @property {SceneModel} model
 * @property {SceneInstance[]} instances
 * @property {number} [brightness]
 * @property {string} [terrainLayer]
 * @property {SceneWave} [wave]
 */

/**
 * @typedef {Object} RenderFrame
 * @property {Float32Array|number[]} viewProjection
 * @property {SceneObject[]} sceneObjects
 * @property {number[]} cameraTarget
 * @property {number} timeSeconds
 */

const MAX_RENDER_PIXEL_RATIO = 1;
const DEFAULT_WAVE_DIRECTION = [1, 0];
const DEFAULT_FOG_COLOR = [0.82, 0.9, 0.94];

class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });

    if (!this.gl) {
      throw new Error("WebGL indisponivel.");
    }

    this.resources = createWorldRenderingResources(this.gl);
    this.oceanSurface = null;
    this.disposed = false;

    try {
      this.oceanSurface = createOceanSurface(this.gl);
    } catch (error) {
      console.warn("Shader do oceano desativado.", error);
    }
  }

  getContext() {
    return this.gl;
  }

  resize(devicePixelRatio = 1) {
    const ratio = Math.min(devicePixelRatio || 1, MAX_RENDER_PIXEL_RATIO);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    return { width, height };
  }

  setUniform3(location, value) {
    if (location !== null) {
      this.gl.uniform3fv(location, value);
    }
  }

  setUniform1(location, value) {
    if (location !== null) {
      this.gl.uniform1f(location, value);
    }
  }

  setSceneUniforms({ viewProjection, cameraTarget, timeSeconds }) {
    const { program, uniforms } = this.resources;

    this.gl.useProgram(program);
    this.gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
    this.setUniform1(uniforms.jitterAmount, 0);
    this.setUniform1(uniforms.waveStrength, 0);
    this.setUniform1(uniforms.waveScale, 1);
    this.setUniform1(uniforms.waveSpeed, 1);
    this.setUniform1(uniforms.waveChop, 0);
    this.gl.uniform2fv(uniforms.waveDirection, DEFAULT_WAVE_DIRECTION);
    this.gl.uniform2fv(uniforms.pixelSnap, [this.canvas.width * 0.5, this.canvas.height * 0.5]);
    this.setUniform1(uniforms.time, timeSeconds);
    this.setUniform3(uniforms.fogOrigin, cameraTarget);
    this.setUniform3(uniforms.fogColor, DEFAULT_FOG_COLOR);
    this.setUniform1(uniforms.fogNear, 84);
    this.setUniform1(uniforms.fogFar, 170);
    this.setUniform1(uniforms.fogIntensity, 0.28);
    this.gl.uniform1i(uniforms.texture, 0);
  }

  bindPrimitive(primitive) {
    const { attribs } = this.resources;

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

  /** @param {SceneObject} sceneObject */
  drawSceneObject(sceneObject) {
    if (sceneObject.terrainLayer) {
      this.drawTerrainSceneObject(sceneObject);
      return;
    }

    const { uniforms } = this.resources;

    this.setUniform3(uniforms.modelOffset, sceneObject.model.offset);
    this.setUniform1(uniforms.modelScale, sceneObject.model.scale);
    this.setUniform1(uniforms.modelHeight, sceneObject.model.size[1]);
    this.setUniform1(uniforms.brightness, sceneObject.brightness ?? 1);
    this.setUniform1(uniforms.waveStrength, sceneObject.wave?.strength ?? 0);
    this.setUniform1(uniforms.waveScale, sceneObject.wave?.scale ?? 1);
    this.setUniform1(uniforms.waveSpeed, sceneObject.wave?.speed ?? 1);
    this.setUniform1(uniforms.waveChop, sceneObject.wave?.chop ?? 0);
    this.gl.uniform2fv(uniforms.waveDirection, sceneObject.wave?.direction || DEFAULT_WAVE_DIRECTION);
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

  /** @param {SceneObject} sceneObject */
  drawTerrainSceneObject(sceneObject) {
    const { uniforms } = this.resources;

    this.setUniform3(uniforms.modelOffset, sceneObject.model.offset);
    this.setUniform1(uniforms.modelScale, sceneObject.model.scale);
    this.setUniform1(uniforms.modelHeight, sceneObject.model.size[1]);
    this.setUniform1(uniforms.brightness, sceneObject.brightness ?? 1);
    this.setUniform1(uniforms.waveStrength, 0);
    this.setUniform1(uniforms.waveScale, 1);
    this.setUniform1(uniforms.waveSpeed, 1);
    this.setUniform1(uniforms.waveChop, 0);
    this.gl.uniform2fv(uniforms.waveDirection, DEFAULT_WAVE_DIRECTION);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, sceneObject.model.texture);

    for (const primitive of sceneObject.model.primitives) {
      this.bindPrimitive(primitive);

      for (const instance of sceneObject.instances) {
        this.setUniform3(uniforms.instanceOffset, instance.offset);
        this.setUniform1(uniforms.instanceScale, instance.scale ?? 1);
        this.setUniform1(uniforms.instanceYaw, instance.yaw || 0);
        this.setUniform1(uniforms.instancePitch, 0);
        this.setUniform1(uniforms.instanceRoll, 0);
        this.setUniform3(uniforms.instanceTint, instance.tint || [1, 1, 1]);
        this.setUniform1(uniforms.instanceTintStrength, instance.tintStrength || 0);
        this.setUniform1(uniforms.instanceAlpha, 1);
        this.setUniform1(uniforms.localYaw, 0);
        this.setUniform3(uniforms.localPivot, [0, 0, 0]);
        this.setUniform1(uniforms.swayStrength, 0);
        this.gl.drawElements(this.gl.TRIANGLES, primitive.indexCount, primitive.indexType, 0);
      }
    }
  }

  /** @param {RenderFrame} frame */
  renderFrame({ viewProjection, sceneObjects, cameraTarget, timeSeconds }) {
    if (this.disposed) {
      throw new Error("Renderer foi descartado.");
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.setSceneUniforms({ viewProjection, cameraTarget, timeSeconds });

    for (const sceneObject of sceneObjects) {
      this.drawSceneObject(sceneObject);
    }

    if (this.oceanSurface) {
      drawOceanSurface({
        gl: this.gl,
        oceanSurface: this.oceanSurface,
        viewProjection,
        cameraTarget,
        timeSeconds
      });
    }
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    const programNames = ["program", "spriteProgram", "skyProgram"];
    const bufferNames = ["spriteQuadBuffer", "spriteQuadIndices", "skyQuadBuffer", "skyQuadIndices"];

    for (const name of programNames) {
      this.gl.deleteProgram(this.resources[name]);
    }

    for (const name of bufferNames) {
      this.gl.deleteBuffer(this.resources[name]);
    }

    if (this.oceanSurface) {
      this.gl.deleteProgram(this.oceanSurface.program);
      this.gl.deleteBuffer(this.oceanSurface.cornerBuffer);
    }

    this.disposed = true;
  }
}

/**
 * @param {{ canvas: HTMLCanvasElement }} options
 * @returns {WorldRenderer}
 */
export function createWorldRenderer({ canvas }) {
  if (!canvas) {
    throw new Error("Renderer precisa de um canvas.");
  }

  return new WorldRenderer(canvas);
}
