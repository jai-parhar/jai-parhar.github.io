const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

class WebSegment {
    constructor(x1, y1, x2, y2, webLength, res=40) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.webLength = webLength;
        this.res = res;
        this.points = this.solvePoints();
    }

    // Fuck it I barely understand the math here, thank god for tutorials and stackoverflow
    solvePoints() {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;

        const straightDistance = Math.sqrt(dx * dx + dy * dy);

        // Rope cannot be shorter than straight-line distance
        if (this.webLength < straightDistance) {
            this.webLength = straightDistance;
        }

        // Nearly straight
        if (this.webLength <= straightDistance * 1.000001) {
            const points = [];
            for (let i = 0; i <= this.res; i++) {
                const t = i / this.res;
                points.push({
                    x: this.x1 + dx * t,
                    y: this.y1 + dy * t
                });
            }
            return points;
        }


        // Vertical case
        if (Math.abs(dx) < 0.0001) {
            const points = [];
            for (let i = 0; i <= this.res; i++) {
                const t = i / this.res;
                points.push({
                    x: this.x1,
                    y: this.y1 + dy * t
                });
            }
            return points;
        }
        
        // To deal with scope shit 
        let x1 = this.x1;
        let y1 = this.y1;
        let x2 = this.x2;
        let y2 = this.y2;

        // Make order easier to work with
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        const D = x2 - x1;
        const H = y2 - y1;

        const midpoint = (x1 + x2) / 2;
        const halfWidth = D / 2;

        // Finds parameters given an a
        function getParameters(a) {

            const sinhTerm = Math.sinh(halfWidth / a);
            const s = Math.asinh(-H / (2 * a * sinhTerm));

            const x0 = midpoint - a * s;
            const length = 2 * a * sinhTerm * Math.cosh(s);

            return { x0: x0, length: length};
        }


        // Bin search for the correct val for a
        let low = 0.0001;
        let high = Math.max(D, Math.abs(H));
        while (getParameters(high).length > this.webLength) {
            high *= 2;
        }
        for (let iteration = 0; iteration < 100; iteration++) {
            const a = (low + high) / 2;
            const currentLength = getParameters(a).length;
            if (currentLength > this.webLength) {
                low = a;
            } else {
                high = a;
            }
        }

        const a = (low + high) / 2;
        const parameters = getParameters(a);
        const x0 = parameters.x0;
        const c = y1 + a * Math.cosh((x1 - x0) / a);
        
        // Generate the points man fuck idc
        const points = [];
        for (let i = 0; i <= this.res; i++) {
            const t = i / this.res;
            const x = x1 + (x2 - x1) * t;
            const y = -a * Math.cosh((x - x0) / a) + c;
            points.push({
                x: x,
                y: y
            });
        }

        // We swapped endpoint order maybe, swap back if you did
        if (this.x1 > this.x2) {
            points.reverse();
        }

        return points;
    }

    // So we can move it
    updateParams(params = {}) {
        if (params.x1 !== undefined) { this.x1 = params.x1; }
        if (params.y1 !== undefined) { this.y1 = params.y1; }
        if (params.x2 !== undefined) { this.x2 = params.x2; }
        if (params.y2 !== undefined) { this.y2 = params.y2; }
        if (params.webLength !== undefined) { this.webLength = params.webLength; }
        if (params.res !== undefined) { this.res = params.res; }

        this.points = this.solvePoints();
    }

    draw(context, drawWidth=2, webColour="white") {
        context.beginPath();

        context.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y);
        }

        context.strokeStyle = webColour;
        context.lineWidth = drawWidth;

        context.stroke();
    }
}


