
async function loadShaderSource(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Couldn't load shader: ${path}`);
    }
    return await response.text();
}

function compileShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

async function createShaderProgram(gl, vertexPath, fragmentPath) {
    const vertexSource = await loadShaderSource(vertexPath);
    const fragmentSource = await loadShaderSource(fragmentPath);

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}