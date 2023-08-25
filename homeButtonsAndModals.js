
// change to specific buttons eventually
function redirectToClassicWordle () {
    window.location.href = "classic.html";
}


// encodes the stats button
let statsButton = document.getElementById("stats-button");
let statsModal = document.getElementById("stats-modal");
let statsClose = document.getElementById("stats-close");
let resetButton = document.getElementById("reset-button");

function addStats () {

    // adding classic stats

    let statsClassic = document.getElementById("stats-classic");

    let roundsPlayedDiv = document.createElement("div");
    let roundsPlayed = localStorage.getItem("roundsPlayed");
    if (roundsPlayed !== null) {
        roundsPlayedDiv.textContent = `Rounds played: ${roundsPlayed}`;
    }
    else {
        roundsPlayedDiv.textContent = "Rounds played: 0";
    }
    statsClassic.appendChild(roundsPlayedDiv);

    let roundsWonDiv = document.createElement("div");
    let roundsWon = localStorage.getItem("roundsWon");
    if (roundsWon !== null) {
        roundsWonDiv.textContent = `Rounds won: ${roundsWon}`;
    }
    else {
        roundsWonDiv.textContent = "Rounds won: 0";
    }
    statsClassic.appendChild(roundsWonDiv);

    let fastestTimeDiv = document.createElement("div");
    let fastestTime = localStorage.getItem("fastestTime");
    if (fastestTime !== null) {
        fastestTimeDiv.textContent = `Fastest time: ${fastestTime}`
    } else {
        fastestTimeDiv.textContent = "Fastest time: -"
    }
    statsClassic.appendChild(fastestTimeDiv);

    let longestStreakDiv = document.createElement("div");
    let longestStreak = localStorage.getItem("longestStreak");
    if (longestStreak !== null) {
        longestStreakDiv.textContent = `Longest streak: ${longestStreak}`
    } else {
        longestStreakDiv.textContent = "Longest streak: 0"
    }
    statsClassic.appendChild(longestStreakDiv);
}

function removeStats () {
    let statsClassic = document.getElementById("stats-classic");
    statsClassic.replaceChildren();
}

function clearStats() {
    localStorage.clear();
    addStats();
}

statsButton.onclick = function () {
    addStats();
    statsModal.style.display = "block";
}

statsClose.onclick = function () {
    removeStats();
    statsModal.style.display = "none";
}

resetButton.onclick = function () {
    removeStats();
    clearStats();
}

let numberOfRounds = localStorage.getItem("")