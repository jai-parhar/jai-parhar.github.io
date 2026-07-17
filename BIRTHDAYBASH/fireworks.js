let numFireworks = 0;
let currStringIndex = 0;

const container = document.querySelector('.fireworks');
const fireworks = new Fireworks.default(container, {
    intensity:500,
    rocketsPoint: {
        min: 100,
        max: 0
    }
});

let partyStrings = [
    "TURN IT UP!", 
    "KEEP GOING!", 
    "WOOOOOOOOOO!", 
    "BIG PARTY HAPPY BIRTHDAY!", 
    "YES MORE FIREWORKS!",
    "LETS GO!!!!!!"
];

const tunes = document.getElementById('tunes');
const partyButton = document.getElementById("STARTTHEPARTY");
partyButton.addEventListener("click", () => {
    tunes.play();
    if (currStringIndex < partyStrings.length - 1) {

        currStringIndex += 1;
        numFireworks += 3;

        if (currStringIndex != partyStrings.length - 1) {
            fireworks.launch(numFireworks);
        }

        partyButton.textContent = partyStrings[currStringIndex];
    }

    if (currStringIndex == partyStrings.length - 1) {
        console.log("Okay it should start here")
        setInterval(() => {
            fireworks.start();
        }, 250);
        partyButton.style.setProperty("background-color", "#ffffff");
    }
});