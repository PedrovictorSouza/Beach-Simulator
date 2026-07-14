import { COASTAL_ZONE_LIMITS } from "../coast/coastalZones.js";

const OCEAN_WIDTH = 920;
const OCEAN_DEPTH = 860;
const OCEAN_Y = 0.16;
const OCEAN_SHORE_Z = COASTAL_ZONE_LIMITS.landMinZ;
const OCEAN_GRID_COLUMNS = 36;
const OCEAN_GRID_ROWS = 56;

const OCEAN_VERTEX_SOURCE = `
  precision mediump float;

  attribute vec2 aCorner;

  uniform mat4 uViewProjection;
  uniform float uCenterX;
  uniform float uShoreZ;
  uniform float uWidth;
  uniform float uDepth;
  uniform float uWaterY;
  uniform float uTime;

  varying vec2 vWorldXZ;
  varying float vShoreDistance;

  void main() {
    vec2 worldXZ = vec2(
      uCenterX + aCorner.x * uWidth,
      uShoreZ + 18.0 - (1.0 - aCorner.y) * (uDepth + 18.0)
    );
    float shoreDistance = uShoreZ - worldXZ.y;
    float shoreInfluence = 1.0 - smoothstep(-12.0, 170.0, shoreDistance);
    float swellInfluence = smoothstep(10.0, 80.0, shoreDistance);
    float swellPhase = worldXZ.y * 0.052 + uTime * 1.9 + sin(worldXZ.x * 0.015) * 0.55;
    float swellWave = sin(swellPhase);
    float swell = (swellWave + sin(swellPhase * 2.0) * 0.32) * 0.92;
    float crossWave = sin(worldXZ.x * 0.034 + worldXZ.y * 0.021 + uTime * 1.28) * 0.38;
    float shorePhase = shoreDistance * 0.14 + uTime * 2.4 + sin(worldXZ.x * 0.025) * 0.35;
    float shoreWave = sin(shorePhase) + sin(shorePhase * 2.0) * 0.25;
    float shorePulse = shoreWave * shoreInfluence * 0.95;
    float tideLift = sin(uTime * 0.16) * shoreInfluence * 0.38;
    float waveHeight = (swell + crossWave) * swellInfluence + shorePulse + tideLift;
    float steppedWaveHeight = floor(waveHeight * 4.0 + 0.5) / 4.0;
    vec3 world = vec3(worldXZ.x, uWaterY + steppedWaveHeight, worldXZ.y);

    vWorldXZ = world.xz;
    vShoreDistance = shoreDistance;
    vec4 clipPosition = uViewProjection * vec4(world, 1.0);
    vec2 snappedPosition = floor((clipPosition.xy / clipPosition.w) * 180.0 + 0.5) / 180.0;
    clipPosition.xy = snappedPosition * clipPosition.w;
    gl_Position = clipPosition;
  }
`;

