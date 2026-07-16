let canvas = document.getElementById("background-canvas");
let context = canvas.getContext("2d");

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
}

// Run once at start to get the window to the correct size
resizeCanvas();

// Setup wave equation parameters
c = 1000;
const gamma = 2;

// Spatial discretization
// Initialize gridsize
let Nx = 300;
let Ny = 100;
// dx and dy are based on what i know works, gonna just draw the stuff different
let dx = Math.ceil(1728/Nx);
let dy = Math.ceil(811/Ny);

// Temporal discretization
dt = 1/(1.1 * c * Math.sqrt((1/dx)*(1/dx) + (1/dy)*(1/dy)));

// Create empty Nx x Ny array
let u = [];
for(let x = 0; x < Nx; x++) {
    u[x] = [];
    for(let y = 0; y < Ny; y++) {
        u[x][y] = 0.0;
    }
}

// Breaking up into 2 first order eqs
// du/dt = v, dv/dt = c * c * laplacian(u)

// Copies v to u
let v = u.map(row => row.slice());

function updateWaveEquation() {
    // Performs one step of the update to the wave equation

    // Helper function for stepping
    // dudt = v, dvdt = c*c*laplacian(u)
    function wave_eq(u, v) {
        // Find laplacian (d2u/dx2 + d2u/dy2)
        let laplacian = Array.from({ length: Nx }, () => new Array(Ny).fill(0));
        for (let x = 1; x < Nx - 1; x++) {
            for (let y = 1; y < Ny - 1; y++) {
                const d2udx2 = (u[x - 1][y] - 2 * u[x][y] + u[x + 1][y]) / (dx * dx);
                const d2udy2 = (u[x][y - 1] - 2 * u[x][y] + u[x][y + 1]) / (dy * dy);
                laplacian[x][y] = d2udx2 + d2udy2;
            }
        }

        const dudt = u.map((row, x) => row.map((_, y) => v[x][y]));
        const dvdt = laplacian.map((row, x) => row.map((val, y) => c * c * val - gamma * v[x][y]));
        return { dudt, dvdt };
    }

    // Perform RK4
    let { dudt: k1u, dvdt: k1v } = wave_eq(u, v);

    let u2 = u.map((row, x) => row.map((val, y) => val + 0.5 * dt * k1u[x][y]));
    let v2 = v.map((row, x) => row.map((val, y) => val + 0.5 * dt * k1v[x][y]));
    let { dudt: k2u, dvdt: k2v } = wave_eq(u2, v2);
    
    let u3 = u.map((row, x) => row.map((val, y) => val + 0.5 * dt * k2u[x][y]));
    let v3 = v.map((row, x) => row.map((val, y) => val + 0.5 * dt * k2v[x][y]));
    let { dudt: k3u, dvdt: k3v } = wave_eq(u3, v3);

    let u4 = u.map((row, x) => row.map((val, y) => val + dt * k3u[x][y]));
    let v4 = v.map((row, x) => row.map((val, y) => val + dt * k3v[x][y]));
    let { dudt: k4u, dvdt: k4v } = wave_eq(u4, v4);

    // God I love using map instead of writing out all the for loops
    // Still, WAY more fun to do this in python or even C++
    // Maps goes through each row and value and updates each one but all together
    // Thank god for stackoverflow

    // Update u and v
    for (let x = 0; x < Nx; x++) {
        for (let y = 0; y < Ny; y++) {
            u[x][y] += (dt / 6) * (k1u[x][y] + 2 * k2u[x][y] + 2 * k3u[x][y] + k4u[x][y]);
            v[x][y] += (dt / 6) * (k1v[x][y] + 2 * k2v[x][y] + 2 * k3v[x][y] + k4v[x][y]);
        }
    }

    fixBoundaryConds();
}

function fixBoundaryConds() {
    // Top and bottom
    for (let x = 0; x < Nx; x++) {
        u[x][0] = 0;
        u[x][Ny - 1] = 0;
    }

    // Left and right
    for (let y = 0; y < Ny; y++) {
        u[0][y] = 0;
        u[Nx - 1][y] = 0;
    }
}

