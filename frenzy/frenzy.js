import { validAnswers } from "../words/valid_answers.js";
import { validGuesses } from "../words/valid_guesses.js";

// global constants
const rows = 6;
const cols = 5;
const wordLength = 5;
const numberOfCharacters = 26;
const validGuessesSet = new Set(validGuesses);
const millisecondsPerSecond = 1000;
const startTimeSeconds = 60;
const startCountdownSeconds = 3;

// global variables to keep track of current game progress
let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let isGameOver = true;
let currentScore = 0;
let highScore = localStorage.getItem("frenzyHighScore");
if (highScore === null) {
    highScore = 0;
}
let timeLeftSeconds = startTimeSeconds;

// sets up the home buttons
function initHomeButtons () {
    let homeButtons = document.querySelectorAll(".home-button");
    homeButtons.forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    });
}

// returns true if the given char is valid, false otherwise
function isLetter(char) {
    return (char.length === 1 &&
           (char >= 'A' &&  char <= 'Z') ||
           (char >= 'a' && char <= 'z'));
}

// returns a list that maps letters to the number of times they appear in the
// given word
function makeCountList(word) {
    const countList = Array.from({length: numberOfCharacters}, () => 0);
    for (let i = 0; i < wordLength; i++) {
        let characterIndex = word.charCodeAt(i) - "a".charCodeAt(0);
        countList[characterIndex]++;
    }
    return countList;
}

// global variables to keep generate and keep track of correct word
let randomIndex = Math.floor(Math.random() * validAnswers.length);
let correctWord = validAnswers[randomIndex];
let correctWordList = makeCountList(correctWord);

// initialize scores and timer to DOM
function initScoresAndTimer () {
    currentScore = 0;
    let currentScoreDiv = document.getElementById("current-score");
    currentScoreDiv.textContent = currentScore;
    
    timeLeftSeconds = startTimeSeconds;
    let timeLeftDiv = document.getElementById("timer");
    timeLeftDiv.textContent = startTimeSeconds;

    let highScoreDiv = document.getElementById("high-score");
    highScoreDiv.textContent = highScore;
}

// initializes a new game board
function initBoard () {
    let board = document.getElementById("game-board");
    for (let i = 0; i < rows; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < cols; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }
        board.appendChild(row)
    }
}

// updates the keyboard's letter box with the given color
function updateKeyboard (letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            if (color === "green") {
                elem.classList.remove("yellow", "gray");
                elem.classList.add("green");
            } else if (color === "yellow" &&
                       !(elem.classList.contains("green"))) {
                elem.classList.remove("gray");
                elem.classList.add("yellow");
            } else if (color === "gray" &&
                       !(elem.classList.contains("green")) &&
                       !(elem.classList.contains("yellow"))) {
                elem.classList.add("gray");
            }
        }  
    }
}

// sets the keyboard back to white
function resetKeyboard () {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.classList.remove("green", "yellow", "gray");
    }
}

function makeCountdown () {
    let countdownSeconds = startCountdownSeconds;
    let countdownDiv = document.getElementById("countdown");
    const interval = setInterval(function () {
        if (countdownSeconds > 0) {
            countdownDiv.textContent = countdownSeconds;
            console.log(countdownSeconds);
            countdownSeconds--;
        } else if (countdownSeconds === 0) {
            countdownSeconds--;
            countdownDiv.textContent = "Go!";
            isGameOver = false;
        } else {
            countdownDiv.textContent = "";
            clearInterval(interval);
        }
    }, millisecondsPerSecond)

}

// resets the game once the player chooses to retry
function resetGame() {

    let board = document.getElementById("game-board");
    board.replaceChildren();
    initBoard();
    resetKeyboard();

    currentRow = 0;
    currentCol = 0;
    currentGuess = "";
    
    randomIndex = Math.floor(Math.random() * validAnswers.length);
    correctWord = validAnswers[randomIndex];
    correctWordList = makeCountList(correctWord);
    let message = document.getElementById("error-message");
    message.textContent = "No error message";
    message.style.visibility = "hidden";
    initScoresAndTimer();
    closeResultsModal();
    makeCountdown();
}


// sets global variables back to their initial values and generates a new 
// correct word
function resetRound() {

    let board = document.getElementById("game-board");
    board.replaceChildren();
    initBoard();
    resetKeyboard();

    currentRow = 0;
    currentCol = 0;
    currentGuess = "";
    randomIndex = Math.floor(Math.random() * validAnswers.length);
    correctWord = validAnswers[randomIndex];
    correctWordList = makeCountList(correctWord);
    let message = document.getElementById("error-message");
    message.textContent = "No error message";
    message.style.visibility = "hidden";
}

// inserts the given key into the board, if possible
function insertKey (key) {
    if (currentCol === cols) {
        return;
    }
    let row = document.getElementsByClassName("letter-row")[currentRow];
    let box = row.children[currentCol];
    key = key.toLowerCase();
    box.textContent = key;
    currentGuess += key;
    currentCol++;
};

// deletes a key from the board, if possible
function deleteKey () {
    if (currentCol === 0) {
        return;
    }
    currentCol--;
    let row = document.getElementsByClassName("letter-row")[currentRow];
    let box = row.children[currentCol];
    currentGuess = currentGuess.slice(0, -1);
    box.textContent = "";
}

