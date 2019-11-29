import Program = require( 'nanogl/program' )
import GLArrayBuffer = require( 'nanogl/arraybuffer' )
import GLIndexBuffer = require( 'nanogl/indexbuffer' )


function shimGL( gl : any, ext: OES_vertex_array_object ){
  gl.createVertexArray = function(){ return ext.createVertexArrayOES();};
  gl.bindVertexArray   = function(array : WebGLVertexArrayObjectOES ){ return ext.bindVertexArrayOES  (array);};
  gl.deleteVertexArray = function(array : WebGLVertexArrayObjectOES ){ return ext.deleteVertexArrayOES(array);};
  gl.isVertexArray     = function(array : WebGLVertexArrayObjectOES ){ return ext.isVertexArrayOES    (array);};
}

function isWebgl2(gl: WebGLRenderingContext | WebGL2RenderingContext): gl is WebGL2RenderingContext {
  return (gl as WebGL2RenderingContext).bindVertexArray !== undefined;
}


interface IVaoImplementation {

  dispose() : void;
  setup( prg : Program, buffers : GLArrayBuffer[], indices : GLIndexBuffer ) : void;
  bind() : void;
  unbind() : void;

}



/**
 * @class
 * @classdesc Vao manage attributes pointers setup for given arraybuffer and program
 * It provide a transparent fallback if extension isn't available
 *
 *  @param {WebGLRenderingContext} gl webgl context the vao belongs to
 */



class Vao {

  gl: WebGLRenderingContext | WebGL2RenderingContext;
  _impl: IVaoImplementation;

  constructor( gl : WebGLRenderingContext | WebGL2RenderingContext ){
    this.gl = gl;

    if( isWebgl2(gl) ){
      this._impl = new NativeVao( this );
    } else {
      const ext = gl.getExtension( 'OES_vertex_array_object' );
      if( ext ){
        shimGL( gl, ext );
        this._impl = new NativeVao( this );
      } else {
        this._impl = new EmulateVao( this );
      }
    }

  }



  /**
    * release the internal webgl vao
    */
  dispose(){
    this._impl.dispose();
  }

  /**
   * Initialize attrib pointer setup for given program and arraybuffers
   *   @param {Program} prg the nanogl Program
   *   @param {ArrayBuffer[]} buffers an array of ArrayBuffers containing the attributes
   */
  setup( prg : Program, buffers : GLArrayBuffer[], indices : GLIndexBuffer ){
    if( !prg.ready ){
      prg._grabParameters();
    }
    this._impl.setup( prg, buffers, indices );
  }

  /**
   * Bind the VAO. Call this method before each draw call
   */
  bind(){
    this._impl.bind();
  }


  /**
   * Unbind the VAO. Call this method after each draw call
   */
  unbind(){
    this._impl.unbind();
  }


}


// ---------------------------
//   Native Implementation Webgl1 extension or Webgl2 native
// ---------------------------

class NativeVao {

  _gl : WebGL2RenderingContext;
  _vao: Vao;
  _handle: WebGLVertexArrayObject | null;
  
  
  constructor( vao : Vao ){
    this._vao = vao;
    this._gl = this._vao.gl as WebGL2RenderingContext;
    this._handle = null;
  }



  dispose(){
    this.release();
  }


  setup( prg : Program, buffers : GLArrayBuffer[], indices : GLIndexBuffer ){

    this.release();
    const gl = this._gl;

    this._handle = gl.createVertexArray();
    gl.bindVertexArray( this._handle );

    for (var i = 0; i < buffers.length; i++) {
      buffers[i].attribPointer( prg );
    }

    if( indices !== undefined ){
      indices.bind();
    }

    gl.bindVertexArray( null );
  }


  bind(){
    this._gl.bindVertexArray( this._handle );
  }


  unbind(){
    this._gl.bindVertexArray( null );
  }


  release(){
    if( this._handle ){
      this._gl.deleteVertexArray( this._handle );
      this._handle = null;
    }
  }

}


// ---------------------------
//   Emulation Implementation
// ---------------------------
class EmulateVao {

  _vao: Vao;
  prg: Program | null;
  buffers: GLArrayBuffer[] | null;
  indices: GLIndexBuffer | null;


  constructor( vao : Vao ){
    this._vao = vao;
    this.prg = null;
    this.buffers = null;
    this.indices = null;
  }



  dispose(){
    this.prg = null;
    this.buffers = null;
    this.indices = null;
  }


  setup( prg : Program, buffers : GLArrayBuffer[], indices : GLIndexBuffer ){
    this.prg = prg;
    this.buffers = buffers;
    this.indices = indices;
  }


  bind(){
    if( this.buffers == null || this.prg == null || this.indices == null ) return;

    for (var i = 0; i < this.buffers.length; i++) {
      this.buffers[i].attribPointer( this.prg );
    }
    if( this.indices !== undefined ){
      this.indices.bind();
    }
  }


  unbind(){
    // noop
  }

}


export = Vao