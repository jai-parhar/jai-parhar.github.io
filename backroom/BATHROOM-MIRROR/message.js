
const messageElement = document.getElementById("message");

let timers = [Date.now()];

let start_timer = Date.now();
const START_TIME_DELAY = 3000; // ms


// CODE FOR THE CENSOR EFFECT -----------------------------------------------------------------------------------------------------------
// YOU FEEL PARTICULARLY [redacted] TODAY
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
    if (Date.now() - timers[0] < CENSOR_TYPE_MS_PER_CHAR) { return; }

    timers[0] = Date.now();

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