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

window.textures = {};



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
let pixelArtPositions = [
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
let vertexBuffer = new VertexBuffer(pixelArtPositions, Float32Array, 3);
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



const textureEntries = document.getElementById("texture-entries");
const addTextureBtn = document.getElementById("add-texture-button");
const atlasRowsInput = document.getElementById("atlas-rows");   
const atlasColumnsInput = document.getElementById("atlas-columns");

function createTextureEntry(name = "", index = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "texture-entry flex-row justify-between items-center mb-sm";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Texture Name";
    nameInput.className = "input-field w-full";
    nameInput.value = name;

    const indexInput = document.createElement("input");
    indexInput.type = "number";
    indexInput.min = 0;
    indexInput.placeholder = "Index";
    indexInput.value = index;
    indexInput.className = "input-field ml-sm";
    indexInput.style.width = "70px";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-node-button";
    deleteBtn.title = "Remove";
    deleteBtn.addEventListener("click", () => wrapper.remove());

    wrapper.appendChild(nameInput);
    wrapper.appendChild(indexInput);
    wrapper.appendChild(deleteBtn);

    textureEntries.appendChild(wrapper);
}

addTextureBtn.addEventListener("click", () => {
    createTextureEntry();
});

function getTextureEntries() {
    const entries = [];
    const textureEntryElements = textureEntries.querySelectorAll(".texture-entry");

    textureEntryElements.forEach(entry => {
        const nameInput = entry.querySelector("input[type='text']");
        const indexInput = entry.querySelector("input[type='number']");
        entries.push({
            name: nameInput.value.trim(),
            index: parseInt(indexInput.value, 10)
        });
    });

    return entries;
}

function clearTextureEntries() {
    textureEntries.innerHTML = ''; // Clear all entries
}

function setTextureEntries(entries) {
    clearTextureEntries();
    entries.forEach(entry => {
        createTextureEntry(entry.name, entry.index);
    });
}



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
    clearTextureEntries();
    atlasRowsInput.value = 1;
    atlasColumnsInput.value = 1;

    pixelArtPositions = [
        -textureHalfWidth, -textureHalfHeight, -1.0,
         textureHalfWidth, -textureHalfHeight, -1.0,
         textureHalfWidth,  textureHalfHeight, -1.0,
        -textureHalfWidth,  textureHalfHeight, -1.0
    ];
    vertexBuffer.updateData(pixelArtPositions);
}

createNewTexture(16, 16);

function saveCurrentTexture(name, confirmMessage = "Texture already exists. Do you want to overwrite it?") {
    if (!texture) {
        return;
    }

    if (window.textures[name]) {
        if (!confirm(confirmMessage)) {
            return;
        }
    }

    window.currentTexture = name;
    window.textureAtlas.delete(); // Delete the old texture atlas if it exists
    window.textureAtlas = new Texture({type: 'blank', width: textureWidth, height: textureHeight, format: 'pixelated', pixelData: texture.pixelData.slice()});

    const textureEntries = getTextureEntries();
    const atlasRows = parseInt(atlasRowsInput.value, 10) || 1;
    const atlasColumns = parseInt(atlasColumnsInput.value, 10) || 1;

    window.textures[name] = {
        name: name,
        width: textureWidth,
        height: textureHeight,
        pixelData: texture.pixelData.slice(),
        entries: textureEntries,
        atlasRows: atlasRows,
        atlasColumns: atlasColumns
    };

    console.log(`Texture "${name}" saved successfully!`);
}

function loadTexture(name) {
    if (!window.textures[name]) {
        alert(`Texture "${name}" does not exist!`);
        return;
    }

    const data = window.textures[name];

    if (
        typeof data.pixelData === 'object' &&
        data.pixelData !== null &&
        !Array.isArray(data.pixelData)
    ) {
        const arr = Object.keys(data.pixelData)
            .map(key => Number(key))
            .sort((a, b) => a - b) // ensure correct order
            .map(i => data.pixelData[i]);

        const uint8array = new Uint8Array(arr);
        data.pixelData = uint8array;
    }

    createNewTexture(data.width, data.height, data.pixelData);
    setTextureEntries(data.entries);
    atlasRowsInput.value = data.atlasRows || 1;
    atlasColumnsInput.value = data.atlasColumns || 1;

    textureName = data.name;
    pixelArtNameInput.value = textureName;
    console.log(`Texture "${textureName}" loaded successfully!`);
}

function updateModelMatrix() {
    modelMatrix = translate(identity(), imagePosition.x, imagePosition.y, imagePosition.z);
    modelMatrix = multiply(modelMatrix, scale(identity(), imageSize));
}


function pixelArtUpdate() {
    if (!texture) {
        return;
    }

    const { hovering, x, y } = isHovering(mouseX, mouseY, canvas.getBoundingClientRect(), modelMatrix, textureHalfWidth, textureHalfHeight, textureCamera.projectionMatrix, textureCamera.viewMatrix);
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