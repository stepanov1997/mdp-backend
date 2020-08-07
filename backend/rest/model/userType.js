const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const types = ["Not infected", "Potential infected", "Infected"];

let UserTypeSchema = new Schema({
    token: { type: String, required: true },
    userType: {
        type: String,
        validate: {
            validator: (elem) => types.some((type) => elem == type),
            message: props => `${props.value} is not a valid type of person! (Not infected, Potential infected or Infected)`
          },
          required: [true, 'Type required (\'Not infected\', \'Potential infectedv or \'Infected\')']
    }
});

module.exports = mongoose.model('UserType', UserTypeSchema);