

function shimGL( gl, ext ){
  gl.bindVertexArray   = function(){ return ext.bindVertexArrayOES  .apply( ext, arguments );};
  gl.createVertexArray = function(){ return ext.createVertexArrayOES.apply( ext, arguments );};
  gl.deleteVertexArray = function(){ return ext.deleteVertexArrayOES.apply( ext, arguments );};
  gl.isVertexArray     = function(){ return ext.isVertexArrayOES    .apply( ext, arguments );};
}

/**
 * @class
 * @classdesc Vao manage attributes pointers setup for given arraybuffer and program
 * It provide a transparent fallback if extension isn't available
 *
 *  @param {WebGLRenderingContext} gl webgl context the vao belongs to
 */
function Vao( gl ){
  this.gl = gl;


  if( gl.bindVertexArray !== undefined ){
    this._impl = new NativeVao( this );
  } else {
    var ext = gl.getExtension( 'OES_vertex_array_object' );
    if( ext ){
      shimGL( gl, ext );
      this._impl = new NativeVao( this );
    } else {
      this._impl = new EmulateVao( this );
    }
  }

}


Vao.prototype = {

  /**
    * release the internal webgl vao
    */
  dispose : function(){
    this._impl.dispose();
    this._impl = null;
  },

  /**
   * Initialize attrib pointer setup for given program and arraybuffers
   *   @param {Program} prg the nanogl Program
   *   @param {ArrayBuffer[]} buffers an array of ArrayBuffers containing the attributes
   */
  setup : function( prg, buffers, indices ){
    if( !prg.ready ){
      prg._grabParameters();
    }
    this._impl.setup( prg, buffers, indices );
  },

  /**
   * Bind the VAO. Call this method before each draw call
   */
  bind : function(){
    this._impl.bind();
  },


  /**
   * Unbind the VAO. Call this method after each draw call
   */
  unbind : function(){
    this._impl.unbind();
  }


};


// ---------------------------
//   Native Implementation Webgl1 extension or Webgl2 native
// ---------------------------

function NativeVao( vao ){
  this._vao = vao;
  this._handle = null;
}

NativeVao.prototype = {


  dispose : function(){
    this.release();
    this._vao = null;
  },


  setup : function( prg, buffers, indices ){
    this.release();
    var gl = this._vao.gl;

    this._handle = gl.createVertexArray();
    gl.bindVertexArray( this._handle );

    for (var i = 0; i < buffers.length; i++) {
      buffers[i].attribPointer( prg );
    }

    if( indices !== undefined ){
      indices.bind();
    }

    gl.bindVertexArray( null );
  },


  bind : function(){
    this._vao.gl.bindVertexArray( this._handle );
  },


  unbind : function(){
    this._vao.gl.bindVertexArray( null );
  },


  release : function(){
    if( this._handle ){
      this._vao.gl.deleteVertexArray( this._handle );
      this._handle = null;
    }
  }



};


// ---------------------------
//   Emulation Implementation
// ---------------------------

function EmulateVao( vao ){
  this._vao = vao;
}

EmulateVao.prototype = {


  dispose : function(){
    this._vao = null;
    this.prg = null;
    this.buffers = null;
    this.indices = null;
  },


  setup : function( prg, buffers, indices ){
    this.prg = prg;
    this.buffers = buffers;
    this.indices = indices;
  },


  bind : function(){
    for (var i = 0; i < this.buffers.length; i++) {
      this.buffers[i].attribPointer( this.prg );
    }
    if( this.indices !== undefined ){
      this.indices.bind();
    }
  },


  unbind : function(){
    // noop
  },

};


module.exports = Vao;