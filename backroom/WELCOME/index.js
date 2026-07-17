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



// I wanna do like stars with parallax moving down
// Each index in the following arrays refers to the parallax levels, with 0 being furthest and 2(?) being closest
const STAR_SIZES = [1, 2, 3];
const STAR_SPEEDS = [0.5, 1, 1.5];
const STAR_PLEVEL_WEIGHTS = [0.65, 0.25, 0.15];
const STAR_PLEVEL_WEIGHTSUM = STAR_PLEVEL_WEIGHTS.reduce((sum, currVal) => sum + currVal, 0); // Some bs I pulled off stackoverflow
class Star {
    constructor() {
        let parallax_level_random = Math.random();
        // To figure out which level from the weights, just keep subtracting weight/sum from the random num until you get to 0
        for (let i = 0; i < STAR_PLEVEL_WEIGHTS.length; i++) {
            parallax_level_random -= STAR_PLEVEL_WEIGHTS[i]/STAR_PLEVEL_WEIGHTSUM;

            if (parallax_level_random < 0) {
                this.parallax_level = i;
                break;
            }
        }

        this.y = Math.random() * windowH; // May want to change this to have it all start from the top, then put the y in constructor input
        this.x = Math.random() * windowW;
    }

    update() {
        this.y += STAR_SPEEDS[this.parallax_level];
    }

    draw() {
        context.fillRect(this.x, this.y, STAR_SIZES[this.parallax_level], STAR_SIZES[this.parallax_level]);
    }
}


// Temporarily (? I might keep this) generate all initial stars
// If you want to have stars falling then have it like, generate all of them offscreen by setting y negative
const MAX_STARS = 5000;
let stars = [];
for (let i = 0; i < MAX_STARS; i++) {
    stars.push(new Star());
}

let doorHover = false; // SET THIS TO TRUE WHEN MOUSING OVER THE ENTRANCE
let doorClicked = false;
const door = document.getElementById("door");
const header = document.getElementById("header");
const doorImage = document.getElementById("door-image");
door.addEventListener("mouseenter", () => {
    doorHover = true;
});
door.addEventListener("mouseleave", () => {
    doorHover = false;
});
door.addEventListener("click", () => {
    doorClicked = true;
    // TODO: SEND TO NEXT PAGE
    setTimeout(() => {
        window.location.href = "../ILOVEYOU/"; // OH SEND EM AWAY!
    }, 3000);
});

function update() {
    // Performs one step of the update

    // Update all stars
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        if (stars[i].y > windowH) {
            stars[i].y = -1;
            stars[i].x = Math.random() * windowW;
        }
    }

    if (doorHover || doorClicked) {
        startTone(100);
    } else {
        stopTone();
    }


    if (doorClicked) {
        header.classList.add("clicked");
        doorImage.src = "./res/dooropen_white.png";
    } else {
        if (doorHover) {
            header.classList.add("hovering");
            doorImage.src = "./res/dooropen_white.png";
        } else {
            header.classList.remove("hovering");
            doorImage.src = "./res/doorclosed_white.png";
        }
    }

}


// IM TRYING SOMETHING
let audioCtx = null;
let oscillator = null;
function startTone(frequency = 440) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (oscillator) return; // Already playing

    oscillator = audioCtx.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    oscillator.connect(audioCtx.destination);
    oscillator.start();
}

function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}



function draw() {
    if (!doorClicked) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    context.fillStyle = "rgb(255, 255, 255)";
    for (let i = 0; i < stars.length; i++) {
        stars[i].draw();
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


// okay yeah actually gotta do the animation stuff now wonderful
let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

// initialize the timer variables and start the animation
function startAnimating(fps) {
    //startDropper();
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    updateFrame();
}

startAnimating(60);