class VertexArrayObject {
    constructor() {
        this.vao = gl.createVertexArray();
        this.bind();
    }

    bind() {
        gl.bindVertexArray(this.vao);
    }

    unbind() {
        gl.bindVertexArray(null);
    }

    delete() {
        gl.deleteVertexArray(this.vao);
    }
}
window.VertexArrayObject = VertexArrayObject;