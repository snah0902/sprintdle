function isLetter(char){
    return char.length == 1 && ( (char >= 'A' &&  char <= 'Z') || (char >= 'a' && char <= 'z') );
}

document.onkeydown = function (e) {
    console.log(e.key);   
    let input = document.getElementById("edit");
    if (isLetter(e.key) || e.key == " ") {
        input.textContent += e.key;
    } else if (e.key == "Backspace") {
        if (input.textContent.length != 0) {
            input.textContent = input.textContent.slice(0, -1);
        }
    }
};