const SIZE = 50;
const SPEED_SCALER = 5;
const TURN_SCALER = 1;
const MAX_WALKSPEED = 4; // set to 3-5 normally
const MAX_TURNSPEED = 0.08; // set to 0.08 normally
const posThreshold = SIZE/8;
const angleThreshold = 0.05;
const SPRITES = [
    new Image(), new Image(), new Image()
];
const framesPerSprite = 10;
SPRITES[0].src = "./res/spiderneutral.png";
SPRITES[1].src = "./res/spiderspritestep.png";
SPRITES[2].src = "./res/spiderspritestepflipped.png";
class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.desiredx = x;
        this.desiredy = y;
        this.theta = 0;
        this.desiredtheta = 0;
        this.walking = false;
        this.moving = false; // turning + walking
        this.animate = false;
        this.animFrame = 0;
        this.animFrameCount = 0;
    }

    walkTo(x, y) {
        this.desiredx = x - SIZE/2;
        this.desiredy = y - SIZE/2;
    }

    update() {
        this.animFrameCount += 1;

        // Set desired point to move to
        if (Math.abs(this.desiredx - this.x) <= posThreshold && // check if already close enough to position
            Math.abs(this.desiredy - this.y) <= posThreshold) {
                this.x = this.desiredx;
                this.y = this.desiredy;
                this.moving = false;
                this.walking = false;
                this.animate = false;
        } else { // if not already close enough
            // find angle to get to position
            this.moving = true;
            this.walking = true;
            this.desiredtheta = Math.atan2(-(this.desiredy - this.y), this.desiredx - this.x);

            // Manual angle checks idk why the spider still turns wrong but this doesnt hurt yet
            // I feel like this shouldnt actually do anything but removing these lines fucking bricks it
            if (this.theta > Math.PI) { this.theta -= 2 * Math.PI; }
            if (this.theta < -Math.PI) { this.theta += 2 * Math.PI; }
            if (this.desiredtheta > Math.PI) { this.desiredtheta -= 2 * Math.PI; } // desiredtheta being out of range should be impossible
            if (this.desiredtheta < -Math.PI) { this.desiredtheta += 2 * Math.PI; } // But just in case

            // Turning
            if (Math.abs(this.desiredtheta - this.theta) > angleThreshold) { // check if angle NOT close enough to desired angle
                this.animate = true;

                // Correct eq for finding angle difference when shit sucks i die!
                let deltaTheta = this.desiredtheta - this.theta;
                deltaTheta = ((deltaTheta + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
                this.theta += clamp(deltaTheta, -MAX_TURNSPEED, MAX_TURNSPEED);
                
                // difference between angles is more than 90 degrees, dont start moving until youre facing the right way
                if (2*Math.abs(deltaTheta) > (Math.PI/2)) {
                    this.moving = true;
                    this.walking = false;
                }
                else {
                    this.moving = true;
                    this.walking = true;
                }
            } else {
                this.theta = this.desiredtheta;
            }

        }

        // Move
        if (this.walking) {
            this.animate = true;
            this.x += MAX_WALKSPEED * Math.cos(this.theta);
            this.y -= MAX_WALKSPEED * Math.sin(this.theta);
        }

        // Animate
        if (this.animate) {
            if (this.animFrameCount >= framesPerSprite) {
                this.animFrame += 1;
                this.animFrameCount = 0;
            }
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + SIZE/2, this.y + SIZE/2);
        context.rotate(-Math.PI/2 - this.theta);
        context.imageSmoothingEnabled = false;
        if (!this.animate) {
            context.drawImage(SPRITES[0], -SIZE/2, -SIZE/2, SIZE, SIZE);
        }
        else {
            if (this.animFrame % 2) {
                context.drawImage(SPRITES[1], -SIZE/2, -SIZE/2, SIZE, SIZE);
            } else {
                context.drawImage(SPRITES[2], -SIZE/2, -SIZE/2, SIZE, SIZE);
            }
        }

        context.restore();
    }
    
}

const WEBSAG = 0.001; // Added % length to web to make it sag a bit
const MIN_WEBLENGTH = 0.1;
// rewrite of spiderweb class
class SpiderWeb {
    constructor(spider) {
        this.spider = spider;
        this.webSegs = [];
        this.path = [];
        this.attached = false;
        this.pathing = false;
    }

    // Add a node but don't overwrite
    addNode(x, y) {
        if (!this.spider.moving) {
            this.forceNode(x, y);
        }
    }

    // fugging put a new one in there who cares man shit
    forceNode(x, y) {
        this.webSegs.push(new WebSegment(this.spider.x + SIZE/2, 
                this.spider.y + SIZE/2, this.spider.x + SIZE/2, this.spider.y + SIZE/2, MIN_WEBLENGTH));
        this.attached = true;
        this.spider.walkTo(x, y);
    }

    // move spider to location overwriting everything else
    forceSpider(x, y) {
        this.spider.walkTo(x, y);
    }

    // move spider but dont like. be annoying about it.
    moveSpider(x, y) {
        if(!this.spider.moving) {
            this.forceNode(x, y);
        }
    }

    // stop to go eat fly and then return
    eatFly(fly) {
        // First check if this is the first fly that we are seeing after pathing or not
        if (!this.goEatFly && !this.returningFromFly) { // Not already on the way to eat a fly and not coming back from eating a fly
            
            this.returnPoint = {x:this.spider.x + SIZE/2, y:this.spider.y + SIZE/2}; // place we stopped at

            this.returnAttached = this.attached; // do we need to pick back up the web when we get back?
        }

        this.targetFly = fly; // set the target fly

        this.goEatFly = true; // we are heading to a fly
        this.returningFromFly = false; // which means we aren't coming back from the fly
        
        this.attached = false; // drop the web
        this.forceSpider(this.targetFly.x + FLY_SIZE/2, this.targetFly.y + FLY_SIZE/2); // set target to the fly
    }

    update() {
        
        // Update the spider's movement and animations
        this.spider.update();

        // If we have a web attached, update its position to follow
        if (this.webSegs.length != 0 && this.attached) {
            let dist = Math.sqrt((this.spider.x + SIZE/2 - this.webSegs.at(-1).x1)**2 
                        + (this.spider.y + SIZE/2 - this.webSegs.at(-1).y1)**2);
            let scaledDist = (1 + WEBSAG) * dist;
            this.webSegs.at(-1).updateParams({x2: this.spider.x + SIZE/2, y2: this.spider.y + SIZE/2, webLength: scaledDist});
        }

        if (this.goEatFly) { // if there is a fly i need to go eat

            if (this.targetFly.eaten) { // If the fly is already eaten, acknowledge that we are done eating and need to go return
                this.goEatFly = false;
                this.returningFromFly = true;
            }

            if (!this.spider.moving) { // got to the fly
                this.targetFly.eaten = true; // fly set to eaten, in the next update cycle itll start returning
            }

        } else { // no flies to eat!

            if (this.returningFromFly) { // got the fly, coming back

                // Path to return point
                this.forceSpider(this.returnPoint.x, this.returnPoint.y);

                if (!this.spider.moving 
                && (Math.abs(this.spider.x + SIZE/2 - this.returnPoint.x) < 0.01 
                && Math.abs(this.spider.y + SIZE/2 - this.returnPoint.y) < 0.01 )) { 
                    // Are we at return point? we need to go back to what we were doing
                    // Problem! We are checking if the spider is moving, but in this update cycle, the spider will not have updated this!
                    // Possible solutions: check if we are close enough to the point, or manually set spider moving to be true
                    // Cant do the second, as then we never know if we are back!
                    
                    this.returningFromFly = false; // we're done getting back

                    this.attached = this.returnAttached; // pick the web back up

                    // start pathing back to the point we were going to!
                    if (this.pathing) {
                        this.forceSpider(this.path[this.currPathIndex].x, this.path[this.currPathIndex].y);
                    }

                    // This works in the case where the spider dropped a web, but what if it didnt drop a web!
                }
            }
            else if (this.pathing) { 
                // not returning from fly, but want to keep pathing

                if (!this.spider.moving && 
                (Math.abs(this.spider.x + SIZE/2 - this.path[this.currPathIndex].x) < 0.01 &&
                Math.abs(this.spider.y + SIZE/2 - this.path[this.currPathIndex].y) < 0.01 )) {
                    // We are at this point!

                    this.currPathIndex += 1;

                    if (this.currPathIndex < this.path.length) {
                         // get ready for next point

                        if (this.path[this.currPathIndex].noweb) { // dont lay web if this is true, as just moving to next point
                            this.attached = false;
                            this.forceSpider(this.path[this.currPathIndex].x, this.path[this.currPathIndex].y);
                        } else {
                            this.forceNode(this.path[this.currPathIndex].x, this.path[this.currPathIndex].y); // start laying web
                        }

                    } else {
                        // all done!
                        this.pathing = false; 
                        this.path = [];
                    }



                }


            }
        }
    }

    drawWeb(context, colour="white") {
        for (let i = 0; i < this.webSegs.length; i++) {
            this.webSegs[i].draw(context, colour);
        }
    }

    drawSpider(context) {
        this.spider.draw(context);
    }

    spinWebAlongPath(path) {
        if (!this.pathing) { // check if already pathing
            this.path = path;
            this.pathing = true;
            this.currPathIndex = 0;
        }
        this.forceSpider(path[0].x, path[0].y);
    }
}



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

function generatePathFromWebNodes(web) {
    let path = [];

    // STEP 0: GO TO CENTER OF THE WEB TO START
    path.push({x: web[0][0].x, y: web[0][0].y, noweb:true});

    const spokes = web[1].length; // num points in a ring
    const rings = web.length - 1; // num points along a spoke, dont include center point 

    // STEP 1: BUILD THE SPOKES
    for (let s = 0; s < spokes; s++) {
        path.push({x: web[0][0].x, y: web[0][0].y, noweb:false});
        for (let r = 1; r <= rings; r++) {
            path.push({x: web[r][s].x, y: web[r][s].y, noweb:false}); // add the spoke
        }
        path.push({x: web[0][0].x, y: web[0][0].y, noweb:true}); // return to center
    }

    // STEP 2: BUILD THE RINGS
    for (let r = rings; r >= 1; r--) {

        let start = Math.floor(Math.random() * spokes); // start at a random spoke each time
        
        path.push({x: web[r][start].x, y: web[r][start].y, noweb: true}); // go to spiral starting point

        for (let i = 0; i < spokes; i++) {
            let s = (start + i) % spokes;
            path.push({x: web[r][s].x, y:web[r][s].y, noweb:false});
        }
        path.push({x: web[r][start].x, y: web[r][start].y, noweb: false}); // finish the ring
    }

    return path;
}


const FLY_SPEED = 8;
const FLY_SIZE = 11/17 * SIZE;
const FLY_MIN_FRAMES_PER_DIRECTION = Math.floor(0.05 * 60); // Running at 60 fps
const FLY_MAX_FRAMES_PER_DIRECTION = Math.floor(0.4 * 60); // Running at 60 fps
const FLY_MAX_TURNSPEED = 0.06;
const FLY_SPRITES = [
    new Image(), new Image()
];
const FLY_framesPerSprite = 1;
FLY_SPRITES[0].src = "./res/flyframe1.png";
FLY_SPRITES[1].src = "./res/flyframe2.png";
const FLY_BORDER_MARGIN = 200; // Margin for where the fly should start coming back
const FLY_CENTER_STEERING_SCALE = 0.5; // idk what to use but higher will lock it more towards the center, dont go higher than 1 or itll fly off
const FLY_HITBOX_RADIUS = 0.25 * 11/17 * SIZE;
class Fly {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.theta = 2 * (Math.random() - 0.5) * Math.PI;
        this.desiredtheta = 2 * (Math.random() - 0.5) * Math.PI;
        this.moving = true;
        this.animate = false;
        this.animFrame = 0;
        this.animFrameCount = 0;
        this.framesInDirection = 0;
        this.currFramesPerDirection = Math.random() * (FLY_MAX_FRAMES_PER_DIRECTION - FLY_MIN_FRAMES_PER_DIRECTION) 
                                            + FLY_MIN_FRAMES_PER_DIRECTION;
        this.eaten = false;
        this.lastTestedSegmentIndex = -1;
    }

    update(windowW, windowH) {
        this.framesInDirection += 1;

        // Handle movement stuff
        if (this.moving) {
            this.x += FLY_SPEED * Math.cos(this.theta);
            this.y -= FLY_SPEED * Math.sin(this.theta);

            if (this.framesInDirection >= this.currFramesPerDirection) {
                this.desiredtheta += Math.PI * (Math.random()-0.5); // random angle between -pi/2 and pi/2
                this.framesInDirection = 0; // reset frame counter

                // generate new length of time for fly to go straight
                this.currFramesPerDirection = Math.random() * (FLY_MAX_FRAMES_PER_DIRECTION - FLY_MIN_FRAMES_PER_DIRECTION) 
                                            + FLY_MIN_FRAMES_PER_DIRECTION;
            }

            // Handle steering back to center of screen
            if (this.x < FLY_BORDER_MARGIN || this.x > windowW - FLY_BORDER_MARGIN || // handles x
                this.y < FLY_BORDER_MARGIN || this.y > windowH - FLY_BORDER_MARGIN) { // handles y
                let centerTheta = Math.atan2(-(windowH / 2 - this.y), windowW / 2 - this.x); // find angle to center

                // Steering desired theta towards center
                let center_deltaTheta = centerTheta - this.desiredtheta;
                center_deltaTheta = ((center_deltaTheta + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
                
                this.desiredtheta += FLY_CENTER_STEERING_SCALE * center_deltaTheta;
           }

           let deltaTheta = this.desiredtheta - this.theta;
            deltaTheta = ((deltaTheta + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI; // some bs that handles delta angles
            this.theta += clamp(deltaTheta, -FLY_MAX_TURNSPEED, FLY_MAX_TURNSPEED);
        }

        // Handle animation stuff
        this.animate = this.moving; // These are seperate rn in case i need to change, also basing the code on the spider code
        if (this.animate) {
            if (this.animFrameCount > FLY_framesPerSprite) {
                this.animFrame += 1;
                this.animFrameCount = 0;
            }
            this.animFrameCount += 1;
        }
    }

    checkSpiderWebCollisions(spiderWeb, probability = 1) {
        for(let i = 0; i < spiderWeb.webSegs.length; i++) {
            if (i == this.lastTestedSegmentIndex) { // Skip testing this one if the fly didnt get stuck
                continue;
            }
            if (this.checkWebSegmentCollision(spiderWeb.webSegs[i])) { // did it collide?
                this.lastTestedSegmentIndex = i;
                if (Math.random() < probability) { // chance to get stuck?
                    return true;
                }
            }
        }
        return false;
    }

    checkWebSegmentCollision(webSeg) {
        // Calculate fly center
        let cx = this.x + FLY_SIZE/2;
        let cy = this.y + FLY_SIZE/2;

        // get segment vector
        let dx = webSeg.x2 - webSeg.x1;
        let dy = webSeg.y2 - webSeg.y1;

        // get vector from segment start to circle center
        let fx = cx - webSeg.x1;
        let fy = cy - webSeg.y1;

        // project circle center onto segment
        let t = (fx * dx + fy * dy) / (dx * dx + dy * dy);

        // clamp projection to segment
        t = Math.max(0, Math.min(1, t));

        // find closest point on segment
        let closestX = webSeg.x1 + t * dx;
        let closestY = webSeg.y1 + t * dy;

        return (cx - closestX)**2 + (cy - closestY)**2 <= FLY_HITBOX_RADIUS**2;
    }

    draw(context) {
        context.save();
        context.translate(this.x + FLY_SIZE/2, this.y + FLY_SIZE/2);
        context.rotate(Math.PI/2 - this.theta);
        context.imageSmoothingEnabled = false;
        
        context.drawImage(FLY_SPRITES[this.animFrame % 2], -FLY_SIZE/2, -FLY_SIZE/2, FLY_SIZE, FLY_SIZE);
        
        context.restore();
    }

    drawHitbox(context, colour="red") {
        context.fillStyle = colour;
        context.beginPath();
        context.arc(this.x + FLY_SIZE/2, this.y + FLY_SIZE/2, FLY_HITBOX_RADIUS, 0, 2 * Math.PI);
        context.fill();
    }
}