const info_messageElement = document.getElementById("info-message");

let info_targetText = "";
let info_nextText = "";
let info_displayedText = ""; 

let info_state = "idle"; 

const TYPE_MS_PER_CHAR = 40; 
const DELETE_MS_PER_CHAR = 10; 

let info_lastUpdateTime = 0; 

function setInfoMessageText(newText) { 
    if (info_targetText === newText && info_state !== "deleting") { return; } 
    info_nextText = newText; 
    
    if (info_displayedText.length > 0) {
        info_state = "deleting";
    } else {
        info_targetText = info_nextText;
        info_state = "typing";
    }
}

function updateInfoMessageText(time) {
    if (info_state === "idle") { return; } 
    
    if (info_state === "typing") {
        if (time - info_lastUpdateTime >= TYPE_MS_PER_CHAR) {
            info_lastUpdateTime = time;
            if (info_targetText === "") {
                info_state = "idle";
                return; 
            } 
            info_displayedText += info_targetText[info_displayedText.length]; 
            info_messageElement.textContent = info_displayedText; 
            if (info_displayedText.length >= info_targetText.length) {
                info_state = "idle";
            }
        }
    }
    
    if (info_state === "deleting") {
        if (time - info_lastUpdateTime >= DELETE_MS_PER_CHAR) {
            info_lastUpdateTime = time; 
            info_displayedText = info_displayedText.slice(0, -1);
            info_messageElement.textContent = info_displayedText; 
            if (info_displayedText.length == 0) {
                info_targetText = info_nextText; info_state = "typing";
            }
        }
    }
}

function infoMessageLoop(timestamp) {
    updateInfoMessageText(timestamp);
    requestAnimationFrame(infoMessageLoop);
}

requestAnimationFrame(infoMessageLoop);