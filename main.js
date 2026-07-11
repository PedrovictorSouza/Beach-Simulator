import "./styles/app.css";
import {
  createWorldRenderingResources,
  loadPicoModel,
  loadTexturedModel
} from "./rendering/worldAssets.js";
import { WORLD_CURVATURE_CONFIG } from "./rendering/worldCurvature.js";

const WORLD_LIMIT = 144;
const GROUND_TILE_INSTANCE_SCALE = 0.375;
const TERRAIN_DRAW_RADIUS = 96;
const PALM_TREE_MODEL_FACE_YAW_OFFSET = 0;
const CAMERA_TARGET = [0, 6, 0];
const CAMERA_DIRECTION = normalizeVec3([0.95, 0.72, 0.95]);
const CAMERA_DISTANCE = 128;
const CAMERA_FOV = (38 * Math.PI) / 180;

const appRoot = document.querySelector("#app");

appRoot.innerHTML = `
  <canvas class="world-canvas" aria-label="Planeta com terrain"></canvas>
  <div class="boot-status" role="status">Carregando terrain...</div>
`;

const canvas = appRoot.querySelector(".world-canvas");
const statusElement = appRoot.querySelector(".boot-status");
const gl = canvas.getContext("webgl", {
  antialias: false,
  alpha: true,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false
});

if (!gl) {
  statusElement.textContent = "WebGL indisponivel.";
  throw new Error("WebGL indisponivel");
}

const renderingResources = createWorldRenderingResources(gl);

function setStatus(message) {
  statusElement.textContent = message;
}

function normalizeVec3(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function subtractVec3(left, right) {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2]
  ];
}

function crossVec3(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function createIdentityMat4() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

function createPerspectiveMat4(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy * 0.5);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;

  return out;
}

function createLookAtMat4(eye, target, up) {
  const zAxis = normalizeVec3(subtractVec3(eye, target));
  const xAxis = normalizeVec3(crossVec3(up, zAxis));
  const yAxis = crossVec3(zAxis, xAxis);
  const out = createIdentityMat4();

  out[0] = xAxis[0];
  out[1] = yAxis[0];
  out[2] = zAxis[0];
  out[4] = xAxis[1];
  out[5] = yAxis[1];
  out[6] = zAxis[1];
  out[8] = xAxis[2];
  out[9] = yAxis[2];
  out[10] = zAxis[2];
  out[12] = -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]);
  out[13] = -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]);
  out[14] = -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]);

  return out;
}

function multiplyMat4(left, right) {
  const out = new Float32Array(16);
  const a00 = left[0], a01 = left[1], a02 = left[2], a03 = left[3];
  const a10 = left[4], a11 = left[5], a12 = left[6], a13 = left[7];
  const a20 = left[8], a21 = left[9], a22 = left[10], a23 = left[11];
  const a30 = left[12], a31 = left[13], a32 = left[14], a33 = left[15];
  const b00 = right[0], b01 = right[1], b02 = right[2], b03 = right[3];
  const b10 = right[4], b11 = right[5], b12 = right[6], b13 = right[7];
  const b20 = right[8], b21 = right[9], b22 = right[10], b23 = right[11];
  const b30 = right[12], b31 = right[13], b32 = right[14], b33 = right[15];

  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

  return out;
}

function createViewProjection() {
  const aspect = canvas.width / canvas.height;
  const eye = [
    CAMERA_TARGET[0] + CAMERA_DIRECTION[0] * CAMERA_DISTANCE,
    CAMERA_TARGET[1] + CAMERA_DIRECTION[1] * CAMERA_DISTANCE,
    CAMERA_TARGET[2] + CAMERA_DIRECTION[2] * CAMERA_DISTANCE
  ];
  const projection = createPerspectiveMat4(CAMERA_FOV, aspect, 0.1, 420);
  const view = createLookAtMat4(eye, CAMERA_TARGET, [0, 1, 0]);

  return multiplyMat4(projection, view);
}

