window.blocks = {};

const blockNameInput = document.getElementById('block-name-input'); 
const saveBlockButton = document.getElementById('save-block-button');
const blockList = document.getElementById('block-list');


let blockViewCamera = new Camera();
let blockEditCamera = new Camera();

blockViewCamera.setProjectionMode("perspective", canvas.width, canvas.height / 2);
blockEditCamera.setProjectionMode("orthographic", canvas.width, canvas.height / 2);

blockViewCamera.distance = -20; // Default distance for the block view camera
blockViewCamera.updateCameraAnchor();

// 3D block view data
let blockPositions = window.getBlockPositions(-0.5, -0.5, -0.5);
let blockUvs = new Float32Array(6 * 4 * 2);
for (let i = 0; i < 6; i++) {
    const faceUVs = window.blockFaceUVs[i]();
    blockUvs.set(faceUVs, i * 8);
}
let blockTextures = new Int32Array(6 * 4);
for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
        blockTextures[i * 4 + j] = -1; // Initialize with -1 to indicate no texture
    }
}
let blockIndexes = new Uint16Array(6 * 6);
for (let i = 0; i < 6; i++) {
    const baseIndex = i * 4;
    blockIndexes.set([
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex, baseIndex + 2, baseIndex + 3
    ], i * 6);
}

let blockVao = new VertexArrayObject();
let blockPositionBuffer = new VertexBuffer(blockPositions, Float32Array, 3);
let blockUvBuffer = new VertexBuffer(blockUvs, Float32Array, 2);
let blockTextureDataBuffer = new VertexBuffer(blockTextures, Int32Array, 1);
let blockIndexBuffer = new IndexBuffer(blockIndexes);

let blockTexture = new Texture({type: 'blank', width: 16, height: 16, format: 'pixelated'})

blockVao.bind();

gl.bindBuffer(gl.ARRAY_BUFFER, blockPositionBuffer.buffer);
gl.enableVertexAttribArray(window.positionLocation);
gl.vertexAttribPointer(window.positionLocation, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, blockUvBuffer.buffer);
gl.enableVertexAttribArray(window.texCoordLocation);
gl.vertexAttribPointer(window.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, blockTextureDataBuffer.buffer);
gl.enableVertexAttribArray(window.dataLocation);
gl.vertexAttribIPointer(window.dataLocation, 1, gl.INT, false, 0, 0);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, blockIndexBuffer.buffer);

blockVao.unbind();



// 2D block editor data
let blockEditPositions = [
    ...getFlatFace(-0.5, -1.2, -1), // front
    ...getFlatFace(-0.5, 1.2, -1), // back
    ...getFlatFace(-1.7, 0, -1), // left
    ...getFlatFace(0.7, 0, -1), // right
    ...getFlatFace(-0.5, 0, -1), // top
    ...getFlatFace(-0.5, -2.4, -1) // bottom
]
const blockEditUvs = [
  // Face 1: facing up (normal UV)
  0, 0,
  1, 0,
  1, 1,
  0, 1,

  // Face 2: facing down (flip V)
  0, 1,
  1, 1,
  1, 0,
  0, 0,

  // Face 3: facing right (rotate UV 90° clockwise)
  1, 0,
  1, 1,
  0, 1,
  0, 0,

  // Face 4: facing left (rotate UV 90° counter-clockwise)
  0, 1,
  0, 0,
  1, 0,
  1, 1,

  // Face 5: facing up (normal UV again)
  0, 0,
  1, 0,
  1, 1,
  0, 1,

  // Face 6: facing up (normal UV again)
  0, 0,
  1, 0,
  1, 1,
  0, 1,
];



let blockEditTextures = new Int32Array(6 * 4);
for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
        blockEditTextures[i * 4 + j] = -1; // Initialize with -1 to indicate no texture
    }
}
let blockEditIndexes = new Uint16Array(6 * 6);
for (let i = 0; i < 6; i++) {
    const baseIndex = i * 4;
    blockEditIndexes.set([
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex, baseIndex + 2, baseIndex + 3
    ], i * 6);
}

