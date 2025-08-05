function structureUpdate() {
    if (isDragging) {
        structureCamera.yaw += mouseDeltaX * deltaTime * 0.1; // Adjust sensitivity
        structureCamera.pitch -= mouseDeltaY * deltaTime * 0.1; // Adjust sensitivity
        structureCamera.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, structureCamera.pitch)); // clamp

        structureCamera.updateCameraAnchor();
    }

    if (isScrolling) {
        const zoomSpeed = 0.01 * size * deltaTime;
        size += scrollDelta * zoomSpeed;
        size = Math.max(0.1, Math.min(size, 10)); // Clamp size between 0.1 and 10

        structureCamera.distance = -20 * size; // Adjust camera distance based on size
        structureCamera.updateCameraAnchor();
    }
}
window.structureUpdate = structureUpdate;

function structureRender() {
    gl.uniformMatrix4fv(structure_uProjectionMatrix, false, structureCamera.projectionMatrix);
    gl.uniformMatrix4fv(structure_uViewMatrix, false, structureCamera.viewMatrix);

    renderChunks();
}
window.structureRender = structureRender;