const chunkMap = new Map();

const chunk_height = 16;
const chunk_width = 16;
const chunk_depth = 16;

window.chunkMap = chunkMap;

window.textureAtlas = new Texture({type: 'blank', width: textureWidth, height: textureHeight, format: 'pixelated'})

function generateChunks() {
    chunkMap.clear();
    let blocks = window.generate_graphNodeBlocks();
    blocks.forEach(block => {
        const { x, y, z } = block;
        const chunkX = Math.floor(x / chunk_width) * chunk_width;
        const chunkY = Math.floor(y / chunk_height) * chunk_height;
        const chunkZ = Math.floor(z / chunk_depth) * chunk_depth;
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        if (!chunkMap.has(chunkKey)) {
            chunkMap.set(chunkKey, new Chunk(chunkX, chunkY, chunkZ));
        }
        chunkMap.get(chunkKey).addBlock(block);
    });
}

function reloadChunks() {
    chunkMap.forEach(chunk => {
        chunk.reload();
    });
}

function renderChunks() {
    textureAtlas.bind();

    chunkMap.forEach(chunk => {
        chunk.render();
    });

    textureAtlas.unbind();
}

function clearChunks() {
    chunkMap.forEach(chunk => {
        chunk.clear();
    });
}