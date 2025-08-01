class Block {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.occlusion = 0;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }
}

window.Block = Block;