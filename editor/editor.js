const structureNodeList = document.getElementById('structure-node-list');
const graphNodeList = document.getElementById('graph-node-list');

const structureNodes = {
    'node-1': {
        name: 'Root',
        children: ['graph-node-1']
    }
};

const graphNodes = {
    'graph-node-1': {
        type: 'shape',
        name: 'Cube',
        children: ['point-node-1']
    }
}

const pointNodes = {
    'point-node-1': {
        type: 'cube',
        name: 'Point 1',
        position: { 
            x: -5, 
            y: -5, 
            z: -5 
        },
        params: {
            width: 10,
            height: 10,
            depth: 10
        },
    }
};

let currentStructureNode = structureNodes['node-1'];
let currentGraphNode = graphNodes['graph-node-1'];
let currentPointNode = pointNodes['point-node-1'];

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
            console.error(`Unknown point type: ${type}`);
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
function renderStructureNode(node) {
    const li = createElement('li', 'structure-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');
    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    return li;
}

// === Render Graph Node ===
function renderGraphNode(node) {
    const li = createElement('li', 'graph-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');
    const childList = createElement('ul', 'point-node-list');

    node.children?.forEach(child => {
        if (pointNodes[child]) {
            const pointNode = pointNodes[child];
            const pointNodeItem = renderPointNode(pointNode);
            childList.appendChild(pointNodeItem);
        }
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    li.appendChild(childList);
    return li;
}

// === Render Point Node ===
function renderPointNode(node) {
    const li = createElement('li', 'point-node-item');
    const nameSpan = createElement('span', 'node-name', node.name);
    const deleteButton = createElement('button', 'delete-node-button');
    const positionSpan = createElement('span', 'node-position');

    li.appendChild(nameSpan);
    li.appendChild(deleteButton);
    li.appendChild(positionSpan);
    return li;
}

// === Init Rendering ===
function initNodes() {
    structureNodeList.innerHTML = '';
    graphNodeList.innerHTML = '';

    Object.keys(structureNodes).forEach(key => {
        const node = structureNodes[key];
        const nodeItem = renderStructureNode(node);
        structureNodeList.appendChild(nodeItem);
    });

    Object.keys(graphNodes).forEach(key => {
        const node = graphNodes[key];
        const nodeItem = renderGraphNode(node);
        graphNodeList.appendChild(nodeItem);
    });
}

// === Display Dynamic Properties ===
function display_currentNodeProperties() {

}

function set_currentGraphNodeType(type) {
    currentGraphNode.type = type;
}

function show_graphNodeShapeProperties() {
    const shapeProps = document.querySelectorAll('.shape-properties');
    shapeProps.forEach(panel => {
        panel.classList.add('hidden');
    });

    const targetPanel = document.getElementById(`${currentGraphNode.type}-shape-properties`);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    }
}




// === Run Initialization ===
initNodes();
display_currentNodeProperties();

document.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (button && button.classList.contains('value-add')) {
    const input = document.getElementById(button.dataset.input);
    if (input) {
      input.stepUp();
    }
    window.sharedMesh.reload();
  } else if (button && button.classList.contains('value-subtract')) {
    const input = document.getElementById(button.dataset.input);
    if (input) {
      input.stepDown();
    }
    window.sharedMesh.reload();
  }
});

document.addEventListener('input', (e) => {
  let input = e.target;
  if (input.parentElement.classList.contains('input-group')) {
    if (input.id === 'shape-type-select') {
      return; // Ignore changes to the shape type select
    }

    if (input.type === 'number') {
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        input.value = value;
        window.sharedMesh.reload();
      }
    }
  }
});

// === Export functions for use in other modules ===
export {
    show_graphNodeShapeProperties,
    set_currentGraphNodeType,
    setCurrentPointType,
};