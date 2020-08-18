const Location = require("../model/location");
const UserType = require("../model/userType");
const config = require("../config.json");
const {calculateDuranceBetweenTwoDateTimes, maxDateTime, minDateTime} = require("../util/dateUtil");
const {isUndefined} = require("core-util-is");
const {isNull} = require("core-util-is");

let locked = false;
let notifications = [];

setInterval(async () => {
    let locations = await Location.find({}).exec();
    for (let i = 0; i < locations.length; i++) {
        for (let j = 0; j < locations.length; j++) {
            if (i !== j) {

                // Sam sa sobom
                if (locations[i].token === locations[j].token)
                    continue;

                // Ide se dalje ako je osoba sa kojom poredis nije zaražena
                let user2 = await UserType.find({token: locations[j].token}).exec();
                if (user2.length === 0 || isUndefined(user2[0]) || user2[0].userType === "Not infected")
                    continue;

                // odredjivanje distance
                const distance = Math.sqrt(
                    Math.pow(locations[i].lat - locations[j].lat, 2) +
                    Math.pow(locations[i].long - locations[j].long, 2)
                );
                if (distance * 50000 >= config.params.k)
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

                let userType = await UserType.find({token: locations[i].token}).exec();

                // dodavanje u obavjestenja
                notifications.push({
                    token: locations[i].token,
                    potential_contact_from: maxDateTime(locations[i].from, locations[j].from),
                    potential_contact_to: minDateTime(locations[i].to, locations[j].to),
                    interval: durance,
                    lat: locations[i].lat,
                    long: locations[i].long,
                    distance: distance * 50000,
                    type: (userType.userType === "Potential Infected") ? "Infected" : "Potential infected"
                })

                // setovanje da je potencijalno zarazena osoba
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

const listNotifications = async (req, res) => {
    try {
        res.json(notifications);
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({error: "boo:("});
    }
}

const listLocationsByToken = async (req, res) => {
    try {
        let token = req.body.token;
        let elements = notifications.filter(elem => elem.token === token);
        notifications = notifications.filter(elem => elem.token !== token);
        res.json(elements);
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({error: "boo:("});
    }
}


module.exports = {
    listNotifications,
    listLocationsByToken
}