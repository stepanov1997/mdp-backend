const Location = require("../model/location");
const UserType = require("../model/userType");
const notificationsController = require("./notificationsController");
const {log} = require("../util/logging");
const soap = require('soap');
const {checkToken} = require("../util/checkToken");
const {tokenServer} = require("../config.json")

const listUserTypes = async(req, res) => {
    log("INFO", "List user types.")
    try {
        res.json(await UserType.find({}).exec());
    } catch (e) {
        log("WARNING", "List user types", e.stack)
        res.header("Content-Type", 'application/json');
        res.status(404).send({ error: "boo:(" });
    }
}

const addUserType = async(req, res) => {
    log("INFO", "Adding user type.")
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        log("WARNING", "Token is bad.")
        res.status(404).send({ error: "Token is not OK!" });
        return;
    }
    let array = await UserType.find({ token: req.body.token }).exec();
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
        if(userType.userType !== "Not infected")
        await notificationsController.addNotificationForMedic({
            token: req.body.token,
            infection: userType.userType
        })
        res.json(await UserType.findById(userType.id).exec());
    } catch (e) {
        log("WARNING", "Adding user type.", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}

const readUserType = async(req, res) => {
    log("INFO", "Reading user type.")
    try {
        const result = await UserType.find({ token: req.params.token }).exec();
        res.json(result);
    } catch (e) {
        log("WARNING", "Read user type", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const updateUserType = async(req, res) => {
    log("INFO", "Updating user type.")
    try {
        await UserType.findByIdAndUpdate(req.params.userTypeId, { $set: req.body }).exec();
        res.json(await UserType.findById(req.params.userId).exec());
    } catch (e) {
        log("WARNING", "Update user type", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const deleteUserType = async(req, res) => {
    log("INFO", "Deleting user type.")
    try {
        await UserType.findByIdAndDelete(req.params.userTypeId).exec();
        res.json(await UserType.findById(req.params.userTypeId).exec());
    } catch (e) {
        log("WARNING", "Deleting user type", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}
const UserTypeById = async(req, res) => {
    log("INFO", "Reading user type by id.")
    try {
        await UserType.findById(req.params.userTypeId).exec();
        res.json(await UserType.findById(req.params.userTypeId).exec());
    } catch (e) {
        log("WARNING", "User type by id.", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
}

const listTypesByToken = async(req, res) => {
    log("INFO", "List user types by token.")
    try {
        const types = await UserType.find({ token: { $regex: req.params.token, $options: 'i' } }).exec();
        res.json(types);
    } catch (e) {
        log("WARNING", "List types by token.", e.stack)
        res.status(404).send({ error: "boo:(" });
    }
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