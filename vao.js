"use strict";
function shimGL(gl, ext) {
    gl.createVertexArray = function () { return ext.createVertexArrayOES(); };
    gl.bindVertexArray = function (array) { return ext.bindVertexArrayOES(array); };
    gl.deleteVertexArray = function (array) { return ext.deleteVertexArrayOES(array); };
    gl.isVertexArray = function (array) { return ext.isVertexArrayOES(array); };
}
function isWebgl2(gl) {
    return gl.bindVertexArray !== undefined;
}
class Vao {
    constructor(gl) {
        this.gl = gl;
        if (isWebgl2(gl)) {
            this._impl = new NativeVao(this);
        }
        else {
            const ext = gl.getExtension('OES_vertex_array_object');
            if (ext) {
                shimGL(gl, ext);
                this._impl = new NativeVao(this);
            }
            else {
                this._impl = new EmulateVao(this);
            }
        }
    }
    dispose() {
        this._impl.dispose();
    }
    setup(prg, buffers, indices) {
        if (!prg.ready) {
            prg._grabParameters();
        }
        this._impl.setup(prg, buffers, indices);
    }
    bind() {
        this._impl.bind();
    }
    unbind() {
        this._impl.unbind();
    }
}
class NativeVao {
    constructor(vao) {
        this._vao = vao;
        this._gl = this._vao.gl;
        this._handle = null;
    }
    dispose() {
        this.release();
    }
    setup(prg, buffers, indices) {
        this.release();
        const gl = this._gl;
        this._handle = gl.createVertexArray();
        gl.bindVertexArray(this._handle);
        for (var i = 0; i < buffers.length; i++) {
            buffers[i].attribPointer(prg);
        }
        if (indices !== undefined) {
            indices.bind();
        }
        gl.bindVertexArray(null);
    }
    bind() {
        this._gl.bindVertexArray(this._handle);
    }
    unbind() {
        this._gl.bindVertexArray(null);
    }
    release() {
        if (this._handle) {
            this._gl.deleteVertexArray(this._handle);
            this._handle = null;
        }
    }
}
class EmulateVao {
    constructor(vao) {
        this._vao = vao;
        this.prg = null;
        this.buffers = null;
        this.indices = null;
    }
    dispose() {
        this.prg = null;
        this.buffers = null;
        this.indices = null;
    }
    setup(prg, buffers, indices) {
        this.prg = prg;
        this.buffers = buffers;
        this.indices = indices;
    }
    bind() {
        if (this.buffers == null || this.prg == null || this.indices == null)
            return;
        for (var i = 0; i < this.buffers.length; i++) {
            this.buffers[i].attribPointer(this.prg);
        }
        if (this.indices !== undefined) {
            this.indices.bind();
        }
    }
    unbind() {
    }
}
module.exports = Vao;
