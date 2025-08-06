class Camera {
    constructor() {
        this.eye = [0, 0, 0];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];
        this.yaw = 0;
        this.pitch = 0;
        this.distance = -20;

        this.projectionMatrix = identity();
        this.viewMatrix = identity();

        this.setProjectionMode("perspective");
    }

    resize() {
        this.setProjectionMode(this.projectionMode);
    }

    update() {
        
    }

    setCameraMode(mode) {
        if (mode === 'anchor') {
            this.cameraUpdate = this.updateCameraAnchor();
        } else if (mode === 'player') {
            this.cameraUpdate = this.updateCameraPlayer();
        }
    }

    setProjectionMode(mode, width = canvas.width, height = canvas.height) {
        this.projectionMode = mode;
        if (mode === 'perspective') {
            this.projectionMatrix = perspective(45 * Math.PI / 180, width / height, 0.1, 1000);
        } else if (mode === 'orthographic') {
            this.projectionMatrix = orthographic(-width / 2, width / 2, -height / 2, height / 2, 0.1, 1000);
        }
    }

    updateCameraAnchor() {
        if (this.projectionMode === 'orthographic') {
            this.eye = [0, 0, 10];
            this.center = [0, 0, 0];
            this.up = [0, 1, 0];
            this.viewMatrix = lookAt(this.eye, this.center, this.up);
            return;
        }

        const x = this.distance * Math.cos(this.pitch) * Math.sin(this.yaw);
        const y = this.distance * Math.sin(this.pitch);
        const z = this.distance * Math.cos(this.pitch) * Math.cos(this.yaw);

        this.eye = [x, y, z];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];

        this.viewMatrix = lookAt(this.eye, this.center, this.up);
    }

    updateCameraPlayer() {
        if (this.projectionMode === 'orthographic') {
            this.eye = [0, 0, 10];
            this.center = [0, 0, 0];
            this.up = [0, 1, 0];
            this.viewMatrix = lookAt(this.eye, this.center, this.up);
            return;
        }

        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);

        const forward = [
            sinYaw * cosPitch,
            sinPitch,
            cosYaw * cosPitch
        ];

        const camOffset = [
            -forward[0] * this.distance,
            -forward[1] * this.distance + 2.0, // Raise a bit
            -forward[2] * this.distance
        ];

        this.eye = [
            playerPos[0] + camOffset[0],
            playerPos[1] + camOffset[1],
            playerPos[2] + camOffset[2]
        ];

        this.center = [
            playerPos[0] + forward[0],
            playerPos[1] + forward[1],
            playerPos[2] + forward[2]
        ];

        this.up = [0, 1, 0];

        this.viewMatrix = lookAt(this.eye, this.center, this.up);
    }
}
window.Camera = Camera;