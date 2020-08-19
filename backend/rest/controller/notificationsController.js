const Location = require("../model/location");
const UserType = require("../model/userType");
const Notification = require("../model/notification")
const config = require("../config.json");
const {calculateDuranceBetweenTwoDateTimes, maxDateTime, minDateTime} = require("../util/dateUtil");
const {isUndefined} = require("core-util-is");
const {isNull} = require("core-util-is");

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
                if ((Math.abs(durance)/(1000*60)) < config.params.p)
                    continue;

                let userType = await UserType.find({token: locations[i].token}).exec();

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
                    }else {
                        continue;
                    }
                }

                let notification = await Notification.find({token: locations[i].token}).exec();
                if (notification.length === 0) {
                    notification = new Notification({
                        token: locations[i].token,
                        queue: []
                    })
                } else {
                    notification = notification[0]
                }
                const notif = {
                    token: locations[i].token,
                    potential_contact_from: maxDateTime(locations[i].from, locations[j].from),
                    potential_contact_to: minDateTime(locations[i].to, locations[j].to),
                    interval: Math.abs(durance),
                    lat: locations[i].lat,
                    long: locations[i].long,
                    distance: distance * 50000,
                    infection: userType.userType,
                    typeOfNotification: "automatic"
                };

                let same = notification.queue.find(elem => JSON.stringify(notif) === JSON.stringify(elem));
                if (isUndefined(same)) {
                    notification.queue.push(notif);
                    notification.save();
                }
            }
        }
    }
}, config.params.n * 1000)

const listNotifications = async (req, res) => {
    try {
        let allNotifications = await Notification.find({}).exec()
        let notificationsFormatted = allNotifications.flatMap(elem => elem.queue)
        res.json(notificationsFormatted);
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({error: "boo:("});
    }
}

const listNotificationsByToken = async (req, res) => {
    try {
        let token = req.params.token;
        let notificationsByToken = await Notification.find({token: token}).exec();
        if (notificationsByToken.length !== 0) {
            notificationsByToken = notificationsByToken[0]
            let shifted = notificationsByToken.queue.shift();
            notificationsByToken.save();
            res.json(shifted);
        } else {
            res.json([])
        }
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({error: "boo:("});
    }
}

const addNotificationForMedic = async ({token, infection}) => {
    let notification = await Notification.find({token: token}).exec();
    if (notification.length === 0) {
        notification = new Notification({
            token: token,
            queue: []
        })
    } else {
        notification = notification[0];
    }
    if (isUndefined(notification.queue))
        notification.queue = []
    notification.queue.push({
        token: token,
        infection: infection,
        typeOfNotification: "medic"
    });
    notification.save();
}


module.exports = {
    listNotifications,
    listNotificationsByToken,
    addNotificationForMedic
}