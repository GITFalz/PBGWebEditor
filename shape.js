function shape_getCube(width, height, depth, centerX, centerY, centerZ) {
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

function shape_getSphere(radius, centerX, centerY, centerZ) {
  const blocks = [];
  const ceilRadius = Math.ceil(radius);
  for (let x = -ceilRadius; x <= ceilRadius; x++) {
    for (let y = -ceilRadius; y <= ceilRadius; y++) {
      for (let z = -ceilRadius; z <= ceilRadius; z++) {
        if (x * x + y * y + z * z <= radius * radius) {
          blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
        }
      }
    }
  }
  return blocks;
}

function shape_getCylinder(radius, height, centerX, centerY, centerZ) {
  const blocks = [];
  const ceilRadius = Math.ceil(radius);
  for (let y = 0; y < height; y++) {
    for (let x = -ceilRadius; x <= ceilRadius; x++) {
      for (let z = -ceilRadius; z <= ceilRadius; z++) {
        if (x * x + z * z <= radius * radius) {
          blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
        }
      }
    }
  }
  return blocks;
}

function shape_getTaperedCylinder(radiusTop, radiusBottom, height, centerX, centerY, centerZ) {
  const blocks = [];
  const maxRadius = Math.max(radiusTop, radiusBottom);
  const ceilRadius = Math.ceil(maxRadius);
  for (let y = 0; y < height; y++) {
    const t = 1 - (y / height);
    const currentRadius = radiusTop + (radiusBottom - radiusTop) * t;
    const currentRadiusSq = currentRadius * currentRadius;
    for (let x = -ceilRadius; x <= ceilRadius; x++) {
      for (let z = -ceilRadius; z <= ceilRadius; z++) {
        if (x * x + z * z <= currentRadiusSq) {
          blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
        }
      }
    }
  }
  return blocks;
}

function shape_getPyramid(baseWidth, height, centerX, centerY, centerZ) {
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

function shape_getCone(radius, height, centerX, centerY, centerZ) {
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
          blocks.push(new Block(centerX + x, centerY + y, centerZ + z));
        }
      }
    }
  }
  return blocks;
}

window.shapes = {
  getCube: shape_getCube,
  getSphere: shape_getSphere,
  getCylinder: shape_getCylinder,
  getTaperedCylinder: shape_getTaperedCylinder,
  getPyramid: shape_getPyramid,
  getCone: shape_getCone
};