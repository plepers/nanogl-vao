Vao
======
Vao provide the OES_vertex_array_object extension fonctionality. It fallback transparently if extension is not available.


##usage

```JavaScript


var vao = new Vao( gl );


function setup(){
	var prg = new Program( gl )
	var buffer = new ArrayBuffer( gl )
	/* setup prg and buffers */


	vao.setup( prg, [buffer] );

}


function renderLoop(){

	prg.use();

  // will attribPointer and bind buffers
	vao.bind();


	buffer.drawTriangles()

	vao.unbind();
}

```


