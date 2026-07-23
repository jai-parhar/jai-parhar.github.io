
import {
    FaceDetector,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35";

const webcam = document.getElementById("webcam");

const mirror_canvas = document.getElementById("mirror-canvas");
const mirror_context = mirror_canvas.getContext("2d");

function resizeCanvas() {
    mirror_canvas.width = mirror_canvas.clientWidth;
    mirror_canvas.height = mirror_canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);

async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({video: { facingMode: "user" }, audio: false});
    webcam.srcObject = stream;
    await webcam.play();
    resizeCanvas();
    requestAnimationFrame(draw);
}



let face_detector;
async function initializeFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );

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


    const faces = face_detector.detectForVideo(webcam,performance.now());
    for (let i = 0; i < faces.detections.length; i++) {
        const box = faces.detections[i].boundingBox;

        // convert webcam coordinates to mirror_canvas coordinates
        const scaleX = mirror_canvas.width / crop_w;
        const scaleY = mirror_canvas.height / crop_h;

        let mc_x = (box.originX - crop_x) * scaleX;
        let mc_y = (box.originY - crop_y) * scaleY;
        let mc_w = box.width * scaleX;
        let mc_h = box.height * scaleY;

        // flip the bounding box horizontally to match the webcam image
        mc_x = mirror_canvas.width - mc_x - mc_w;

        mirror_context.strokeStyle = "lime";
        mirror_context.lineWidth = 4;

        mirror_context.strokeRect(mc_x, mc_y, mc_w, mc_h);
    }
    

    requestAnimationFrame(draw);
}



await initializeFaceDetector();
await startWebcam();