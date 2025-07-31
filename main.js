const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

let keys = [];
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let rotationSpeed = 1;
let lastFrameTime = performance.now();
let deltaTime = 0;
let size = 1;

let modelMatrix = new Float32Array(16);
let scalingMatrix = new Float32Array(16);

function isTypingInInput() {
  const active = document.activeElement;
  return active && (
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    active.isContentEditable
  );
}

document.addEventListener("keydown", (e) => {
  if (isTypingInInput()) return; // Ignore key events if typing in an input field
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  if (isTypingInInput()) return; // Ignore key events if typing in an input field
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - lastMouseX;
  const deltaY = e.clientY - lastMouseY;

  const rotationSpeed = 0.1 * deltaTime;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;

  globalXRotation(deltaY * rotationSpeed);
  globalYRotation(deltaX * rotationSpeed);
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomSpeed = 0.01 * size * deltaTime;
  size -= e.deltaY * zoomSpeed;
  size = Math.max(0.1, Math.min(size, 10)); // Clamp size between 0.1 and 10
  globalScale(size);
});


// Resize canvas
function resizeCanvasToDisplaySize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}
resizeCanvasToDisplaySize(canvas);

// Enable depth
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// Shaders
const vsSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uScaleMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec3 vColor;
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * uScaleMatrix * vec4(aPosition, 1.0);
    vColor = aColor;
  }
`;

const fsSource = `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program error:", gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

const positionsCorner = new Float32Array([
  // Front face (Z = 1)
  0, 0, 1,   1, 0, 0,
  1, 0, 1,   0, 1, 0,
  1, 1, 1,   0, 0, 1,
  0, 1, 1,   1, 1, 0,

  // Back face (Z = 0)
  0, 0, 0,   1, 0, 1,
  0, 1, 0,   0, 1, 1,
  1, 1, 0,   1, 1, 1,
  1, 0, 0,   0.5, 0.5, 0.5,
]);

const positions = new Float32Array([
  // Front face (Z = +0.5)
  -0.5, -0.5,  0.5,   1, 0, 0,
   0.5, -0.5,  0.5,   0, 1, 0,
   0.5,  0.5,  0.5,   0, 0, 1,
  -0.5,  0.5,  0.5,   1, 1, 0,

  // Back face (Z = -0.5)
  -0.5, -0.5, -0.5,   1, 0, 1,
  -0.5,  0.5, -0.5,   0, 1, 1,
   0.5,  0.5, -0.5,   1, 1, 1,
   0.5, -0.5, -0.5,   0.5, 0.5, 0.5,
]);

const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3, // Front
  4, 5, 6, 4, 6, 7, // Back
  4, 5, 3, 4, 3, 0, // Left
  1, 2, 6, 1, 6, 7, // Right
  5, 6, 2, 5, 2, 3, // Top
  4, 7, 1, 4, 1, 0  // Bottom
]);

// Create buffers
const positionBuffer = gl.createBuffer();
const indexBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Setup attributes
const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
gl.enableVertexAttribArray(aPosition);

const aColor = gl.getAttribLocation(program, "aColor");
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
gl.enableVertexAttribArray(aColor);

// Uniform locations
const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uScaleMatrix = gl.getUniformLocation(program, "uScaleMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

// Matrices
function perspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov / 2);
  return new Float32Array([
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far+near)/(near-far), -1,
    0, 0, (2*far*near)/(near-far), 0
  ]);
}

function identity() {
  return new Float32Array([
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ]);
}

function rotateX(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ]);
}

function rotateY(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ]);
}

function scale(m, s) {
  return new Float32Array([
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    0, 0, 0, 1
  ]);
}

function translate(m, x, y, z) {
  const result = m.slice();
  result[12] += x;
  result[13] += y;
  result[14] += z;
  return result;
}

function update() {
  const now = performance.now();
  deltaTime = (now - lastFrameTime) / 1000; // in seconds
  lastFrameTime = now;


  const rotationAmount = rotationSpeed * deltaTime;

  if (keys['z']) {
    globalXRotation(-rotationAmount);
  }

  if (keys['s']) {
    globalXRotation(rotationAmount);
  }

  if (keys['q']) {
    globalYRotation(-rotationAmount);
  }

  if (keys['d']) {
    globalYRotation(rotationAmount);
  }

  requestAnimationFrame(update);
}

function globalXRotation(angle) {
  let temp = translate(identity(), 0, 0, 20);
  temp = multiply(rotateX(angle), temp);
  temp = multiply(translate(identity(), 0, 0, -20), temp);
  modelMatrix = multiply(temp, modelMatrix);
}

function globalYRotation(angle) {
  let temp = translate(identity(), 0, 0, 20);
  temp = multiply(rotateY(angle), temp);
  temp = multiply(translate(identity(), 0, 0, -20), temp);
  modelMatrix = multiply(temp, modelMatrix);
}

function globalScale(size) {
  scalingMatrix = scale(identity(), size);
}

// Animation loop
function render() {
  resizeCanvasToDisplaySize(canvas);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = canvas.width / canvas.height;
  const projection = perspective(Math.PI / 4, aspect, 0.1, 100);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelMatrix);
  gl.uniformMatrix4fv(uScaleMatrix, false, scalingMatrix);
  gl.uniformMatrix4fv(uProjectionMatrix, false, projection);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(render);
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let i = 0; i < 4; ++i)
    for (let j = 0; j < 4; ++j)
      out[j*4+i] = a[i]*b[j*4] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
  return out;
}

modelMatrix = identity();
scalingMatrix = identity();
modelMatrix = translate(modelMatrix, 0, 0, -20);

update();
render();