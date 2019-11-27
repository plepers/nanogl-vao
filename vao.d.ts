import Program = require('nanogl/program');
import GLArrayBuffer = require('nanogl/arraybuffer');
import GLIndexBuffer = require('nanogl/indexbuffer');
interface IVaoImplementation {
    dispose(): void;
    setup(prg: Program, buffers: GLArrayBuffer[], indices: GLIndexBuffer): void;
    bind(): void;
    unbind(): void;
}
declare class Vao {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    _impl: IVaoImplementation;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    dispose(): void;
    setup(prg: Program, buffers: GLArrayBuffer[], indices: GLIndexBuffer): void;
    bind(): void;
    unbind(): void;
}
export = Vao;