function drawWaveEquation() {
    boxW = Math.ceil(windowW/Nx);
    boxH = Math.ceil(windowH/Ny);

    let flat = u.flat(); // flatten 2D into 1D
    let min = Math.min(...flat);
    let max = Math.max(...flat);
    let scaled = Array.from({ length: Nx }, () => new Array(Ny).fill(0));
    if (max != min) {
        scaled = u.map(row => row.map(v => (v - min) / (max - min)));
    }

    for(let x = 0; x < u.length; x++) {
        for(let y = 0; y < u[0].length; y++) {
            drawVal = clamp(127 * Math.abs(u[x][y]), 0, 3*256/4);
            context.fillStyle = "rgb(" + drawVal +
             ", " + drawVal + ", " + drawVal + ")";
            context.fillRect(boxW*x, boxH*y, boxW, boxH);
        }
    }
}

let cx = Nx / 2;
let cy = Ny / 2;
let sigma = 1;
let amplitude = 10;


// Initial Conditions        
/*
for(let x = 0; x < Nx; x++) {
    for(let y = 0; y < Ny; y++) {
        u[x][y] = amplitude*Math.exp(-((x - cx)**2 + (y - cy)**2) / (2 * sigma**2));
    }
}
*/

function dropRandom() {
    const maxX = Nx - 10;
    const minX = 10;
    const maxY = Ny - 10;
    const minY = 10;
    const randX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const randY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    for(let x = 0; x < Nx; x++) {
        for(let y = 0; y < Ny; y++) {
            u[x][y] += amplitude*Math.exp(-((x - randX)**2 + (y - randY)**2) / (2 * sigma**2));
        }
    }
}

/*
var dropper;
function startDropper() {
    dropper = window.setInterval(dropRandom, 2000);
}
function stopDropper() {
    window.clearInterval(dropper);
}

window.addEventListener('focus', startDropper);    
window.addEventListener('blur', stopDropper);
*/

// Click to add a little gaussian packet
canvas.addEventListener('click', function(event) {
    // Calculate the mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect(); // Get canvas position and size
    const mouseX = event.clientX - rect.left; // X-coordinate relative to canvas
    const mouseY = event.clientY - rect.top; // Y-coordinate relative to canvas

    const gridX = Math.ceil(mouseX/dx);
    const gridY = Math.ceil(mouseY/dy); 

    for(let x = 0; x < Nx; x++) {
        for(let y = 0; y < Ny; y++) {
            u[x][y] += amplitude * Math.exp(-((x - gridX)**2 + (y - gridY)**2) / (2 * sigma**2));
        }
    }
    console.log(mouseX);
});


let lastDropFrameTime = 0;
function update(timestamp) {

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);


        // Every 2 seconds
        if (now - lastDropFrameTime >= 2000) {
            dropRandom();
            lastDropFrameTime = now;
        }

        // Perform update
        updateWaveEquation();
    
        frameCount += 1;
        
        // Draw screen
        drawWaveEquation();

    }

    // Request next frame
    requestAnimationFrame(update);
}

// WHY ISNT THIS ALREADY A FUNCTION. COME ON JAVASCRIPT
function clamp(x, min, max) {
    if (x >= min && x <= max) {
        return x;
    } else if (x < min) {
        return min;
    } else {
        return max;
    }
}



// WELCOME TO SUPER SECRET!!!!!!!!!!!!!
const SUPER_SECRET_PASSWORD = "RECLUSE".split("");
var password_input = [];

// Ohhhh theyre typing in the super secret password omg 
document.addEventListener("keydown", (event) => {
    // Okay even you should be able to figure out what this next line does
    // I love you darling but sometimes you can chill out a bit with the comments
    password_input.push(event.key.toUpperCase());

    console.log(password_input)

    // Tooooooo manyyyyy lettterrrrsssss
    if (password_input.length > SUPER_SECRET_PASSWORD.length) {
        password_input.shift(); // GET RID OF EM!
    }

    // OHHH THEY IN
    if (password_input.join("") == SUPER_SECRET_PASSWORD.join("")) {
        window.location.href = "backroom/index.html"; // OH SEND EM AWAY!
    }
});

// OKAY BYE



// okay yeah actually gotta do the animation stuff now wonderful
var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

// initialize the timer variables and start the animation
function startAnimating(fps) {
    //startDropper();
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    update();
}

startAnimating(120);