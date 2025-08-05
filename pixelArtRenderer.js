let pencilTool = document.getElementById('pencil-tool');
let eraserTool = document.getElementById('eraser-tool');
let fillTool = document.getElementById('fill-tool');
let moveTool = document.getElementById('move-tool');
let colorPicker = document.getElementById('color-picker');

let saveTool = document.getElementById('save-tool');
let loadTool = document.getElementById('load-tool');
let createTool = document.getElementById('create-new-tool'); 

let pixelArtNameInput = document.getElementById('pixel-art-name');

pencilTool.addEventListener('click', () => {
    tool = 'pencil';
    pencilTool.closest(".tool-item").classList.add('selected');
    eraserTool.closest(".tool-item").classList.remove('selected');
    fillTool.closest(".tool-item").classList.remove('selected');
    moveTool.closest(".tool-item").classList.remove('selected');
});

eraserTool.addEventListener('click', () => {
    tool = 'eraser';
    pencilTool.closest(".tool-item").classList.remove('selected');
    eraserTool.closest(".tool-item").classList.add('selected');
    fillTool.closest(".tool-item").classList.remove('selected');
    moveTool.closest(".tool-item").classList.remove('selected');
});

fillTool.addEventListener('click', () => {
    tool = 'fill';
    pencilTool.closest(".tool-item").classList.remove('selected');
    eraserTool.closest(".tool-item").classList.remove('selected');
    fillTool.closest(".tool-item").classList.add('selected');
    moveTool.closest(".tool-item").classList.remove('selected');
});

moveTool.addEventListener('click', () => {
    tool = 'move';
    pencilTool.closest(".tool-item").classList.remove('selected');
    eraserTool.closest(".tool-item").classList.remove('selected');
    fillTool.closest(".tool-item").classList.remove('selected');
    moveTool.closest(".tool-item").classList.add('selected');
});

colorPicker.addEventListener('input', (event) => {
    event.stopPropagation();
    // Remove preventDefault()
    
    const color = event.target.value;
    const rgba = hexToRgba(color);
    textureColor = [rgba.r, rgba.g, rgba.b, rgba.a];
});

saveTool.addEventListener('click', () => {
    if (!texture) {
        alert('No texture created yet!');
        return;
    }
    const name = pixelArtNameInput.value.trim() || 'Untitled';
    if (name === '') {
        alert('Please enter a name for the texture.');
        return;
    }
    saveCurrentTexture(name);
});

loadTool.addEventListener('click', () => {
    if (!texture) {
        alert('No texture created yet!');
        return;
    }
    const name = pixelArtNameInput.value.trim();
    if (name === '') {
        alert('Please enter a name to load.');
        return;
    }
    loadTexture(name);
});

createTool.addEventListener('click', () => {
    const width = parseInt(document.getElementById('new-texture-width').value, 10);
    const height = parseInt(document.getElementById('new-texture-height').value, 10);
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert('Please enter valid dimensions for the new texture.');
        return;
    }
    createNewTexture(width, height);
    pixelArtNameInput.value = 'Untitled'; // Reset name input
    textureName = 'Untitled'; // Reset texture name
});



let textures = [

];

window.textures = textures;



let textureWidth = 16;
let textureHeight = 16;

let textureHalfWidth = textureWidth / 2;
let textureHalfHeight = textureHeight / 2;

let texture = null;

let updateTexture = false;

let textureName = 'Untitled';
let textureColor = [255, 255, 255, 255]; // Default color for pixel art
colorPicker.value = '#ffffff'; // Default color picker value


// just a 1x1 square for pixel art
let positions = [
    -textureHalfWidth, -textureHalfHeight, -1.0,
     textureHalfWidth, -textureHalfHeight, -1.0,
     textureHalfWidth,  textureHalfHeight, -1.0,
    -textureHalfWidth,  textureHalfHeight, -1.0
];
let uvs = [
    0, 0,
    1, 0,
    1, 1,
    0, 1
];
let indices = [0, 1, 2, 0, 2, 3];

let imagePosition = { x: 0, y: 0, z: 0 };

let vao = new VertexArrayObject();
let vertexBuffer = new VertexBuffer(positions, Float32Array, 3);
let uvBuffer = new VertexBuffer(uvs, Float32Array, 2);
let indexBuffer = new IndexBuffer(indices);

vao.bind();

vertexBuffer.bind();
gl.enableVertexAttribArray(pa_positionLocation);
gl.vertexAttribPointer(pa_positionLocation, 3, gl.FLOAT, false, 0, 0);

uvBuffer.bind();
gl.enableVertexAttribArray(pa_texCoordLocation);
gl.vertexAttribPointer(pa_texCoordLocation, 2, gl.FLOAT, false, 0, 0);

indexBuffer.bind();

vao.unbind();


let modelMatrix = identity();
let imageSize = 1.0;

let tool = 'none';



function hexToRgba(hex) {
    let r = 0, g = 0, b = 0, a = 255;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    } else if (hex.length === 9) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
        a = parseInt(hex[7] + hex[8], 16);
    }
    return { r, g, b, a };
}

