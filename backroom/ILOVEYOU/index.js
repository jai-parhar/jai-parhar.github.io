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


const spiderWeb = new SpiderWeb(new Spider(windowW/2, windowH/2));

const webNodes = generateWebNodes(windowW/3, windowH/3, windowW, windowH);
const webPath = generatePathFromWebNodes(webNodes);
// we need a test path
// const webPath = [
//     {x:100, y:100, noweb:true}, 
//     {x:1200, y:100, noweb:false},
//     {x:500, y:500, noweb:true},
//     {x:100, y:100, noweb:true}, 
//     {x:100, y:100, noweb:true}, 
//     {x:1200, y:100, noweb:false},
//     {x:500, y:500, noweb:true},
//     {x:100, y:100, noweb:true}, 
//     {x:1200, y:100, noweb:false},
//     {x:500, y:500, noweb:true}
// ];


//const testFly = new Fly(windowW/2, windowH/2);
let flies = [];

setTimeout(() => {
    spiderWeb.spinWebAlongPath(webPath);
}, 3000);

function randomPointOutsideScreen(width, height, margin = 50) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: // Top
            return { x: Math.random() * width, y: -margin };
        case 1: // Right
            return { x: width + margin, y: Math.random() * height };
        case 2: // Bottom
            return { x: Math.random() * width, y: height + margin };
        case 3: // Left
            return { x: -margin, y: Math.random() * height };
    }
}

canvas.addEventListener("click", (event)=>{
    flies.push(new Fly(event.clientX, event.clientY));
});


function update() {
    // Performs one step of the update
    spiderWeb.update();

    for (let i = 0; i < flies.length; i++) {
        flies[i].update(windowW, windowH);
        if (flies[i].moving) {
            if (flies[i].checkSpiderWebCollisions(spiderWeb, 0.05)) {
                flies[i].moving = false;
                spiderWeb.eatFly(flies[i]);
            }
        } else {
            spiderWeb.eatFly(flies[i]);
        }
    }

    // handle eaten flies
    flies = flies.filter(fly => !fly.eaten);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    spiderWeb.drawWeb(context, "lightgray");
    
    for (let i = 0; i < flies.length; i++) {
        flies[i].draw(context);
    }
    
    spiderWeb.drawSpider(context);
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