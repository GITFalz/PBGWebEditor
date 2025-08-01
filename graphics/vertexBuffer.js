class VertexBuffer {
    constructor(gl, data, valueType, itemSize, usage = gl.STATIC_DRAW) {
        this.gl = gl;
        this.data = data;
        this.valueType = valueType;
        this.itemSize = itemSize;
        this.usage = usage;

        this.buffer = gl.createBuffer();
        this.bind();
        this.gl.bufferData(gl.ARRAY_BUFFER, new this.valueType(this.data), this.usage);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    updateData(data) {
        this.data = data;
        this.bind();
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new this.valueType(this.data));
    }

    renew(data) {
        this.delete();
        this.data = data;
        this.buffer = this.gl.createBuffer();
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new this.valueType(this.data), this.usage);
    }

    getLocation(program, attributeName) {
        const location = this.gl.getAttribLocation(program, attributeName);
        if (location < 0) {
            console.error(`Attribute ${attributeName} not found in shader program.`);
            return null;
        }
        this.bind();
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, this.itemSize, this.getGLType(), false, 0, 0);
        return location;
    }

    getGLType() {
        switch (this.valueType) {
            case Float32Array: return this.gl.FLOAT;
            case Uint16Array: return this.gl.UNSIGNED_SHORT;
            case Uint8Array:  return this.gl.UNSIGNED_BYTE;
            default:
                throw new Error('Unsupported value type');
        }
    }

    delete() {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }
}

window.VertexBuffer = VertexBuffer;