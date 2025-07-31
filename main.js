const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

let keys = [];
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let angleX = 0;
let angleY = 0;
let lastFrameTime = performance.now();
let deltaTime = 0;

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
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

  // Update rotation angles based on mouse movement
  angleY += deltaX * rotationSpeed;
  angleX += deltaY * rotationSpeed;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
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
  uniform mat4 uProjectionMatrix;
  varying vec3 vColor;
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
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

// Cube vertex positions and colors
const positions = new Float32Array([
  // Front
  -1, -1,  1,  1, 0, 0,
   1, -1,  1,  0, 1, 0,
   1,  1,  1,  0, 0, 1,
  -1,  1,  1,  1, 1, 0,
  // Back
  -1, -1, -1,  1, 0, 1,
  -1,  1, -1,  0, 1, 1,
   1,  1, -1,  1, 1, 1,
   1, -1, -1,  0.5, 0.5, 0.5,
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

function rotateY(m, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([
    c, 0, -s, 0,
    0, 1,  0, 0,
    s, 0,  c, 0,
    0, 0,  0, 1
  ]);
}

function rotateX(m, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
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

  requestAnimationFrame(update);
}

// Animation loop
function render() {
  resizeCanvasToDisplaySize(canvas);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = canvas.width / canvas.height;
  const projection = perspective(Math.PI / 4, aspect, 0.1, 100);
  let modelView = identity();
  modelView = translate(modelView, 0, 0, -6);

  let rotationY = rotateY(identity(), angleY);
  let rotationX = rotateX(identity(), angleX);

  modelView = multiply(modelView, rotationY);
  modelView = multiply(modelView, rotationX);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelView);
  gl.uniformMatrix4fv(uProjectionMatrix, false, projection);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  if (keys['q']) angleY -= 0.01;
  if (keys['d']) angleY += 0.01;
  if (keys['z']) angleX -= 0.01;
  if (keys['s']) angleX += 0.01;

  requestAnimationFrame(render);
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let i = 0; i < 4; ++i)
    for (let j = 0; j < 4; ++j)
      out[j*4+i] = a[i]*b[j*4] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
  return out;
}

update();
render();