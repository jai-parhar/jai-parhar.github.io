let overlay_canvas = document.getElementById("overlay-canvas")

let overlay_context = overlay_canvas.getContext("2d");

let windowW = window.innerWidth;
let windowH = window.innerHeight;

// Set background and overlay up
window.addEventListener('resize', resizeCanvas, false); 
function resizeCanvas() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    overlay_canvas.width = window.innerWidth;
    overlay_canvas.height = window.innerHeight;
}

// Run once at start to get the window to the correct size
resizeCanvas();

// make sure all the mini canvases are around their image
document.querySelectorAll(".image-wrapper").forEach(wrapper => {
    const img = wrapper.querySelector("img");
    const canvas = wrapper.querySelector("canvas");

    function resizeSmallCanvas() {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
    }

    if (img.complete) {
        resizeSmallCanvas();
    } else {
        img.onload = resizeSmallCanvas;
    }
});



function update() {

}




function draw() {
    overlay_context.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);


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