let blockEditVao = new VertexArrayObject();
let blockEditPositionBuffer = new VertexBuffer(blockEditPositions, Float32Array, 3);
let blockEditUvBuffer = new VertexBuffer(blockEditUvs, Float32Array, 2);
let blockEditTextureDataBuffer = new VertexBuffer(blockEditTextures, Int32Array, 1);
let blockEditIndexBuffer = new IndexBuffer(blockEditIndexes);

blockEditVao.bind();

gl.bindBuffer(gl.ARRAY_BUFFER, blockEditPositionBuffer.buffer);
gl.enableVertexAttribArray(window.positionLocation);
gl.vertexAttribPointer(window.positionLocation, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, blockEditUvBuffer.buffer);
gl.enableVertexAttribArray(window.texCoordLocation);
gl.vertexAttribPointer(window.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, blockEditTextureDataBuffer.buffer);
gl.enableVertexAttribArray(window.dataLocation);
gl.vertexAttribIPointer(window.dataLocation, 1, gl.INT, false, 0, 0);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, blockEditIndexBuffer.buffer);

blockEditVao.unbind();



let size = 1.0; // Default size for the block view
// make edit size proportional to the half size of the canvas
let editSize = (canvas.height / 2) / 4;
let editViewMatrix = identity();    

let frontFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      0,  -0.7, 0));
let backFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),       0,   1.7, 0));
let leftFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      -1.2, 0.5, 0));
let rightFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      1.2, 0.5, 0));
let topFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),        0,   0.5, 0));
let bottomFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),     0,  -1.9, 0));

let hoveringOverFace = null; // Track which face is being hovered over
window.atlasRows = 1; // Default atlas rows
window.atlasColumns = 1; // Default atlas columns

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault(); 

    if (window.heldIndex === null || window.heldTexture === null) {
        console.warn('No texture held to drop');
        window.heldIndex = null; // Clear the held index after dropping
        window.heldTexture = null;
        return;
    }

    // Drop the held texture onto the hovered face
    if (hoveringOverFace !== null) {
        setBlockTextureIndex(hoveringOverFace, window.heldIndex);
    }

    window.heldIndex = null; // Clear the held index after dropping
    window.heldTexture = null;
});



saveBlockButton.addEventListener('click', () => {
    const blockName = blockNameInput.value.trim();
    if (!blockName) {
        alert('Please enter a block name.');
        return;
    }

    const blockData = {
        name: blockName,
        textureName: window.heldTexture,
        textureIndices: Array.from(blockTextures),
    }

    // <div class="block-item p-sm mb-sm default-selected">Block 1</div>
    if (window.blocks[blockName]) {
        confirm(`Block "${blockName}" already exists. Do you want to overwrite it?`) || (blockNameInput.value = '');
        return;
    } else {
        const blockItem = document.createElement('div');
        blockItem.className = 'block-item p-sm mb-sm default-selected';
        blockItem.textContent = blockName;
        blockItem.dataset.name = blockName;
        blockItem.addEventListener('click', () => {
            // Load the block data into the editor
            blockNameInput.value = blockItem.dataset.name;
            const block = window.blocks[blockItem.dataset.name];
            if (block) {
                blockTextures.set(block.textureIndices);
                blockEditTextures.set(block.textureIndices);
                blockTextureDataBuffer.updateData(blockTextures);
                blockEditTextureDataBuffer.updateData(blockEditTextures);
                window.heldTexture = block.textureName;
                blockAwake(); // Refresh the texture list
            }
        });
        blockList.appendChild(blockItem);
    }

    window.blocks[blockName] = blockData;
});




