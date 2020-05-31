const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const productSchema = new mongoose.Schema({
    code : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        unique: true,
        trim : true
    },
    article : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    type : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50,
        trim : true
    },
    stock : {
        type : Number,
        min : 0,
        default : 0
    },
    buyingPrice : {
        type : Number,
        min : 0,
        default : 0
    },
    sellingPrice : {
        type : Number,
        required : true,
        min : 0,
        default : 0
    },
    discount : {
        type : [String],
        default : []
    },
    equivalents : {
        type : [String],
        default : []
    },
    notes : {
        type : String,
        trim : true
    },
    stockVariation : {
        type : [new mongoose.Schema({
            stock: {
                type: Number,
                required: true,
                min: 0,
                default : 0
            },
            date: {
                type: Date,
                default: Date.now
            }    
        })],
        default : []
    },
    purchaseVariation : {
        type : [new mongoose.Schema({
            quantite: {
                type: Number,
                required: true,
                min: 0,
            },
            supplier: {
                type: String,
                minlength : 3,
                maxlength : 50,
                trim : true,
                required : true
            },    
            refInvoice: {
                type: String,
                minlength : 3,
                maxlength : 50,
                trim : true,
            },
            price: {
                type: Number,
                required: true,
                min: 0,
            },
            date : {
                type : Date,
                default : Date.now
            }
        })],
        default : []
    }
},
{
  timestamps: true
});


const Product = mongoose.model('Product', productSchema);

function validate(product){
    const schema = Joi.object({
        code : Joi.string()
                  .required()
                  .min(3)
                  .max(50),
        article : Joi.string()
                  .required()
                  .min(3)
                  .max(50),
        type : Joi.string()
                  .required()
                  .min(3)
                  .max(50),
        sellingPrice : Joi.number()
                          .required()  
                          .min(0),
        discount : Joi.array(),
        equivalents : Joi.array(),    
        notes : Joi.string()
    });

    return schema.validate(product);
}

function validatePurchase(purchase){
    const schema = Joi.object({
        quantite : Joi.number()
                   .min(0)
                   .required(),
        supplier: Joi.string()
                     .required()
                     .min(3),
        refInvoice : Joi.string()
                        .min(3)
                        .max(),
       price : Joi.number()
                  .min(0)
                  .required(),
    });

    return schema.validate(purchase);
}

module.exports.Product = Product;
module.exports.validate = validate;
module.exports.validatePurchase = validatePurchase;