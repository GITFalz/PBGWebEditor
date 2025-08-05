function perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    return new Float32Array([
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far+near)/(near-far), -1,
        0, 0, (2*far*near)/(near-far), 0
    ]);
}

function orthographic(left, right, bottom, top, near, far) {
    return new Float32Array([
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ]);
}

function identity() {
    return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);
}

function rotateX(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ]);
}

function rotateY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return new Float32Array([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

function scale(m, s) {
    return new Float32Array([
        s, 0, 0, 0,
        0, s, 0, 0,
        0, 0, s, 0,
        0, 0, 0, 1
    ]);
}

function translate(m, x, y, z) {
    const result = m.slice();
    result[12] += x;
    result[13] += y;
    result[14] += z;
    return result;
}


function multiply(a, b) {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; ++i)
        for (let j = 0; j < 4; ++j)
        out[j*4+i] = a[i]*b[j*4] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
    return out;
}

function invert(m) {
    const out = new Float32Array(16);
    const [
        m0, m1, m2, m3,
        m4, m5, m6, m7,
        m8, m9, m10, m11,
        m12, m13, m14, m15
    ] = m;

    const b00 = m0 * m5 - m1 * m4;
    const b01 = m0 * m6 - m2 * m4;
    const b02 = m0 * m7 - m3 * m4;
    const b03 = m1 * m6 - m2 * m5;
    const b04 = m1 * m7 - m3 * m5;
    const b05 = m2 * m7 - m3 * m6;
    const b06 = m8 * m13 - m9 * m12;
    const b07 = m8 * m14 - m10 * m12;
    const b08 = m8 * m15 - m11 * m12;
    const b09 = m9 * m14 - m10 * m13;
    const b10 = m9 * m15 - m11 * m13;
    const b11 = m10 * m15 - m11 * m14;

    const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) return null;
    const invDet = 1 / det;

    out[0]  = ( m5 * b11 - m6 * b10 + m7 * b09) * invDet;
    out[1]  = (-m1 * b11 + m2 * b10 - m3 * b09) * invDet;
    out[2]  = ( m13 * b05 - m14 * b04 + m15 * b03) * invDet;
    out[3]  = (-m9 * b05 + m10 * b04 - m11 * b03) * invDet;

    out[4]  = (-m4 * b11 + m6 * b08 - m7 * b07) * invDet;
    out[5]  = ( m0 * b11 - m2 * b08 + m3 * b07) * invDet;
    out[6]  = (-m12 * b05 + m14 * b02 - m15 * b01) * invDet;
    out[7]  = ( m8 * b05 - m10 * b02 + m11 * b01) * invDet;

    out[8]  = ( m4 * b10 - m5 * b08 + m7 * b06) * invDet;
    out[9]  = (-m0 * b10 + m1 * b08 - m3 * b06) * invDet;
    out[10] = ( m12 * b04 - m13 * b02 + m15 * b00) * invDet;
    out[11] = (-m8 * b04 + m9 * b02 - m11 * b00) * invDet;

    out[12] = (-m4 * b09 + m5 * b07 - m6 * b06) * invDet;
    out[13] = ( m0 * b09 - m1 * b07 + m2 * b06) * invDet;
    out[14] = (-m12 * b03 + m13 * b01 - m14 * b00) * invDet;
    out[15] = ( m8 * b03 - m9 * b01 + m10 * b00) * invDet;

    return out;
}


function lookAt(eye, center, up) {
    const zAxis = normalize(subtract(eye, center));   // Forward
    const xAxis = normalize(cross(up, zAxis));        // Right
    const yAxis = cross(zAxis, xAxis);                // Up (orthogonal)

    return [
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
    ];
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function matLength(v) {
    return Math.sqrt(dot(v, v));
}

function normalize(v) {
    const len = matLength(v);
    return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
}

window.identity = identity;
window.rotateX = rotateX;
window.rotateY = rotateY;
window.scale = scale;
window.translate = translate;
window.multiply = multiply;
window.invert = invert;
window.perspective = perspective;
window.lookAt = lookAt;
window.subtract = subtract;
window.cross = cross;
window.dot = dot;
window.matLength = matLength;
window.normalize = normalize;