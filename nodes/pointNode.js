const values = window.values;
const shapes = window.shapes;

export class PointNode {
    constructor(name, type, parent) {
        this.name = name;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rotated = false;
        this.params = {};
        this.effect = 'union';
        this.id = -1;
        this.parent = parent; // Reference to the parent graph node

        this.setDefaultParams(type);
        this.setShapeGetter(type);
    }

    setDefaultParams(type) {
        switch (type) {
            case 'cube':
                this.params = { width: 10, height: 10, depth: 10 };
                break;
            case 'sphere':
                this.params = { radius: 5 };
                break;
            case 'cylinder':
                this.params = { radius: 5, height: 10 };
                break;
            case 'taperedCylinder':
                this.params = { topRadius: 3, bottomRadius: 5, height: 10 };
                break;
            case 'pyramid':
                this.params = { baseWidth: 10, height: 10 };
                break;
            case 'cone':
                this.params = { radius: 5, height: 10 };
                break;
            case 'trianglePrism':
                this.params = { width: 10, height: 10, depth: 10 };
                break;
            // Add more shapes as needed
            default:
                console.error(`Unknown polet type: ${type}`);
                this.params = {};
                break;
        }
    }

    setShapeGetter(type) {
        this.type = type;
        switch (type) {
            case 'cube':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getCube(this.params, this.position);
                    } else {
                        return shapes.getCubeRotated(this.params, this.position, this.rotation);
                    }
                    
                };
                break;
            case 'sphere':
                this.getShapeBlocks = () => {
                    return shapes.getSphere(this.params, this.position);
                };
                break;
            case 'cylinder':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getCylinder(this.params, this.position);
                    } else {
                        return shapes.getCylinderRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            case 'taperedCylinder':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getTaperedCylinder(this.params, this.position);
                    } else {
                        return shapes.getTaperedCylinderRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            case 'pyramid':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getPyramid(this.params, this.position);
                    } else {
                        return shapes.getPyramidRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            case 'cone':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getCone(this.params, this.position);
                    } else {
                        return shapes.getConeRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            case 'cone':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getCone(this.params, this.position);
                    } else {
                        return shapes.getConeRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            case 'trianglePrism':
                this.getShapeBlocks = () => {
                    if (!this.rotated) {
                        return shapes.getTrianglePrism(this.params, this.position);
                    } else {
                        return shapes.getTrianglePrismRotated(this.params, this.position, this.rotation);
                    }
                };
                break;
            default:
                throw new Error(`Unknown polet type: ${type}`);
        }
    }

    applyEffect(blocksA, blockB) {
        switch (this.effect) {
            case 'union':
                return shapes.union(blocksA, blockB);
            case 'intersect':
                return shapes.intersect(blocksA, blockB);
            case 'difference':
                return shapes.difference(blocksA, blockB);
            case 'difference-reverse':
                return shapes.difference(blockB, blocksA);
            case 'symmetric-difference':
                return shapes.symmetricDifference(blocksA, blockB);
            case 'subtract':
                return shapes.subtract(blocksA, blockB);
            case 'subtract-reverse':
                return shapes.subtractReverse(blocksA, blockB);
            default:
                throw new Error(`Unknown effect: ${this.effect}`);
        }
    }


    setElement(element) {
        this.element = element;
    }

    select() {
        if (this.element) {
            this.element.classList.add('default-selected');
        }
    }   

    deselect() {
        if (this.element) {
            this.element.classList.remove('default-selected');
        }
    }

    setType(type) {
        this.type = type;
        this.setDefaultParams(type);
        this.setShapeGetter(type);
    }

    getPosition() {
        return this.position;
    }

    setPosition(x, y, z) {
        this.position = { x, y, z };
    }

    getBlocks() {
        return this.getShapeBlocks();
    }
}