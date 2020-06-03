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

        const products = await getReport(query, req.query);

        return res.send(products); 
});

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

    let queryc = { $or : query };

    return queryc
}

async function getReport(matchQuery , filterQuery ){
    const { bDate, fDate } = filterQuery;
    if(!bDate)
        filterQuery.bDate = moment().startOf('day');
    if(!fDate)
        filterQuery.fDate = moment().endOf('day');

    if(filterQuery.bDate > filterQuery.fDate)
        return []


    const reports = await Product.aggregate([
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
            $project: {
                code : 1,
                article : 1,
                type : 1,
                buyingPrice : 1,
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
            }
        },
        {
            $project: {
                code : 1,
                article : 1,
                type : 1,
                buyingPrice : 1,
                stockI : { $max: "$stockI"},
                stockF : { $max: "$stockF"}
            }
        },
        {
            $project: {
                code : 1 ,
                article : 1 ,
                type : 1,
                valueOne : {
                  $multiply : ["$stockI.stock", "$buyingPrice"]
                },
                valueTwo : {
                  $multiply : ["$stockF.stock", "$buyingPrice"]
                },
            }
        }
    ])
    .allowDiskUse(true);

    return reports
}

module.exports = router;