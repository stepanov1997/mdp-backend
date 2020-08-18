const Location = require("../model/location");
const UserType = require("../model/userType");

const listUserTypes = async(req, res) => {
    try {
        res.json(await UserType.find({}).exec());
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({ error: "boo:(" });
    }
}

const addUserType = async(req, res) => {
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
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
        res.json(await UserType.findById(userType.id).exec());
        console.log('save')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const readUserType = async(req, res) => {
    try {
        const result = await UserType.find({ token: req.params.token }).exec();
        res.json(result);
        console.log('read')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const updateUserType = async(req, res) => {
    try {
        await UserType.findByIdAndUpdate(req.params.userTypeId, { $set: req.body }).exec();
        res.json(await UserType.findById(req.params.userId).exec());
        console.log('update')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const deleteUserType = async(req, res) => {
    try {
        await user.findByIdAndDelete(req.params.userTypeId).exec();
        res.json(await User.findById(req.params.userTypeId).exec());
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const UserTypeById = async(req, res) => {
    try {
        await UserType.findById(req.params.userTypeId).exec();
        res.json(await User.findById(req.params.userTypeId).exec());
        console.log('findById')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const listTypesByToken = async(req, res) => {
    try {
        const types = await UserType.find({ token: { $regex: req.params.token, $options: 'i' } }).exec();
        console.log(JSON.stringify(types))
        res.json(types);
        console.log('findByToken')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const checkToken = (token) => {
    var soap = require('soap');
    var url = 'http://127.0.0.1:8083/soap?wsdl';
    var args = { token: token };
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