function rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ) {
    // Rotate around X
    let y1 = y * cosX - z * sinX;
    let z1 = y * sinX + z * cosX;

    // Rotate around Y
    let x2 = x * cosY + z1 * sinY;
    let z2 = -x * sinY + z1 * cosY;

    // Rotate around Z
    let x3 = x2 * cosZ - y1 * sinZ;
    let y3 = x2 * sinZ + y1 * cosZ;

    return [x3, y3, z2];
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function shape_getCube(params, position) {
    const { width, height, depth } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
            }
        }
    }
    return blocks;
}

function shape_getSphere(params, position) {
    const { radius } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];
    const ceilRadius = Math.ceil(radius);
    for (let x = -ceilRadius; x <= ceilRadius; x++) {
        for (let y = -ceilRadius; y <= ceilRadius; y++) {
            for (let z = -ceilRadius; z <= ceilRadius; z++) {
                if (x * x + y * y + z * z <= radius * radius) {
                    blocks.push(
                        new Block(centerX + x, centerY + y, centerZ + z));
                }
            }
        }
    }
    return blocks;
}

function shape_getCylinder(params, position) {
    const { radius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];
    const ceilRadius = Math.ceil(radius);
    for (let y = 0; y < height; y++) {
        for (let x = -ceilRadius; x <= ceilRadius; x++) {
            for (let z = -ceilRadius; z <= ceilRadius; z++) {
                if (x * x + z * z <= radius * radius) {
                    blocks.push(
                        new Block(centerX + x, centerY + y, centerZ + z));
                }
            }
        }
    }
    return blocks;
}

function shape_getTaperedCylinder(params, position) {
    const { topRadius, bottomRadius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    
    const blocks = [];
    const maxRadius = Math.max(topRadius, bottomRadius);
    const ceilRadius = Math.ceil(maxRadius);
    for (let y = 0; y < height; y++) {
        const t = 1 - (y / height);
        const currentRadius = topRadius + (bottomRadius - topRadius) * t;
        const currentRadiusSq = currentRadius * currentRadius;
        for (let x = -ceilRadius; x <= ceilRadius; x++) {
            for (let z = -ceilRadius; z <= ceilRadius; z++) {
                if (x * x + z * z <= currentRadiusSq) {
                    blocks.push(
                        new Block(centerX + x, centerY + y, centerZ + z));
                }
            }
        }
    }
    return blocks;
}

function shape_getPyramid(params, position) {
    const { baseWidth, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];
    for (let y = 0; y < height; y++) {
        const currentWidth = baseWidth * (1 - (y / height));
        const half = currentWidth / 2;
        const minX = Math.floor(-half);
        const maxX = Math.ceil(half);
        const minZ = Math.floor(-half);
        const maxZ = Math.ceil(half);
        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
            }
        }
    }
    return blocks;
}

function shape_getCone(params, position) {
    const { radius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];
    for (let y = 0; y < height; y++) {
        const currentRadius = radius * (1 - (y / height));
        const rSquared = currentRadius * currentRadius;

        const min = Math.ceil(-currentRadius);
        const max = Math.floor(currentRadius);

        for (let x = min; x <= max; x++) {
            for (let z = min; z <= max; z++) {
                // Test block center within radius
                if (x * x + z * z <= rSquared) {
                    blocks.push(
                        new Block(centerX + x, centerY + y, centerZ + z));
                }
            }
        }
    }
    return blocks;
}

function shape_getTrianglePrism(params, position) {
    const { width, height, depth } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;

    const blocks = [];

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    for (let x = -halfWidth; x <= halfWidth; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = -halfDepth; z <= halfDepth; z++) {
                // For each Y level, shrink the Z span linearly
                const maxZ = (1 - y / height) * halfDepth;
                if (Math.abs(z) <= maxZ) {
                    blocks.push(new Block(centerX + Math.round(x), centerY + Math.round(y), centerZ + Math.round(z)));
                }
            }
        }
    }

    return blocks;
}



