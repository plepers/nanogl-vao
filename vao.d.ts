import Program from 'nanogl/program';
import GLArrayBuffer from 'nanogl/arraybuffer';
import GLIndexBuffer from 'nanogl/indexbuffer';
interface IVaoImplementation {
    dispose(): void;
    setup(prg: Program, buffers: GLArrayBuffer[], indices: GLIndexBuffer): void;
    bind(): void;
    unbind(): void;
}
export default class Vao {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    _impl: IVaoImplementation;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    dispose(): void;
    setup(prg: Program, buffers: GLArrayBuffer[], indices: GLIndexBuffer): void;
    bind(): void;
    unbind(): void;
}
export {};