function setBlockTextureIndex(side, index) {
    if (side < 0 || side >= 6) {
        console.error('Invalid side index:', side);
        return;
    }
    if (index < 0 || index >= window.textures[window.currentTexture].entries.length) {
        console.error('Invalid texture index:', index);
        return;
    }
    
    const textureData = window.textures[window.currentTexture].entries[index];
    const atlasRows = window.textures[window.currentTexture].atlasRows || 1;
    const atlasColumns = window.textures[window.currentTexture].atlasColumns || 1;

    for (let i = 0; i < 4; i++) {
        blockTextures[side * 4 + i] = index;
        blockEditTextures[side * 4 + i] = index; 
    }

    blockTextureDataBuffer.updateData(blockTextures);
    blockEditTextureDataBuffer.updateData(blockEditTextures);
}

document.addEventListener('dragover', (e) => {
  e.preventDefault(); // necessary for drop to work
  mouseX = e.clientX;
  mouseY = e.clientY;
});


window.heldIndex = null; // Global variable to hold the currently held texture index
window.heldTexture = null; // Global variable to hold the currently held texture
function blockAwake() {
    const textureList = document.getElementById('texture-list');
    textureList.innerHTML = ''; // Clear existing items

    // get the texture with the name of the current texture
    const currentTexture = window.textures[window.currentTexture];
    if (currentTexture) {
        const textureEntries = currentTexture.entries || [];
        const atlasRows = currentTexture.atlasRows || 1;
        const atlasColumns = currentTexture.atlasColumns || 1;
        window.atlasRows = atlasRows;
        window.atlasColumns = atlasColumns;
        textureEntries.forEach((entry, index) => {
            const textureItem = document.createElement('div');
            textureItem.className = 'block-item-texture';
            textureItem.draggable = true;
            textureItem.textContent = entry.name;
            textureItem.dataset.index = index;
            textureItem.addEventListener('dragstart', (e) => {
                e.target.classList.add('selected');
                window.heldIndex = e.target.dataset.index;
                window.heldTexture = entry.name;
            });
            textureItem.addEventListener('dragend', (e) => {
                e.target.classList.remove('selected');
            });
            textureList.appendChild(textureItem);
        });

        let blockEditTextures = new Int32Array(6 * 4);
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                blockEditTextures[i * 4 + j] = -1; // Initialize with -1 to indicate no texture
            }
        }
    }
}
window.blockAwake = blockAwake;

function blockResize() {
    blockViewCamera.setProjectionMode("perspective", canvas.width, canvas.height / 2);
    blockEditCamera.setProjectionMode("orthographic", canvas.width, canvas.height / 2);

    editSize = (canvas.height / 2) / 5;

    frontFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      0,  -0.7, 0));
    backFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),       0,   1.7, 0));
    leftFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      -1.2, 0.5, 0));
    rightFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),      1.2, 0.5, 0));
    topFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),        0,   0.5, 0));
    bottomFaceModelMatrix = multiply(scale(identity(), editSize), translate(identity(),     0,  -1.9, 0));
}
window.blockResize = blockResize;

