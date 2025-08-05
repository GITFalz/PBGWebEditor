let keys = [];
let rotationSpeed = 1;
let lastFrameTime = performance.now();
let deltaTime = 0;
window.size = 1;

let mouseX = 0;
let mouseY = 0;

let lastMouseX = 0;
let lastMouseY = 0;

let mouseDeltaX = 0;
let mouseDeltaY = 0;

let isDragging = false;

window.deltaTime = 0;

window.mouseX = mouseX;
window.mouseY = mouseY;

window.mouseClick = false;

window.lastMouseX = lastMouseX;
window.lastMouseY = lastMouseY;

window.mouseDeltaX = mouseDeltaX;
window.mouseDeltaY = mouseDeltaY;

window.scrollDelta = 0;

window.isDragging = isDragging;
window.isScrolling = false; 



let structureCamera = new Camera();
let textureCamera = new Camera();

structureCamera.setProjectionMode("perspective");
textureCamera.setProjectionMode("orthographic");

window.structureCamera = structureCamera;
window.textureCamera = textureCamera;

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
    window.isDragging = true;
    window.lastMouseX = e.clientX;
    window.lastMouseY = e.clientY;
    window.mouseClick = true;
});

canvas.addEventListener("touchstart", (e) => {
    window.isDragging = true;
    if (e.touches.length > 0) {
        window.lastMouseX = e.touches[0].clientX;
        window.lastMouseY = e.touches[0].clientY;
    }
})

canvas.addEventListener("mousemove", (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;

    if (!window.isDragging) return;

    const dx = e.clientX - window.lastMouseX;
    const dy = e.clientY - window.lastMouseY;
    window.lastMouseX = e.clientX;
    window.lastMouseY = e.clientY;

    window.mouseDeltaX = dx;
    window.mouseDeltaY = dy;
});

canvas.addEventListener("touchmove", (e) => {
    if (!window.isDragging || e.touches.length === 0) return;

    window.lastMouseX = e.touches[0].clientX;
    window.lastMouseY = e.touches[0].clientY;
})

canvas.addEventListener("mouseup", () => {
    window.isDragging = false;
});

canvas.addEventListener("touchend", () => {
    window.isDragging = false;
})

canvas.addEventListener("mouseleave", () => {
    window.isDragging = false;
});

canvas.addEventListener("touchcancel", () => {
    window.isDragging = false;
})

canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    window.isScrolling = true;
    window.scrollDelta = e.deltaY;
});

// Resize canvas
function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Skip invalid dimensions completely
    if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
        console.warn('Skipping resize due to invalid dimensions:', width, height);
        return;
    }

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
}
window.resizeCanvasToDisplaySize = resizeCanvasToDisplaySize;

resizeCanvasToDisplaySize(canvas);

window.addEventListener('resize', () => {
    resizeCanvasToDisplaySize(canvas);
    requestAnimationFrame(render);
});

function resize() {
    window.structureCamera.resize();
    window.textureCamera.resize();
}

function update() {
    const now = performance.now();
    window.deltaTime = (now - lastFrameTime) / 1000; // in seconds
    lastFrameTime = now;

    currentUpdate();

    window.isScrolling = false; // Reset scrolling state after update
    window.mouseClick = false; // Reset mouse click state after update

    window.mouseDeltaX = 0; // Reset mouse delta after update
    window.mouseDeltaY = 0; // Reset mouse delta after update

    window.scrollDelta = 0; // Reset scroll delta after update

    requestAnimationFrame(update);
}

function setRenderType(type) {
    if (type === 'structure') {
        currentUpdate = window.structureUpdate;
        currentRenderer = window.structureRender;
        gl.useProgram(window.program);
    } else if (type === 'pixelArt') {
        currentUpdate = window.pixelArtUpdate;
        currentRenderer = window.pixelArtRender;
        gl.useProgram(window.pixelArtShader);
    } else {
        console.error('Unknown render type:', type);
    }
}
window.setRenderType = setRenderType;

let currentUpdate = () => {};
let currentRenderer = () => {};

setRenderType('structure'); // Default render type

// Enable depth
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// Enable backface culling
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.FRONT);

// Animation loop
function render() {
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    currentRenderer();
    
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL error:', error);
    }

    requestAnimationFrame(render);
}

update();
render();

generateChunks();
reloadChunks();