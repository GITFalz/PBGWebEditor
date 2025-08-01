class IndexBuffer {
    constructor(gl, indices, usage = gl.STATIC_DRAW, IndexType = Uint16Array) {
        this.gl = gl;
        this.usage = usage;
        this.IndexType = IndexType;
        this.indices = indices;

        this.buffer = gl.createBuffer();
        this.setData(indices);
    }

    setData(indices) {
        this.indices = indices;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new this.IndexType(indices), this.usage);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    updateData(indices) {
        this.setData(indices);
    }

    renew(indices) {
        this.delete();
        this.buffer = this.gl.createBuffer();
        this.setData(indices);
    }

    delete() {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}

window.IndexBuffer = IndexBuffer;