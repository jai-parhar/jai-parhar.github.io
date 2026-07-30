let canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    // Too old browser
    canvas.remove();
    document.body.style.overflow = "";
    throw new Error("WebGL2 is not supported.");
} else {
    document.getElementById("HUD").style.display = "";
}

let windowW = window.innerWidth;
let windowH = window.innerHeight;

// Set background up
canvas.style.background = "#000000";
window.addEventListener('resize', resizeCanvas, false); 
function resizeCanvas() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas(); // Run once at start to get the window to the correct size

const keys = {};
window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

canvas.addEventListener("click", ()=>{
    canvas.requestPointerLock();
});


const cameraSpeed = 0.1;
const camera = {
    position: glMatrix.vec3.fromValues(0, 0, 45),
    pitch: 0, // polar angle, but set so that 0 is forward
    yaw: 0, // azimuthal angle, but set so that 0 is +z
    projection: glMatrix.mat4.create()
};
glMatrix.mat4.perspective(
    camera.projection,
    Math.PI / 3,
    canvas.width / canvas.height,
    0.1,
    100
);
const mouse_sensitivity = 0.002;
document.addEventListener("mousemove", (event)=>{
    if(document.pointerLockElement !== canvas) { return; }
    camera.yaw -= event.movementX * mouse_sensitivity;
    camera.pitch -= event.movementY * mouse_sensitivity;
});


const shaderProgram = await createShaderProgram(gl, "./res/vert.glsl", "./res/frag.glsl");




const room = generateRoomMeshes(gl, shaderProgram, 100, 10, 10);






const identity = glMatrix.mat4.create();
glMatrix.mat4.identity(identity);

let looking_at_door = false;
let door_index = -1;

function update() {

    looking_at_door = false;
    for (let i = 0; i < doors.length; i++) {
        let raycast_result = rayMeshIntersection(getCameraRay(camera), doors[i].mesh, doors[i].model_transform);
        if (raycast_result.intersection) {
            looking_at_door = true;
            door_index = i;
        }
    }

    if (looking_at_door) {
        setInfoMessageText(doors[door_index].text);
    } else {
        setInfoMessageText("");
    }


    // for (let l = 0; l < lights.length; l++) {
    //     if (looking_at_door) {
    //         lights[l].colour = [1.0, 0.65, 0.5];
    //     } else {
    //         lights[l].colour = [1.0, 0.95, 0.8];
    //     }    
    // }

    updateCamera();
}

function updateCamera() {
    let forwardVector = flattenY(getCameraForwardVector(camera));
    let rightVector = flattenY(getCameraRightVector(camera));

    if (keys["KeyW"]) {
        glMatrix.vec3.scaleAndAdd(camera.position, camera.position, forwardVector, cameraSpeed);
    }

    if (keys["KeyS"]) {
        glMatrix.vec3.scaleAndAdd(camera.position, camera.position, forwardVector, -cameraSpeed);
    }

    if (keys["KeyD"]) {
        glMatrix.vec3.scaleAndAdd(camera.position, camera.position, rightVector, cameraSpeed);
    }

    if (keys["KeyA"]) {
        glMatrix.vec3.scaleAndAdd(camera.position, camera.position, rightVector, -cameraSpeed);
    }
}



const doorTexture = loadTexture(gl, "res/doorclosed_white.png");
const roofTexture = generateSolidTexture(gl, [225, 226, 187, 255]);
const floorTexture = generateSolidTexture(gl, [107, 95, 24, 255]);
const wallTexture = generateSolidTexture(gl, [228, 230, 168, 255]);

const lights = [];
lights.push({position: [0, 0, 0], colour: [1.0, 0.95, 0.8], intensity: 6.0});
lights.push({position: [0, 0, -40], colour: [1.0, 0.95, 0.8], intensity: 6.0});
lights.push({position: [0, 0, 40], colour: [1.0, 0.95, 0.8], intensity: 6.0});

