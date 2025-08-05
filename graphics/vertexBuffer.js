class VertexBuffer {
    constructor(data, valueType, itemSize, usage = gl.STATIC_DRAW) {
        this.data = data;
        this.valueType = valueType;
        this.itemSize = itemSize;
        this.usage = usage;

        this.buffer = gl.createBuffer();
        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, new this.valueType(this.data), this.usage);
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    updateData(data) {
        this.data = data;
        this.bind();
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new this.valueType(this.data));
    }

    renew(data) {
        this.delete();
        this.data = data;
        this.buffer = gl.createBuffer();
        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, new this.valueType(this.data), this.usage);
    }

    getGLType() {
        switch (this.valueType) {
            case Float32Array: return gl.FLOAT;
            case Uint16Array: return gl.UNSIGNED_SHORT;
            case Uint8Array:  return gl.UNSIGNED_BYTE;
            default:
                throw new Error('Unsupported value type');
        }
    }

    delete() {
        gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}

window.VertexBuffer = VertexBuffer;