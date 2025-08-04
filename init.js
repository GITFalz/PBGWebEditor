const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL not supported");
}

// Shaders
const vsSource = `#version 300 es

  in vec3 aPosition;
  in vec3 aColor;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  out vec3 vColor;

  void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vColor = aColor;
  }
`;

const fsSource = `#version 300 es
  precision mediump float;

  in vec3 vColor;
  out vec4 outColor;

  void main() {
    outColor = vec4(vColor, 1.0);
  }
`;

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

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

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getAttribLocation(program, "aColor");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");


window.gl = gl;
window.program = program;
window.canvas = canvas;
window.positionLocation = positionLocation;
window.colorLocation = colorLocation;
window.uProjectionMatrix = uProjectionMatrix;
window.uViewMatrix = uViewMatrix;
window.uModelMatrix = uModelMatrix;