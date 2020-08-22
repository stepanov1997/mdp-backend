const soap = require("soap")
const {tokenServer} = require("../config.json")

const checkToken = (token) => {
    const url = tokenServer;
    const args = { token: token };
    return new Promise((resolve, reject) => {
        soap.createClient(url, (err, client) => {
            client.checkToken(args, (err, result, body) => {
                return resolve(result)
            })
        });
    });
}

module.exports = {checkToken}