// Fjalekalimet ruhen te hash-uara (te ngaterruara), kurre si tekst i thjeshte
const crypto = require("crypto");

// Kthen "salt:hash" qe ruhet ne databaze
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return salt + ":" + hash;
}

// Kontrollon nese fjalekalimi i shkruar perputhet me ate ne databaze
function checkPassword(password, saved) {
    const [salt, hash] = saved.split(":");
    const test = crypto.scryptSync(password, salt, 64).toString("hex");
    return test === hash;
}

module.exports = { hashPassword, checkPassword };
