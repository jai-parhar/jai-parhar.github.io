class GIF {
    constructor(path, loop = true, autoplay = true, updatesPerFrame = 5) {

        this.loop = loop;
        this.playing = autoplay;
        this.finished = false;

        this.frames = [];
        this.currentFrame = 0;

        this.updatesPerFrame = updatesPerFrame;
        this.updateCounter = 0;

        this.loaded = false;

        this.load(path);
    }


    // stackoverflow thank you
    async load(path) {

        let response = await fetch(path);
        let buffer = await response.arrayBuffer();

        let gif = new GifReader(new Uint8Array(buffer));

        for (let i = 0; i < gif.numFrames(); i++) {

            let imageData = new Uint8ClampedArray(gif.width * gif.height * 4);

            gif.decodeAndBlitFrameRGBA(i, imageData);

            let canvas = document.createElement("canvas");

            canvas.width = gif.width;
            canvas.height = gif.height;

            let context = canvas.getContext("2d");

            let frameData = new ImageData(imageData, gif.width, gif.height);

            context.putImageData(frameData, 0, 0);
            this.frames.push(canvas);
        }

        this.width = gif.width;
        this.height = gif.height;

        this.loaded = true;
    }

    start() {
        this.currentFrame = 0;
        this.updateCounter = 0;
        this.finished = false;
        this.playing = true;
    }

    stop() {
        this.playing = false;
    }

    update() {

        if (!this.loaded || !this.playing) { return; }

        this.updateCounter++;
        if (this.updateCounter < this.updatesPerFrame) { return; }

        this.updateCounter = 0;
        this.currentFrame++;

        if (this.currentFrame >= this.frames.length) {

            if (this.loop) {
                this.currentFrame = 0;
            } else {
                this.currentFrame = this.frames.length - 1;
                this.playing = false;
                this.finished = true;
            }
        }
    }


    draw(context, x, y, w = this.width, h = this.height) {
        if (!this.loaded) { return; }
        context.drawImage(this.frames[this.currentFrame], x, y, w, h);
    }
}