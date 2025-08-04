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
        const colors = new Float32Array(faceCount * 4 * 3);
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

            colors.set([
            r, g, b,
            r, g, b,
            r, g, b,
            r, g, b
            ], baseIndex * 3);

            // Define indices for the block face
            indices.set([
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            ], j * 6);

            j++;
            }
        });

        let vertexBuffer = new VertexBuffer(window.gl, positions, Float32Array, 3);
        let colorBuffer = new VertexBuffer(window.gl, colors, Float32Array, 3);
        let indexBuffer = new IndexBuffer(window.gl, indices);

        if (this.vao) {
            this.vao.delete();
        }
        this.vao = new VertexArrayObject(window.gl);

        this.vao.bind();
        
        window.gl.bindBuffer(window.gl.ARRAY_BUFFER, vertexBuffer.buffer);
        window.gl.enableVertexAttribArray(window.positionLocation);
        window.gl.vertexAttribPointer(window.positionLocation, 3, window.gl.FLOAT, false, 0, 0);

        window.gl.bindBuffer(window.gl.ARRAY_BUFFER, colorBuffer.buffer);
        window.gl.enableVertexAttribArray(window.colorLocation);
        window.gl.vertexAttribPointer(window.colorLocation, 3, window.gl.FLOAT, false, 0, 0);

        window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);

        this.vao.unbind();

        this.setPositionBuffer(vertexBuffer);
        this.setColorBuffer(colorBuffer);
        this.setIndexBuffer(indexBuffer);
    }

    setPositionBuffer(buffer) {
        if (this.positionBuffer) {
            this.positionBuffer.delete();
        }
        this.positionBuffer = buffer;
    }

    setColorBuffer(buffer) {
        if (this.colorBuffer) {
            this.colorBuffer.delete();
        }
        this.colorBuffer = buffer;
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
        if (this.colorBuffer) {
            this.colorBuffer.delete();
            this.colorBuffer = null;
        }
        if (this.indexBuffer) {
            this.indexBuffer.delete();
            this.indexBuffer = null;
        }
        this.blocks = [];
    }

    render() {
        this.vao.bind();

        let modelMatrix = translate(identity(), this.x, this.y, this.z);

        window.gl.uniformMatrix4fv(window.uModelMatrix, false, modelMatrix);
        window.gl.drawElements(window.gl.TRIANGLES, this.indexCount, window.gl.UNSIGNED_SHORT, 0);

        this.vao.unbind();
    }
}