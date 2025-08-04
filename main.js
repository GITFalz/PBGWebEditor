import { 
  show_graphNodeShapeProperties,
  set_currentGraphNodeType
 } from './editor/editor.js';

let keys = [];
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let rotationSpeed = 1;
let lastFrameTime = performance.now();
let deltaTime = 0;
window.size = 1;


let camera = {
  eye: [0, 0, 0],
  center: [0, 0, 0],
  up: [0, 1, 0],
  yaw: 0,
  pitch: 0,
  distance: canvas.width * 0.2
};



const playerPos = [0, 0, 0];

function updateCameraAnchor() {
  const x = camera.distance * Math.cos(camera.pitch) * Math.sin(camera.yaw);
  const y = camera.distance * Math.sin(camera.pitch);
  const z = camera.distance * Math.cos(camera.pitch) * Math.cos(camera.yaw);

  camera.eye = [x, y, z];
  camera.center = [0, 0, 0];
  camera.up = [0, 1, 0];
}

function updateCameraPlayer() {
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);

  const forward = [
    sinYaw * cosPitch,
    sinPitch,
    cosYaw * cosPitch
  ];

  const camOffset = [
    -forward[0] * camera.distance,
    -forward[1] * camera.distance + 2.0, // Raise a bit
    -forward[2] * camera.distance
  ];

  camera.eye = [
    playerPos[0] + camOffset[0],
    playerPos[1] + camOffset[1],
    playerPos[2] + camOffset[2]
  ];

  camera.center = [
    playerPos[0] + forward[0],
    playerPos[1] + forward[1],
    playerPos[2] + forward[2]
  ];

  camera.up = [0, 1, 0];
}


let modelMatrix = new Float32Array(16);
window.scalingMatrix = new Float32Array(16);
window.rotationMatrix = new Float32Array(16);

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

canvas.addEventListener("touchstart", (e) => {
  isDragging = true;
  if (e.touches.length > 0) {
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  }
})

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;

  camera.yaw += dx * deltaTime * 0.1; // Adjust sensitivity
  camera.pitch -= dy * deltaTime * 0.1; // Adjust sensitivity
  camera.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, camera.pitch)); // clamp

  updateCameraAnchor();
});

canvas.addEventListener("touchmove", (e) => {
  if (!isDragging || e.touches.length === 0) return;

  const deltaX = e.touches[0].clientX - lastMouseX;
  const deltaY = e.touches[0].clientY - lastMouseY;

  const rotationSpeed = 0.1 * deltaTime;

  lastMouseX = e.touches[0].clientX;
  lastMouseY = e.touches[0].clientY;

  globalXRotation(deltaY * rotationSpeed);
  globalYRotation(deltaY * rotationSpeed);
})

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
})

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

canvas.addEventListener("touchcancel", () => {
  isDragging = false;
})

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomSpeed = 0.01 * size * deltaTime;
  window.size += e.deltaY * zoomSpeed;
  window.size = Math.max(0.1, Math.min(size, 10)); // Clamp size between 0.1 and 10
  camera.distance = -20 * window.size; // Adjust camera distance based on size

  updateCameraAnchor();
});

// Resize canvas
function resizeCanvasToDisplaySize(canvas) {
  const width  = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}
resizeCanvasToDisplaySize(canvas);
gl.viewport(0, 0, canvas.width, canvas.height);

window.addEventListener('resize', () => {
  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
});

// Enable depth
gl.enable(gl.DEPTH_TEST);


gl.depthFunc(gl.LEQUAL);


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


function multiply(a, b) {
  const out = new Float32Array(16);
  for (let i = 0; i < 4; ++i)
    for (let j = 0; j < 4; ++j)
      out[j*4+i] = a[i]*b[j*4] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
  return out;
}

function lookAt(eye, center, up) {
    const zAxis = normalize(subtract(eye, center));   // Forward
    const xAxis = normalize(cross(up, zAxis));        // Right
    const yAxis = cross(zAxis, xAxis);                // Up (orthogonal)

    return [
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
    ];
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function length(v) {
    return Math.sqrt(dot(v, v));
}

function normalize(v) {
    const len = length(v);
    return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
}

window.identity = identity;
window.rotateX = rotateX;
window.rotateY = rotateY;
window.scale = scale;
window.perspective = perspective;
window.translate = translate;
window.multiply = multiply;


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
  temp = window.multiply(rotateX(angle), temp);
  temp = window.multiply(translate(identity(), 0, 0, -20), temp);
  window.rotationMatrix = window.multiply(temp,  window.rotationMatrix);
}

function globalYRotation(angle) {
  let temp = translate(identity(), 0, 0, 20);
  temp = window.multiply(rotateY(angle), temp);
  temp = window.multiply(translate(identity(), 0, 0, -20), temp);
  window.rotationMatrix = window.multiply(temp,  window.rotationMatrix);
}

function globalScale(size) {
  window.scalingMatrix = scale(identity(), size);
}

// Animation loop
function render() {
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  const aspect = canvas.width / canvas.height;
  const projection = perspective(Math.PI / 4, aspect, 0.1, 1000);
  const viewMatrix = lookAt(camera.eye, camera.center, camera.up);

  gl.uniformMatrix4fv(window.uProjectionMatrix, false, projection);
  gl.uniformMatrix4fv(window.uViewMatrix, false, viewMatrix);

  renderChunks();
  const error = gl.getError();
if (error !== gl.NO_ERROR) {
    console.error('WebGL error:', error);
}

  requestAnimationFrame(render);
}

modelMatrix = identity();
window.scalingMatrix = identity();
modelMatrix = translate(modelMatrix, 0, 0, -20);

update();
render();

generateChunks();
reloadChunks();