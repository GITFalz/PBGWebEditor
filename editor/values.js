// === Value getter functions ===
function getCubeValues() {
    return {
        width: parseFloat(document.getElementById('cube-width').value),
        height: parseFloat(document.getElementById('cube-height').value),
        depth: parseFloat(document.getElementById('cube-depth').value)
    };
}

function getSphereValues() {
    return {
        radius: parseFloat(document.getElementById('sphere-radius').value)
    };
}

function getCylinderValues() {
    return {
        radius: parseFloat(document.getElementById('cylinder-radius').value),
        height: parseFloat(document.getElementById('cylinder-height').value)
    };
}

function getTaperedCylinderValues() {
    return {
        radiusTop: parseFloat(document.getElementById('taperedCylinder-topRadius').value),
        radiusBottom: parseFloat(document.getElementById('taperedCylinder-bottomRadius').value),
        height: parseFloat(document.getElementById('taperedCylinder-height').value)
    };
} 

function getPyramidValues() {
    return {
        baseWidth: parseFloat(document.getElementById('pyramid-base').value),
        height: parseFloat(document.getElementById('pyramid-height').value)
    };
}

function getConeValues() {
    return {
        radius: parseFloat(document.getElementById('cone-radius').value),
        height: parseFloat(document.getElementById('cone-height').value)
    };
}

function getTrianglePrismValues() {
    return {
        width: parseFloat(document.getElementById('trianglePrism-width').value),
        height: parseFloat(document.getElementById('trianglePrism-height').value),
        depth: parseFloat(document.getElementById('trianglePrism-depth').value)
    };
}

function getOriginValues() {
    return {
        centerX: parseFloat(document.getElementById('center-x').value),
        centerY: parseFloat(document.getElementById('center-y').value),
        centerZ: parseFloat(document.getElementById('center-z').value)
    };
}

// === Setters ===
function setOriginValues(centerX, centerY, centerZ) {
    document.getElementById('center-x').value = centerX;
    document.getElementById('center-y').value = centerY;
    document.getElementById('center-z').value = centerZ;
}

function setRotationValues(rotationX, rotationY, rotationZ) {
    document.getElementById('rotation-x').value = rotationX;
    document.getElementById('rotation-y').value = rotationY;
    document.getElementById('rotation-z').value = rotationZ;
}


function setGraphCount(count) {
    document.getElementById('graph-count').value = count;
}

function setGraphDistance(x, y, z) {
    document.getElementById('graph-distance-x').value = x;
    document.getElementById('graph-distance-y').value = y;
    document.getElementById('graph-distance-z').value = z;
}


// === Export functions for use in other modules ===
window.values = {
    cubeValues: getCubeValues,
    sphereValues: getSphereValues,
    cylinderValues: getCylinderValues,
    taperedCylinderValues: getTaperedCylinderValues,
    pyramidValues: getPyramidValues,
    coneValues: getConeValues,
    originValues: getOriginValues,

    setOriginValues: setOriginValues,
    setRotationValues: setRotationValues,
    setGraphCount: setGraphCount,
    setGraphDistance: setGraphDistance,
};