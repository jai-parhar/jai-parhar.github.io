

const SCRATCH_ANGLE_AMPLITUDE = Math.PI/16;
const SCRATCH_MIN_LENGTH = 0.02;
const SCRATCH_MAX_LENGTH = 0.20;
const SCRATCH_OFFSET_AMPLITUDE = 0.0001;

const MAX_SCRATCHES = 400;
const SCRATCH_WIDTH = 2;

class ScratchedEyesEffect {
    constructor() {
        this.eye1 = {cx: 0, cy: 0};
        this.eye2 = {cx: 0, cy: 0};
        this.face_size = 0;

        this.scratches = [];
    }

    update(detection) {
        this.eye1 = {norm_cx: detection.keypoints[0].x, norm_cy: detection.keypoints[0].y};
        this.eye2 = {norm_cx: detection.keypoints[1].x, norm_cy: detection.keypoints[1].y};
        this.face_size = detection.boundingBox.width;

        console.log(this.eye1);

        for (let i = 0; i < MAX_SCRATCHES; i++) {
            if (this.scratches.length < MAX_SCRATCHES) {
                if (Math.random() >= 0.5) {
                    this.scratches.push(generateScratch(this.eye1, this.face_size));
                } else {
                    this.scratches.push(generateScratch(this.eye2, this.face_size));
                }
            } else {
                while (this.scratches.length >= MAX_SCRATCHES) { this.scratches.shift(); }
            }
        }
    }

    draw(context) {
        context.lineWidth = SCRATCH_WIDTH;
        context.strokeStyle = "black";
        console.log(this.scratches);
        for (let i = 0; i < this.scratches.length; i++) {
            let start_x = context.canvas.width * this.scratches[i].norm_cx - (this.scratches[i].length * Math.cos(this.scratches[i].angle));
            let start_y = context.canvas.height * this.scratches[i].norm_cy - (this.scratches[i].length * Math.sin(this.scratches[i].angle));
            let end_x = context.canvas.width * this.scratches[i].norm_cx + (this.scratches[i].length * Math.cos(this.scratches[i].angle));
            let end_y = context.canvas.height * this.scratches[i].norm_cy + (this.scratches[i].length * Math.sin(this.scratches[i].angle));

            context.beginPath();
            context.moveTo(start_x, start_y);
            context.lineTo(end_x, end_y);
            context.stroke();
        }
    }
}

function generateScratch(eye, face_size) { // size here is face
    if (Math.random() >= 0.5) {
        return {norm_cx: 2 * (Math.random() - 0.5) * (SCRATCH_OFFSET_AMPLITUDE*face_size) + eye.norm_cx, 
            norm_cy: 2 * (Math.random() - 0.5) * (SCRATCH_OFFSET_AMPLITUDE*face_size) + eye.norm_cy, 
            length: (((SCRATCH_MAX_LENGTH - SCRATCH_MIN_LENGTH) * Math.random()) + SCRATCH_MIN_LENGTH) * face_size, 
            angle: 2 * (Math.random() - 0.5) * SCRATCH_ANGLE_AMPLITUDE + Math.PI/4};
    } else {
        return {norm_cx: 2 * (Math.random() - 0.5) * (SCRATCH_OFFSET_AMPLITUDE*face_size) + eye.norm_cx, 
            norm_cy: 2 * (Math.random() - 0.5) * (SCRATCH_OFFSET_AMPLITUDE*face_size) + eye.norm_cy, 
            length: (((SCRATCH_MAX_LENGTH - SCRATCH_MIN_LENGTH) * Math.random()) + SCRATCH_MIN_LENGTH) * face_size, 
            angle: 2 * (Math.random() - 0.5) * SCRATCH_ANGLE_AMPLITUDE - Math.PI/4};
    }
}