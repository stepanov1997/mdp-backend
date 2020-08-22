const {isUndefined} = require("core-util-is");

const log = (severe, text, exception) => {
    let date = new Date();
    let options = {
        year: "numeric", month: "numeric",
        day: "numeric", hour: "2-digit",
        minute: "2-digit", second: "2-digit", weekday: "long",
    };

    console.log(`${severe} ${date.toLocaleTimeString("sr-Latn-BA", options)}\n${text}${isUndefined(exception)?"":("\n"+exception)}`);
    console.log()
}

module.exports = {log}