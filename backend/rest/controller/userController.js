const User = require("../model/user");
const user = require("../model/user");


const listUsers = (req,res) => {
    User.find({}, (err, result) => {
        console.log('list')
        if (err) {
            res.status(404).send({ error: "boo:(" });
        } else {
          res.json(result);
        }
      });
}

const addUser = (req,res) => {
    let user = new User(
        {
            name: req.body.name,
            surname: req.body.surname
        }
    );
    user.save((err) => {
        console.log('save')
        if (err) {
            res.status(404).send({ error: "boo:(" });
        }
        res.send('User created successfully')
    })
}

const readUser = (req,res) => {
    user.findById(req.params.userId, (err,result)=> {
        console.log('read')
        if (err) {
            res.status(404).send({ error: "boo:(" });
          } else {
            res.json(result);
          }
    })
}
const updateUser = (req,res) => {
    user.findByIdAndUpdate(req.params.userId, {$set: req.body}, (err, raw) => {
        console.log('update')
        if (err) {    
            res.status(404).send({ error: "boo:(" });
        }
        res.send('User updated successfully')
    })
}
const deleteUser = (req,res) => {
    user.findByIdAndDelete(req.params.userId, err => {
        console.log('delete')
        if (err) {
            res.status(404).send({ error: "boo:(" });
        }
        res.send('User deleted successfully')
    })
}
const userById = (req, res) => {
    user.findById(req.params.userId, (err,result)=> {
        console.log('findById')
        if (err) {
            res.status(404).send({ error: "boo:(" });
          } else {
            res.json(result);
          }
    })
}

module.exports = {listUsers, addUser, readUser, updateUser, deleteUser, userById}