let structureLeftPanel = document.getElementById('structure-left-panel');
let pixelArtLeftPanel = document.getElementById('texture-left-panel');

let structureRightPanel = document.getElementById('structure-right-panel');
let pixelArtRightPanel = document.getElementById('pixel-art-right-panel');

let textureActionPanel = document.getElementById('texture-action-panel');

pixelArtLeftPanel.classList.add('hidden');
structureLeftPanel.classList.remove('hidden');

pixelArtRightPanel.classList.add('hidden');
structureRightPanel.classList.remove('hidden');

let structureButton = document.getElementById('structure-button');
let pixelArtButton = document.getElementById('texture-button');
let blockButton = document.getElementById('block-button');

structureButton.addEventListener('click', () => {
    setRenderType('structure');
    structureRightPanel.classList.remove('hidden');
    pixelArtRightPanel.classList.add('hidden');
    structureLeftPanel.classList.remove('hidden');
    pixelArtLeftPanel.classList.add('hidden');

    structureButton.classList.add('selected');
    pixelArtButton.classList.remove('selected');
    blockButton.classList.remove('selected');
});

pixelArtButton.addEventListener('click', () => {
    setRenderType('pixelArt');
    structureRightPanel.classList.add('hidden');
    pixelArtRightPanel.classList.remove('hidden');
    structureLeftPanel.classList.add('hidden');
    pixelArtLeftPanel.classList.remove('hidden');

    structureButton.classList.remove('selected');
    pixelArtButton.classList.add('selected');
    blockButton.classList.remove('selected');
});