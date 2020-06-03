const moment = require('moment');
const mongoose = require('mongoose');
const auth =  require('../middleware/auth');
const admin =  require('../middleware/admin');
const validator = require('../middleware/validate');
const { Product, validate, validateUpdate } = require('../models/product');
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], async(req, res) => {

        const query = queryValidation(req.query);

        const products = await getAdminProducts(query, req.query);

        return res.send(products); 
});

router.get('/user', [auth ], async(req, res) => {

    const query = queryValidation(req.query);

    const products = await getUserProducts(query);

    return res.send(products); 
});

router.get('/:id', [auth, admin], async(req, res) => {

        const query = { _id : mongoose.Types.ObjectId(req.params.id)};

        const product = await getAdminOneProduct(query, req.query);

        return res.send(product); 
});



router.post('/', [auth, admin, validator(validate)], async(req, res) => {     
        const product = await createProduct(req.body);
    
        return res.send(product); 
});

router.put('/:id', [auth, admin, validator(validateUpdate)], async(req, res) => {
        const result = await updateProduct(req.params.id, req.body);
        if(result.n <= 0)
            return res.status(404).send(`Produit n'a pas été trouvé.`);

        return res.send(result); 
});



async function createProduct(data){
    const product =  new Product({
        code : data.code,
        article : data.article,
        type : data.type,
        sellingPrice : data.sellingPrice,
        discount : data.discount,
        equivalents : data.equivalents,
        notes : data.notes
    });

    try {
        await product.save();
        return product;

    } catch (error) {
        return error.message;
    }
}

async function updateProduct(id, newProduct){
    try {
        const result = await Product.updateOne({"_id" : id },
                                { 
                                    article : newProduct.article,
                                    type : newProduct.type,
                                    sellingPrice : newProduct.sellingPrice,
                                    discount : newProduct.discount,
                                    equivalents : newProduct.equivalents,
                                    notes : newProduct.notes
                                },
                                { new : true});
        return result;

    } catch (error) {
        return error.message;
    }
}

function queryValidation(originalQuery){
    const { productCode, category } = originalQuery;
    let query = [];
    if(productCode) {
        query.push({ code : productCode});
        query.push({
           equivalents :{$in : [productCode]}
       });
    }
    if(category) {
        query.push({ type : category});
    }

    if(query.length <= 0)
        return {};

    let queryc = { $or : query};

    return queryc
}

async function getAdminProducts(matchQuery , filterQuery ){
    const { bDate, fDate } = filterQuery;
    if(!bDate)
        filterQuery.bDate = moment().startOf('day');
    if(!fDate)
        filterQuery.fDate = moment().endOf('day');

    if(filterQuery.bDate > filterQuery.fDate)
        return []


    const products = await Product.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: 'stocks',
                localField: 'code',
                foreignField: 'productCode',
                as: 'stockI'
            }
        },
        {
            $lookup: {
                from: 'stocks',
                localField: 'code',
                foreignField: 'productCode',
                as: 'stockF'
            }
        },
        {
            $lookup: {
                from: 'trades',
                localField: 'code',
                foreignField: 'code',
                as: 'out'
            }
        }, 
        {
            $project: {
                code : 1,
                article : 1,
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
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                stockI : { $max: "$stockI"},
                stockF : { $max: "$stockF"},
                out : { $sum : "$out.quantity"}
            }
        }
    ]);

    return products
}

async function getAdminOneProduct(matchQuery , filterQuery ){
    const { bDate, fDate } = filterQuery;
    if(!bDate)
        filterQuery.bDate = moment().startOf('day');
    if(!fDate)
        filterQuery.fDate = moment().endOf('day');

    if(filterQuery.bDate > filterQuery.fDate)
        return []


    const products = await Product.aggregate([
        {
            $match: matchQuery
        },
        {
            $lookup: {
                from: 'stocks',
                localField: 'code',
                foreignField: 'productCode',
                as: 'stockI'
            }
        },
        {
            $lookup: {
                from: 'stocks',
                localField: 'code',
                foreignField: 'productCode',
                as: 'stockF'
            }
        },
        {
            $lookup: {
                from: 'trades',
                localField: 'code',
                foreignField: 'code',
                as: 'out'
            }
        }, 
        {
            $project: {
                code : 1,
                article : 1,
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
                type : 1,
                buyingPrice : 1,
                sellingPrice : 1,
                stockI : { $max: "$stockI"},
                stockF : { $max: "$stockF"},
                out : { $sum : "$out.quantity"},
                purchaseVariation : 1
            }
        }
    ]);

    return products
}

function getUserProducts(query){
    return Product.find(query).select('_id code article type stock price discount');
}

module.exports = router;