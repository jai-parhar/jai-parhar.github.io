// All sizes relative to face bounding box, where 1 is the full size
const MAX_CENSOR_BOXES = 40;
const MIN_CENSOR_SIZE = 0.1; const MAX_CENSOR_SIZE = 0.9; 
let censor_region = {x:0, y:0, w:0, h:0};
let censor_boxes = [];

const SELECTOR_FRAMES_PER_UPDATE = 8;
const MAX_SELECTOR_BOXES = 3;
const MIN_SELECTOR_SIZE = 0.5; const MAX_SELECTOR_SIZE = 0.7;
let selector_frame_count = 0;
let selector_region = {x:0, y:0, w:0, h:0};
let selector_boxes = [];

const BRACKET_FRAMES_PER_UPDATE = 12;
const MAX_BRACKETS = 2;
const MIN_BRACKET_SIZE = 0.6; const MAX_BRACKET_SIZE = 0.9;
let bracket_frame_count = 0;
let bracket_region = {x:0, y:0, w:0, h:0};
let brackets = [];

const CROSSHAIRS_FRAMES_PER_UPDATE = 16;
const MAX_CROSSHAIRS = 3;
const MIN_CROSSHAIR_SIZE = 0.1; const MAX_CROSSHAIR_SIZE = 0.4;
let crosshair_frame_count = 0;
let crosshair_region = {x:0, y:0, w:0, h:0};
let crosshairs = [];
const crosshair_img = new Image();
crosshair_img.src = "res/crosshairs.png";

class CensorEffect {
    constructor() {

    }

    update(face_box) {

    }
    
    draw(context) {

    }
}