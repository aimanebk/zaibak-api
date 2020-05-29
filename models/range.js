const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const rangeSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    }
});

const Range = mongoose.model('Range', rangeSchema);

function validateRange(range){
    const schema = Joi.object({
        name : Joi.string()
                  .required()
                  .min(3)
                  .max(50)
    });

    return schema.validate(range);
}


module.exports.Range = Range;
module.exports.validateRange = validateRange;