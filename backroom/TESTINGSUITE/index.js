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


function generateWebNodes(cx, cy, width, height, options = {}) {

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    const spokes = options.spokes ?? randomInt(10, 14);
    const rings = options.rings ?? randomInt(7, 12);

    const minRingSpacing = options.minRingSpacing ?? 20;
    const maxRingSpacing = options.maxRingSpacing ?? 35;

    const spokeAngleJitter = options.spokeAngleJitter ?? 0.1;
    const ringRotationJitter = options.ringRotationJitter ?? 0.06;

    const ringWobble = options.ringWobble ?? 8;
    const pointJitter = options.pointJitter ?? 3;


    // get distance to edge of window depending on the angle
    function distanceToEdge(angle) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let distance = Infinity;
        if (dx > 0) { distance = Math.min(distance, (width - cx) / dx); }
        else if (dx < 0) { distance = Math.min(distance, -cx / dx); }

        if (dy > 0) { distance = Math.min(distance, (height - cy) / dy); }
        else if (dy < 0) { distance = Math.min(distance, -cy / dy); }

        return distance;
    }

    let web = []; // web points
    let spokesData = []; // spoke angles and lengths
    for (let s = 0; s < spokes; s++) { // generate the spokes by adjusting by angles randomly and seeing to edge
        let angle = s * Math.PI * 2 / spokes + random(-spokeAngleJitter, spokeAngleJitter);
        spokesData.push({ angle: angle, length: distanceToEdge(angle)});
    }

    // add centerpoint to web
    web.push([{x: cx, y: cy, ring: 0, spoke: -1}]);

    // generate the rings
    for (let r = 1; r <= rings; r++) {
        let ring = [];
        let progress = r / rings;
        for (let s = 0; s < spokes; s++) {
            let spoke = spokesData[s];
            let angle = spoke.angle;
            let distance = spoke.length * progress;

            // only distort inner rings angles, distorting outer ones changes if outer touches edge so cant do that
            if (r !== rings) {
                distance += random(-ringWobble, ringWobble);
                angle += random(-ringRotationJitter, ringRotationJitter);
            }

            let x = cx + Math.cos(angle) * distance;
            let y = cy + Math.sin(angle) * distance;

            // extra point jitter on rings, this makes it look very slightly better
            // dont do to outer ring because then it wont touch edge
            if (r !== rings) {
                x += random(-pointJitter, pointJitter);
                y += random(-pointJitter, pointJitter);
            }

            ring.push({x, y, ring: r, spoke: s});
        }
        web.push(ring);
    }
    return web;
}

web = generateWebNodes(windowW/4, windowH/4, windowW, windowH);

function update() {
    // Performs one step of the update
    //testWeb.updateParams({x2: mouseX, y2:mouseY});
    //testSpider.update();
    //testWeb.update();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    //testWeb.draw(context);
    //testSpider.draw(context);
    // testWeb.drawSpider(context);
    // testWeb.drawWeb(context);
    context.save();

    context.strokeStyle = "white";
    context.lineWidth = 1;

    // Draw radial strands
    context.beginPath();

    const spokes = web[1].length;

    for (let s = 0; s < spokes; s++) {

        context.moveTo(web[0][0].x, web[0][0].y);

        for (let r = 1; r < web.length; r++) {
            context.lineTo(web[r][s].x, web[r][s].y);
        }
    }

    context.stroke();

    // Draw spiral strands
    context.beginPath();

    for (let r = 1; r < web.length; r++) {

        for (let s = 0; s < spokes; s++) {

            const current = web[r][s];
            const next = web[r][(s + 1) % spokes];

            context.moveTo(current.x, current.y);
            context.lineTo(next.x, next.y);
        }
    }

    context.stroke();

    // // Draw points (debugging)
    // context.fillStyle = "red";

    // for (const ring of web) {

    //     for (const point of ring) {

    //         context.beginPath();
    //         context.arc(point.x, point.y, 3, 0, Math.PI * 2);
    //         context.fill();
    //     }
    // }

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