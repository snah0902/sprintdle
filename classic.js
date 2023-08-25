import { validAnswers } from "./valid_answers.js";
import { validGuesses } from "./valid_guesses.js";

// global constants
const rows = 6;
const cols = 5;
const wordLength = 5;
const numberOfCharacters = 26;
const validGuessesSet = new Set(validGuesses);
const millisecondsPerSecond = 1000;
const decimalPlaces = 2;

// global variables to keep track of current game progress
let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let isGameOver = false;
let startTime = performance.now();
let endTime = 0;
let currentStreak = 0;

// encodes the back button
let backButton = document.getElementById("back-button");

backButton.onclick = function() {
    window.location.href = "index.html";
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

// sets global variables back to their initial values and generates a new 
// correct word
function resetGame() {

    let board = document.getElementById("game-board");
    board.replaceChildren();
    initBoard();
    resetKeyboard();

    currentRow = 0;
    currentCol = 0;
    currentGuess = "";
    isGameOver = false;
    randomIndex = Math.floor(Math.random() * validAnswers.length);
    correctWord = validAnswers[randomIndex];
    correctWordList = makeCountList(correctWord);
    let message = document.getElementById("error-message");
    message.textContent = "No error message";
    message.style.visibility = "hidden";
    startTime = performance.now();
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

function addWord (hasWon) {
    endTime = performance.now();
    let elapsedTimeSeconds = ((endTime - startTime) / millisecondsPerSecond).toFixed(decimalPlaces);

    let timesDiv = document.getElementById("times");
    let timeDiv = document.createElement("div");
    if (hasWon) {
        timeDiv.className = "green-word";
    } else {
        timeDiv.className = "red-word";
    }
    timeDiv.textContent = `${correctWord.toUpperCase()} ${elapsedTimeSeconds}`;
    timesDiv.insertBefore(timeDiv, timesDiv.firstChild);
}

// updates the local storage based on the current round
function updateLocalStorage(hasWon) {
    // update rounds played
    let roundsPlayedString = localStorage.getItem("roundsPlayed");
    if (roundsPlayedString === null) {
        roundsPlayedString = "0";
    }
    roundsPlayedString = ((parseInt(roundsPlayedString)) + 1).toString();
    localStorage.setItem("roundsPlayed", roundsPlayedString);

    if (hasWon) {
        // update rounds won
        let roundsWonString = localStorage.getItem("roundsWon");
        if (roundsWonString === null) {
            roundsWonString = "0";
        }
        roundsWonString = ((parseInt(roundsWonString)) + 1).toString();
        localStorage.setItem("roundsWon", roundsWonString);

        // update fastest time
        let elapsedTimeSeconds = ((endTime - startTime) / millisecondsPerSecond).toFixed(decimalPlaces);
        let fastestTimeString = localStorage.getItem("fastestTime");
        if (fastestTimeString !== null) {
            fastestTimeString = (Math.min(elapsedTimeSeconds, parseInt(fastestTimeString))).toString();
            localStorage.setItem("fastestTime", fastestTimeString);
        } else {
            localStorage.setItem("fastestTime", elapsedTimeSeconds);
        }
    }
    // update longest streak
    let longestStreakString = localStorage.getItem("longestStreak");
    if (longestStreakString !== null) {
        longestStreakString = (Math.max(currentStreak, parseInt(longestStreakString))).toString();
        localStorage.setItem("longestStreak", longestStreakString);
    } else {
        localStorage.setItem("longestStreak", currentStreak);
    }

}

// ends the game
function endGame (message, hasWon) {
    if (hasWon) {
        currentStreak++;
    } else {
        currentStreak = 0;
    }
    console.log(currentStreak);
    addWord(hasWon);
    updateLocalStorage(hasWon);
    if (hasWon) {
        message.textContent = "You got the word! Press enter to restart.";
    } else {
        message.textContent = `You lost! The word was ${correctWord.toUpperCase()}. Press enter to restart.`;
    }
    message.style.visibility = "visible";
    isGameOver = true;
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
        endGame(message, true);
    } else {
        currentRow++;
        currentCol = 0;
        currentGuess = "";
        if (currentRow >= rows) {
            endGame(message, false);
        }
    }
}

// makes a move based on user input
function makeMove (key) {
    if (isGameOver) {
        if (key === "Enter") {
            resetGame();
        }
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
    makeMove(key);
};


initBoard();
initKeyboard();