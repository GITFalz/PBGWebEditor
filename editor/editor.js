import { StructureNode } from '../nodes/structureNode.js';
import { GraphNode } from '../nodes/graphNode.js';
import { PointNode } from '../nodes/pointNode.js';

const structureNodeList = document.getElementById('structure-node-list');
const graphNodeList = document.getElementById('graph-node-list');

const nodes = {};

let currentStructureNode = null;
let currentGraphNode = null;
let currentPointNode = null;

// === Node functions ===
function setCurrentPointType(type) {
    currentPointNode.type = type;
    switch (type) {
        case 'cube':
            currentPointNode.params = {
                width: 10,
                height: 10,
                depth: 10
            };
            break;
        case 'sphere':
            currentPointNode.params = {
                radius: 5
            };
            break;
        case 'cylinder':
            currentPointNode.params = {
                radius: 5,
                height: 10
            };
            break;
        case 'taperedCylinder':
            currentPointNode.params = {
                radiusTop: 3,
                radiusBottom: 5,
                height: 10
            };
            break;
        case 'pyramid':
            currentPointNode.params = {
                baseWidth: 10,
                height: 10
            };
            break;
        case 'cone':
            currentPointNode.params = {
                radius: 5,
                height: 10
            };
            break;
        default:
            console.error(`Unknown polet type: ${type}`);
            return;
    }
}

// === Utility to create buttons and elements ===
function createElement(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.innerHTML = content;
    return el;
}

// === Render Structure Node ===
function renderStructureNode(node, id) {
    const li = createElement('li', 'structure-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');

    node.id = id;
    li.classList.add(`structure-node-${node.id}`);

    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    return li;
}