function shape_getCube_rotated(params, position, rotation) {
    const { width, height, depth } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blocks = [];

    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;
    const cz = (depth - 1) / 2;

    // Precompute sin/cos for efficiency
    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    for (let x = 0; x < width-0.5; x+=0.5) {
        for (let y = 0; y < height-0.5; y+=0.5) {
            for (let z = 0; z < depth-0.5; z+=0.5) {
                // Center block coordinates
                const lx = x - cx;
                const ly = y - cy;
                const lz = z - cz;

                // Rotate using rotateBlock with precomputed sin/cos
                let [rx, ry, rz] = rotateBlock(lx, ly, lz, sinX, cosX, sinY, cosY, sinZ, cosZ);

                rx += cx; // Translate back to original center
                ry += cy;
                rz += cz;

                // Translate back and round to voxel grid
                blocks.push(new Block(
                    centerX + Math.round(rx),
                    centerY + Math.round(ry),
                    centerZ + Math.round(rz)
                ));
            }
        }
    }

    return blocks;
}

function shape_getCylinder_rotated(params, position, rotation) {
    const { radius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blocks = [];
    const ceilRadius = Math.ceil(radius);

    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    for (let y = 0; y < height-0.5; y+=0.5) {
        for (let x = -ceilRadius+0.5; x <= ceilRadius-0.5; x+=0.5) {
            for (let z = -ceilRadius+0.5; z <= ceilRadius-0.5; z+=0.5) {
                if (x * x + z * z <= radius * radius) {
                    const [rx, ry, rz] = rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ);
                    blocks.push(new Block(centerX + Math.round(rx), centerY + Math.round(ry), centerZ + Math.round(rz)));
                }
            }
        }
    }
    return blocks;
}

