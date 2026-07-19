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
const MAX_WALKSPEED = 5;
const MAX_TURNSPEED = 0.08;
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
            //this.moving = true;
            this.desiredtheta = Math.atan2(-(this.desiredy - this.y), this.desiredx - this.x);
        }

        // Manual angle checks idk why the spider still turns wrong but this doesnt hurt yet
        // I feel like this shouldnt actually do anything but removing these lines fucking bricks it
        if (this.theta > Math.PI) { this.theta -= 2 * Math.PI; }
        if (this.theta < Math.PI) { this.theta += 2 * Math.PI; }
        if (this.desiredtheta > Math.PI) { this.desiredtheta -= 2 * Math.PI; } // desiredtheta being out of range should be impossible
        if (this.desiredtheta < Math.PI) { this.desiredtheta += 2 * Math.PI; } // But just in case

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
class SpiderWeb {
    constructor(spider) {
        this.spider = spider;
        this.webSegs = [];
        this.path = [];
        this.attached = false;
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
        this.attached = false;
        this.spider.walkTo(x, y);
    }

    // move spider but dont like. be annoying about it.
    moveSpider(x, y) {
        if(!this.spider.moving) {
            this.forceNode(x, y);
        }
    }

    update() {
        this.spider.update();
        if (this.webSegs.length != 0 && this.attached) {
            let dist = Math.sqrt((this.spider.x + SIZE/2 - this.webSegs.at(-1).x1)**2 
                        + (this.spider.y + SIZE/2 - this.webSegs.at(-1).y1)**2);
            let scaledDist = (1 + WEBSAG) * dist;
            this.webSegs.at(-1).updateParams({x2: this.spider.x + SIZE/2, y2: this.spider.y + SIZE/2, webLength: scaledDist});
        }

        if (!this.spider.moving && this.pathing) {
            if (this.currPathIndex < this.path.length) {
                if (this.path[this.currPathIndex].noweb) { // dont lay web if this is true
                    this.forceSpider(this.path[this.currPathIndex].x, this.path[this.currPathIndex].y);
                } else {
                    this.forceNode(this.path[this.currPathIndex].x, this.path[this.currPathIndex].y);
                }
                this.currPathIndex += 1;
            } else {
                this.pathing = false;
                this.path = [];
            }
        }
    }

    drawWeb(context) {
        for (let i = 0; i < this.webSegs.length; i++) {
            this.webSegs[i].draw(context);
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

    console.log(web);

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