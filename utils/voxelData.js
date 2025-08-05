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


window.blockFaces = [
  frontFace,
  backFace,
  rightFace,
  leftFace,
  topFace,
  bottomFace
];