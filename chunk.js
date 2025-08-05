class Chunk {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.blocks = [];
        this.vao = null;
    }

    addBlock(block) {
        block.x -= this.x;
        block.y -= this.y;
        block.z -= this.z;
        this.blocks.push(block);
    }

    removeBlock(block) {
        const index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
        }
    }

    reload() {
        let faceCount = this.occlusionCheck();
        this.generateMesh(faceCount);
    }

    occlusionCheck() {
        let faceCount = this.blocks.length * 6;
        const blockSet = new Set(this.blocks.map(b => `${b.x},${b.y},${b.z}`));

        this.blocks.forEach(block => {
            const { x, y, z } = block;

            for (let i = 0; i < 6; i++) {
                const offset = window.blockSideOffsets[i];
                const nx = x + offset[0];
                const ny = y + offset[1];
                const nz = z + offset[2];

                if (blockSet.has(`${nx},${ny},${nz}`)) {
                    block.occlusion |= (1 << i);
                    faceCount--;
                }
            }
        });
        return faceCount;
    }

    generateMesh(faceCount) {
        const positions = new Float32Array(faceCount * 4 * 3);
        const uvs = new Float32Array(faceCount * 4 * 2);
        const texture = new Int32Array(faceCount * 4 * 3);
        const indices = new Uint16Array(faceCount * 6);

        let j = 0;
        this.blocks.forEach((block, index) => {
            if (block.occlusion === 63) return; // Skip fully occluded blocks

            const x = block.x;
            const y = block.y;
            const z = block.z;

            for (let i = 0; i < 6; i++) {
            if (block.occlusion & (1 << i)) continue; // Skip occluded sides

            const baseIndex = j * 4;

            // Define vertices for the block face
            const faceVertices = window.blockFaces[i](x, y, z);
            positions.set(faceVertices, baseIndex * 3);
            
            const baseColor = [0.5, 0.6, 0.7];

            // have a uniform color, but change the shadow based on the orientation
            const brightnessByFace = [
                0.9, // Front
                0.6, // Back
                0.75, // Right
                0.65, // Left
                1.0, // Top
                0.4  // Bottom
                ];

            const brightness = brightnessByFace[i];

            const r = baseColor[0] * brightness;
            const g = baseColor[1] * brightness;
            const b = baseColor[2] * brightness;

            // Define uv coordinates for the block face
            const faceUVs = window.blockFaceUVs[i]();
            uvs.set(faceUVs, baseIndex * 2);

            // Define texture data for the block face
            for (let k = 0; k < 4; k++) {
                texture.set([0, 1, 1], (baseIndex + k) * 3);
            }

            // Define indices for the block face
            indices.set([
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            ], j * 6);

            j++;
            }
        });

        let vertexBuffer = new VertexBuffer(positions, Float32Array, 3);
        let uvBuffer = new VertexBuffer(uvs, Float32Array, 2);
        let textureBuffer = new VertexBuffer(texture, Int32Array, 3);
        
        let indexBuffer = new IndexBuffer(indices);

        if (this.vao) {
            this.vao.delete();
        }
        this.vao = new VertexArrayObject(window.gl);

        this.vao.bind();
        
        window.gl.bindBuffer(window.gl.ARRAY_BUFFER, vertexBuffer.buffer);
        window.gl.enableVertexAttribArray(window.positionLocation);
        window.gl.vertexAttribPointer(window.positionLocation, 3, window.gl.FLOAT, false, 0, 0);

        window.gl.bindBuffer(window.gl.ARRAY_BUFFER, uvBuffer.buffer);
        window.gl.enableVertexAttribArray(window.texCoordLocation);
        window.gl.vertexAttribPointer(window.texCoordLocation, 2, window.gl.FLOAT, false, 0, 0);

        window.gl.bindBuffer(window.gl.ARRAY_BUFFER, textureBuffer.buffer);
        window.gl.enableVertexAttribArray(window.dataLocation);
        window.gl.vertexAttribIPointer(window.dataLocation, 3, window.gl.INT, false, 0, 0);

        window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);

        this.vao.unbind();

        this.setPositionBuffer(vertexBuffer);
        this.setUvBuffer(uvBuffer);
        this.setTextureBuffer(textureBuffer);
        this.setIndexBuffer(indexBuffer);
    }

    setPositionBuffer(buffer) {
        if (this.positionBuffer) {
            this.positionBuffer.delete();
        }
        this.positionBuffer = buffer;
    }

    setUvBuffer(buffer) {
        if (this.uvBuffer) {
            this.uvBuffer.delete();
        }
        this.uvBuffer = buffer;
    }

    setTextureBuffer(buffer) {
        if (this.textureBuffer) {
            this.textureBuffer.delete();
        }
        this.textureBuffer = buffer;
    }

    setIndexBuffer(buffer) {
        if (this.indexBuffer) {
            this.indexBuffer.delete();
        }
        this.indexBuffer = buffer;
        this.indexCount = buffer.indices.length;
    }

    clear() {
        if (this.positionBuffer) {
            this.positionBuffer.delete();
            this.positionBuffer = null;
        }
        if (this.uvBuffer) {
            this.uvBuffer.delete();
            this.uvBuffer = null;
        }
        if (this.textureBuffer) {
            this.textureBuffer.delete();
            this.textureBuffer = null;
        }
        if (this.indexBuffer) {
            this.indexBuffer.delete();
            this.indexBuffer = null;
        }
        if (this.vao) {
            this.vao.delete();
            this.vao = null;
        }
        this.blocks = [];
    }

    render() {
        this.vao.bind();

        let modelMatrix = translate(identity(), this.x, this.y, this.z);

        window.gl.uniformMatrix4fv(structure_uModelMatrix, false, modelMatrix);
        window.gl.drawElements(window.gl.TRIANGLES, this.indexCount, window.gl.UNSIGNED_SHORT, 0);

        this.vao.unbind();
    }
}