// code to get vertices

// generates a box centered around the origin with length being along z, width along x, height along y
// returns each quad mesh seperately in an object
function makeBoxFaces(length, width, height) {
    let backFaceVertices = new Float32Array([
        -0.5*width, -0.5*height, -0.5*length,
        0.5*width, -0.5*height, -0.5*length,
        0.5*width,  0.5*height, -0.5*length,

        -0.5*width, -0.5*height, -0.5*length,
        0.5*width,  0.5*height, -0.5*length,
        -0.5*width,  0.5*height, -0.5*length
    ]);

    let frontFaceVertices = new Float32Array([
        -0.5*width, -0.5*height, 0.5*length,
        0.5*width, -0.5*height, 0.5*length,
        0.5*width,  0.5*height, 0.5*length,

        -0.5*width, -0.5*height, 0.5*length,
        0.5*width,  0.5*height, 0.5*length,
        -0.5*width,  0.5*height, 0.5*length
    ]);

    let floorFaceVertices = new Float32Array([
        -0.5*width, -0.5*height, -0.5*length,
         0.5*width, -0.5*height, -0.5*length,
         0.5*width, -0.5*height, 0.5*length,

        -0.5*width, -0.5*height, -0.5*length,
         0.5*width, -0.5*height,  0.5*length,
        -0.5*width, -0.5*height,  0.5*length
    ]);

    let roofFaceVertices = new Float32Array([
        -0.5*width, 0.5*height, -0.5*length,
         0.5*width, 0.5*height, -0.5*length,
         0.5*width, 0.5*height, 0.5*length,

        -0.5*width, 0.5*height, -0.5*length,
         0.5*width, 0.5*height,  0.5*length,
        -0.5*width, 0.5*height,  0.5*length
    ]);

    let rightFaceVertices = new Float32Array([
        0.5*width, -0.5*height, -0.5*length,
        0.5*width,  0.5*height, -0.5*length,
        0.5*width,  0.5*height,  0.5*length,

        0.5*width, -0.5*height, -0.5*length,
        0.5*width,  0.5*height,  0.5*length,
        0.5*width, -0.5*height,  0.5*length
    ]);

    let leftFaceVertices = new Float32Array([
        -0.5*width, -0.5*height, -0.5*length,
        -0.5*width,  0.5*height, -0.5*length,
        -0.5*width,  0.5*height,  0.5*length,

        -0.5*width, -0.5*height, -0.5*length,
        -0.5*width,  0.5*height,  0.5*length,
        -0.5*width, -0.5*height,  0.5*length
    ]);

    let uvs = new Float32Array([
        0,0,
        1,0,
        1,1,

        0,0,
        1,1,
        0,1
    ]);

    return {
        front: frontFaceVertices, back: backFaceVertices, 
        top: roofFaceVertices, bottom: floorFaceVertices, 
        left: leftFaceVertices, right: rightFaceVertices, 
        faceUVs: uvs
    }
}

