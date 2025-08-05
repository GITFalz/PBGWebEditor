class Texture {
    // options include:
    // - type: 'blank' or 'load' either a blank texture is create or an image is loaded
    // - image: the image to load if type is 'load'
    // - width: width of the texture if type is 'blank'
    // - height: height of the texture if type is 'blank'
    // - format: 'smooth' or 'pixelated' for the texture filtering
    constructor(options = {}) {
        this.type = options.type || 'blank';
        this.image = options.image || null;
        this.width = options.width || 1;
        this.height = options.height || 1;
        this.format = options.format || 'smooth';
        this.texture = gl.createTexture();

        this.bind();
        if (this.type === 'blank') {
            if (options.pixelData) {
                this.pixelData = options.pixelData;
            } else {
                this.pixelData = new Uint8Array(this.width * this.height * 4);
                for (let i = 0; i < this.pixelData.length; i += 4) {
                    this.pixelData[i] = 255;     // R
                    this.pixelData[i + 1] = 255; // G
                    this.pixelData[i + 2] = 255; // B
                    this.pixelData[i + 3] = 255; // A
                }
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.pixelData);
        } else if (this.type === 'load' && this.image) {
            this.loadImage(this.image);
        }
        this.setFilter();
        this.unbind();
    }

    setPixel(x, y, r, g, b, a = 255) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error('Pixel coordinates out of bounds');
        }
        const index = (y * this.width + x) * 4;
        this.pixelData[index] = r;
        this.pixelData[index + 1] = g;
        this.pixelData[index + 2] = b;
        this.pixelData[index + 3] = a;
    }

    bind() {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    updateTexture() {
        this.bind();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.pixelData);
        this.setFilter();
        this.unbind();
    }

    setFilter() {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.format === 'smooth' ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.format === 'smooth' ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    loadImage(image) {
        const texture = this.texture;
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        const img = new Image();
        img.src = image;
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
    }

    delete() {
        gl.deleteTexture(this.texture);
        this.texture = null;
    }
}
window.Texture = Texture;