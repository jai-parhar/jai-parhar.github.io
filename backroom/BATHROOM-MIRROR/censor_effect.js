// All sizes relative to face bounding box, where 1 is the full size
const MAX_CENSOR_BOXES = 40;
const MIN_CENSOR_SIZE = 0.1; const MAX_CENSOR_SIZE = 0.9; 
const CENSOR_REGION_SCALE = 0.9;

const SELECTOR_FRAMES_PER_UPDATE = 8;
const MAX_SELECTOR_BOXES = 3;
const MIN_SELECTOR_SIZE = 0.5; const MAX_SELECTOR_SIZE = 0.7;
const SELECTOR_REGION_SCALE = 0.5;

const BRACKET_FRAMES_PER_UPDATE = 12;
const MAX_BRACKETS = 2;
const MIN_BRACKET_SIZE = 0.6; const MAX_BRACKET_SIZE = 0.9;
const BRACKET_REGION_SCALE = SELECTOR_REGION_SCALE;

const CROSSHAIRS_FRAMES_PER_UPDATE = 16;
const MAX_CROSSHAIRS = 3;
const MIN_CROSSHAIR_SIZE = 0.1; const MAX_CROSSHAIR_SIZE = 0.4;
const CROSSHAIR_REGION_SCALE = SELECTOR_REGION_SCALE;
const crosshair_img = new Image();
crosshair_img.src = "res/crosshairs.png";

class CensorEffect {
    constructor() {
        this.censor_region = {x:0, y:0, w:0, h:0};
        this.censor_boxes = [];

        this.selector_frame_count = 0;
        this.selector_region = {x:0, y:0, w:0, h:0};
        this.selector_boxes = [];

        this.bracket_frame_count = 0;
        this.bracket_region = {x:0, y:0, w:0, h:0};
        this.brackets = [];
        
        this.crosshair_frame_count = 0;
        this.crosshair_region = {x:0, y:0, w:0, h:0};
        this.crosshairs = [];
    }

    update(face_box) {
        let face_cx = face_box.x + face_box.w/2;
        let face_cy = face_box.y + face_box.h/2;

        
        
        // Update the regions

        this.censor_region = {
            x: face_cx - CENSOR_REGION_SCALE * face_box.w/2,
            y: face_cy - CENSOR_REGION_SCALE * face_box.h/2,
            w: CENSOR_REGION_SCALE * face_box.w,
            h: CENSOR_REGION_SCALE * face_box.h
        };
        this.selector_region = {
            x: face_cx - SELECTOR_REGION_SCALE * face_box.w/2,
            y: face_cy - SELECTOR_REGION_SCALE * face_box.h/2,
            w: SELECTOR_REGION_SCALE * face_box.w,
            h: SELECTOR_REGION_SCALE * face_box.h
        };
        this.bracket_region = {
            x: face_cx - BRACKET_REGION_SCALE * face_box.w/2,
            y: face_cy - BRACKET_REGION_SCALE * face_box.h/2,
            w: BRACKET_REGION_SCALE * face_box.w,
            h: BRACKET_REGION_SCALE * face_box.h
        };
        this.crosshair_region = {
            x: face_cx - CROSSHAIR_REGION_SCALE * face_box.w/2,
            y: face_cy - CROSSHAIR_REGION_SCALE * face_box.h/2,
            w: CROSSHAIR_REGION_SCALE * face_box.w,
            h: CROSSHAIR_REGION_SCALE * face_box.h
        };



        // Spawn in the effects

        if (this.censor_boxes.length < MAX_CENSOR_BOXES) {
            // spawn in a censor box
            this.censor_boxes.push({
                cx: this.censor_region.x + (Math.random() * this.censor_region.w),
                cy: this.censor_region.y + (Math.random() * this.censor_region.h),
                w: ((MAX_CENSOR_SIZE - MIN_CENSOR_SIZE) * Math.random() + MIN_CENSOR_SIZE) * face_box.w,
                h: ((MAX_CENSOR_SIZE - MIN_CENSOR_SIZE) * Math.random() + MIN_CENSOR_SIZE) * face_box.h
            });
        } else { // if same or bigger
            while (this.censor_boxes.length >= MAX_CENSOR_BOXES) { this.censor_boxes.shift(); }
        }

        if (this.selector_frame_count >= SELECTOR_FRAMES_PER_UPDATE) {
            this.selector_frame_count = 0;
            if (this.selector_boxes.length < MAX_SELECTOR_BOXES) {
                // sopawn in a selector box
                this.selector_boxes.push({
                    cx: this.selector_region.x + (Math.random() * this.selector_region.w),
                    cy: this.selector_region.y + (Math.random() * this.selector_region.h),
                    w: ((MAX_SELECTOR_SIZE - MIN_SELECTOR_SIZE) * Math.random() + MIN_SELECTOR_SIZE) * face_box.w,
                    h: ((MAX_SELECTOR_SIZE - MIN_SELECTOR_SIZE) * Math.random() + MIN_SELECTOR_SIZE) * face_box.h
                });
            } else {
                while (this.selector_boxes.length >= MAX_SELECTOR_BOXES) { this.selector_boxes.shift(); }
            }
        }

        if (this.bracket_frame_count >= BRACKET_FRAMES_PER_UPDATE) {
            this.bracket_frame_count = 0;
            if (this.brackets.length < MAX_BRACKETS) {
                // put a new one in baby lets go :/
                this.brackets.push({
                    cx: this.bracket_region.x + (Math.random() * this.bracket_region.w),
                    cy: this.bracket_region.y + (Math.random() * this.bracket_region.h),
                    w: ((MAX_BRACKET_SIZE - MIN_BRACKET_SIZE) * Math.random() + MIN_BRACKET_SIZE) * face_box.w,
                    h: ((MAX_BRACKET_SIZE - MIN_BRACKET_SIZE) * Math.random() + MIN_BRACKET_SIZE) * face_box.h
                });
            } else {
                while (this.brackets.length >= MAX_BRACKETS) { this.brackets.shift(); }
            }
        }

        if (this.crosshair_frame_count >= CROSSHAIRS_FRAMES_PER_UPDATE) {
            this.crosshair_frame_count = 0;
            if (this.crosshairs.length < MAX_CROSSHAIRS) {
                // yeah man. new one. wow.
                let crosshair = {
                    cx: this.crosshair_region.x + (Math.random() * this.crosshair_region.w),
                    cy: this.crosshair_region.y + (Math.random() * this.crosshair_region.h),
                    size: ((MAX_CROSSHAIR_SIZE - MIN_CROSSHAIR_SIZE) * Math.random() + MIN_CROSSHAIR_SIZE) * face_box.w
                };
                //
                // if you want to make it so that not every frame has a new crosshairs you can make % chance that size gets set to 0
                //
                this.crosshairs.push(crosshair);
            } else {
                while (this.crosshairs.length >= MAX_CROSSHAIRS) { this.crosshairs.shift(); }
            }
        }



        // Update frame counts
        this.selector_frame_count += 1;
        this.bracket_frame_count += 1;
        this.crosshair_frame_count += 1;
    }
    
