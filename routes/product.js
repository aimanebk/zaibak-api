const moment = require('moment');
const mongoose = require('mongoose');
const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { Product, validate, validateUpdate } = require('../models/product');
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], async(req, res) => {
    try {
        const query = queryValidation(req.query);

        const products = await getAdminProducts(query, req.query);

        return res.send(products); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/user', [auth ], async(req, res) => {

    try {
        const query = queryValidation(req.query);

        const products = await getUserProducts(query);

        return res.send(products); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:id', [auth, admin, validateObjectId], async(req, res) => {

    try {
        const query = { _id : mongoose.Types.ObjectId(req.params.id)};

        const product = await getAdminOneProduct(query, req.query);

        return res.send(product); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/user/:id', [auth, validateObjectId], async(req, res) => {

    try {
        const product = await getUserOneProduct(req.params.id);

        return res.send(product); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});



router.post('/', [auth, admin, validator(validate)], async(req, res) => { 
    try {
        let product = await Product.findOne({ code : req.body.code});
        if(product)
            return res.status(400).send({ message : 'Ce code est déjà existé '});

        product = await createProduct(req.body);
    
        return res.send(product); 

    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.put('/:id', [auth, admin, validator(validateUpdate)], async(req, res) => {
    try {
        const result = await updateProduct(req.params.id, req.body);
        if(result.n <= 0)
            return res.status(404).send({ message : `Produit n'a pas été trouvé.`});

        return res.send(result); 

    } catch (error) {
        res.status(500).send(error.message);  
    }
});



async function createProduct(data){
    const product =  new Product({
        code : data.code,
        article : data.article,
        brand : data.brand,
        type : data.type,
        sellingPrice : data.sellingPrice,
        discount : data.discount,
        specialDiscount : data.specialDiscount,
        equivalents : data.equivalents,
        notes : data.notes
    });

    await product.save();
    return product;
}

async function updateProduct(id, newProduct){
    const result = await Product.updateOne({"_id" : id },
                            { 
                                code : newProduct?.code,
                                article : newProduct.article,
                                brand : newProduct.brand,
                                type : newProduct.type,
                                sellingPrice : newProduct.sellingPrice,
                                discount : newProduct.discount,
                                specialDiscount : newProduct.specialDiscount,
                                equivalents : newProduct.equivalents,
                                notes : newProduct.notes
                            },
                            { new : true});
    return result;
}

function queryValidation(originalQuery){
    let { productCode, category } = originalQuery;
    let query = [];
    if(productCode) {
        query.push({ code :  new RegExp(`^${productCode}$`, 'i') });
        query.push({
           equivalents :{$in : [new RegExp(`^${productCode}$`, 'i')]}
       });
    }
    if(category) {
        if(typeof category === 'string')
            category = [category];

        query.push({ 
            type :{$in : category}
        });
    }

    if(query.length <= 0)
        return {};

    let queryc = { $or : query};

    return queryc
}

async function getAdminProducts(matchQuery , filterQuery ){
    const { bDate, fDate } = filterQuery;
    if(!bDate)
        filterQuery.bDate = moment().startOf('month').startOf('day');
    else{
        filterQuery.bDate = moment(filterQuery.bDate).startOf('day');
    }
    if(!fDate)
        filterQuery.fDate = moment().endOf('day');
    else {
        filterQuery.fDate = moment(filterQuery.fDate).endOf('day');
    }

    if(filterQuery.bDate > filterQuery.fDate)
        return []


    const products = await Product.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: 'stocks',
                localField: '_id',
                foreignField: 'productId',
                as: 'stockI'
            }
        },
        {
            $lookup: {
                from: 'stocks',
                localField: '_id',
                foreignField: 'productId',
                as: 'stockF'
            }
        },
        {
            $lookup: {
                from: 'trades',
                localField: '_id',
                foreignField: 'productId',
                as: 'out'
            }
        }, 
        {
            $project: {
                code : 1,
                article : 1,
                brand : 1,
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                stockI : {
                        '$filter': {
                            input: '$stockI',
                            as: 'stockI',
                            cond: { $lt: ['$$stockI.date', new Date(filterQuery.bDate)] }
                        }
                },
                stockF : {
                        '$filter': {
                            input: '$stockF',
                            as: 'stockF',
                            cond: { $lte: ['$$stockF.date', new Date(filterQuery.fDate)] }
                        }
                    },
                out : {
                        '$filter': {
                            input: '$out',
                            as: 'out',
                            cond: { $and: [ 
                            { $gte: [ "$$out.date", new Date(filterQuery.bDate) ] },
                            { $lte: [ "$$out.date", new Date(filterQuery.fDate) ] }
                            ] }
                        }
                    },
            }
        },
        {
            $project: {
                code : 1,
                article : 1,
                brand : 1,
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                stockI : { $max: "$stockI"},
                stockF : { $max: "$stockF"},
                out : { $sum : "$out.quantity"}
            }
        }
    ])
    .allowDiskUse(true);

    return products
}

async function getAdminOneProduct(matchQuery , filterQuery ){
    const { bDate, fDate } = filterQuery;
    if(!bDate)
        filterQuery.bDate = moment().startOf('month').startOf('day');
    else{
        filterQuery.bDate = moment(filterQuery.bDate).startOf('day');
    }
    if(!fDate)
        filterQuery.fDate = moment().endOf('day');
    else {
        filterQuery.fDate = moment(filterQuery.fDate).endOf('day');
    }

    if(filterQuery.bDate > filterQuery.fDate)
        return []


    const products = await Product.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: 'stocks',
                localField: '_id',
                foreignField: 'productId',
                as: 'stockI'
            }
        },
        {
            $lookup: {
                from: 'stocks',
                localField: '_id',
                foreignField: 'productId',
                as: 'stockF'
            }
        },
        {
            $lookup: {
                from: 'trades',
                localField: '_id',
                foreignField: 'productId',
                as: 'out'
            }
        }, 
        {
            $project: {
                code : 1,
                article : 1,
                brand : 1,
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                discount : 1,
                specialDiscount : 1,
                equivalents : 1,
                notes : 1,
                stockI : {
                        '$filter': {
                            input: '$stockI',
                            as: 'stockI',
                            cond: { $lt: ['$$stockI.date', new Date(filterQuery.bDate)] }
                        }
                    },
                stockF : {
                        '$filter': {
                            input: '$stockF',
                            as: 'stockF',
                            cond: { $lte: ['$$stockF.date', new Date(filterQuery.fDate)] }
                        }
                    },
                out : {
                        '$filter': {
                            input: '$out',
                            as: 'out',
                            cond: { $and: [ 
                            { $gte: [ "$$out.date", new Date(filterQuery.bDate) ] },
                            { $lte: [ "$$out.date", new Date(filterQuery.fDate) ] }
                            ] }
                        }
                    },
                purchaseVariation : {
                        '$filter': {
                            input: '$purchaseVariation',
                            as: 'purchaseVariation',
                            cond: { $and: [ 
                            { $gte: [ "$$purchaseVariation.date", new Date(filterQuery.bDate) ] },
                            { $lte: [ "$$purchaseVariation.date", new Date(filterQuery.fDate) ] }
                            ] }
                        }
                        

                    },
            }
        },
        {
            $project: {
                code : 1,
                article : 1,
                brand : 1,
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                discount : 1,
                specialDiscount : 1,
                equivalents : 1,
                notes : 1,
                stockI : { $max: "$stockI"},
                stockF : { $max: "$stockF"},
                out : { $sum : "$out.quantity"},
                purchaseVariation : 1
            }
        },
        {
            $unwind: {
                path: "$purchaseVariation",
                preserveNullAndEmptyArrays : true
        }
        },
        {
            $sort: {
                "purchaseVariation.date": -1
            }
        }, 
        {
            $group: {
                _id: {
                    _id: "$_id",
                    code: "$code",
                    article : "$article",
                    brand : "$brand",
                    type : "$type",
                    buyingPrice : "$buyingPrice",
                    sellingPrice : "$sellingPrice",
                    discount : "$discount",
                    specialDiscount : "$specialDiscount",
                    equivalents : "$equivalents",
                    notes : "$notes",
                    stockI : "$stockI",
                    stockF : "$stockF",
                    out : "$out",
                },
                purchaseVariation: {
                    $push: {
                        purchaseVariation: "$purchaseVariation"
                    }
                }
            }
        }, 
        {
            $project: {
                "_id": "$_id._id",
                "code": "$_id.code",
                "article" : "$_id.article",
                "brand" : "$_id.brand",
                "type" : "$_id.type",
                "buyingPrice" : "$_id.buyingPrice",
                "sellingPrice" : "$_id.sellingPrice",
                "discount" : "$_id.discount",
                "specialDiscount" : "$_id.specialDiscount",
                "equivalents" : "$_id.equivalents",
                "notes" : "$_id.notes",
                "stockI" : "$_id.stockI",
                "stockF" : "$_id.stockF",
                "out" : "$_id.out",
                "purchaseVariation": "$purchaseVariation.purchaseVariation"
            }
        }

    ]);

    return products
}

function getUserProducts(query){
    return Product.find(query).select('_id code article brand type stock price discount sellingPrice equivalents');
}

function getUserOneProduct(id){
    return Product.findById(id).select('-buyingPrice -purchaseVariation -createdAt -updatedAt');
}

module.exports = router;