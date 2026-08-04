
const messageElement = document.getElementById("message");

let start_timer = Date.now();
const START_TIME_DELAY = 3000; // ms


// CODE FOR THE CENSOR EFFECT -----------------------------------------------------------------------------------------------------------
// YOU FEEL PARTICULARLY [redacted] TODAY

let censor_type_timer = Date.now();
const CENSOR_TYPE_MS_PER_CHAR = 250;
const CENSOR_PRE_TEXT = "YOU FEEL PARTICULARLY ";
const CENSOR_POST_TEXT = " TODAY";
let censor_pre_index = 0;
let censor_post_index = 0;
let censorbar = null;
function updateCensorMessage() {

    if (Date.now() - start_timer < START_TIME_DELAY) { return; }

    messageElement.style.fontFamily = "Moms Typewriter";
    messageElement.style.background = "#f6eee3";
    messageElement.style.color = "black";

    // tremble if its there
    if (censorbar) {
        censorbar.style.transform = `translate(${4 * Math.sin(11 * Date.now())}px, ${4 * Math.cos(13 * Date.now())}px)`;
    }

    // skip the rest if we aint finished yet
    if (Date.now() - censor_type_timer < CENSOR_TYPE_MS_PER_CHAR) { return; }
    censor_type_timer = Date.now();

    if (censor_pre_index < CENSOR_PRE_TEXT.length) { // type the text pre censor bar
        messageElement.append(CENSOR_PRE_TEXT[censor_pre_index++]);
    } else if (!censorbar) { // make the censor bar if it doesnt exist already

        // we make a span just to see how big the text would be and use that
        const measure_span = document.createElement("span");
        measure_span.style.position = "absolute";
        measure_span.style.visibility = "hidden";
        measure_span.style.font = getComputedStyle(messageElement).font;
        measure_span.textContent = "[redacted]";
        
        document.body.appendChild(measure_span);
        const span_width = measure_span.offsetWidth;
        const span_height = measure_span.offsetHeight;
        document.body.removeChild(measure_span);

        censorbar = document.createElement("span");

        censorbar.style.display = "inline-block";
        censorbar.style.width = `${span_width}px`;
        censorbar.style.height = `${span_height}px`;
        censorbar.style.background = "black";
        censorbar.style.verticalAlign = "middle";
        censorbar.style.marginLeft = "1vw";
        censorbar.style.marginRight = "1vw";

        messageElement.append(censorbar);

    } else if (censor_post_index < CENSOR_POST_TEXT.length) { // finish typing the text
        messageElement.append(CENSOR_POST_TEXT[censor_post_index++]);
    }
}

// CODE FOR THE PIXELATE EFFECT -----------------------------------------------------------------------------------------------------------
const PIXELATE_TYPE_MS_PER_CHAR = 250;

let pixelate_type_timer = Date.now();
let pixelate_current_text = "";

const PIXELATE_FULL_TEXT = "YOU FEEL 8 BIT..."
function updatePixelateEffect() { // background effect has been handled in pixelate_effect.js
    
    messageElement.style.fontFamily = "Early Gameboy";
    messageElement.style.background = "#9cbc0f";
    messageElement.style.color = "#0f380f";

    if (Date.now() - start_timer < START_TIME_DELAY) { return; }

    if (Date.now() - pixelate_type_timer > PIXELATE_TYPE_MS_PER_CHAR) {
        pixelate_type_timer = Date.now();
        if (pixelate_current_text.length < PIXELATE_FULL_TEXT.length) {
            pixelate_current_text += PIXELATE_FULL_TEXT[pixelate_current_text.length];
            messageElement.textContent = pixelate_current_text;
        }
    }
}



// CODE FOR THE STATIC BODY EFFECT -----------------------------------------------------------------------------------------------------------
const STATICBODY_TYPE_MS_PER_CHAR = 250;

let staticbody_type_timer = Date.now();

const STATICBODY_FULL_TEXT = "IT ALL FEELS DIFFICULT TO REMEMBER...";
const STATICBODY_GLITCH_CHARS = "#@%?█▒░/\\";

let staticbody_current_text = "";

let staticbody_glitch_timer = Date.now();
let staticbody_glitch_index = -1;
let staticbody_jitter_timer = Date.now();

const STATICBODY_MIN_GLITCH_TIME = 100;
const STATICBODY_MAX_GLITCH_TIME = 3000;
let staticbody_next_glitch_time = ((STATICBODY_MAX_GLITCH_TIME - STATICBODY_MIN_GLITCH_TIME) * Math.random()) + STATICBODY_MIN_GLITCH_TIME;

function updateStaticBodyMessage() {
    messageElement.style.fontFamily = "VCR OSD Mono";
    messageElement.style.background = "black";
    messageElement.style.color = "white";

    if (Date.now() - start_timer < START_TIME_DELAY) { return; }
    
    if (Date.now() - staticbody_type_timer > STATICBODY_TYPE_MS_PER_CHAR) {
        staticbody_type_timer = Date.now();
        if (staticbody_current_text.length < STATICBODY_FULL_TEXT.length) {
            staticbody_current_text += STATICBODY_FULL_TEXT[staticbody_current_text.length];
            messageElement.textContent = staticbody_current_text;
        }
    }

    if (Date.now() - staticbody_jitter_timer > 50) {
        staticbody_jitter_timer = Date.now();
        const x = (Math.random() * 2 - 1) * 4;
        const scaleX = 1 + (Math.random() - 0.5) * 0.05;
        messageElement.style.transform = `translateX(${x}px) scaleX(${scaleX})`;
    }

    if (Date.now() - staticbody_glitch_timer > staticbody_next_glitch_time) {
        staticbody_next_glitch_time = ((STATICBODY_MAX_GLITCH_TIME - STATICBODY_MIN_GLITCH_TIME) * Math.random()) + STATICBODY_MIN_GLITCH_TIME;
        staticbody_glitch_timer = Date.now();
        staticbody_glitch_index = Math.floor(Math.random() * (staticbody_current_text.length + 1));
        const text_chars = staticbody_current_text.split("");
        text_chars[staticbody_glitch_index] = STATICBODY_GLITCH_CHARS[Math.floor(Math.random() * (STATICBODY_GLITCH_CHARS.length + 1))];
        messageElement.textContent = text_chars.join("");
        setTimeout(()=>{
            messageElement.textContent = staticbody_current_text;
        }, 100);
    }
    
}



// CODE FOR THE SCRATCHED EYES EFFECT -----------------------------------------------------------------------------------------------------------
function updateScratchedEyesMessage() {

}



// CODE FOR THE FACE FOLLOW EFFECT -----------------------------------------------------------------------------------------------------------
function updateFaceFollowMessage() {

}