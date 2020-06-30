const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const supplierSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

function validateSupplier(supplier){
    const schema = Joi.object({
        name : Joi.string()
                  .required()
                  .min(3)
                  .max(50)
    });

    return schema.validate(supplier);
}


module.exports.Supplier = Supplier;
module.exports.validate = validateSupplier;