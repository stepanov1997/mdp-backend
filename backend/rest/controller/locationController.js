const Location = require("../model/location");
const {lastNDays} = require("../util/dateUtil");
const {getDateTimeFromString} = require("../util/dateUtil");
const {checkToken} = require("../util/checkToken");
const {log} = require("../util/logging");
const config = require("../config.json");

const listLocations = async(req, res) => {
    log("INFO", "List location.")
    try {
        let locations = await Location.find({}).exec();
        res.json(locations);
    } catch (e) {
        log("WARNING", "listLocations", e.stack)
        res.header("Content-Type", 'application/json');
        res.status(404).send({ error: "boo:(" });
    }
}

const addLocation = async(req, res) => {
    log("INFO", "Add location.")
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        res.status(404).send({ error: "Token is not OK!" });
        return;
    }
    let location = new Location(req.body);
    try {
        await location.save();
        res.json(await Location.findById(location.id).exec());
    } catch (e) {
        log("WARNING", "Add location", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}

const readLocation = async(req, res) => {
    log("INFO", "Read location.")
    try {
        const result = await Location.find({ token: req.params.token }).exec();
        res.json(result);
    } catch (e) {
        log("WARNING", "Read location", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const updateLocation = async(req, res) => {
    log("INFO", "Update location.")
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        res.status(404).send({ error: "Token is not OK!" });
        return;
    }
    try {
        await Location.findByIdAndUpdate(req.params.locationId, { $set: req.body }).exec();
        res.json(await Location.findById(req.params.locationId).exec());
    } catch (e) {
        log("WARNING", "Update location", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const deleteLocation = async(req, res) => {
    log("INFO", "Delete location.")
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        res.status(404).send({ error: "Token is not OK!" });
        return;
    }
    try {
        await Location.findByIdAndDelete(req.params.locationId).exec();
        res.json(await Location.findById(req.params.locationId).exec());
    } catch (e) {
        log("WARNING", "Delete location", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const locationById = async(req, res) => {
    log("INFO", "Find location by id.")
    try {
        await Location.findById(req.params.locationId).exec();
        res.json(await Location.findById(req.params.locationId).exec());
    } catch (e) {
        log("WARNING", "Find location by id", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}

const listLocationsByToken = async(req, res) => {
    log("INFO", "List location by token.")
    try {
        const locations = await Location.find({ token: { $regex: req.params.token, $options: 'i' } }).exec();
        res.json(locations.filter(elem => lastNDays(elem.dateTime, config.params.days)));
    } catch (e) {
        log("WARNING", "List location by token", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}


module.exports = { listLocations, addLocation, readLocation, updateLocation, deleteLocation, locationById, listLocationsByToken }