
import {
    FaceDetector,
    ImageSegmenter,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35";

const webcam = document.getElementById("webcam");

const mirror_canvas = document.getElementById("mirror-canvas");
const mirror_context = mirror_canvas.getContext("2d", {
    willReadFrequently: true
});

const scaled_down_mirror_scale = 1/8;
const scaled_down_mirror_canvas = document.createElement("canvas");
const scaled_down_mirror_context = scaled_down_mirror_canvas.getContext("2d");

function resizeCanvas() {
    mirror_canvas.width = mirror_canvas.clientWidth;
    mirror_canvas.height = mirror_canvas.clientHeight;
    scaled_down_mirror_canvas.width = scaled_down_mirror_scale * mirror_canvas.width;
    scaled_down_mirror_canvas.height = scaled_down_mirror_scale * mirror_canvas.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({video: { facingMode: "user" }, audio: false});
    webcam.srcObject = stream;
    await webcam.play();
    resizeCanvas();
    requestAnimationFrame(draw);
}


let vision;
async function initializeMediaPipe() {
    vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );
}

let face_detector;
async function initializeFaceDetector() {
    face_detector = await FaceDetector.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "res/blaze_face_full_range.tflite"
            },
            runningMode: "VIDEO",
            minDetectionConfidence: 0.4
        }
    );
}

let image_segmenter;
let segmentation_mask;
async function initializeImageSegmenter() {
    image_segmenter = await ImageSegmenter.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "res/selfie_segmenter_landscape.tflite"//"res/selfie_multiclass_256x256.tflite"//"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float32/latest/selfie_segmenter.tflite"
            },
            runningMode: "VIDEO",
            outputCategoryMask: true
        }
    );
}







// selected_effect = "censor", "pixelate", "face_follow"
let possible_effects = [ "censor", "pixelate", "face_follow", "static_body" ];
let selected_effect = possible_effects[3];

const effects = [];

let face_result;

let segmentation_result;
let segmentation_timer = 0;

function draw() {

    mirror_context.save();
    mirror_context.translate(mirror_canvas.width, 0);
    mirror_context.scale(-1, 1); // to flip the image. yknow, like a MIRROR would.


    let crop_x, crop_y, crop_w, crop_h; // x,y,w,h for the section of the video we will take to draw
    if (webcam.videoWidth/webcam.videoHeight > mirror_canvas.width/mirror_canvas.height) {
        // Webcam has wider aspect ratio, crop sides of the image to match
        crop_h = webcam.videoHeight;
        crop_w = crop_h * (mirror_canvas.width/mirror_canvas.height);
        crop_x = (webcam.videoWidth - crop_w) / 2;
        crop_y = 0;
    } else {
        // Canvas has wider aspect ratio, crop top and bottom of the image to match
        crop_w = webcam.videoWidth;
        crop_h = crop_w * (mirror_canvas.height/mirror_canvas.width);
        crop_x = 0;
        crop_y = (webcam.videoHeight - crop_h) / 2;
    }

    mirror_context.drawImage(
        webcam,
        crop_x, crop_y, crop_w, crop_h,
        0, 0, mirror_canvas.width, mirror_canvas.height
    );
    
    mirror_context.restore();

    scaled_down_mirror_context.drawImage(mirror_canvas,
        0, 0, mirror_canvas.width, mirror_canvas.height,
        0, 0, scaled_down_mirror_canvas.width, scaled_down_mirror_canvas.height
    );
    // mirror_canvas now has the image we need
    // scaled_down_mirror_canvas has a scaled down version of the image we need


    if (performance.now() - segmentation_timer > 50) { // only run every 200 ms
        segmentation_result = image_segmenter.segmentForVideo(scaled_down_mirror_canvas, performance.now());
        segmentation_mask = segmentation_result.categoryMask;
        segmentation_timer = performance.now();
    }

    face_result = face_detector.detectForVideo(mirror_canvas,performance.now());
    while (effects.length < face_result.detections.length) { 
        // add new censor effects to handle
        // we will add a new element for every time we see multiple faces, but reuse the same index
        if (selected_effect === "censor") { effects.push(new CensorEffect()); }
        if (selected_effect === "pixelate") { effects.push(new PixelateEffect()); }
        if (selected_effect === "face_follow") { effects.push(new FaceFollowEffect()); }
        if (selected_effect === "static_body") { effects.push(new StaticBodyEffect()); }
    }
    for (let i = 0; i < face_result.detections.length; i++) {
        const box = face_result.detections[i].boundingBox;

        effects[i].update({x: box.originX, y: box.originY, w: box.width, h: box.height}, segmentation_mask);
        effects[i].draw(mirror_context);
    }
    

    requestAnimationFrame(draw);
}


await initializeMediaPipe();
await initializeFaceDetector();
await initializeImageSegmenter();
await startWebcam();