const OCEAN_FRAGMENT_SOURCE = `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uCameraXZ;
  uniform float uShoreZ;

  varying vec2 vWorldXZ;
  varying float vShoreDistance;

  vec2 hash2(vec2 value) {
    value = vec2(
      dot(value, vec2(127.1, 311.7)),
      dot(value, vec2(269.5, 183.3))
    );
    return fract(sin(value) * 43758.5453);
  }

  float hash1(vec2 value) {
    return fract(sin(dot(value, vec2(41.7, 289.3))) * 24634.6345);
  }

  float noise(vec2 value) {
    vec2 cell = floor(value);
    vec2 local = fract(value);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash1(cell);
    float b = hash1(cell + vec2(1.0, 0.0));
    float c = hash1(cell + vec2(0.0, 1.0));
    float d = hash1(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float animeCellPattern(vec2 value) {
    vec2 cell = floor(value);
    vec2 local = fract(value);
    vec2 seed = hash2(cell);
    vec2 point = 0.5 + 0.31 * sin(seed * 6.2831 + uTime * 0.32);
    float cellRing = 1.0 - smoothstep(0.055, 0.145, abs(length(local - point) - 0.35));
    float edgeLine = 1.0 - smoothstep(0.025, 0.075, min(min(local.x, local.y), min(1.0 - local.x, 1.0 - local.y)));

    return max(cellRing, edgeLine * 0.54);
  }

  void main() {
    vec2 pixelWorldXZ = floor(vWorldXZ / 2.4 + 0.5) * 2.4;
    float pixelShoreDistance = floor(vShoreDistance / 2.4 + 0.5) * 2.4;
    float tideCycle = sin(uTime * 0.16);
    float waveRunup = sin(uTime * 0.72 + sin(pixelWorldXZ.x * 0.02) * 0.4);
    float waterline = -3.0 - tideCycle * 7.0 - waveRunup * 2.5;
    float shoreMask = smoothstep(waterline - 1.5, waterline + 3.0, pixelShoreDistance);
    float distanceFromCamera = length(pixelWorldXZ - uCameraXZ);
    float horizonFade = 1.0 - smoothstep(470.0, 760.0, distanceFromCamera);

    vec2 flow = vec2(0.009, -0.024) * uTime;
    float distortion = noise(pixelWorldXZ * 0.018 + vec2(uTime * 0.035, 0.0));
    vec2 waterUv = pixelWorldXZ * 0.032 + flow + vec2(distortion - 0.5) * 0.26;

    float foamCells = animeCellPattern(waterUv);
    float bandNoise = noise(vec2(pixelWorldXZ.x * 0.045 + uTime * 0.42, pixelWorldXZ.y * 0.03));
    float lateralWarp = sin(pixelWorldXZ.x * 0.035 + uTime * 0.22) * 2.8;
    lateralWarp += (noise(vec2(pixelWorldXZ.x * 0.028, uTime * 0.12)) - 0.5) * 5.0;
    float breakerCycle = mod(pixelShoreDistance + lateralWarp + uTime * 8.5, 34.0);
    float breakerLine = 1.0 - smoothstep(2.0, 6.5, abs(breakerCycle - 17.0));
    float surfZone = smoothstep(waterline + 4.0, waterline + 10.0, pixelShoreDistance);
    surfZone *= 1.0 - smoothstep(82.0, 118.0, pixelShoreDistance);
    float brokenFoam = breakerLine * surfZone * mix(0.72, 1.0, bandNoise);
    float shoreWash = 1.0 - smoothstep(2.0, 9.0, abs(pixelShoreDistance - waterline - 3.0));
    shoreWash *= smoothstep(0.12, 0.78, bandNoise);
    float surfBand = max(brokenFoam, shoreWash);
    float openWaterCells = foamCells * smoothstep(92.0, 150.0, pixelShoreDistance);

    vec3 deepColor = vec3(0.035, 0.22, 0.42);
    vec3 midColor = vec3(0.05, 0.55, 0.76);
    vec3 shallowColor = vec3(0.38, 0.82, 0.88);
    vec3 highlightColor = vec3(0.92, 0.98, 0.94);

    float depthRamp = smoothstep(10.0, 220.0, pixelShoreDistance);
    vec3 color = mix(shallowColor, deepColor, depthRamp);
    color = mix(color, midColor, openWaterCells * 0.34);
    color = mix(color, highlightColor, max(openWaterCells * 0.48, surfBand * 0.96));

    vec2 screenPixel = floor(gl_FragCoord.xy / 4.0);
    float jitterFrame = floor(uTime * 6.0);
    float pixelJitter = (hash1(screenPixel + vec2(jitterFrame, jitterFrame * 0.37)) - 0.5) * 0.035;
    color = floor(clamp(color + pixelJitter, 0.0, 1.0) * 10.0 + 0.5) / 10.0;

    float alpha = mix(0.68, 0.92, depthRamp) * shoreMask * horizonFade;
    alpha = max(alpha, surfBand * 0.72);
    alpha = floor(alpha * 12.0 + 0.5) / 12.0;

    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Falha ao compilar shader do oceano");
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Falha ao linkar shader do oceano");
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function createOceanGridGeometry() {
  const corners = [];

  for (let row = 0; row <= OCEAN_GRID_ROWS; row += 1) {
    const currentZ = row / OCEAN_GRID_ROWS;
    const nextZ = Math.min((row + 1) / OCEAN_GRID_ROWS, 1);

    if (row === OCEAN_GRID_ROWS) {
      break;
    }

    for (let column = 0; column <= OCEAN_GRID_COLUMNS; column += 1) {
      const xProgress = column / OCEAN_GRID_COLUMNS;

      corners.push(xProgress - 0.5, currentZ);
      corners.push(xProgress - 0.5, nextZ);
    }
  }

  return {
    corners: new Float32Array(corners),
    vertexCount: corners.length / 2,
    rowVertexCount: (OCEAN_GRID_COLUMNS + 1) * 2
  };
}

export function createOceanSurface(gl) {
  const program = createProgram(gl, OCEAN_VERTEX_SOURCE, OCEAN_FRAGMENT_SOURCE);
  const cornerBuffer = gl.createBuffer();
  const geometry = createOceanGridGeometry();
  const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.corners, gl.STATIC_DRAW);

  return {
    program,
    cornerBuffer,
    maxVertexAttribs,
    vertexCount: geometry.vertexCount,
    rowVertexCount: geometry.rowVertexCount,
    attribs: {
      corner: gl.getAttribLocation(program, "aCorner")
    },
    uniforms: {
      viewProjection: gl.getUniformLocation(program, "uViewProjection"),
      centerX: gl.getUniformLocation(program, "uCenterX"),
      shoreZ: gl.getUniformLocation(program, "uShoreZ"),
      width: gl.getUniformLocation(program, "uWidth"),
      depth: gl.getUniformLocation(program, "uDepth"),
      waterY: gl.getUniformLocation(program, "uWaterY"),
      time: gl.getUniformLocation(program, "uTime"),
      cameraXZ: gl.getUniformLocation(program, "uCameraXZ")
    }
  };
}

export function drawOceanSurface({
  gl,
  oceanSurface,
  viewProjection,
  cameraTarget,
  timeSeconds
}) {
  const targetX = Number(cameraTarget?.[0]) || 0;
  const targetZ = Number(cameraTarget?.[2]) || 0;
  const { program, attribs, uniforms } = oceanSurface;

  gl.useProgram(program);
  gl.uniformMatrix4fv(uniforms.viewProjection, false, viewProjection);
  gl.uniform1f(uniforms.centerX, targetX);
  gl.uniform1f(uniforms.shoreZ, OCEAN_SHORE_Z);
  gl.uniform1f(uniforms.width, OCEAN_WIDTH);
  gl.uniform1f(uniforms.depth, OCEAN_DEPTH);
  gl.uniform1f(uniforms.waterY, OCEAN_Y);
  gl.uniform1f(uniforms.time, timeSeconds);
  gl.uniform2fv(uniforms.cameraXZ, [targetX, targetZ]);

  for (let index = 0; index < oceanSurface.maxVertexAttribs; index += 1) {
    gl.disableVertexAttribArray(index);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, oceanSurface.cornerBuffer);
  gl.enableVertexAttribArray(attribs.corner);
  gl.vertexAttribPointer(attribs.corner, 2, gl.FLOAT, false, 0, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.depthMask(false);

  for (let offset = 0; offset < oceanSurface.vertexCount; offset += oceanSurface.rowVertexCount) {
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, oceanSurface.rowVertexCount);
  }

  gl.depthMask(true);
  gl.enable(gl.DEPTH_TEST);
}
