import { validAnswers } from "../words/valid_answers.js";
import { validGuesses } from "../words/valid_guesses.js";

// global constants
const rows = 1;
const cols = 5;
const wordLength = 5;
const numberOfCharacters = 26;
const validGuessesSet = new Set(validGuesses);
const millisecondsPerSecond = 1000;

// global variables to keep track of current game progress
let isGameOver = false;
let currentGuess = "";

// a list which contains all the waindrop objects
let waindropList = [];


// encodes the back button
function initBackButton () {
    let backButton = document.getElementById("back-button");
    backButton.onclick = function () {
        window.location.href = "../index.html";
    }
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
function initWaindropObject (waindropDiv, rowDiv) {
    let randomIndex = Math.floor(Math.random() * validAnswers.length);
    let correctWord = validAnswers[randomIndex];
    let correctWordList = makeCountList(correctWord);
    let waindrop = {
        waindropDiv: waindropDiv,
        rowDiv: rowDiv,
        currentRow: 0,
        currentCol: 0,
        isGuessed: false,
        correctWord: correctWord,
        correctWordList: correctWordList
    };
    return waindrop;
}

// initializes a new waindrop
function initWaindrop () {
    let wain = document.getElementById("wain");
    let currentWaindrop = document.createElement("div");
    currentWaindrop.className = "waindrop";
    /* magic number */
    currentWaindrop.style.left = `${Math.random() * 80}vw`;
    let rowDiv = document.createElement("div");
    rowDiv.className = "letter-row";
        
    for (let j = 0; j < cols; j++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        rowDiv.appendChild(box);
    }

    currentWaindrop.appendChild(rowDiv);
    wain.appendChild(currentWaindrop);
    waindropList.push(initWaindropObject(currentWaindrop, rowDiv));

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

    let board = document.getElementById("wain");
    board.replaceChildren();
    initWaindrop();
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
            updateKeyboard(letter, "green");    
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
                updateKeyboard(letter, "yellow");
            } else {
            boxes[i].classList.add("gray");
            updateKeyboard(letter, "gray");
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
    waindropToRemove = wain.childNodes[i];
    wain.removeChild(waindropToRemove);
}

function addNewRow(currentWaindrop) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "letter-row";
        
    for (let j = 0; j < cols; j++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        rowDiv.appendChild(box);
    }

    // BUG https://stackoverflow.com/questions/23673905/appendchild-is-not-a-function-javascript
    currentWaindrop.appendChild(rowDiv);

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
                clearWaindrop(i);
                waindropList.splice(i, 1);
            }
            else {
                addNewRow(currentWaindrop);
                i++;
            }
        }
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

function moveWaindrops () {
    let waindrops = document.querySelectorAll(".waindrop");
    for (let i = 0; i < waindrops.length; i++) {
        let waindrop = waindrops[i];
        let lbStyle = window.getComputedStyle(waindrop);
        let topValue = lbStyle.getPropertyValue("top").replace("px", "");
        waindrop.style.top = (Number(topValue) + 20) + "px";
    }
}

setInterval(moveWaindrops, millisecondsPerSecond);

initBackButton();
initWaindrop();
initWaindrop();
initKeyboard();
console.log(waindropList);