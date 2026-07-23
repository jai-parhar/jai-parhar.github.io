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


let abs_canvas = document.getElementById("abs-canvas");
let abs_context = abs_canvas.getContext("2d");





function update() {
    update_censor_effect();
}


function draw() {
    overlay_context.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);

    draw_censor_effect();

    // abs_context.beginPath(); // Start a new drawing path
    // abs_context.arc(abs_face_cx, abs_face_cy, 100, 0, 2 * Math.PI); // Define the circle path
    // abs_context.fill(); // Draw the outline (or use ctx.fill() to color it in)

}


// Code for the censor effect
// Basing this on the scp 096 effect from the short film
// need black boxes, white border stuff, and crosshairs



let abs_face_cx = 0;
let abs_face_cy = 0;

const MAX_CENSOR_BOXES = 40;
const MIN_CENSOR_SIZE = 50; const MAX_CENSOR_SIZE = 400;
let censor_region = {x:0, y:0, w:0, h:0};
let censor_boxes = [];

const SELECTOR_FRAMES_PER_UPDATE = 8;
const MAX_SELECTOR_BOXES = 3;
const MIN_SELECTOR_SIZE = 250; const MAX_SELECTOR_SIZE = 350;
let selector_frame_count = 0;
let selector_region = {x:0, y:0, w:0, h:0};
let selector_boxes = [];

const BRACKET_FRAMES_PER_UPDATE = 12;
const MAX_BRACKETS = 2;
const MIN_BRACKET_SIZE = 300; const MAX_BRACKET_SIZE = 400;
let bracket_frame_count = 0;
let bracket_region = {x:0, y:0, w:0, h:0};
let brackets = [];

const CROSSHAIRS_FRAMES_PER_UPDATE = 16;
const MAX_CROSSHAIRS = 3;
const MIN_CROSSHAIR_SIZE = 50; const MAX_CROSSHAIR_SIZE = 200;
let crosshair_frame_count = 0;
let crosshair_region = {x:0, y:0, w:0, h:0};
let crosshairs = [];
const crosshair_img = new Image();
crosshair_img.src = "res/crosshairs.png";

function update_censor_effect() {
    abs_face_cx = abs_canvas.width * (0.425);
    abs_face_cy = abs_canvas.height * (0.22);



    censor_region.w = 450; 
    censor_region.h = 450;
    censor_region.x = abs_face_cx - censor_region.w/2;
    censor_region.y = abs_face_cy - censor_region.h/2;
    if (censor_boxes.length < MAX_CENSOR_BOXES) {
        // spawn in a censor box
        box = {
            cx: censor_region.x + (Math.random() * censor_region.w),
            cy: censor_region.y + (Math.random() * censor_region.h),
            w: (MAX_CENSOR_SIZE - MIN_CENSOR_SIZE) * Math.random() + MIN_CENSOR_SIZE,
            h: (MAX_CENSOR_SIZE - MIN_CENSOR_SIZE) * Math.random() + MIN_CENSOR_SIZE
        };
        censor_boxes.push(box);
    } else { // if same or bigger
        while (censor_boxes.length >= MAX_CENSOR_BOXES) { censor_boxes.shift(); }
    }



    selector_region.w = 250;
    selector_region.h = 250;
    selector_region.x = abs_face_cx - selector_region.w/2;
    selector_region.y = abs_face_cy - selector_region.h/2;
    if (selector_frame_count >= SELECTOR_FRAMES_PER_UPDATE) {
        selector_frame_count = 0;
        if (selector_boxes.length < MAX_SELECTOR_BOXES) {
            // sopawn in a selector box
            box = {
                cx: selector_region.x + (Math.random() * selector_region.w),
                cy: selector_region.y + (Math.random() * selector_region.h),
                w: (MAX_SELECTOR_SIZE - MIN_SELECTOR_SIZE) * Math.random() + MIN_SELECTOR_SIZE,
                h: (MAX_SELECTOR_SIZE - MIN_SELECTOR_SIZE) * Math.random() + MIN_SELECTOR_SIZE
            };
            selector_boxes.push(box);
        } else {
            while (selector_boxes.length >= MAX_SELECTOR_BOXES) { selector_boxes.shift(); }
        }
    }
    selector_frame_count += 1;



    bracket_region = selector_region; // just copy it for now, change if ya want
    if (bracket_frame_count >= BRACKET_FRAMES_PER_UPDATE) {
        bracket_frame_count = 0;
        if (brackets.length < MAX_BRACKETS) {
            // put a new one in baby lets go :/
            bracket = {
                cx: bracket_region.x + (Math.random() * bracket_region.w),
                cy: bracket_region.y + (Math.random() * bracket_region.h),
                w: (MAX_BRACKET_SIZE - MIN_BRACKET_SIZE) * Math.random() + MIN_BRACKET_SIZE,
                h: (MAX_BRACKET_SIZE - MIN_BRACKET_SIZE) * Math.random() + MIN_BRACKET_SIZE
            };
            brackets.push(bracket);
        } else {
            while (brackets.length >= MAX_BRACKETS) { brackets.shift(); }
        }
    }
    bracket_frame_count += 1;



    crosshair_region = bracket_region; // this feels like it should be either the same or a scaled down version
    if (crosshair_frame_count >= CROSSHAIRS_FRAMES_PER_UPDATE) {
        crosshair_frame_count = 0;
        if (crosshairs.length < MAX_CROSSHAIRS) {
            // yeah man. new one. wow.
            crosshair = {
                cx: crosshair_region.x + (Math.random() * crosshair_region.w),
                cy: crosshair_region.y + (Math.random() * crosshair_region.h),
                size: (MAX_CROSSHAIR_SIZE - MIN_CROSSHAIR_SIZE) * Math.random() + MIN_CROSSHAIR_SIZE
            };
            //
            // if you want to make it so that not every frame has a new crosshairs you can make % chance that size gets set to 0
            //
            crosshairs.push(crosshair);
        } else {
            while (crosshairs.length >= MAX_CROSSHAIRS) { crosshairs.shift(); }
        }
    }
    crosshair_frame_count += 1;
}

