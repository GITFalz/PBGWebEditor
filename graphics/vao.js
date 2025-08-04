class VertexArrayObject {
    constructor(gl) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.bind();
    }

    bind() {
        this.gl.bindVertexArray(this.vao);
    }

    unbind() {
        this.gl.bindVertexArray(null);
    }

    delete() {
        this.gl.deleteVertexArray(this.vao);
    }
}
window.VertexArrayObject = VertexArrayObject;