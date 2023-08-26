// buttons


let classicButton = document.getElementById("classic-button");
classicButton.onclick = function () {
    window.location.href = "./classic/classic.html";
}

let frenzyButton = document.getElementById("frenzy-button");
frenzyButton.onclick = function () {
    window.location.href = "./frenzy/frenzy.html";
}

// modals


// encodes the help button
let helpButton = document.getElementById("help-button");
let helpModal = document.getElementById("help-modal");
let helpClose = document.getElementById("help-close");

helpButton.onclick = function () {
    helpModal.style.display = "block";
}

helpClose.onclick = function () {
    helpModal.style.display = "none";
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

    // adding frenzy stats

    let statsFrenzy = document.getElementById("stats-frenzy");

    let frenzyGamesPlayedDiv = document.createElement("div");
    let frenzyGamesPlayed = localStorage.getItem("frenzyGamesPlayed");
    if (frenzyGamesPlayed !== null) {
        frenzyGamesPlayedDiv.textContent = `Games played: ${frenzyGamesPlayed}`
    } else {
        frenzyGamesPlayedDiv.textContent = "Games played: 0";
    }
    statsFrenzy.appendChild(frenzyGamesPlayedDiv);

    let frenzyHighScoreDiv = document.createElement("div");
    let frenzyHighScore = localStorage.getItem("frenzyHighScore");
    if (frenzyHighScore !== null) {
        frenzyHighScoreDiv.textContent = `High score: ${frenzyHighScore}`;
    } else {
        frenzyHighScoreDiv.textContent = "High score: 0";
    }
    statsFrenzy.appendChild(frenzyHighScoreDiv);
}

function removeStats () {
    let statsClassic = document.getElementById("stats-classic");
    statsClassic.replaceChildren();
    let statsFrenzy = document.getElementById("stats-frenzy");
    statsFrenzy.replaceChildren();
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

// encodes the settings button
let settingsButton = document.getElementById("settings-button");
let settingsModal = document.getElementById("settings-modal");
let settingsClose = document.getElementById("settings-close");

settingsButton.onclick = function () {
    settingsModal.style.display = "block";
}

settingsClose.onclick = function () {
    settingsModal.style.display = "none";
}


// pressing anywhere outside some modal exits it
window.onclick = function(event) {
    if (event.target === helpModal) {
        helpModal.style.display = "none";
    } else if (event.target === statsModal) {
        removeStats();
        statsModal.style.display = "none";
    } else if (event.target === settingsModal) {
        settingsModal.style.display = "none";
    }
}