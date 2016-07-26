var ArrayBuffer = require( 'nanogl/arraybuffer' );
var Program     = require( 'nanogl/program' );
var Vao         = require( '../vao' );

var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();

var vertexData = new Uint8Array( 24 * 4 );
var fVertexData = new Float32Array( vertexData.buffer );

fVertexData.set( [ -1, -1, 0, 0, 0 ], 0  );
fVertexData.set( [  1, -1, 0, 1, 0 ], 6  );
fVertexData.set( [ -1,  1, 0, 0, 1 ], 12 );
fVertexData.set( [  1,  1, 0, 1, 1 ], 18 );

vertexData.set( [0xFF, 0,    0x17,    0xFF ], 20 + 0 );
vertexData.set( [0xFF, 0xFF, 0x17,    0xFF ], 20 + 24 );
vertexData.set( [0xFF, 0xFF, 0x17,    0xFF ], 20 + 48 );
vertexData.set( [0,    0,    0x17, 0xFF ], 20 + 72 );


describe( "Vao", function(){

  it( "should be exported", function(){

    expect( Vao ).to.be.ok( );

  });

  it( "constructor should return instance", function(){

    var p = new Vao( gl );
    expect( p ).to.be.ok( );
    expect( p.gl ).to.be.ok( );

  });


  it( "ctor should leave clean state", function(){
    var p = new Vao( gl );
    testContext.assertNoError();
  });


  it( "dispose should leave clean state", function(){
    var p = new Vao( gl );
    p.dispose();
    testContext.assertNoError();
  });



  describe( " - bound - ", function(){

    var prg;
    var buffers;

    beforeEach(function(){

      prg = new Program( gl );
      prg.compile(
        require( './glsl/test_arraybuffer.vert'),
        require( './glsl/test_arraybuffer.frag')
      );

      var b = new ArrayBuffer( gl );
      b.data( vertexData );

      b.attrib( 'aPosition', 3, gl.FLOAT );
      b.attrib( 'aTexCoord', 2, gl.FLOAT );
      b.attrib( 'aColor', 4, gl.UNSIGNED_BYTE, true );
      buffers = [b];

    })


    afterEach(function(){
      prg.dispose();
      buffers[0].dispose();
    })


    it( "setup should leave clean state", function(){
      var p = new Vao( gl );
      p.setup( prg, buffers );
      testContext.assertNoError();
    });


    it( "dispose should leave clean state", function(){
      var p = new Vao( gl );
      p.setup( prg, buffers );
      p.dispose();
      testContext.assertNoError();
    });



    it( " should render A", function(){

      var p = new Vao( gl );
      prg.use();
      p.setup( prg, buffers );
      p.bind();

      buffers[0].drawTriangleStrip();
      testContext.testPixel( 32, 32, 0xfffbfb81 )
      testContext.testPixel( 0, 0, 0xffff0402 )
      testContext.assertNoError();
      p.unbind();
    });



    it( " should render 2 programs", function(){

      var p1 = new Vao( gl );
      // prg.use();
      p1.setup( prg, buffers );



      var prg2 = new Program( gl );
      prg2.compile(
        require( './glsl/test_arraybuffer2.vert'),
        require( './glsl/test_arraybuffer2.frag')
      );

      var p2 = new Vao( gl );
      prg.use()
      p2.setup( prg2, buffers );
      // prg2.use();

      // draw p1
      // -------
      p1.bind();
      prg.use();
      buffers[0].drawTriangleStrip();
      testContext.testPixel( 32, 32, 0xfffbfb81 )
      testContext.testPixel( 0, 0, 0xffff0402 )
      testContext.assertNoError();
      p1.unbind();


      // draw p2
      // -------
      p2.bind();
      prg2.use();
      buffers[0].drawTriangleStrip();
      testContext.testPixel( 32, 32, 0xfffbfb17 )
      testContext.testPixel( 0, 0, 0xffff0417 )
      testContext.assertNoError();
      p2.unbind();

    });



  });




});