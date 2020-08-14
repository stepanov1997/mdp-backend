const Location = require("../model/location");
const UserType = require("../model/userType");
const config = require("../config.json");
const {calculateDuranceBetweenTwoDateTimes} = require("../util/dateUtil");
const {isUndefined} = require("core-util-is");
const {isNull} = require("core-util-is");

let locked = false;
let infected = [];

setInterval(async () => {
    infected = [];
    let locations = await Location.find({}).exec();
    for (let i = 0; i < locations.length; i++) {
        for (let j = 0; j < locations.length; j++) {
            if (i !== j) {

                // Sam sa sobom
                if (locations[i].token === locations[j].token)
                    continue;

                // Ide se dalje ako je osoba sa kojom poredis isto zaražena
                let user2 = await UserType.find({token: locations[j].token}).exec();
                if (user2.length === 0 || isUndefined(user2[0]) || user2[0].userType === "Not infected")
                    continue;

                // odredjivanje distance
                const distance = Math.sqrt(
                    Math.pow(locations[i].lat - locations[j].lat, 2) +
                    Math.pow(locations[i].long - locations[j].long, 2)
                );
                if (distance * 50_000 >= config.params.k)
                    continue;

                // odredjivanje trajanja kontakta
                const durance = calculateDuranceBetweenTwoDateTimes(
                    locations[i].from,
                    locations[i].to,
                    locations[j].from,
                    locations[j].to
                )
                if (durance < config.params.p)
                    continue;

                // setovanje da je potencijalno zarazena osoba
                let userType = await UserType.find({token: locations[i].token}).exec();
                if (userType.length === 0 || isNull(userType[0]) || isUndefined(userType[0])) {
                    userType = new UserType({
                        token: locations[i].token,
                        userType: "Potential infected"
                    });
                    await userType.save();
                } else {
                    userType = userType[0];
                    if (userType.userType === "Not infected") {
                        userType.userType = "Potential infected";
                        await userType.save();
                    }
                }
            }
        }
    }
}, config.params.n * 1000)

const listUserTypes = async (req, res) => {
    try {
        res.json(await UserType.find({}).exec());
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({error: "boo:("});
    }
}

const addUserType = async (req, res) => {
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        res.status(404).send({error: "Token is not OK!"});
        return;
    }
    let array = await UserType.find({token: req.body.token}).exec();
    let userType = undefined;
    if (array.length === 0) {
        userType = new UserType({
            token: req.body.token,
            userType: req.body.userType
        });
    } else {
        userType = array[0];
        userType.userType = req.body.userType;
    }
    try {
        await userType.save();
        res.json(await UserType.findById(userType.id).exec());
        console.log('save')
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}

const readUserType = async (req, res) => {
    try {
        const result = await UserType.find({token: req.params.token}).exec();
        res.json(result);
        console.log('read')
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}
const updateUserType = async (req, res) => {
    try {
        await UserType.findByIdAndUpdate(req.params.userTypeId, {$set: req.body}).exec();
        res.json(await UserType.findById(req.params.userId).exec());
        console.log('update')
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}
const deleteUserType = async (req, res) => {
    try {
        await user.findByIdAndDelete(req.params.userTypeId).exec();
        res.json(await User.findById(req.params.userTypeId).exec());
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}
const UserTypeById = async (req, res) => {
    try {
        await UserType.findById(req.params.userTypeId).exec();
        res.json(await User.findById(req.params.userTypeId).exec());
        console.log('findById')
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}

const listTypesByToken = async (req, res) => {
    console.log("cdscsv")
    try {
        const types = await UserType.find({token: {$regex: req.params.token, $options: 'i'}}).exec();
        console.log(JSON.stringify(types))
        res.json(types);
        console.log('findByToken')
    } catch (e) {
        console.log(e)
        res.status(404).send({error: "boo:("});
    }
}

const checkToken = (token) => {
    var soap = require('soap');
    var url = 'http://127.0.0.1:8083/soap?wsdl';
    var args = {token: token};
    return new Promise((resolve, reject) => {
        soap.createClient(url, (err, client) => {
            client.checkToken(args, (err, result, body) => {
                return resolve(result)
            })
        });
    });

}


module.exports = {
    listUserTypes,
    addUserType,
    readUserType,
    updateUserType,
    deleteUserType,
    UserTypeById,
    listTypesByToken
}