// ends the game
function endGame() {
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("frenzyHighScore", highScore);
    }
    let gamesPlayedString = localStorage.getItem("frenzyGamesPlayed");
    if (gamesPlayedString === null) {
        gamesPlayedString = "0";
    }
    gamesPlayedString = ((parseInt(gamesPlayedString)) + 1).toString();
    localStorage.setItem("frenzyGamesPlayed", gamesPlayedString);
    openResultsModal();

}

// ends the round
function endRound (hasWon) {
    if (hasWon) {
        currentScore++;
        let currentScoreDiv = document.getElementById("current-score");
        currentScoreDiv.textContent = currentScore;
    } else {
        isGameOver = true;
        endGame();
    }
    let currentScoreDiv = document.getElementById("current-score");
    currentScoreDiv.textContent = currentScore;
    resetRound();
}

// compares the current guess to the correct word
function guessWord () {
    let message = document.getElementById("error-message");
    if (currentCol < cols) {
        message.style.visibility = "visible";
        message.textContent = "Not enough letters";
        return;
    }
    if (!(validGuessesSet.has(currentGuess))) {
        message.style.visibility = "visible";
        message.textContent = "Invalid guess";
        return;
    }
    let row = document.getElementsByClassName("letter-row")[currentRow];
    let boxes = row.children;
    // makes copy of correctWordList
    const countList = [...correctWordList];

    // find green letters
    for (let i = 0; i < cols; i++) {
        let letter = currentGuess[i];
        let characterIndex = letter.charCodeAt(0) - "a".charCodeAt(0);
        if (letter === correctWord[i]) {
            boxes[i].classList.add("green");
            countList[characterIndex]--;
            updateKeyboard(letter, "green");    
        }
    }

    // find yellow and gray letters
    for (let i = 0; i < cols; i++) {
        let letter = currentGuess[i];
        let characterIndex = letter.charCodeAt(0) - "a".charCodeAt(0);
        if (letter !== correctWord[i]) {
            if (countList[characterIndex] !== 0) {
                boxes[i].classList.add("yellow");
                countList[characterIndex]--;
                updateKeyboard(letter, "yellow");
            } else {
            boxes[i].classList.add("gray");
            updateKeyboard(letter, "gray");
            }
        }
    }
    // check to see if game is over
    if (currentGuess === correctWord) {
        endRound(true);
    } else {
        currentRow++;
        currentCol = 0;
        currentGuess = "";
        if (currentRow >= rows) {
            endRound(false);
        }
    }
}

// makes a move based on user input
function makeMove (key) {
    if (isGameOver) {
        return;
    }
    let message = document.getElementById("error-message");
    message.style.visibility = "hidden";
    if (isLetter(key)) {
        insertKey(key);
    } else if (key === "Backspace") {
        deleteKey();
    } else if (key === "Enter") {
        guessWord();
    }
}

// initializes the keyboard 
function initKeyboard () {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.addEventListener("click", function () {
            let key = elem.textContent;
            if (key === "Del") {
                makeMove("Backspace");
            } else {
                makeMove(key);
            }
        })
    }
}

document.onkeydown = function (e) {
    let key = e.key;
    if (!isGameOver) {
        let countdownDiv = document.getElementById("countdown");
        countdownDiv.textContent = "";
    }
    makeMove(key);
};

function updateTimer () {
    if (isGameOver) {
        return;
    }
    timeLeftSeconds -= 1;
    let timerDiv = document.getElementById("timer");
    timerDiv.textContent = timeLeftSeconds;
    if (timeLeftSeconds <= 0) {
        isGameOver = true;
        endGame();
    }
}

setInterval(updateTimer, millisecondsPerSecond);

// sets up the results modal

function openResultsModal () {
    let previousWordDiv = document.getElementById("previous-word");
    previousWordDiv.textContent = `The word was ${correctWord.toUpperCase()}.`;
    let resultsModal = document.getElementById("results-modal");
    let scoresInModalDiv = document.getElementById("scores-in-modal");
    let currentScoreInModalSpan = document.createElement("span");
    currentScoreInModalSpan.textContent = `Final Score: ${currentScore}`;
    currentScoreInModalSpan.className = "left";
    scoresInModalDiv.appendChild(currentScoreInModalSpan);
    let highestScoreInModalSpan = document.createElement("span");
    highestScoreInModalSpan.textContent = `High Score: ${highScore}`;
    highestScoreInModalSpan.className = "right";
    scoresInModalDiv.appendChild(highestScoreInModalSpan);
    resultsModal.style.display = "block";
}

function closeResultsModal () {
    let resultsModal = document.getElementById("results-modal");
    let scoresInModalDiv = document.getElementById("scores-in-modal");
    scoresInModalDiv.replaceChildren();
    resultsModal.style.display = "none";
}

let restartButton = document.querySelector(".restart-button");
restartButton.onclick = function () {
    closeResultsModal();
    resetGame();
}

initHomeButtons();
initBoard();
initKeyboard();
initScoresAndTimer();

makeCountdown();