function shape_getTaperedCylinder_rotated(params, position, rotation) {
    const { topRadius, bottomRadius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blockSet = new Set();
    const maxRadius = Math.max(topRadius, bottomRadius);
    const ceilRadius = Math.ceil(maxRadius);

    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    // Sub-pixel sampling only where needed (edge detection)
    const samples = 2; // Minimal samples for efficiency
    const step = 1.0 / samples;

    for (let y = 0; y < height; y++) {
        const t = 1 - (y / height);
        const currentRadius = topRadius + (bottomRadius - topRadius) * t;
        const rSq = currentRadius * currentRadius;

        // Slightly expand radius for edge sampling
        const expandedRSq = (currentRadius + 0.7) * (currentRadius + 0.7);

        for (let x = -ceilRadius; x <= ceilRadius; x++) {
            for (let z = -ceilRadius; z <= ceilRadius; z++) {
                const distSq = x * x + z * z;
                
                if (distSq <= rSq) {
                    // Solid interior - just add the main block
                    const [rx, ry, rz] = rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ);
                    blockSet.add(`${centerX + Math.round(rx)},${centerY + Math.round(ry)},${centerZ + Math.round(rz)}`);
                } else if (distSq <= expandedRSq) {
                    // Edge region - sample to fill gaps
                    let hasValidSample = false;
                    for (let sx = 0; sx < samples && !hasValidSample; sx++) {
                        for (let sz = 0; sz < samples && !hasValidSample; sz++) {
                            const testX = x + (sx * step) - 0.25;
                            const testZ = z + (sz * step) - 0.25;
                            
                            if (testX * testX + testZ * testZ <= rSq) {
                                hasValidSample = true;
                                const [rx, ry, rz] = rotateBlock(testX, y, testZ, sinX, cosX, sinY, cosY, sinZ, cosZ);
                                blockSet.add(`${centerX + Math.round(rx)},${centerY + Math.round(ry)},${centerZ + Math.round(rz)}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Convert set back to Block objects
    const blocks = [];
    for (const key of blockSet) {
        const [x, y, z] = key.split(',').map(Number);
        blocks.push(new Block(x, y, z));
    }

    return blocks;
}

function shape_getPyramid_rotated(params, position, rotation) {
    const { baseWidth, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blocks = [];

    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    for (let y = 0; y < height; y++) {
        const w = baseWidth * (1 - (y / height));
        const half = w / 2;
        const minX = Math.floor(-half);
        const maxX = Math.ceil(half);
        const minZ = Math.floor(-half);
        const maxZ = Math.ceil(half);

        for (let x = minX; x <= maxX-0.5; x+=0.5) {
            for (let z = minZ; z <= maxZ-0.5; z+=0.5) {
                const [rx, ry, rz] = rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ);
                blocks.push(new Block(centerX + Math.round(rx), centerY + Math.round(ry), centerZ + Math.round(rz)));
            }
        }
    }
    return blocks;
}

function shape_getCone_rotated(params, position, rotation) {
    const { radius, height } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blocks = [];

    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    for (let y = 0; y < height-0.5; y+=0.5) {
        const r = radius * (1 - (y / height));
        const rSq = r * r;
        const min = Math.ceil(-r);
        const max = Math.floor(r);

        for (let x = min; x <= max-0.5; x+=0.5) {
            for (let z = min; z <= max-0.5; z+=0.5) {
                if (x * x + z * z <= rSq) {
                    const [rx, ry, rz] = rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ);
                    blocks.push(new Block(centerX + Math.round(rx), centerY + Math.round(ry), centerZ + Math.round(rz)));
                }
            }
        }
    }
    return blocks;
}

function shape_getTrianglePrismRotated(params, position, rotation) {
    const { width, height, depth } = params;
    const { x: centerX, y: centerY, z: centerZ } = position;
    const { x: rotX, y: rotY, z: rotZ } = rotation;

    const blocks = [];

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    const sinX = Math.sin(degToRad(rotX)), cosX = Math.cos(degToRad(rotX));
    const sinY = Math.sin(degToRad(rotY)), cosY = Math.cos(degToRad(rotY));
    const sinZ = Math.sin(degToRad(rotZ)), cosZ = Math.cos(degToRad(rotZ));

    for (let x = -halfWidth; x <= halfWidth-0.5; x+=0.5) {
        for (let y = 0; y < height-0.5; y+=0.5) {
            for (let z = -halfDepth; z <= halfDepth-0.5; z+=0.5) {
                // For each Y level, shrink the Z span linearly
                const maxZ = (1 - y / height) * halfDepth;
                if (Math.abs(z) <= maxZ) {
                    const [rx, ry, rz] = rotateBlock(x, y, z, sinX, cosX, sinY, cosY, sinZ, cosZ);
                    blocks.push(new Block(centerX + Math.round(rx), centerY + Math.round(ry), centerZ + Math.round(rz)));
                }
            }
        }
    }

    return blocks;
}




// === Effects ===
function blockKey(block) {
    return `${block.x},${block.y},${block.z}`;
}

function applyUnion(blocksA, blocksB) {
    const result = [...blocksA];
    const seenKeys = new Set(blocksA.map(blockKey));

    blocksB.forEach(blockB => {
        const key = blockKey(blockB);
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            result.push(blockB);
        }
    });

    return result;
}

function applyIntersect(blocksA, blocksB) {
    const setB = new Set(blocksB.map(blockKey));
    return blocksA.filter(block => setB.has(blockKey(block)));
}

function applyDifference(blocksA, blocksB) {
    const setB = new Set(blocksB.map(blockKey));
    return blocksA.filter(block => !setB.has(blockKey(block)));
}

function applySymmetricDifference(blocksA, blocksB) {
    const keyA = new Set(blocksA.map(blockKey));
    const keyB = new Set(blocksB.map(blockKey));

    return [...blocksA, ...blocksB].filter(block => {
        const key = blockKey(block);
        return keyA.has(key) !== keyB.has(key); // XOR logic
    });
}

function applySubtract(blocksA, blocksB) {
    return applyDifference(blocksA, blocksB);
}

function applySubtractReverse(blocksA, blocksB) {
    return applyDifference(blocksB, blocksA);
}

window.shapes = {
    getCube : shape_getCube,
    getSphere : shape_getSphere,
    getCylinder : shape_getCylinder,
    getTaperedCylinder : shape_getTaperedCylinder,
    getPyramid : shape_getPyramid,
    getCone : shape_getCone,
    getTrianglePrism : shape_getTrianglePrism,

    getCubeRotated : shape_getCube_rotated,
    getCylinderRotated : shape_getCylinder_rotated,
    getTaperedCylinderRotated : shape_getTaperedCylinder_rotated,
    getPyramidRotated : shape_getPyramid_rotated,
    getConeRotated : shape_getCone_rotated,
    getTrianglePrismRotated : shape_getTrianglePrismRotated,

	union: applyUnion,
	intersect: applyIntersect,
	difference: applyDifference,
    symmetricDifference: applySymmetricDifference,
	subtract: applySubtract,
	subtractReverse: applySubtractReverse
};