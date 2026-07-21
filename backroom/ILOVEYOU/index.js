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

let onMainScreen = true;
let transitioning = false;

let cameraY = 0;

const spider = new Spider(-100, 100);
const spiderWeb = new SpiderWeb(spider);
const drawWeb = new SpiderWeb(spider);

const webNodes = generateWebNodes(windowW/3, windowH/3, windowW, windowH);
const webPath = generatePathFromWebNodes(webNodes);



let flies = [];

setTimeout(() => {
    spiderWeb.spinWebAlongPath(webPath);
}, 1000);

function spawnFly() {
    const margin = 50;
    const side = Math.floor(Math.random() * 4);
    let x = -margin;
    let y = -margin;
    switch (side) {
        case 0: // Top
            x = Math.random() * windowW; y = -margin; break;
        case 1: // Right
            x = windowW + margin; y = Math.random() * windowH; break;
        case 2: // Bottom
            x = Math.random() * windowW; y = windowH + margin; break;
        case 3: // Left
            x = -margin, y = Math.random() * windowH; break;
    }
    flies.push(new Fly(x, y));
}

const feedSpiderButton = document.getElementById("feed-spider-button");
feedSpiderButton.addEventListener("click", (event) => {
    spawnFly();
});

const flyCountElement = document.getElementById("fly-count");
let fliesEaten = 0;


// okay this is dumb but like. this works
const virtual_transition_fly = new Fly(windowW/2, 2*windowH);
// the idea is i never update this and i never draw this, but it saves the state for the web


const drawWebButton = document.getElementById("draw-web");
drawWebButton.addEventListener("click", (event) => {
    // WE OUT HERE EXPLICITY SETTING STATE MACHINE STATES
    onMainScreen = true; // I SHOULDN'T HAVE TO SET THIS. BUT WHAT IF!
    transitioning = true;
});

const goBackButton = document.getElementById("go-back");
goBackButton.addEventListener("click", (event) => {
    onMainScreen = false;
    transitioning = true;
});

const TRANSITION_SPEED = 10;
function update() {
    
    // makes the html and css follow the camera. fuck. i fucking. im losing my mind.
    // I genuinely cannot fucking handle this stupid fucking shit. whatever man. shit.
    // also dont forget second screen starts at 1.5 * windowH. its not windowH.
    document.getElementById("camera").style.transform = `translateY(-${cameraY}px)`;

    if (onMainScreen && !transitioning) {
        updateMainScreen();
    }

    if (!onMainScreen && !transitioning) {
        // handle updates for drawing the spider stuff
        updateDrawWebScreen();
    }

    if (onMainScreen && transitioning) {
        // handle updates for transitioning down to the draw screen
        updateTransitionToDrawScreen();
    }

    if (!onMainScreen && transitioning) {
        // handle updates for transitioning up to the main screen
        updateTransitionToMainScreen();
    }
}

function updateMainScreen() {
    // Performs one step of the update
    spiderWeb.update();

    for (let i = 0; i < flies.length; i++) {
        flies[i].update(windowW, windowH);

        if (flies[i].eaten) {
            fliesEaten += 1;
            flyCountElement.textContent = fliesEaten;
        }

        if (flies[i].moving) {
            if (flies[i].checkSpiderWebCollisions(spiderWeb, 0.05)) {
                flies[i].moving = false;
            }
        } else {
            spiderWeb.eatFly(flies[i]);
        }
    }

    // handle eaten flies
    flies = flies.filter(fly => !fly.eaten);
}

function updateTransitionToDrawScreen() {
    flies = flies.filter(fly => fly.y < 1.25 * windowH); // clears the transition area so we wont see a low flying fly

    spiderWeb.update();
    if (cameraY < 1.5 * windowH) { // camera moving down
        cameraY += TRANSITION_SPEED;
        spiderWeb.eatFly(virtual_transition_fly); // 2*windowH because we move 1.5*windowH down
    } else {
        if (virtual_transition_fly.eaten) {
            // Spider at center point

            virtual_transition_fly.eaten = false;

            onMainScreen = false;
            transitioning = false;
        }
    }
}

// This line prevents right click from doing the stupid right click shit where it opens a stupid menu. im sorry.
canvas.addEventListener('contextmenu', (event) => { event.preventDefault(); });

// anytime the mouse gets clicked
canvas.addEventListener('mousedown', (event) => {
    // Handle drawing the webs
    if (!onMainScreen && !transitioning) {
        const x = event.clientX;
        const y = event.clientY + cameraY;

        if (event.button == 0) { // left click, draw web
            drawWeb.forceDrawNode(x, y);
        } else if (event.button == 2) { // right click, move spider
            drawWeb.dropWebAndForceDrawSpider(x, y);
        }
    }
});
function updateDrawWebScreen() {
    // honestly this is all you need to do the drawing code is above
    drawWeb.update();
}

function updateTransitionToMainScreen() {
    spiderWeb.update();
    if (cameraY > 0) { // camera moving up
        cameraY -= TRANSITION_SPEED;
    } else {
        drawWeb.webSegs = [];

        onMainScreen = true;
        transitioning = false;
    }
}


function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Will be important for the transition
    context.save();
    context.translate(0, -cameraY);

    spiderWeb.drawWeb(context, "lightgray");
    drawWeb.drawWeb(context, "lightgray");
    
    for (let i = 0; i < flies.length; i++) {
        flies[i].draw(context);
    }
    
    spiderWeb.drawSpider(context);


    context.restore();
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