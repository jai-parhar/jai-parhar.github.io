const static_body_temp_canvas = document.createElement("canvas");
const static_body_temp_context = static_body_temp_canvas.getContext("2d");

class StaticBodyEffect {
    constructor() {
        this.segmentation_mask = null;
    }

    update(segmentation_mask) {
        this.segmentation_mask = segmentation_mask;
    }

    draw(context) {
        //context.strokeRect(this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;

        static_body_temp_canvas.width = this.segmentation_mask.width;
        static_body_temp_canvas.height = this.segmentation_mask.height;
        
        const width = this.segmentation_mask.width;
        const height = this.segmentation_mask.height;

        const data = this.segmentation_mask.getAsUint8Array();
        const imageData = new ImageData(this.segmentation_mask.width, this.segmentation_mask.height);

        for (let i = 0; i < data.length; i++) {
            if (data[i] > 0) {
                // foreground
                imageData.data[4 * i + 0] = 255;
                imageData.data[4 * i + 1] = 255;
                imageData.data[4 * i + 2] = 255;
                imageData.data[4 * i + 3] = 0;
            } else {
                // background
                const c = Math.floor(Math.random() * 255);
                imageData.data[4 * i + 0] = c;
                imageData.data[4 * i + 1] = c;
                imageData.data[4 * i + 2] = c;
                imageData.data[4 * i + 3] = 255;
            }
            
        }

        static_body_temp_context.putImageData(imageData, 0, 0);

        context.drawImage(static_body_temp_canvas, 0, 0, context.canvas.width, context.canvas.height);

    }
}