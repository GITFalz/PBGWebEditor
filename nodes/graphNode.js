export class GraphNode {
    constructor(name) {
        this.name = name;
        this.children = [];
        this.id = -1;
        this.params = {
            count: 1,
            distanceX: 5,
            distanceY: 5,
            distanceZ: 5
        };
    }

    addPointNode(pointNode) {
        this.children.push(pointNode);
    }
}