// === Render Graph Node ===
function renderGraphNode(node, id) {
    const li = createElement('li', 'graph-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');
    const childList = createElement('ul', 'point-node-list');

    node.id = id;
    li.classList.add(`graph-node-${node.id}`);

    let index = 0;
    node.children.forEach(child => {
        const pointNodeItem = renderPointNode(child, id, index);
        childList.appendChild(pointNodeItem);
        index++;
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    li.appendChild(childList);
    return li;
}

// === Render Polet Node ===
function renderPointNode(node, graphNodeId, id) {
    const li = createElement('li', 'point-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');
    const positionSpan = createElement('span', 'node-position');

    node.id = id;
    li.classList.add(`point-node-${graphNodeId}_${node.id}`);
    li.dataset.id = node.id;
    li.dataset.gid = graphNodeId;
    li.onclick = () => {
        currentGraphNode = node.parent;
        setSelectedPointNode(node);
        display_currentNodeProperties();
        display_graphNodeProperties(currentGraphNode);
    };

    deleteButton.onclick = (e) => {
        e.stopPropagation();
        deletePointNode(deleteButton);
    };

    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    li.appendChild(positionSpan);
    node.setElement(li);
    return li;
}

function generateDefault() {
    let structureNode1 = new StructureNode('Root');
    let graphNode1 = new GraphNode('Graph Node 1');
    let pointNode1 = new PointNode('Polet Node 1', 'cube', graphNode1);

    graphNode1.addPointNode(pointNode1);
    structureNode1.addGraphNode(graphNode1);

    nodes['node-1'] = structureNode1;

    currentStructureNode = structureNode1;
    currentGraphNode = graphNode1;
    currentPointNode = pointNode1;
}

// === Init Rendering ===
function initNodes() {
    // Generate base nodes for testing
    generateDefault();

    structureNodeList.innerHTML = '';
    graphNodeList.innerHTML = '';

    let index = 0;
    Object.keys(nodes).forEach(key => {
        const node = nodes[key];
        const nodeItem = renderStructureNode(node, index);
        structureNodeList.appendChild(nodeItem);
        index++;
    });

    display_structureNodeContent(currentStructureNode);
}

function display_structureNodeContent(structureNode) {
    graphNodeList.innerHTML = '';
    let index = 0;
    structureNode.children.forEach(child => {
        const graphNodeItem = renderGraphNode(child, index);
        graphNodeList.appendChild(graphNodeItem);
        index++;
    });
}

function refresh_graphNodeContent(graphNode) {
    const graphNodeItem = document.querySelector(`.graph-node-${graphNode.id}`);
    const newGraphNodeItem = renderGraphNode(graphNode, graphNode.id);
    if (graphNodeItem) {
        graphNodeItem.replaceWith(newGraphNodeItem); // replaces in-place
    } else {
        graphNodeList.appendChild(newGraphNodeItem); // only append if not found
    }
}

// === Display Dynamic Properties ===
function display_currentNodeProperties() {
    if (!currentPointNode) {
        return;
    }
    display_pointNodeProperties(currentPointNode);
}

function set_currentGraphNodeType(type) {
    currentGraphNode.type = type;
}

function show_graphNodeShapeProperties() {

}

function display_graphNodeProperties(graphNode) {
    refresh_graphNodeValues(graphNode);
}

function refresh_graphNodeValues(graphNode) {
    if (!graphNode) {
        console.error('No graph node provided for values refresh');
        return;
    }

    window.values.setGraphCount(graphNode.params.count); 
    window.values.setGraphDistance(
        graphNode.params.distanceX, 
        graphNode.params.distanceY, 
        graphNode.params.distanceZ
    ); 
}

function display_pointNodeProperties(pointNode) {
    refresh_pointNodePosition(pointNode);
    refresh_pointNodeRotation(pointNode);
    refresh_pointNodeType(pointNode);
}

function refresh_pointNodePosition(pointNode) {
    if (!pointNode) {
        console.error('No polet node provided for position refresh');
        return;
    }

    window.values.setOriginValues(
        pointNode.position.x,
        pointNode.position.y,
        pointNode.position.z
    );
}

function refresh_pointNodeRotation(pointNode) {
    if (!pointNode) {
        console.error('No polet node provided for rotation refresh');
        return;
    }

    let rotate = pointNode.rotated;
    const rotationToggle = document.getElementById('rotation-toggle');
    if (rotationToggle) {
        rotationToggle.checked = rotate;
    } else {
        console.error('Rotation toggle element not found');
    }

    const rotationProperties = document.querySelector('.point-node-rotation-properties');
    if (rotate) {
        rotationProperties.classList.remove('hidden');
    } else {
        rotationProperties.classList.add('hidden');
    }

    window.values.setRotationValues(
        pointNode.rotation.x,
        pointNode.rotation.y,
        pointNode.rotation.z
    );
}

function refresh_pointNodeType(pointNode) {
    if (!pointNode) {
        console.error('No polet node provided for type refresh');
        return;
    }

    const type = pointNode.type;
    const shapeTypeSelect = document.getElementById('shape-type-select');
    if (shapeTypeSelect) {
        shapeTypeSelect.value = type;
    } else {
        console.error('Shape type select element not found');
    }
    const shapeProperties = document.querySelectorAll('.shape-properties');
    shapeProperties.forEach(prop => {
        prop.classList.add('hidden');
    });
    const shapeProperty = document.getElementById(`${type}-shape-properties`);
    if (shapeProperty) {
        shapeProperty.classList.remove('hidden');
        const inputGroups = shapeProperty.querySelectorAll('.input-group');
        inputGroups.forEach(group => {
            const target = group.dataset.target;
            const params = group.dataset.params;
            const input = document.getElementById(`${type}-${params}`);
            if (input) {
                input.value = pointNode.params[params];
            } else {
                console.error(`Input with ID ${type}-${params} not found.`);
            }
        });
    }
}



function setSelectedPointNode(pointNode, element) {
    currentPointNode.deselect();
    currentPointNode = pointNode;
    currentPointNode.select();
}




// === Editor Buttons ===
function addPointNode() {
    let newPointNode = new PointNode(`Polet Node ${currentGraphNode.children.length + 1}`, 'cube', currentGraphNode);
    currentGraphNode.addPointNode(newPointNode);
    refresh_graphNodeContent(currentGraphNode);
    reloadMesh();
    setSelectedPointNode(newPointNode);
    display_currentNodeProperties();
}
window.addPointNode = addPointNode;

function deletePointNode(element) {
    let id = element.closest('li').dataset.id;
    let graphNodeId = element.closest('li').dataset.gid;
    let graphNode = currentStructureNode.children.find(node => node.id === parseInt(graphNodeId));
    if (!graphNode) {
        console.error(`Graph node with ID ${graphNodeId} not found.`);
        return;
    }
    let pointNodeIndex = graphNode.children.findIndex(node => node.id === parseInt(id));
    if (pointNodeIndex === -1) {
        console.error(`Polet node with ID ${id} not found in graph node ${graphNode.name}.`);
        return;
    }
    graphNode.children.splice(pointNodeIndex, 1);
    refresh_graphNodeContent(graphNode);
    if (graphNode.children.length > 0) {
        setSelectedPointNode(graphNode.children[0]);
    }
    else {
        currentPointNode = null;
    }
    display_currentNodeProperties();
    reloadMesh();
}
window.deletePointNode = deletePointNode;

function addGraphNode() {
    let newGraphNode = new GraphNode(`Graph Node ${currentStructureNode.children.length + 1}`);
    currentStructureNode.addGraphNode(newGraphNode);
    display_structureNodeContent(currentStructureNode);
    refresh_graphNodeContent(newGraphNode);
    currentGraphNode = newGraphNode;
    display_currentNodeProperties();
}
window.addGraphNode = addGraphNode;

function toggleRotationProperties(element) {
    let checked = element.checked;
    const rotationProperties = document.querySelector('.point-node-rotation-properties');
    if (checked) {
        rotationProperties.classList.remove('hidden');
        currentPointNode.rotated = true;
    } else {
        rotationProperties.classList.add('hidden');
        currentPointNode.rotated = false;
    }
    reloadMesh();
}
window.toggleRotationProperties = toggleRotationProperties;

function togglePointNodeProperties(element) {
    const propertiesContent = document.querySelector('.point-node-properties-panel');
    let checked = element.checked;
    if (checked) {
        propertiesContent.classList.remove('hidden');
    }
    else {
        propertiesContent.classList.add('hidden');
    }
}
window.togglePointNodeProperties = togglePointNodeProperties;

function toggleGraphNodeProperties(element) {
    const propertiesContent = document.querySelector('.graph-node-properties-panel');
    let checked = element.checked;
    if (checked) {
        propertiesContent.classList.remove('hidden');
    }
    else {
        propertiesContent.classList.add('hidden');
    }
}
window.toggleGraphNodeProperties = toggleGraphNodeProperties;



// === Block Generation ===
function generate_graphNodeBlocks() {
    const blocks = [];
    const seen = new Set();

    currentStructureNode.children.forEach(child => {
        if (child.children.length === 0) {
            return;
        }

        const onlyBlocks = child.children[0].getBlocks();
        let count = child.params.count || 1;
        let distanceX = child.params.distanceX || 0;
        let distanceY = child.params.distanceY || 0;
        let distanceZ = child.params.distanceZ || 0;

        if (child.children.length === 1) {
            for (let i = 0; i < count; i++) {
                let dx = i * distanceX;
                let dy = i * distanceY;
                let dz = i * distanceZ;

                onlyBlocks.forEach(block => {
                    const key = `${block.x + dx},${block.y + dy},${block.z + dz}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        blocks.push(new Block(block.x + dx, block.y + dy, block.z + dz));
                    }
                });
            }
            return;
        } else {
            let totalBlocks = [];
            let totalSeen = new Set();

            let previousBlocks = child.children[0].getBlocks();
            child.children.slice(1).forEach(pointNode => {
                let newBlocks = pointNode.getBlocks();
                pointNode.applyEffect(previousBlocks, newBlocks).forEach(block => {
                    const key = `${block.x},${block.y},${block.z}`;
                    if (!totalSeen.has(key)) {
                        totalSeen.add(key);
                        totalBlocks.push(block);
                    }
                });
                previousBlocks = newBlocks;
            });

            for (let i = 0; i < count; i++) {
                let dx = i * distanceX;
                let dy = i * distanceY;
                let dz = i * distanceZ;

                totalBlocks.forEach(block => {
                    const key = `${block.x + dx},${block.y + dy},${block.z + dz}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        blocks.push(new Block(block.x + dx, block.y + dy, block.z + dz));
                    }
                });
            }         
        }
    });

    return blocks;
}
window.generate_graphNodeBlocks = generate_graphNodeBlocks;


// === Run Initialization ===
initNodes();
display_currentNodeProperties();
setSelectedPointNode(currentGraphNode.children[0]);

document.addEventListener('click', (e) => {
    if (!e.target.closest('.structure-right-panel'))
        return;

    const button = e.target.closest('button');
    if (button && button.classList.contains('value-add')) {
        const input = document.getElementById(button.dataset.input);
        if (input) {
        input.stepUp();
        }

        let target = button.closest('.input-group').dataset.target;
        let params = button.closest('.input-group').dataset.params;
        currentPointNode[target][params] = parseFloat(input.value);

        reloadMesh();
    } else if (button && button.classList.contains('value-subtract')) {
        const input = document.getElementById(button.dataset.input);
        if (input) {
        input.stepDown();
        }

        let target = button.closest('.input-group').dataset.target;
        let params = button.closest('.input-group').dataset.params;
        currentPointNode[target][params] = parseFloat(input.value);

        reloadMesh();
    }
});

document.addEventListener('input', (e) => {
    if (!e.target.closest('.structure-right-panel'))
        return;

    let input = e.target;
    if (input.parentElement.classList.contains('input-group')) {
        if (input.id === 'shape-type-select') {
            return; // Ignore changes to the shape type select
        }

        if (input.type === 'number') {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                let target = input.closest('.input-group').dataset.target;
                let params = input.closest('.input-group').dataset.params;
                currentPointNode[target][params] = value;
                input.value = value;
                reloadMesh();
            }
        }
    }
    if (input.parentElement.classList.contains('graph-input-group')) {
        let inputGroup = input.closest('.graph-input-group');
        let target = inputGroup.dataset.target;
        let params = inputGroup.dataset.params;
        if (input.type === 'number') {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                currentGraphNode[target][params] = value;
                input.value = value;
                refresh_graphNodeContent(currentGraphNode);
                reloadMesh();
            }
        }
    }
});

document.addEventListener('change', (e) => {
    if (!e.target.closest('.structure-right-panel'))
        return;
    
    if (e.target.id === 'shape-type-select') {
        currentPointNode.setType(e.target.value);
        set_currentGraphNodeType(e.target.value);
        display_currentNodeProperties();
        reloadMesh();
    }
    if (e.target.id === 'shape-effect-select') {
        currentPointNode.effect = e.target.value;
        reloadMesh();
    }
});

function reloadMesh() {
    clearChunks();
    generateChunks();
    reloadChunks();
}

// === Export functions for use in other modules ===
export {
    show_graphNodeShapeProperties,
    set_currentGraphNodeType,
    setCurrentPointType,
    generate_graphNodeBlocks,
};