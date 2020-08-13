const Location = require("../model/location");


const listLocations = async(req, res) => {
    try {
        res.json(await Location.find({}).exec());
    } catch (e) {
        console.log(e)
        res.header("Content-Type", 'application/json');
        res.status(404).send({ error: "boo:(" });
    }
}

const addLocation = async(req, res) => {
    const exists = (await checkToken(req.body.token)).checkTokenResult;
    if (!exists) {
        res.status(404).send({ error: "Token is not OK!" });
        return;
    }
    let location = new Location(req.body);
    try {
        await location.save();
        res.json(await Location.findById(location.id).exec());
        console.log('save')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const readLocation = async(req, res) => {
    try {
        const result = await Location.find({ token: req.params.token }).exec();
        res.json(result);
        console.log('read')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const updateLocation = async(req, res) => {
    try {
        await Location.findByIdAndUpdate(req.params.locationId, { $set: req.body }).exec();
        res.json(await Location.findById(req.params.locationId).exec());
        console.log('update')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const deleteLocation = async(req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.locationId).exec();
        res.json(await Location.findById(req.params.locationId).exec());
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const locationById = async(req, res) => {
    try {
        await Location.findById(req.params.locationId).exec();
        res.json(await Location.findById(req.params.locationId).exec());
        console.log('findById')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const listLocationsByToken = async(req, res) => {
    try {
        const locations = await Location.find({ token: { $regex: req.params.token, $options: 'i' } }).exec();
        res.json(locations);
        console.log('findById')
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


module.exports = { listLocations, addLocation, readLocation, updateLocation, deleteLocation, locationById, listLocationsByToken }