    draw(context) {
        context.fillStyle = "black";
        for (let i = 0; i < this.censor_boxes.length; i++) {
            context.fillRect(
                this.censor_boxes[i].cx - this.censor_boxes[i].w/2,
                this.censor_boxes[i].cy - this.censor_boxes[i].h/2,
                this.censor_boxes[i].w,
                this.censor_boxes[i].h
            );
        }

        // selector boxes
        context.strokeStyle = "white";
        context.lineWidth = 5;
        for (let i = 0; i < this.selector_boxes.length; i++) {
            context.strokeRect(
                this.selector_boxes[i].cx - this.selector_boxes[i].w/2,
                this.selector_boxes[i].cy - this.selector_boxes[i].h/2,
                this.selector_boxes[i].w,
                this.selector_boxes[i].h
            );
        }

        // bracket
        // dont need to set strokestyle and width cuz its already set
        context.lineWidth = 10;
        for (let i = 0; i < this.brackets.length; i++) {
            // do need to manually draw this fucking thing tho
            // leftside
            context.beginPath();
            context.moveTo(this.brackets[i].cx - this.brackets[i].w/2 + 0.1*this.brackets[i].w, this.brackets[i].cy - this.brackets[i].h/2); // move to starting point
            context.lineTo(this.brackets[i].cx - this.brackets[i].w/2, this.brackets[i].cy - this.brackets[i].h/2); // line to top-left corner
            context.lineTo(this.brackets[i].cx - this.brackets[i].w/2, this.brackets[i].cy + this.brackets[i].h/2); // line to bottom-left corner
            context.lineTo(this.brackets[i].cx - this.brackets[i].w/2 + 0.1*this.brackets[i].w, this.brackets[i].cy + this.brackets[i].h/2); // line to ending point
            context.stroke();
            // rightside
            context.beginPath();
            context.moveTo(this.brackets[i].cx + this.brackets[i].w/2 - 0.1*this.brackets[i].w, this.brackets[i].cy - this.brackets[i].h/2); // move to starting point
            context.lineTo(this.brackets[i].cx + this.brackets[i].w/2, this.brackets[i].cy - this.brackets[i].h/2); // line to top-right corner
            context.lineTo(this.brackets[i].cx + this.brackets[i].w/2, this.brackets[i].cy + this.brackets[i].h/2); // line to bottom-right corner
            context.lineTo(this.brackets[i].cx + this.brackets[i].w/2 - 0.1*this.brackets[i].w, this.brackets[i].cy + this.brackets[i].h/2); // line to ending point
            context.stroke();
        }



        // crosshairs
        for (let i = 0; i < this.crosshairs.length; i++) {
            if (crosshair_img.complete) {
                context.drawImage(
                    crosshair_img, 
                    this.crosshairs[i].cx - this.crosshairs[i].size/2,
                    this.crosshairs[i].cy - this.crosshairs[i].size/2,
                    this.crosshairs[i].size,
                    this.crosshairs[i].size
                );
            }
        }
    }
}