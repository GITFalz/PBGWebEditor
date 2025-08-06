window.blockSideOffsets = [
  [0, 0, 1], // Front
  [0, 0, -1], // Back
  [1, 0, 0], // Right
  [-1, 0, 0], // Left
  [0, 1, 0], // Top
  [0, -1, 0] // Bottom
];

window.blockFaceUVs = [
  () => [1, 1, 0, 1, 0, 0, 1, 0],  // Front (flipped H+V)
  () => [0, 0, 1, 0, 1, 1, 0, 1],  // Back (normal)
  () => [0, 0, 1, 0, 1, 1, 0, 1],  // Right (normal)
  () => [1, 1, 0, 1, 0, 0, 1, 0],  // Left (flipped H+V)
  () => [0, 0, 1, 0, 1, 1, 0, 1],  // Top (normal)
  () => [0, 0, 1, 0, 1, 1, 0, 1]   // Bottom (normal)
];

const frontFace = (x, y, z) => [
  x, y + 1, z + 1,
  x + 1, y + 1, z + 1,
  x + 1, y, z + 1,
  x, y, z + 1
];

const backFace = (x, y, z) => [
  x, y, z,
  x + 1, y, z,
  x + 1, y + 1, z,
  x, y + 1, z
];

const rightFace = (x, y, z) => [
  x + 1, y, z,
  x + 1, y, z + 1,
  x + 1, y + 1, z + 1,
  x + 1, y + 1, z
];

const leftFace = (x, y, z) => [
  x, y + 1, z,
  x, y + 1, z + 1,
  x, y, z + 1,
  x, y, z
];

const topFace = (x, y, z) => [
  x, y + 1, z,
  x + 1, y + 1, z,
  x + 1, y + 1, z + 1,
  x, y + 1, z + 1
];

const bottomFace = (x, y, z) => [
  x, y, z + 1,
  x + 1, y, z + 1,
  x + 1, y, z,
  x, y, z
];

window.getBlockPositions = (x, y, z) => {
  let positions = [
    ...frontFace(x, y, z),
    ...backFace(x, y, z),
    ...rightFace(x, y, z),
    ...leftFace(x, y, z),
    ...topFace(x, y, z),
    ...bottomFace(x, y, z)
  ];
  return positions;
};

window.blockFaces = [
  frontFace,
  backFace,
  rightFace,
  leftFace,
  topFace,
  bottomFace
];
let positions = [
    -0.5, -0.5, -1.0,
     0.5, -0.5, -1.0,
     0.5,  0.5, -1.0,
    -0.5,  0.5, -1.0
];

window.getFlatFace = (x, y, z) => backFace(x, y, z);

function getMouseNDC(mouseX, mouseY, viewportRect) {
    const x = (2 * (mouseX - viewportRect.left)) / viewportRect.width - 1;
    const y = 1 - (2 * (mouseY - viewportRect.top)) / viewportRect.height;
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

function isHovering(mouseX, mouseY, viewportRect, modelMatrix, halfWidth, halfHeight, projectionMatrix, viewMatrix) {
    const [ndcX, ndcY] = getMouseNDC(mouseX, mouseY, viewportRect);
    const [wx, wy] = unprojectOrtho(ndcX, ndcY, multiply(projectionMatrix, viewMatrix));
    const modelPos = worldToModel([wx, wy, 0], modelMatrix);

    // Check if inside [-textureHalfWidth, textureHalfWidth] in X and Y in model space
    return { 
        hovering: modelPos[0] >= -halfWidth && modelPos[0] <= halfWidth && modelPos[1] >= -halfHeight && modelPos[1] <= halfHeight,
        x: (modelPos[0] + halfWidth) / (2 * halfWidth),
        y: (modelPos[1] + halfHeight) / (2 * halfHeight)
    };
}

window.isHovering = isHovering;