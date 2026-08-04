// doing effect by making a temporary small canvas, displaying the image on this, and then scaling it up
const face_follow_temp_canvas = document.createElement("canvas");
const face_follow_temp_context = face_follow_temp_canvas.getContext("2d");

class FaceFollowEffect {
    constructor() {
        this.face_box = {x:0, y:0, w:0, h:0}; 
        this.canvasAspectRatio = 1;
    }

    update(detection) {
        const box = detection.boundingBox;
        const face_box = ({x: box.originX, y: box.originY, w: box.width, h: box.height});

        this.face_box.h = face_box.h * 1.3;
        this.face_box.w = this.face_box.h * this.canvasAspectRatio;
        this.face_box.y = (face_box.y + face_box.h/2) - this.face_box.h/2 - this.face_box.h/14; // this last term is an offset
        this.face_box.x = (face_box.x + face_box.w/2) - this.face_box.w/2;

    }

    draw(context) {
        this.canvasAspectRatio = context.canvas.width / context.canvas.height;

        context.strokeRect(this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;

        face_follow_temp_canvas.width = context.canvas.width;
        face_follow_temp_canvas.height = context.canvas.height;

        face_follow_temp_context.imageSmoothingEnabled = false;
        face_follow_temp_context.mozImageSmoothingEnabled = false;
        face_follow_temp_context.webkitImageSmoothingEnabled = false;

        face_follow_temp_context.drawImage(context.canvas, this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h, 0, 0, face_follow_temp_canvas.width, face_follow_temp_canvas.height);

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(face_follow_temp_canvas, 0, 0, face_follow_temp_canvas.width, face_follow_temp_canvas.height, 0, 0, context.canvas.width, context.canvas.height);

    }
}