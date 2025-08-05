const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL not supported");
}

// Shaders
function createProgram(gl, vsSource, fsSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Structure shader
const vsSource = `#version 300 es

    in vec3 aPosition;
    in vec2 aTexCoord;
    in ivec3 aData;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;

    out vec2 vTexCoord;
    flat out ivec3 vData;

    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
        vData = aData;
    }
`;

const fsSource = `#version 300 es
    precision mediump float;

    in vec2 vTexCoord;
    flat in ivec3 vData;
    uniform sampler2D uTexture;

    out vec4 outColor;

    void main() {
        int textureIndex = vData.x;
        int atlasWidth = vData.y;
        int atlasHeight = vData.z;
        vec2 texCoord = vTexCoord;

        float tileWidth = 1.0 / float(atlasWidth);
        float tileHeight = 1.0 / float(atlasHeight);
        texCoord.x = texCoord.x * tileWidth + float(textureIndex % atlasWidth) * tileWidth;
        texCoord.y = texCoord.y * tileHeight + float(textureIndex / atlasWidth) * tileHeight;
        vec4 color = texture(uTexture, texCoord);
        if (color.a < 0.1) {
            discard; // Discard transparent pixels
        }
        outColor = color;
    }
`;

const structureShader = createProgram(gl, vsSource, fsSource);
gl.useProgram(structureShader);

const positionLocation = gl.getAttribLocation(structureShader, "aPosition");
const texCoordLocation = gl.getAttribLocation(structureShader, "aTexCoord");
const dataLocation = gl.getAttribLocation(structureShader, "aData");

const structure_uProjectionMatrix = gl.getUniformLocation(structureShader, "uProjectionMatrix");
const structure_uViewMatrix = gl.getUniformLocation(structureShader, "uViewMatrix");
const structure_uModelMatrix = gl.getUniformLocation(structureShader, "uModelMatrix");



// Pixel Art Shader
const pixelArtVsSource = `#version 300 es
    in vec3 aPosition;
    in vec2 aTexCoord;

    out vec2 vTexCoord;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uModelMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
    }
`;

const pixelArtFsSource = `#version 300 es
    precision mediump float;

    in vec2 vTexCoord;

    uniform sampler2D uTexture;
    out vec4 outColor;  

    void main() {
        vec4 color = texture(uTexture, vTexCoord);
        if (color.a < 0.1) {
            discard; // Discard transparent pixels
        }
        outColor = color;
    }
`;

const pixelArtShader = createProgram(gl, pixelArtVsSource, pixelArtFsSource);
gl.useProgram(pixelArtShader);

const pa_positionLocation = gl.getAttribLocation(pixelArtShader, "aPosition");
const pa_texCoordLocation = gl.getAttribLocation(pixelArtShader, "aTexCoord");
const pa_uProjectionMatrix = gl.getUniformLocation(pixelArtShader, "uProjectionMatrix");
const pa_uModelMatrix = gl.getUniformLocation(pixelArtShader, "uModelMatrix");



window.gl = gl;
window.canvas = canvas;
window.canvasWidth = canvas.width;
window.canvasHeight = canvas.height;


window.program = structureShader;

window.positionLocation = positionLocation;
window.texCoordLocation = texCoordLocation;
window.dataLocation = dataLocation;

window.structure_uProjectionMatrix = structure_uProjectionMatrix;
window.structure_uViewMatrix = structure_uViewMatrix;
window.structure_uModelMatrix = structure_uModelMatrix;


window.pixelArtShader = pixelArtShader;

window.pa_positionLocation = pa_positionLocation;
window.pa_texCoordLocation = pa_texCoordLocation;
window.pa_uProjectionMatrix = pa_uProjectionMatrix;
window.pa_uModelMatrix = pa_uModelMatrix;


window.playerPos = [0, 0, 0];


// Start of with structure shader
gl.useProgram(structureShader);