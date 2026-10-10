
function chooseRandom(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

const characters = [
    "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b",
    "n", "m", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "A", "S",
    "D", "F", "G", "H", "J", "K", "L", "Q", "W", "E", "R", "T", "Y", "U",
    "I", "O", "P", "Z", "X", "C", "V", "B", "N", "M",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "!", "@", "#", "$", "%", "^", "&", "*", "/"
];

function generateCode(length = 10) {
    let agentCode = "";
    for (let i = 0; i < length; i++) {
        agentCode += chooseRandom(characters);
    }
    return agentCode;
}

module.exports = generateCode;

