const values = window.values;
const shapes = window.shapes;

class Mesh {
    constructor(name) {
        this.name = name;
        this.positionBuffer = null;
        this.colorBuffer = null;
        this.indexBuffer = null;
        this.indexCount = 0;
        this.getShapeBlocks = () => {
            let cubeValues = values.cubeValues();
            let originValues = values.originValues();
            return shapes.getCube(
                cubeValues.width,
                cubeValues.height,
                cubeValues.depth,
                originValues.centerX,
                originValues.centerY,
                originValues.centerZ
            );
        };
    }

    setPositionBuffer(buffer) {
        this.positionBuffer = buffer;
    }

    setColorBuffer(buffer) {
        this.colorBuffer = buffer;
    }

    setIndexBuffer(buffer) {
        this.indexBuffer = buffer;
        this.indexCount = buffer.indices.length;
    }

    setShapeGetter(name) {
        switch (name) {
            case 'cube':
                this.getShapeBlocks = () => {
                let cubeValues = values.cubeValues();
                let originValues = values.originValues();
                return shapes.getCube(
                    cubeValues.width,
                    cubeValues.height,
                    cubeValues.depth,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            case 'sphere':
                this.getShapeBlocks = () => {
                let sphereValues = values.sphereValues();
                let originValues = values.originValues();
                return shapes.getSphere(
                    sphereValues.radius,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            case 'cylinder':
                this.getShapeBlocks = () => {
                let cylinderValues = values.cylinderValues();
                let originValues = values.originValues();
                return shapes.getCylinder(
                    cylinderValues.radius,
                    cylinderValues.height,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            case 'taperedCylinder':
                this.getShapeBlocks = () => {
                let taperedCylinderValues = values.taperedCylinderValues();
                let originValues = values.originValues();
                return shapes.getTaperedCylinder(
                    taperedCylinderValues.radiusTop,
                    taperedCylinderValues.radiusBottom,
                    taperedCylinderValues.height,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            case 'pyramid':
                this.getShapeBlocks = () => {
                let pyramidValues = values.pyramidValues();
                let originValues = values.originValues();
                return shapes.getPyramid(
                    pyramidValues.baseWidth,
                    pyramidValues.height,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            case 'cone':
                this.getShapeBlocks = () => {
                let coneValues = values.coneValues();
                let originValues = values.originValues();
                return shapes.getCone(
                    coneValues.radius,
                    coneValues.height,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
                }
                break;
            default:
                console.error('Unknown shape type:', e.target.value);
                this.getShapeBlocks = () => {
                let cubeValues = values.cubeValues();
                let originValues = values.originValues();
                return shapes.getCube(
                    cubeValues.width,
                    cubeValues.height,
                    cubeValues.depth,
                    originValues.centerX,
                    originValues.centerY,
                    originValues.centerZ
                );
            }
        }
    }

    reload() {
        const blocks = window.generate_graphNodeBlocks();
        let faceCount = this.occlusionCheck(blocks);
        this.generateMesh(blocks, faceCount);
    }

    occlusionCheck(blocks) {
        let faceCount = blocks.length * 6;
        const blockSet = new Set(blocks.map(b => `${b.x},${b.y},${b.z}`));

        blocks.forEach(block => {
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

    generateMesh(blocks, faceCount) {
        const positions = new Float32Array(faceCount * 4 * 3);
        const colors = new Float32Array(faceCount * 4 * 3);
        const indices = new Uint16Array(faceCount * 6);

        let j = 0;
        blocks.forEach((block, index) => {
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

            // have a uniform color, but change the shadow based on the orientation
            let brightness = 1.0;
            if (i === 0) brightness = 0.8; // Front face
            else if (i === 1) brightness = 0.6; // Back face
            else if (i === 2) brightness = 0.9; // Right face
            else if (i === 3) brightness = 0.7; // Left face
            else if (i === 4) brightness = 1.0; // Top face
            else if (i === 5) brightness = 0.4; // Bottom face

            colors.set([
                brightness, 1, brightness, // RGB
                brightness, brightness, 1,
                1, 1, brightness,
                brightness, brightness, 1
            ], baseIndex * 3);

            // Define indices for the block face
            indices.set([
                baseIndex, baseIndex + 1, baseIndex + 2,
                baseIndex, baseIndex + 2, baseIndex + 3
            ], j * 6);

            j++;
            }
        });

        let vertexBuffer = new VertexBuffer(positions, Float32Array, 3);
        let colorBuffer = new VertexBuffer(colors, Float32Array, 3);
        let indexBuffer = new IndexBuffer(indices);

        vertexBuffer.getLocation(window.program, "aPosition");
        colorBuffer.getLocation(window.program, "aColor");
        indexBuffer.bind();

        this.setPositionBuffer(vertexBuffer);
        this.setColorBuffer(colorBuffer);
        this.setIndexBuffer(indexBuffer);
    }
}

window.sharedMesh = new Mesh("GlobalMesh");
window.Mesh = Mesh;