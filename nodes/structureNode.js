export class StructureNode {
    constructor(name) {
        this.name = name;
        this.children = [];
        this.id = -1;
    }

    addGraphNode(graphNode) {
        this.children.push(graphNode);
    }
}