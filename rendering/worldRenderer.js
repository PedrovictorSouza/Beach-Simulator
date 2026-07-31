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
 * @property {number[]} [spriteSize]
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
 * @property {boolean} [screenSpaceSprite]
 * @property {boolean} [renderAfterOcean]
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

const LOGICAL_RENDER_WIDTH = 480;
const LOGICAL_RENDER_HEIGHT = 272;
const INTERNAL_RENDER_SCALE = 2;
const INTERNAL_RENDER_WIDTH = LOGICAL_RENDER_WIDTH * INTERNAL_RENDER_SCALE;
const INTERNAL_RENDER_HEIGHT = LOGICAL_RENDER_HEIGHT * INTERNAL_RENDER_SCALE;
const DEFAULT_WAVE_DIRECTION = [1, 0];
const DEFAULT_FOG_COLOR = [0.82, 0.9, 0.94];
const PIXEL_SNAP = [LOGICAL_RENDER_WIDTH * 0.5, LOGICAL_RENDER_HEIGHT * 0.5];
const DEFAULT_UV_RECT = [0, 0, 1, 1];
const DEFAULT_SPRITE_SCREEN_OFFSET = [0, 0];
const DEFAULT_SPRITE_COLOR = [1, 1, 1, 1];
const DEFAULT_INSTANCE_TINT = [1, 1, 1];
const DEFAULT_LOCAL_PIVOT = [0, 0, 0];
const ZERO_WORLD_OFFSET = [0, 0, 0];
const TERRAIN_DITHER_STRENGTH = 0.5;
const SPRITE_OUTLINE_COLOR = [0, 0, 0, 0.88];
const SPRITE_OUTLINE_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],            [1, 0],
  [-1, 1],  [0, 1],  [1, 1]
];

