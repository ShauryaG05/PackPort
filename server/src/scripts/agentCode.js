
const crypto = require("crypto");

const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(length = 10) {
    let agentCode = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        agentCode += characters[randomIndex];
    }
    return agentCode;
}

module.exports = generateCode;

