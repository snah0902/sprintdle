import { validAnswers } from "./valid_answers.js";
import { validGuesses } from "./valid_guesses.js";

// global constants
const rows = 6;
const cols = 5;
const wordLength = 5;
const numberOfCharacters = 26;
const validGuessesSet = new Set(validGuesses);
const greenColor = "rgb(30, 132, 73)";
const greenBorderColor = "rgb(23, 111, 44)";
const yellowColor = "rgb(255, 195, 0)";
const yellowBorderColor = "rgb(255, 160, 0)";
const grayColor = "gray";

// global variables to keep track of current game progress
let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let isGameOver = false;


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

// correctWord = "bused";

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
            let elemBackgroundColor = elem.style.backgroundColor;
            if (color === greenColor) {

                elem.style.backgroundColor = greenColor;
                elem.style.borderColor = greenBorderColor;
            } else if (color === yellowColor &&
                       elemBackgroundColor !== greenColor) {
                elem.style.backgroundColor = yellowColor;
                elem.style.borderColor = yellowBorderColor;
            } else if (color === grayColor &&
                       elemBackgroundColor !== greenColor &&
                       elemBackgroundColor !== yellowColor) {
                elem.style.backgroundColor = grayColor;
            }
        }
    }
}

// sets the keyboard back to white
function resetKeyboard () {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = "white";
        elem.style.borderColor = "gray";
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
            boxes[i].style.backgroundColor = greenColor;
            boxes[i].style.borderColor = greenBorderColor;
            countList[characterIndex]--;
            updateKeyboard(letter, greenColor);    
        }
    }

    // find yellow and gray letters
    for (let i = 0; i < cols; i++) {
        let letter = currentGuess[i];
        let characterIndex = letter.charCodeAt(0) - "a".charCodeAt(0);
        if (letter !== correctWord[i]) {
            if (countList[characterIndex] !== 0) {
                boxes[i].style.backgroundColor = yellowColor;
                boxes[i].style.borderColor = yellowBorderColor;
                countList[characterIndex]--;
                updateKeyboard(letter, yellowColor);
            } else {
            boxes[i].style.backgroundColor = grayColor;
            updateKeyboard(letter, grayColor);
            }
        }
    }
    // check to see if game is over
    if (currentGuess === correctWord) {
        message.textContent = "You got the word! Press enter to restart.";
        message.style.visibility = "visible";
        isGameOver = true;
    } else {
        currentRow++;
        currentCol = 0;
        currentGuess = "";
        if (currentRow >= rows) {
            message.textContent = `You lost! The word was ${correctWord.toUpperCase()}. Press enter to restart.`;
            message.style.visibility = "visible";
            isGameOver = true;
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