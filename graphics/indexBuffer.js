class IndexBuffer {
    constructor(indices, usage = gl.STATIC_DRAW, IndexType = Uint16Array) {
        this.usage = usage;
        this.IndexType = IndexType;
        this.indices = indices;

        this.buffer = gl.createBuffer();
        this.setData(indices);
    }

    setData(indices) {
        this.indices = indices;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new this.IndexType(indices), this.usage);
    }

    bind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    updateData(indices) {
        this.setData(indices);
    }

    renew(indices) {
        this.delete();
        this.buffer = gl.createBuffer();
        this.setData(indices);
    }

    delete() {
        gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}

window.IndexBuffer = IndexBuffer;