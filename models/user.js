const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { string } = require('@hapi/joi');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    password : {
        type : String,
        required  : true,
        minlength : 8
    },
    role : {
        type :String,
        default : 'User'
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id : this._id, role : this.role }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validate(user){
    const schema = Joi.object({
        name : Joi.string()
                  .required()
                  .min(3)
                  .max(50),
        password: Joi.string()
                     .required()
                     .min(8)
                     .pattern(/^[a-zA-Z0-9]{3,30}$/),
           
        repeat_password: Joi.string().required().min(8).valid(Joi.ref('password')),
        role : Joi.string()
                   .min(3)
                   .max(50),
    });

    return schema.validate(user);
}

function validateAuth(user){
    const schema = Joi.object({
        name : Joi.string()
                   .max(50)
                   .required(),
        password: Joi.string()
                     .required()
                     .pattern(/^[a-zA-Z0-9]{3,30}$/)
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validate;
module.exports.validateAuth = validateAuth;