function createNewTexture(width, height, pixelData = null) {
    saveCurrentTexture(textureName, "Do you want to save the current texture before creating a new one?");

    textureWidth = width;
    textureHeight = height;
    textureHalfWidth = textureWidth / 2;
    textureHalfHeight = textureHeight / 2;
    texture = new Texture({type: 'blank', width: textureWidth, height: textureHeight, format: 'pixelated', pixelData: pixelData});

    updateModelMatrix();

    positions = [
        -textureHalfWidth, -textureHalfHeight, -1.0,
         textureHalfWidth, -textureHalfHeight, -1.0,
         textureHalfWidth,  textureHalfHeight, -1.0,
        -textureHalfWidth,  textureHalfHeight, -1.0
    ];
    vertexBuffer.updateData(positions);
}

createNewTexture(16, 16);

function saveCurrentTexture(name, confirmMessage = "Texture already exists. Do you want to overwrite it?") {
    if (!texture) {
        return;
    }

    if (textures[name]) {
        if (!confirm(confirmMessage)) {
            return;
        }
    }

    window.textureAtlas.delete(); // Delete the old texture atlas if it exists
    window.textureAtlas = new Texture({type: 'blank', width: textureWidth, height: textureHeight, format: 'pixelated', pixelData: texture.pixelData.slice()});

    textures[name] = {
        name: name,
        width: textureWidth,
        height: textureHeight,
        pixelData: texture.pixelData.slice() // Create a copy of the pixel data
    };

    console.log(`Texture "${name}" saved successfully!`);
}

function loadTexture(name) {
    if (!textures[name]) {
        alert(`Texture "${name}" does not exist!`);
        return;
    }

    const data = textures[name];
    createNewTexture(data.width, data.height, data.pixelData);
    textureName = data.name;
    pixelArtNameInput.value = textureName;
    console.log(`Texture "${textureName}" loaded successfully!`);
}

function getMouseNDC(mouseX, mouseY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = (2 * (mouseX - rect.left)) / rect.width - 1;
    const y = 1 - (2 * (mouseY - rect.top)) / rect.height;
    return [x, y];
}

function unprojectOrtho(ndcX, ndcY, orthoMatrix) {
    const invOrtho = invert(orthoMatrix);
    const world = multiply(invOrtho, [ndcX, ndcY, 0, 1]);
    return [world[0] / world[3], world[1] / world[3]];
}

function worldToModel(worldPos, modelMatrix) {
    const invModel = invert(modelMatrix);
    const model = multiply(invModel, [...worldPos, 1]);
    return [model[0] / model[3], model[1] / model[3], model[2] / model[3]];
}

function isHovering(mouseX, mouseY, canvas, modelMatrix) {
    const [ndcX, ndcY] = getMouseNDC(mouseX, mouseY, canvas);
    const [wx, wy] = unprojectOrtho(ndcX, ndcY, multiply(textureCamera.projectionMatrix, textureCamera.viewMatrix));
    const modelPos = worldToModel([wx, wy, 0], modelMatrix);

    // Check if inside [-textureHalfWidth, textureHalfWidth] in X and Y in model space
    return { 
        hovering: modelPos[0] >= -textureHalfWidth && modelPos[0] <= textureHalfWidth && modelPos[1] >= -textureHalfHeight && modelPos[1] <= textureHalfHeight,
        x: (modelPos[0] + textureHalfWidth) / (2 * textureHalfWidth),
        y: (modelPos[1] + textureHalfHeight) / (2 * textureHalfHeight)
    };
}

function updateModelMatrix() {
    modelMatrix = translate(identity(), imagePosition.x, imagePosition.y, imagePosition.z);
    modelMatrix = multiply(modelMatrix, scale(identity(), imageSize));
}


function pixelArtUpdate() {
    if (!texture) {
        return;
    }

    const { hovering, x, y } = isHovering(mouseX, mouseY, canvas, modelMatrix);
    if (hovering) {
        if (isDragging && tool === 'pencil') {
            let pixelX = Math.floor(x * textureWidth);
            let pixelY = Math.floor(y * textureHeight);
            texture.setPixel(pixelX, pixelY, textureColor[0], textureColor[1], textureColor[2], textureColor[3]);
            updateTexture = true;
        }

        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }

    if (isDragging && tool === 'move') {
        imagePosition.x += mouseDeltaX
        imagePosition.y -= mouseDeltaY
        imagePosition.z = -1.0; // Keep it at the same depth
        updateModelMatrix();
    }

    if (isScrolling) {
        imageSize -= window.scrollDelta * 0.01 * deltaTime * imageSize; // Adjust the scaling factor as needed
        imageSize = Math.max(0.1, Math.min(imageSize, 100)); // Clamp size between 0.1 and 10
        updateModelMatrix();
    }

    if (updateTexture) {
        texture.updateTexture();
        updateTexture = false;
    }
}
window.pixelArtUpdate = pixelArtUpdate;

function pixelArtRender() {
    if (!texture) {
        return;
    }

    gl.cullFace(gl.BACK);

    gl.uniformMatrix4fv(pa_uProjectionMatrix, false, textureCamera.projectionMatrix);
    gl.uniformMatrix4fv(pa_uModelMatrix, false, modelMatrix);

    vao.bind();
    texture.bind();

    gl.drawElements(gl.TRIANGLES, indexBuffer.indices.length, gl.UNSIGNED_SHORT, 0);

    texture.unbind();
    vao.unbind();

    gl.cullFace(gl.FRONT);
}
window.pixelArtRender = pixelArtRender;