function generateBoxFaceMeshes(gl, shader, length, width, height, positionAttribName="vertex_position", uvAttribName="vertex_uv") {
    let boxVertexData = makeBoxFaces(length, width, height);
    let frontMesh = generateTexturedMesh(gl, boxVertexData.front, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    let backMesh = generateTexturedMesh(gl, boxVertexData.back, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    let topMesh = generateTexturedMesh(gl, boxVertexData.top, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    let bottomMesh = generateTexturedMesh(gl, boxVertexData.bottom, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    let leftMesh = generateTexturedMesh(gl, boxVertexData.left, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    let rightMesh = generateTexturedMesh(gl, boxVertexData.right, boxVertexData.faceUVs, shader, positionAttribName, uvAttribName);
    return {
        front: frontMesh, back: backMesh, 
        top: topMesh, bottom: bottomMesh, 
        left: leftMesh, right: rightMesh
    }
}

// mesh generation

function generateUntexturedMesh(gl, vertex_positions, shader, positionAttribName="vertex_position") {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer(); // makes the buffer for the vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo); // binds the buffer so we can use it
    gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW); // puts the data in the buffer

    // get vertex positions in
    const position_AttribLocation = gl.getAttribLocation(shader, positionAttribName); // finds where the vertex_position attribute is in the shader program
    gl.enableVertexAttribArray(position_AttribLocation); // enables reading from a buffer
    gl.vertexAttribPointer( // tells opengl how to read the buffer
        position_AttribLocation, // which attribute we are setting
        3, // number of elements we send at once
        gl.FLOAT, // datatype
        false, // whether ints should be normalized, ignored for floats
        3 * Float32Array.BYTES_PER_ELEMENT, // how many bytes until start of next vertex (0 means tightly packed)
        0 // byte offset to start reading from
    );

    gl.bindVertexArray(null);

    return {
        vao: vao,
        vertexCount: vertex_positions.length / 3,
        positions: vertex_positions
    };
}

function generateTexturedMesh(gl, vertex_positions, vertex_uvs, shader, positionAttribName="vertex_position", uvAttribName="vertex_uv") {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);



    const position_vbo = gl.createBuffer(); // makes the buffer for the vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo); // binds the buffer so we can use it
    gl.bufferData(gl.ARRAY_BUFFER, vertex_positions, gl.STATIC_DRAW); // puts the data in the buffer

    // get vertex positions in
    const position_AttribLocation = gl.getAttribLocation(shader, positionAttribName); // finds where the vertex position attribute is in the shader program
    gl.enableVertexAttribArray(position_AttribLocation); // enables reading from a buffer
    gl.vertexAttribPointer( // tells opengl how to read the buffer
        position_AttribLocation, // which attribute we are setting
        3, // number of elements we send at once
        gl.FLOAT, // datatype
        false, // whether ints should be normalized, ignored for floats
        0, // how many bytes until start of next vertex (0 means tightly packed)
        0 // byte offset to start reading from
    );


    const uv_vbo = gl.createBuffer(); // makes the buffer for the vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, uv_vbo); // binds the buffer so we can use it
    gl.bufferData(gl.ARRAY_BUFFER, vertex_uvs, gl.STATIC_DRAW); // puts the data in the buffer

    // get vertex positions in
    const uv_AttribLocation = gl.getAttribLocation(shader, uvAttribName); // finds where the vertex uv attribute is in the shader program
    gl.enableVertexAttribArray(uv_AttribLocation); // enables reading from a buffer
    gl.vertexAttribPointer( // tells opengl how to read the buffer
        uv_AttribLocation, // which attribute we are setting
        2, // number of elements we send at once
        gl.FLOAT, // datatype
        false, // whether ints should be normalized, ignored for floats
        0, // how many bytes until start of next vertex (0 means tightly packed)
        0 // byte offset to start reading from
    );



    gl.bindVertexArray(null);

    return {
        vao: vao,
        vertexCount: vertex_positions.length / 3,
        positions: vertex_positions,
        uvs: vertex_uvs
    };
}

function drawMesh(gl, mesh, shader) {
    gl.useProgram(shader);
    gl.bindVertexArray(mesh.vao);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    gl.bindVertexArray(null);
}




// Texture stuff

function loadTexture(gl, path){

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // temporary magenta texture while loading
    gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipmap level
        gl.RGBA,
        1, // width
        1, // height
        0, // border, always set to 0
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([255,0,255,255]) 
    );


    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        // nearest neighbour textures if texture is scaled up/down
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    };

    // load image
    image.src = path;

    return texture;
}

function generateSolidTexture(gl, colour = [255, 0, 255, 255]) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // temporary magenta texture while loading
    gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipmap level
        gl.RGBA,
        1, // width
        1, // height
        0, // border, always set to 0
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([colour[0], colour[1], colour[2], colour[3]]) 
    );

    return texture;
}

function setTexture(gl, texture, shader, textureSamplerUniformName = "texture_sampler") {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(shader, textureSamplerUniformName), 0);
}