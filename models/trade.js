const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const tradeSchema = new mongoose.Schema({
    code : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    article : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    username : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        min : 0,
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    }
});

const Trade = mongoose.model('Trade', tradeSchema);

function validateTrade(trade){
    const schema = Joi.object({
        username : Joi.string()
                  .required()
                  .min(3)
                  .max(50),
        quantity : Joi.number()
                  .required()
                  .min(0),
        price : Joi.number()
                  .required()
                  .min(0)
    });

    return schema.validate(trade);
}


module.exports.Trade = Trade;
module.exports.validate = validateTrade;