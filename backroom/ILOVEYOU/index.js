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

// const testSpider = new Spider(400, 400);
// const testWeb = new WebSegment(100, 100, 700, 400, 800, 400);

const testWeb = new SpiderWeb(new Spider(-100, -100));


// canvas.addEventListener("click", function(event){
//     //testSpider.walkTo(event.clientX, event.clientY);
//     testWeb.addNode(event.clientX, event.clientY);
//     //testWeb.moveSpider(event.clientX, event.clientY);
// });

setInterval(() => {
    let randX = (1.1*Math.random() - 0.05)*windowW;
    let randY = (1.1*Math.random() - 0.05)*windowH;
    console.log(randX);
    console.log(randY);
    testWeb.addNode(randX, randY);
}, 1000);

function update() {
    // Performs one step of the update
    //testWeb.updateParams({x2: mouseX, y2:mouseY});
    //testSpider.update();
    testWeb.update();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    //testWeb.draw(context);
    //testSpider.draw(context);
    testWeb.drawSpider(context);
    testWeb.drawWeb(context);
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