function hashCell(x, z) {
  const value = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function isIceTerrainCell(x, z) {
  const distanceFromCenter = Math.hypot(x, z);

  if (distanceFromCenter < 34) {
    return false;
  }

  return hashCell(x, z) < 0.72;
}

function isVisibleFromStaticCamera(x, z) {
  return Math.hypot(x - CAMERA_TARGET[0], z - CAMERA_TARGET[2]) <= TERRAIN_DRAW_RADIUS;
}

function buildTerrainInstances(model) {
  const tileFootprint = Math.max(model.size[0], model.size[2]);
  const tileSpan = tileFootprint * GROUND_TILE_INSTANCE_SCALE;
  const tileCountPerAxis = Math.max(1, Math.ceil((WORLD_LIMIT * 2) / tileSpan));
  const start = -WORLD_LIMIT + tileSpan * 0.5;
  const normalInstances = [];
  const iceInstances = [];

  for (let xIndex = 0; xIndex < tileCountPerAxis; xIndex += 1) {
    for (let zIndex = 0; zIndex < tileCountPerAxis; zIndex += 1) {
      const x = Number((start + xIndex * tileSpan).toFixed(4));
      const z = Number((start + zIndex * tileSpan).toFixed(4));

      if (!isVisibleFromStaticCamera(x, z)) {
        continue;
      }

      const instance = {
        offset: [x, 0, z],
        scale: GROUND_TILE_INSTANCE_SCALE,
        yaw: 0
      };

      if (isIceTerrainCell(x, z)) {
        iceInstances.push(instance);
      } else {
        normalInstances.push(instance);
      }
    }
  }

  return { normalInstances, iceInstances };
}

function buildPalmTreeInstances() {
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

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function setUniform3(location, value) {
  if (location) {
    gl.uniform3fv(location, value);
  }
}

function setUniform1(location, value) {
  if (location) {
    gl.uniform1f(location, value);
  }
}

function setSceneUniforms(viewProjection) {
  const { program, uniforms } = renderingResources;

  gl.useProgram(program);
  gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
  setUniform1(uniforms.jitterAmount, 0);
  setUniform3(uniforms.worldCurvatureOrigin, [CAMERA_TARGET[0], 0, CAMERA_TARGET[2]]);
  setUniform1(uniforms.worldCurvatureStrength, WORLD_CURVATURE_CONFIG.strength);
  setUniform1(uniforms.worldCurvatureMaxDrop, WORLD_CURVATURE_CONFIG.maxDrop);
  gl.uniform2fv(uniforms.pixelSnap, [canvas.width * 0.5, canvas.height * 0.5]);
  setUniform1(uniforms.time, 0);
  setUniform3(uniforms.fogOrigin, CAMERA_TARGET);
  setUniform3(uniforms.fogColor, [0.82, 0.9, 0.94]);
  setUniform1(uniforms.fogNear, 84);
  setUniform1(uniforms.fogFar, 170);
  setUniform1(uniforms.fogIntensity, 0.28);
  gl.uniform1i(uniforms.texture, 0);
}

function bindPrimitive(primitive) {
  const { attribs } = renderingResources;

  gl.bindBuffer(gl.ARRAY_BUFFER, primitive.vertexBuffer);
  gl.enableVertexAttribArray(attribs.position);
  gl.vertexAttribPointer(attribs.position, 3, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(attribs.texCoord);
  gl.vertexAttribPointer(attribs.texCoord, 2, gl.FLOAT, false, 32, 12);

  if (attribs.normal >= 0) {
    gl.enableVertexAttribArray(attribs.normal);
    gl.vertexAttribPointer(attribs.normal, 3, gl.FLOAT, false, 32, 20);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indexBuffer);
}

function drawSceneObject(sceneObject) {
  const { uniforms } = renderingResources;

  setUniform3(uniforms.modelOffset, sceneObject.model.offset);
  setUniform1(uniforms.modelScale, sceneObject.model.scale);
  setUniform1(uniforms.modelHeight, sceneObject.model.size[1]);
  setUniform1(uniforms.brightness, sceneObject.brightness ?? 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sceneObject.model.texture);

  for (const instance of sceneObject.instances) {
    setUniform3(uniforms.instanceOffset, instance.offset);
    setUniform1(uniforms.instanceScale, instance.scale ?? 1);
    setUniform1(uniforms.instanceYaw, instance.yaw || 0);
    setUniform1(uniforms.instancePitch, instance.pitch || 0);
    setUniform1(uniforms.instanceRoll, instance.roll || 0);
    setUniform3(uniforms.instanceTint, instance.tint || [1, 1, 1]);
    setUniform1(uniforms.instanceTintStrength, instance.tintStrength || 0);
    setUniform1(uniforms.instanceAlpha, instance.alpha ?? 1);
    setUniform1(uniforms.localYaw, instance.localYaw || 0);
    setUniform3(uniforms.localPivot, instance.localPivot || [0, 0, 0]);
    setUniform1(uniforms.swayStrength, instance.swayStrength || 0);

    for (const primitive of sceneObject.model.primitives) {
      bindPrimitive(primitive);
      gl.drawElements(gl.TRIANGLES, primitive.indexCount, primitive.indexType, 0);
    }
  }
}

function render(sceneObjects) {
  resizeCanvas();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  setSceneUniforms(createViewProjection());

  for (const sceneObject of sceneObjects) {
    drawSceneObject(sceneObject);
  }
}

async function loadWorld() {
  const [normalGroundModel, iceGroundModel, palmTreeModel] = await Promise.all([
    loadPicoModel({
      gl,
      gltfPath: "./ground/ground.gltf",
      txtPath: "./ground/ground.txt",
      onStatus: setStatus
    }),
    loadTexturedModel({
      gl,
      gltfPath: "./iceground/iceground.gltf",
      binPath: "./iceground/iceground.bin",
      texturePath: "./iceground/iceground.png",
      normalizedSize: 3.8,
      onStatus: setStatus
    }),
    loadPicoModel({
      gl,
      gltfPath: "./Trees/PalmTree/plamTree.gltf",
      txtPath: "./Trees/PalmTree/plamTree.txt",
      onStatus: setStatus
    })
  ]);

  const terrain = buildTerrainInstances(normalGroundModel);
  return [
    {
      model: normalGroundModel,
      instances: terrain.normalInstances,
      brightness: 0.84
    },
    {
      model: iceGroundModel,
      instances: terrain.iceInstances,
      brightness: 0.98
    },
    {
      model: palmTreeModel,
      instances: buildPalmTreeInstances(),
      brightness: 1.05
    }
  ];
}

loadWorld()
  .then((sceneObjects) => {
    statusElement.remove();
    render(sceneObjects);
    window.addEventListener("resize", () => render(sceneObjects));
  })
  .catch((error) => {
    console.error(error);
    setStatus("Falha ao carregar terrain.");
  });
