const PIXELATE_MIRROR_PIXEL_SIZE = 5;
const PIXELATE_MIRROR_CONTRAST = 2.9;
const PIXELATE_MIRROR_BRIGHTNESS = 0.19;

const PIXELATE_BACKGROUND_PIXEL_SIZE = 5;
const PIXELATE_BACKGROUND_CONTRAST = 2.6;
const PIXELATE_BACKGROUND_BRIGHTNESS = 0.34;

// canvases
// for handling the pixelation of the background
const pixelate_background_canvas = document.createElement("canvas");
const pixelate_background_context = pixelate_background_canvas.getContext("2d");

// for handling pixelation of the mirror
const pixelate_temp_canvas = document.createElement("canvas");
const pixelate_temp_context = pixelate_temp_canvas.getContext("2d");

function pixelate_apply_colour_quantization(context, width, height, contrast, brightness) {

    const image = context.getImageData(0, 0, width, height);
    const data = image.data;

    for (let i = 0; i < data.length; i += 4) {
        let luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        luminance = (luminance - 0.5) * contrast + 0.5; // contrast
        luminance += brightness; // brightness
        luminance = Math.max(0, Math.min(1, luminance)); // clamp between 0 and 1

        // quantize to 4 shades
        let quantization_level = Math.floor(luminance * 4);

        let r, g, b;
        switch(quantization_level) {
            case 0:
                r = 15; g = 56; b = 15;
                break;
            case 1:
                r = 48; g = 98; b = 48;
                break;
            case 2:
                r = 139; g = 172; b = 15;
                break;
            default:
                r = 155; g = 188; b = 15;
                break;
        }
        data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }

    context.putImageData(image, 0, 0);
}

class PixelateEffect {

    constructor() {
        const mirror = document.getElementById("mirror");
        const mirror_canvas = document.getElementById("mirror-canvas");

        // create overlay automatically
        pixelate_background_canvas.style.position = "fixed";
        pixelate_background_canvas.style.left = "0";
        pixelate_background_canvas.style.top = "0";
        pixelate_background_canvas.style.width = "100vw";
        pixelate_background_canvas.style.height = "100vh";
        pixelate_background_canvas.style.imageRendering = "pixelated";
        pixelate_background_canvas.style.pointerEvents = "none";
        pixelate_background_canvas.style.zIndex = "1500";
        pixelate_background_canvas.setAttribute("data-html2canvas-ignore", "true");

        mirror.appendChild(pixelate_background_canvas);
        mirror.style.position = "relative";
        mirror.style.isolation = "isolate";

        mirror_canvas.setAttribute("data-html2canvas-ignore", "true");
        mirror_canvas.style.position = "absolute";
        mirror_canvas.style.left = "0";
        mirror_canvas.style.top = "0";
        mirror_canvas.style.width = "100%";
        mirror_canvas.style.height = "100%";
        mirror_canvas.style.zIndex = "2000";
        
        html2canvas(document.body, {
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 1/PIXELATE_BACKGROUND_PIXEL_SIZE
        }).then((screenshot)=> {
            pixelate_background_canvas.width = screenshot.width;
            pixelate_background_canvas.height = screenshot.height;

            pixelate_background_context.imageSmoothingEnabled = false;
            
            pixelate_background_context.drawImage(screenshot, 0, 0, pixelate_background_canvas.width, pixelate_background_canvas.height);

            pixelate_apply_colour_quantization(pixelate_background_context, pixelate_background_canvas.width, 
                pixelate_background_canvas.height, PIXELATE_BACKGROUND_CONTRAST, PIXELATE_BACKGROUND_BRIGHTNESS);

        });

    }


    update(data) {

    }


    draw(context) {
        //context.strokeRect(this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;

        pixelate_temp_canvas.width = Math.max(1, Math.ceil(context.canvas.width / PIXELATE_MIRROR_PIXEL_SIZE));
        pixelate_temp_canvas.height = Math.max(1, Math.ceil(context.canvas.height / PIXELATE_MIRROR_PIXEL_SIZE));

        pixelate_temp_context.imageSmoothingEnabled = false;
        pixelate_temp_context.mozImageSmoothingEnabled = false;
        pixelate_temp_context.webkitImageSmoothingEnabled = false;

        //pixelate_temp_context.drawImage(context.canvas, this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height);
        pixelate_temp_context.drawImage(context.canvas, 0, 0, context.canvas.width, context.canvas.height, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height);
        //context.drawImage(pixelate_temp_canvas, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height, this.face_box.x, this.face_box.y, this.face_box.w, this.face_box.h);
        context.drawImage(pixelate_temp_canvas, 0, 0, pixelate_temp_canvas.width, pixelate_temp_canvas.height, 0, 0, context.canvas.width, context.canvas.height);

        pixelate_apply_colour_quantization(context, context.canvas.width, context.canvas.height,
                PIXELATE_MIRROR_CONTRAST, PIXELATE_MIRROR_BRIGHTNESS);
    }
}
