const User = require("../model/user");
const user = require("../model/user");


const listUsers = async (req, res) => {
    try {
        res.json(await User.find({}).exec());
    } catch (e) {
        console.log(e)
        res.header("Content-Type",'application/json');
        res.status(404).send({ error: "boo:(" });
    }
}

const addUser = async (req, res) => {
    let user = new User(
        {
            name: req.body.name,
            surname: req.body.surname
        }
    );
    try {
        await user.save();
        res.json(await User.findById(user.id).exec());
        console.log('save')
    } catch (e) {
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const readUser = async (req, res) => {
    try{
        const result = await user.findById(req.params.userId).exec();
        res.json(result);
        console.log('read')
    }catch(e){
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const updateUser = async (req, res) => {
    try{
        await user.findByIdAndUpdate(req.params.userId,  { $set: req.body }).exec();
        res.json(await User.findById(req.params.userId).exec());
        console.log('update')
    }catch(e){
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const deleteUser = async (req, res) => {
    try {
        await user.findByIdAndDelete(req.params.userId).exec();
        res.json(await User.findById(req.params.userId).exec());
    }catch(e){
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}
const userById = async (req, res) => {
    try{
        await user.findById(req.params.userId).exec();
        res.json(await User.findById(req.params.userId).exec());
        console.log('findById')
    }catch(e){
        console.log(e)
        res.status(404).send({ error: "boo:(" });
    }
}

const checkTokenEndpoint = async (req, res) => {
    res.json({ isTokenValid: await checkToken(req.params.token) })
}

const checkToken = (token) => {
    var soap = require('soap');
    var url = 'http://pisio.etfbl.net:8083/soap?wsdl';
    var args = { token: token };
    return new Promise((resolve, reject) => {
        soap.createClient(url, (err, client) => {
            client.checkToken(args, (err, result, body) => {
                return resolve(result)
            })
        });
    });

}


module.exports = { listUsers, addUser, readUser, updateUser, deleteUser, userById, checkTokenEndpoint }