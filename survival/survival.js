import { validAnswers } from "../words/valid_answers.js";
import { validGuesses } from "../words/valid_guesses.js";

// global constants
const cols = 5;
const wordLength = 5;
const numberOfCharacters = 26;
const validGuessesSet = new Set(validGuesses);
const startTimeBeforeNextWaindrop = 5000;

// global variables to keep track of current game progress
let isGameOver = false;
let currentGuess = "";
let currentScore = 0;
let highScore = localStorage.getItem("survivalHighScore");
if (highScore === null) {
    highScore = 0;
}
let numberOfWaindrops = 100;
let timeBeforeNextWaindrop = startTimeBeforeNextWaindrop;

// a list which contains all the waindrop objects
let waindropList = [];

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

// initializes a new waindrop object
function initWaindropObject (waindropDiv, rowDiv, currentColumn) {
    let randomIndex = Math.floor(Math.random() * validAnswers.length);
    let correctWord = validAnswers[randomIndex];
    let correctWordList = makeCountList(correctWord);
    let waindrop = {
        waindropDiv: waindropDiv,
        rowDiv: rowDiv,
        currentRow: 0,
        currentCol: currentColumn,
        isGuessed: false,
        correctWord: correctWord,
        correctWordList: correctWordList
    };

    return waindrop;
}

// change magic numbers as necessary
function getSpeed () {
    let speed;
    if (numberOfWaindrops < 150) {
        speed = 100 - ((Math.floor(numberOfWaindrops / 10) * 5));
        console.log(speed);
    } else {
        speed = 30;
    }
    return speed;
}

// initializes a new waindrop
function initWaindrop () {
    if (isGameOver) {
        return;
    }
    let wain = document.getElementById("wain");
    let currentWaindrop = document.createElement("div");
    currentWaindrop.className = "waindrop";
    /* magic number */
    currentWaindrop.style.left = `${Math.random() * 80}vw`;
    let rowDiv = document.createElement("div");
    rowDiv.className = "letter-row";
        
    for (let i = 0; i < cols; i++) {
        let box = document.createElement("div");
        box.className = "waindrop-box";
        if (i < currentGuess.length) {
            console.log(currentGuess[i]);
            box.textContent = (currentGuess[i]).toLowerCase();
        } 
        rowDiv.appendChild(box);
    }

    let currentColumn = currentGuess.length;

    currentWaindrop.appendChild(rowDiv);
    wain.appendChild(currentWaindrop);
    waindropList.push(initWaindropObject(currentWaindrop, rowDiv, currentColumn));

    let timeoutId = setTimeout(() => {
        // change parameters here
        currentWaindrop.style.transitionDuration = `${getSpeed()}s`;
        currentWaindrop.style.top = "100vh";
        clearTimeout(timeoutId);
    }, 1000);

    if (timeBeforeNextWaindrop > 5000) {
        timeBeforeNextWaindrop -= 50;
    }

    numberOfWaindrops++;
}

// sets global variables back to their initial values and generates a new 
// correct word
function resetGame() {

    let board = document.getElementById("wain");
    board.replaceChildren();
    currentGuess = "";
    let message = document.getElementById("error-message");
    message.textContent = "No error message";
    message.style.visibility = "hidden";
    waindropList = [];
    numberOfWaindrops = 0;
    initWaindrop();
    isGameOver = false;
    timeBeforeNextWaindrop = startTimeBeforeNextWaindrop;
}

// inserts the given key into the board, if possible
function insertKey (key, waindropObject, i) {
    if (waindropObject.currentCol === cols) {
        return;
    }
    let row = waindropObject.rowDiv;
    let box = row.children[waindropObject.currentCol];
    key = key.toLowerCase();
    box.textContent = key;

    // only add to current guess if its the first element
    if (i === 0) {
        currentGuess += key;
    }
    waindropObject.currentCol++;
};

// deletes a key from the board, if possible
function deleteKey (waindropObject, i) {
    if (waindropObject.currentCol === 0) {
        return;
    }
    waindropObject.currentCol--;
    let row = waindropObject.rowDiv;
    let box = row.children[waindropObject.currentCol];
    if (i === 0) {
        currentGuess = currentGuess.slice(0, -1);
    }
    box.textContent = "";
}
// ends the game
function endGame() {
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("survivalHighScore", highScore);
    }
    let gamesPlayedString = localStorage.getItem("survivalGamesPlayed");
    if (gamesPlayedString === null) {
        gamesPlayedString = "0";
    }
    gamesPlayedString = ((parseInt(gamesPlayedString)) + 1).toString();
    localStorage.setItem("survivalGamesPlayed", gamesPlayedString);
    isGameOver = true;
    openResultsModal();

}