function createDoor(position, rotation, text, link, scale=1) {
    let door = {
        mesh:generateQuadMesh(gl, shaderProgram, (8/14) * 10, 10),
        model_transform: glMatrix.mat4.create(),
        text: text, 
        link: link
    };

    glMatrix.mat4.translate(door.model_transform, door.model_transform, position);

    glMatrix.mat4.rotateY(door.model_transform, door.model_transform, rotation[0]);
    glMatrix.mat4.rotateX(door.model_transform, door.model_transform, rotation[1]);
    glMatrix.mat4.rotateZ(door.model_transform, door.model_transform, rotation[2]);

    glMatrix.mat4.scale(door.model_transform, door.model_transform, [scale, scale, scale]);

    return door;
}

const doors = [];
doors.push(createDoor([0, -1, 49.9], [Math.PI, 0, 0], "YOU CAME IN THROUGH HERE", "/backroom/WELCOME", 0.8));
doors.push(createDoor([4.99, -1, 30], [-Math.PI/2, 0, 0], "HOW IT FEELS TO BE JAI", "/backroom/SHRINE", 0.8));
doors.push(createDoor([-4.99, -1, 30], [Math.PI/2, 0, 0], "HOW IT FEELS TO BE JAI ALSO", "/backroom/ANTISHRINE", 0.8));
doors.push(createDoor([-4.99, -1, 10], [Math.PI/2, 0, 0], "A QUIET MOMENT OF REFLECTION", "/backroom/BATHROOM-MIRROR", 0.8));


function draw() {
    gl.bindVertexArray(null);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    // lighting uniforms
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "num_lights"), lights.length);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "light_position"), lights.flatMap(l => l.position));
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "light_colour"), lights.flatMap(l => l.colour));
    gl.uniform1fv(gl.getUniformLocation(shaderProgram, "light_intensity"), lights.flatMap(l => l.intensity));

    // camera transform matrices
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"view"), false, getCameraViewMatrix(camera));
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"projection"), false, camera.projection);


    // model transform matrix default set, no transformation. room doesn't need any transform so its fine.
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"model"), false, identity);
    
    setTexture(gl, roofTexture, shaderProgram);
    drawMesh(gl, room.top, shaderProgram);

    setTexture(gl, floorTexture, shaderProgram);
    drawMesh(gl, room.bottom, shaderProgram);

    setTexture(gl, wallTexture, shaderProgram);
    drawMesh(gl, room.front, shaderProgram);
    drawMesh(gl, room.back, shaderProgram);
    drawMesh(gl, room.left, shaderProgram);
    drawMesh(gl, room.right, shaderProgram);

    setTexture(gl, doorTexture, shaderProgram);
    for (let i = 0; i < doors.length; i++) {
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"model"), false, doors[i].model_transform);
        drawMesh(gl, doors[i].mesh, shaderProgram);
    }

}






function updateFrame(timestamp) {

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Perform update
        update();
    
        frameCount += 1;
        
        // Draw screen
        draw();

    }

    // Request next frame
    requestAnimationFrame(updateFrame);
}


// my sweet danieltones
let audioCtx = null;
let oscillator = null;
function startTone(frequency = 440) {

    // If you dont have a context make one I love you!
    if (!audioCtx) {
        audioCtx = new window.AudioContext();
    }

    // FIREFOX SUCK MY DICK
    // LET ME DO WHATEVER I WANT FUCKER
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    // YOU ALREADY GOT ONE
    if (oscillator) return;

    oscillator = audioCtx.createOscillator();

    // Params bro. It's all params
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
        frequency,
        audioCtx.currentTime
    );

    // SENDEROFF
    oscillator.connect(audioCtx.destination);
    oscillator.start();
}


// SHUT THE FUCK
function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}

// okay yeah actually gotta do the animation stuff now wonderful
let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

// initialize the timer variables and start the animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    updateFrame();
}

startAnimating(60);








