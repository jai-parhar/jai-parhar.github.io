// EVERYONES GOT SOMETHING TO SAY
// FOR THOSE WITH THE EYES TO SEE AND THE EARS TO HEAR
const FTS_script = [
    {
        text: "",
        type_ms_per_char: 1,
        delete_ms_per_char: 1,
        wait_ms: 1500
    },
    {
        text: "HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
        type_ms_per_char: 40,
        delete_ms_per_char: 5,
        wait_ms: 500
    },
    {
        text: "WELCOME TO MY OWN LITTLE SLICE OF HEAVEN",
        type_ms_per_char: 40,
        delete_ms_per_char: 10,
        wait_ms: 2000
    },
    {
        text: "TAKE A LOOK AROUND. YOU CAN WASD.",
        type_ms_per_char: 60,
        delete_ms_per_char: 20,
        wait_ms: 3000
    },
    {
        text: "THIS WILL ALWAYS BE A WORK IN PROGRESS",
        type_ms_per_char: 60,
        delete_ms_per_char: 20,
        wait_ms: 3000
    },
    {
        text: "AND ONE DAY THIS WILL ALL WORK",
        type_ms_per_char: 60,
        delete_ms_per_char: 20,
        wait_ms: 3000
    },
    {
        text: "I HOPE",
        type_ms_per_char: 300,
        delete_ms_per_char: 20,
        wait_ms: 2000
    },
    {
        text: "BUT FOR NOW. TAKE A LOAD OFF. RELAX. ENJOY.",
        type_ms_per_char: 60,
        delete_ms_per_char: 20,
        wait_ms: 3000
    },
    {
        text: "",
        type_ms_per_char: 1,
        delete_ms_per_char: 1,
        wait_ms: 1500
    },
    {
        text: ":3",
        type_ms_per_char: 500,
        delete_ms_per_char: 10,
        wait_ms: 2000
    },
    {
        text: "HAVE FUN I LOVE YOU!",
        type_ms_per_char: 40,
        delete_ms_per_char: 10,
        wait_ms: 3000
    }
];



const FTS_messageElement = document.getElementById("fromthescreen-message");

let FTS_lineIndex = 0;
let FTS_displayedText = "";

let FTS_state = "typing";

let FTS_lastUpdateTime = 0;
let FTS_waitStartTime = 0;

function updateMessagesFromTheScreen(time) {
    if (FTS_state === "finished") { return; }

    let line = FTS_script[FTS_lineIndex];

    if (FTS_state === "typing") {
        if (time - FTS_lastUpdateTime >= line.type_ms_per_char) {
            FTS_lastUpdateTime = time;

            if (line.text === "") {
                // wanna treat this like a hold
                FTS_state = "waiting";
                FTS_waitStartTime = time;
                return;
            }

            FTS_displayedText += line.text[FTS_displayedText.length];
            FTS_messageElement.textContent = FTS_displayedText;
            if (FTS_displayedText.length >= line.text.length) {
                FTS_state = "waiting";
                FTS_waitStartTime = time;
            }
        }
    }

    if (FTS_state === "waiting") {
        if (time - FTS_waitStartTime >= line.wait_ms) {
            FTS_state = "deleting";
            FTS_lastUpdateTime = time;
        } else {
            return;
        }
    }

    if (FTS_state === "deleting") {
        if (time - FTS_lastUpdateTime >= line.delete_ms_per_char) {
            FTS_lastUpdateTime = time;
            FTS_displayedText = FTS_displayedText.slice(0, -1);
            FTS_messageElement.textContent = FTS_displayedText;
            if (FTS_displayedText.length == 0) {
                FTS_lineIndex += 1;
                if (FTS_lineIndex >= FTS_script.length) {
                    FTS_state = "finished";
                } else {
                    FTS_state = "typing";
                }
            }
        }
    }
}

function FTS_messageLoop(timestamp) {
    updateMessagesFromTheScreen(timestamp);
    requestAnimationFrame(FTS_messageLoop);
}

requestAnimationFrame(FTS_messageLoop);