function draw_censor_effect() {
    abs_context.clearRect(0, 0, abs_canvas.width, abs_canvas.height);
    
    // censor boxes
    abs_context.fillStyle = "black";
    for (let i = 0; i < censor_boxes.length; i++) {
        abs_context.fillRect(
            censor_boxes[i].cx - censor_boxes[i].w/2,
            censor_boxes[i].cy - censor_boxes[i].h/2,
            censor_boxes[i].w,
            censor_boxes[i].h
        );
    }

    // selector boxes
    abs_context.strokeStyle = "white";
    abs_context.lineWidth = 10;
    for (let i = 0; i < selector_boxes.length; i++) {
        abs_context.strokeRect(
            selector_boxes[i].cx - selector_boxes[i].w/2,
            selector_boxes[i].cy - selector_boxes[i].h/2,
            selector_boxes[i].w,
            selector_boxes[i].h
        );
    }

    // bracket
    // dont need to set strokestyle and width cuz its already set
    abs_context.lineWidth = 15;
    for (let i = 0; i < brackets.length; i++) {
        // do need to manually draw this fucking thing tho
        // leftside
        abs_context.beginPath();
        abs_context.moveTo(brackets[i].cx - brackets[i].w/2 + 0.1*brackets[i].w, brackets[i].cy - brackets[i].h/2); // move to starting point
        abs_context.lineTo(brackets[i].cx - brackets[i].w/2, brackets[i].cy - brackets[i].h/2); // line to top-left corner
        abs_context.lineTo(brackets[i].cx - brackets[i].w/2, brackets[i].cy + brackets[i].h/2); // line to bottom-left corner
        abs_context.lineTo(brackets[i].cx - brackets[i].w/2 + 0.1*brackets[i].w, brackets[i].cy + brackets[i].h/2); // line to ending point
        abs_context.stroke();
        // rightside
        abs_context.beginPath();
        abs_context.moveTo(brackets[i].cx + brackets[i].w/2 - 0.1*brackets[i].w, brackets[i].cy - brackets[i].h/2); // move to starting point
        abs_context.lineTo(brackets[i].cx + brackets[i].w/2, brackets[i].cy - brackets[i].h/2); // line to top-right corner
        abs_context.lineTo(brackets[i].cx + brackets[i].w/2, brackets[i].cy + brackets[i].h/2); // line to bottom-right corner
        abs_context.lineTo(brackets[i].cx + brackets[i].w/2 - 0.1*brackets[i].w, brackets[i].cy + brackets[i].h/2); // line to ending point
        abs_context.stroke();
    }



    // crosshairs
    for (let i = 0; i < crosshairs.length; i++) {
        if (crosshair_img.complete) {
            abs_context.drawImage(
                crosshair_img, 
                crosshairs[i].cx - crosshairs[i].size/2,
                crosshairs[i].cy - crosshairs[i].size/2,
                crosshairs[i].size,
                crosshairs[i].size
            );
        }
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