function blockUpdate() {
    const rect = canvas.getBoundingClientRect();
    const isInside = mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;

    const isHoveringTopHalf = isInside && mouseY < rect.top + rect.height / 2;
    const isHoveringBottomHalf = isInside && !isHoveringTopHalf;

    if (isDragging && isHoveringTopHalf) {
        blockViewCamera.yaw += mouseDeltaX * deltaTime * 0.1; // Adjust sensitivity
        blockViewCamera.pitch -= mouseDeltaY * deltaTime * 0.1; // Adjust sensitivity
        blockViewCamera.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, blockViewCamera.pitch)); // clamp

        blockViewCamera.updateCameraAnchor();
    }

    if (isScrolling && isHoveringTopHalf) {
        const zoomSpeed = 0.01 * size * deltaTime;
        size += scrollDelta * zoomSpeed;
        size = Math.max(0.1, Math.min(size, 10)); // Clamp size between 0.1 and 10

        blockViewCamera.distance = -20 * size; // Adjust camera distance based on size
        blockViewCamera.updateCameraAnchor();
    }

    const bottomRect = {
        left: rect.left,
        right: rect.right,
        top: rect.top + rect.height / 2,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height / 2
    };

    let frontResult = isHovering(mouseX, mouseY, bottomRect, frontFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);
    let backResult = isHovering(mouseX, mouseY, bottomRect, backFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);
    let leftResult = isHovering(mouseX, mouseY, bottomRect, leftFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);
    let rightResult = isHovering(mouseX, mouseY, bottomRect, rightFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);
    let topResult = isHovering(mouseX, mouseY, bottomRect, topFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);
    let bottomResult = isHovering(mouseX, mouseY, bottomRect, bottomFaceModelMatrix, 0.5, 0.5, blockEditCamera.projectionMatrix, editViewMatrix);

    if (frontResult.hovering) {
        hoveringOverFace = 0;
        canvas.style.cursor = 'pointer';
    } else if (backResult.hovering) {
        hoveringOverFace = 1;
        canvas.style.cursor = 'pointer';
    } else if (leftResult.hovering) {
        hoveringOverFace = 2;
        canvas.style.cursor = 'pointer';
    } else if (rightResult.hovering) {
        hoveringOverFace = 3;
        canvas.style.cursor = 'pointer';
    } else if (topResult.hovering) {
        hoveringOverFace = 4;
        canvas.style.cursor = 'pointer';
    } else if (bottomResult.hovering) {
        hoveringOverFace = 5;
        canvas.style.cursor = 'pointer';
    } else {
        hoveringOverFace = null;
        canvas.style.cursor = 'default';
    }
}
window.blockUpdate = blockUpdate;

function blockRender() {
    // 1st pass, 3D rendering of the block
    // 2nd pass, 2D editor rendering of the block

    // no clearing, already done in main.js
    // make the viewport half the size of the canvas on the top top half
    gl.viewport(0, canvas.height / 2, canvas.width, canvas.height / 2);

    gl.useProgram(window.program);

    let modelMatrix = translate(identity(), 0, 0, 0);

    gl.uniformMatrix4fv(structure_uProjectionMatrix, false, blockViewCamera.projectionMatrix);
    gl.uniformMatrix4fv(structure_uViewMatrix, false, blockViewCamera.viewMatrix);
    gl.uniformMatrix4fv(structure_uModelMatrix, false, modelMatrix);
    gl.uniform1i(structure_uAtlasWidth, atlasColumns);
    gl.uniform1i(structure_uAtlasHeight, atlasRows);

    window.textureAtlas.bind();
    blockVao.bind();

    gl.drawElements(gl.TRIANGLES, blockIndexes.length, gl.UNSIGNED_SHORT, 0);

    blockVao.unbind();
    window.textureAtlas.unbind();


    // 2nd pass, render the block editor on the bottom half
    gl.viewport(0, 0, canvas.width, canvas.height / 2);

    gl.useProgram(window.program);

    gl.cullFace(gl.BACK);

    modelMatrix = scale(identity(), editSize);

    gl.uniformMatrix4fv(structure_uProjectionMatrix, false, blockEditCamera.projectionMatrix);
    gl.uniformMatrix4fv(structure_uViewMatrix, false, editViewMatrix);
    gl.uniformMatrix4fv(structure_uModelMatrix, false, modelMatrix);
    gl.uniform1i(structure_uAtlasWidth, atlasColumns);
    gl.uniform1i(structure_uAtlasHeight, atlasRows);

    window.textureAtlas.bind();
    blockEditVao.bind();

    gl.drawElements(gl.TRIANGLES, blockEditIndexes.length, gl.UNSIGNED_SHORT, 0);

    blockEditVao.unbind();
    window.textureAtlas.unbind();

    gl.cullFace(gl.FRONT);

    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.blockRender = blockRender;