// compares the current guess to the correct word. Returns true if guess was 
// valid, false otherwise
function guessWord (waindropObject) {
    let message = document.getElementById("error-message");
    if (waindropObject.currentCol < cols) {
        message.style.visibility = "visible";
        message.textContent = "Not enough letters";
        return false;
    }
    if (!(validGuessesSet.has(currentGuess))) {
        message.style.visibility = "visible";
        message.textContent = "Invalid guess";
        return false;
    }
    let row = waindropObject.rowDiv;
    let boxes = row.children;
    // makes copy of correctWordList
    const countList = [...waindropObject.correctWordList];

    // find green letters
    for (let i = 0; i < cols; i++) {
        let letter = currentGuess[i];
        let characterIndex = letter.charCodeAt(0) - "a".charCodeAt(0);
        if (letter === waindropObject.correctWord[i]) {
            boxes[i].classList.add("green");
            countList[characterIndex]--; 
        }
    }

    // find yellow and gray letters
    for (let i = 0; i < cols; i++) {
        let letter = currentGuess[i];
        let characterIndex = letter.charCodeAt(0) - "a".charCodeAt(0);
        if (letter !== waindropObject.correctWord[i]) {
            if (countList[characterIndex] !== 0) {
                boxes[i].classList.add("yellow");
                countList[characterIndex]--;
            } else {
            boxes[i].classList.add("gray");
            }
        }
    }
    if (currentGuess === waindropObject.correctWord) {
        waindropObject.isGuessed = true;
    }
    return true;
}

// clears waindrop from DOM
function clearWaindrop(i) {
    let wain = document.getElementById("wain");
    let waindropToRemove = wain.childNodes[i];
    wain.removeChild(waindropToRemove);
}

function addNewRow(currentWaindrop) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "letter-row";
        
    for (let j = 0; j < cols; j++) {
        let box = document.createElement("div");
        box.className = "waindrop-box";
        rowDiv.appendChild(box);
    }

    currentWaindrop.waindropDiv.appendChild(rowDiv);
    currentWaindrop.rowDiv = rowDiv;
    currentWaindrop.currentRow++;
    currentWaindrop.currentCol = 0;
}

// makes a move based on user input
function makeMove (key) {
    if (isGameOver) {
        return;
    }
    let message = document.getElementById("error-message");
    message.style.visibility = "hidden";
    if (isLetter(key)) {
        for (let i = 0; i < waindropList.length; i++) {
            insertKey(key, waindropList[i], i);
        }
    } else if (key === "Backspace") {
        for (let i = 0; i < waindropList.length; i++) {
            deleteKey(waindropList[i], i);
        }
    } else if (key === "Enter") {
        for (let i = 0; i < waindropList.length; i++) {
            if (!guessWord(waindropList[i])) {
                return;
            }
        }
        let i = 0;
        while (i < waindropList.length) {
            let currentWaindrop = waindropList[i];
            if (currentWaindrop.isGuessed) {
                currentScore++;
                clearWaindrop(i);
                waindropList.splice(i, 1);
            }
            else {
                addNewRow(currentWaindrop);
                i++;
            }
        }
        currentGuess = "";
    }
}

document.onkeydown = function (e) {
    let key = e.key;
    makeMove(key);
};

function checkBottom () {
    if (isGameOver) {
        return;
    }
    let waindrops = document.querySelectorAll(".waindrop");
    for (let i = 0; i < waindrops.length; i++) {
        let waindrop = waindrops[i];
        let lbStyle = window.getComputedStyle(waindrop);
        let bottom = lbStyle.getPropertyValue("bottom");
        
        bottom = bottom.slice(0, -2);
        if (parseFloat(bottom) < 0) {
            endGame();
            return;
        }
    }
}

// sets up the results modal

function getPreviousWords () {
    let previousWords = "";
    for (let i = 0; i < waindropList.length; i++) {
        let correctWord = waindropList[i].correctWord;
        previousWords += `${correctWord.toUpperCase()}; `;
    }
    previousWords = previousWords.slice(0, -2);
    return previousWords;
}

function openResultsModal () {
    let previousWordsDiv = document.getElementById("previous-words");
    previousWordsDiv.textContent = `Remaining words: ${getPreviousWords()}`;
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

setInterval(checkBottom, 10);
setInterval(initWaindrop, 10000);

initWaindrop();
initHomeButtons();