let currColIndex = 0;
const colours = ["red", "green", "blue"];
const header = document.getElementById("header");
setInterval(() => {
    header.style.setProperty("--shadow-colour", colours[currColIndex]);
    currColIndex += 1;
    if (currColIndex >= colours.length) {
        currColIndex = 0;
    }
}, 250);