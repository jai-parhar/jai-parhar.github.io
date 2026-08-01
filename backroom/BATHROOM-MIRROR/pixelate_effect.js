const PIXEL_SIZE = 30;

// doing effect by making a temporary small canvas, displaying the image on this, and then scaling it up
const pixelate_temp_canvas = document.createElement("canvas");
const pixelate_temp_context = pixelate_temp_canvas.getContext("2d");

class PixelateEffect {
    constructor() {
        
    }

    update(data) {
        
    }

    draw(context) {
        //context.strokeRect(this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;

        pixelate_temp_canvas.width = Math.max(1, Math.ceil(context.canvas.width / PIXEL_SIZE));
        pixelate_temp_canvas.height = Math.max(1, Math.ceil(context.canvas.height / PIXEL_SIZE));

        pixelate_temp_context.imageSmoothingEnabled = false;
        pixelate_temp_context.mozImageSmoothingEnabled = false;
        pixelate_temp_context.webkitImageSmoothingEnabled = false;

        //pixelate_temp_context.drawImage(context.canvas, this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height);
        pixelate_temp_context.drawImage(context.canvas, 0, 0, context.canvas.width, context.canvas.height, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height);
        //context.drawImage(pixelate_temp_canvas, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height, this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.drawImage(pixelate_temp_canvas, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height, 0, 0, context.canvas.width, context.canvas.height);
    }
}