class WorldRenderer {
  constructor(canvas, {
    width = INTERNAL_RENDER_WIDTH,
    height = INTERNAL_RENDER_HEIGHT,
    pixelSnap = PIXEL_SNAP,
    oceanEnabled = true,
    preserveDrawingBuffer = false
  } = {}) {
    this.canvas = canvas;
    this.renderWidth = Math.max(1, Math.round(Number(width) || INTERNAL_RENDER_WIDTH));
    this.renderHeight = Math.max(1, Math.round(Number(height) || INTERNAL_RENDER_HEIGHT));
    this.pixelSnap = new Float32Array([
      Math.max(1, Number(pixelSnap?.[0]) || PIXEL_SNAP[0]),
      Math.max(1, Number(pixelSnap?.[1]) || PIXEL_SNAP[1])
    ]);
    this.gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: Boolean(preserveDrawingBuffer)
    });

    if (!this.gl) {
      throw new Error("WebGL indisponivel.");
    }

    this.resources = createWorldRenderingResources(this.gl);
    this.spriteSizeBuffer = new Float32Array(2);
    this.oceanSurface = null;
    this.currentProgram = null;
    this.terrainBatchBySceneObject = new WeakMap();
    this.terrainBatches = new Set();
    this.disposed = false;

    if (oceanEnabled) {
      try {
        this.oceanSurface = createOceanSurface(this.gl);
      } catch (error) {
        console.warn("Shader do oceano desativado.", error);
      }
    }
  }

  getContext() {
    return this.gl;
  }

  resize() {
    const width = this.renderWidth;
    const height = this.renderHeight;

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

  useProgram(program) {
    if (this.currentProgram === program) {
      return;
    }

    this.gl.useProgram(program);
    this.currentProgram = program;
  }

  setSceneUniforms({ viewProjection, cameraTarget, timeSeconds }) {
    const {
      program,
      uniforms,
      spriteProgram,
      spriteUniforms
    } = this.resources;

    this.useProgram(program);
    this.gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
    this.setUniform1(uniforms.jitterAmount, 0);
    this.setUniform1(uniforms.waveStrength, 0);
    this.setUniform1(uniforms.waveScale, 1);
    this.setUniform1(uniforms.waveSpeed, 1);
    this.setUniform1(uniforms.waveChop, 0);
    this.gl.uniform2fv(uniforms.waveDirection, DEFAULT_WAVE_DIRECTION);
    this.gl.uniform2fv(uniforms.pixelSnap, this.pixelSnap);
    this.setUniform1(uniforms.time, timeSeconds);
    this.setUniform3(uniforms.fogOrigin, cameraTarget);
    this.setUniform3(uniforms.fogColor, DEFAULT_FOG_COLOR);
    this.setUniform1(uniforms.fogNear, 84);
    this.setUniform1(uniforms.fogFar, 170);
    this.setUniform1(uniforms.fogIntensity, 0.28);
    this.setUniform1(uniforms.ditherStrength, 1);
    this.gl.uniform1i(uniforms.texture, 0);

    this.useProgram(spriteProgram);
    this.gl.uniformMatrix4fv(spriteUniforms.viewProjection, false, viewProjection);
    this.gl.uniform2fv(spriteUniforms.pixelSnap, this.pixelSnap);
    this.gl.uniform4fv(spriteUniforms.uvRect, DEFAULT_UV_RECT);
    this.gl.uniform2fv(spriteUniforms.spriteScreenOffset, DEFAULT_SPRITE_SCREEN_OFFSET);
    this.gl.uniform4fv(spriteUniforms.spriteColor, DEFAULT_SPRITE_COLOR);
    this.setUniform1(spriteUniforms.spriteColorStrength, 0);
    this.gl.uniform1i(spriteUniforms.spriteTexture, 0);
    this.useProgram(program);
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

  canBatchTerrain(sceneObject) {
    return Boolean(
      (sceneObject.terrainLayer || sceneObject.terrainObject === "palm-tree") &&
      sceneObject.model.primitives.length > 0 &&
      sceneObject.model.primitives.every((primitive) => (
        primitive.interleaved && primitive.indices
      ))
    );
  }

  createTerrainBatch(sceneObject) {
    const { model, instances } = sceneObject;
    const sourcePrimitives = model.primitives;
    const sourceVertexCount = sourcePrimitives.reduce(
      (total, primitive) => total + primitive.interleaved.length / 8,
      0
    );
    const sourceIndexCount = sourcePrimitives.reduce(
      (total, primitive) => total + primitive.indices.length,
      0
    );
    const vertexCount = sourceVertexCount * instances.length;

    if (vertexCount === 0 || vertexCount > 65535) {
      return null;
    }

    const interleaved = new Float32Array(vertexCount * 8);
    const indices = new Uint16Array(sourceIndexCount * instances.length);
    let vertexOffset = 0;
    let indexOffset = 0;

    for (const instance of instances) {
      const instanceScale = instance.scale ?? 1;
      const instanceOffset = instance.offset;
      const instanceYaw = instance.yaw || 0;
      const yawSine = Math.sin(instanceYaw);
      const yawCosine = Math.cos(instanceYaw);

      for (const primitive of sourcePrimitives) {
        const sourceInterleaved = primitive.interleaved;
        const sourceVertexCountForPrimitive = sourceInterleaved.length / 8;

        for (let sourceVertex = 0; sourceVertex < sourceVertexCountForPrimitive; sourceVertex += 1) {
          const sourceOffset = sourceVertex * 8;
          const targetOffset = (vertexOffset + sourceVertex) * 8;

          const scaledX = (
            sourceInterleaved[sourceOffset + 0] * model.scale + model.offset[0]
          ) * instanceScale + instanceOffset[0];
          const scaledY = (
            sourceInterleaved[sourceOffset + 1] * model.scale + model.offset[1]
          ) * instanceScale + instanceOffset[1];
          const scaledZ = (
            sourceInterleaved[sourceOffset + 2] * model.scale + model.offset[2]
          ) * instanceScale + instanceOffset[2];
          interleaved[targetOffset + 0] = (
            scaledX - instanceOffset[0]
          ) * yawCosine - (
            scaledZ - instanceOffset[2]
          ) * yawSine + instanceOffset[0];
          interleaved[targetOffset + 1] = scaledY;
          interleaved[targetOffset + 2] = (
            scaledX - instanceOffset[0]
          ) * yawSine + (
            scaledZ - instanceOffset[2]
          ) * yawCosine + instanceOffset[2];
          interleaved[targetOffset + 3] = sourceInterleaved[sourceOffset + 3];
          interleaved[targetOffset + 4] = sourceInterleaved[sourceOffset + 4];
          interleaved[targetOffset + 5] = (
            sourceInterleaved[sourceOffset + 5] * yawCosine -
            sourceInterleaved[sourceOffset + 7] * yawSine
          );
          interleaved[targetOffset + 6] = sourceInterleaved[sourceOffset + 6];
          interleaved[targetOffset + 7] = (
            sourceInterleaved[sourceOffset + 5] * yawSine +
            sourceInterleaved[sourceOffset + 7] * yawCosine
          );
        }

        for (const sourceIndex of primitive.indices) {
          indices[indexOffset] = sourceIndex + vertexOffset;
          indexOffset += 1;
        }

        vertexOffset += sourceVertexCountForPrimitive;
      }
    }

    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, interleaved, this.gl.STATIC_DRAW);

    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    return {
      sourceInstances: instances,
      primitive: {
        vertexBuffer,
        indexBuffer,
        indexCount: indices.length,
        indexType: this.gl.UNSIGNED_SHORT
      }
    };
  }

  getTerrainBatch(sceneObject) {
    const previousBatch = this.terrainBatchBySceneObject.get(sceneObject);

    if (previousBatch?.sourceInstances === sceneObject.instances) {
      return previousBatch;
    }

    if (previousBatch) {
      this.gl.deleteBuffer(previousBatch.primitive.vertexBuffer);
      this.gl.deleteBuffer(previousBatch.primitive.indexBuffer);
      this.terrainBatches.delete(previousBatch);
    }

    if (!this.canBatchTerrain(sceneObject)) {
      this.terrainBatchBySceneObject.delete(sceneObject);
      return null;
    }

    const nextBatch = this.createTerrainBatch(sceneObject);
    if (nextBatch) {
      this.terrainBatchBySceneObject.set(sceneObject, nextBatch);
      this.terrainBatches.add(nextBatch);
    }

    return nextBatch;
  }

  /** @param {SceneObject} sceneObject */
  drawSceneObject(sceneObject) {
    const {
      program,
      spriteProgram,
      spriteAttribs,
      spriteUniforms,
      spriteQuadBuffer,
      spriteQuadIndices
    } = this.resources;

    if (sceneObject.screenSpaceSprite) {
      this.useProgram(spriteProgram);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, spriteQuadBuffer);
      this.gl.enableVertexAttribArray(spriteAttribs.corner);
      this.gl.vertexAttribPointer(spriteAttribs.corner, 2, this.gl.FLOAT, false, 16, 0);
      this.gl.enableVertexAttribArray(spriteAttribs.texCoord);
      this.gl.vertexAttribPointer(spriteAttribs.texCoord, 2, this.gl.FLOAT, false, 16, 8);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, spriteQuadIndices);
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, sceneObject.model.texture);

      for (const instance of sceneObject.instances) {
        const scale = instance.scale ?? 1;

        this.spriteSizeBuffer[0] = Math.max(
          1,
          Math.round(sceneObject.model.spriteSize[0] * scale)
        );
        this.spriteSizeBuffer[1] = Math.max(
          1,
          Math.round(sceneObject.model.spriteSize[1] * scale)
        );
        this.setUniform3(spriteUniforms.worldPosition, instance.offset);
        this.gl.uniform2fv(spriteUniforms.spriteSize, this.spriteSizeBuffer);
        this.setUniform1(spriteUniforms.spriteRotation, 0);
        this.setUniform1(spriteUniforms.spriteAlpha, instance.alpha ?? 1);

        this.gl.depthMask(false);
        this.gl.uniform4fv(spriteUniforms.spriteColor, SPRITE_OUTLINE_COLOR);
        this.setUniform1(spriteUniforms.spriteColorStrength, 1);
        for (const offset of SPRITE_OUTLINE_OFFSETS) {
          this.gl.uniform2fv(spriteUniforms.spriteScreenOffset, offset);
          this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        }

        this.gl.depthMask(true);
        this.gl.uniform2fv(spriteUniforms.spriteScreenOffset, DEFAULT_SPRITE_SCREEN_OFFSET);
        this.setUniform1(spriteUniforms.spriteColorStrength, 0);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
      }
      return;
    }

    this.useProgram(program);
    if (sceneObject.terrainLayer || sceneObject.terrainObject === "palm-tree") {
      const terrainBatch = this.getTerrainBatch(sceneObject);

      if (terrainBatch) {
        this.drawTerrainBatch(sceneObject, terrainBatch.primitive);
        return;
      }
    }

    if (sceneObject.terrainLayer) {
      this.drawTerrainSceneObject(sceneObject);
      return;
    }

    const { uniforms } = this.resources;

    this.setUniform1(uniforms.ditherStrength, 1);
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
      this.setUniform3(uniforms.instanceTint, instance.tint || DEFAULT_INSTANCE_TINT);
      this.setUniform1(uniforms.instanceTintStrength, instance.tintStrength || 0);
      this.setUniform1(uniforms.instanceAlpha, instance.alpha ?? 1);
      this.setUniform1(uniforms.localYaw, instance.localYaw || 0);
      this.setUniform3(uniforms.localPivot, instance.localPivot || DEFAULT_LOCAL_PIVOT);
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

    this.setUniform1(uniforms.ditherStrength, TERRAIN_DITHER_STRENGTH);
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
        this.setUniform3(uniforms.instanceTint, instance.tint || DEFAULT_INSTANCE_TINT);
        this.setUniform1(uniforms.instanceTintStrength, instance.tintStrength || 0);
        this.setUniform1(uniforms.instanceAlpha, 1);
        this.setUniform1(uniforms.localYaw, 0);
        this.setUniform3(uniforms.localPivot, DEFAULT_LOCAL_PIVOT);
        this.setUniform1(uniforms.swayStrength, 0);
        this.gl.drawElements(this.gl.TRIANGLES, primitive.indexCount, primitive.indexType, 0);
      }
    }
  }

  drawTerrainBatch(sceneObject, primitive) {
    const { uniforms } = this.resources;

    this.setUniform1(
      uniforms.ditherStrength,
      sceneObject.terrainLayer ? TERRAIN_DITHER_STRENGTH : 1
    );
    this.setUniform3(uniforms.modelOffset, ZERO_WORLD_OFFSET);
    this.setUniform1(uniforms.modelScale, 1);
    this.setUniform1(uniforms.modelHeight, sceneObject.model.size[1]);
    this.setUniform1(uniforms.brightness, sceneObject.brightness ?? 1);
    this.setUniform1(uniforms.waveStrength, 0);
    this.setUniform1(uniforms.waveScale, 1);
    this.setUniform1(uniforms.waveSpeed, 1);
    this.setUniform1(uniforms.waveChop, 0);
    this.gl.uniform2fv(uniforms.waveDirection, DEFAULT_WAVE_DIRECTION);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, sceneObject.model.texture);
    this.setUniform3(uniforms.instanceOffset, ZERO_WORLD_OFFSET);
    this.setUniform1(uniforms.instanceScale, 1);
    this.setUniform1(uniforms.instanceYaw, 0);
    this.setUniform1(uniforms.instancePitch, 0);
    this.setUniform1(uniforms.instanceRoll, 0);
    this.setUniform3(uniforms.instanceTint, DEFAULT_INSTANCE_TINT);
    this.setUniform1(uniforms.instanceTintStrength, 0);
    this.setUniform1(uniforms.instanceAlpha, 1);
    this.setUniform1(uniforms.localYaw, 0);
    this.setUniform3(uniforms.localPivot, ZERO_WORLD_OFFSET);
    this.setUniform1(uniforms.swayStrength, 0);
    this.bindPrimitive(primitive);
    this.gl.drawElements(this.gl.TRIANGLES, primitive.indexCount, primitive.indexType, 0);
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
    const sceneObjectsAfterOcean = [];
    for (const sceneObject of sceneObjects) {
      if (sceneObject.renderAfterOcean) {
        sceneObjectsAfterOcean.push(sceneObject);
        continue;
      }

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
      this.currentProgram = null;
    }

    this.gl.depthMask(false);
    for (const sceneObject of sceneObjectsAfterOcean) {
      this.drawSceneObject(sceneObject);
    }
    this.gl.depthMask(true);
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

    for (const batch of this.terrainBatches) {
      this.gl.deleteBuffer(batch.primitive.vertexBuffer);
      this.gl.deleteBuffer(batch.primitive.indexBuffer);
    }
    this.terrainBatches.clear();

    if (this.oceanSurface) {
      this.gl.deleteProgram(this.oceanSurface.program);
      this.gl.deleteBuffer(this.oceanSurface.cornerBuffer);
    }

    this.disposed = true;
  }
}

/**
 * @param {{
 *   canvas: HTMLCanvasElement,
 *   width?: number,
 *   height?: number,
 *   pixelSnap?: number[],
 *   oceanEnabled?: boolean,
 *   preserveDrawingBuffer?: boolean
 * }} options
 * @returns {WorldRenderer}
 */
export function createWorldRenderer({ canvas, ...options }) {
  if (!canvas) {
    throw new Error("Renderer precisa de um canvas.");
  }

  return new WorldRenderer(canvas, options);
}
